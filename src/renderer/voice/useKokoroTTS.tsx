import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { defaultKokoroEndpoint } from 'main/sentient-sims/constants';
import useSetting from 'renderer/hooks/useSetting';
import {
  defaultKokoroAITTSSettings,
  KokoroAITTSSettings,
  KokoroType,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { TTSHook } from './TTSHook';

// Cached pipeline instance — loading takes time, so we reuse it
let cachedPipeline: any = null;
let pipelineLoading: Promise<any> | null = null;

async function getWebGPUPipeline(): Promise<any> {
  if (cachedPipeline) return cachedPipeline;
  if (pipelineLoading) return pipelineLoading;

  pipelineLoading = (async () => {
    const { pipeline, env } = await import('@huggingface/transformers');
    // Allow downloading model files from HuggingFace Hub
    env.allowLocalModels = false;

    log.info('Kokoro WebGPU: loading text-to-speech pipeline…');
    const synthesizer = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', {
      device: 'webgpu' as any,
    });
    log.info('Kokoro WebGPU: pipeline ready');
    cachedPipeline = synthesizer;
    pipelineLoading = null;
    return synthesizer;
  })();

  return pipelineLoading;
}

async function playFloat32Audio(audioData: Float32Array, sampleRate: number, volume: number): Promise<void> {
  const audioCtx = new AudioContext({ sampleRate });
  const buffer = audioCtx.createBuffer(1, audioData.length, sampleRate);
  buffer.copyToChannel(audioData as Float32Array<ArrayBuffer>, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  await new Promise<void>((resolve) => {
    source.onended = () => {
      audioCtx.close();
      resolve();
    };
    source.start(0);
  });
}

async function speakRemote(
  text: string,
  endpoint: string,
  settings: KokoroAITTSSettings,
  volume: number,
): Promise<void> {
  const voice = settings.voice.join('+') || 'af_heart';
  const body = {
    model: settings.model,
    input: text,
    voice,
    response_format: settings.response_format ?? 'wav',
  };

  log.debug(`Kokoro remote TTS: POST ${endpoint}/v1/audio/speech`);

  const response = await fetch(`${endpoint}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Kokoro remote TTS error ${response.status}: ${msg}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.volume = volume;

  await new Promise<void>((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.play();
  });
}

async function speakWebGPU(text: string, volume: number): Promise<void> {
  const synthesizer = await getWebGPUPipeline();
  log.debug(`Kokoro WebGPU TTS: synthesizing "${text.slice(0, 60)}…"`);

  const result: any = await synthesizer(text);
  const { audio, sampling_rate: samplingRate } = result;

  if (!audio || !(audio instanceof Float32Array)) {
    throw new Error('WebGPU TTS returned no audio data');
  }

  await playFloat32Audio(audio, samplingRate ?? 16000, volume);
}

export function useKokoroTTS(): TTSHook {
  const aiSettings = useAISettings();
  const kokoroEndpointSetting = useSetting<string>(SettingsEnum.KOKOROAI_ENDPOINT, defaultKokoroEndpoint);
  const kokoroTTSSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      setError(undefined);
      setIsPlaying(true);

      try {
        const { type } = kokoroTTSSettings.value;

        if (type === KokoroType.Remote) {
          await speakRemote(text, kokoroEndpointSetting.value, kokoroTTSSettings.value, aiSettings.ttsVolume);
        } else {
          await speakWebGPU(text, aiSettings.ttsVolume);
        }
      } catch (err: any) {
        log.error('Kokoro TTS error:', err);
        setError(err?.message ?? String(err));
      } finally {
        setIsPlaying(false);
      }
    },
    [kokoroEndpointSetting.value, kokoroTTSSettings.value, aiSettings.ttsVolume],
  );

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { speak, stop, isPlaying, error };
}

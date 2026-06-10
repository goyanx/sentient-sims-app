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

// Cached KokoroTTS instance — loading the model (~300MB) takes time
let cachedKokoro: any = null;
let kokoroLoading: Promise<any> | null = null;

async function getKokoroInstance(): Promise<any> {
  if (cachedKokoro) return cachedKokoro;
  if (kokoroLoading) return kokoroLoading;

  kokoroLoading = (async () => {
    const { KokoroTTS } = await import('kokoro-js');
    log.info('Kokoro WebGPU: loading model from HuggingFace Hub…');
    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'fp32',
      device: 'webgpu',
    });
    log.info('Kokoro WebGPU: model ready');
    cachedKokoro = tts;
    kokoroLoading = null;
    return tts;
  })();

  return kokoroLoading;
}

async function speakWebGPU(text: string, voice: string, speed: number, volume: number): Promise<void> {
  const tts = await getKokoroInstance();

  log.debug(`Kokoro WebGPU: voice=${voice} speed=${speed} text="${text.slice(0, 60)}"`);
  const result = await tts.generate(text, { voice, speed });

  const { audio, sampling_rate: samplingRate } = result;
  if (!audio) throw new Error('Kokoro WebGPU returned no audio');

  const audioCtx = new AudioContext({ sampleRate: samplingRate ?? 24000 });
  const buffer = audioCtx.createBuffer(1, audio.length, samplingRate ?? 24000);
  buffer.copyToChannel(audio as Float32Array<ArrayBuffer>, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(audioCtx.destination);

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
  const voice = settings.voice[0] ?? 'af_heart';
  const body = {
    model: settings.model,
    input: text,
    voice,
    response_format: settings.response_format ?? 'wav',
    speed: settings.speed ?? 1.0,
  };

  log.debug(`Kokoro remote TTS: POST ${endpoint}/v1/audio/speech voice=${voice}`);

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
        const { type, voice, speed } = kokoroTTSSettings.value;
        const selectedVoice = voice[0] ?? 'af_heart';
        const selectedSpeed = speed ?? 1.0;

        if (type === KokoroType.Remote) {
          await speakRemote(text, kokoroEndpointSetting.value, kokoroTTSSettings.value, aiSettings.ttsVolume);
        } else {
          await speakWebGPU(text, selectedVoice, selectedSpeed, aiSettings.ttsVolume);
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

import { Box, FormHelperText, Grid, MenuItem, Select, Slider, Stack, Typography } from '@mui/material';
import {
  defaultKokoroAITTSSettings,
  KokoroAISpeechModel,
  KokoroAISpeechVoice,
  KokoroAITTSSettings,
  KokoroType,
  toKokoroType,
  toSpeechModel,
  toSpeechVoice,
} from 'main/sentient-sims/models/KokoroAITTSSettings';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { TestVoiceButton } from 'renderer/components/VoiceTestButton';
import WebGpuDebug from 'renderer/components/WebGpuDebug';
import useSetting from 'renderer/hooks/useSetting';
import { useTTS } from 'renderer/providers/AudioContextProvider';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { useAISettings } from 'renderer/providers/AISettingsProvider';
import { AIEndpointComponent } from '../AIEndpointComponent';

export function KokoroAIVoiceSettingsComponent() {
  const aiSettings = useAISettings();
  const tts = useTTS();
  const kokoroaiTtsSettings = useSetting<KokoroAITTSSettings>(
    SettingsEnum.KOKOROAI_TTS_SETTINGS,
    defaultKokoroAITTSSettings,
  );

  const modelMenuItems: any[] = [];
  Object.values(KokoroAISpeechModel).forEach((model) =>
    modelMenuItems.push(<MenuItem value={model}>{model}</MenuItem>),
  );

  const voiceMenuItems: any[] = [];
  Object.entries(KokoroAISpeechVoice).forEach((key) =>
    voiceMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>),
  );

  const typeMenuItems: any[] = [];
  Object.entries(KokoroType).forEach((key) => {
    typeMenuItems.push(<MenuItem value={key[1]}>{key[0]}</MenuItem>);
  });

  function handleModelChange(model: string) {
    kokoroaiTtsSettings.setSetting({ ...kokoroaiTtsSettings.value, model: toSpeechModel(model) });
  }

  function handleVoiceChange(voice: string) {
    kokoroaiTtsSettings.setSetting({ ...kokoroaiTtsSettings.value, voice: [toSpeechVoice(voice)] });
  }

  function handleTypeChange(type: KokoroType) {
    kokoroaiTtsSettings.setSetting({ ...kokoroaiTtsSettings.value, type });
  }

  function handleSpeedChange(speed: number) {
    kokoroaiTtsSettings.setSetting({ ...kokoroaiTtsSettings.value, speed });
  }

  const speed = kokoroaiTtsSettings.value.speed ?? 1.0;

  return (
    <Grid size={{ xs: 12, sm: 8 }}>
      <Box>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <Typography>Speech Model:</Typography>
            <Select
              size="small"
              labelId="tts-models"
              id="tts-models"
              label="TTS Model"
              value={kokoroaiTtsSettings.value.model}
              onChange={(change) => handleModelChange(change.target.value)}
            >
              {modelMenuItems}
            </Select>
          </Stack>
        </Box>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <Typography>Speech Voice:</Typography>
            <Select
              size="small"
              labelId="voice"
              id="voice"
              label="Voice"
              value={kokoroaiTtsSettings.value.voice[0] ?? ''}
              onChange={(change) => handleVoiceChange(change.target.value)}
            >
              {voiceMenuItems}
            </Select>
          </Stack>
        </Box>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <Typography>Speed: {speed.toFixed(1)}x</Typography>
            <Box sx={{ width: 200 }}>
              <Slider
                value={speed}
                onChange={(_e, val) => handleSpeedChange(val as number)}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1x' },
                  { value: 2.0, label: '2x' },
                ]}
              />
            </Box>
          </Stack>
        </Box>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ alignItems: 'center', mb: 1, width: '100%' }}>
            <Typography>Local/Remote</Typography>
            <Select
              size="small"
              labelId="local-remote"
              id="local-remote"
              label="Local/Remote"
              value={kokoroaiTtsSettings.value.type}
              onChange={(change) => handleTypeChange(toKokoroType(change.target.value))}
            >
              {typeMenuItems}
            </Select>
          </Stack>
        </Box>
        {kokoroaiTtsSettings.value.type === KokoroType.Remote ? (
          <AIEndpointComponent
            type={ApiType.Kokoro}
            selectedApiType={aiSettings.ttsApiType}
            settingsEnum={SettingsEnum.KOKOROAI_ENDPOINT}
          />
        ) : null}
        <Box display="flex" justifyContent="flex-end" sx={{ marginBottom: 2 }}>
          <TestVoiceButton />
        </Box>
        {tts?.error ? (
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <FormHelperText error>Error: {tts?.error}</FormHelperText>
          </Box>
        ) : null}
        {kokoroaiTtsSettings.value.type === KokoroType.WebGPU ? (
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <FormHelperText>
              WebGPU runs Kokoro completely locally on your GPU. The model downloads on first use (~300MB).
            </FormHelperText>
          </Box>
        ) : null}
        <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
          <WebGpuDebug />
        </Box>
      </Box>
    </Grid>
  );
}

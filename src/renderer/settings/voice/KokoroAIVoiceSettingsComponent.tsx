import { Box, FormHelperText, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
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
    kokoroaiTtsSettings.setSetting({
      model: toSpeechModel(model),
      voice: kokoroaiTtsSettings.value.voice,
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  function handleVoiceChange(voice: string) {
    kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: [toSpeechVoice(voice)],
      response_format: kokoroaiTtsSettings.value.response_format,
      type: kokoroaiTtsSettings.value.type,
    });
  }

  function handleTypeChange(type: KokoroType) {
    kokoroaiTtsSettings.setSetting({
      model: kokoroaiTtsSettings.value.model,
      voice: kokoroaiTtsSettings.value.voice,
      response_format: kokoroaiTtsSettings.value.response_format,
      type,
    });
  }

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
              WebGPU is Experimental. Kokoro runs completely locally using the power of your graphics card. Depending on
              the specs and configuration of your computer it may run too slow.
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

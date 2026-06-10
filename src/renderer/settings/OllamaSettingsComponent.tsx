import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { defaultOllamaEndpoint } from 'main/sentient-sims/constants';
import AIModelSelection from '../AIModelSelection';
import { AIEndpointComponent } from './AIEndpointComponent';

type OllamaSettingsComponentProps = {
  apiType: ApiType;
};

export function OllamaSettingsComponent({ apiType }: OllamaSettingsComponentProps) {
  if (apiType !== ApiType.Ollama) {
    return <></>;
  }

  return (
    <>
      <AIEndpointComponent
        type={ApiType.Ollama}
        selectedApiType={apiType}
        settingsEnum={SettingsEnum.OLLAMA_ENDPOINT}
      />
      <AIModelSelection
        apiType={apiType}
        defaultModel=""
        defaultEndpoint={defaultOllamaEndpoint}
        modelSetting={SettingsEnum.OLLAMA_MODEL}
        endpointSetting={SettingsEnum.OLLAMA_ENDPOINT}
      />
    </>
  );
}

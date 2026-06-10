import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';
import { ApiType } from 'main/sentient-sims/models/ApiType';
import { defaultLMStudioEndpoint } from 'main/sentient-sims/constants';
import AIModelSelection from '../AIModelSelection';
import { AIEndpointComponent } from './AIEndpointComponent';

type LMStudioSettingsComponentProps = {
  apiType: ApiType;
};

export function LMStudioSettingsComponent({ apiType }: LMStudioSettingsComponentProps) {
  if (apiType !== ApiType.LMStudio) {
    return <></>;
  }

  return (
    <>
      <AIEndpointComponent
        type={ApiType.LMStudio}
        selectedApiType={apiType}
        settingsEnum={SettingsEnum.LMSTUDIO_ENDPOINT}
      />
      <AIModelSelection
        apiType={apiType}
        defaultModel=""
        defaultEndpoint={defaultLMStudioEndpoint}
        modelSetting={SettingsEnum.LMSTUDIO_MODEL}
        endpointSetting={SettingsEnum.LMSTUDIO_ENDPOINT}
      />
    </>
  );
}

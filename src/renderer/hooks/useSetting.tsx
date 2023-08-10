import { useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import { SettingsEnum } from 'main/sentient-sims/models/SettingsEnum';

export type SettingsHook = {
  value: any;
  isLoading: boolean;
  setSetting: (settingValue: any) => Promise<void>;
  resetSetting: () => Promise<void>;
};

export default function useSetting(
  settingsEnum: SettingsEnum,
  defaultValue: any = ''
): SettingsHook {
  const settingName = settingsEnum.toString();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const handleGetSetting = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:25148/settings/app/${settingName}`
      );
      const result = await response.json();
      setValue(result.value);
    } catch (err: any) {
      log.error(`Unable to get setting ${settingName}`, err);
    } finally {
      setIsLoading(false);
    }
  }, [settingName]);

  async function setSetting(settingValue: any) {
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:25148/settings/app/${settingName}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: settingValue }),
        }
      );
      const result = await response.json();
      setValue(result.value);
    } catch (err: any) {
      log.error(
        `Unable to set setting ${settingName} to value ${settingValue}`,
        err
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function resetSetting() {
    if (defaultValue) {
      await setSetting(defaultValue);
    } else {
      setIsLoading(true);

      try {
        const response = await fetch(
          `http://localhost:25148/settings/app/${settingName}/reset`,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const result = await response.json();
        log.info(`result: ${result}`);
        setValue(result.value);
      } catch (err: any) {
        log.error(`Unable to reset setting ${settingName}`, err);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    handleGetSetting();
  }, [handleGetSetting]);

  return {
    isLoading,
    value,
    setSetting,
    resetSetting,
  };
}

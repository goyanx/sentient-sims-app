import log from 'electron-log';
import { SettingsService } from './SettingsService';
import { SettingsEnum } from '../models/SettingsEnum';
import { LLMWorker } from '../models/LLMWorker';
import { fetchWithTimeout } from '../util/fetchWithTimeout';

export class CustomLLMService {
  private settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  customLLMEnabled() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_ENABLED) as boolean;
  }

  customLLMHostname() {
    return this.settingsService.get(SettingsEnum.CUSTOM_LLM_HOSTNAME) as string;
  }

  async generate(prompt: string) {
    const url = `${this.customLLMHostname()}/api/v1/generate`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`url: ${url}, auth: ${authHeader}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authentication: authHeader,
      },
      body: JSON.stringify({
        prompt,
        max_new_tokens: 90,
      }),
    });

    return response.json();
  }

  async testHealth() {
    const url = `${this.customLLMHostname()}/health`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`testHealth: ${url}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      return await response.text();
    } catch (e: any) {
      log.error('Error checking custom LLM health', e);
      return 'Custom LLM Not healthy';
    }
  }

  async getWorkers() {
    const url = `${this.customLLMHostname()}/workers`;
    const authHeader = `${this.settingsService.get(SettingsEnum.ACCESS_TOKEN)}`;
    log.debug(`getWorkers: ${url}, auth: ${authHeader}`);
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'Content-Type': 'application/json',
          Authentication: authHeader,
        },
        timeout: 5000,
      });
      const result: LLMWorker[] = await response.json();
      return result;
    } catch (e: any) {
      log.error(`Unabled to get workers from custom llm`, e);
      return [];
    }
  }
}

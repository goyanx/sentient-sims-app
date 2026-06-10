import log from 'electron-log';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';

type LMStudioGenerateResponse = {
  results?: Array<{ text?: string }>;
};

export class LMStudioService implements GenerationService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.lmstudioEndpoint;
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const prompt = request.messages.map((m) => m.content).join('\n');
    const model = this.ctx.settings.lmstudioModel;

    const body: any = {
      model,
      prompt,
      parameters: {
        max_new_tokens: request.maxResponseTokens,
        temperature: 0.7,
      },
    };

    log.debug(`LMStudio request: ${JSON.stringify({ url: `${this.serviceUrl()}/v1/generate`, body }, null, 2)}`);

    try {
      const response = await axiosClient({
        url: '/v1/generate',
        method: 'POST',
        baseURL: this.serviceUrl(),
        data: body,
        timeout: 60000,
      });

      const data: LMStudioGenerateResponse = response.data;
      const text = data?.results?.map((r) => r.text || '').join('\n') || '';

      return {
        text: text.trim(),
        request,
      };
    } catch (e: any) {
      log.error('Error calling LM Studio', e?.response?.data || e?.message || e);
      throw e;
    }
  }

  async healthCheck(): Promise<any> {
    try {
      await axiosClient({
        url: '/v1/models',
        baseURL: this.serviceUrl(),
        timeout: 5000,
      });
      return { status: 'OK' };
    } catch (e: any) {
      log.error('LM Studio health check failed', e?.message || e);
      return { error: e?.message || `${e}` };
    }
  }

  async getModels(): Promise<AIModel[]> {
    try {
      const response = await axiosClient({ url: '/v1/models', baseURL: this.serviceUrl(), timeout: 5000 });
      const models = response.data?.models || [];
      return models.map((m: any) => ({ name: m, displayName: m }));
    } catch (e: any) {
      log.error('Error getting LM Studio models', e);
      throw e;
    }
  }
}

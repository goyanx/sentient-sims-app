import log from 'electron-log';
import { GenerationService } from './GenerationService';
import { SimsGenerateResponse } from '../models/SimsGenerateResponse';
import { OpenAICompatibleRequest } from '../models/OpenAICompatibleRequest';
import { AIModel } from '../models/AIModel';
import { axiosClient } from '../clients/AxiosClient';
import { ApiContext } from './ApiContext';

export class OllamaService implements GenerationService {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  serviceUrl(): string {
    return this.ctx.settings.ollamaEndpoint;
  }

  async sentientSimsGenerate(request: OpenAICompatibleRequest): Promise<SimsGenerateResponse> {
    const model = this.ctx.settings.ollamaModel;

    const body = {
      model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        num_predict: request.maxResponseTokens,
        temperature: 0.7,
      },
    };

    log.debug(`Ollama request: ${JSON.stringify({ url: `${this.serviceUrl()}/api/chat`, body }, null, 2)}`);

    try {
      const response = await axiosClient({
        url: '/api/chat',
        method: 'POST',
        baseURL: this.serviceUrl(),
        data: body,
        timeout: 120000,
      });

      const text: string = response.data?.message?.content || '';

      return {
        text: text.trim(),
        request,
      };
    } catch (e: any) {
      log.error('Error calling Ollama', e?.response?.data || e?.message || e);
      throw e;
    }
  }

  async healthCheck(): Promise<any> {
    try {
      await axiosClient({
        url: '/api/tags',
        baseURL: this.serviceUrl(),
        timeout: 5000,
      });
      return { status: 'OK' };
    } catch (e: any) {
      log.error('Ollama health check failed', e?.message || e);
      return { error: e?.message || `${e}` };
    }
  }

  async getModels(): Promise<AIModel[]> {
    try {
      const response = await axiosClient({ url: '/api/tags', baseURL: this.serviceUrl(), timeout: 5000 });
      const models: any[] = response.data?.models || [];
      return models.map((m: any) => ({ name: m.name, displayName: m.name }));
    } catch (e: any) {
      log.error('Error getting Ollama models', e);
      throw e;
    }
  }
}

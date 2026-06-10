export enum ApiType {
  OpenAI = 'openai',
  VLLM = 'vllm',
  SentientSimsAI = 'sentientsimsai',
  CustomAI = 'customai',
  NovelAI = 'novelai',
  KoboldAI = 'koboldai',
  Gemini = 'gemini',
  Kokoro = 'kokoro',
  ElevenLabs = 'elevenlabs',
  Ollama = 'ollama',
  LMStudio = 'lmstudio',
}

export function ApiTypeFromValue(value: any): ApiType {
  switch (value) {
    case ApiType.SentientSimsAI:
      return ApiType.SentientSimsAI;
    case ApiType.CustomAI:
      return ApiType.CustomAI;
    case ApiType.KoboldAI:
      return ApiType.KoboldAI;
    case ApiType.NovelAI:
      return ApiType.NovelAI;
    case ApiType.Gemini:
      return ApiType.Gemini;
    case ApiType.Kokoro:
      return ApiType.Kokoro;
    case ApiType.ElevenLabs:
      return ApiType.ElevenLabs;
    case ApiType.VLLM:
      return ApiType.VLLM;
    case ApiType.Ollama:
      return ApiType.Ollama;
    case ApiType.LMStudio:
      return ApiType.LMStudio;
    default:
      return ApiType.OpenAI;
  }
}

export function ApiTypeName(apiType: ApiType): string {
  switch (apiType) {
    case ApiType.SentientSimsAI:
      return 'Sentient Sims AI';
    case ApiType.KoboldAI:
      return 'Kobold AI';
    case ApiType.NovelAI:
      return 'Novel AI';
    case ApiType.OpenAI:
      return 'OpenAI';
    case ApiType.VLLM:
      return 'VLLM';
    case ApiType.Gemini:
      return 'Gemini';
    case ApiType.Kokoro:
      return 'Kokoro';
    case ApiType.ElevenLabs:
      return 'ElevenLabs';
    case ApiType.Ollama:
      return 'Ollama';
    case ApiType.LMStudio:
      return 'LM Studio';
    default:
      return 'AI';
  }
}

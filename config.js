import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT || 3000
export const baseUrlProd = process.env.BASE_URL_PROD
export const baseUrlDev = process.env.BASE_URL_DEV
export const baseUrlMistral = process.env.BASE_URL_MISTRAL

export const modelConfigs = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    isOpenAI: true,
  },
  meta_1: {
    apiKey: process.env.META_1_API_KEY,
    model: process.env.META_1_MODEL,
  },
  meta_2: {
    apiKey: process.env.META_2_API_KEY,
    model: process.env.META_2_MODEL,
  },
  meta_3: {
    apiKey: process.env.META_3_API_KEY,
    model: process.env.META_3_MODEL,
  },
  qwen_2_5: {
    apiKey: process.env.QWEN_2_5_API_KEY,
    model: process.env.QWEN_2_5_MODEL,
  },
  qwen_2: {
    apiKey: process.env.QWEN_2_API_KEY,
    model: process.env.QWEN_2_MODEL,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL,
  },
  mistral_1: {
    apiKey: process.env.MISTRAL_1_API_KEY,
    model: process.env.MISTRAL_1_MODEL,
  },
  mistral_2: {
    apiKey: process.env.MISTRAL_2_API_KEY,
    model: process.env.MISTRAL_2_MODEL,
  },
  gemma: {
    apiKey: process.env.GEMMA_API_KEY,
    model: process.env.GEMMA_MODEL,
  },
}

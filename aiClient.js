import fetch from 'node-fetch';
import OpenAI from 'openai';
import { baseUrl, modelConfigs } from './config.js';

const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey });

export const translateWithModel = async (modelName, messages) => {
  const config = modelConfigs[modelName];

  if (!config || !config.apiKey || !config.model) {
    throw new Error(`Missing configuration for model: ${modelName}`);
  }

  if (config.isOpenAI) {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages,
    });

    return response.choices[0].message.content.trim();
  }

  const response = await fetch(`${baseUrl}chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error (${modelName}): ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
};

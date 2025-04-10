// import fetch from 'node-fetch';
// import OpenAI from 'openai';
// import { baseUrl, modelConfigs } from './config.js';

// const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey , baseUrl: baseUrl});

// export const translateWithModel = async (modelName, messages) => {
//   const config = modelConfigs[modelName];

//   if (!config || !config.apiKey || !config.model) {
//     throw new Error(`Missing configuration for model: ${modelName}`);
//   }

//   if (config.isOpenAI) {
//     const response = await openai.chat.completions.create({
//       model: config.model,
//       messages,
//     });

//     return response.choices[0].message.content.trim();
//   }

//   const response = await fetch(`${baseUrl}chat/completions`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${config.apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: config.model,
//       messages,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`API error (${modelName}): ${response.statusText}`);
//   }

//   const result = await response.json();
//   return result.choices[0].message.content.trim();
// };

import fetch from 'node-fetch'
import OpenAI from 'openai'
import { MistralClient } from '@mistralai/mistralai'
import { baseUrl, modelConfigs } from './config.js'

const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey, baseUrl })

// Prepare Mistral client only if config is present
const mistralClient = modelConfigs.mistral?.apiKey
  ? new MistralClient({ apiKey: modelConfigs.mistral.apiKey })
  : null

export const translateWithModel = async (modelName, messages) => {
  const config = modelConfigs[modelName]

  if (!config || !config.apiKey || !config.model) {
    throw new Error(`Missing configuration for model: ${modelName}`)
  }

  // OpenAI case
  if (config.isOpenAI) {
    const response = await openai.chat.completions.create({
      model: config.model,
      messages,
    })
    return response.choices[0].message.content.trim()
  }

  // Mistral SDK case
  if (modelName === 'mistral' && mistralClient) {
    const chatResponse = await mistralClient.chat.create({
      model: config.model,
      messages,
    })
    return chatResponse.choices[0].message.content.trim()
  }

  // Default: Other models via baseUrl (e.g. Meta, Qwen, DeepSeek)
  const response = await fetch(`${baseUrl}chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error (${modelName}): ${response.statusText}`)
  }

  const result = await response.json()
  return result.choices[0].message.content.trim()
}

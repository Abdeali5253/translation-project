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
import { baseUrl, modelConfigs } from './config.js'

const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey, baseUrl })

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

  // Mistral case (direct API call)
  if (modelName === 'mistral') {
    try {
      const response = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages: messages, // Ensure messages are passed correctly
            temperature: 0.7, // Adjust if needed
            top_p: 1, // Adjust if needed
            max_tokens: 150, // Example: limit the output length
            stream: false, // Stream response or not
          }),
        }
      )

      if (!response.ok) {
        const errorDetails = await response.json() // Log detailed error response
        console.error('Mistral API Error:', errorDetails) // Log API error details
        throw new Error(`Mistral API error: ${response.statusText}`)
      }

      const result = await response.json()
      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling Mistral API:', error) // Log any unexpected errors
      throw error // Re-throw error after logging it
    }
  }

  // Default: Other models via baseUrl (Meta, Qwen, etc.)
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

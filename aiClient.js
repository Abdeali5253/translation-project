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
    try {
      const response = await openai.chat.completions.create({
        model: config.model,
        messages,
      })

      console.log('OpenAI API Response:', response) // Log the full response
      return response.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling OpenAI API:', error) // Log errors for OpenAI
      throw error
    }
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
            messages: messages,
            temperature: 0.7,
            top_p: 1,
            stream: false,
          }),
        }
      )

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Mistral API Error:', errorDetails) // Log Mistral API error details
        throw new Error(`Mistral API error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Mistral API Response:', result) // Log the full Mistral response
      if (
        !result.choices ||
        !Array.isArray(result.choices) ||
        result.choices.length === 0
      ) {
        console.error('Mistral API Error: No choices returned:', result)
        throw new Error('No choices returned from Mistral API')
      }

      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling Mistral API:', error) // Log Mistral API errors
      throw error
    }
  }

  // Qwen case (direct API call for Qwen models)
  if (modelName.startsWith('qwen')) {
    try {
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
        const errorDetails = await response.json()
        console.error('Qwen API Error:', errorDetails) // Log Qwen API error details
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Qwen API Response:', result) // Log the full Qwen response
      if (
        !result.choices ||
        !Array.isArray(result.choices) ||
        result.choices.length === 0
      ) {
        console.error('Qwen API Error: No choices returned:', result)
        throw new Error('No choices returned from Qwen API')
      }

      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling Qwen API:', error) // Log Qwen API errors
      throw error
    }
  }

  // Default: Other models via baseUrl (Meta, DeepSeek, etc.)
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
    const errorDetails = await response.json()
    console.error(`${modelName} API Error:`, errorDetails) // Log error details for other models
    throw new Error(`API error (${modelName}): ${response.statusText}`)
  }

  const result = await response.json()
  console.log(`${modelName} API Response:`, result) // Log the full response
  if (
    !result.choices ||
    !Array.isArray(result.choices) ||
    result.choices.length === 0
  ) {
    console.error(`${modelName} API Error: No choices returned:`, result)
    throw new Error(`No choices returned for model ${modelName}`)
  }

  return result.choices[0].message.content.trim()
}

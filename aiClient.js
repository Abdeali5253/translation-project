// import fetch from 'node-fetch'
// import OpenAI from 'openai'
// import { baseUrlDev,baseUrlProd, modelConfigs } from './config.js'

// const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey })

// export const translateWithModel = async (modelName, messages) => {
//   const config = modelConfigs[modelName]

//   if (!config || !config.apiKey || !config.model) {
//     throw new Error(`Missing configuration for model: ${modelName}`)
//   }

//   // OpenAI case
//   if (config.isOpenAI) {
//     try {
//       const response = await openai.chat.completions.create({
//         model: config.model,
//         messages,
//       })

//       console.log('OpenAI API Response:', response) // Log the full response
//       return response.choices[0].message.content.trim()
//     } catch (error) {
//       console.error('Error calling OpenAI API:', error) // Log errors for OpenAI
//       throw error
//     }
//   }

//   // Mistral case (direct API call)
//   if (modelName === 'mistral') {
//     try {
//       const response = await fetch(
//         'https://api.mistral.ai/v1/chat/completions',
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${config.apiKey}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             model: config.model,
//             messages: messages,
//             temperature: 0.7,
//             top_p: 1,
//             stream: false,
//           }),
//         }
//       )

//       if (!response.ok) {
//         const errorDetails = await response.json()
//         console.error('Mistral API Error:', errorDetails) // Log Mistral API error details
//         throw new Error(`Mistral API error: ${response.statusText}`)
//       }

//       const result = await response.json()
//       console.log('Mistral API Response:', result) // Log the full Mistral response
//       if (
//         !result.choices ||
//         !Array.isArray(result.choices) ||
//         result.choices.length === 0
//       ) {
//         console.error('Mistral API Error: No choices returned:', result)
//         throw new Error('No choices returned from Mistral API')
//       }

//       return result.choices[0].message.content.trim()
//     } catch (error) {
//       console.error('Error calling Mistral API:', error) // Log Mistral API errors
//       throw error
//     }
//   }

//   // Default: Other models via baseUrl (Meta, DeepSeek, etc.)
//   const response = await fetch(`${baseUrlProd}chat/completions`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${config.apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: config.model,
//       messages,
//     }),
//   })

//   if (!response.ok) {
//     const errorDetails = await response.json()
//     console.error(`${modelName} API Error:`, errorDetails) // Log error details for other models
//     throw new Error(`API error (${modelName}): ${response.statusText}`)
//   }

//   const result = await response.json()
//   console.log(`${modelName} API Response:`, result) // Log the full response
//   if (
//     !result.choices ||
//     !Array.isArray(result.choices) ||
//     result.choices.length === 0
//   ) {
//     console.error(`${modelName} API Error: No choices returned:`, result)
//     throw new Error(`No choices returned for model ${modelName}`)
//   }

//   return result.choices[0].message.content.trim()
// }


import fetch from 'node-fetch'
import OpenAI from 'openai'
import { baseUrlDev, baseUrlProd, modelConfigs } from './config.js'

const openai = new OpenAI({ apiKey: modelConfigs.openai.apiKey })

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

  // Mistral 1: Direct API call (production)
  if (modelName === 'mistral_1') {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
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
      })

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Mistral 1 API Error:', errorDetails) // Log Mistral API error details
        throw new Error(`Mistral 1 API error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Mistral 1 API Response:', result) // Log the full Mistral response
      if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
        console.error('Mistral 1 API Error: No choices returned:', result)
        throw new Error('No choices returned from Mistral 1 API')
      }

      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling Mistral 1 API:', error) // Log Mistral API errors
      throw error
    }
  }

  // Mistral 2: Use Dev Base URL
  if (modelName === 'mistral_2') {
    try {
      const response = await fetch(baseUrlDev + 'v1/chat/completions', {
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
      })

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Mistral 2 API Error:', errorDetails) // Log Mistral 2 API error details
        throw new Error(`Mistral 2 API error: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Mistral 2 API Response:', result) // Log the full Mistral 2 response
      if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
        console.error('Mistral 2 API Error: No choices returned:', result)
        throw new Error('No choices returned from Mistral 2 API')
      }

      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling Mistral 2 API:', error) // Log Mistral 2 API errors
      throw error
    }
  }

  // For other models (production base URL)
  const response = await fetch(baseUrlProd + 'v1/chat/completions', {
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
  if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
    console.error(`${modelName} API Error: No choices returned:`, result)
    throw new Error(`No choices returned for model ${modelName}`)
  }

  return result.choices[0].message.content.trim()
}

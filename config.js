import dotenv from 'dotenv'

dotenv.config()

export const openaiApiKey = process.env.OPENAI_API_KEY
export const port = process.env.PORT || 3000
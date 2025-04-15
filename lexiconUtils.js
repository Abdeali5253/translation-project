// import fs from 'fs/promises'
// import path from 'path'

// const lexiconDir = path.resolve('lexicons')

// export const loadLexiconPrompts = async () => {
//   const dialects = [

//     'emirati',
//     'egyptian',
//     'jordanian',
//     'palestinian',
//     'syrian',
//     'lebanese',
//   ]
//   const prompts = {}

//   for (const dialect of dialects) {
//     const filePath = path.join(lexiconDir, `lexicon_${dialect}.json`)
//     try {
//       const content = await fs.readFile(filePath, 'utf-8')
//       const entries = JSON.parse(content)
//       const formatted = Object.entries(entries)
//         .map(([k, v]) => `${k} = ${v}`)
//         .join('\n')
//       prompts[
//         dialect
//       ] = `\n\nفي الترجمة باللهجة ${dialect}، يُرجى استخدام المفردات التالية متى ما كان ذلك مناسبًا:\n${formatted}`
//     } catch {
//       prompts[dialect] = ''
//     }
//   }

//   return prompts
// }

// export const loadInstructionPrompts = async () => {
//   const filePath = path.join(lexiconDir, 'dialect_prompts.json')
//   try {
//     const content = await fs.readFile(filePath, 'utf-8')
//     return JSON.parse(content)
//   } catch {
//     console.warn('⚠️ Instruction prompt file not found.')
//     return {}
//   }
// }


import fs from 'fs/promises'
import path from 'path'

const lexiconDir = path.resolve('lexicons')

export const loadLexiconPrompts = async (dialects) => {
  const prompts = {}

  for (const dialect of dialects) {
    const filePath = path.join(lexiconDir, `lexicon_${dialect}.json`)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const entries = JSON.parse(content)
      const formatted = Object.entries(entries)
        .map(([k, v]) => `${k} = ${v}`)
        .join('\n')
      prompts[ 
        dialect
      ] = `\n\nFor translation in ${dialect} dialect, please use the following vocabulary whenever relevant:\n${formatted}`
    } catch {
      prompts[dialect] = ''
    }
  }

  return prompts
}

export const loadInstructionPrompts = async () => {
  const filePath = path.join(lexiconDir, 'dialect_prompts.json')
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    console.warn('⚠️ Instruction prompt file not found.')
    return {}
  }
}

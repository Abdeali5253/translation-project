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

// import fs from 'fs/promises'
// import path from 'path'

// const lexiconDir = path.resolve('lexicons')

// export const loadLexiconPrompts = async (dialects) => {
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
//       ] = `${formatted}`
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

const lexiconDir = path.resolve('lexicons') // Ensure lexicons folder exists and is accessible

export const loadLexiconPrompts = async (dialects) => {
  const prompts = {}

  for (const dialect of dialects) {
    const filePath = path.join(lexiconDir, `lexicon_${dialect}.json`)
    try {
      console.log(
        `Reading lexicon file for dialect: ${dialect} from path: ${filePath}`
      )
      const content = await fs.readFile(filePath, 'utf-8')
      //console.log(`File content for ${dialect}:`, content) // Debug log: check if file is read correctly

      const entries = JSON.parse(content)

      if (!entries || Object.keys(entries).length === 0) {
        console.warn(`No entries found in lexicon for dialect: ${dialect}`)
        prompts[dialect] = '' // Empty if no data
        continue
      }

      const formatted = Object.entries(entries)
        .map(([k, v]) => `${k} = ${v}`)
        .join('\n')

      prompts[dialect] = formatted
      console.log(`Lexicon for ${dialect} loaded successfully.`) // Debug log
    } catch (err) {
      console.error(
        `Error reading lexicon for dialect: ${dialect} at ${filePath}`,
        err
      )
      prompts[dialect] = '' // Fallback empty string in case of failure
    }
  }

  return prompts
}

export const loadInstructionPrompts = async () => {
  const filePath = path.join(lexiconDir, 'dialect_prompts.json')
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    //console.log('Instruction prompts loaded:', content) // Debug log for instruction prompts file
    return JSON.parse(content)
  } catch (err) {
    console.warn('⚠️ Instruction prompt file not found.')
    return {} // Return empty object if not found
  }
}

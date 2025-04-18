// import express from 'express'
// import multer from 'multer'
// import cors from 'cors'
// import open from 'open'
// import path from 'path'
// import fs from 'fs/promises'
// import EventEmitter from 'events'
// import { port } from './config.js'
// import { readExcel, generateExcel } from './excelUtils.js'
// import { translateWithModel } from './aiClient.js'
// import { loadLexiconPrompts, loadInstructionPrompts } from './lexiconUtils.js'

// const app = express()
// const __dirname = path.resolve()
// app.use(cors())
// app.use(express.static(path.join(__dirname, 'public')))
// const upload = multer({ dest: 'uploads/' })

// const progressEmitter = new EventEmitter()
// let lastProgress = { message: 'Waiting...', value: 0 }

// const logFilePath = path.join(__dirname, 'server.log')
// const logToFile = async (message) => {
//   const timestamp = new Date().toISOString()
//   try {
//     await fs.appendFile(logFilePath, `[${timestamp}] ${message}\n`)
//   } catch (err) {
//     console.error('Error writing log:', err)
//   }
// }

// const emitProgress = (message, value) => {
//   lastProgress = { message, value }
//   progressEmitter.emit('update', lastProgress)
//   logToFile(`Progress update: ${message} (${value}%)`)
// }

// // Load prompts
// let lexiconPrompts = {}
// let instructionPrompts = {}
// Promise.all([
//   loadLexiconPrompts().then((loaded) => {
//     lexiconPrompts = loaded
//     logToFile('Lexicon prompts loaded.')
//   }),
//   loadInstructionPrompts().then((loaded) => {
//     instructionPrompts = loaded
//     logToFile('Instruction prompts loaded.')
//   }),
// ])

// const generatePrompt = (texts) => {
//   const formattedTexts = texts
//     .map((text, i) => `${i + 1}. "${text}"`)
//     .join('\n')
//   const dialects = [
//     'msa',
//     'emirati',
//     'egyptian',
//     'jordanian',
//     'palestinian',
//     'syrian',
//     'lebanese',
//   ]

//   const dialectBlocks = dialects
//     .map((dialect) => {
//       const inst = instructionPrompts[dialect] || ''
//       const lex = lexiconPrompts[dialect] || ''
//       return `${inst}\n${lex}`
//     })
//     .join('\n\n')

//   return `
// كمتخصص في كتابة المحتوى، النحو العربي، التراكيب اللغوية، والترجمة، مهمتك هي ترجمة النص الإنجليزي المُعطى إلى عدة لهجات عربية مع الحفاظ على المعنى الأصلي والسياق الكامل. يجب أن تكون الترجمة طبيعية، سلسة، ومناسبة ثقافيًا.

// ${dialectBlocks}

// ترجم النص التالي:

// ${formattedTexts}

// قدم الترجمات وفقًا لهذا التنسيق بالضبط:

// 1. **العربية الفصحى**: [الترجمة]
//    **الإماراتية**: [الترجمة]
//    **المصرية**: [الترجمة]
//    **الأردنية**: [الترجمة]
//    **الفلسطينية**: [الترجمة]
//    **السورية**: [الترجمة]
//    **اللبنانية**: [الترجمة]
// `
// }

// const parseTranslations = (text) => {
//   const blocks = text.trim().split(/\n\n+/)
//   return blocks.map((block) => {
//     const lines = block.split('\n')
//     return {
//       msa: lines[0]?.replace('**العربية الفصحى**: ', '').trim(),
//       emirati: lines[1]?.replace('**الإماراتية**: ', '').trim(),
//       egyptian: lines[2]?.replace('**المصرية**: ', '').trim(),
//       jordanian: lines[3]?.replace('**الأردنية**: ', '').trim(),
//       palestinian: lines[4]?.replace('**الفلسطينية**: ', '').trim(),
//       syrian: lines[5]?.replace('**السورية**: ', '').trim(),
//       lebanese: lines[6]?.replace('**اللبنانية**: ', '').trim(),
//     }
//   })
// }

// app.get('/progress', (req, res) => {
//   res.json(lastProgress)
// })

// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const selectedModel = req.body.model // Get the selected model from UI
//     emitProgress('Uploading file...', 10)
//     const inputFilePath = req.file.path
//     const { headers, rows } = await readExcel(inputFilePath)
//     emitProgress('Reading Excel data...', 20)

//     const batchSize = 8
//     const totalBatches = Math.ceil(rows.length / batchSize)
//     let batch = []
//     let batchIndexes = []
//     let batchNum = 0

//     for (let i = 0; i < rows.length; i++) {
//       if (rows[i]['English']) {
//         batch.push(rows[i]['English'])
//         batchIndexes.push(i)

//         if (batch.length === batchSize || i === rows.length - 1) {
//           emitProgress(
//             `Translating batch ${batchNum + 1} of ${totalBatches}...`,
//             30 + Math.round((batchNum / totalBatches) * 50)
//           )
//           const prompt = generatePrompt(batch)
//           await logToFile(`Generated Prompt:\n${prompt}`)

//           const messages = [
//             { role: 'system', content: 'أنت مساعد لغوي متخصص في الترجمة.' },
//             { role: 'user', content: prompt },
//           ]
//           await logToFile(`Messages:\n${JSON.stringify(messages, null, 2)}`)

//           const responseText = await translateWithModel(selectedModel, messages) // Use the selected model
//           await logToFile(`API Response:\n${responseText}`)

//           const translations = parseTranslations(responseText)
//           batchIndexes.forEach((index, j) => {
//             const tr = translations[j]
//             if (tr) {
//               rows[index]['MSA'] = tr.msa
//               rows[index]['Emirati'] = tr.emirati
//               rows[index]['Egyptian'] = tr.egyptian
//               rows[index]['Jordanian'] = tr.jordanian
//               rows[index]['Palestinian'] = tr.palestinian
//               rows[index]['Syrian'] = tr.syrian
//               rows[index]['Lebanese'] = tr.lebanese
//             }
//           })

//           batch = []
//           batchIndexes = []
//           batchNum++
//         }
//       }
//     }

//     emitProgress('Generating translated file...', 90)
//     const outputFilePath = await generateExcel(
//       headers,
//       rows,
//       req.file.originalname
//     )
//     emitProgress('Translation complete!', 100)

//     res.download(outputFilePath, async (err) => {
//       if (err) {
//         console.error('Error sending file:', err)
//         await logToFile(`Error sending file: ${err}`)
//       }
//       await fs.unlink(inputFilePath)
//       await fs.unlink(outputFilePath)
//     })
//   } catch (err) {
//     console.error('❌ Error processing file:', err.message)
//     await logToFile(`Error processing file: ${err.message}`)
//     emitProgress('Error during processing.', 0)
//     res.status(500).send('Server error')
//   }
// })

// app.listen(port, async () => {
//   const msg = `🚀 Server running at http://localhost:${port}`
//   console.log(msg)
//   await logToFile(msg)
//   await open(`http://localhost:${port}`)
// })

import express from 'express'
import multer from 'multer'
import cors from 'cors'
import open from 'open'
import path from 'path'
import fs from 'fs/promises'
import EventEmitter from 'events'
import { port } from './config.js'
import { readExcel, generateExcel, parseDialectResponse } from './excelUtils.js'
import { translateWithModel } from './aiClient.js'
import { loadLexiconPrompts, loadInstructionPrompts } from './lexiconUtils.js'

const app = express()
const __dirname = path.resolve()
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
const upload = multer({ dest: 'uploads/' })

const progressEmitter = new EventEmitter()
let lastProgress = { message: 'Waiting...', value: 0 }

const logFilePath = path.join(__dirname, 'server.log')
const logToFile = async (message) => {
  const timestamp = new Date().toISOString()
  try {
    await fs.appendFile(logFilePath, `[${timestamp}] ${message}\n`)
  } catch (err) {
    console.error('Error writing log:', err)
  }
}

const emitProgress = (message, value) => {
  lastProgress = { message, value }
  progressEmitter.emit('update', lastProgress)
  logToFile(`Progress update: ${message} (${value}%)`)
}

// Load prompts for MSA and selected dialects
let lexiconPrompts = {}
let instructionPrompts = {}
Promise.all([
  loadLexiconPrompts(['emirati', 'egyptian', 'jordanian']).then((loaded) => {
    lexiconPrompts = loaded
    logToFile('Lexicon prompts loaded.')
  }),
  loadInstructionPrompts().then((loaded) => {
    instructionPrompts = loaded
    logToFile('Instruction prompts loaded.')
  }),
])

const generatePrompt = (text, dialect) => {
  const dialectBlock = `${lexiconPrompts[dialect] || ''}\n\n${
    instructionPrompts[dialect] || ''
  }`
  return `

${dialectBlock}

"${text}"

`
}

const parseTranslations = (text) => {
  console.log('Parsing the response text:', text) // Debug log
  const blocks = text.trim().split(/\n\n+/)
  return blocks.map((block) => {
    const lines = block.split('\n')
    return {
      msa:
        lines
          .find((line) => line.includes('العربية الفصحى'))
          ?.replace('**العربية الفصحى**: ', '')
          .trim() || '',
      emirati:
        lines
          .find((line) => line.includes('الإماراتية'))
          ?.replace('**الإماراتية**: ', '')
          .trim() || '',
      egyptian:
        lines
          .find((line) => line.includes('المصرية'))
          ?.replace('**المصرية**: ', '')
          .trim() || '',
      jordanian:
        lines
          .find((line) => line.includes('الأردنية'))
          ?.replace('**الأردنية**: ', '')
          .trim() || '',
    }
  })
}

app.get('/progress', (req, res) => {
  res.json(lastProgress)
})

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const selectedModel = req.body.model
    const translationMode = req.body.translationMode
    emitProgress('Uploading file...', 10)
    const inputFilePath = req.file.path
    const { headers, rows } = await readExcel(inputFilePath)
    emitProgress('Reading Excel data...', 20)

    console.log('Excel Rows:', rows) // Log rows to verify data

    const batchSize = 8
    const totalBatches = Math.ceil(rows.length / batchSize)
    let batch = []
    let batchIndexes = []
    let batchNum = 0

    if (translationMode === 'english_to_msa') {
      // Translate from English to MSA
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]['English']) {
          batch.push(rows[i]['English'])
          batchIndexes.push(i)

          if (batch.length === batchSize || i === rows.length - 1) {
            emitProgress(
              `Translating batch ${batchNum + 1} of ${totalBatches}...`,
              30 + Math.round((batchNum / totalBatches) * 50)
            )

            const promptMSA = generatePrompt(batch.join('\n'), 'msa')
            await logToFile(`Generated MSA Prompt:\n${promptMSA}`)
            console.log('Generated MSA Prompt:', promptMSA) // Debug log

            const responseMSA = await translateWithModel(selectedModel, [
              { role: 'user', content: promptMSA },
            ])
            await logToFile(`MSA API Response:\n${responseMSA}`)
            console.log('MSA API Response:', responseMSA) // Debug log

            if (!responseMSA || responseMSA.trim() === '') {
              console.error('No response received for MSA translation.')
              throw new Error('No response received for MSA translation.')
            }

            const msaTranslations = parseTranslations(responseMSA)
            rows[batchIndexes[0]]['MSA'] = msaTranslations.msa

            batch = []
            batchIndexes = []
            batchNum++
          }
        }
      }
    } else if (translationMode === 'msa_to_other') {
      // Translate MSA to other dialects (Emirati, Egyptian, Jordanian)
      for (let i = 0; i < rows.length; i++) {
        if (rows[i]['MSA']) {
          const msaText = rows[i]['MSA']
          const batchIndexes = [i]
          for (const dialect of ['emirati', 'egyptian', 'jordanian']) {
            const prompt = generatePrompt(msaText, dialect)
            //await logToFile(`Generated ${dialect} Prompt:\n${prompt}`)
            console.log(`Generated ${dialect} Prompt:`, prompt) // Debug log
            await logToFile(`${dialect} Generated Prompt:\n ${prompt}`)
            const response = await translateWithModel(selectedModel, [
              { role: 'user', content: prompt },
            ])
            await logToFile(`${dialect} API Response:\n${response}`)
            console.log(`${dialect} API Response:`, response) // Debug log

            if (!response || response.trim() === '') {
              console.error(`No response received for ${dialect} translation.`)
              throw new Error(
                `No response received for ${dialect} translation.`
              )
            }

            const dialectTranslation = parseTranslations(response)
            rows[batchIndexes[0]][dialect] =
              dialectTranslation[dialect] || 'No translation'
          }
        }
      }
    }

    emitProgress('Generating translated file...', 90)
    const outputFilePath = await generateExcel(
      headers,
      rows,
      req.file.originalname,
      translationMode
    )
    emitProgress('Translation complete!', 100)

    res.download(outputFilePath, async (err) => {
      if (err) {
        console.error('Error sending file:', err)
        await logToFile(`Error sending file: ${err}`)
      }
      await fs.unlink(inputFilePath)
      await fs.unlink(outputFilePath)
    })
  } catch (err) {
    console.error('❌ Error processing file:', err.message)
    await logToFile(`Error processing file: ${err.message}`)
    emitProgress('Error during processing.', 0)
    res.status(500).send('Server error')
  }
})

app.listen(port, async () => {
  const msg = `🚀 Server running at http://localhost:${port}`
  console.log(msg)
  await logToFile(msg)
  await open(`http://localhost:${port}`)
})

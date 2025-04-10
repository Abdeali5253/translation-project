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
// import { loadLexiconPrompts } from './lexiconUtils.js'

// const app = express()
// const __dirname = path.resolve()

// app.use(cors())
// app.use(express.static(path.join(__dirname, 'public')))

// const upload = multer({ dest: 'uploads/' })

// const progressEmitter = new EventEmitter()
// let lastProgress = { message: 'Waiting...', value: 0 }

// const emitProgress = (message, value) => {
//   lastProgress = { message, value }
//   progressEmitter.emit('update', lastProgress)
// }

// let lexiconPrompts = {}
// loadLexiconPrompts().then((loaded) => {
//   lexiconPrompts = loaded
// })

// const generatePrompt = (texts) => {
//   const formattedTexts = texts
//     .map((text, i) => `${i + 1}. "${text}"`)
//     .join('\n')

//   return `
// كمتخصص في كتابة المحتوى، النحو العربي، التراكيب اللغوية، والترجمة، مهمتك هي ترجمة النص الإنجليزي المُعطى إلى عدة لهجات عربية مع الحفاظ على المعنى الأصلي والسياق الكامل. يجب أن تكون الترجمة طبيعية، سلسة، ومناسبة ثقافيًا.

// ترجم النص إلى اللهجات التالية مع اتباع هذه الإرشادات المحددة:

// 1. **العربية الفصحى (MSA)**: حافظ على القواعد اللغوية الصحيحة والاتساق اللغوي مع ضمان أن تكون الترجمة منظمة واحترافية.
// 2. **اللهجة الإماراتية**: استخدم مفردات وأسلوب كتابة إماراتي أصيل بحيث تعكس الطريقة الطبيعية التي يتحدث ويكتب بها الإماراتيون.
// 3. **اللهجة المصرية**: اجعل النص طبيعياً وبأسلوب محادثة يومي، مع استخدام التعبيرات الشائعة والنطق الذي يعكس اللغة المحكية في مصر.
// 4. **اللهجة الأردنية**: استخدم الكلمات والتعابير الشائعة في لهجة عمّان الحضرية لجعل الترجمة واضحة ومألوفة.
// 5. **اللهجة الفلسطينية**: ترجم باللهجة المقدسية مع استخدام تعابير وتراكيب طبيعية للحفاظ على أصالة اللهجة.
// 6. **اللهجة السورية**: استخدم لهجة دمشق بمفردات وتراكيب لغوية تجعل الترجمة مفهومة وطبيعية للجمهور السوري.
// 7. **اللهجة اللبنانية**: ترجم بلهجة شباب بيروت، مع الحفاظ على سلاسة التعبير والمرونة، وتجنب الجمل الثقيلة أو المعقدة بشكل زائد.

// إذا كان هناك تعبير مشترك بين أكثر من لهجة، فحافظ على الاتساق في الترجمة. وإلا، عدّل الترجمة بحيث تعكس كل لهجة بدقة.

// **مهم جدًا**: لا تُضف اسم اللهجة داخل الترجمة نفسها (مثل: "بالمصري" أو "باللهجة الأردنية"). فقط قدّم الترجمة مباشرة بدون مقدمات أو شروحات.

// ${lexiconPrompts.msa || ''}
// ${lexiconPrompts.emirati || ''}
// ${lexiconPrompts.egyptian || ''}
// ${lexiconPrompts.jordanian || ''}
// ${lexiconPrompts.palestinian || ''}
// ${lexiconPrompts.syrian || ''}
// ${lexiconPrompts.lebanese || ''}

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

// // Progress polling endpoint
// app.get('/progress', (req, res) => {
//   res.json(lastProgress)
// })

// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
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
//           const messages = [
//             { role: 'system', content: 'أنت مساعد لغوي متخصص في الترجمة.' },
//             { role: 'user', content: prompt },
//           ]

//           const responseText = await translateWithModel('qwen_2', messages)
//           // Change to openai, meta_1, meta_2,meta_3, qwen_2_5, qwen_2, deepseek as needed
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
//       if (err) console.error('Error sending file:', err)
//       await fs.unlink(inputFilePath)
//       await fs.unlink(outputFilePath)
//     })
//   } catch (err) {
//     console.error('❌ Error processing file:', err.message)
//     emitProgress('Error during processing.', 0)
//     res.status(500).send('Server error')
//   }
// })

// app.listen(port, async () => {
//   console.log(`🚀 Server running at http://localhost:${port}`)
//   await open(`http://localhost:${port}`)
// })

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
// import { loadLexiconPrompts } from './lexiconUtils.js'

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

// let lexiconPrompts = {}
// loadLexiconPrompts().then((loaded) => {
//   lexiconPrompts = loaded
//   logToFile('Lexicon prompts loaded.')
// })

// const generatePrompt = (texts) => {
//   const formattedTexts = texts
//     .map((text, i) => `${i + 1}. "${text}"`)
//     .join('\n')

//   return `
// كمتخصص في كتابة المحتوى، النحو العربي، التراكيب اللغوية، والترجمة، مهمتك هي ترجمة النص الإنجليزي المُعطى إلى عدة لهجات عربية مع الحفاظ على المعنى الأصلي والسياق الكامل. يجب أن تكون الترجمة طبيعية، سلسة، ومناسبة ثقافيًا.

// ترجم النص إلى اللهجات التالية مع اتباع هذه الإرشادات المحددة:

// 1. **العربية الفصحى (MSA)**: حافظ على القواعد اللغوية الصحيحة والاتساق اللغوي مع ضمان أن تكون الترجمة منظمة واحترافية.
// 2. **اللهجة الإماراتية**: استخدم مفردات وأسلوب كتابة إماراتي أصيل بحيث تعكس الطريقة الطبيعية التي يتحدث ويكتب بها الإماراتيون.
// 3. **اللهجة المصرية**: اجعل النص طبيعياً وبأسلوب محادثة يومي، مع استخدام التعبيرات الشائعة والنطق الذي يعكس اللغة المحكية في مصر.
// 4. **اللهجة الأردنية**: استخدم الكلمات والتعابير الشائعة في لهجة عمّان الحضرية لجعل الترجمة واضحة ومألوفة.
// 5. **اللهجة الفلسطينية**: ترجم باللهجة المقدسية مع استخدام تعابير وتراكيب طبيعية للحفاظ على أصالة اللهجة.
// 6. **اللهجة السورية**: استخدم لهجة دمشق بمفردات وتراكيب لغوية تجعل الترجمة مفهومة وطبيعية للجمهور السوري.
// 7. **اللهجة اللبنانية**: ترجم بلهجة شباب بيروت، مع الحفاظ على سلاسة التعبير والمرونة، وتجنب الجمل الثقيلة أو المعقدة بشكل زائد.

// إذا كان هناك تعبير مشترك بين أكثر من لهجة، فحافظ على الاتساق في الترجمة. وإلا، عدّل الترجمة بحيث تعكس كل لهجة بدقة.

// **مهم جدًا**: لا تُضف اسم اللهجة داخل الترجمة نفسها (مثل: "بالمصري" أو "باللهجة الأردنية"). فقط قدّم الترجمة مباشرة بدون مقدمات أو شروحات.

// ${lexiconPrompts.msa || ''}
// ${lexiconPrompts.emirati || ''}
// ${lexiconPrompts.egyptian || ''}
// ${lexiconPrompts.jordanian || ''}
// ${lexiconPrompts.palestinian || ''}
// ${lexiconPrompts.syrian || ''}
// ${lexiconPrompts.lebanese || ''}

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

// // Progress polling endpoint
// app.get('/progress', (req, res) => {
//   res.json(lastProgress)
// })

// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
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
//           await logToFile(
//             `Messages to be sent:\n${JSON.stringify(messages, null, 2)}`
//           )

//           const responseText = await translateWithModel('openai', messages)
//           await logToFile(`API Response Text:\n${responseText}`)

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
//   const serverMsg = `Server running at http://localhost:${port}`
//   console.log(serverMsg)
//   await logToFile(serverMsg)
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
import { readExcel, generateExcel } from './excelUtils.js'
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

// Load prompts
let lexiconPrompts = {}
let instructionPrompts = {}
Promise.all([
  loadLexiconPrompts().then((loaded) => {
    lexiconPrompts = loaded
    logToFile('Lexicon prompts loaded.')
  }),
  loadInstructionPrompts().then((loaded) => {
    instructionPrompts = loaded
    logToFile('Instruction prompts loaded.')
  }),
])

const generatePrompt = (texts) => {
  const formattedTexts = texts
    .map((text, i) => `${i + 1}. "${text}"`)
    .join('\n')
  const dialects = [
    'msa',
    'emirati',
    'egyptian',
    'jordanian',
    'palestinian',
    'syrian',
    'lebanese',
  ]

  const dialectBlocks = dialects
    .map((dialect) => {
      const inst = instructionPrompts[dialect] || ''
      const lex = lexiconPrompts[dialect] || ''
      return `${inst}\n${lex}`
    })
    .join('\n\n')

  return `
كمتخصص في كتابة المحتوى، النحو العربي، التراكيب اللغوية، والترجمة، مهمتك هي ترجمة النص الإنجليزي المُعطى إلى عدة لهجات عربية مع الحفاظ على المعنى الأصلي والسياق الكامل. يجب أن تكون الترجمة طبيعية، سلسة، ومناسبة ثقافيًا.

${dialectBlocks}

ترجم النص التالي:

${formattedTexts}

قدم الترجمات وفقًا لهذا التنسيق بالضبط:

1. **العربية الفصحى**: [الترجمة]
   **الإماراتية**: [الترجمة]
   **المصرية**: [الترجمة]
   **الأردنية**: [الترجمة]
   **الفلسطينية**: [الترجمة]
   **السورية**: [الترجمة]
   **اللبنانية**: [الترجمة]
`
}

const parseTranslations = (text) => {
  const blocks = text.trim().split(/\n\n+/)
  return blocks.map((block) => {
    const lines = block.split('\n')
    return {
      msa: lines[0]?.replace('**العربية الفصحى**: ', '').trim(),
      emirati: lines[1]?.replace('**الإماراتية**: ', '').trim(),
      egyptian: lines[2]?.replace('**المصرية**: ', '').trim(),
      jordanian: lines[3]?.replace('**الأردنية**: ', '').trim(),
      palestinian: lines[4]?.replace('**الفلسطينية**: ', '').trim(),
      syrian: lines[5]?.replace('**السورية**: ', '').trim(),
      lebanese: lines[6]?.replace('**اللبنانية**: ', '').trim(),
    }
  })
}

app.get('/progress', (req, res) => {
  res.json(lastProgress)
})

// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
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

//           const responseText = await translateWithModel('openai', messages)
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

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const selectedModel = req.body.model // Get the selected model from UI
    emitProgress('Uploading file...', 10)
    const inputFilePath = req.file.path
    const { headers, rows } = await readExcel(inputFilePath)
    emitProgress('Reading Excel data...', 20)

    const batchSize = 8
    const totalBatches = Math.ceil(rows.length / batchSize)
    let batch = []
    let batchIndexes = []
    let batchNum = 0

    for (let i = 0; i < rows.length; i++) {
      if (rows[i]['English']) {
        batch.push(rows[i]['English'])
        batchIndexes.push(i)

        if (batch.length === batchSize || i === rows.length - 1) {
          emitProgress(
            `Translating batch ${batchNum + 1} of ${totalBatches}...`,
            30 + Math.round((batchNum / totalBatches) * 50)
          )
          const prompt = generatePrompt(batch)
          await logToFile(`Generated Prompt:\n${prompt}`)

          const messages = [
            { role: 'system', content: 'أنت مساعد لغوي متخصص في الترجمة.' },
            { role: 'user', content: prompt },
          ]
          await logToFile(`Messages:\n${JSON.stringify(messages, null, 2)}`)

          const responseText = await translateWithModel(selectedModel, messages) // Use the selected model
          await logToFile(`API Response:\n${responseText}`)

          const translations = parseTranslations(responseText)
          batchIndexes.forEach((index, j) => {
            const tr = translations[j]
            if (tr) {
              rows[index]['MSA'] = tr.msa
              rows[index]['Emirati'] = tr.emirati
              rows[index]['Egyptian'] = tr.egyptian
              rows[index]['Jordanian'] = tr.jordanian
              rows[index]['Palestinian'] = tr.palestinian
              rows[index]['Syrian'] = tr.syrian
              rows[index]['Lebanese'] = tr.lebanese
            }
          })

          batch = []
          batchIndexes = []
          batchNum++
        }
      }
    }

    emitProgress('Generating translated file...', 90)
    const outputFilePath = await generateExcel(
      headers,
      rows,
      req.file.originalname
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

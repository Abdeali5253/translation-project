// import express from 'express'
// import multer from 'multer'
// import fs from 'fs/promises'
// import cors from 'cors'
// import open from 'open'
// import path from 'path'
// import OpenAI from 'openai'
// import { port, openaiApiKey } from './config.js'
// import { readExcel, generateExcel } from './excelUtils.js'

// const app = express()

// // Enable CORS for frontend-backend communication
// app.use(cors())

// // Serve frontend files
// const __dirname = path.resolve()
// app.use(express.static(path.join(__dirname, 'public'))) // Serve frontend from "public" folder

// // Multer setup for file uploads
// const upload = multer({ dest: 'uploads/' })

// // OpenAI Configuration
// const openai = new OpenAI({
//   apiKey: openaiApiKey, // Use environment variable
// })

// // Function to translate text while preserving original format
// const translateText = async (text, label) => {
//   if (!text) return { msa: '', emirati: '', egyptian: '' } // Prevent translating empty cells

//   const prompt = `
// I will provide you with a "${label}" in English. Translate it into the MSA language first, then into the Emirati language, and then into the Egyptian language.

// MSA: بصفتك خبيرًا في كتابة المحتوى وتفهم جيدًا قواعد اللغة العربية من حيث النحو والصرف، وتركيب الجملة وصياغة الأسئلة والأجوبة، والترجمة من اللغة الإنجليزية للغة العربية، ترجم النص التالي إلى اللغة العربية الفصحى، بلغة سليمة وصياغة متسقة، والحفاظ على كل المعلومات الأصلية.

// Emirati: بالاستعانة بالكلمات الإماراتية المناسبة ومراعاة كل قواعد كتابة اللهجة الإماراتية السابقة، ترجم النص التالي من الإنجليزية إلى اللهجة الإماراتية الدارجة، مع الحفاظ على كل المعلومات الأصلية.

// Egyptian: بصفتك خبيرًا في اللهجة العامية المصرية وطريقة نطقها وكتابتها، ترجم النص التالي من الإنجليزية إلى العامية المصرية بأسلوب طبيعي وسلس، وكأنها محادثة يومية بين مصريين. استخدم تعبيرات وألفاظ شائعة في مصر لتعكس الطابع المحلي.

// Translate the following "${label}":
// "${text}"

// Provide the translations in three separate lines as follows:
// 1. MSA: [Translation]
// 2. Emirati: [Translation]
// 3. Egyptian: [Translation]
//     `

//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4o-mini-2024-07-18',
//       messages: [{ role: 'user', content: prompt }],
//     })

//     if (!response || !response.choices || response.choices.length === 0) {
//       throw new Error('Invalid API response: ' + JSON.stringify(response))
//     }

//     const translations = response.choices[0].message.content.trim().split('\n')
//     return {
//       msa: translations[0].replace('1. MSA: ', '').trim(),
//       emirati: translations[1].replace('2. Emirati: ', '').trim(),
//       egyptian: translations[2].replace('3. Egyptian: ', '').trim(),
//     }
//   } catch (error) {
//     console.error(`Translation error for ${label}:`, error.message)
//     return { msa: 'Error', emirati: 'Error', egyptian: 'Error' }
//   }
// }

// // File upload and processing
// app.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     const inputFilePath = req.file.path

//     // Read the uploaded Excel file while keeping format
//     const { headers, rows } = await readExcel(inputFilePath)

//     // Process translations
//     for (const row of rows) {
//       if (row['English']) {
//         console.log(`Translating: ${row['English']}`)
//         const translations = await translateText(row['English'], 'Text')
//         row['MSA'] = translations.msa
//         row['Emirati'] = translations.emirati
//         row['Egyptian'] = translations.egyptian
//       }
//     }

//     // Generate translated Excel file with original format
//     const outputFilePath = await generateExcel(headers, rows)

//     // Send file to client
//     res.download(outputFilePath, async (err) => {
//       if (err) console.error('Error sending file:', err)
//       await fs.unlink(inputFilePath)
//       await fs.unlink(outputFilePath)
//     })
//   } catch (error) {
//     console.error('Error processing file:', error)
//     res.status(500).send('Internal Server Error')
//   }
// })

// // Start the server and open the frontend automatically
// app.listen(port, async () => {
//   console.log(`🚀 Server running at http://localhost:${port}`)
//   await open(`http://localhost:${port}`)
// })

import express from 'express'
import multer from 'multer'
import fs from 'fs/promises'
import cors from 'cors'
import open from 'open'
import path from 'path'
import OpenAI from 'openai'
import { port, openaiApiKey } from './config.js'
import { readExcel, generateExcel } from './excelUtils.js'

const app = express()

// Enable CORS for frontend-backend communication
app.use(cors())

// Serve frontend files
const __dirname = path.resolve()
app.use(express.static(path.join(__dirname, 'public')))

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' })

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: openaiApiKey,
})

// Function to translate text into multiple dialects
const translateText = async (text, label) => {
  if (!text) return { jordanian: '', palestinian: '', syrian: '', lebanese: '' }

  const prompt = `
I will provide you with a "${label}" in English. Translate it into the following Arabic dialects: Jordanian, Palestinian, Syrian, and Lebanese.

Jordanian: بصفتك مترجم محترف، وخبير في اللهجة الأردنية، ترجم النص التالي من الإنجليزية إلى اللهجة الأردنية بدقة، مع الحفاظ على المعنى الأصلي للنص والسياق الكامل للكلمات والجمل، وترجمة سليمة إملائيًا. استخدم الكلمات والتعابير الدارجة في اللهجة الأردنية، مع التركيز على اللهجة المستخدمة في عمّان والمناطق الحضرية لتكون الترجمة مألوفة وواضحة.

Palestinian: بصفتك مترجم محترف، وخبير في اللهجة الفلسطينية، ترجم النص التالي من الإنجليزية إلى اللهجة الفلسطينية بدقة (لهجة أهل القدس)، مع الحفاظ على المعنى الأصلي للنص والسياق الكامل للكلمات والجمل، ترجمة سليمة إملائيًا، واستخدم تعابير وتراكيب مألوفة عند أهل القدس للحفاظ على عفوية اللهجة وسلاستها.

Syrian: بصفتك مترجم محترف، وخبير في اللهجة السورية، ترجم النص التالي من الإنجليزية إلى اللهجة السورية بدقة (لهجة دمشق)، مع الحفاظ على المعنى الأصلي للنص والسياق الكامل للكلمات والجمل، ترجمة سليمة إملائيًا، وتأكد من استخدام مفردات وتراكيب لغوية شائعة في اللهجة السورية بحيث تكون الترجمة مفهومة وطبيعية للجمهور السوري.

Lebanese: بصفتك مترجمًا محترفًا وخبيرًا في اللهجة اللبنانية، ترجم النص التالي من الإنجليزية إلى اللهجة اللبنانية (لهجة شباب بيروت) بدقة ومرونة، مع الحفاظ على المعنى الأصلي والسياق الكامل للنص. استخدم كلمات وتراكيب دارجة في لهجة بيروت الشبابية، مع الحفاظ على سلاسة التعبير وتجنب الجُمل الثقيلة أو المُركّبة بشكل زائد.

Translate the following "${label}":
"${text}"

Provide the translations in four separate lines as follows:
1. Jordanian: [Translation]
2. Palestinian: [Translation]
3. Syrian: [Translation]
4. Lebanese: [Translation]
  `

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: prompt }],
    })

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('Invalid API response: ' + JSON.stringify(response))
    }

    const translations = response.choices[0].message.content.trim().split('\n')
    return {
      jordanian: translations[0].replace('1. Jordanian: ', '').trim(),
      palestinian: translations[1].replace('2. Palestinian: ', '').trim(),
      syrian: translations[2].replace('3. Syrian: ', '').trim(),
      lebanese: translations[3].replace('4. Lebanese: ', '').trim(),
    }
  } catch (error) {
    console.error(`Translation error for ${label}:`, error.message)
    return {
      jordanian: 'Error',
      palestinian: 'Error',
      syrian: 'Error',
      lebanese: 'Error',
    }
  }
}

// File upload and processing
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const inputFilePath = req.file.path
    const { headers, rows } = await readExcel(inputFilePath)

    for (const row of rows) {
      if (row['English']) {
        console.log(`Translating: ${row['English']}`)
        const translations = await translateText(row['English'], 'Text')
        row['Jordanian'] = translations.jordanian
        row['Palestinian'] = translations.palestinian
        row['Syrian'] = translations.syrian
        row['Lebanese'] = translations.lebanese
      }
    }

    const outputFilePath = await generateExcel(
      headers,
      rows,
      req.file.originalname
    )

    res.download(outputFilePath, async (err) => {
      if (err) console.error('Error sending file:', err)
      await fs.unlink(inputFilePath)
      await fs.unlink(outputFilePath)
    })
  } catch (error) {
    console.error('Error processing file:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
  await open(`http://localhost:${port}`)
})

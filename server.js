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

import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import cors from 'cors';
import open from 'open';
import path from 'path';
import OpenAI from 'openai';
import { port, openaiApiKey } from './config.js';
import { readExcel, generateExcel } from './excelUtils.js';

const app = express();
const __dirname = path.resolve();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// OpenAI API setup
const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * Translates text in batches of 8
 */
const translateTextBatch = async (texts) => {
  if (!texts || texts.length === 0) return [];

  const formattedTexts = texts.map((text, index) => `${index + 1}. "${text}"`).join("\n");

  const prompt = `
كمتخصص في كتابة المحتوى، النحو العربي، التراكيب اللغوية، والترجمة، مهمتك هي ترجمة النص الإنجليزي المُعطى إلى عدة لهجات عربية مع الحفاظ على المعنى الأصلي والسياق الكامل. يجب أن تكون الترجمة طبيعية، سلسة، ومناسبة ثقافيًا.

ترجم النص إلى اللهجات التالية مع اتباع هذه الإرشادات المحددة:

1. **العربية الفصحى (MSA)**: حافظ على القواعد اللغوية الصحيحة والاتساق اللغوي مع ضمان أن تكون الترجمة منظمة واحترافية.
2. **اللهجة الإماراتية**: استخدم مفردات وأسلوب كتابة إماراتي أصيل بحيث تعكس الطريقة الطبيعية التي يتحدث ويكتب بها الإماراتيون.
3. **اللهجة المصرية**: اجعل النص طبيعياً وبأسلوب محادثة يومي، مع استخدام التعبيرات الشائعة والنطق الذي يعكس اللغة المحكية في مصر.
4. **اللهجة الأردنية**: استخدم الكلمات والتعابير الشائعة في لهجة عمّان الحضرية لجعل الترجمة واضحة ومألوفة.
5. **اللهجة الفلسطينية**: ترجم باللهجة المقدسية مع استخدام تعابير وتراكيب طبيعية للحفاظ على أصالة اللهجة.
6. **اللهجة السورية**: استخدم لهجة دمشق بمفردات وتراكيب لغوية تجعل الترجمة مفهومة وطبيعية للجمهور السوري.
7. **اللهجة اللبنانية**: ترجم بلهجة شباب بيروت، مع الحفاظ على سلاسة التعبير والمرونة، وتجنب الجمل الثقيلة أو المعقدة بشكل زائد.

إذا كان هناك تعبير مشترك بين أكثر من لهجة، فحافظ على الاتساق في الترجمة. وإلا، عدّل الترجمة بحيث تعكس كل لهجة بدقة.

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
`;

//   const prompt = `
// As an expert in content writing, Arabic grammar, sentence structure, and translation, your task is to translate the given English text into multiple Arabic dialects while preserving the original meaning and full context. The translation must be natural, fluent, and culturally appropriate.

// Translate into the following dialects using these specific guidelines:

// 1. **Modern Standard Arabic (MSA)**: Maintain correct grammar and linguistic consistency while ensuring the translation is well-structured and professional.
// 2. **Emirati Arabic**: Use native Emirati vocabulary, pronunciation, and writing style to match how Emiratis naturally speak and write.
// 3. **Egyptian Arabic**: Ensure the text has a natural, daily conversational tone, using common Egyptian expressions and pronunciation that reflect real-life spoken Egyptian Arabic.
// 4. **Jordanian Arabic**: Use words and expressions commonly spoken in urban **Amman**, making the translation familiar and clear.
// 5. **Palestinian Arabic**: Follow the **Jerusalem dialect**, ensuring natural expressions and authentic structures.
// 6. **Syrian Arabic**: Adopt the **Damascus dialect**, using vocabulary and linguistic structures that feel natural to a Syrian audience.
// 7. **Lebanese Arabic**: Use the **Beirut youth dialect**, keeping the translation smooth, flexible, and easy to understand, avoiding overly complex constructions.

// If a phrase remains the same across multiple dialects, keep the translation consistent. Otherwise, adjust each translation to reflect its respective dialect accurately.

// Translate the following text:

// ${formattedTexts}

// Provide the translations in the exact format below:

// 1. **MSA**: [Translation]
//    **Emirati**: [Translation]
//    **Egyptian**: [Translation]
//    **Jordanian**: [Translation]
//    **Palestinian**: [Translation]
//    **Syrian**: [Translation]
//    **Lebanese**: [Translation]
// `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error('Invalid API response: ' + JSON.stringify(response));
    }

    console.log("✅ API Response Received");
    const translations = response.choices[0].message.content.trim().split(/\n\n+/);

    return translations.map((translationBlock, index) => {
      const lines = translationBlock.split("\n");

      if (lines.length < 7) {
        console.warn(`⚠️ Incomplete translation for item ${index + 1}, skipping.`);
        return null;
      }

      return {
        msa: lines[0]?.replace("**MSA**: ", "").trim() || "",
        emirati: lines[1]?.replace("**Emirati**: ", "").trim() || "",
        egyptian: lines[2]?.replace("**Egyptian**: ", "").trim() || "",
        jordanian: lines[3]?.replace("**Jordanian**: ", "").trim() || "",
        palestinian: lines[4]?.replace("**Palestinian**: ", "").trim() || "",
        syrian: lines[5]?.replace("**Syrian**: ", "").trim() || "",
        lebanese: lines[6]?.replace("**Lebanese**: ", "").trim() || "",
      };
    }).filter(Boolean);
  } catch (error) {
    console.error(`❌ Translation API Error:`, error.message);
    return texts.map(() => ({
      msa: "Error",
      emirati: "Error",
      egyptian: "Error",
      jordanian: "Error",
      palestinian: "Error",
      syrian: "Error",
      lebanese: "Error",
    }));
  }
};


/**
 * Handles file upload and translation
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const inputFilePath = req.file.path;
    const { headers, rows } = await readExcel(inputFilePath);

    const batchSize = 8; // Process 8 rows at a time
    let batch = [];
    let batchIndexes = [];

    for (let i = 0; i < rows.length; i++) {
      if (rows[i]['English']) {
        batch.push(rows[i]['English']);
        batchIndexes.push(i);

        if (batch.length === batchSize || i === rows.length - 1) {
          console.log(`🔹 Translating batch of ${batch.length} texts...`);
          const translations = await translateTextBatch(batch);

          batchIndexes.forEach((index, j) => {
            if (translations[j]) {
              rows[index]['MSA'] = translations[j].msa;
              rows[index]['Emirati'] = translations[j].emirati;
              rows[index]['Egyptian'] = translations[j].egyptian;
              rows[index]['Jordanian'] = translations[j].jordanian;
              rows[index]['Palestinian'] = translations[j].palestinian;
              rows[index]['Syrian'] = translations[j].syrian;
              rows[index]['Lebanese'] = translations[j].lebanese;
            }
          });

          batch = [];
          batchIndexes = [];
        }
      }
    }

    const outputFilePath = await generateExcel(headers, rows, req.file.originalname);
    res.download(outputFilePath, async (err) => {
      if (err) console.error('Error sending file:', err);
      await fs.unlink(inputFilePath);
      await fs.unlink(outputFilePath);
    });
  } catch (error) {
    console.error('❌ Error processing file:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Start server
 */
app.listen(port, async () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  await open(`http://localhost:${port}`);
});

// import ExcelJS from 'exceljs'
// import fs from 'fs/promises'
// import path from 'path'

// /**
//  * Reads an Excel file and extracts headers & data
//  */
// export const readExcel = async (filePath) => {
//   const workbook = new ExcelJS.Workbook()
//   await workbook.xlsx.readFile(filePath)
//   const worksheet = workbook.worksheets[0]

//   const headers = []
//   worksheet.getRow(1).eachCell((cell) => {
//     headers.push(cell.value)
//   })

//   const rows = []
//   worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber > 1) {
//       const rowData = {}
//       headers.forEach((header, index) => {
//         rowData[header] = row.getCell(index + 1).value
//       })
//       rows.push(rowData)
//     }
//   })

//   return { headers, rows }
// }

// /**
//  * Generates an Excel file with translations
//  */
// export const generateExcel = async (headers, rows, originalFileName) => {
//   const workbook = new ExcelJS.Workbook()
//   const worksheet = workbook.addWorksheet('Translations')

//   const translationHeaders = [
//     'English',
//     'MSA',
//     'Emirati',
//     'Egyptian',
//     'Jordanian',
//     'Palestinian',
//     'Syrian',
//     'Lebanese',
//   ]

//   // Ensure all translation headers are included
//   translationHeaders.forEach((header) => {
//     if (!headers.includes(header)) headers.push(header)
//   })

//   worksheet.addRow(headers)

//   rows.forEach((rowData) => {
//     worksheet.addRow(headers.map((header) => rowData[header] || ''))
//   })

//   // Ensure upload folder exists
//   await fs.mkdir('uploads', { recursive: true })

//   const timestamp = Date.now()
//   const safeFileName = originalFileName
//     .replace(/\.[^/.]+$/, '') // remove extension
//     .replace(/\s+/g, '_')
//     .replace(/[^a-zA-Z0-9_\-]/g, '')

//   const outputFilePath = path.join(
//     'uploads',
//     `${safeFileName}_translated_${timestamp}.xlsx`
//   )
//   await workbook.xlsx.writeFile(outputFilePath)
//   return outputFilePath
// }

import ExcelJS from 'exceljs'
import fs from 'fs/promises'
import path from 'path'

export function parseDialectResponse(text) {
  return text
    .trim()
    .split(/\n{2,}/) // split on two or more newlines
    .map((block) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '')
      const [question = '', answer = '', hint = '', reasoning = ''] = lines
      return { question, answer, hint, reasoning }
    })
}

export const readExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const worksheet = workbook.worksheets[0]
  // Extract headers from the first row
  const headers = []
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.value)
  })
  // Extract rows of data
  const rows = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip the header row
      const rowData = {}
      headers.forEach((header, index) => {
        rowData[header] = row.getCell(index + 1).value
      })
      rows.push(rowData)
    }
  })
  return { headers, rows }
}

// export const generateExcel = async (
//   headers,
//   rows,
//   originalFileName,
//   translationMode
// ) => {
//   const workbook = new ExcelJS.Workbook()
//   const worksheet = workbook.addWorksheet('Translations')
//   // Define the required translation headers per mode
//   let translationHeaders = []
//   if (translationMode === 'english_to_msa') {
//     translationHeaders = ['MSA', 'Emirati', 'Egyptian', 'Jordanian']
//   } else if (translationMode === 'msa_to_other') {
//     translationHeaders = ['Emirati', 'Egyptian', 'Jordanian']
//   }
//   // Normalize base headers (e.g., handle accidental trailing spaces)
//   const normalizedHeaders = headers.map((h) =>
//     typeof h === 'string' ? h.trim() : h
//   )
//   // Final headers = original headers (normalized) + any new translation headers
//   const finalHeaders = [
//     ...normalizedHeaders,
//     ...translationHeaders.filter((h) => !normalizedHeaders.includes(h)),
//   ]
//   worksheet.addRow(finalHeaders)
//   // Write each row
//   rows.forEach((rowData) => {
//     const row = finalHeaders.map((header) => {
//       const exactMatch = rowData[header]
//       const fallbackMatch = rowData[header + ' '] || rowData[header.trim()]
//       return exactMatch ?? fallbackMatch ?? ''
//     })
//     worksheet.addRow(row)
//   })
//   await fs.mkdir('uploads', { recursive: true })
//   const timestamp = Date.now()
//   const safeFileName = originalFileName
//     .replace(/\.[^/.]+$/, '')
//     .replace(/\s+/g, '_')
//     .replace(/[^a-zA-Z0-9_\-]/g, '')
//   const outputFilePath = path.join(
//     'uploads',
//     `${safeFileName}_translated_${timestamp}.xlsx`
//   )
//   await workbook.xlsx.writeFile(outputFilePath)
//   console.log(`Generated translated file at: ${outputFilePath}`)
//   return outputFilePath
// }

export const generateExcel = async (
  /** original headers (ignored) */ _,
  /** rows: array of objects having keys
      Question, Answer, Hint, Reasoning,
      plus e.g. MSA_Question, MSA_Answer…Emirati_Reasoning, etc.
   */ rows,
  originalFileName,
  translationMode // 'english_to_msa' | 'msa_to_other'
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Translations')

  // 1) Base columns
  const baseCols = ['Question', 'Answer', 'Hint', 'Reasoning']

  // 2) Dialects to include
  const dialects =
    translationMode === 'english_to_msa'
      ? ['MSA', 'Emirati', 'Egyptian', 'Jordanian']
      : ['Emirati', 'Egyptian', 'Jordanian']

  // 3) Build header row
  const translationCols = []
  dialects.forEach((d) => {
    baseCols.forEach((b) => translationCols.push(`${d}_${b}`))
  })
  const finalHeaders = [...baseCols, ...translationCols]
  worksheet.addRow(finalHeaders)

  // 4) Write each data row
  rows.forEach((rowData) => {
    const row = finalHeaders.map((col) => rowData[col] || '')
    worksheet.addRow(row)
  })

  // 5) Save to disk
  await fs.mkdir('uploads', { recursive: true })
  const timestamp = Date.now()
  const safeName = originalFileName
    .replace(/\.[^/.]+$/, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
  const outPath = path.join(
    'uploads',
    `${safeName}_translated_${timestamp}.xlsx`
  )
  await workbook.xlsx.writeFile(outPath)
  console.log(`Generated translated file at: ${outPath}`)
  return outPath
}

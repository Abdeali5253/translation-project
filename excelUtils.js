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


import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';

/**
 * Reads an Excel file and extracts headers & data
 */
export const readExcel = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  // Extract headers from the first row
  const headers = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.value);
  });

  // Extract rows of data
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {  // Skip the header row
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row.getCell(index + 1).value;
      });
      rows.push(rowData);
    }
  });

  return { headers, rows };
};

/**
 * Generates an Excel file with translations
 */
export const generateExcel = async (headers, rows, originalFileName, translationMode) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Translations');

  // Define the translation headers based on the translation mode
  let translationHeaders = ['English'];

  if (translationMode === 'english_to_msa') {
    translationHeaders.push('MSA');
    // Fill other columns with null values for 'english_to_msa'
    translationHeaders.push('Emirati', 'Egyptian', 'Jordanian');
  } else if (translationMode === 'msa_to_other') {
    translationHeaders = [
      'MSA',
      'Emirati',
      'Egyptian',
      'Jordanian',
    ];
  }

  // Ensure all translation headers are included in the final headers
  const finalHeaders = [...headers, ...translationHeaders.filter(header => !headers.includes(header))];

  // Add final headers to Excel
  worksheet.addRow(finalHeaders);

  // Add the rows to Excel
  rows.forEach((rowData) => {
    const row = [];

    // For "English to MSA" mode, only the "MSA" column will be populated
    if (translationMode === 'english_to_msa') {
      row.push(rowData['English'] || ''); // English column
      row.push(rowData['MSA'] || ''); // MSA column (empty if no translation)
      row.push(null); // Emirati column (empty for English to MSA)
      row.push(null); // Egyptian column (empty for English to MSA)
      row.push(null); // Jordanian column (empty for English to MSA)
    }
    // For "MSA to other dialects" mode, add translations for each dialect
    else if (translationMode === 'msa_to_other') {
      row.push(rowData['MSA'] || ''); // MSA column
      row.push(rowData['Emirati'] || ''); // Emirati translation
      row.push(rowData['Egyptian'] || ''); // Egyptian translation
      row.push(rowData['Jordanian'] || ''); // Jordanian translation
    }

    // Add the populated row to the Excel sheet
    worksheet.addRow(row);
  });

  // Ensure the upload folder exists
  await fs.mkdir('uploads', { recursive: true });

  // Generate a safe file name and output path
  const timestamp = Date.now();
  const safeFileName = originalFileName
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, ''); // Clean up file name

  const outputFilePath = path.join(
    'uploads',
    `${safeFileName}_translated_${timestamp}.xlsx`
  );

  // Write the workbook to the file
  await workbook.xlsx.writeFile(outputFilePath);

  console.log(`Generated translated file at: ${outputFilePath}`);
  return outputFilePath;
};

// import ExcelJS from 'exceljs';

// /**
//  * Reads an Excel file and extracts headers & data
//  */
// export const readExcel = async (filePath) => {
//   const workbook = new ExcelJS.Workbook();
//   await workbook.xlsx.readFile(filePath);
//   const worksheet = workbook.worksheets[0];

//   const headers = [];
//   worksheet.getRow(1).eachCell((cell) => {
//     headers.push(cell.value);
//   });

//   const rows = [];
//   worksheet.eachRow((row, rowNumber) => {
//     if (rowNumber > 1) {
//       const rowData = {};
//       headers.forEach((header, index) => {
//         rowData[header] = row.getCell(index + 1).value;
//       });
//       rows.push(rowData);
//     }
//   });

//   return { headers, rows };
// };

// /**
//  * Generates an Excel file with translations
//  */
// export const generateExcel = async (headers, rows, originalFileName) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Translations');

//   const allHeaders = [
//     'English',
//     'MSA',
//     'Emirati',
//     'Egyptian',
//     'Jordanian',
//     'Palestinian',
//     'Syrian',
//     'Lebanese',
//   ];

//   allHeaders.forEach((header) => {
//     if (!headers.includes(header)) headers.push(header);
//   });

//   worksheet.addRow(headers);
//   rows.forEach((rowData) => {
//     worksheet.addRow(headers.map((header) => rowData[header] || ''));
//   });

//   const sanitizedFileName = originalFileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
//   const outputFilePath = `uploads/${sanitizedFileName}_translated.xlsx`;

//   await workbook.xlsx.writeFile(outputFilePath);
//   return outputFilePath;
// };


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

  const headers = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.value);
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
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
export const generateExcel = async (headers, rows, originalFileName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Translations');

  const translationHeaders = [
    'English',
    'MSA',
    'Emirati',
    'Egyptian',
    'Jordanian',
    'Palestinian',
    'Syrian',
    'Lebanese',
  ];

  // Ensure all translation headers are included
  translationHeaders.forEach((header) => {
    if (!headers.includes(header)) headers.push(header);
  });

  worksheet.addRow(headers);

  rows.forEach((rowData) => {
    worksheet.addRow(headers.map((header) => rowData[header] || ''));
  });

  // Ensure upload folder exists
  await fs.mkdir('uploads', { recursive: true });

  const timestamp = Date.now();
  const safeFileName = originalFileName
    .replace(/\.[^/.]+$/, '') // remove extension
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '');

  const outputFilePath = path.join('uploads', `${safeFileName}_translated_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(outputFilePath);
  return outputFilePath;
};

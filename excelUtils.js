// import ExcelJS from 'exceljs'

// // Function to read Excel file and extract headers & data
// export const readExcel = async (filePath) => {
//   const workbook = new ExcelJS.Workbook()
//   await workbook.xlsx.readFile(filePath)
//   const worksheet = workbook.worksheets[0]

//   // Read headers
//   const headers = []
//   worksheet.getRow(1).eachCell((cell) => {
//     headers.push(cell.value)
//   })

//   // Read rows
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

// // Function to generate an Excel file with translations (keeping format)
// export const generateExcel = async (headers, rows) => {
//   const workbook = new ExcelJS.Workbook()
//   const worksheet = workbook.addWorksheet('Translations')

//   // Write headers
//   worksheet.addRow(headers)

//   // Write rows
//   rows.forEach((rowData) => {
//     worksheet.addRow(headers.map((header) => rowData[header] || ''))
//   })

//   // Save the file
//   const outputFilePath = `translated_${Date.now()}.xlsx`
//   await workbook.xlsx.writeFile(outputFilePath)

//   return outputFilePath
// }

import ExcelJS from 'exceljs';

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

  const allHeaders = [
    'English',
    'MSA',
    'Emirati',
    'Egyptian',
    'Jordanian',
    'Palestinian',
    'Syrian',
    'Lebanese',
  ];

  allHeaders.forEach((header) => {
    if (!headers.includes(header)) headers.push(header);
  });

  worksheet.addRow(headers);
  rows.forEach((rowData) => {
    worksheet.addRow(headers.map((header) => rowData[header] || ''));
  });

  const sanitizedFileName = originalFileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const outputFilePath = `uploads/${sanitizedFileName}_translated.xlsx`;

  await workbook.xlsx.writeFile(outputFilePath);
  return outputFilePath;
};

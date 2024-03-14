import { google } from 'googleapis';
const { authenticate } = require('@google-cloud/local-auth');
export async function createSpreadsheet(title: string, access_token: string) {
  const sheets = google.sheets({ version: 'v4', auth: access_token });

  try {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
      },
    });
    console.log(
      'Spreadsheet created:',
      response.data.spreadsheetId,
      '||................end..................||',
    );
    return response.data.spreadsheetId;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    //   throw error; // Re-throw for handling in your application
  }
}

// Function to read spreadsheet values from a sheet
export async function readSheetValues(
  spreadsheetId: string,
  sheetName: string,
  access_token: string,
) {
  console.log('access_token:', access_token);
  console.log('sheetName:', sheetName);
  console.log('spreadsheetId:', spreadsheetId);

  const sheets = google.sheets({ version: 'v4', auth: access_token });
  console.log('sheets', sheets, '||................end..................||');
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`, // Adjust range as needed
    });

    console.log('Sheet values:', response?.data?.values);
    return response?.data?.values;
  } catch (error) {
    console.error('Error reading sheet values:', error);
    //   throw error; // Re-throw for handling in your application
  }
}

// Function to update spreadsheet values (replace existing values)
// export async function updateSheetValues(spreadsheetId:string, sheetName:"", values:any,access_token:string) {
//     const sheets = google.sheets({ version: "v4", auth: access_token });

//     const body = {
//       values,
//     };

//     try {
//       const response = await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         valueInputOption: "USER_ENTERED", // Adjust as needed
//         range: `${sheetName}!A1:B2`, // Adjust range for your data
//         resource: body,
//       });

//       console.log("Sheet values updated:", response.data.updatedCells);
//     } catch (error) {
//       console.error("Error updating sheet values:", error);
//     //   throw error; // Re-throw for handling in your application
//     }
//   }

import axios from 'axios';

export async function createSpreadsheet(title: string, access_token: string) {
  // const sheets = google.sheets({ version: 'v4', auth: access_token });
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method'];
  const data = [
    ['2024-03-18', 'Lunch', 'Food', '10.00', 'Cash'],
    ['2024-03-18', 'Coffee', 'Beverage', '5.00', 'Card'],
  ];
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const asiosData = {
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: 'Daily Expenses', // Sheet title
          },
          data: [
            // Row 1 (headers)
            headers.map((header) => ({ userEnteredValue: { stringValue: header } })),
            // Row 2 (data)
            ...data.map((row) =>
              row.map((value) => ({ userEnteredValue: { stringValue: value } })),
            ),
          ],
        },
      ],
    };

    const axiosCOnfig = {
      method: 'post',
      url: url,
      headers: {
        Authorization: 'Bearer ' + access_token,
        Accept: 'application/json',
      },
      asiosData,
    };
    const response = await axios(axiosCOnfig);
    return response.data;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    //   throw error; // Re-throw for handling in your application
  }
}

// Function to read spreadsheet values from a sheet
export async function readSheetValues(
  spreadsheetId: string,
  access_token: string,
  range: string,
  sheetName?: string,
) {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    const axiosCOnfig = {
      method: 'get',
      url: url,
      headers: {
        Authorization: 'Bearer ' + access_token,
        Accept: 'application/json',
      },
      params: {
        ranges: range,
      },
    };
    const res = await axios(axiosCOnfig);
    console.log('res-->', res.data);
    return res.data && res;
  } catch (err) {
    console.log('problem exios call readSheetValues:-----', err);
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

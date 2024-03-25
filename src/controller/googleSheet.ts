import axios from 'axios';

export async function createSpreadsheet(title: string, access_token: string) {
  // const sheets = google.sheets({ version: 'v4', auth: access_token });
  // const rowHeaders = ['Date', 'Description', 'Category', 'Amount', 'Payment Method'];
  // const dataSet = [
  //   ['2024-03-18', 'Lunch', 'Food', '10.00', 'Cash'],
  //   ['2024-03-18', 'Coffee', 'Beverage', '5.00', 'Card'],
  // ];
  console.log('access_token--------->', access_token);
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const asiosData = {
      properties: {
        title: 'latest_sheet-1',
      },
      sheets: [
        {
          properties: {
            title: 'xyz', // Sheet title
          },
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
      data: asiosData,
    };
    const response = await axios(axiosCOnfig);
    return response.data;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    //   throw error; // Re-throw for handling in your application
  }
}
export async function editSpreadsheet(spreadsheetId: string, access_token: string) {
  try {
    const requests = [
      // Request to set header row text, freeze the first row, and format background color
      {
        updateSheetProperties: {
          // create new colorful sheet name with 1000 rows and fix 1st row
          properties: {
            sheetId: 237728141,
            index: 1,
            title: 'marge-table-1',
            gridProperties: {
              rowCount: 1000,
              columnCount: 100,
              frozenRowCount: 2,
            },
            tabColor: {
              red: 1,
              green: 1,
            },
          },
          fields: '*',
        },

        mergeCells: {
          //MARGE CELLS
          range: {
            sheetId: 237728141,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          mergeType: 'MERGE_ALL',
        },

        addConditionalFormatRule: {
          // contidion sheet to coloring background
          rule: {
            ranges: [
              {
                sheetId: 237728141,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 5,
              },
            ],
            booleanRule: {
              condition: {
                type: 'CUSTOM_FORMULA',
                values: [
                  {
                    userEnteredValue: '=A1>5',
                  },
                ],
              },
              format: {
                backgroundColor: {
                  red: 1,
                  green: 0.5,
                  blue: 0,
                },
              },
            },
          },
        },

        updateCells: {
          // update name
          range: {
            sheetId: 237728141,
            startRowIndex: 0,
            // endRowIndex: ,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          rows: [
            {
              values: [
                {
                  userEnteredValue: { stringValue: 'expoenses claculator jbalal' },
                  textFormatRuns: {
                    startIndex: 0,
                    format: {
                      fontFamily: 'sans-serif',
                      fontSize: 20,
                      bold: true,
                      italic: true,
                      underline: true,
                    },
                  },
                  userEnteredFormat: {
                    horizontalAlignment: 'CENTER',
                  },
                },
              ],
            },
          ],
          fields: '*',
        },
      },
    ];

    const batchUpdateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const batchUpdateConfig = {
      method: 'post',
      url: batchUpdateUrl,
      headers: {
        Authorization: 'Bearer ' + access_token,
        Accept: 'application/json',
      },
      data: {
        requests,
      },
    };

    const updateResponse = await axios(batchUpdateConfig);
    console.log('updateResponse---------', updateResponse);
    if (updateResponse.status === 200) {
      console.log('Sheet formatting updated successfully!');
      return updateResponse;
    } else {
      console.error('Error updating sheet formatting--:', updateResponse);
    }
  } catch (error) {
    console.error('Error updating sheet formatting:', error);
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
    console.log('res of readsheetvalues-->', res.data);
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

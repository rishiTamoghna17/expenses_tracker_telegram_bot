import axios from 'axios';

export async function createSpreadsheet(req: any) {
  const { title, access_token, sheetTitle } = req as {
    title: string;
    access_token: string;
    sheetTitle: string;
  };
  // const sheets = google.sheets({ version: 'v4', auth: access_token });
  // const rowHeaders = ['Date', 'Description', 'Category', 'Amount', 'Payment Method'];
  // const dataSet = [
  //   ['2024-03-18', 'Lunch', 'Food', '10.00', 'Cash'],
  //   ['2024-03-18', 'Coffee', 'Beverage', '5.00', 'Card'],
  // ];
  // console.log('access_token--------->', access_token);
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const asiosData = {
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: sheetTitle, // Sheet title
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
export async function editSpreadsheet(
  spreadsheetId: string,
  access_token: string,
  sheetId: number,
  sheetTitle: string,
) {
  try {
    const requestsForUpdateSheetProperties = [
      // Request to set header row text, freeze the first row, and format background color
      {
        updateSheetProperties: {
          // create new colorful sheet name with 1000 rows and fix 1st row
          properties: {
            sheetId: sheetId,
            index: 1,
            title: sheetTitle,
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
      },
    ];
    const requestsFormergeCells = [
      // Request to set header row text, freeze the first row, and format background color
      {
        mergeCells: {
          //MARGE CELLS
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          mergeType: 'MERGE_ALL',
        },
      },
    ];

    const requestsForAddConditionalFormatRule = [
      // Request to set header row text, freeze the first row, and format background color
      {
        addConditionalFormatRule: {
          // contidion sheet to coloring background
          rule: {
            ranges: [
              {
                sheetId: sheetId,
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
      },
    ];

    const requestsForUpdateCells = [
      // Request to set header row text, freeze the first row, and format background color
      {
        updateCells: {
          // update name
          range: {
            sheetId: sheetId,
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
    await batchUpdate(spreadsheetId, access_token, requestsForUpdateSheetProperties);
    await batchUpdate(spreadsheetId, access_token, requestsFormergeCells);
    await batchUpdate(spreadsheetId, access_token, requestsForAddConditionalFormatRule);
    await batchUpdate(spreadsheetId, access_token, requestsForUpdateCells);
  } catch (error) {
    console.error('Error updating sheet formatting:', error);
  }
}
export const batchUpdate = async (spreadsheetId: string, access_token: string, requests: any) => {
  try {
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
    if (updateResponse.status === 200) {
      console.log('Sheet formatting updated successfully!');
      return updateResponse;
    } else {
      console.error('Error updating sheet formatting--:', updateResponse);
    }
  } catch (error) {
    console.error('Error updating sheet formatting:', error);
  }
};
// Function to read spreadsheet values from a sheet
export async function readSheetValues(spreadsheetId: string, access_token: string, range: string) {
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

export const appendRow = async (req: any) => {
  try {
    const { accessToken, spreadsheetId, range, values } = req as {
      spreadsheetId: string;
      accessToken: string;
      sheetId: number;
      range: string;
      values: string[];
    };

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const appendConfig = {
      method: 'post',
      url: appendUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        Accept: 'application/json',
      },
      data: {
        values: values,
      },
    };

    const response = await axios(appendConfig);
    console.log('Row appended successfully:', response.data);

    return response.data;
  } catch (err) {
    console.error('Error appending row to sheet:', err);
    throw err; // Rethrow the error to handle it outside of this function if needed
  }
};

export const getAllSheetIds = async (spreadsheetId: string, accessToken: string) => {
  try {
    const sheetsInfoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

    const sheetsInfoConfig = {
      method: 'get',
      url: sheetsInfoUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        Accept: 'application/json',
      },
    };

    const response = await axios(sheetsInfoConfig);
    const sheets = response.data.sheets;

    const sheetIds: number[] = sheets.map((sheet: any) => sheet.properties.sheetId);

    return sheetIds;
  } catch (err) {
    console.error('Error fetching sheet IDs:', err);
    throw err;
  }
};
export const getLatestSheetId = async (spreadsheetId: string, accessToken: string) => {
  try {
    const sheetIds = await getAllSheetIds(spreadsheetId, accessToken);
    const latestSheetId = sheetIds[sheetIds.length - 1];
    return latestSheetId;
  } catch (err) {
    console.error('Error fetching latest sheet IDs:', err);
  }
};

export const getSheetName = async (spreadsheetId: string, accessToken: string, sheetId: number) => {
  try {
    const sheetInfoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties&ranges=sheet${sheetId}`;

    const sheetInfoConfig = {
      method: 'get',
      url: sheetInfoUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        Accept: 'application/json',
      },
    };

    const response = await axios(sheetInfoConfig);
    console.log('response---->>', response);
    const sheetProperties = response.data.sheets[0].properties;
    const sheetName = sheetProperties.title;

    console.log('Sheet Name:', sheetName);

    return sheetName;
  } catch (err) {
    console.error('Error fetching sheet name:', err);
    throw err;
  }
};

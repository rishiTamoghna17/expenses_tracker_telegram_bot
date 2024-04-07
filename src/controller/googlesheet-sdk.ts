import { google, sheets_v4 } from 'googleapis';

export const getFromSheetsUingGoogleSdk = (req: any) => {
  try {
    const { auth, spreadsheetId, range } = req;
    return new Promise((success, failed) => {
      const sheets = google.sheets({ version: 'v4', auth });

      sheets.spreadsheets.values.get(
        {
          spreadsheetId: spreadsheetId,
          range: range,
        },
        (err: any, res: any) => {
          if (err) {
            return failed(err);
          }
          const rows = res.data.values;
          if (!rows) success(null);
          success(rows);
        },
      );
    });
  } catch (err) {
    console.log(' error in getFromSheetsUinggGoogleSdk', err);
  }
};

export const editSpreadsheetUingGoogleSdk = (req: any) => {
  const { spreadSheetId, accessTokn, sheetId } = req as {
    spreadSheetId: string;
    accessTokn: any;
    sheetId: number;
  };
  try {
    const sheets = google.sheets({ version: 'v4', auth: accessTokn });
    // Define the requests to make the desired changes
    const requests: sheets_v4.Schema$Request[] = [
      // Freeze the first two rows
      {
        updateSheetProperties: {
          properties: {
            sheetId: sheetId,
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
      },
      // Merge the first 6 cells of the first row
      // {
      //   mergeCells: {
      //     range: {
      //       sheetId: sheetId, // Assuming you are editing the first sheet, if not change the sheetId accordingly
      //       startRowIndex: 0,
      //       endRowIndex: 1,
      //       startColumnIndex: 0,
      //       endColumnIndex: 6,
      //     },
      //     mergeType: 'MERGE_ALL',
      //   },
      // },
      // // Set background color to yellow and center align text for the merged cells
      // {
      //   repeatCell: {
      //     range: {
      //       sheetId: sheetId, // Assuming you are editing the first sheet, if not change the sheetId accordingly
      //       startRowIndex: 0,
      //       endRowIndex: 1,
      //       startColumnIndex: 0,
      //       endColumnIndex: 6,
      //     },
      //     cell: {
      //       userEnteredFormat: {
      //         backgroundColor: { red: 1, green: 1, blue: 0 }, // Yellow color
      //         horizontalAlignment: 'CENTER',
      //       },
      //     },
      //     fields: 'userEnteredFormat(backgroundColor,horizontalAlignment)',
      //   },
      // },
      // // Set the text "daily expenses" to the merged cells
      // {
      //   pasteData: {
      //     data: `daily expenses`,
      //     type: 'PASTE_NORMAL',
      //     coordinate: {
      //       sheetId: sheetId, // Assuming you are editing the first sheet, if not change the sheetId accordingly
      //       rowIndex: 0,
      //       columnIndex: 0,
      //     },
      //   },
      // },
    ];

    // Execute the batch update
    const response = sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadSheetId,
      requestBody: { requests: requests },
    });

    console.log('Sheet updated successfully:', response);
    return (response as any)?.data;
  } catch (err) {
    console.error('Error editing sheet:', err);
    throw err;
  }
};

export const rowEntry = async (req: any) => {
  try {
    const { accessTokn, spreadSheetId, range } = req as {
      spreadSheetId: string;
      accessTokn: any;
      range: string;
    };
    const sheets = google.sheets({ version: 'v4', auth: accessTokn });
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadSheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['date', 'description', 'amount']],
      },
    });
    console.log('row entry', response.data);
    return response.data;
  } catch (err) {
    console.error('Error editing rowentry sheet:', err);
  }
};

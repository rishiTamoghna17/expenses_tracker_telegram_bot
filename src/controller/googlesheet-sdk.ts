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
    console.log('checl-----------1', sheets, 'end------------------------||');
    // Define the requests to make the desired changes
    const requests: sheets_v4.Schema$Request[] = [
      // Freeze the first two rows
      {
        updateSheetProperties: {
          properties: {
            sheetId: sheetId, // Assuming you are editing the first sheet, if not change the sheetId accordingly
            gridProperties: { frozenRowCount: 2 },
          },
          fields: 'gridProperties.frozenRowCount',
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

    console.log('Sheet updated successfully:', (response as any)?.data);
    return (response as any)?.data;
  } catch (err) {
    console.error('Error editing sheet:', err);
    throw err;
  }
};

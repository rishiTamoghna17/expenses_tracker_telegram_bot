import { google } from 'googleapis';

export const getFromSheetsUinggGoogleSdk = (req: any) => {
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

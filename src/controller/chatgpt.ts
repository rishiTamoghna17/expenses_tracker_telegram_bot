// import * as express from 'express';
// import * as fs from 'fs/promises'; // Using promises for async/await
// import * as path from 'path';
// import { authenticate } from '@google-cloud/local-auth';
// import { google } from 'googleapis';
// import { googleCredential } from '../config';

// // import { google } from 'googleapis';

// // Define interface for Google OAuth2 client credentials
// interface Credentials {
//   type: string;
//   client_id: string;
//   client_secret: string;
//   refresh_token: string;
// }

// // Constants
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// const TOKEN_PATH = path.join("../", 'token.json');
// const CREDENTIALS_PATH = path.join("../", 'credentials.json';
// console.log("CREDENTIALS_PATH------------->",CREDENTIALS_PATH)
// console.log("TOKEN_PATH------------->",TOKEN_PATH)

// // Function to load saved credentials
// async function loadSavedCredentialsIfExist() {
//   try {
//     const content = await fs.readFile(TOKEN_PATH);
//     const credentials: Credentials = JSON.parse(content as any);
//     return google.auth.fromJSON(credentials);
//   } catch (err) {
//     return null;
//   }
// }
// type OAuth2Client = any;
// // Function to save credentials
// async function saveCredentials(client: OAuth2Client) {
//   const payload: Credentials = {
//     type: 'authorized_user',
//     client_id: googleCredential.web.client_id,
//     client_secret: googleCredential.client_secret,
//     refresh_token: client.credentials.refresh_token,
//   };
//   await fs.writeFile(TOKEN_PATH, JSON.stringify(payload));
// }

// // Function to authorize
// // async function authorize(): Promise<OAuth2Client> {
// //   try {
// //     let client = await loadSavedCredentialsIfExist();
// //     console.log('client--------first------->>', client);

// //     if (client) {
// //       return client;
// //     }

// //     client =
// //       client &&
// //       (await authenticate({
// //         scopes: SCOPES,
// //         keyfilePath: CREDENTIALS_PATH,
// //       }));
// //     console.log('client--------------->>', client);
// //     if (client && (client as any)?.credentials) {
// //       await saveCredentials(client);
// //     }

// //     return client;
// //   } catch (err) {
// //     console.log('authorize errorr--------------->', err);
// //   }
// // }

// // Function to list majors (remains same)

// async function listMajors(auth: OAuth2Client) {
//   const sheets = google.sheets({ version: 'v4', auth });
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
//     range: 'Class Data!A2:E',
//   });
//   const rows = res.data.values;
//   if (!rows || rows.length === 0) {
//     console.log('No data found.');
//     return;
//   }
//   console.log('Name, Major:');
//   rows.forEach((row) => {
//     // Print columns A and E, which correspond to indices 0 and 4.
//     console.log(`${row[0]}, ${row[4]}`);
//   });
// }
// authorize().then(listMajors).catch(console.error);

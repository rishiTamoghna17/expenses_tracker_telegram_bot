"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSheetValues = exports.createSpreadsheet = void 0;
const googleapis_1 = require("googleapis");
function createSpreadsheet(title, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        const sheets = googleapis_1.google.sheets({ version: "v4", auth: access_token });
        try {
            const response = yield sheets.spreadsheets.create({
                resource: {
                    properties: { title },
                },
            });
            console.log("Spreadsheet created:", response.data.spreadsheetId);
            return response.data.spreadsheetId;
        }
        catch (error) {
            console.error("Error creating spreadsheet:", error);
            //   throw error; // Re-throw for handling in your application
        }
    });
}
exports.createSpreadsheet = createSpreadsheet;
// Function to read spreadsheet values from a sheet
function readSheetValues(spreadsheetId, sheetName, access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const sheets = googleapis_1.google.sheets({ version: "v4", auth: access_token });
        console.log("sheets", sheets);
        try {
            const response = yield sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:Z`, // Adjust range as needed
            });
            console.log("Sheet values:", (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.values);
            return (_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.values;
        }
        catch (error) {
            console.error("Error reading sheet values:", error);
            //   throw error; // Re-throw for handling in your application
        }
    });
}
exports.readSheetValues = readSheetValues;
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

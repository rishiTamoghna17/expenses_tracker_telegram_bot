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
exports.handler = void 0;
const google_auth_1 = require("../lib/google_auth");
const bot_1 = require("./bot");
const googleSheet_1 = require("./googleSheet");
const handler = (req, method) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (method === "GET") {
            if (req.url === "/test") {
                const data = yield (0, google_auth_1.getNewUrl)();
                const parseUrl = (_a = data.config.url) === null || _a === void 0 ? void 0 : _a.replace(/\s/g, "");
                return parseUrl;
            }
            if (req.url.indexOf("/gtoken") > -1) {
                const data = req.query;
                const refreshtoken = yield (0, google_auth_1.getNewRefreshToken)(data.code);
                const refresh_token = refreshtoken.data.refresh_token;
                return refresh_token;
            }
            if (req.url === "/get-access-token") {
                const refreshtoken = "1//0gvQzJN4cPnYJCgYIARAAGBASNwF-L9IrFz28PneEjt511BWjpZ1xwdwpDN-UhSUODUha4IpE5CcEHu2jOiTUSchWhsJjVwOwWTc";
                const accessTokenData = yield (0, google_auth_1.getAccessTOken)(refreshtoken);
                return accessTokenData.data;
            }
            if (req.url === "/speadsheet") {
                const access_token = "ya29.a0Ad52N3-qHQezvRJEdULnJatN5oPzUzxmyfliD1bWO2xSJQidmUzR3o5QIP6-LAJMCiOxCScb3viopGNCGhOr-bDfU8u2KdZhUtpZzyJ6jAOGvcWytzS8w4EOjOx0vscUYbirLKiP9-aUaB1eUXcabsgbPl3rWyzoJRB3aCgYKAZsSARISFQHGX2MiWEvuO2H0AJQgmDwAY66mHg0171";
                const spreadsheetId = "15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM";
                const sheetName = "Track Daily Expenses";
                const data = yield (0, googleSheet_1.readSheetValues)(spreadsheetId, sheetName, access_token);
                console.log("readSheetValues---------->", JSON.stringify(data, null, 2));
                return JSON.stringify(data, null, 2);
            }
            return "unknown get";
        }
        const body = req.body;
        if (body) {
            const messageObject = body.message;
            yield (0, bot_1.handleMessage)(messageObject);
        }
        return;
    }
    catch (error) {
        console.error("Error message from handler function:", error);
    }
});
exports.handler = handler;

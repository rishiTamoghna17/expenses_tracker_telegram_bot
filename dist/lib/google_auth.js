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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessTOken = exports.getNewRefreshToken = exports.getNewUrl = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const getNewUrl = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?
   client_id=${config_1.googleCredential.web.client_id}&
   redirect_uri=${config_1.googleCredential.web.redirect_uris[0]}&
   access_type=offline&
   response_type=code&
   scope=https://www.googleapis.com/auth/spreadsheets&
   state=new_access_token&
   include_granted_scopes=true&
   prompt=consent
   `;
    return yield axios_1.default.get(url);
});
exports.getNewUrl = getNewUrl;
const getNewRefreshToken = (code) => __awaiter(void 0, void 0, void 0, function* () {
    let data = {
        client_id: config_1.googleCredential.web.client_id,
        client_secret: config_1.googleCredential.web.client_secret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config_1.googleCredential.web.redirect_uris[0],
    };
    const axiosCOnfig = {
        method: "post",
        url: "https://oauth2.googleapis.com/token",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        params: data,
    };
    return yield (0, axios_1.default)(axiosCOnfig);
});
exports.getNewRefreshToken = getNewRefreshToken;
const getAccessTOken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        client_id: config_1.googleCredential.web.client_id,
        client_secret: config_1.googleCredential.web.client_secret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    };
    const axiosCOnfig = {
        method: "post",
        url: "https://oauth2.googleapis.com/token",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        params: params,
    };
    return yield (0, axios_1.default)(axiosCOnfig);
});
exports.getAccessTOken = getAccessTOken;

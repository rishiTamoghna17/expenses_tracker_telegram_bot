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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const controller_1 = require("./controller");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.get("*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send(yield (0, controller_1.handler)(req, "GET"));
    // res.send("Welcome to Expense Tracker App");
}));
app.post("*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.body);
    return res.send(yield (0, controller_1.handler)(req, "POST"));
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
// https://0578-203-109-79-185.ngrok-free.app 
// htts://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}

import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { handler } from './controller';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.get('*', async (req: Request, res: Response) => {
  return res.send(await handler(req, 'GET'));

  // res.send("Welcome to Expense Tracker App");
});
app.post('*', async (req: Request, res: Response) => {
  // console.log(req.body);
  return res.send(await handler(req, 'POST'));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// https://0578-203-109-79-185.ngrok-free.app
// htts://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}
// https://api.telegram.org/bot6731596487:AAEeJ-4ns15KTl-fh6dj-U9JFfP7vQluyOE/setWebhook?url=https://c0cb-175-100-133-62.ngrok-free.app


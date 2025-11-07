import express, { Response, Request } from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "App Home!!" });
});

app.get("/app", (req: Request, res: Response) => {
  res.json({ message: "My App!!" });
});

app.get("/v2", (req: Request, res: Response) => {
  res.json({ message: "My Api!!" });
});

app.get("/ses", (req: Request, res: Response) => {
  res.json({ message: "SES Mail!!" });
});

app.get("**", (req: Request, res: Response) => {
  res.json({ success: false, message: "Route NOT found", url: req.url });
});

export const App = app;

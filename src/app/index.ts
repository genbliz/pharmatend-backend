import { envConfig } from "./config/env.js";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ApiRoutesResolver } from "./routes/main.js";
import { StatusCode } from "./helper/status-code.js";
import { BaseRoutesResolver } from "./routes/base.js";

const app = express();

// --------------------------------------------------------
const isDevelpment = () => {
  return envConfig.NODE_ENV !== "production";
};

// Services Setup
// --------------------------------------------------------

if (isDevelpment()) {
  app.use(morgan("dev"));
  app.set("debug", true);
}

//  --------------------------------------------------------

app.use(compression());

// http headers configuration...
// --------------------------------------------------------
app.use(cors());
if (!isDevelpment()) {
  app.use(helmet());
}

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  }),
);
app.use(express.json({ limit: "20mb" }));

// - LOGS FOR DEVELOPMENT
// --------------------------------------------------------
if (isDevelpment()) {
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.log("============================================");
    console.log("METHOD: %s;", req.method);
    console.log("url: %s", req.url);
    console.log("path: %s", req.path);
    console.log("HOSTNAME: %s", req.hostname);
    console.log("baseUrl: %s", req.baseUrl);
    console.log("route: %s", req.route);
    console.log("originalUrl: %s", req.originalUrl);
    console.log("secure: %s", req.secure);
    console.log("httpVersion: %s", req.httpVersion);
    console.log("subdomains: %s", req.subdomains);
    console.log("NODE ENV: %s", envConfig.NODE_ENV);
    console.log("------");
    next();
  });
}

app.use("/v1", ApiRoutesResolver);
app.use("/", BaseRoutesResolver);

// WHEN ROUTE IS NOT FOUND
// --------------------------------------------------------
app.use((req, res, next) => {
  res.status(StatusCode.NotFound_404).send({
    data: null,
    message: `Route '${req.path}', NOT found...`,
    success: false,
    currentInfo: {
      baseUrl: req.baseUrl,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      method: req.method,
    },
  });
});

export default app;

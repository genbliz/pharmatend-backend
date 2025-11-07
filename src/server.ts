import { envConfig } from "@/config/env.js";
import http from "http";
import App from "./app.js";
import { LoggingService } from "@/services/logging-service.js";

// set App process variables
// --------------------------------------------------------

const port = envConfig.APP_PORT;

// Create Server
// --------------------------------------------------------
const server = http.createServer(App);

process.on("unhandledRejection", (reason, promise) => {
  console.log("@process unhandledRejection");
  console.log("Reason:", reason);
  console.log("Promise", promise);
});

if (envConfig.NODE_ENV !== "production") {
  process.on("warning", (warning) => {
    console.log("@process warning");
    console.log(warning.name);
    console.log(warning.stack);
    console.log(warning.message);
  });
}

// handle errors
server.on("error", (error: any) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      LoggingService.error(`${port} requires elevated privileges`);
      // processExitManager(errMsg01);
      break;
    case "EADDRINUSE":
      LoggingService.error(`${port} is already in use`);
      // processExitManager(errMsg02);
      break;
    default:
      throw error;
  }
});

// listen (start the app)
// --------------------------------------------------------
server.listen(port, () => {
  LoggingService.info(`app listening on port ${port}`);
});

import { envConfig } from "@/config/env.js";
import http from "http";
import App from "./app.js";
import { LoggingService } from "@/services/logging-service.js";
const port = envConfig.APP_PORT;
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
server.on("error", (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            LoggingService.error(`${port} requires elevated privileges`);
            break;
        case "EADDRINUSE":
            LoggingService.error(`${port} is already in use`);
            break;
        default:
            throw error;
    }
});
server.listen(port, () => {
    LoggingService.info(`app listening on port ${port}`);
});
//# sourceMappingURL=server.js.map
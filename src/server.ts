import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { handlerReqRes } from "./controllers/parseRequest";

export function getWorkerServer(): Promise<
  Server<typeof IncomingMessage, typeof ServerResponse>
> {
  return new Promise((resolve) => {
    const server = createServer(handlerReqRes);
    resolve(server);
  });
}

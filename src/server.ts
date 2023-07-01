import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { db } from "./index";
import { User } from "./utils/types";
import { handlerReqRes } from "./controllers/parseRequest";

export function getWorkerServer(
  port: number
): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> {
  return new Promise((resolve) => {
    const server = createServer(handlerReqRes);
    resolve(server);
  });
}

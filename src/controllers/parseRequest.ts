import { db } from "../";
import { User } from "src/utils/types";
import { IncomingMessage, ServerResponse } from "http";
import { createUser, getAllUsers } from "./controller";

export function handlerReqRes(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) {
  const arrayChunks: Array<Buffer> = [];

  function parseRequest(body: User) {
    switch (req.url) {
      case "/api/users":
        switch (req.method) {
          case "GET":
            try {
              getAllUsers();
            } catch (error) {
              console.log(error);
            }
            break;
          case "POST":
            createUser(body);
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
  }

  req.on("data", (chunk: Buffer) => {
    arrayChunks.push(chunk);
  });

  req.on("end", () => {
    const body = JSON.parse(Buffer.concat(arrayChunks).toString());
    parseRequest(body);
  });

  db.on("data", (msg) => {
    const parsedMsg = JSON.parse(msg.toString());
    const { statusCode } = parsedMsg;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(parsedMsg.message));
  });

  db.on("error", (err) => {
    res.statusCode = 500;
    res.end("Internal server error");
  });
}

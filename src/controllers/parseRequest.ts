import { db } from "../";
import { User } from "src/utils/types";
import { IncomingMessage, ServerResponse } from "http";
import {
  createUser,
  getAllUsers,
  getUserById,
  removeUser,
  updateUser,
} from "./controller";

export function handlerReqRes(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
  }
) {
  const arrayChunks: Array<Buffer> = [];

  function parseRequest(body: User) {
    const { url, method } = req;

    switch (url) {
      case "/api/users":
        switch (method) {
          case "GET":
            getAllUsers();
            break;
          case "POST":
            createUser(body);
            break;

          default:
            res.statusCode = 404;
            res.end("Page not found");
            break;
        }
        break;
      case String(url?.match(/^\/api\/users\/[a-z0-9-]+/gm)):
        const startIndexOfId = url.lastIndexOf("/");
        const id = url.substring(startIndexOfId + 1);
        switch (method) {
          case "GET":
            getUserById(id);
            break;
          case "PUT":
            updateUser(body, id);
            break;
          case "DELETE":
            removeUser(id);
            break;

          default:
            res.statusCode = 404;
            res.end("Page not found");
            break;
        }

        break;

      default:
        res.statusCode = 404;
        res.end("Page not found");
        break;
    }
  }

  req.on("data", (chunk: Buffer) => {
    arrayChunks.push(chunk);
  });

  req.on("end", () => {
    const body =
      arrayChunks.length && JSON.parse(Buffer.concat(arrayChunks).toString());
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

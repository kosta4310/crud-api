import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { db } from "./index";
import { User } from "./utils/types";

export function getWorkerServer(
  port: number
): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> {
  return new Promise((resolve) => {
    const server = createServer(
      handlerReqRes
      //   (req, res) => {
      //   db.write(
      //     JSON.stringify({
      //       method: "insert",
      //       payload: { username: "pete", age: 25, hobbies: [] },
      //     })
      //   );

      //   db.on("data", (msg) => {
      //     console.log(msg.toString());
      //     res.end(`Hello from PORT ${port} and msg ${msg}`);
      //   });
      // }
    );
    resolve(server);
  });
}

function handlerReqRes(
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
            db.write(JSON.stringify({ method: "find" }));
            break;
          case "POST":
            db.write(JSON.stringify({ method: "insert", payload: body }));
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
    console.log(msg.toString());
    res.end(`${msg}`);
  });
}

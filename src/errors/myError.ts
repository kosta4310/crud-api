import { httpStatusCodes as code } from "../utils/httpStatusCodes";

export class MyError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class Error400 extends MyError {
  constructor(message: string) {
    super(message, code.BAD_REQUEST);
  }
}

export class Error404 extends MyError {
  constructor(message: string) {
    super(message, code.NOT_FOUND);
  }
}

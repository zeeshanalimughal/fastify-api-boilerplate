import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
  constructor(response: string | object = "Bad request") {
    super(response, 400);
  }
}

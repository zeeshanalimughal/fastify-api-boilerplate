import { HttpException } from "./HttpException";

export class ForbiddenException extends HttpException {
  constructor(response: string | object = "Forbidden") {
    super(response, 403);
  }
}

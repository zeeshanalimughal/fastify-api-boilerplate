import { HttpException } from "./HttpException";

export class NotFoundException extends HttpException {
  constructor(response: string | object = "Resource not found") {
    super(response, 404);
  }
}

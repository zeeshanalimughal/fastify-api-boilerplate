import { HttpException } from "./HttpException";

export class UnauthorizedException extends HttpException {
  constructor(response: string | object = "Unauthorized") {
    super(response, 401);
  }
}

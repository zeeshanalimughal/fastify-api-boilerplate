import { HttpException } from "./HttpException";

/**
 * @deprecated Use HttpException and its subclasses instead.
 */
export class BaseException extends HttpException {
  constructor(response: string | object, status: number) {
    super(response, status);
  }
}

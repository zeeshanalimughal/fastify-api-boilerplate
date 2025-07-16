export class HttpException extends Error {
  public status: number;
  public response: string | object;

  constructor(response: string | object, status: number) {
    super(typeof response === "string" ? response : JSON.stringify(response));
    this.status = status;
    this.response = response;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

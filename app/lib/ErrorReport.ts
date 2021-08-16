export class ErrorReport extends Error implements Error {
  // tslint:disable:variable-name
  private readonly _httpStatus: number;
  private readonly _code: string;
  private readonly _message: string;
  private readonly _details: any[];

  constructor(httpStatus: number, code: string, message: string, details: any[] = []) {
    super(message);
    this.name = this.constructor.name;

    this._httpStatus = httpStatus;
    this._code = code;
    this._message = message;
    this._details = details;
  }

  public get code(): string {
    return this._code;
  }

  public get message(): string {
    return this._message;
  }

  public get httpStatus(): number {
    return this._httpStatus;
  }

  public get body(): object {
    return {code: this._code, message: this._message, details: this._details};
  }

  public withDetails(details: any[]): ErrorReport {
    return new ErrorReport(this._httpStatus, this._code, this._message, details);
  }
}

export const INTERNAL_SERVER_ERROR = new ErrorReport(500, "10.5", "Internal server error.");
export const BAD_REQUEST = new ErrorReport(400, "10.4", "Bad request.");
export const FORBIDDEN = new ErrorReport(403, "10.3", "Forbidden.");
export const RABBIT_MQ_NOT_AVAILABLE = new ErrorReport(500, "10.05.01", "Rabbit mq unavailable");
export const ENTITY_DOES_NOT_EXIST = new ErrorReport(404, "10.20.01", "Resource with specified id not found");
export const OPEN_AI_FAILURE = new ErrorReport(500, "10.10.01", "Open ai failed to return a result.");

import { HttpException, HttpStatus } from "@nestjs/common";

export class QuotaExceededError extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: "QUOTA_EXCEEDED",
        message: "No free messages or subscription quota remaining",
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

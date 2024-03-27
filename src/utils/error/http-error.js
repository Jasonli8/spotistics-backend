class HttpError extends Error {
    constructor(httpCode, message, errorCode) {
      super(message);
      this.internalCode = errorCode;
      this.httpCode = httpCode;
    }
  }
  
  module.exports = HttpError;
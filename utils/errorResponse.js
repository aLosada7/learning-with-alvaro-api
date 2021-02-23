class ErrorResponse extends Error {
    constructor(message, statusCode, detail) {
        super(message);
        this.statusCode = statusCode;
        this.detail = detail; // {}
    }
}

module.exports = ErrorResponse;
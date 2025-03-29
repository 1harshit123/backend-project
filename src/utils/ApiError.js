class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        error = [],  // ✅ Corrected variable name
        stack = ""    // ✅ Fixed typo (was "statck")
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = error;  // ✅ Now using the correct parameter name

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;

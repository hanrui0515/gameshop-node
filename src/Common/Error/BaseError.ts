abstract class BaseError extends Error {
    protected constructor(message?: string) {
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default BaseError;

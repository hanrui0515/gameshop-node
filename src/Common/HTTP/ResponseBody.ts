class ResponseBody {

    private constructor(
        public status: number,
        public error: Error,
        public data: any,
        public timestamp: number
    ) {
    }

    public static success(data: any): ResponseBody {
        return new ResponseBody(200, null, data, this.makeTimestamp());
    }

    public static error(code: number, message: string, details: string = ''): ResponseBody {
        return new ResponseBody(500, new Error(code, message, details), null, this.makeTimestamp());
    }

    public static unauthenticated(message?: string, details?: string): ResponseBody {
        return new ResponseBody(401, new Error(-401, message || 'the access is unauthenticated', details), null, this.makeTimestamp());
    }

    public static forbidden(message?: string, details?: string): ResponseBody {
        return new ResponseBody(403, new Error(-403, message || 'the resource is forbidden to access', details), null, this.makeTimestamp());
    }

    public static notFound(message?: string, details?: string): ResponseBody {
        return new ResponseBody(404, new Error(-404, message || 'the requested resource was not found', details), null, this.makeTimestamp());
    }

    public static unprocessableEntity(message?: string, details?: string): ResponseBody {
        return new ResponseBody(422, new Error(-422, message || 'tour submitted fields had wrong', details), null, this.makeTimestamp());
    }

    public withStatus(status: number): ResponseBody {
        return new ResponseBody(status, this.error, this.data, this.timestamp);
    }

    /**
     * Get current timestamp in seconds, it represent as `{seconds}.{milliseconds}`
     */
    private static makeTimestamp(): number {
        return Date.now() / 1000;
    }
}

class Error {
    public constructor(
        public code: number,
        public message: string,
        public details?: string
    ) {
    }
}

export default ResponseBody;

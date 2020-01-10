import {BaseContext} from "koa";
import ResponseBody from "../HTTP/ResponseBody";

export default class KoaUtil {
    public static setResponse(ctx: BaseContext, responseBody: ResponseBody) {
        ctx.status = responseBody.status;
        ctx.body = {
            error: responseBody.error && {
                code: responseBody.error.code,
                message: responseBody.error.message,
                details: responseBody.error.details,
            },
            data: responseBody.data,
            timestamp: responseBody.timestamp,
        }
    }
}

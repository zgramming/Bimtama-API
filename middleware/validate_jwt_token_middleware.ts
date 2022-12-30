import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { Next } from "koa";

import { HTTP_RESPONSE_CODE } from "../utils/http_response_code";
import { KoaContext } from "../utils/types";

export const validateJWTToken = async (context: KoaContext, next: Next) => {
  try {
    const secretKey = process.env.JWT_SECRECT_KEY ?? "-";
    const authorization = context.headers.authorization;
    if (!authorization) {
      context.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
      return (context.body = {
        success: false,
        message: "Authorization Header Required",
      });
    }

    const [name, token] = authorization.split(" ");
    if (!token) {
      context.status = HTTP_RESPONSE_CODE.BAD_REQUEST;
      return (context.body = {
        success: false,
        message: "Token Required",
      });
    }

    const verify = jwt.verify(token, secretKey);

    /// key[payload] didapat dari config jwt.sign();
    const { payload, iat, exp } = verify as JwtPayload;
    const { user } = payload;

    if (!user) {
      context.status = HTTP_RESPONSE_CODE.FORBIDDEN;
      return (context.body = {
        success: false,
        message: "JWT Token Invalid ",
      });
    }

    await next();
  } catch (error: any) {
    context.status = HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR;
    let data: { message: string; stackTrace?: string } = {
      message: error?.message ?? "Unknown Message Error",
    };

    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError
    ) {
      context.status = HTTP_RESPONSE_CODE.UNAUTHORIZED;
      if (error instanceof TokenExpiredError) {
        /// Remove token from cookie
        /// And force user to login again
      }
      data = { ...data, message: error.message, stackTrace: error.stack };
    }

    return (context.body = data);
  }
};

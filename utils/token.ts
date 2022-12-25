import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { Next, ParameterizedContext } from "koa";

import { Users } from "@prisma/client";

import { keyCookieAuth } from "./constant";

export const setCookiesUser = (ctx: ParameterizedContext, user: Users) => {
  const isDev = process.env.APP_ENV == "dev";
  const baseDomain = isDev ? undefined : process.env.BASE_DOMAIN;
  const token = generateToken(user);
  ctx.cookies.set(keyCookieAuth, token, {
    path: "/",
    sameSite: isDev ? undefined : "none",
    domain: baseDomain,

    /// httpOnly[false] make cookie can be access in client side
    httpOnly: false,
    secure: isDev ? false : true,
  });
  return true;
};

export const destroyCookiesUser = (ctx: ParameterizedContext) => {
  const isDev = process.env.APP_ENV == "dev";
  const baseDomain = isDev ? undefined : process.env.BASE_DOMAIN;
  ctx.cookies.set(keyCookieAuth, "", {
    path: "/",
    sameSite: isDev ? undefined : "none",
    domain: baseDomain,

    /// httpOnly[false] make cookie can be access in client side
    httpOnly: false,
    secure: isDev ? false : true,
    expires: new Date(),
  });

  return true;
};

export const generateToken = (user: Users) => {
  const secretKey = process.env.JWT_SECRECT_KEY ?? "-";
  const token = jwt.sign(
    {
      payload: {
        user,
      },
    },
    secretKey,
    { expiresIn: "1 days" }
  );

  //   const decode = jwt.decode(token) as JwtPayload;
  //   console.log({ token, decode: decode.payload });

  return token;
};

export const verifyToken = (ctx: ParameterizedContext, next: Next) => {
  // return next();
  try {
    const secretKey = process.env.JWT_SECRECT_KEY ?? "-";
    const [authMethod, token] = ctx.headers["authorization"]?.split(" ") ?? [];
    if (!token) {
      ctx.status = 401;
      return (ctx.body = {
        message: "Unauthorized, Token required",
      });
    }

    const verify = jwt.verify(token, secretKey);

    /// key[payload] didapat dari config jwt.sign();
    const { payload, iat, exp } = verify as JwtPayload;
    const { user } = payload;

    if (!user) {
      ctx.status = 403;
      return (ctx.body = {
        message: "Token invalid",
        success: false,
      });
    }
    return next();
  } catch (error: any) {
    ctx.status = 500;
    let data: { message: string; stackTrace?: string } = {
      message: error?.message ?? "Unknown Message Error",
    };

    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError
    ) {
      ctx.status = 403;
      if (error instanceof TokenExpiredError) {
        /// Remove token from cookie
        /// And force user to login again
      }
      data = { ...data, message: error.message, stackTrace: error.stack };
    }

    return (ctx.body = data);
  }
};

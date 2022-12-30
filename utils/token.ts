import jwt from "jsonwebtoken";

import { Users } from "@prisma/client";

import { keyCookieAuth } from "./constant";
import { KoaContext } from "./types";

export const setCookiesUser = (ctx: KoaContext, user: Users) => {
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

export const destroyCookiesUser = (ctx: KoaContext) => {
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

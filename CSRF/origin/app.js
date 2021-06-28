const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const json = require("koa-json");
const svgCaptcha = require("svg-captcha");
const koaJwt = require("koa-jwt");
const jwt = require("jsonwebtoken");
const { USERS, SESSION_ID, SESSION, RESPONSE, secret } = require("./const");

const app = new Koa();

app.use(bodyParser());
app.use(json());
app.use(
  koaJwt({
    secret,
  }).unless({
    path: [/\/login/, /\/user/, /\/transfer/, /\/transferByCode/, /\/transferByReferer/],
  })
);

const router = new Router();

router.post("/api/login", (ctx) => {
  const { username, password } = ctx.request.body;
  const user = USERS.find((i) => i.username === username && i.password === password);
  if (user) {
    const cardId = Math.random() + Date.now();
    SESSION[cardId] = user;
    ctx.cookies.set(SESSION_ID, cardId, {
      httpOnly: true,
    });
    const token = jwt.sign(user, secret, { expiresIn: "1h" });
    ctx.body = RESPONSE(0, { token }, "登录成功");
  } else {
    ctx.body = RESPONSE(-1, `${username} does not exist or password mismatch`);
  }
});

router.get("/api/user", (ctx) => {
  const info = SESSION[ctx.cookies.get(SESSION_ID)];
  const user = Object.assign({}, info);
  if (user) {
    delete user.password;
    const captcha = svgCaptcha.create();
    user.captcha = captcha;
    info.code = captcha.text;
    ctx.body = RESPONSE(0, user, "获取用户信息成功");
  } else {
    ctx.body = RESPONSE(-1, "user not logged in.");
  }
});

router.post("/api/transfer", (ctx) => {
  const user = SESSION[ctx.cookies.get(SESSION_ID)];
  if (user) {
    const { payee, amount } = ctx.request.body;
    const verify = USERS.find((i) => i.username === payee);
    if (verify) {
      USERS.forEach((i) => {
        if (i.username === user.username) i.account -= amount;
        if (i.username === payee) i.account += amount;
      });
      ctx.body = RESPONSE("转账成功");
    } else {
      ctx.body = RESPONSE(-1, `${payee} does not exist`);
    }
  } else {
    ctx.body = RESPONSE(-1, "user not logged in.");
  }
});

router.post("/api/transferByCode", (ctx) => {
  const user = SESSION[ctx.cookies.get(SESSION_ID)];
  if (user) {
    const { payee, amount, code } = ctx.request.body;
    const verify = USERS.find((i) => i.username === payee);
    if (verify) {
      if (code === user.code) {
        USERS.forEach((i) => {
          if (i.username === user.username) i.account -= amount;
          if (i.username === payee) i.account += amount;
        });
        ctx.body = RESPONSE("转账成功");
      } else {
        ctx.body = RESPONSE(-1, "code error.");
      }
    } else {
      ctx.body = RESPONSE(-1, `${payee} does not exist`);
    }
  } else {
    ctx.body = RESPONSE(-1, "user not logged in.");
  }
});

router.post("/api/transferByReferer", (ctx) => {
  const user = SESSION[ctx.cookies.get(SESSION_ID)];
  if (user) {
    const { payee, amount } = ctx.request.body;
    const referer = ctx.request.headers["referer"] || ctx.request.headers["origin"] || "";
    const verify = USERS.find((i) => i.username === payee);
    if (verify) {
      if (referer.includes("localhost:3000")) {
        USERS.forEach((i) => {
          if (i.username === user.username) i.account -= amount;
          if (i.username === payee) i.account += amount;
        });
        ctx.body = RESPONSE("转账成功");
      } else {
        ctx.body = RESPONSE(-1, "illegal source of request .");
      }
    } else {
      ctx.body = RESPONSE(-1, `${payee} does not exist`);
    }
  } else {
    ctx.body = RESPONSE(-1, "user not logged in.");
  }
});

router.post("/api/transferByToken", (ctx) => {
  const user = SESSION[ctx.cookies.get(SESSION_ID)];
  if (user) {
    const { payee, amount } = ctx.request.body;
    const verify = USERS.find((i) => i.username === payee);
    if (verify) {
      const [scheme, token] = ctx.request.headers["authorization"].split(" ");
      if (/^Bearer$/i.test(scheme)) {
        try {
          jwt.verify(token, secret, {
            complete: true,
          });
          USERS.forEach((i) => {
            if (i.username === user.username) i.account -= amount;
            if (i.username === payee) i.account += amount;
          });
          ctx.body = RESPONSE("转账成功");
        } catch (error) {
          ctx.body = RESPONSE(-1, "Authorization error.");
        }
      }
    } else {
      ctx.body = RESPONSE(-1, `${payee} does not exist`);
    }
  } else {
    ctx.body = RESPONSE(-1, "user not logged in.");
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);

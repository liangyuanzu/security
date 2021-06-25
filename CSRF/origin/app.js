const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const json = require("koa-json");
const { USERS, SESSION_ID, SESSION, RESPONSE } = require("./const");

const app = new Koa();

app.use(bodyParser());
app.use(json());

const router = new Router();

router.post("/api/login", (ctx) => {
  const { username, password } = ctx.request.body;
  const user = USERS.find((i) => i.username === username && i.password === password);
  if (user) {
    const cardId = Math.random() + Date.now();
    SESSION[cardId] = user;
    ctx.cookies.set(SESSION_ID, cardId);
    ctx.body = RESPONSE("登录成功");
  } else {
    ctx.body = RESPONSE(-1, `${username} does not exist or password mismatch`);
  }
});

router.get("/api/user", (ctx) => {
  const user = Object.assign({}, SESSION[ctx.cookies.get(SESSION_ID)]);
  if (user) {
    delete user.password;
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

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);

# security

XSS, CSRF attacks and prevention

## Install

```
npm install
```

## CSRF 攻击

```
测试账号
用户名: zs
密码: 123456
用户名: ls
密码: 123456
```

偷走你的钱:

1. 进入 CSRF\origin 目录，运行 node app.js，端口号是 3000
2. 进入 CSRF\fish 目录，运行 node app.js，端口号是 3001
3. 浏览器中访问 `http://localhost:3000/`，没有登录的情况下自动跳转登录页，登录 zs 的账号
4. 用无痕窗口访问 `http://localhost:3000/`，登录 ls 的账号
5. zs 已经登录了，cookie 已经有了，这个时候，再去点击钓鱼链接: `http://localhost:3001/fish/index.html`，你点过去了，你的钱就被偷偷偷走了~~~
6. zs 的钱在不知不觉中就被转到了 ls 的账户

### 防御

##### 使用验证码【用户体验不佳】

利用 svg-captcha 生成验证码
接口: `api/transferByCode`

- 浏览器访问 `http://localhost:3000/safeByCode.html`，登录之后发现转账需要验证码了~
- 现在登录之后，再诱惑你点钓鱼网站 `http://localhost:3001/fish/fishByCode.html`，你的钱不能被转走，因为服务端需要验证你的验证码，发现验证码错误，不会转账。

##### 判断来源(referer) 【referer 并不安全，因为 referer 是可以被修改的】

接口: `api/transferByReferer`

- 浏览器访问 `http://localhost:3000/safeByReferer.html`，登录(zs/123456)
- 现在登录之后，再诱惑你点钓鱼网站 `http://localhost:3001/fish/fishByReferer.html`，你的钱不能被转走，因为服务端会判断请求来源，发现请求来源是 `localhost:3001`，不会转账。

##### Token【用户无感知】

使用 jwt 生成和校验 token
接口: `api/safeByToken`

- 浏览器访问 `http://localhost:3000/safeByToken.html`，登录(zs/123456)
- 现在登录之后，再诱惑你点钓鱼网站 `http://localhost:3001/fish/fishByToken.html`，你的钱不能被转走，因为服务端会验证 token 是否有效，发现请求中不存在 token，不会转账。

##### 双重 Cookie 验证【谨防注入 cookie】

接口: `api/transferBy2Cookie`

- 浏览器访问 `http://localhost:3000/safeBy2Cookie.html`，登录(zs/123456)
- 现在登录之后，再诱惑你点钓鱼网站 `http://localhost:3001/fish/fishBy2Cookie.html`，你的钱不能被转走，因为服务端会验证 header 中的 cookie 和 url 中的 cookie 是否一致，发现 url 中不存在 cookie，不会转账。

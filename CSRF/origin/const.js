module.exports.USERS = [
  { username: "Jason_liang", password: "123456", account: 6000 },
  { username: "liangyuanzu", password: "123456", account: 8000 },
];

module.exports.SESSION_ID = "session";

module.exports.SESSION = {};

module.exports.RESPONSE = (code = 0, msg = "", data = {}) => ({ code, msg, data });

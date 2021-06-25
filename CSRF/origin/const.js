module.exports.USERS = [
  { username: "zs", password: "123456", account: 6000 },
  { username: "ls", password: "123456", account: 8000 },
];

module.exports.SESSION_ID = "session";

module.exports.SESSION = {};

module.exports.RESPONSE = (code, data, msg) => {
  const res = {
    code,
    data,
    msg,
  };
  if (code === undefined) {
    res.code = 0;
    return res;
  } else if (data === undefined) {
    res.code = 0;
    res.data = {};
    res.msg = code;
    return res;
  } else if (msg === undefined) {
    res.data = {};
    res.msg = data;
    return res;
  }
  return res;
};

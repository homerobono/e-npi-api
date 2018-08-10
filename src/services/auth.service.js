const jwt = require("jsonwebtoken");

exports.generateToken = async (data, expireTime = 60 * 60 * 24) =>
  await jwt.sign({ data }, global.ENCRYPT_KEY, { expiresIn: expireTime });

exports.authorize = (req, res, next) => {
  if (
    req.hasOwnProperty("headers") &&
    req.headers.hasOwnProperty("authorization")
  ) {
    try {
        req.user = jwt.verify(req.headers["authorization"], global.ENCRYPT_KEY);
    } catch (err) {
      return res.status(401).json({
        error: {
          message: "Falha na validação do token de segurança!"
        }
      });
    }
  } else {
    return res.status(401).json({
      error: {
        message: "Não há token de segurança na requisição!"
      }
    });
  }
  next();
  return;
};

const verifyLevelUser = (next, method, res, decoded) => {
  if (decoded.data.type == "USER" && method == "GET") next();
  else
    res.status(401).json({
      message: "Acesso restrito!"
    });
};

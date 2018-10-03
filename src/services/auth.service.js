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
        //let expires_in = req.user.exp - Date.now()
        //if (expires_in < 3600) req.user.newToken = generateToken(req.user.data);
        //console.log(req.user)
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
    res.status(403).json({
      message: "Acesso restrito!"
    });
};

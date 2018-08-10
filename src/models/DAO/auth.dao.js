const User = require("../user.model");
const encrypto = require("../../services/encrypto.service");
const authService = require("../../services/auth.service");

exports.authUser = async data => {
  console.log(data)
  if (data.password == undefined) throw new Error("Senha inválida!");

  let password = await encrypto.encryptData(data.password);
  console.log(password)
  let userFinds = await User.findOne({
    email: data.email,
    password: password
  });

  if (userFinds) {
        userFinds.password = null
          let token = await authService.generateToken(userFinds);
          console.log('User '+ userFinds.email +' logged');
          return (data = {
            token: token,
          });
  } else
    throw new Error(
      "E-mail ou senha incorretos. Insira os dados de login e tente novamente."
    );
};

exports.resetPassword = async data => {
  user = data.user;
  user.password = data.password;
  user.resetToken = null;
  user.resetExpires = Date.now();
  let updatedUser = await user.save();
  updatedUser.password = null;
  return updatedUser;
};

exports.verifyResetToken = async resetToken => {
    console.log('token: ')
    console.log(resetToken)
    if (!resetToken || resetToken == '') throw new Error ('Nenhum token fornecido');
    user = await User.findOne(
    {
      resetToken: resetToken, resetExpires: { $gt: Date.now() } 
    });
    if (!user) throw new Error ('Token inválido ou expirado');
    return user;
  };

const verifyStatusUser = userStatus => {
  if (userStatus.status == "AGUARDANDO_CONFIRMACAO") {
    throw new Error("Aguardando confirmação de conta, verifique seu e-mail!");
  } else if (userStatus.status == "DESABILITADO") {
    throw new Error("Usuário desabilitado, contate o administrador do sistema");
  }
};
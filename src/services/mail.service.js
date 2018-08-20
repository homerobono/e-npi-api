var mailer = require('nodemailer');

exports.createTransport = async => mailer.createTransport({
    host: 'smtp.pixelti.com.br',
    secure: 'true',
    secureConnection: 'true',
    requireAuth: 'true',
    port: '465',
    tls: { rejectUnauthorized:false },
    auth: {
        user: 'homero@pixelti.com.br',
        pass: '1346@pixel13'
    }
    });

exports.sendResetEmail = async (email, token) => {
    console.log('preparing email to '+ email);
    var smtpTransport = await this.createTransport();

    var mailOptions = {
    to: email,
    from: 'homero@pixelti.com.br',
    subject: 'e-NPI - Alteração de Senha',
    html: 'Você está recebendo esse e-mail porque você (ou outra pessoa) solicitou a alteração da sua senha ' +
        'no sistema <a href="http://pixelti.com.br">e-NPI</a>.<br><br>'+
        'Clique no link a seguir ou copie e cole no navegador para completar o processo: '+
        '<a href=\"http://192.168.10.121:4200/reset/' + token +'\"> Redefinir Senha</a><br><br>'+
        'Se você não fez essa solicitação, ou não sabe do que essa mensagem se trata, ignore esse e-mail.<br><br>'+
        ''
    };
    console.log('sending mail');  
    return await smtpTransport.sendMail(mailOptions)
}

exports.sendRegisterEmail = async (email, token) => {
    console.log('preparing email to '+ email);
    var smtpTransport = await this.createTransport();

    var mailOptions = {
    to: email,
    from: 'homero@pixelti.com.br',
    subject: 'e-NPI - Cadastro de Conta',
    html:
        '<h2>Confirmação de Cadastro</h2>' +
        'Você está recebendo essa mensagem porque um administrador do <a href="http://pixelti.com.br">e-NPI</a> ' +
        'cadastrou uma conta com o seu e-mail no sistema. <br><br>' +
        'Para ter acesso ao <a href="http://pixelti.com.br">e-NPI</a> é necessário confirmar o seu ' +
        'cadastro informando seus dados pessoais através do link: <br><br>' +
        '<div style=\'text-align:center\'><big>' + 
        '<a href="' + global.URL_BASE + '/complete-registration/' + token +'"> '+
        'Clique aqui para finalizar o seu cadastro</a></big></div><br><br>' +
        'Você tem até 30 dias para para completar o seu cadastro. Vencido esse prazo, contate o administrador ' +
        'para gerar um novo token e enviá-lo nesse e-mail novamente.<br><br>'
    };
    console.log('sending mail');  
    return await smtpTransport.sendMail(mailOptions)   
}
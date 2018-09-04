var mailer = require('nodemailer');

exports.createTransport = async () => mailer.createTransport({
    host: 'smtp.pixelti.com.br',
    secure: 'true',
    secureConnection: 'true',
    requireAuth: 'true',
    port: '465',
    tls: { rejectUnauthorized: false },
    auth: {
        user: 'homero@pixelti.com.br',
        pass: '1346@pixel13'
    }
});

exports.sendResetEmail = async (email, token) => {
    console.log('preparing email to ' + email);
    var smtpTransport = await this.createTransport();

    var mailOptions = {
        to: email,
        from: 'homero@pixelti.com.br',
        subject: 'e-NPI | Alteração de Senha',
        html: 'Você está recebendo esse e-mail porque você (ou outra pessoa) solicitou a alteração da sua senha ' +
            'no sistema <a href="http://pixelti.com.br">e-NPI</a>.<br><br>' +
            'Clique no link a seguir ou copie e cole no navegador para completar o processo:<br><br>' +
            '<div style=\'text-align:center\'><big>' +
            '<a href=\"http://192.168.10.121:4200/reset/' + token + '\"> Redefinir Senha</a></big></div><br><br>' +
            'Se você não fez essa solicitação, ou não sabe do que essa mensagem se trata, ignore esse e-mail.<br><br>' +
            ''
    };
    console.log('sending mail');
    return await smtpTransport.sendMail(mailOptions)
}

exports.sendRegisterEmail = async (email, token) => {
    console.log('preparing email to ' + email);
    var smtpTransport = await this.createTransport();

    var mailOptions = {
        to: email,
        from: 'homero@pixelti.com.br',
        subject: 'e-NPI | Cadastro de Conta',
        html:
            '<h2>Confirmação de Cadastro</h2>' +
            'Você está recebendo essa mensagem porque um administrador do <a href="http://pixelti.com.br">e-NPI</a> ' +
            'cadastrou uma conta com o seu e-mail no sistema. <br><br>' +
            'Para ter acesso ao <a href="http://pixelti.com.br">e-NPI</a> é necessário confirmar o seu ' +
            'cadastro informando seus dados pessoais através do link: <br><br>' +
            '<div style=\'text-align:center\'><big>' +
            '<a href="' + global.URL_BASE + '/complete-registration/' + token + '"> ' +
            'Clique aqui para finalizar o seu cadastro</a></big></div><br><br>' +
            'Você tem até 30 dias para para completar o seu cadastro. Vencido esse prazo, contate o administrador ' +
            'para gerar um novo token e enviá-lo nesse e-mail novamente.<br><br>'
    };
    console.log('sending mail');
    return await smtpTransport.sendMail(mailOptions)
}

exports.sendNpiStatusEmail = async (users, updateData) => {
    var npiLink = '<a href="' + global.URL_BASE + '/npi/' +
        updateData.npi.number + '">NPI #' + updateData.npi.number +
        ' - ' + updateData.npi.name + '</a>'

    var authorOfChanges = updateData.authorOfChanges.firstName +
        (updateData.authorOfChanges.lastName ? ' ' + updateData.authorOfChanges.lastName : '')

    switch (updateData.changedFields.stage) {
        case '0':
            var email = {
                subject: 'e-NPI | NPI #' + updateData.npi.number + ' CANCELADA',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>cancelada</b> por ' + authorOfChanges + '.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da proposta e o ' +
                    'motivo do cancelamento.<br>'
            }
            break;
        case '1':
            return "E-mail shouldn't be sent for draft status"
        case '2':
            var email = {
                subject: 'e-NPI | NPI Submetida para Análise Crítica',
                body:
                    'Caro usuário, <br><br>' +
                    'Uma nova NPI foi submetida para <b>análise crítica</b> recentemente: <br>' +
                    '<b>' + npiLink + '</b>.<br>' +
                    '<b>Autor:</b> ' + authorOfChanges + '.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da proposta.<br>'
            }
            break;
        case '3':
            var email = {
                subject: 'e-NPI | NPI #' + updateData.npi.number + ' Aprovada para Desenvolvimento',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>aprovada na análise crítica</b> e avançou para a ' +
                    'fase de desenvolvimento.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da aprovação e os prazos ' +
                    'das próximas atividades.<br>'
            }
            break;
        case '4':
            var email = {
                subject: 'e-NPI | NPI #' + updateData.npi.number + ' CONCLUÍDA',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>concluída</b>.<br>'+
                    'Acesse a ' + npiLink + ' para conferir os detalhes finais do projeto.<br>'
            }
            break;
        default:
            return "Unrecognized stage \""+ updateData.changedFields.stage+"\""
    }

    var smtpTransport = await this.createTransport();
    var results = []
    for (var i = 0; i < users.length; i++) {
        var user = users[i]
        console.log('preparing email to ' + user.email);
        var mailOptions = {
            to: user.email,
            from: 'homero@pixelti.com.br',
            subject: email.subject,
            html: email.body
        };
        console.log('sending mail');
        var result
        try {
            result = await smtpTransport.sendMail(mailOptions)
        } catch (e) {
            result = e
        }
        results.push(result)
    };
    return results
}

exports.sendNpiChangesEmail = async (users, updateData) => {
    var npiLink = '<a href="' + global.URL_BASE + '/npi/' +
        updateData.npi.number + '">NPI #' + updateData.npi.number +
        ' - ' + updateData.npi.name + '</a>'
    var changedFields = ''
    for (var field in updateData.changedFields) {
        changedFields += '<li>' + field + '</li>'
    }

    var authorOfChanges = updateData.authorOfChanges.firstName +
        (updateData.authorOfChanges.lastName ? ' ' + updateData.authorOfChanges.lastName : '')

    var smtpTransport = await this.createTransport();
    var results = []
    for (var i = 0; i < users.length; i++) {
        var user = users[i]
        console.log('preparing email to ' + user.email);
        var mailOptions = {
            to: user.email,
            from: 'homero@pixelti.com.br',
            subject: 'e-NPI | Alteração NPI #' + updateData.npi.number,
            html:
                'Caro usuário, <br><br>' +
                'A ' + npiLink +
                ' foi editada recentemente por <b>' + authorOfChanges + '</b>.<br><br>' +
                'Os campos alterados foram: <br>' +
                '<ul>' + changedFields + '</ul>' +
                'Acesse a ' + npiLink + ' para conferir as alterações realizadas.<br>'
        };
        console.log('sending mail');
        var result
        try {
            result = await smtpTransport.sendMail(mailOptions)
        } catch (e) {
            result = e
        }
        results.push(result)
    };
    return results
}
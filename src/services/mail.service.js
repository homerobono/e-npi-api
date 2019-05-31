var mailer = require('nodemailer');
var npiDAO = require('../models/DAO/npi.dao')

var footNote = '<div style="color: #888; background-color: #f2f2f2; ' +
    'padding: 10px 16px 10px 16px; margin: 25px 40px 10px 40px"><small>' +
    'Essa é uma mensagem automática gerada pelo sistema e-NPI. Se você não ' +
    'deseja receber as notificações de atualização desabilite sua inscrição ' +
    'no menu de perfil de usuário através da opção "Receber notificações": ' +
    '<a href="' + global.URL_BASE + '/profile">Editar Perfil</a><br>' +
    'Para outros assuntos ou eventuais problemas contate o administrador do sistema.' +
    '</small></div>';

const logoEnpi = '<span style="color:chartreuse; font-family:sans-serif"><b>e</b>-</span><span style="color: orange; font-family: sans-serif">NPI</span>';
const npiEmail = '"e-NPI" <e-npi@pixelti.com.br>';

exports.createTransport = async () =>
    mailer.createTransport({
        host: 'smtp.pixelti.com.br',
        secure: 'true',
        secureConnection: 'true',
        requireAuth: 'true',
        port: '465',
        tls: { rejectUnauthorized: false },
        auth: {
            user: 'e-npi@pixelti.com.br',
            pass: '17@00pixelti17'
        }
    });

exports.sendResetEmail = async (email, token) => {
    console.log('preparing email to ' + email);
    var smtpTransport = await this.createTransport();

    var mailOptions = {
        to: email,
        from: npiEmail,
        subject: 'e-NPI | Alteração de Senha',
        html: 'Você está recebendo esse e-mail porque você (ou outra pessoa) solicitou a alteração da sua senha ' +
            'no sistema <a href="' + global.URL_BASE + '">e-NPI</a>.<br><br>' +
            'Clique no link a seguir ou copie e cole no navegador para completar o processo:<br><br>' +
            '<div style=\'text-align:center\'><big>' +
            '<a href="' + global.URL_BASE + '/reset/' + token + '"> Redefinir Senha</a></big></div><br><br>' +
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
        from: npiEmail,
        subject: 'Cadastro de Conta',
        html: '<h3>Confirmação de Cadastro: e-NPI</h3>' +
            'Você está recebendo essa mensagem porque um administrador do sistema de gerenciamento de NPI\'s da Pixel TI, <a href="http://pixelti.com.br">e-NPI</a>, ' +
            'cadastrou o seu e-mail no sistema. <br>' +
            'Para ter acesso ao <a href="' + global.URL_BASE + '">e-NPI</a> é necessário confirmar o seu ' +
            'cadastro informando seus dados pessoais através do link: <br><br><div style=\'text-align:center\'>' +
            '<a style=\'text-align:center; border-radius: 6px; background-color: #92ca53; text-decoration: none; padding: 10px 40px; margin: 10px; color: white\' href="' +
            global.URL_BASE + '/complete-registration/' + token + '"> Finalizar Cadastro</a></div><br>' +
            'Você tem 30 dias para completar o seu cadastro. Após esse período, contate o administrador ' +
            'para reenviar o link de confirmação.<br><br>'
    };
    console.log('sending mail');
    return await smtpTransport.sendMail(mailOptions)
}

exports.sendNpiStatusEmail = async (users, updateData) => {
    console.log('selecting email message')
    let notifyField
    var npiLink = '<a href="' + global.URL_BASE + '/npi/' +
        updateData.npi.number + '">NPI #' + updateData.npi.number +
        ' - ' + updateData.npi.name + '</a>'

    var authorOfChanges = updateData.authorOfChanges.firstName +
        (updateData.authorOfChanges.lastName ? ' ' + updateData.authorOfChanges.lastName : '')
    console.log(updateData.npi.stage)
    switch (updateData.npi.stage) {
        case 0:
            var email = {
                subject: 'NPI #' + updateData.npi.number + ' CANCELADA',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>cancelada</b> por ' + authorOfChanges + '.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da proposta e o ' +
                    'motivo do cancelamento.<br>'
            }
            break;
        case 1:
            return "E-mail shouldn't be sent for draft status"
        case 2:
            users = users.filter(user => global.CRITICAL_DEPTS[updateData.npi.__t].includes(user.department) && user.level==1)
            var email = {
                subject: 'NPI Submetida para Análise Crítica',
                body:
                    'Caro usuário, <br><br>' +
                    'Uma nova NPI foi submetida para <b>análise crítica</b>: <br>' +
                    '<div style="color: #666; background-color: #f8f8f8; padding: 10px 20px 10px 20px;' +
                    'margin: 10px auto 10px 20px; display: inline-block;">' +
                    '<b>' + npiLink + '</b><br>' +
                    '<b>Autor:</b> ' + authorOfChanges + '</div><div>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da proposta.<br></div>'
            }
            notifyField = 'critical'
            break;
        case 3:
            var email = {
                subject: 'NPI #' + updateData.npi.number + ' Aprovada para Desenvolvimento',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>aprovada na análise crítica</b> e avançou para a ' +
                    'fase de desenvolvimento.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes da aprovação e os prazos ' +
                    'das próximas atividades.<br>'
            }
            break;
        case 4:
            var email = {
                subject: 'NPI #' + updateData.npi.number + ' CONCLUÍDA',
                body:
                    'Caro usuário, <br><br>' +
                    'A ' + npiLink + ' foi <b>concluída</b> e está disponível no sistema ' +
                    'para leitura e download dos arquivos. Possíveis alterações podem ser realizadas ' +
                    'restritas a campos específicos, mediante solicitação na página da NPI, e serão ' +
                    'enviadas para análise crítica parcial do Comercial e do administrador.<br>' +
                    'Acesse a ' + npiLink + ' para conferir os detalhes do projeto.<br>'
            }
            break;
        default:
            return "Unrecognized stage \"" + updateData.changedFields.stage + "\""
    }

    email.body += footNote

    var smtpTransport = await this.createTransport();
    var results = []
    for (var i = 0; i < users.length; i++) {
        var user = users[i]
        console.log('preparing email to ' + user.email);
        var mailOptions = {
            to: user.email,
            from: npiEmail,
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
    npiDAO.updateNotify(npi._id, notifyField)
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
            from: npiEmail,
            subject: 'Alteração NPI #' + updateData.npi.number,
            html:
                'Caro usuário, <br><br>' +
                'A ' + npiLink +
                ' foi editada recentemente por <b>' + authorOfChanges + '</b>.<br><br>' +
                'Os campos alterados foram: <br>' +
                '<ul>' + changedFields + '</ul>' +
                'Acesse a ' + npiLink + ' para conferir as alterações realizadas.<br>' +
                footNote
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

exports.sendCriticalAnalisysReminder = async (users, npi) => {
    console.log("[mail-service] Users", users)
    var npiLink = '<a href="' + global.URL_BASE + '/npi/' +
        npi.number + '">NPI #' + npi.number +
        ' - ' + npi.name + '</a>'

    var smtpTransport = await this.createTransport();
    var results = []
    for (var i = 0; i < users.length; i++) {
        var user = users[i]
        console.log('preparing email to ' + user.email);
        var mailOptions = {
            to: user.email,
            from: npiEmail,
            subject: 'NPI #' + npi.number + ' - Análise Crítica Pendente',
            html:
                'Caro usuário, <br><br>' +
                'A NPI #' + npi.number + ' - ' + npi.name + ' está pendente da sua aprovação na análise crítica.<br>' +
                'Acesse a ' + npiLink + ' para registrar a sua análise.<br>' +
                footNote
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
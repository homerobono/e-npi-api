const config = require("../config");
var mailer = require('nodemailer');
var npiDAO = require('./models/DAO/npi.dao')
var Npi = require('./models/npi.model')
var mongoose = require('mongoose');
var bluebird = require('bluebird');

var dbUrl = 'mongodb://127.0.0.1/enpi'
mongoose.Promise = bluebird;
mongoose.connect(dbUrl)

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

exports.sendActivityUnlockEmail = async (elegibleUsers, updateData, activity) => {
    var author = updateData.authorOfChanges.firstName +
        (updateData.authorOfChanges.lastName ? ' ' + updateData.authorOfChanges.lastName : '')
    let npi = updateData.npi

    let activities = npi.getActivityDependencies(activity)

    console.log(activities)

    //var users = elegibleUsers.filter(u=> u._id == activity.analisys.includes(a.responsible == u._id.toString()))

    /*console.log("[mail-service] Users", users.map(u => u.email))
    var npiLink = '<a href="' + global.URL_BASE + '/npi/' +
        npi.number + '">NPI #' + npi.number +
        ' - ' + npi.name + '</a>'

    var smtpTransport = await this.createTransport();
    var results = []
    console.log('[mail-service] Sending request reproval notification to', users.map(u => u.email));
    for (var i = 0; i < users.length; i++) {
        var user = users[i]
        //console.log('preparing email to ' + user.email);
        var mailOptions = {
            to: user.email,
            from: npiEmail,
            subject: 'NPI #' + npi.number + ' - Solicitação Recusada',
            html:
                user.firstName + ', <br><br>' +
                'A solicitação de ' + global.NPI_LABELS.requests[request.class] + ' para a NPI #' + npi.number + ' - ' + npi.name + ' foi recusada por' + author + '.<br>' +
                'Acesse a ' + npiLink + ' para conferir os detalhes da análise.<br>' +
                footNote
        };
        var result
        try {
            result = await smtpTransport.sendMail(mailOptions)
        } catch (e) {
            result = e
        }
        results.push(result)
    };
    npiDAO.updateNotify(npi._id, 'critical')
    return results
    */
};

Npi.findOne({ number: 69 }).then(npi => {
    //console.log(npi)
    let activities = npi.getActivityDependents(npi.activities[1])
    console.log("ACTIVITIES:", activities)
    activities.forEach(activity => {
        if (npi.getActivityDependencies(activity).every(a => a.closed)) {
            console.log("NOTIFY", activity.responsible, "ABOUT", activity.activity)
        }
    })
}).catch(err => console.log(err))
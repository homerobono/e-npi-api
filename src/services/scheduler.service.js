var mailerService = require('../services/mail.service');
var userDAO = require('../models/DAO/user.dao')
var npiDAO = require('../models/DAO/npi.dao')
_this = this

var cron = require('node-cron');

console.log("[scheduler] start")

//exports.schedule = function() {

cron.schedule('30 7 * * 1,2,3,4,5', async () => {
    console.log('running a task every minute');
    let npis = await npiDAO.getNpis({})
    let users = await userDAO.getUsers({ status: 'active' }, {})
    console.log("[scheduler] Npis:", npis.length)
    console.log("[scheduler] Users:", users.length)
    npis.forEach(npi => {
        switch (npi.stage) {
            case 2:
                let responsibles = []
                npi.critical.forEach(analisys => {
                    if (analisys.status != 'deny' && analisys.status != 'accept')
                        responsibles = responsibles.concat(users.filter(user =>
                            user.department == analisys.dept && user.level == 1))
                })
                mailerService.sendCriticalAnalisysReminder(responsibles.filter(unique), npi)
                break;
        }
    });
});
//}

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

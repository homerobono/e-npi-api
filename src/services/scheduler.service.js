var mailerService = require('../services/mail.service');
var userDAO = require('../models/DAO/user.dao')
var npiDAO = require('../models/DAO/npi.dao')
var cron = require('node-cron');
_this = this

const DAYS = 1000 * 3600 * 24 // Days in milisecs
const MINUTES = 1000 * 60 // Minutes in milisecs

console.log("[scheduler] start")
var lastRemind = {}

//exports.schedule = function() {

//cron.schedule('30 7 * * 1,2,3,4,5', async () => {
cron.schedule('* * * * 1,2,3,4,5', async () => {
    //console.log('running a task every minute');
    let npis = await npiDAO.getNpis({})
    let users = await userDAO.getUsers({ status: 'active' }, {})
    console.log("[scheduler] Npis:", npis.length)
    console.log("[scheduler] Users:", users.length)
    npis.forEach(async npi => {
        if (!npi.notify) {
            try {
                npi = await npiDAO.updateNotify(npi._id, 'all')
                console.log("[scheduler] npi:", npi._id, npi.notify)
            }
            catch (err) {
                console.error("[scheduler] [npi-update]", err)
            }
        }
        switch (npi.stage) {
            //NPI em análise crítica
            case 2:
                //if (npi.notify && npi.notify.critical && Math.round(((new Date()) - npi.notify.critical) / DAYS) < 3)
                if (npi.notify && npi.notify.critical && Math.round(((new Date()) - npi.notify.critical) / MINUTES) < 10)
                    break
                /*    console.log(`[scheduler] is time: ${npi.number}`, npi.notify.critical, Math.round(((new Date()) - npi.notify.critical) / MINUTES))
                } else {
                    console.log(`[scheduler] Not on time: ${npi.number}`, npi.notify.critical, Math.round(((new Date()) - npi.notify.critical) / MINUTES))
                    break
                }*/
                try {
                    let responsibles = users.filter(u => u._id.toString() == npi.requester.toString())
                    //console.log(`[scheduler] Requester:`, npi.requester, responsibles)
                    npi.critical.forEach(analisys => {
                        if (analisys.status != 'deny' && analisys.status != 'accept')
                            responsibles = responsibles.concat(users.filter(user =>
                                user.department == analisys.dept && user.level == 1))
                    })
                    mailerService.sendCriticalAnalisysReminder(responsibles.filter(unique), npi)
                } catch (err) {
                    console.error("[scheduler]", err)
                }
                //npiDAO.updateNotify(npi._id, 'critical')
                break;
        }
    });
});
//}

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

var mailerService = require('../services/mail.service');
var userDAO = require('../models/DAO/user.dao')
var npiDAO = require('../models/DAO/npi.dao')
var Npi = require('../models/npi.model')
var Oem = require('../models/npi.oem.model')
var cron = require('node-cron');
_this = this

const DAYS = 1000 * 3600 * 24 // Days in milisecs
const MINUTES = 1000 * 60 // Minutes in milisecs

console.log("[scheduler] start")
var lastRemind = {}

//exports.schedule = function() {

async function sendReminderMails() {
//cron.schedule('* * * * 1,2,3,4,5', async () => {
    //console.log('running a task every minute');
    let npis = await npiDAO.getNpis({})
    let users = await userDAO.getUsers({ status: 'active' }, {})
    console.log("[scheduler] Npis:", npis.length)
    console.log("[scheduler] Users:", users.length)
    npis.forEach(async npi => {
        //console.log("[scheduler] NPI:", npi)
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
                if (npi.notify && npi.notify.critical && Math.round(((new Date()) - npi.notify.critical) / DAYS) < 3)
                    //if (npi.notify && npi.notify.critical && Math.round(((new Date()) - npi.notify.critical) / MINUTES) < 10)
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
            case 4:
                //if (npi.notify && npi.notify.activities)
                //console.log(`[scheduler] ${}`)
                let activeActivities = Npi(npi).getActiveActivities()
                activeActivities.forEach(activity => {
                    let activityEndDate = npi.__t == 'oem' ? Oem(npi).getActivityEndDate(activity) : Npi(npi).getActivityEndDate(activity)
                    console.log(`[scheduler] #${npi.number} active activity: ${activity.activity}, End date: ${activityEndDate}`)
                    //if (Math.round((Date.now() - activityEndDate) / MINUTES) > 1) {
                        try {
                            let responsibles = users.filter(u =>
                                (/^.+@.+\..+$/.test(u.email)) && (
                                    (activity.responsible && u._id.toString() == activity.responsible.toString()) ||
                                    (u.department == activity.dept && u.level == 1)
                                )
                            )
                            console.log(`[scheduler] Activity Requesters:`, responsibles.map(r => r.email))
                            if (responsibles.length)
                                mailerService.sendActivityReminder(responsibles.filter(unique), npi, activity, activityEndDate)
                        } catch (err) {
                            console.error("[scheduler]", err)
                        }
                        //npiDAO.updateNotify(npi._id, 'critical')
                    //}
                })
                break;
            default:
                break
        }
    });
}
//}

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

sendReminderMails()

cron.schedule('30 7 * * 1,2,3,4,5', sendReminderMails)


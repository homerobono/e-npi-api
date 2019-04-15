var Npi = require('../npi.model')
var PixelNpi = require('../npi.pixel.model')
var OemNpi = require('../npi.oem.model')
var InternalNpi = require('../npi.internal.model')
var CustomNpi = require('../npi.custom.model')
var _ = require('underscore');
var mongoose = require('mongoose')
var path = require('path');
var fs = require('fs-extra');
var FileDescriptor = require('../file.model')
var path = require('path');

_this = this

const read = (dir) =>
    fs.readdirSync(dir)
        .reduce((files, file) =>
            fs.statSync(path.join(dir, file)).isDirectory() ?
                files.concat(read(path.join(dir, file))) :
                files.concat(path.join(dir, file)),
            []);

exports.getNpis = async function (query) {

    query = Object.assign({}, {
        $or: [
            { version: { $exists: false } },
            { version: { $eq: 1 } }
        ]
    })

    var aggregations = [
        {
            $sort: {
                number: 1,
                version: -1
            }
        }, {
            $group: {
                _id: '$number',
                npi: {
                    $first:
                        '$$ROOT'
                }
            }
        }
    ]
    try {
        //var npis = await Npi.find(query)
        var npisQuery = await Npi.aggregate([aggregations]).sort('_id')

        let npisVec = npisQuery.map(npi => npi.npi)

        //console.log(npis)
        return npisVec;
    } catch (e) {
        throw Error(e)
    }
}

exports.createNpi = async function (req) {
    //console.log(req.user)

    let data = req.body

    if (!data.created) data.created = Date.now();
    if (!data.requester) data.requester = req.user.data._id

    if (data.oemActivities) {
        data.oemActivities.forEach(activity => {
            delete (activity._id)
        })
    }
    if (data.critical) delete (data.critical)
    if (data.stage > 2) delete (data.stage)

    var kind = data.entry
    //console.log(data)
    try {
        // Saving the Npi
        let newNpi = new Npi();

        if (data.npiRef == '') {
            data.npiRef = null
        } else {
            if (data.npiRef instanceof mongoose.Types.ObjectId)
                var npiRef = await Npi.findOne({ _id: data.npiRef, stage: { $ne: 1 } })
            else
                var npiRef = await Npi.findOne({ number: data.npiRef, stage: { $ne: 1 } })
            if (npiRef)
                data.npiRef = npiRef._id
        }

        if (data.stage == 2) {
            data.stage = 1
            //data = advanceToAnalisys(data)
            var invalidFields = hasInvalidFields(data)
            if (invalidFields) {
                console.log('Npi not created: Invalid fields found')
                throw ({ errors: invalidFields })
            }
        }
        data.updated = Date.now()

        switch (kind) {
            case 'pixel':
                newNpi = await PixelNpi.create(data);
                break;
            case 'internal':
                newNpi = await InternalNpi.create(data);
                break;
            case 'oem':
                newNpi = await OemNpi.create(data);
                break;
            case 'custom':
                newNpi = await CustomNpi.create(data);
                break;
            default:
                console.log('NPI entry: ' + kind)
                throw Error('Tipo de NPI inválido: ' + kind)
        }
        console.log('created: ' + newNpi)
        let npiFilesFolder = path.join(global.FILES_DIR, newNpi.number.toString())
        console.log(npiFilesFolder)
        //await fs.mkdir(npiFilesFolder, 0o744, err => console.log('folder already exists'))
        return newNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
}

exports.migrateNpi = async function (req) {
    //console.log(req.user)

    let data = req.body

    if (await Npi.findOne({ number: data.number }))
        throw Error("Npi number " + data.number + " already exists")

    var kind = data.entry
    try {
        // Saving the Npi
        let newNpi = new Npi();
        console.log("constructed new npi")

        if (data.npiRef == '') {
            data.npiRef = null
        } else {
            if (data.npiRef instanceof mongoose.Types.ObjectId)
                var npiRef = await Npi.findOne({ _id: data.npiRef, stage: { $ne: 1 } })
            else
                var npiRef = await Npi.findOne({ number: data.npiRef, stage: { $ne: 1 } })
            if (npiRef)
                data.npiRef = npiRef._id
        }
        console.log("loaded ref")

        if (data.stage < 4) { //client approval and below
            delete data.activities
            if (data.stage < 3) { //critical analysis and below
                delete data.clientApproval
                if (data.stage < 2) { //draft or canceled
                    delete data.critical
                }
            }
        }
        console.log(data)

        //data = advanceToAnalisys(data)
        var invalidFields = hasInvalidFields(data)
        if (invalidFields) {
            console.log('Npi not created: Invalid fields found')
            throw ({ errors: invalidFields })
        }

        if (data.activities)
            data = migrateSign(data)
        console.log("signed")

        if (data.validation) 
            data.updated = data.validation.signature.date
        console.log(data)
        //delete data.activities

        switch (kind) {
            case 'pixel':
                newNpi = await PixelNpi.create(data);
                break;
            case 'internal':
                newNpi = await InternalNpi.create(data);
                break;
            case 'oem':
                newNpi = await OemNpi.create(data);
                break;
            case 'custom':
                newNpi = await CustomNpi.create(data);
                break;
            default:
                console.log('NPI entry: ' + kind)
                throw Error('Tipo de NPI inválido: ' + kind)
        }
        console.log('created: ' + newNpi)
        let npiFilesFolder = path.join(global.FILES_DIR, newNpi.number.toString())
        console.log(npiFilesFolder)
        //await fs.mkdir(npiFilesFolder, 0o744, err => console.log('folder already exists'))
        return newNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
}

exports.newNpiVersion = async function (req) {
    console.log('CREATING NEW NPI VERSION')
    var npi = req.body

    console.log(npi)
    try {
        var npis = await Npi.find({ number: npi.number }).sort('-version');
        //console.log(npis)
        var oldNpi = npis[0]
        console.log(oldNpi)
    } catch (e) {
        throw Error("Error occured while finding the Npi")
    }

    if (!oldNpi) {
        throw Error("No NPI number " + npi.number)
    }
    console.log('npi')
    console.log(npi)
    console.log('oldNpi')
    console.log(oldNpi)

    if (npi.npiRef == '') {
        npi.npiRef = null
    } else {
        let npiRef = await Npi.findOne({ number: npi.npiRef, stage: { $ne: 1 } })
        if (npiRef)
            npi.npiRef = npiRef._id
    }

    var changedFields = updateObject(oldNpi, npi).changedFields

    console.log('New Version Changed Fields:', changedFields)

    if (changedFields == '' || changedFields == null || !changedFields ||
        changedFields == [] || changedFields.length == 0 ||
        changedFields == undefined || Object.keys(changedFields).length == 0) {

        console.log("No changes made: new version not created")
        return "No changes made: new version not created"
    }

    var newNpiVersion = await createNpi(req)
    return { npi: newNpiVersion, changedFields: changedFields }
}

exports.updateNpi = async function (user, npi) {
    var id = npi.id
    try {
        var oldNpi = await Npi.findById(id);
    } catch (e) {
        throw Error("Error occured while Finding the Npi")
    }

    if (!oldNpi) {
        throw Error("No NPI id " + id)
    }

    if (npi.npiRef == '') {
        npi.npiRef = null
    } else {
        let npiRef = await Npi.findOne({ number: npi.npiRef, stage: { $ne: 1 } })
        if (npiRef)
            npi.npiRef = npiRef._id
    }

    if (npi.stage < 4) { //client approval and below
        delete npi.activities
        if (npi.stage < 3) { //critical analysis and below
            delete npi.clientApproval
            if (npi.stage < 2) { //draft or canceled
                delete npi.critical
            }
        }
    }
    console.log('npi')
    console.log(npi)
    console.log('oldNpi')
    console.log(oldNpi)

    var updateResult = updateObject(oldNpi, npi)

    var changedFields = updateResult.changedFields
    oldNpi = updateResult.updatedObject

    oldNpi.critical = criticalSign(user, oldNpi.critical, changedFields.critical)
    oldNpi.activities = activitySign(user, oldNpi.activities, changedFields.activities)
    oldNpi.requests = requestSign(user, oldNpi.requests, changedFields.requests)
    //oldNpi.validation = validationSign(user, oldNpi.validation, changedFields.validation)
    /*
        console.log("updated Object")
        console.log(oldNpi)
    */
    console.log('changedFields')
    console.log(changedFields)

    try {
        if (oldNpi.stage != 1) {
            var invalidFields = hasInvalidFields(npi)
            if (invalidFields) throw ({ errors: invalidFields })
        }
        if (!Object.keys(changedFields).length) return { npi: oldNpi, changedFields }
        oldNpi.updated = Date.now()
        var savedNpi = await oldNpi.save()
        //var savedNpi = Npi.findByIdAndUpdate(oldNpi._id, npi)
        //console.log(savedNpi)
        return { npi: savedNpi, changedFields: changedFields }
        //return savedNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
}

exports.cancelNpi = async function (id) {
    // Conditionally Delete the Npi
    try {
        var toDelete = await Npi.findById(id)
        if (toDelete.stage < 2)
            var deleted = await Npi.remove({ _id: id })
        else {
            toDelete.stage = 0
            toDelete.updated = Date.now()
            var deleted = await toDelete.save()
        }
        //console.log(deleted)
        if (deleted.n === 0) {
            throw Error("Npi could not be deleted")
        }
        return deleted
    } catch (e) {
        throw Error("Error occured while Deleting the Npi: " + e)
    }
}

exports.updateAnnexList = async npiNumber => {
    try {
        var npi = await Npi.find({ number: npiNumber }).sort('-version')
    } catch (e) {
        throw Error("Error occured while Finding the Npi")
    }

    if (!npi) {
        throw Error("No NPI number " + npiNumber)
    }
    npi = npi[0]

    try {
        console.log('dir structure')
        console.log(read(npiNumber))
        /*var invalidFields = hasInvalidFields(npi)
        console.log(invalidFields)
        if (invalidFields) throw ({ errors: invalidFields })
        npi = await evolve(req, npi)
        var savedNpi = await npi.save()
        return { npi: savedNpi, changedFields }*/
    } catch (e) {
        throw ({ message: e })
    }

    return npi
}

exports.deleteAllNpis = async function (user) {
    // Delete the Npi
    if (user.email != 'admin') throw Error("Apenas o administrador pode realizar essa operação")
    try {
        var deleted = await Npi.deleteMany({})
        console.log(deleted)
        if (deleted.n === 0) {
            throw Error("Npis could not be deleted")
        }
        return deleted
    } catch (e) {
        throw Error("Error occured while Deleting the Npis: " + e)
    }
}

exports.findNpiById = async npiId => {
    var npi = await Npi.findById(npiId)
        .populate('npiRef', '_id number name stage created')
        .populate('requester', '_id firstName lastName')
        .populate({
            path: 'critical.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'finalApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'clientApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'activities.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'validation.finalApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        });

    if (!npi || npi == null) throw Error('There is no NPI with this number: ' + npiNumber)
    //console.log(npi)
    return npi
}

exports.findNpiByNumber = async npiNumber => {
    console.log('dir structure')
    //console.log(read('./npi-files/'+npiNumber))
    var npi = await Npi.find({ number: npiNumber }).sort('-version')
        .populate('npiRef', '_id number name stage created')
        .populate('requester', 'firstName lastName')
        .populate({
            path: 'critical.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'finalApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'clientApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'activities.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        })
        .populate({
            path: 'validation.finalApproval.signature.user',
            model: 'User',
            select: '_id firstName lastName'
        });

    if (!npi || npi == null) throw Error('There is no NPI with this number: ' + npiNumber)
    //console.log(npi)
    return npi
}

exports.promoteNpi = async req => {
    try {
        var npi = await Npi.find({ number: req.params.npiNumber }).sort('-version')
    } catch (e) {
        throw Error("Error occured while Finding the Npi")
    }

    if (!npi) {
        throw Error("No NPI number " + npiNumber)
    }
    npi = npi[0]

    try {
        var invalidFields = hasInvalidFields(npi)
        console.log(invalidFields)
        if (invalidFields) throw ({ errors: invalidFields })

        let oldStatus = npi.stage
        npi = await evolve(req, npi)
        npi.updated = Date.now()
        var savedNpi = await npi.save()
        return { npi: savedNpi, changedFields: { stage: npi.stage } }
    } catch (e) {
        throw ({ message: e })
    }

    return npi
}

async function evolve(req, npi) {
    console.log('Evolving NPI #' + npi.number)
    switch (npi.stage) {
        case 1:
            if (!npi.critical || npi.critical.length == 0)
                npi = advanceToAnalisys(npi)
            else throw ('NPI já contém os campos de análise crítica (NPI corrompida)')
            break
        case 2:
            if (npi.critical.every((analisys) => analisys.status == 'accept')
                || (npi.critical.every((analisys) => analisys.status != null)
                    && npi.finalApproval.status == 'accept')) {
                console.log('req.user')
                console.log(req.user)
                npi.finalApproval = finalSign(req.user.data, npi.finalApproval)
                if (npi.__t != 'oem') {
                    npi = advanceToDevelopment(npi, req.user.data)
                } else {
                    npi = advanceToClientApproval(npi)
                }
            } else throw ('NPI não passou na análise crítica')
            break
        case 3:
            if (npi.stage == 3) {
                if (npi.clientApproval) {
                    if (npi.clientApproval.approval == 'accept') {
                        npi.clientApproval = clientSign(req.user.data, npi.clientApproval)
                        npi = advanceToDevelopment(npi, req.user.data)
                    }
                } else
                    npi.clientApproval = { approval: null, comment: null }
            } else throw ('NPI não passou na aprovação do cliente')
            break
        case 4:
            npi = closeNpi(npi)
            break
        default:
            break
    }
    return npi
}

function advanceToAnalisys(data) {
    console.log('submitting to analisys')

    data.stage = 2
    var depts = Array()

    var kind = (data.__t ? data.__t : data.entry)

    switch (kind) {
        case 'pixel':
            depts = global.NPI_PIXEL_CRITICAL_DEPTS
            break;
        case 'internal':
            depts = global.NPI_INTERNAL_CRITICAL_DEPTS
            break;
        case 'oem':
            depts = global.NPI_OEM_CRITICAL_DEPTS
            break;
        case 'custom':
            depts = global.NPI_CUSTOM_CRITICAL_DEPTS
            break;
        default:
            console.log('NPI entry: ' + kind)
            throw Error('Tipo de NPI inválido: ' + kind)
    }
    data.critical = []
    depts.forEach(dept => {
        data.critical.push({
            dept: dept,
            status: null,
            comment: null,
            signature: null,
        })
    })
    return data
}

function advanceToDevelopment(data, user) {
    console.log('advancing to development')
    if (!data.activities || !data.activities.length) {
        data.activities = []
        let activities = data.__t == 'oem' || data.entry == 'oem' ? global.OEM_STAGES : global.MACRO_STAGES
        activities.forEach(stage => {
            if (stage.value != "RELEASE")
                data.activities.push({
                    activity: stage.value,
                    dept: stage.dept,
                    term: stage.term,
                    registry: null,
                    annex: null,
                    apply: true
                })
        })
        return data
    }
    console.log(getEndDate(data, 'RELEASE'), getInStockDate(data), getEndDate(data, 'RELEASE').valueOf() <= getInStockDate(data).valueOf())
    if (getEndDate(data, 'RELEASE').valueOf() <= getInStockDate(data).valueOf())
        data.stage = 4
    else {
        console.log('REQUESTS:', data.requests)
        if (data.requests) {
            let request = data.requests.find(r => r.class == "DELAYED_RELEASE")
            if (request) {
                data = analyzeAndCloseRequest(data, "DELAYED_RELEASE")
                if (request.closed && request.approval == 'accept')
                    data.stage = 4
                else
                    throw ('Solicitacao de desenvolvimento com data de lancamento em atraso nao foi aprovada, NPI nao pode avancar.')
            } else
                data = openRequest(data, user, 'DELAYED_RELEASE')
        } else
            data = openRequest(data, user, 'DELAYED_RELEASE')
    }
    return data
}

function analyzeAndCloseRequest(npi, requestClass) {
    let i = npi.requests.findIndex(r => r.class = requestClass)
    if (npi.requests[i]) {
        if (npi.requests[i].analysis.every(a => a.status == "accept")) {
            npi.requests[i].closed = true
            npi.requests[i].approval = 'accept'
        } else if (npi.requests[i].analysis.every(a => a.status == "accept" || a.status == "deny")) {
            npi.requests[i].closed = true
            npi.requests[i].approval = 'deny'
        } else npi.requests[i].closed = false
    }
    return npi
}

function getInStockDate(npi) {
    if (npi.__t == 'oem' || npi.entry == 'oem') {
        console.log(npi.inStockDate)
        if (npi.inStockDate.fixed)
            return npi.inStockDate.fixed
        if (npi.inStockDate.offset)
            return new Date(npi.clientApproval.signature.date.valueOf() + npi.inStockDate.offset * 24 * 3600 * 1000)
    }
    else return npi.inStockDate
    return null
}

function openRequest(npi, user, requestLabel) {
    let npiEntry = npi.entry ? npi.entry : npi.__t
    if (!npi.requests)
        npi.requests = []
    if (npi.requests.find(r => r.class == requestLabel)) throw "Chamado ja foi aberto, aguarde conclusao da analise."

    npi.requests.push({
        class: requestLabel,
        responsible: user._id,
        comment: '',
        closed: false,
        signature: null,
        analysis: []
    })
    let i = npi.requests.findIndex(r => r.class = requestLabel)
    switch (requestLabel) {
        case 'DELAYED_RELEASE':
            let analysisDeptsArray = global.REQUEST_DEPTS[npiEntry]
            analysisDeptsArray.forEach(analysisDept => {
                npi.requests[i].analysis.push({
                    dept: analysisDept,
                    status: null,
                    comment: null,
                    signature: null,
                })
            })
            npi.requests[i].analysis.push({
                dept: user.department,
                author: npi.requester,
                status: null,
                comment: null,
                signature: null,
            })
            break
        default:
            break
    }
    return npi
}

function closeNpi(data) {
    data.stage = 5
    return data
}

function getEndDate(data, activityName) {
    let activities = data.__t == 'oem' || data.entry == 'oem' ? global.OEM_STAGES : global.MACRO_STAGES
    let activityConst = activities.find(a => a.value == activityName)

    let endDate = getCriticalApprovalDate(data)

    if (activityConst.dep)
        activityConst.dep.forEach(depName => {
            endDate = new Date(Math.max(endDate.valueOf(), getEndDate(data, depName).valueOf()))
        })

    let npiActivity = data.activities.find(a => a.activity == activityName)
    if (npiActivity && npiActivity.apply)
        endDate = new Date(endDate.valueOf() + npiActivity.term * 24 * 3600 * 1000)
    return endDate
}

function getCriticalApprovalDate(data) {
    if (data.critical) {
        var isCriticallyApproved = data.critical.every(
            analisys => analisys.status == 'accept'
        ) || data.finalApproval.status == 'accept'
        if (isCriticallyApproved) {
            if (data.finalApproval && data.finalApproval.status == 'accept')
                return data.finalApproval.signature.date
            var lastAnalysisDate = data.critical[0].signature.date
            data.critical.forEach(analysis => {
                lastAnalysisDate = lastAnalysisDate < analysis.signature.date ?
                    analysis.signature.date : lastAnalysisDate
            })
            return lastAnalysisDate
        }
    }
}

function advanceToClientApproval(data) {
    console.log('advancing to client approval')
    data.stage = 3
    data.clientApproval = { approval: null, comment: null }
    return data
}

function hasInvalidFields(data) {
    //console.log('Analysing invalid fields')
    var invalidFields = {}

    if (data.stage == 1) {

        if (!data.name) invalidFields.name = data.name
        if (!data.client) invalidFields.client = data.client
        if (!data.description) invalidFields.description = data.description
        else
            if (!data.description.description && !data.description.annex)
                invalidFields.description = data.description.description

        if (!data.resources) invalidFields.resources = data.resources
        else
            if (!data.resources.description && !data.resources.annex)
                invalidFields.resources = data.resources.description

        if (data.regulations && !(data.regulations.description || data.regulations.annex))
            invalidFields['regulations.description'] = data.regulations.description

        if (!data.fiscals) invalidFields.fiscals = data.fiscals

        if (!data.investment) invalidFields['investment'] = data.investment
        else
            if ((!data.investment.value && data.investment.value !== 0) &&
                (!data.investment.annex || !data.investment.annex.length))
                invalidFields.investment = data.investment.value

        if (!data.projectCost) invalidFields['projectCost'] = data.projectCost
        else
            if ((!data.projectCost.value && data.projectCost.value !== 0) &&
                (!data.projectCost.annex || !data.projectCost.annex.length))
                invalidFields.projectCost = data.projectCost.value
    }

    if (data.critical && data.critical.length > 0) {
        for (let i = 0; i < data.critical.length; i++) {
            if (data.critical[i].status == 'deny' && !data.critical[i].comment)
                invalidFields['critical.' + i + '.comment'] = data.critical[i].comment
        }
    }

    if (data.finalApproval && data.finalApproval.status == 'accept' && !data.finalApproval.comment)
        invalidFields['finalApproval.comment'] = data.finalApproval.comment

    //if (data.clientApproval && !(data.clientApproval.comment || data.clientApproval.annex ))
    //    invalidFields['clientApproval'] = data.clientApproval.comment

    if (data.validation && data.validation.status == 'accept' && !data.validation.final)
        invalidFields['validation.final'] = data.validation.final

    /*let result = validateFiles(data)
    if (result) {
        Object.assign(invalidFields, result)
        console.log('Invalid Fields From Files: ', invalidFields)
    }*/

    var kind = data.entry ? data.entry : data.__t

    switch (kind) {
        case 'pixel':
            if (data.stage == 1) {
                if (data.price && !data.price.value && data.price.value !== 0)
                    invalidFields.price = data.price
                if (data.cost && !data.cost.value && data.cost.value !== 0)
                    invalidFields.cost = data.cost
                if (!data.inStockDate)
                    invalidFields.inStockDate = data.inStockDate
                if (data.regulations)
                    if (data.regulations.standard.other && (!data.regulations.additional || data.regulations.additional == ''))
                        invalidFields['regulations.additional'] = 'É necessário descrever se existem outras regulamentações'
                if (!data.demand) invalidFields.demand = data.demand
                else {
                    if (!data.demand.amount && data.demand.amount != 0) invalidFields['demand.amount'] = data.demand.amount
                    if (!data.demand.period) invalidFields['demand.period'] = data.demand.period
                }
            }
            break;
        case 'internal':
            break;
        case 'oem':
            if (data.inStockDate != undefined &&
                (data.inStockDate == null ||
                    (
                        (
                            data.inStockDate.fixed == null ||
                            data.inStockDate.fixed == ''
                        )
                        &&
                        (
                            data.inStockDate.offset == null ||
                            data.inStockDate.offset == ''
                        )
                    ))
            ) {
                invalidFields.inStockDateType = data.inStockDate
            }
            /*if (data.oemActivities) {
                for (let i = 0; i < data.oemActivities.length; i++) {
                    let activity = data.oemActivities[i]
                    if (!activity.date)
                        invalidFields['oemActivities.' + i + '.date'] = activity.date
                    //if (!activity.comment)
                    //    invalidFields['oemActivities.' + i + '.comment'] = activity.comment
                    //if (!activity.annex)
                    //    invalidFields['oemActivities.' + i + '.annex'] = activity.annex
                }
            }*/
            if (data.regulations)
                if (data.regulations.standard.other &&
                    (!data.regulations.additional || data.regulations.additional == ''))
                    invalidFields['regulations.additional'] = 'É necessário descrever se existem outras regulamentações'
            break;
        case 'custom':
            if (data.price && !data.price.value && data.price.value !== 0)
                invalidFields.price = data.price
            if (data.cost && !data.cost.value && data.cost.value !== 0)
                invalidFields.cost = data.cost
            if (data.npiRef != null && data.npiRef != undefined && data.npiRef != '') {
                if (data.npiRef instanceof mongoose.Types.ObjectId)
                    var npiRef = Npi.findOne({ _id: data.npiRef, stage: { $ne: 1 } })
                else
                    var npiRef = Npi.findOne({ number: data.npiRef, stage: { $ne: 1 } })

                if (!npiRef)
                    invalidFields.npiRef = data.npiRef
            } else {
                invalidFields.npiRef = data.npiRef
            }
            if (!data.inStockDate) invalidFields.inStockDate = data.inStockDate
            if (data.regulations)
                if (data.regulations.standard.other && (!data.regulations.additional || data.regulations.additional == ''))
                    invalidFields['regulations.additional'] = 'É necessário descrever se existem outras regulamentações'
            if (!data.demand) invalidFields.demand = data.demand
            else {
                if (!data.demand.amount && data.demand.amount != 0) invalidFields['demand.amount'] = data.demand.amount
                if (!data.demand.period) invalidFields['demand.period'] = data.demand.period
            }
            break;

        default:
            console.log('NPI entry: ' + kind)
            throw Error('Tipo de NPI inválido: ' + kind)
    }

    if (Object.keys(invalidFields).length == 0)
        return false
    else {
        for (prop in invalidFields) {
            if (invalidFields[prop] == undefined)
                invalidFields[prop] = String(invalidFields[prop])
        }
        return invalidFields
    }
}

function validateFiles(npi) {
    let result = {}
    Array.from(['resources', 'regulations', 'investment', 'projectCost']).forEach(field => {
        console.log(field, npi[field])
        if (!npi[field]) result[field] = npi[field]
        else if (!npi[field].annex) result[field + '.annex'] = npi[field].annex
        else
            npi[field].annex.forEach(
                file => {
                    if (!fs.existsSync(path.join(npi.number, file.fullName)))
                        result[field + '.annex'] = file.fullName
                }
            )
    })
    if (Object.keys(result).length) return result
    return null
}

function criticalSign(user, npiTask, changedFields) {
    if (changedFields) {
        changedFields.forEach(field => {
            let signChanged = false
            if (typeof field.status != 'undefined' && field.status == null) {
                console.log('unsingning')
                field.signature = null
                signChanged = true
            } else if (field.status) {
                console.log('singning')
                field.signature = { user: user._id, date: Date.now() }
                signChanged = true
            }
            if (signChanged) {
                npiTask.forEach(row => {
                    if (row._id == field._id) {
                        console.log('submited (un)signature ' + row.dept)
                        console.log(field.signature)
                        row.signature = field.signature
                    }
                })
            }
        });
    }
    return npiTask
}

function activitySign(user, npiTask, changedFields) {
    if (changedFields) {
        changedFields.forEach(activity => {
            let signChanged = false
            if (typeof activity.closed != 'undefined' && activity.closed == null) {
                console.log('unsingning')
                activity.signature = null
                signChanged = true
            } else if (activity.closed) {
                console.log('singning')
                activity.signature = { user: user._id, date: Date.now() }
                signChanged = true
            }
            if (signChanged) {
                npiTask.forEach(taskRow => {
                    if (taskRow._id == activity._id) {
                        console.log('submited (un)signature ' + taskRow.dept)
                        console.log(activity.signature)
                        taskRow.signature = activity.signature
                    }
                })
            }
        });
    }
    return npiTask
}

function migrateSign(npi) {
    if (npi.activities)
        npi.activities.forEach(taskRow => {
            taskRow.signature = { user: taskRow.responsible, date: taskRow.endDate }
        });
    //npi.validation.signature

    return npi
}

function validationSign(user, npiValidation, changedFields) {
    console.log("CHANGED FIELDS", changedFields)
    if (changedFields && changedFields.finalApproval) {
        if (changedFields.finalApproval.status == "false") {
            console.log("adding disapproval")
            npiValidation.disapprovals.push({
                comment: changedFields.finalApproval.comment,
                signature: {
                    user: user._id, date: Date.now()
                }
            })
            npiValidation.finalApproval = {
                status: null,
                comment: null,
                signature: null
            }
        }
        else if (changedFields.finalApproval.status == "true") {
            console.log("adding approval")
            npiValidation.finalApproval.signature = { user: user._id, date: Date.now() }
        }
    }
    return npiValidation
}

function requestSign(user, npiRequest, changedFields) {
    if (changedFields) {
        changedFields.forEach(activity => {
            let signChanged = false
            if (typeof activity.closed != 'undefined' && activity.closed == null) {
                console.log('unsingning')
                activity.signature = null
                signChanged = true
            } else if (activity.closed) {
                console.log('singning')
                activity.signature = { user: user._id, date: Date.now() }
                signChanged = true
            }
            if (signChanged) {
                npiRequest.forEach(taskRow => {
                    if (taskRow._id == activity._id) {
                        console.log('submited (un)signature ' + taskRow.dept)
                        console.log(activity.signature)
                        taskRow.signature = activity.signature
                    }
                })
            }
        });
    }
    return npiRequest
}

function finalSign(user, npiFinal) {
    npiFinal.signature = { user: user._id, date: Date.now() }
    console.log(npiFinal.signature)
    return npiFinal
}

function clientSign(user, npiClient) {
    npiClient.signature = { user: user._id, date: Date.now() }
    console.log(npiClient.signature)
    return npiClient
}

function updateObject(oldObject, newObject) {
    //var result = { 'updatedNpi': oldNpi, 'changedFields': {} }
    var changedFields = {}
    try {
        for (var prop in newObject) {
            if (
                newObject[prop] instanceof Number ||
                newObject[prop] instanceof String ||
                newObject[prop] instanceof Boolean ||
                newObject[prop] instanceof Date ||
                typeof newObject[prop] == 'number' ||
                typeof newObject[prop] == 'string' ||
                typeof newObject[prop] == 'boolean' ||
                typeof newObject[prop] == 'null' ||
                newObject[prop] instanceof mongoose.Types.ObjectId ||
                newObject[prop] == null || newObject[prop] === null
            ) {
                if (typeof oldObject[prop] !== "undefined") {
                    let objectsDiffer = false
                    if (oldObject[prop] == null || newObject[prop] == null) {
                        if (oldObject[prop] != newObject[prop]) {
                            objectsDiffer = true
                        }
                    } else {
                        if (oldObject[prop] instanceof Date
                            || typeof oldObject[prop] == 'date'
                            || typeof newObject[prop] == 'date'
                            || newObject[prop] instanceof Date
                            || prop == 'fixed') {
                            //console.log('converting ' + prop + ' to Date')
                            if (newObject[prop]) {
                                newObject[prop] = new Date(newObject[prop])
                                if (oldObject[prop].toString() != newObject[prop].toString()) {
                                    objectsDiffer = true
                                }
                            }
                        } else if (newObject[prop] instanceof mongoose.Types.ObjectId) {
                            if (oldObject[prop].toString() != newObject[prop].toString()) {
                                objectsDiffer = true
                            }
                        }
                        else if (oldObject[prop] != newObject[prop]) {
                            objectsDiffer = true
                        }
                    }
                    if (objectsDiffer) {
                        if (prop == 'fixed') {
                            //console.log('converting ' + prop + ' to Date')
                            if (newObject[prop]) {
                                newObject[prop] = new Date(newObject[prop])
                            }
                        }
                        //console.log(prop + ' field has changed:')
                        //console.log(oldObject[prop])
                        //console.log('!!==')
                        //console.log(newObject[prop])

                        oldObject[prop] = newObject[prop]
                        changedFields[prop] = newObject[prop]
                    }
                }
            } else if (Array.isArray(newObject[prop])) {
                //console.log(prop + ' is array')
                if (!oldObject[prop]) {
                    oldObject[prop] = newObject[prop]
                    changedFields = newObject[prop]
                } else {
                    let changedFieldsArr = []
                    for (let i = 0; i < newObject[prop].length; i++) {
                        let newChild = newObject[prop][i]
                        let childExists = false
                        for (let j = 0; j < oldObject[prop].length; j++) {
                            let oldChild = oldObject[prop][j]
                            if (newChild._id == oldChild._id) {
                                let childResult = updateObject(oldChild, newChild)
                                Object.assign(oldObject[prop][j], childResult.updatedObject)
                                if (Object.keys(childResult.changedFields).length > 0) {
                                    //console.log('child return with changes')
                                    childResult.changedFields._id = oldChild._id
                                    changedFieldsArr.push(childResult.changedFields)
                                }
                                childExists = true
                                break
                            }
                        }
                        if (!childExists) {
                            //console.log('Arrays are different, pushing new child')
                            oldObject[prop].push(newChild)
                        }
                    }
                    if (changedFieldsArr.length > 0)
                        changedFields[prop] = changedFieldsArr
                }
            } else if (Object.keys(newObject[prop]).length > 0) {
                //console.log('recursing ' + prop + ' in ' + newObject[prop])
                //console.log(prop + ' is instance of ' + typeof npi[prop])
                if (oldObject[prop] == null) {
                    oldObject[prop] = newObject[prop]
                    changedFields[prop] = newObject[prop]
                } else {
                    let childResult = updateObject(oldObject[prop], newObject[prop])
                    Object.assign(oldObject[prop], childResult.updatedObject)
                    if (Object.keys(childResult.changedFields).length > 0)
                        changedFields[prop] = childResult.changedFields
                    //console.log(result)
                }
            } else {
                //console.log(prop + ' is instance of ' + typeof npi[prop])
            }
        }
    } catch (e) {
        console.log(e)
    }
    return { 'updatedObject': oldObject, 'changedFields': changedFields }
}

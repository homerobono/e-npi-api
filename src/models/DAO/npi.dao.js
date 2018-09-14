var Npi = require('../npi.model')
var PixelNpi = require('../npi.pixel.model')
var OemNpi = require('../npi.oem.model')
var InternalNpi = require('../npi.internal.model')
var CustomNpi = require('../npi.custom.model')
var _ = require('underscore');
var mongoose = require('mongoose')

_this = this

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
            data = submitToAnalisys(data)
            var invalidFields = hasInvalidFields(data)
            if (invalidFields) throw ({ errors: invalidFields })
        }
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
        return newNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
}

exports.newNpiVersion = async function (req) {
    console.log('CREATING NEW NPI VERSION')
    var npi = req.body

    delete npi.activities
    delete npi.clientApproval
    delete npi.critical
    delete npi.id

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

    console.log('New Version Changed Fields:')
    console.log(changedFields)

    if (changedFields == '' || changedFields == null || !changedFields ||
        changedFields == [] || changedFields.length == 0 ||
        changedFields == undefined || Object.keys(changedFields).length == 0) {

        console.log("No changes made: new version not created")
        return "No changes made: new version not created"
    }

    var newNpiVersion = await this.createNpi(req)
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

    oldNpi.critical = sign(user, oldNpi.critical, changedFields.critical)
    /*
        console.log("updated Object")
        console.log(oldNpi)
    */
    try {
        if (oldNpi.stage > 1) {
            if (!oldNpi.critical || oldNpi.critical.length == 0)
                oldNpi = submitToAnalisys(oldNpi)
            var invalidFields = hasInvalidFields(oldNpi)
            if (invalidFields) throw ({ errors: invalidFields })

            if (oldNpi.stage == 2) {
                if (oldNpi.critical.every((analisys) => analisys.status == 'accept')) {
                    if (oldNpi.__t != 'oem') {
                        oldNpi = advanceToDevelopment(oldNpi)
                        changedFields.stage = 4
                    } else {
                        oldNpi = advanceToClientApproval(oldNpi)
                        changedFields.stage = 3
                    }
                }
            }
            if (oldNpi.stage == 3) {
                if (oldNpi.clientApproval) {
                    if (oldNpi.clientApproval.approval == 'accept') {
                        oldNpi = advanceToDevelopment(oldNpi)
                        changedFields.stage = 4
                    }
                } else
                    oldNpi.clientApproval = { approval: null, comment: null }
            }
        }
        console.log('changedFields')
        console.log(changedFields)

        if (!Object.keys(changedFields).length) return { npi: oldNpi, changedFields }
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
        .populate('requester', 'firstName lastName')
        .populate({
            path: 'critical.signature.user',
            model: 'User',
            select: 'firstName lastName'
        },
    );
    if (!npi || npi == null) throw Error('There is no NPI with this number: ' + npiNumber)
    //console.log(npi)
    return npi
}

exports.findNpiByNumber = async npiNumber => {
    var npi = await Npi.find({ number: npiNumber }).sort('-version')
        .populate('npiRef', '_id number name stage created')
        .populate('requester', 'firstName lastName')
        .populate({
            path: 'critical.signature.user',
            model: 'User',
            select: 'firstName lastName'
        },
    );
    if (!npi || npi == null) throw Error('There is no NPI with this number: ' + npiNumber)
    //console.log(npi)
    return npi
}

function submitToAnalisys(data) {
    console.log('submitting to analisys')

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

function advanceToDevelopment(data) {
    console.log('advancing to development')
    data.stage = 4
    data.activities = []
    global.MACRO_STAGES.forEach(stage => {
        data.activities.push({
            activity: stage.value,
            dept: stage.dept,
            date: Date.now() + stage.dateOffset * 24 * 3600 * 1000,
            registry: null,
            annex: null,
        })
    })
    return data
}

function advanceToClientApproval(data) {
    console.log('advancing to client approval')
    data.stage = 3
    data.clientApproval = { approval: null, comment: null }
    return data
}

function hasInvalidFields(data) {
    var invalidFields = {}

    if (!data.name) invalidFields.name = data.name
    if (!data.client) invalidFields.client = data.client
    if (!data.description) invalidFields.description = data.description
    if (!data.norms || !data.norms.description) invalidFields.norms = data.norms
    if (!data.resources || !data.resources.description) invalidFields.resources = data.resources
    if (!data.fiscals) invalidFields.fiscals = data.fiscals
    if (!data.complexity) invalidFields.complexity = data.complexity
    if (!data.investment && data.investment !== 0) invalidFields.investment = data.investment
    if (data.projectCost && !data.projectCost.cost && data.projectCost.cost !== 0) invalidFields.projectCost = data.projectCost

    if (data.critical && data.critical.length > 0) {
        for (let i = 0; i < data.critical.length; i++) {
            if (data.critical[i].status == 'deny' && !data.critical[i].comment)
                invalidFields['critical.' + i + '.comment'] = data.critical[i].comment
        }
    }

    var kind = data.entry ? data.entry : data.__t

    switch (kind) {
        case 'pixel':
            if (!data.price && data.price !== 0)
                invalidFields.price = data.price
            if (!data.cost && data.cost !== 0)
                invalidFields.cost = data.cost
            if (!data.inStockDate)
                invalidFields.inStockDate = data.inStockDate

            break;
        case 'internal':
            break;
        case 'oem':
            if (
                data.inStockDate == null ||
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
                )
            ) {
                invalidFields.inStockDateType = data.inStockDate
            }
            if (data.oemActivities) {
                for (let i = 0; i < data.oemActivities.length; i++) {
                    let activity = data.oemActivities[i]
                    if (!activity.date)
                        invalidFields['oemActivities.' + i + '.date'] = activity.date
                    //if (!activity.comment)
                    //    invalidFields['oemActivities.' + i + '.comment'] = activity.comment
                    //if (!activity.annex)
                    //    invalidFields['oemActivities.' + i + '.annex'] = activity.annex
                }
            }
            break;
        case 'custom':
            if (!data.price && data.price !== 0) invalidFields.price = data.price
            if (!data.cost && data.cost !== 0) invalidFields.cost = data.cost
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

function sign(user, npiCritical, criticalChangedFields) {
    if (criticalChangedFields) {
        criticalChangedFields.forEach(field => {
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
                npiCritical.forEach(row => {
                    if (row._id == field._id) {
                        console.log('submited (un)signature ' + row.dept)
                        console.log(field.signature)
                        row.signature = field.signature
                    }
                })
            }
        });
    }
    return npiCritical
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
                        console.log(prop + ' field has changed:')
                        console.log(oldObject[prop])
                        console.log('!!==')
                        console.log(newObject[prop])

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
                            console.log('Arrays are different, pushing new child')
                            oldObject[prop].push(newChild)
                        }
                    }
                    if (changedFieldsArr.length > 0)
                        changedFields[prop] = changedFieldsArr
                }
            } else if (Object.keys(newObject[prop]).length > 0) {
                console.log('recursing ' + prop + ' in ' + newObject[prop])
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

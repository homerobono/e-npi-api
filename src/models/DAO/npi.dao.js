var Npi = require('../npi.model')
var PixelNpi = require('../npi.pixel.model')
var OemNpi = require('../npi.oem.model')
var InternalNpi = require('../npi.internal.model')
var CustomNpi = require('../npi.custom.model')
var _ = require('underscore');

_this = this

exports.getNpis = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    try {
        var npis = await Npi.paginate(query, options)
        return npis;
    } catch (e) {
        throw Error('Error while paginating npi\'s')
    }
}

exports.createNpi = async function (req) {
    //console.log(req.user)

    let data = req.body

    data.created = Date.now();
    data.requester = req.user.data._id

    var kind = data.entry
    console.log(data)
    try {
        // Saving the Npi
        let newNpi = new Npi();
        if (data.stage == 2) {
            data = submitToAnalisys(data)
            var invalidFields = hasInvalidFields(data)
            if (invalidFields) throw ({ invalidFields })
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
        console.log('saved: ' + newNpi)
        return newNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
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
    console.log('npi')
    console.log(npi)
    console.log('oldNpi')
    console.log(oldNpi)

    var updateResult = updateObject(oldNpi, npi)

    var changedFields = updateResult.changedFields
    oldNpi = updateResult.updatedNpi
    
    console.log("updateResult")
    console.log(updateResult)

    console.log('changedFields')
    console.log(changedFields)

    try {
        if (oldNpi.stage > 1) {
            if (!oldNpi.critical)
                oldNpi = submitToAnalisys(oldNpi)
            npi.entry = oldNpi.__t
            var invalidFields = hasInvalidFields(npi)
            if (invalidFields) throw ({ invalidFields })
        }
        var savedNpi = await oldNpi.save()
        return { npi: savedNpi, changedFields: changedFields }
        //return savedNpi;
    } catch (e) {
        console.log(e)
        throw ({ message: e })
    }
}

exports.deleteNpi = async function (id) {

    // Delete the Npi
    try {
        var deleted = await Npi.remove({ _id: id })
        console.log(deleted)
        if (deleted.n === 0) {
            throw Error("Npi could not be deleted")
        }
        return deleted
    } catch (e) {
        throw Error("Error occured while Deleting the Npi: " + e)
    }
}

exports.findNpiById = async npiId =>
    await Npi.findById(npiId).populate('requester', "firstName", 'lastName');

exports.findNpiByNumber = async npiNumber => {
    var npi = await Npi.findOne({ number: npiNumber })
        .populate('requester', 'firstName lastName')
        .populate({
            path: 'critical.signature.user',
                model: 'User',
                select: 'firstName lastName'
            },
        );
    if (!npi || npi == null) throw Error('There is no NPI with this number: ' + npiNumber)
    console.log(npi.critical)
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

function hasInvalidFields(data) {
    var invalidFields = {}

    console.log('Invalid fields: data')
    console.log(data)

    if (!data.name) invalidFields.name = data.name
    if (!data.client) invalidFields.client = data.client
    if (!data.complexity) invalidFields.complexity = data.complexity
    if (!data.investment && data.investment !== 0) invalidFields.investment = data.investment
    if (!data.projectCost.cost && data.projectCost.cost !== 0) invalidFields.projectCost = data.projectCost

    switch (data.entry) {
        case 'pixel':
            if (!data.price && data.price !== 0) invalidFields.price = data.price
            if (!data.cost && data.cost !== 0) invalidFields.cost = data.cost
            break;
        case 'internal':
            break;
        case 'oem':
            /*if (
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
            ) invalidFields.inStockDate = data.inStockDate*/
            break;
        case 'custom':
            if (!data.price && data.price !== 0) invalidFields.price = data.price
            if (!data.cost && data.cost !== 0) invalidFields.cost = data.cost
            if (data.npiRef != null && data.npiRef != undefined) {
                var npiRef = this.findNpiByNumber(data.npiRef)
                if (!npiRef)
                    invalidFields.npiRef = data.npiRef
            } else {
                invalidFields.npiRef = data.npiRef
            }
            break;
        default:
            console.log('NPI entry: ' + data.entry)
            throw Error('Tipo de NPI inválido: ' + data.entry)
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

function sign(user, oldCriticalFields, newCriticalFields) {
    console.log(user)
    if (newCriticalFields) {
        for (var i = 0; i < newCriticalFields.length; i++) {
            if (newCriticalFields[i].status &&
                newCriticalFields[i].status !== oldCriticalFields[i].status) {
                console.log('singning ' + oldCriticalFields[i].dept)
                newCriticalFields[i].signature = { user: user._id, date: Date.now() }
            }
        }
    }
    return newCriticalFields
}

function updateObject(oldNpi, npi) {
    var result = { 'updatedNpi': oldNpi, 'changedFields': {} }
    try {
    for (var prop in npi) {
        if (npi[prop] instanceof Number ||
            npi[prop] instanceof String ||
            npi[prop] instanceof Boolean ||
            npi[prop] instanceof Date ||
            typeof npi[prop] == 'number' ||
            typeof npi[prop] == 'string' ||
            typeof npi[prop] == 'boolean' ||
            typeof npi[prop] == 'null' ||
            npi[prop] == null
        ){
            console.log('normal type instance: '+prop)
            if (oldNpi[prop] !== npi[prop]//){
                && oldNpi.hasOwnProperty(prop)) {
                console.log(prop + ':')
                console.log(oldNpi[prop])
                console.log('!!==')
                console.log(npi[prop])
                result.updatedNpi[prop] = npi[prop]
                result.changedFields[prop] = npi[prop]
            }
        } else if (
            Object.keys(npi[prop]>0)
        ) {
            //console.log('recursing '+prop)
            //console.log(prop + ' is instance of ' + typeof npi[prop])
            if(result.updatedNpi[prop] == null) result.updatedNpi[prop] = npi[prop]
            result.changedFields[prop] = npi[prop]
            var childResult = updateObject(oldNpi[prop], npi[prop])
            Object.assign(result.updatedNpi[prop], childResult.updatedNpi)
            Object.assign(result.changedFields[prop], childResult.changedFields)
            //console.log(result)
        } else {
            //console.log(prop + ' is instance of ' + typeof npi[prop])
        }
    }
} catch(e){
    console.log(e)
}
    return result
}

        /*
        if (!(_.isEqual(oldNpi[prop], npi[prop]))) {
            if (prop == 'critical') {
                npi.critical = sign(user, oldNpi.critical, npi.critical)
            }
            if (npi[prop] != null) {
                console.log(prop + ':')
                console.log(oldNpi[prop])
                console.log('!!==')
                console.log(npi[prop])
                oldNpi[prop] = npi[prop]
                changedFields[prop] = npi[prop]
            }
        }*/
    

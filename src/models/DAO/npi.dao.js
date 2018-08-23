var Npi = require('../npi.model')
var PixelNpi = require('../npi.pixel.model')
var OemNpi = require('../npi.oem.model')
var InternalNpi = require('../npi.internal.model')
var CustomNpi = require('../npi.custom.model')
var _ = require('underscore');

_this = this

exports.getNpis = async function(query, page, limit){

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

exports.createNpi = async function(req){
    //console.log(req.user)
    
    let data = req.body

    data.created = Date.now();
    data.requester = req.user.data._id
    
    var kind = data.entry
    
    try{
        // Saving the Npi
        let newNpi = new Npi();
        if (data.stage < 2) {
            data.number = null
        } else {
            var invalidFields = hasInvalidFields(data)
            if (invalidFields) throw ({invalidFields})
        }
        switch(kind) {
            case 'pixel' : 
                newNpi = await PixelNpi.create(data);
                break;
            case 'internal' : 
                newNpi = await InternalNpi.create(data);
                break;
            case 'oem' : 
                newNpi = await OemNpi.create(data);
                break;
            case 'custom' : 
                newNpi = await CustomNpi.create(data);
                break;
            default :
                console.log('NPI entry: '+kind)
                throw Error('Tipo de NPI inválido: '+kind)
        } 
        console.log('saved: ' + newNpi)
        return newNpi;
    } catch(e) {
        console.log(e)
        throw ({message: e})
    }
}

exports.updateNpi = async function(user, npi){
    var id = npi.id
    try {
        var oldNpi = await Npi.findById(id);
    } catch(e){
        throw Error("Error occured while Finding the Npi")
    }

    if(!oldNpi){
        throw Error("No NPI id "+id)
    }
    console.log('npi')
    console.log(npi)
    console.log('oldNpi')
    console.log(oldNpi)

    var changedFields = {}
    for (var prop in npi) {
        if (!(_.isEqual(oldNpi[prop], npi[prop]))){
            if(npi[prop]!=null){
                console.log(prop+':')
                console.log(oldNpi[prop])
                console.log('!!==')
                console.log(npi[prop])
                oldNpi[prop] = npi[prop]
                changedFields[prop] = npi[prop]
            }
        }
    }

    //console.log('changedFields')
    //console.log(changedFields)

    try{
        var savedNpi = await oldNpi.save()
        return { npi: savedNpi, changedFields : changedFields }
        //return savedNpi;
    }catch(e){
        throw Error("An error occured while updating the Npi: "+e);
    }
}

exports.deleteNpi = async function(id){
    
    // Delete the Npi
    try{
        var deleted = await Npi.remove({_id: id})
        console.log(deleted)
        if(deleted.n === 0){
            throw Error("Npi could not be deleted")
        }
        return deleted
    } catch(e){
        throw Error("Error occured while Deleting the Npi: "+e)
    }
}

exports.findNpiById = async npiId => 
    await Npi.findById(npiId).populate('requester', "firstName", 'lastName');

exports.findNpiByNumber = async npiNumber => {
    var npi = await Npi.findOne({number : npiNumber}).populate('requester', 'firstName lastName');
    if (!npi || npi==null) throw Error('There is no NPI with this number: '+npiNumber)
    return npi
}

function hasInvalidFields(data) {
    var invalidFields = {}

    console.log(data)

    if (!data.name) invalidFields.name = data.name
    if (!data.client) invalidFields.client = data.client
    if (!data.complexity) invalidFields.complexity = data.complexity
    if (data.investment=='' && data.investment!==0) invalidFields.investment = data.investment
    if (!data.projectCost && data.projectCost!==0) invalidFields.projectCost = data.projectCost

    switch(data.entry) {
        case 'pixel' : 
            if (!data.price && data.price !==0) invalidFields.price = data.price
            if (!data.cost && data.cost !==0) invalidFields.cost = data.cost
            break;
        case 'internal' : 
            break;
        case 'oem' :             
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
        case 'custom' :
            if (!data.price && data.price !==0) invalidFields.price = data.price
            if (!data.cost && data.cost !==0) invalidFields.cost = data.cost 
            if (data.npiRef != null && data.npiRef != undefined){
                var npiRef = this.findNpiByNumber(data.npiRef)
                if (!npiRef) 
                    invalidFields.npiRef = data.npiRef
            } else {
                invalidFields.npiRef = data.npiRef
            }
            break;
        default :
            console.log('NPI entry: '+data.entry)
            throw Error('Tipo de NPI inválido: '+data.entry)
    }

    if (Object.keys(invalidFields).length==0)
        return false
    else {
        for (prop in invalidFields) {
            if (invalidFields[prop] == undefined)
                invalidFields[prop] = String(invalidFields[prop])
        }
        return invalidFields
    }
}

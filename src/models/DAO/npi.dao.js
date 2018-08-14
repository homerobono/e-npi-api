var Npi = require('../npi.model')
var PixelNpi = require('../npi.pixel.model')
var OemNpi = require('../npi.oem.model')
var InternalNpi = require('../npi.internal.model')
var CustomNpi = require('../npi.custom.model')

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

exports.createNpi = async function(data){
    
    data.created = Date.now();
    console.log(data.entry)

    var kind = data.entry

    console.log(data)
    try{
        // Saving the Npi
        let newNpi = new Npi();
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
                throw Error('Tipo de NPI inválido')
        } 
        console.log('saved: ' + newNpi)
        return newNpi;
    } catch(e) {
        console.log(e)
        throw Error(e)
    }
}

exports.updateNpi = async function(npi){
    var id = npi.id

    try {
        var oldNpi = await Npi.findById(id);
    } catch(e){
        throw Error("Error occured while Finding the Npi")
    }
    if(!oldNpi){
        return false;
    }

    console.log(oldNpi)

    //Edit the Npi Object
    oldNpi.title = npi.title
    oldNpi.description = npi.description
    oldNpi.status = npi.status


    console.log(oldNpi)

    try{
        var savedNpi = await oldNpi.save()
        return savedNpi;
    }catch(e){
        throw Error("And Error occured while updating the Npi");
    }
}

exports.deleteNpi = async function(id){
    
    // Delete the Npi
    try{
        var deleted = await Npi.remove({_id: id})
        console.log(deleted)
        if(deleted.n === 0){
            throw Error("Npi Could not be deleted")
        }
        return deleted
    } catch(e){
        throw Error("Error Occured while Deleting the Npi: "+e)
    }
}

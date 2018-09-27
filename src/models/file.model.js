var path = require('path');

class FileDescriptor {
    constructor(name, path){
        this.name = name
        this.path = path
    }

    get fullName(){
        let p = path.join(this.path, this.name)
        console.log(p)
        return p
    }
}

module.exports = FileDescriptor

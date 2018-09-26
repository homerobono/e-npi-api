var path = require('path');

class FileDescriptor {
    constructor(name, path){
        this.name = name
        this.path = path
    }

    get fullName(){
        return path.join(path,name)
    }
}

module.exports = FileDescriptor

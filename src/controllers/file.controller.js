var mime = require('mime');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));
var path = require('path');
var multer = require('multer');
var dateformat = require('./utils/dateformat');
var pathResolver = require('./utils/pathresolver');
var archiver = require('archiver')
var npiDao = require('../models/DAO/npi.dao')

const pathresolver = pathResolver.baseDir = function (req) {
  return global.FILES_DIR;
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Path: ')
    console.log(req.body)
    fs.mkdirsSync(path.join(pathResolver.baseDir(req), req.body.destination), 0o744)
    cb(null, path.join(pathResolver.baseDir(req), req.body.destination));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

exports.uploadFiles = multer({ storage: storage }).any()

exports.uploadResponse = function (req, res, next) {
  console.log('Upload Body', req.body, req.files)
  npiDao.updateAnnexList(req.body._id, req.body.destination+'/')
  res.status(200).send({
    "result": {
      "success": true,
      "error": null
    }
  });

}

exports.list = function (req, res, next) {

  var promise;
  var self = this;
  var fsPath = path.join(pathResolver.baseDir(req), req.body.params.path);

  promise = fs.statAsync(fsPath).then(function (stats) {
    if (!stats.isDirectory()) {
      throw new Error("Directory " + fsPath + ' does not exist!');
    }
  });

  promise = promise.then(function () {
    return fs.readdirAsync(fsPath);
  });

  promise = promise.then(function (fileNames) {

    return Promise.map(fileNames, function (fileName) {

      var filePath = path.join(fsPath, fileName);

      return fs.statAsync(filePath).then(function (stat) {

        return {
          name: fileName,
          rights: "drwxr-xr-x", // TODO
          size: stat.size,
          date: dateformat.dateToString(stat.mtime),
          type: stat.isDirectory() ? 'dir' : 'file',
        };
      });
    });
  });

  promise = promise.then(function (files) {
    res.status(200);
    res.send({
      "result": files
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.download = function (req, res, next) {

  var filePath = path.join(pathResolver.baseDir(req), req.query.path);
  var fileName = path.basename(filePath);
  var promise;

  console.log(filePath)
  console.log(fileName)

  promise = fs.statAsync(filePath);

  var mimeType = mime.lookup(filePath);
  console.log('mimetype: ' + mimeType);

  res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
  res.setHeader('Content-type', mimeType);

  promise = promise.then(function (stat) {

    if (!stat.isFile()) {
      console.log('Element is folder: compressing and sending to downloading')
      var output = fs.createWriteStream('/tmp/' + fileName + '-compressed.zip');
      var archive = archiver('zip', {
        zlib: { level: 1 } // Sets the compression level.
      });

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      output.on('end', function () {
        console.log('Data has been drained');
      });

      archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
          console.log(err)
        } else throw err;
      });

      archive.on('error', function (err) {
        throw err;
      });

      // pipe archive data to the file
      archive.pipe(output);

      archive.directory(filePath, false);
      archive.finalize();
      archive.pipe(res)
    } else {
      var filestream = fs.createReadStream(filePath);
      filestream.pipe(res);
    }
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.remove = function (req, res, next) {

  var filePath = path.join(pathResolver.baseDir(req), req.body.params.path, req.body.params.name);
  var promise = fs.remove(filePath);
  console.log("Remove body", req.body)
  npiDao.updateAnnexList(req.body.params.path.replace(/^\/?([a-z0-9]*)\/.*$/, "$1"), req.body.params.path)

  promise = promise.then(function () {
    res.status(200);
    res.send({
      "result": {
        "success": true,
        "error": null
      }
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.createFolder = function (req, res, next) {

  var folderPath = path.join(pathResolver.baseDir(req), req.body.params.path, req.body.params.name);
  console.log("Folder Path: ", folderPath);
  var promise = fs.mkdirs(folderPath, 0o777);
  console.log("Create folder body", req.body)
  npiDao.updateAnnexList(req.body.params.path.replace(/^\/?([a-z0-9]*)\/.*$/, "$1"), req.body.params.path)

  promise = promise.then(function () {
    res.status(200);
    res.send({
      "result": {
        "success": true,
        "error": null
      }
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.rename = function (req, res, next) {

  var filePath = path.join(pathResolver.baseDir(req), req.body.params.path, req.body.params.name);
  var newPath = path.join(pathResolver.baseDir(req), req.body.params.path, req.body.params.newName);

  var promise = fs.renameAsync(filePath, newPath);
  console.log("Rename body", req.body)

  promise = promise.then(function () {
    npiDao.updateAnnexList(req.body.params.path.replace(/^\/?([a-z0-9]*)\/.*$/, "$1"), req.body.params.path)
    res.status(200);
    res.send({
      "result": {
        "success": true,
        "error": null
      }
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.move = function (req, res, next) {

  var oldPath = path.join(pathResolver.baseDir(req), req.body.params.path, req.body.params.name);
  var newPath = path.join(pathResolver.baseDir(req), req.body.params.newPath, req.body.params.name);
  console.log("Move folder body", req.body)

  console.log("copying " + oldPath + ' to ' + newPath)
  var promise = fs.move(oldPath, newPath);

  promise = promise.then(function () {
    npiDao.updateAnnexList(req.body.params.path.replace(/^\/?([a-z0-9]*)\/.*$/, "$1"), req.body.params.path)
    res.status(200);
    res.send({
      "result": {
        "success": true,
        "error": null
      }
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}

exports.copy = function (req, res, next) {

  var oldPath = path.join(pathResolver.baseDir(req), req.body.params.path);
  var newPath = path.join(pathResolver.baseDir(req), req.body.params.newPath);

  var promise = fs.copy(oldPath, newPath);

  promise = promise.then(function () {
    res.status(200);
    res.send({
      "result": {
        "success": true,
        "error": null
      }
    });
  });

  promise = promise.catch(function (err) {
    res.status(500);
    res.send({
      "result": {
        "success": false,
        "error": err
      }
    });
  });

  return promise;
}


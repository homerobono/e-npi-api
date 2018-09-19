var mime = require('mime');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs.extra'));
var path = require('path');
var multer = require('multer');
var dateformat = require('./utils/dateformat');
var pathResolver = require('./utils/pathresolver');

const pathresolver = pathResolver.baseDir = function (req) {
  return global.FILES_DIR;
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(pathResolver.baseDir(req), req.body.destination));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage }).any();

exports.upload = function (req, res, next) {
  console.log(req.body)
  console.log(req.body.destination)
  console.log(req.params.body)
  console.log(req.body.params)
  console.log(req.destination)
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      return res.status(422).send("an error occured while uploading")
    }
    // No error occured.
    paths = req.files;
    next(res.send("Upload completed for " + paths));
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

  promise = fs.statAsync(filePath);

  promise = promise.then(function (stat) {

    if (!stat.isFile()) {
      throw new Error("Cannot access file " + filePath + " (or is no file)");
    }

    var mimeType = mime.lookup(filePath);
    console.log('mimetype: ' + mimeType);

    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', mimeType);

    var filestream = fs.createReadStream(filePath);
    filestream.pipe(res);
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

exports.uploadResponse = function (req, res, next) {

  res.status(200);
  res.send({
    "result": {
      "success": true,
      "error": null
    }
  });
}

exports.remove = function (req, res, next) {

  var filePath = path.join(pathResolver.baseDir(req), req.body.params.path);
  var promise = fs.unlinkAsync(filePath);

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
  console.log(folderPath);
  var promise = fs.mkdirAsync(folderPath, 0o777);

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

  var oldPath = path.join(pathResolver.baseDir(req), req.body.params.path);
  var newPath = path.join(pathResolver.baseDir(req), req.body.params.newPath);

  var promise = fs.renameAsync(oldPath, newPath);

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

exports.copy = function (req, res, next) {

  var oldPath = path.join(pathResolver.baseDir(req), req.body.params.path);
  var newPath = path.join(pathResolver.baseDir(req), req.body.params.newPath);

  var promise = fs.copyAsync(oldPath, newPath);

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


'use strict';

let Promise = require('bluebird');
let config  = require('./config');
let AWS     = require('aws-sdk');
let s3      = new AWS.S3({params: {Bucket: config.s3.bucket}});

function stream (key) {
  return new Promise((fulfill, reject) => {
    s3.getObject({Key: key})
    .on('error', reject)
    .on('httpHeaders', (statusCode, headers, res) => {
      switch (statusCode) {
        case 200:
          return fulfill(res.httpResponse.stream);
        case 404:
          return fulfill();
        default:
          reject(new Error(`http error reading ${key}: ${res.statusCode}`));
      }
    })
    .send();
  });
}

function download (key) {
  return new Promise((fulfill, reject) => {
    s3.getObject({Key: key}, (err, data) => {
      if (err && err.code === 'NoSuchKey') fulfill();
      else if (err) reject(err);
      else fulfill(data.Body.toString());
    });
  });
}

function upload (opts) {
  return new Promise((fulfill, reject) => {
    s3.upload(opts, err => {
      if (err) reject(err);
      else     fulfill(err);
    });
  });
}

module.exports.stream   = stream;
module.exports.download = download;
module.exports.upload   = upload;

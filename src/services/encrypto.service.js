const CryptoJS = require("crypto-js");

exports.encryptData = async (message) => CryptoJS.HmacSHA512(message, global.ENCRYPT_KEY).toString();

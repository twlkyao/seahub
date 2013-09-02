importScripts('CryptoJS/rollups/aes.js');
importScripts('CryptoJS/rollups/pbkdf2.js');

self.onmessage = function (oEvent) {
    decrypt(oEvent);
}

function decrypt(oEvent) {
  var decrypted = {index: oEvent.data.index};
  var salt = CryptoJS.lib.WordArray.random(128/8);
  var t_start = new Date().getTime();
  // key gen
  var key = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 256/32, iterations: 1000 });

  decrypted.key_gen_time = new Date().getTime() - t_start;
  var fileData = oEvent.data.block;
  var passphrase = oEvent.data.passphrase;
  try{
    // Decrypt fileData
    //decrypted.fileData = CryptoJS.AES.decrypt(fileData, passphrase).toString(CryptoJS.enc.Utf8);
    decrypted.fileData = fileData;
    postMessage(decrypted);
  } catch (e){
    postMessage("Error"); // usually bad password
  }
}

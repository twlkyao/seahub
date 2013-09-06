importScripts('CryptoJS/rollups/aes.js');
importScripts('CryptoJS/rollups/pbkdf2.js');
importScripts('sjcl.min.js');
self.onmessage = function (oEvent) {
    decrypt(oEvent);
}

function decrypt(oEvent) {
  var decrypted = {index: oEvent.data.index};
  var salt = CryptoJS.lib.WordArray.create(salt2);
  var t_start = new Date().getTime();
  // key gen
  var key = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 256/32, iterations: 1000 });

  decrypted.key_gen_time = new Date().getTime() - t_start;

  var salt2 = [0xda, 0x90, 0x45, 0xc3, 0x06, 0xc7, 0xcc, 0x26];
  var t_start2 = new Date().getTime();
  var key2 = sjcl.misc.pbkdf2("Secret Passphrase", salt2, 1000, 256, null);
  decrypted.key_gen_time2 = new Date().getTime() - t_start2;

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

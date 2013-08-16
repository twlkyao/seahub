importScripts('CryptoJS/rollups/aes.js');

var Latin1Formatter = {
  /** 
   * Converts an OpenSSL-style string using Latin1 to a cipher params object.
   *
   * @param {string} openSSLStr The OpenSSL-style string.
   *
   * @return {CipherParams} The cipher params object.
   *
   */
  parse: function (str) {
    var ciphertext = CryptoJS.enc.Latin1.parse(str), salt;

    // Test for salt
    if (ciphertext.words[0] == 0x53616c74 && ciphertext.words[1] == 0x65645f5f) {
      // Extract salt
      salt = CryptoJS.lib.WordArray.create(ciphertext.words.slice(2, 4));

      // Remove salt from ciphertext
      ciphertext.words.splice(0, 4);
      ciphertext.sigBytes -= 16;
    }

    return CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext, salt: salt });
  }
};


self.onmessage = function (oEvent) {
    decrypt(oEvent);
}

function decrypt(oEvent) {
  var decrypted = {index: oEvent.data.index};
  //var fileData = Latin1Formatter.parse(oEvent.data.block);
  var fileData = oEvent.data.block;
  //var passphrase = oEvent.data.passphrase;
  var passphrase = '111';
  try{
    // Decrypt fileData
    //decrypted.fileData = CryptoJS.AES.decrypt(fileData, passphrase).toString(CryptoJS.enc.Utf8);
    decrypted.fileData = fileData;
    postMessage(decrypted);
  } catch (e){
    postMessage("Error"); // usually bad password
  }
}

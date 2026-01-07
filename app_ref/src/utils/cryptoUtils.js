import CryptoJS from "crypto-js";
export const encryptData = (data, secretKey) => {
  const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Hex.parse(secretKey),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return { iv: iv.toString(CryptoJS.enc.Hex), data: encrypted.toString() };
};

export const decryptData = (encryptedData, secretKey) => {
  const { iv, data } = encryptedData;
  const decrypted = CryptoJS.AES.decrypt(
    data,
    CryptoJS.enc.Hex.parse(secretKey),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
};

import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.APP_SECRET as string;

/**
 * 服务端加密
 */
export function encryptPayload(data: any): string {
  const text = JSON.stringify(data);
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

/**
 * 服务端解密
 */
export function decryptPayload(cipher: string): any {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  const text = bytes.toString(CryptoJS.enc.Utf8);

  if (!text) return null;
  return JSON.parse(text);
}
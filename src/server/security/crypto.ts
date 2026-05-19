export async function encryptText(
    text: string,
    password: string
  ) {
    const encoder = new TextEncoder();
  
    const iv = crypto.getRandomValues(
      new Uint8Array(12)
    );
  
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
  
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("lifekey-salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt"]
    );
  
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      encoder.encode(text)
    );
  
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    };
  }
  
  export async function decryptText(
    encryptedData: number[],
    iv: number[],
    password: string
  ) {
    const encoder = new TextEncoder();
  
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
  
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("lifekey-salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["decrypt"]
    );
  
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
      },
      aesKey,
      new Uint8Array(encryptedData)
    );
  
    return new TextDecoder().decode(decrypted);
  }
import * as crypto from "crypto";
import {Utils} from "./Utils";

export namespace CryptoUtils {

    import GetRandomString = Utils.GetRandomString;

    export function CreateHash(password: string, salt: string = GetRandomString(64)): string {
        const hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        const value = hash.digest('base64');
        return `${salt}#${value}`;
    }

    export function VerifyHash(password: string, hash: string): boolean {
        try {
            const hashArr = hash.split('#');
            const salt = hashArr[0];
            const passwordHash = hashArr[1];
            return CreateHash(password, salt).split('#')[1] === passwordHash;
        } catch (e) {
            return false;
        }
    }

    const EncryptAlgorithm = 'aes-256-cbc'

    export function EncryptText(text: string): string {
        let salt = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv(EncryptAlgorithm, Buffer.from(process.env.CRYPTO_TOKEN, 'base64'), salt);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Buffer.from(`${salt.toString('base64')}#${encrypted.toString('base64')}`).toString('base64');
    }

    export function DecryptText(text: string): string {
        let dataBuffer = Buffer.from(text, 'base64').toString().split('#');
        let salt = Buffer.from(dataBuffer[0], 'base64');
        let encryptedText = Buffer.from(dataBuffer[1], 'base64');
        let decipher = crypto.createDecipheriv(EncryptAlgorithm, Buffer.from(process.env.CRYPTO_TOKEN, 'base64'), salt);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}

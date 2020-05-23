
import * as crypto from 'crypto';
import * as moment from "moment";

export namespace Utils {

    export const GetRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

    export const GetRandomString = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for ( let i = 0; i < length; i++ )
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        return result;
    }

    export function CreateHash(password: string, salt: string = GetRandomString(64)): any {
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

    export const GetDateFormat = () => moment(Date.now()).format('DD-MM-YYYY HH:mm:ss');

}

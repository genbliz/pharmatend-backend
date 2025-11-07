import bcrypt from "bcryptjs";
class BcryptServiceBase {
    validatePassword(passwordInput, passwordHashed) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(passwordInput, passwordHashed, (err, success) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(success);
                }
            });
        });
    }
    async createHashedPassword(password, intensity = 10) {
        const salt = await this.bcryptGenSalt(intensity);
        return await this.bcryptHash(password, salt);
    }
    bcryptGenSalt(intensity) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(intensity, (err, salt) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(salt);
                }
            });
        });
    }
    bcryptHash(password, salt) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(hash);
                }
            });
        });
    }
}
export const BcryptService = new BcryptServiceBase();
//# sourceMappingURL=bcrypt-service.js.map
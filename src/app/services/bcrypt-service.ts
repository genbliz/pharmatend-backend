import bcrypt from "bcryptjs";

class BcryptServiceBase {
  //
  validatePassword(passwordInput: string, passwordHashed: string) {
    return new Promise<boolean>((resolve, reject) => {
      bcrypt.compare(passwordInput, passwordHashed, (err, success) => {
        if (err) {
          reject(err);
        } else {
          resolve(success === true);
        }
      });
    });
  }

  async createHashedPassword(password: string, intensity = 10) {
    const salt = await this.bcryptGenSalt(intensity);
    return await this.bcryptHash(password, salt);
  }

  private bcryptGenSalt(intensity: number) {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(intensity, (err, salt) => {
        if (err) {
          reject(err);
        } else if (salt) {
          resolve(salt);
        } else {
          reject("Invalid salt");
        }
      });
    });
  }

  private bcryptHash(password: string, salt: string | number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else if (hash) {
          resolve(hash);
        } else {
          reject("Invalid hash");
        }
      });
    });
  }
}

export const BcryptService = new BcryptServiceBase();

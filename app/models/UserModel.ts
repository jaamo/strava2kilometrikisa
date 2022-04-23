import mongoose, { FilterQuery } from 'mongoose';
import crypto from 'crypto';
import strava from 'strava-v3';
import logger from '../helpers/logger';
import HttpException from '../helpers/exceptions';

const algorithm = 'aes-256-ctr';
const cryptoPassword = process.env.KILOMETRIKISA_CRYPTO_PASSWORD ?? '';

export interface User extends mongoose.Document {
  stravaUserId: number;
  stravaToken: string;
  tokenExpire: number;
  refreshToken: string;
  kilometrikisaToken: string;
  kilometrikisaSessionId: string;
  kilometrikisaUsername: string;
  kilometrikisaPassword: string;
  autosync: boolean;
  ebike: boolean;

  updateToken: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  getPassword: () => string;
}

const UserSchema = new mongoose.Schema<User>({
  stravaUserId: { type: Number },
  stravaToken: { type: String },
  tokenExpire: { type: Number },
  refreshToken: { type: String },
  kilometrikisaToken: { type: String },
  kilometrikisaSessionId: { type: String },
  kilometrikisaUsername: { type: String },
  kilometrikisaPassword: { type: String },

  // Sync kilometers automatically.
  autosync: { type: Boolean },

  // Sync e-bike kilometers.
  ebike: { type: Boolean },
});

// https://github.com/UnbounDev/node-strava-v3/blob/master/lib/oauth.js#L102
UserSchema.methods.updateToken = async function (this: User) {
  const d = Date.now();
  if (d > this.tokenExpire) {
    try {
      const account = await strava.oauth.refreshToken(this.refreshToken);
      this.stravaToken = account.access_token;
      this.tokenExpire = account.expires_at * 1000;
      this.refreshToken = account.refresh_token;
      await this.save();
    } catch (err) {
      logger.warn('Error updating the user token', err);
    }
  }
};

// Encrypt and set password.
UserSchema.methods.setPassword = function (this: User, password: string) {
  // TODO: Do not use deprecated method
  const cipher = crypto.createCipher(algorithm, cryptoPassword);
  let crypted = cipher.update(password, 'utf8', 'hex');
  crypted += cipher.final('hex');
  this.kilometrikisaPassword = crypted;
};

// Decrypt and get password.
UserSchema.methods.getPassword = function (this: User) {
  // TODO: Do not use deprecated method
  const decipher = crypto.createDecipher(algorithm, cryptoPassword);
  let dec = decipher.update(this.kilometrikisaPassword, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

// Create model.
export const UserModel = mongoose.model<User>('User', UserSchema);

/**
 * An utility method to fetch users and throw an exception always if one is not found.
 * @param filter
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findUser(filter: FilterQuery<any>): Promise<User> {
  const user = await UserModel.findOne(filter);
  if (!user) {
    throw new HttpException(404, 'User not found!');
  }
  return user;
}

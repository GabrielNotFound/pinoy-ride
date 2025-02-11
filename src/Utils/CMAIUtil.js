/* eslint-disable no-console */
import { NetworkInfo } from 'react-native-network-info';
import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import Constants from '../Utils/Constants';
import ExpoConstants from 'expo-constants';
import { getAllServices, getAppDataFiltered } from '@/Services/Database';
import { Linking, Platform } from 'react-native';
import RNSimpleCrypto from 'react-native-simple-crypto';

const CMAIUtil = {
  debug: function (string) {
    if (__DEV__) {
      console.log(string);
    }
  },

  debugDeep: function (string) {
    if (__DEV__) {
      console.log(JSON.stringify(string, null, 2));
    }
  },

  debugObjectLoop: function (obj) {
    if (__DEV__) {
      for (const key in obj) {
        console.debug(`${key}: ${obj[key]}`);
      }
    }
  },

  getDeviceIP: async function () {
    return await NetworkInfo.getIPAddress();
  },

  getDeviceIPV4Address: async function () {
    return await NetworkInfo.getIPV4Address();
  },

  getGeoLocation: async function () {
    try {
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Location request timed out'));
        }, 3000);
      });

      const position = await Promise.race([locationPromise, timeoutPromise]);
      return `${position.coords.latitude},${position.coords.longitude}`;
    } catch (e) {
      return '';
    }
  },

  getRandomWords: function (length) {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  getUnixTimestamp: function () {
    return Math.round(new Date().getTime() / 1000);
  },

  getHash: async function (modeType, string) {
    if (string == '') {
      string = this.getRandomWords(256) + this.getUnixTimestamp();
    }

    // this.debug(modeType);
    // this.debug(string);

    let hash = '';

    if (modeType == 256) {
      hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        string,
      );
    } else if (modeType == 512) {
      hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA512,
        string,
      );
    }

    return hash;
  },

  getAppVersionNo: function () {
    return ExpoConstants.expoConfig.version;
  },

  getUUID: function () {
    return uuid.v4();
  },

  getPlatform: function () {
    return Platform.OS;
  },

  getPlatformVersion: function () {
    return Platform.Version;
  },

  getPlatformBrand: function () {
    return DeviceInfo.getBrand();
  },

  getPlatformUniqueId: async function () {
    return await DeviceInfo.getUniqueId();
  },

  getPlatformDeviceId: function () {
    return DeviceInfo.getDeviceId();
  },

  getBundleId: function () {
    return DeviceInfo.getBundleId();
  },

  getJSONString: function (json) {
    let string = JSON.stringify(json);
    return string;
  },

  getUserID: async function () {
    let app_data = getAppDataFiltered('key = "USER_ID"');
    let userId = '';
    if (app_data.value) {
      userId = await this.aes_decrypt(app_data.value);
    }
    return userId;
  },

  getSessionID: function () {
    let app_data = getAppDataFiltered('key = "SESSION_ID"');
    return app_data.value;
  },

  getRegistrationID: function () {
    let app_data = getAppDataFiltered('key = "REGISTRATION_ID"');
    return app_data.value;
  },

  goToDeviceSettings: function () {
    Platform.OS === 'ios'
      ? Linking.openURL('app-settings:')
      : Linking.sendIntent('android.settings.SETTINGS');
  },

  /*
  AES ENCRYPT/DECRYPT
  SAMPLE
    let encrypted = await this.aes_encrypt("3650");
    let decrypted = await this.aes_decrypt(encrypted);
  */

  aes_encrypt: async function (string) {
    try {
      const toHex = RNSimpleCrypto.utils.convertArrayBufferToHex;

      const strArrayBuffer =
        RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(string);

      const cipherTextArrayBuffer = await RNSimpleCrypto.AES.encrypt(
        strArrayBuffer,
        RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(Constants.AES_KEY),
        RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(Constants.AES_IV),
      );
      if (__DEV__) {
        console.log('AES encrypt', toHex(cipherTextArrayBuffer));
      }
      return toHex(cipherTextArrayBuffer);
    } catch (error) {
      console.log(error);
    }
  },

  aes_decrypt: async function (hex_string) {
    try {
      const toUtf8 = RNSimpleCrypto.utils.convertArrayBufferToUtf8;

      const decryptedArrayBuffer = await RNSimpleCrypto.AES.decrypt(
        RNSimpleCrypto.utils.convertHexToArrayBuffer(hex_string),
        RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(Constants.AES_KEY),
        RNSimpleCrypto.utils.convertUtf8ToArrayBuffer(Constants.AES_IV),
      );

      if (__DEV__) {
        console.log('AES decrypt here....', toUtf8(decryptedArrayBuffer));
      }
      return toUtf8(decryptedArrayBuffer);
    } catch (error) {
      console.log(error);
    }
  },

  hexToBinary: function (hex) {
    // Convert the buffer to a Uint8Array
    return new Uint8Array(hex);
  },

  fn: function (amount) {
    return Number(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  maskAmount: function (amount) {
    return amount.replace(/./g, '*');
  },

  getWUAmount(str, index, stringToAdd) {
    return str.slice(0, index) + stringToAdd + str.slice(index);
  },

  checkInactiveProduct: function (product) {
    const products = getAllServices();
    // Convert the search term to lowercase for case-insensitive comparison
    const searchTerm = product?.toLowerCase();

    // Return null if searchTerm is empty or blank
    if (searchTerm === '') {
      return null;
    }

    // Find the first product matching the search term in product_desc and status not equal to "A"
    const foundProduct = products?.find(
      p =>
        p?.product_desc?.toLowerCase().includes(searchTerm) &&
        p?.status !== 'A',
    );

    return foundProduct || null;
  },

  formattedMobileNo: function (n) {
    return `+${n.substring(0, 2)} ${n.substring(2, 5)} ${n.substring(
      5,
      8,
    )} ${n.substring(8, 12)}`;
  },

  formattedUsername: function (str) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  },

  maskPhoneNumber: function (num) {
    if (!num || num.length < 11) {
      return '';
    }
    const firstPart = num.slice(0, 2);
    const middlePart = num.slice(2, 9).replace(/[0-9]/g, '*');
    const lastPart = num.slice(9);

    return `+${firstPart}${middlePart}${lastPart}`;
  },

  maskEmail: function (email) {
    if (!email) {
      return;
    }
    const atIndex = email.indexOf('@');

    if (atIndex !== -1) {
      const name = email.substring(0, atIndex); // Extract the part before the '@'
      const maskedName = name[0] + '*'.repeat(name.length - 1); // Mask the name
      const domain = email.substring(atIndex); // Extract the domain part
      return maskedName + domain;
    } else {
      // If there's no '@' symbol in the email, return the original email
      return email;
    }
  },

  isEmail: function (str) {
    if (!str) {
      return false;
    }
    return str.includes('@');
  },

  // Used in pay bills module to convert the ID string of each biller field to snake_case
  convertToSnakeCase: function (str) {
    if (!str) {
      return false;
    }
    return str
      .trim()
      .replace(/^[A-Z]/, match => match.toLowerCase())
      .replace(/([A-Z])/g, match => '_' + match.toLowerCase());
  },

  isImageFile: function (path) {
    return /\.(jpg|jpeg|png|gif|bmp)$/i.test(path);
  },
};

export default CMAIUtil;

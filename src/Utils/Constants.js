import { SIMULATED_DEV } from './SimulatedConfig';

const IS_SIMULATED_DEV = false;
const IS_DEV = false;

// old prod url: 'https://mobile.ussc.com.ph/pw2/api/'
const PROD_API = 'https://umobile.ussc.com.ph/pw2/api/';
const DEV_API = 'https://cmaidev.ussc.com.ph/ussc-ssa-api/api/';

const BASE_DEV = {
  API_OK: 1,
  API_NOT_OK: 0,
  OTP_ERROR: -7,
  WU_ERROR: 0,
  WU_TIME_OUT_ERROR: -9,

  // AES ENCRYPTION KEY
  AES_KEY: 'CmA1Lcl3arM1nD!1',
  AES_IV: '1!Dn1Mar3lcL1AmC',
  DB_KEY:
    '60ab537a139f8ea240927728b2c83e7c18bac39cd46a91194d47dae4ae3952a8aaa67c736d0017c43ccdc2482096a9626d0c711e150272fd46c672babecbd07f',

  BASE_URI: IS_DEV ? DEV_API : PROD_API,

  ELOAD_CONFIRM_LOAD_API: 'eload_v2/confirm_top_up',
  ELOAD_GET_CATEGORY: 'eload_v2/category_list',
  ELOAD_GET_PRODUCTS: 'eload_v2/product_list',
  // Bills payment
  BILLS_PAY_GET_CATEGORY: 'billspay/billspayment_get_categories',
  BILLS_PAY_GET_P2B_CATEGORY: 'instapay/get_billers_category',
  BILLS_PAY_GET_BILLERS: 'billspay/billspayment_get_billers',
  BILLS_PAY_GET_P2B_BILLERS: 'instapay/get_p2b_billers',
  BILLS_PAY_GET_FEE: 'billspay/billspayment_get_fee',
  BILLS_PAY_POST_TRANSACTION: 'billspay/billspayment_pay',
  BILLS_PAY_QR: 'instapay/billspaymentmobile',
};

const Constants = { ...(IS_SIMULATED_DEV ? SIMULATED_DEV : BASE_DEV), IS_DEV };

export default Constants;

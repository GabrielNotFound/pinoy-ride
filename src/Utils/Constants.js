const IS_DEV = true;

const PROD_URL = '';
const DEV_URL = 'https://pinoy-ride-api.onrender.com/api/';

const BASE_DEV = {
  API_OK: 1,
  API_NOT_OK: 0,
  OTP_ERROR: -7,
  WU_ERROR: 0,
  WU_TIME_OUT_ERROR: -9,

  API_KEY: 'e6b9d7987f6d0633c31556a428a6197ef11f3b5be8ed8b3bc8a16c92e560e775',
  GOOGLE_MAP_API_KEY:
    'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYyNTU1ODYxOTc4NDQ4MzA5MjNhZmUzZmM1OTdmMjJmIiwiaCI6Im11cm11cjY0In0=',

  BASE_URI: IS_DEV ? DEV_URL : PROD_URL,

  ENDPOINT: {
    //AUTH
    LOGIN: 'customers/login/',
    SIGN_UP: 'customers/sign_up/',
    //OTP
    GENERATE_OTP: 'otp/generate/',
    VERIFY_OTP: 'otp/verify/',
    //BOOKING
    SEARCH_LOCATION: 'booking/search_location/',
    INQUIRE_BOOKING: 'booking/inquire/',
    CREATE_BOOKING: 'booking/create/',
    UPDATE_BOOKING_STATUS: 'booking/update_status_for_customer/',
    GET_BOOKING_HISTORY: 'booking/get_history/',

    ADD_TIP: 'booking/add_tip/',
  },

  FEATURE_STATUS: {},

  MODULES_IDENTIFIERS: {},
};

const Constants = { ...BASE_DEV, IS_DEV };

export default Constants;

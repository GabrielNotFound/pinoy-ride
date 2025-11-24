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
  GOOGLE_MAP_API_KEY: 'AIzaSyC6I6_4MnzZGrYXp3aUDR3EaY6Vn7-LS_A',
  BASE_URI: IS_DEV ? DEV_URL : PROD_URL,

  ENDPOINT: {
    //AUTH
    LOGIN: 'customers/login/',
    SIGN_UP: 'customers/sign_up/',
    GET_CUSTOMER_DETAILS: 'customers/get_customer_details/',
    //OTP
    GENERATE_OTP: 'otp/generate/',
    VERIFY_OTP: 'otp/verify/',
    //BOOKING
    SEARCH_LOCATION: 'booking/search_location/',
    INQUIRE_BOOKING: 'booking/inquire/',
    CREATE_BOOKING: 'booking/create/',
    UPDATE_BOOKING_STATUS: 'booking/update_status_for_customer/',
    GET_BOOKING_HISTORY: 'booking/get_history/',
    GET_BOOKING_DETAILS: 'booking/get_details/',
    RATE_BOOKING: 'booking/rate/',

    ADD_TIP: 'booking/add_tip/',
    //EKYC
    GET_EKYC_URL: 'ekyc/get-ekyc-url/',
    EKYC_CHECK_STATUS: 'ekyc/check_status/',
    //PAYMENT
    QRPH_REQUEST_TO_PAY: 'qrph/request-to-pay/',
    QRPH_CHECK_STATUS: 'qrph/check_status/',
  },

  FEATURE_STATUS: {},

  MODULES_IDENTIFIERS: {},
};

const Constants = { ...BASE_DEV, IS_DEV };

export default Constants;

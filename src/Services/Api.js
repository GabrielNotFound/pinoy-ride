var qs = require('qs');
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CMAIUtil, Constants } from '@/Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePostRequest = () => {
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function isOK(res) {
    return Constants.API_OK === res.data.status ? true : false;
  }

  function isNotOK(res) {
    return Constants.API_NOT_OK === res.data.status ? true : false;
  }

  async function buildParams(obj) {
    const requiredParams = {
      platform: getPlatform(),
      version: getAppVersion(),
      device_id: await getDeviceId(),
      request_id: getRequestId(),
      session_id: await getSessionId(),
      user_id: await getUserId(),
      ip_address: await getIpAddress(),
      os_version: getOSVersion(),
      hardware_version: getHardwareVersion(),
      current_coordinates: await getCurrentCoordinates(),
      branch_code: await getBranchCode(),
      branch_name: await getBranchName(),
      tpa_id: await getTpaId(),
      channel_code: 'K',
      // debug: 1,
    };

    //add params from required params
    let params = {
      ...requiredParams,
      ...obj,
    };

    //generate hash 512 signature
    let stringParams = '';
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        stringParams = stringParams + params[key];
      }
    }

    console.log('stringParams:', stringParams);
    const sig = await CMAIUtil.getHash(512, stringParams);
    params.signature = sig;

    return params;
  }

  function getPlatform() {
    return CMAIUtil.getPlatform();
  }
  function getAppVersion() {
    return CMAIUtil.getAppVersionNo();
  }
  async function getDeviceId() {
    return await CMAIUtil.getPlatformUniqueId();
  }
  function getRequestId() {
    return CMAIUtil.getUUID();
  }
  async function getSessionId() {
    return await CMAIUtil.getSessionID();
  }
  // user_id will be the same as branchcode
  async function getUserId() {
    return await CMAIUtil.getUBranchCode();
  }
  async function getIpAddress() {
    return await CMAIUtil.getDeviceIPV4Address();
  }
  function getOSVersion() {
    return CMAIUtil.getPlatformVersion();
  }
  function getHardwareVersion() {
    return '';
  }
  async function getCurrentCoordinates() {
    return await CMAIUtil.getGeoLocation();
  }
  async function getBranchCode() {
    return await CMAIUtil.getUBranchCode();
  }
  async function getBranchName() {
    return await CMAIUtil.getUBranchName();
  }
  async function getTpaId() {
    return await CMAIUtil.getUTpaId();
  }

  useEffect(() => {
    if (error) {
      CMAIUtil.debug('Error:', error);
    }
  }, [error]);

  const baseUrl = Constants.BASE_URI;

  const makePostRequest = async (endpoint, obj, config = {}) => {
    setLoading(true);
    setError(null);

    const url = baseUrl + endpoint;
    const params = await buildParams(obj);

    CMAIUtil.debug('=====> PARAMS <=====');
    CMAIUtil.debug(url);
    CMAIUtil.debugDeep(params);

    try {
      const res = await axios.post(url, qs.stringify(params), {
        ...config,
      });

      if (res?.data?.status) {
        CMAIUtil.debugDeep(res?.data);
        if (isOK(res)) {
          // set app data - save response session id
          if (res?.data?.session_id) {
            await AsyncStorage.setItem('SESSION_ID', res.data.session_id);
          }
          setResponse(res);
          return { response: res, error: null };
        } else if (isNotOK(res)) {
          setError(res.data.message);
          return { response: null, error: res.data.message };
        }
      } else {
        setError(res.data.message);
        setResponse('');
        CMAIUtil.debugDeep(res?.data);
        return { response: null, error: res.data.message };
      }
    } catch (err) {
      let message = '';
      if (err.response) {
        message =
          'We are currently under system maintenance. Please try again later.';
      } else if (err.request) {
        message =
          'Oops, you may have weak or no data connection... Keep calm, wait for a few minutes and try again.';
      } else {
        message = err.message;
      }

      setError(message);
      return { response: null, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { makePostRequest, response, loading, error };
};

export default usePostRequest;

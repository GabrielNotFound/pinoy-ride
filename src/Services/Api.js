var qs = require('qs');
import { useEffect, useState } from 'react';
import axios from 'axios';
// import mime from 'mime';
import { CMAIUtil, Constants, Messages } from '@/Utils';
import * as FileSystem from 'expo-file-system';

const usePostRequest = () => {
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(new AbortController());

  function isOK(res) {
    return Constants.API_OK === res.data.status ? true : false;
  }

  function isNotOK(res) {
    return Constants.API_NOT_OK === res.data.status ? true : false;
  }

  async function buildParams(obj) {
    //@todo perform signature computation
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
      channel_code: 'M',
      // debug: 1,
    };

    //add params from required params
    let params = {
      ...requiredParams,
      ...obj,
    };

    //@todo try not to sort object property by using map
    //or sort the property then generate signature

    //generate hash 512 signature
    let stringParams = '';
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        stringParams = stringParams + params[key];
      }
    }

    const sig = await CMAIUtil.getHash(512, stringParams);
    params.signature = sig;

    //@todo add optional encryption of message

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
  async function getUserId() {
    return await CMAIUtil.getUserID();
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

  useEffect(() => {
    if (error) {
      CMAIUtil.debug('Error:', error);
    }
  }, [error]);

  const baseUrl = Constants.BASE_URI;

  const makePostRequest = async (
    endpoint,
    obj,
    analyticsData = {},
    config = {},
  ) => {
    setLoading(true);
    setError(null);

    const url = baseUrl + endpoint;
    const signal = abortController.signal;
    const params = await buildParams(obj);

    let eventName;
    let eventData = {};
    const hasAnalytics = Object.keys(analyticsData).length > 0;
    if (hasAnalytics) {
      eventName = analyticsData.name;
      eventData = Object.fromEntries(
        Object.entries(analyticsData).filter(([key]) => key !== 'name'),
      );
    }

    CMAIUtil.debug('=====> PARAMS <=====');
    CMAIUtil.debug(url);
    CMAIUtil.debugDeep(params);

    //@TODO: to be deleted if not used
    // FOR MEDIA START
    const hasConfig = Object.keys(config).length;
    const formData = new FormData();
    const fileKeys = [];
    if (hasConfig) {
      Object.keys(obj).forEach(async function (key) {
        const value = obj[key];
        if (fileKeys.includes(key)) {
          const fileConfig = {
            uri: value,
            // type: mime.getType(value),
            name: `${key}.${value.split('.').pop()}`,
          };

          formData.append(key, fileConfig);
        } else {
          formData.append(key, value);
        }
      });

      Object.keys(params).forEach(function (key) {
        formData.append(key, params[key]);
      });
    }
    // FOR MEDIA END

    try {
      const res = await axios.post(
        url,
        hasConfig ? formData : qs.stringify(params),
        {
          ...config,
          signal,
        },
      );

      if (res?.data?.status) {
        if (isOK(res)) {
          setResponse(res);
        } else if (isNotOK(res)) {
          setLoading(false);
          setError(res.data.message);
        }
      } else {
        setLoading(false);
        setError(res.data.message);
        setResponse('');
        CMAIUtil.debugDeep(res?.data);
      }
    } catch (err) {
      setLoading(false);
      if (err.name !== 'AbortError') {
        hasAnalytics && CMAIUtil.sendEventLog(`${eventName}_FAIL`, eventData);
        if (err.response) {
          setError(
            'We are currently under system maintenance. Please try again later.',
          );
        } else if (err.request) {
          setError(Messages.ERROR_UNABLE_TO_RETRIEVE);
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelPostRequest = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  // useEffect(() => {
  //   return () => {
  //     cancelPostRequest();
  //     abortController.abort();
  //   };
  // }, []);

  return { makePostRequest, response, loading, error, cancelPostRequest };
};

export default usePostRequest;

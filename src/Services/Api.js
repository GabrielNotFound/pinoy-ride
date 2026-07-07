var qs = require('qs');
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { getCurrentRouteName, navigate } from '@/Utils/NavigationService';

// Force-update signal is code === 426, from ANY endpoint.
function getForceUpdateData(data) {
  if (data?.code === 426) {
    return data?.data || {}; // { update_link, current_version, minimum_version }
  }
  return null;
}

function handleForceUpdate(fu) {
  if (getCurrentRouteName() === 'UpdateRequiredScreen') {
    return;
  } // already there

  navigate('UpdateRequiredScreen', {
    updateLink: fu.update_link,
    currentVersion: fu.current_version,
    minimumVersion: fu.minimum_version,
  });
}

const usePostRequest = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userInfo = useSelector(selectUserInfo);

  function isOK(res) {
    return res?.data?.status === Constants.API_OK;
  }

  function isNotOK(res) {
    return (
      res?.data?.status === 'error' ||
      res?.data?.status === Constants.API_NOT_OK
    );
  }

  async function buildParams(obj) {
    const requiredParams = {
      user_type: 'rider',
      rider_id: userInfo?.id,
      user_id: userInfo?.id,
      app_version: '1.0.16',
    };
    const params = { ...requiredParams, ...obj };

    let stringParams = '';
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        stringParams += params[key];
      }
    }

    const sig = await AppUtil.getHash(512, stringParams);
    return { ...params, signature: sig };
  }

  useEffect(() => {
    if (error) {
      AppUtil.debug('❌ Error:', error);
    }
  }, [error]);

  const baseUrl = Constants.BASE_URI;

  // Added contentType parameter with default 'form'
  const makePostRequest = async (
    endpoint,
    obj,
    config = {},
    contentType = 'form',
  ) => {
    setLoading(true);
    setError(null);

    try {
      const url = baseUrl + endpoint;
      const params = await buildParams(obj);

      AppUtil.debug('=====> PARAMS <=====');
      AppUtil.debug(url);
      AppUtil.debugDeep(params);

      // ✅ Determine content type and data format
      const isJson = contentType === 'json';
      const requestData = isJson ? params : qs.stringify(params);
      const headers = {
        'Content-Type': isJson
          ? 'application/json'
          : 'application/x-www-form-urlencoded',
        'x-api-key': Constants.API_KEY,
      };

      const res = await axios.post(url, requestData, {
        headers,
        ...config,
      });

      // Always set response (don't leave it null if request succeeded)
      setResponse(res.data);

      // Force-update check — code 426, from ANY endpoint.
      const forceUpdate = getForceUpdateData(res.data);
      if (forceUpdate) {
        handleForceUpdate(forceUpdate);
        return { response: null, error: null, forceUpdate: true };
      }

      if (isOK(res)) {
        return { response: res.data, error: null };
      } else if (isNotOK(res)) {
        setError(res.data.message);
        return { response: null, error: res.data.message };
      } else {
        // Catch-all if API returns something unexpected
        return { response: res.data, error: null };
      }
    } catch (err) {
      // Force-update check on the thrown-error path — a 426 status makes
      // axios throw, and the payload lands in err.response.data.
      const forceUpdate = getForceUpdateData(err.response?.data);
      if (forceUpdate) {
        handleForceUpdate(forceUpdate);
        return { response: null, error: null, forceUpdate: true };
      }

      let message = '';

      // ✅ Check if error response has a message from your API
      if (err.response?.data?.message) {
        // Use the actual error message from your API
        message = err.response.data.message;
      } else if (err.response) {
        // Generic server error
        message =
          'We are currently under system maintenance. Please try again later.';
      } else if (err.request) {
        // Network error
        message =
          'Oops, you may have weak or no data connection... Keep calm, wait for a few minutes and try again.';
      } else {
        // Other error
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

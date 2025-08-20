var qs = require('qs');
import { useEffect, useState } from 'react';
import axios from 'axios';
import { AppUtil, Constants } from '@/Utils';

const usePostRequest = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function isOK(res) {
    return res?.data?.status === Constants.API_OK;
  }

  function isNotOK(res) {
    return res?.data?.status === Constants.API_NOT_OK;
  }

  async function buildParams(obj) {
    const requiredParams = { user_type: 'customer' };
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

  const makePostRequest = async (endpoint, obj, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = baseUrl + endpoint;
      const params = await buildParams(obj);

      AppUtil.debug('=====> PARAMS <=====');
      AppUtil.debug(url);
      AppUtil.debugDeep(params);

      const res = await axios.post(url, qs.stringify(params), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-api-key': Constants.API_KEY,
        },
        ...config,
      });

      // Always set response (don’t leave it null if request succeeded)
      setResponse(res.data);

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

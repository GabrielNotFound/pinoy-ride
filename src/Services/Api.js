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
      user_type: 'customer',
      customer_id: userInfo?.id,
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

  const extractErrorMessage = errorData => {
    // Handle string errors
    if (typeof errorData === 'string') {
      return errorData;
    }

    // Handle object errors
    if (errorData && typeof errorData === 'object') {
      // Check for non_field_errors array (most common Django/DRF format)
      if (Array.isArray(errorData.non_field_errors)) {
        return errorData.non_field_errors.join('\n');
      }

      // Check for non_field_errors string
      if (typeof errorData.non_field_errors === 'string') {
        return errorData.non_field_errors;
      }

      // Check for message field (could be string or object)
      if (errorData.message) {
        // If message is an object, recursively extract from it
        if (typeof errorData.message === 'object') {
          return extractErrorMessage(errorData.message);
        }
        return errorData.message;
      }

      // Check for detail field (common in Django REST Framework)
      if (errorData.detail) {
        if (typeof errorData.detail === 'object') {
          return extractErrorMessage(errorData.detail);
        }
        return errorData.detail;
      }

      // Check for error field
      if (errorData.error) {
        if (typeof errorData.error === 'object') {
          return extractErrorMessage(errorData.error);
        }
        return errorData.error;
      }

      // Handle field-specific errors (e.g., {email: ["Invalid email"], password: ["Too short"]})
      const fieldErrors = [];
      for (const [key, value] of Object.entries(errorData)) {
        // Skip common metadata fields
        if (['status', 'code', 'timestamp'].includes(key)) {
          continue;
        }

        if (Array.isArray(value)) {
          // If it's an array, extract all messages
          const messages = value.filter(v => typeof v === 'string');
          if (messages.length > 0) {
            fieldErrors.push(messages.join('\n'));
          }
        } else if (typeof value === 'string') {
          fieldErrors.push(value);
        }
      }

      if (fieldErrors.length > 0) {
        return fieldErrors.join('\n');
      }

      // Last resort: return a generic message instead of stringified object
      return 'An error occurred. Please try again.';
    }

    // Fallback
    return 'An unknown error occurred';
  };

  useEffect(() => {
    if (error) {
      AppUtil.debug('❌ Error:', error);
    }
  }, [error]);

  const baseUrl = Constants.BASE_URI;

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

      // Determine content type and data format
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

      // Always set response
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
        //  Extract error message properly
        const errorMessage = extractErrorMessage(res.data.message || res.data);
        setError(errorMessage);
        return { response: null, error: errorMessage };
      } else {
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

      //  Handle error response with proper extraction
      if (err.response?.data) {
        // Try to extract message from response data
        message = extractErrorMessage(err.response.data);
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
        message = err.message || 'An unknown error occurred';
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

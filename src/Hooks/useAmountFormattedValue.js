import { useCallback, useEffect, useRef, useState } from 'react';

const useAmountFormattedValue = ({
  value,
  onChange,
  getFormattedValue = val => val,
  getUnformattedValue = val => val,
  isFormattedPartially = () => false,
}) => {
  const localValueRef = useRef(value);
  const [formattedValue, setFormattedValue] = useState(() =>
    value !== undefined && value !== null ? getFormattedValue(value) : '',
  );

  const onChangeValue = useCallback(
    newValue => {
      if (isFormattedPartially(newValue)) {
        setFormattedValue(newValue);
        return;
      }

      const _newUnformattedValue = getUnformattedValue(newValue);
      localValueRef.current = _newUnformattedValue;

      if (onChange) {
        onChange(_newUnformattedValue);
      }

      setFormattedValue(getFormattedValue(_newUnformattedValue));
    },
    [onChange, getFormattedValue, getUnformattedValue, isFormattedPartially],
  );

  useEffect(() => {
    if (value !== localValueRef.current) {
      setFormattedValue(getFormattedValue(value));
      localValueRef.current = value;
    }
  }, [getFormattedValue, value]);

  return { formattedValue, onChangeValue };
};

export default useAmountFormattedValue;

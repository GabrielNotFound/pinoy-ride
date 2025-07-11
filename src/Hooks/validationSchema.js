import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Mobile number is required')
    .min(10, 'Too short')
    .max(15, 'Too long'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Must be positive'),
});

export default validationSchema;

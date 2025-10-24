import * as Yup from 'yup';
export class Y {
  public static loginSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email Address is required'),

    password: Yup.string()
      .min(6, 'Password must be atleast 6 characters')
      .required('Password is required'),
  });
  public static registerSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email Address is required'),

    password: Yup.string()
      .min(6, 'Password must be atleast 6 characters')
      .required('Password is required'),
  });
}

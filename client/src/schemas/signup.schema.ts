export type SignUpValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const signUpInitialValues: SignUpValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const signUpValidation = {
  name: (value: string) =>
    value.trim().length >= 2 ? null : 'Enter your full name',
  email: (value: string) =>
    /^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email address',
  password: (value: string) =>
    value.length >= 6 ? null : 'Password must contain at least 6 characters',
  confirmPassword: (value: string, values: SignUpValues) =>
    value === values.password ? null : 'Passwords do not match',
};

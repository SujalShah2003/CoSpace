export type SignInValues = {
  email: string;
  password: string;
  remember: boolean;
};

export const signInInitialValues: SignInValues = {
  email: '',
  password: '',
  remember: true,
};

export const signInValidation = {
  email: (value: string) =>
    /^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email address',
  password: (value: string) =>
    value.length >= 6 ? null : 'Password must contain at least 6 characters',
};

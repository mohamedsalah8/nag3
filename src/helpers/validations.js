export const nameRegEx =
  /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/g;

export const emailRegEx =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const mobileRegEx = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const passwordRegEx =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

export const validateName = (name) => {
  return String(name).match(nameRegEx);
};

export const validateEmail = (email) => {
  return String(email).toLowerCase().match(emailRegEx);
};

export const validateMobile = (mobile) => {
  return String(mobile).match(mobileRegEx);
};

export const validatePassword = (password) => {
  return String(password).match(passwordRegEx);
};

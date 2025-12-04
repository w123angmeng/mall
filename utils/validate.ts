// utils/validate.ts
/** 验证手机号格式 */
export const isPhoneValid = (phone: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

/** 验证密码格式（6-16位，含数字/字母） */
export const isPasswordValid = (password: string): boolean => {
  const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,16}$/;
  return reg.test(password);
};

/** 验证验证码格式（6位数字） */
export const isCodeValid = (code: string): boolean => {
  const reg = /^\d{6}$/;
  return reg.test(code);
};
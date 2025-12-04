// apis/user.js
import { useRequest } from '@/composables/useRequest';

const { get, post, put, upload } = useRequest();

/**
 * 获取个人信息
 */
export const getUserProfile = async () => {
  return await get('/profile/userInfo');
};

/**
 * 修改头像
 * @param {Object} params - 上传参数
 * @param {File} params.file - 头像文件
 * @param {Function} [params.onProgress] - 上传进度回调
 */
export const updateUserAvatar = async (params) => {
  return await upload('/profile/avatar', params.file, (progress) => {
    params.onProgress && params.onProgress(progress);
  });
};

/**
 * 修改手机号
 * @param {Object} data - 修改参数
 * @param {string} data.phoneNumber - 新手机号
 * @param {string} data.smsCode - 验证码
 */
export const updateUserPhone = async (data) => {
  return await put('/profile/updatePhone', data);
};

/**
 * 修改密码
 * @param {Object} data - 修改参数
 * @param {string} data.phoneNumber - 绑定手机号
 * @param {string} data.smsCode - 验证码
 * @param {string} data.newPassword - 新密码
 */
export const updateUserPassword = async (data) => {
  return await put('/profile/updatePassword', data);
};
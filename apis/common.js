// apis/oss.js
import { useRequest } from '@/composables/useRequest';

const { upload } = useRequest();

/**
 * 文件上传（OSS存储）
 * @param {Object} params - 上传参数
 * @param {File} params.file - 待上传文件
 * @param {Function} [params.onProgress] - 上传进度回调（可选）
 */
export const uploadFile = async (params) => {
  const formData = new FormData();
  formData.append('file', params.file);

  return await upload('/oss/upload', formData, (progress) => {
    params.onProgress && params.onProgress(progress);
  });
};
// apis/oss.js
/**
 * 文件上传（OSS存储）- 仅封装FormData和上传逻辑，不直接调用useRequest
 * @param {Object} params - 上传参数
 * @param {File} params.file - 待上传文件
 * @param {Function} [params.onProgress] - 上传进度回调（可选）
 * @param {Function} upload - 从外部传入的upload方法（来自useRequest）
 */
export const uploadFile = async (params) => {
  const { upload } = useRequest();
  if (!upload) {
    throw new Error('必须传入useRequest的upload方法');
  }
  
  const formData = new FormData();
  formData.append('file', params.file);

  return await upload('/oss/upload', formData, (progress) => {
    params.onProgress && params.onProgress(progress);
  });
};
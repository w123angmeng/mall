// apis/verify.js
import { useRequest } from '@/composables/useRequest';

const { get, post, put, delete: del, upload } = useRequest();

/**
 * 提交个人认证
 * @param {Object} data - 认证参数
 * @param {number} data.cardFront - 身份证正面附件ID
 * @param {number} data.cardBack - 身份证背面附件ID
 * @param {string} data.cardName - 姓名
 * @param {string} data.cardNumber - 身份证号
 * @param {number} data.cardLongTerm - 是否长期有效（0-否，1-是）
 * @param {string} data.cardStart - 有效期开始日期
 * @param {string} data.cardEnd - 有效期结束日期
 * @param {string} data.salePerson - 业务员
 * @param {string} data.purchaseIntent - 购买意向
 */
export const submitPersonCert = async (data) => {
  return await post('/cert/submitPerson', data);
};

/**
 * 修改个人认证
 * @param {Object} data - 修改参数
 * @param {number} data.id - 认证ID
 * @param {number} data.cardFront - 身份证正面附件ID
 * @param {number} data.cardBack - 身份证背面附件ID
 * @param {string} data.cardName - 姓名
 * @param {string} data.cardNumber - 身份证号
 * @param {number} data.cardLongTerm - 是否长期有效（0-否，1-是）
 * @param {string} data.cardStart - 有效期开始日期
 * @param {string} data.cardEnd - 有效期结束日期
 * @param {string} data.salePerson - 业务员
 * @param {string} data.purchaseIntent - 购买意向
 */
export const updatePersonCert = async (data) => {
  return await put('/cert/updatePerson', data);
};

/**
 * 提交企业认证
 * @param {Object} data - 认证参数
 * @param {string} data.companyName - 企业名称
 * @param {number} data.registeredCapital - 注册资本
 * @param {string} data.socialCode - 社会信用代码
 * @param {number} data.longTerm - 是否长期有效（0-否，1-是）
 * @param {string} data.startDate - 有效期开始日期
 * @param {string} data.endDate - 有效期结束日期
 * @param {string} data.legalName - 法人姓名
 * @param {string} data.legalNumber - 法人身份证号
 * @param {string} data.concatName - 联系人姓名
 * @param {string} data.concatPhone - 联系人手机号
 * @param {number} data.license - 营业执照附件ID
 */
export const submitCompanyCert = async (data) => {
  return await post('/cert/submitCompany', data);
};

/**
 * 修改企业认证
 * @param {Object} data - 修改参数
 * @param {number} data.id - 认证ID
 * @param {string} data.companyName - 企业名称
 * @param {number} data.registeredCapital - 注册资本
 * @param {string} data.socialCode - 社会信用代码
 * @param {number} data.longTerm - 是否长期有效（0-否，1-是）
 * @param {string} data.startDate - 有效期开始日期
 * @param {string} data.endDate - 有效期结束日期
 * @param {string} data.legalName - 法人姓名
 * @param {string} data.legalNumber - 法人身份证号
 * @param {string} data.concatName - 联系人姓名
 * @param {string} data.concatPhone - 联系人手机号
 * @param {number} data.license - 营业执照附件ID
 * @param {boolean} data.isDefault - 是否默认
 * @param {string} data.salePerson - 业务员
 * @param {string} data.purchaseIntent - 购买意向
 */
export const updateCompanyCert = async (data) => {
  return await put('/cert/updateCompany', data);
};

/**
 * 删除认证
 * @param {string|number} certIds - 认证ID（多个用逗号分隔）
 */
export const deleteCert = async (certIds) => {
  return await del(`/cert/delete/${certIds}`);
};

/**
 * 查询个人认证信息
 */
export const getPersonCert = async () => {
  return await get('/cert/getPersonCert');
};

/**
 * 查询企业认证列表
 */
export const getCompanyCertList = async () => {
  return await get('/cert/getCompanyCert');
};

/**
 * 获取认证详情
 * @param {string|number} certId - 认证ID
 */
export const getCertDetail = async (certId) => {
  return await get(`/cert/getCertDetail/${certId}`);
};

/**
 * 获取认证下拉列表
 * @param {Object} params - 查询参数
 * @param {number} params.certType - 认证类型（0-个人，1-企业）
 */
export const getCertSelectList = async (params) => {
  return await get('/cert/getCertSelectList', params);
};

/**
 * 获取默认认证
 * @param {Object} params - 查询参数
 * @param {number} params.certType - 认证类型（0-个人，1-企业）
 */
export const getDefaultCert = async (params) => {
  return await get('/cert/getDefaultCert', params);
};

/**
 * 获取授信列表
 */
export const getCreditList = async () => {
  return await get('/cert/getCreditList');
};

/**
 * 获取授信详情
 * @param {string|number} creditId - 授信ID
 */
export const getCreditInfo = async (creditId) => {
  return await get(`/cert/getCreditInfo/${creditId}`);
};

/**
 * 身份识别和校验（身份证正反面识别）
 * @param {Object} params - 识别参数
 * @param {File} params.frontFile - 身份证正面文件
 * @param {File} params.backFile - 身份证背面文件
 * @param {Function} [params.onProgress] - 上传进度回调
 */
export const recognizeIdCard = async (params) => {
  const formData = new FormData();
  formData.append('frontFile', params.frontFile);
  formData.append('backFile', params.backFile);

  return await upload('/cert/recognizeIdCard', formData, (progress) => {
    params.onProgress && params.onProgress(progress);
  });
};
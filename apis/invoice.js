// apis/invoice.js
import { useRequest } from '@/composables/useRequest';

const { get, post } = useRequest();

/**
 * 获取发票列表
 */
export const getInvoiceList = async () => {
  return await get('/invoice/list');
};

/**
 * 补充发票信息
 * @param {Object} data - 发票补充参数
 * @param {string|number} data.certId - 认证ID
 * @param {string} data.address - 地址
 * @param {string} data.phone - 电话
 * @param {string} data.depositBank - 开户银行
 * @param {string} data.accountNumber - 银行账号
 * @param {string} data.bankCode - 行号
 */
export const supplementInvoiceInfo = async (data) => {
  return await post('/invoice/supplement', data);
};
/**
 * 注意：不要在模块顶层调用 useRequest，
 * 改为封装成函数，在 Vue setup 中调用
 */
import { useRequest } from '@/composables/useRequest';

export const getOrderApi = () => {
  const { get, post, put } = useRequest();

  return {
    /**
     * 获取收款信息
     */
    getPayInfo: async () => {
      return await get('/order/payInfo');
    },

    /**
     * 下载合同订单
     */
    downloadContract: async () => {
      return await get('/order/downloadContract');
    },

    /**
     * 创建订单
     * @param {Object} data - 订单创建参数
     * @param {string|number} data.certId - 资质ID
     * @param {number} data.contractRequired - 是否需要合同（1/0）
     * @param {string|number} data.addressId - 地址ID
     * @param {string} [data.requirement] - 地址特殊要求
     * @param {number} data.payType - 支付方式
     * @param {number} data.invoiceRequired - 是否需要开票（1/0）
     * @param {number} data.invoiceAmount - 开票金额
     * @param {string} [data.invoiceDetails] - 开票明细
     * @param {string} [data.invoiceRequirement] - 开票要求
     * @param {Array} data.orderDetailList - 订单明细列表
     * @param {number} data.totalNum - 商品总数
     * @param {string|number} data.totalAmount - 订单总金额
     * @param {string|number} data.payAmount - 实付金额
     * @param {string} [data.salePerson] - 业务员
     * @param {string} [data.orderMessage] - 订单备注
     */
    submitOrder: async (data) => {
      return await post('/order/submit', data);
    },

    /**
     * 获取订单列表
     * @param {Object} params - 查询参数
     * @param {string} [params.payStatus] - 支付状态
     * @param {string} [params.orderStatus] - 订单状态
     * @param {number} [params.pageSize] - 每页条数
     * @param {number} [params.pageNum] - 页码
     */
    getOrderList: async (params = {}) => {
      return await get('/order/getOrderList', params);
    },

    /**
     * 获取订单状态数量汇总
     */
    getOrderSummary: async () => {
      return await get('/order/getOrderSummary');
    },

    /**
     * 获取订单详情
     * @param {string|number} orderId - 订单ID
     */
    getOrderDetail: async (orderId) => {
      if (!orderId) {
        console.warn('【获取订单详情】订单ID不能为空');
        return {};
      }
      return await get(`/order/getOrderDetail/${orderId}`);
    },

    /**
     * 补充合同
     * @param {string|number} orderId - 订单ID
     * @param {Object} params - 合同参数
     * @param {string} params.contract - 合同内容/路径
     * @param {string} params.contractName - 合同名称
     */
    supplementContract: async (orderId, params = {}) => {
      if (!orderId) {
        console.warn('【补充合同】订单ID不能为空');
        return;
      }
      return await put(`/order/supplementContract/${orderId}`, params);
    },

    /**
     * 补充付款凭证
     * @param {string|number} orderId - 订单ID
     * @param {Object} params - 凭证参数
     * @param {string} params.payVoucher - 付款凭证内容/路径
     * @param {string} params.payVoucherName - 凭证名称
     */
    supplementPayVoucher: async (orderId, params = {}) => {
      if (!orderId) {
        console.warn('【补充付款凭证】订单ID不能为空');
        return;
      }
      return await put(`/order/supplementPayVoucher/${orderId}`, params);
    },

    /**
     * 确认收货
     * @param {string|number} orderId - 订单ID
     */
    confirmReceipt: async (orderId) => {
      if (!orderId) {
        console.warn('【确认收货】订单ID不能为空');
        return;
      }
      return await put(`/order/confirmReceipt/${orderId}`);
    }
  };
};
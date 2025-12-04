// apis/index.js
import * as userApi from './user';
import * as loginApi from './login';
// import * as orderApi from './order';
import * as cartApi from './cart';
import * as addressApi from './address';
import * as creditApi from './credit';
import * as invoiceApi from './invoice';
import * as homeApi from './home';
import * as commonApi from './common';

// 统一导出，组件中可通过 import api from '@/apis' 调用
export default {
  user: userApi,
  login: loginApi,
  // order: orderApi,
  cart: cartApi,
  address: addressApi,
  credit: creditApi,
  invoice: invoiceApi,
  home: homeApi,
  // common: commonApi,
};
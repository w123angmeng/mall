<template>
  <footer class="footer">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="footer-loading">加载中...</div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="footer-error">{{ error }}</div>
    
    <!-- 正常数据展示 -->
    <div v-else>
      <div class="footer-container">
        <div class="footer-column guide-column">
          <h3 class="column-title">选购指南</h3>
          <ul class="column-list guide-list">
            <li v-for="item in footerData?.guides" :key="item.id">
              <a href="#" class="list-item">{{ item.categoryName }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-column service-column">
          <h3 class="column-title">服务中心</h3>
          <ul class="column-list service-list">
            <li v-for="item in footerData?.services" :key="item.id">
              <a href="#" class="list-item">{{ item.title }}</a>
            </li>
          </ul>
        </div>

        <div class="footer-column qr-column">
          <img :src="footerData?.contact?.qrCode || '/images/qr-code.png'" alt="严牌商城公众号" class="qr-code" />
        </div>

        <div class="footer-column contact-column">
          <p class="contact-phone">{{ footerData?.contact?.phone }}</p>
          <p class="contact-email">{{ footerData?.contact?.email }}</p>
          <button class="online-service">
            <i class="service-icon">💬</i> 在线客服
          </button>
        </div>
      </div>

      <div class="bottom-info">
        <div class="footer-logo">
          <img src="/images/logo.png" alt="严牌官网" class="logo-img" />
          <span class="logo-text">严牌官网</span>
        </div>
        <p class="copyright-text">{{ footerData?.copyright }}</p>
        <p class="record-info">{{ footerData?.recordInfo }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getHomeFooterInfo } from '@/apis/home';
import { MessagePlugin } from 'tdesign-vue-next';

// 兜底默认数据（与首页的 defaultFooterInfo 保持一致）
const defaultFooterInfo = {
  guides: Array.from({ length: 18 }, (_, i) => ({ id: i + 1, categoryName: "分类一型" })),
  services: [
    { id: 1, title: "帮助中心" },
    { id: 2, title: "售后政策" },
    { id: 3, title: "私人定制" },
    { id: 4, title: "严牌官网" }
  ],
  contact: {
    phone: "400-826-6678",
    email: "service@yanpai.com",
    qrCode: "/images/qr-code.png"
  },
  copyright: "Copyright Yanpai Filtration Technology Co., Ltd.",
  recordInfo: "备案号:浙ICP备11060044号-8"
};

// 响应式数据
const isLoading = ref(false); // 请求加载状态
const error = ref(null); // 请求错误信息
const footerData = ref(defaultFooterInfo); // 页脚数据（默认兜底）

// 组件挂载时请求页脚数据
onMounted(async () => {
  isLoading.value = true;
  try {
    // 调用首页的页脚数据接口
    const res = await getHomeFooterInfo();
    if (res.data) {
      // 接口返回有效数据则替换兜底数据
      footerData.value = { ...defaultFooterInfo, ...res.data };
    }
  } catch (err) {
    // 捕获请求异常，提示用户并保留兜底数据
    error.value = "获取页脚信息失败";
    console.error("页脚数据请求失败：", err);
    MessagePlugin.error("获取页脚信息失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.footer {
  background-color: #fff;
  padding: 30px 0;
  border-radius: 8px;
  width: 1200px;
  margin: 0 auto;

  // 加载/错误状态样式
  .footer-loading, .footer-error {
    text-align: center;
    padding: 20px 0;
    color: #666;
    font-size: 14px;
  }

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 100px;
    border-radius: 8px;
  }

  .footer-column {
    &.guide-column {
      width: 40%;
    }

    &.service-column {
      width: 20%;
    }

    &.qr-column {
      width: 15%;
      display: flex;
      justify-content: center;
    }

    &.contact-column {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: center;
    }

    .column-title {
      font-size: 16px;
      font-weight: 600;
      color: #2F3032;
      margin-bottom: 20px;
    }
  }

  .guide-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;

    .list-item {
      width: calc(100% / 6 - 15px);
      color: #666;
      text-decoration: none;
      line-height: 28px;
      cursor: pointer;

      &:hover {
        color: #3799AE;
      }
    }
  }

  .service-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .list-item {
      display: block;
      color: #666;
      text-decoration: none;
      line-height: 28px;
      cursor: pointer;

      &:hover {
        color: #3799AE;
      }
    }
  }

  .qr-code {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  .contact-phone {
    font-size: 16px;
    color: #2F3032;
    margin-bottom: 8px;
  }

  .contact-email {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }

  .online-service {
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 14px;

    .service-icon {
      font-size: 16px;
    }

    &:hover {
      background: #555;
    }
  }

  .bottom-info {
    width: 1200px;
    margin: 20px auto 0;
    padding-top: 20px;
    border-top: 1px solid #EEE;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    font-size: 12px;
    color: #999;

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }

      .logo-text {
        font-size: 14px;
        color: #2F3032;
        font-weight: 500;
      }
    }
  }
}
</style>
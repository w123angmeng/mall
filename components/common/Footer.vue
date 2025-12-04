<template>
  <footer class="footer">
    <!-- 底部主体容器（宽度1200px 居中） -->
    <div class="footer-container">
      <!-- 1. 选购指南 -->
      <div class="footer-column guide-column">
        <h3 class="column-title">选购指南</h3>
        <ul class="column-list guide-list">
          <li v-for="item in guideList" :key="item.id">
            <a href="#" class="list-item">{{ item.name }}</a>
          </li>
        </ul>
      </div>

      <!-- 2. 服务中心 -->
      <div class="footer-column service-column">
        <h3 class="column-title">服务中心</h3>
        <ul class="column-list service-list">
          <li v-for="item in serviceList" :key="item.id">
            <a href="#" class="list-item">{{ item.name }}</a>
          </li>
        </ul>
      </div>

      <!-- 3. 二维码 -->
      <div class="footer-column qr-column">
        <img src="/images/qr-code.png" alt="严牌商城公众号" class="qr-code" />
      </div>

      <!-- 4. 联系信息 -->
      <div class="footer-column contact-column">
        <p class="contact-phone">400-826-6678</p>
        <p class="contact-email">service@yanpai.com</p>
        <button class="online-service">
          <i class="service-icon">💬</i> 在线客服
        </button>
      </div>
    </div>

    <!-- 底部信息栏（logo+版权+备案号） -->
    <div class="bottom-info">
      <div class="footer-logo">
        <img src="/images/logo.png" alt="严牌官网" class="logo-img" />
        <span class="logo-text">严牌官网</span>
      </div>
      <p class="copyright-text">Copyright Yanpai Filtration Technology Co., Ltd.</p>
      <p class="record-info">备案号:浙ICP备11060044号-8</p>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

// 选购指南数据（3行6列，共18项）
const guideList = ref(
  Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: "分类一型"
  }))
);

// 服务中心数据
const serviceList = ref([
  { id: 1, name: "帮助中心" },
  { id: 2, name: "售后政策" },
  { id: 3, name: "私人定制" },
  { id: 4, name: "严牌官网" }
]);
</script>

<style lang="scss" scoped>
.footer {
  background-color: #fff;
  padding: 30px 0;
  border-radius: 8px;
  width: 1200px;
  margin: 0 auto;

  // 主体容器（宽度1200px 居中）
  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 100px;
	border-radius: 8px;
  }

  // 列通用样式
  .footer-column {
    // 选购指南列（占比最大）
    &.guide-column {
      width: 40%;
    }

    // 服务中心列
    &.service-column {
      width: 20%;
    }

    // 二维码列
    &.qr-column {
      width: 15%;
      display: flex;
      justify-content: center;
    }

    // 联系信息列（居右）
    &.contact-column {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .column-title {
      font-size: 16px;
      font-weight: 600;
      color: #2F3032;
      margin-bottom: 20px;
    }
  }

  // 选购指南列表（6列换行）
  .guide-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;

    .list-item {
      width: calc(100% / 6 - 15px); // 每行6个
      color: #666;
      text-decoration: none;
      line-height: 28px;
      cursor: pointer;

      &:hover {
        color: #3799AE;
      }
    }
  }

  // 服务中心列表（垂直排列）
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

  // 二维码样式
  .qr-code {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  // 联系信息样式
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

  // 底部信息栏（logo+版权+备案号）
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
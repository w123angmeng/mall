<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-column guide-column">
        <h3 class="column-title">选购指南</h3>
        <ul class="column-list guide-list">
          <li v-for="item in footerInfo?.guides" :key="item.id">
            <a href="#" class="list-item">{{ item.categoryName }}</a>
          </li>
        </ul>
      </div>

      <div class="footer-column service-column">
        <h3 class="column-title">服务中心</h3>
        <ul class="column-list service-list">
          <li v-for="item in footerInfo?.services" :key="item.id">
            <a href="#" class="list-item">{{ item.title }}</a>
          </li>
        </ul>
      </div>

      <div class="footer-column qr-column">
        <img :src="footerInfo?.contact?.qrCode || '/images/qr-code.png'" alt="严牌商城公众号" class="qr-code" />
      </div>

      <div class="footer-column contact-column">
        <p class="contact-phone">{{ footerInfo?.contact?.phone }}</p>
        <p class="contact-email">{{ footerInfo?.contact?.email }}</p>
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
      <p class="copyright-text">{{ footerInfo?.copyright }}</p>
      <p class="record-info">{{ footerInfo?.recordInfo }}</p>
    </div>
  </footer>
</template>

<script setup>
const props = defineProps({
  footerInfo: {
    type: Object,
    required: true
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
	  // margin: 0 auto 20px;
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
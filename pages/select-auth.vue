<template>
  <div>
    <div class="auth-card">
      <div class="page-title text-center">
        注册成功，请选择认证方式
      </div>
      <div class="auth-options">
        <div 
          class="auth-option-card" 
          :class="{ active: selectedAuth === 'personal' }"
          @click="selectedAuth = 'personal'"
        >
          <div class="auth-text">个人认证</div>
          <div class="auth-img">
            <img src="~/assets/images/personal.png" alt="个人认证" />
          </div>
		  <button
		    class="confirm-btn"
		    @click="handleConfirm('personal')"
		  >
		    开始认证
		  </button>
        </div>
        <div 
          class="auth-option-card" 
          :class="{ active: selectedAuth === 'enterprise' }"
          @click="selectedAuth = 'enterprise'"
        >
          <div class="auth-text">企业认证</div>
          <div class="auth-img">
            <img src="~/assets/images/enterprise.png" alt="企业认证" />
          </div>
		  <button
		    class="confirm-btn"
		    @click="handleConfirm('enterprise')"
		  >
		    开始认证
		  </button>
        </div>
      </div>
      <div class="auth-actions">
        <a href="/" class="skip-link text-center">
          跳过认证
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' });
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const selectedAuth = ref('');

const handleConfirm = (type = '') => {
  if (type === 'personal') {
    router.push({
      path: '/verify-personal'
    });
  } else if (type === 'enterprise') {
    router.push({
      path: '/verify-enterprise'
    });
  }
};
</script>

<style lang="scss" scoped>
.auth-card {
  width: 648px !important;
  height: 468px !important;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 40px 90px;
  box-sizing: border-box;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-title {
  font-size: 16px;
  font-weight: 400;
  color: #272727;
  margin-bottom: 20px;
}

.auth-options {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex: 1;
  align-items: center;
}

.auth-option-card {
  width: 204px !important;
  height: 246px !important;
  padding: 30px 0;
  border: 1px solid #ECEEF2;
  border-radius: 8px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .2s, background .2s;
  background: #FBFDFD;

    &:hover {
      border-color: #3799AE;
      background: rgba(55, 153, 174, 0.03);
    }
    &.active {
      border-color: #3799AE;
      background: rgba(55, 153, 174, 0.08);
    }
}

.auth-text {
  font-size: 16px !important;
  color: #272727;
  font-weight: 400;
}

.auth-img {
  width: 72px;
  height: 72px;
  overflow: hidden;
  margin: 20px auto 40px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.auth-actions {
  width: 100%;
  text-align: center;
}

.confirm-btn {
  width: 120px;
  height: 32px;
  background: #3799AE;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background .2s;
}
.confirm-btn:disabled {
  background: #a8d0d8;
  cursor: not-allowed;
}
.confirm-btn:not(:disabled):hover {
  background: #2d8094;
}

.skip-link {
  display: inline-block;
  font-size: 14px;
  color: #3799AE;
  text-decoration: none;
}
.skip-link:hover {
  text-decoration: underline;
}

.text-center { text-align: center; }
.w-full { width: 100%; }
</style>
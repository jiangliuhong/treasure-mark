<template>
  <n-modal v-model:show="visible" :mask-closable="false" :closable="false">
    <n-card
      style="max-width: 500px"
      title="GitHub 设备登录"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <n-button size="small" @click="cancelLogin" :disabled="loading">
          取消
        </n-button>
      </template>
      
      <div class="device-login-content">
        <div class="step">
          <h3>第 1 步：访问 GitHub</h3>
          <n-button 
            type="primary" 
            @click="openGitHub" 
            style="width: 100%; margin-bottom: 12px;"
          >
            打开 GitHub 授权页面
          </n-button>
          <p style="margin: 0; color: var(--n-text-color-2); font-size: 14px;">
            或手动访问：{{ verificationUri }}
          </p>
        </div>
        
        <div class="step">
          <h3>第 2 步：输入授权码</h3>
          <div class="code-display">
            <n-input
              :value="userCode"
              readonly
              size="large"
              style="text-align: center; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px;"
            />
            <n-button
              size="small"
              @click="copyCode"
              style="margin-top: 8px;"
            >
              复制授权码
            </n-button>
          </div>
        </div>
        
        <div class="step">
          <h3>第 3 步：确认授权</h3>
          <p style="margin: 0; color: var(--n-text-color-2);">
            在 GitHub 页面上确认授权"藏宝书签"应用访问您的账户信息。
          </p>
        </div>
        
        <div class="status">
          <n-alert v-if="loading" type="info" style="margin-top: 16px;">
            <template #icon>
              <n-spin size="small" />
            </template>
            正在等待授权...
          </n-alert>
          
          <n-alert v-if="error" type="error" style="margin-top: 16px;">
            {{ error }}
          </n-alert>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NModal, NCard, NButton, NInput, NAlert, NSpin, useMessage } from 'naive-ui'

interface DeviceCodeData {
  userCode: string
  verificationUri: string
  interval: number
  expiresIn: number
}

const visible = ref(false)
const userCode = ref('')
const verificationUri = ref('')
const interval = ref(0)
const expiresIn = ref(0)
const loading = ref(false)
const error = ref('')
const message = useMessage()

let countdownTimer: number | null = null
let expiryTimer: number | null = null

const showDeviceCode = (data: DeviceCodeData) => {
  userCode.value = data.userCode
  verificationUri.value = data.verificationUri
  interval.value = data.interval
  expiresIn.value = data.expiresIn
  visible.value = true
  loading.value = true
  error.value = ''
  
  // 设置过期定时器
  if (expiryTimer) clearTimeout(expiryTimer)
  expiryTimer = window.setTimeout(() => {
    visible.value = false
    message.error('授权码已过期，请重新登录')
  }, data.expiresIn * 1000)
}

const hideDeviceCode = () => {
  visible.value = false
  loading.value = false
  if (countdownTimer) clearTimeout(countdownTimer)
  if (expiryTimer) clearTimeout(expiryTimer)
}

const cancelLogin = () => {
  visible.value = false
  loading.value = false
  if (countdownTimer) clearTimeout(countdownTimer)
  if (expiryTimer) clearTimeout(expiryTimer)
  
  // 清理 sessionStorage 中的设备码
  sessionStorage.removeItem('github_device_code')
  sessionStorage.removeItem('github_interval')
  sessionStorage.removeItem('github_expires_in')
}

const openGitHub = () => {
  window.open(verificationUri.value, '_blank')
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(userCode.value)
    message.success('授权码已复制到剪贴板')
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
}

const handleShowDeviceCode = (event: CustomEvent<DeviceCodeData>) => {
  showDeviceCode(event.detail)
}

const handleHideDeviceCode = () => {
  hideDeviceCode()
}

onMounted(() => {
  window.addEventListener('show-device-code', handleShowDeviceCode as EventListener)
  window.addEventListener('hide-device-code', handleHideDeviceCode)
})

onUnmounted(() => {
  window.removeEventListener('show-device-code', handleShowDeviceCode as EventListener)
  window.removeEventListener('hide-device-code', handleHideDeviceCode)
  if (countdownTimer) clearTimeout(countdownTimer)
  if (expiryTimer) clearTimeout(expiryTimer)
})
</script>

<style scoped>
.device-login-content {
  padding: 8px 0;
}

.step {
  margin-bottom: 24px;
}

.step h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status {
  margin-top: 16px;
}
</style>
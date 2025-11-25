<template>
  <div class="auth-callback">
    <n-spin v-if="isLoading" size="large">
      <template #description>
        正在处理GitHub登录...
      </template>
    </n-spin>
    
    <n-result
      v-else-if="error"
      status="error"
      title="登录失败"
      :description="error"
    >
      <template #footer>
        <n-button @click="goHome">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { NSpin, NResult, NButton } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    console.log('Auth callback mounted')
    console.log('Current URL:', window.location.href)
    
    // 检查是否有设备流相关的临时数据
    const deviceCode = sessionStorage.getItem('github_device_code')
    
    if (deviceCode) {
      // 如果有设备流数据，显示提示信息
      isLoading.value = false
      error.value = '请在新打开的窗口中完成GitHub授权，然后返回此页面'
      return
    }
    
    // 检查URL search参数中的错误
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    
    if (errorParam) {
      error.value = `GitHub授权失败: ${errorParam}`
      isLoading.value = false
      return
    }
    
    // 如果没有设备流数据，可能用户直接访问了这个页面
    error.value = '请从主页开始登录流程'
    isLoading.value = false
    
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err instanceof Error ? err.message : '登录过程中发生错误'
    isLoading.value = false
  }
})

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
}
</style>
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
    console.log('URL hash:', window.location.hash)
    console.log('URL search:', window.location.search)
    
    // 检查URL search参数中的错误
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    
    if (errorParam) {
      error.value = `GitHub授权失败: ${errorParam}`
      isLoading.value = false
      return
    }
    
    // 处理授权回调
    await userStore.handleAuthCallback()
    
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
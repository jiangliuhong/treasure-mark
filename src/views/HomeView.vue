<template>
  <div class="home">
    <n-card title="欢迎使用藏宝书签">
      <n-space vertical size="large">
        <n-text>一个现代化的书签管理工具，支持多平台使用</n-text>
        
        <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3">
          <n-gi>
            <n-card hoverable>
              <template #header>
                <n-icon size="24">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
                  </svg>
                </n-icon>
                书签管理
              </template>
              <n-text>轻松管理您的网络书签</n-text>
            </n-card>
          </n-gi>
          
          <n-gi>
            <n-card hoverable>
              <template #header>
                <n-icon size="24">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                </n-icon>
                分类整理
              </template>
              <n-text>按类别整理您的收藏</n-text>
            </n-card>
          </n-gi>
          
          <n-gi>
            <n-card hoverable>
              <template #header>
                <n-icon size="24">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
                  </svg>
                </n-icon>
                数据安全
              </template>
              <n-text>本地存储，数据安全</n-text>
            </n-card>
          </n-gi>
        </n-grid>
        
        <n-space>
          <n-button type="primary" size="large" @click="$router.push('/bookmarks')">
            开始使用
          </n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
// Home组件逻辑
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
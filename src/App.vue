<template>
  <div id="app" :data-theme="theme ? 'dark' : 'light'">
    <n-config-provider :theme="theme">
      <n-message-provider>
        <n-layout style="height: 100vh;">
          <n-layout-header bordered style="height: 48px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between;">
            <h2 style="margin: 0; font-size: 1.2rem;">藏宝书签</h2>
            <div style="display: flex; align-items: center; gap: 12px;">
              <n-button size="small" @click="switchTheme">切换主题</n-button>
              <UserAvatar />
            </div>
          </n-layout-header>
          <n-layout has-sider style="height: calc(100vh - 48px);">
            <n-layout-sider
              bordered
              :width="220"
            >
              <GroupTree @group-selected="handleGroupSelected" />
            </n-layout-sider>
            <n-layout-content content-style="padding: 16px;">
              <router-view :selected-group-id="selectedGroupId" />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-message-provider>
    </n-config-provider>
    
    <!-- 设备登录模态框 -->
    <DeviceLoginModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui'
import GroupTree from './components/GroupTree.vue'
import UserAvatar from './components/UserAvatar.vue'
import DeviceLoginModal from './components/DeviceLoginModal.vue'
import { useGroupStore } from '@/stores/groups'

const theme = ref<GlobalTheme | null>(null)
const groupStore = useGroupStore()
const selectedGroupId = ref<number | null>(null)

const switchTheme = () => {
  theme.value = theme.value === null ? darkTheme : null
}

const handleGroupSelected = (groupId: number | null) => {
  selectedGroupId.value = groupId
}
</script>

<style scoped>
#app {
  height: 100vh;
  transition: all 0.3s ease;
}

/* 暗色主题全局样式 */
[data-theme="dark"] {
  background: #1a202c;
  color: #e2e8f0;
}

[data-theme="dark"] h2 {
  color: #e2e8f0;
}

[data-theme="dark"] .n-layout-header {
  background: #2d3748;
  border-color: rgba(159, 122, 234, 0.2);
}

[data-theme="dark"] .n-layout-sider {
  background: #2d3748;
  border-color: rgba(159, 122, 234, 0.2);
}

[data-theme="dark"] .n-layout-content {
  background: #1a202c;
}
</style>
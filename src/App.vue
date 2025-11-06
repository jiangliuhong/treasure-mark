<template>
  <div id="app">
    <n-config-provider :theme="theme">
      <n-layout>
        <n-layout-header bordered>
          <div class="header-content">
            <h1>藏宝书签</h1>
            <n-space>
              <n-button @click="switchTheme">切换主题</n-button>
            </n-space>
          </div>
        </n-layout-header>
        <n-layout-content content-style="padding: 24px;">
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { darkTheme, lightTheme, type GlobalTheme } from 'naive-ui'

const theme = ref<GlobalTheme | null>(null)

const switchTheme = () => {
  theme.value = theme.value === null ? darkTheme : null
}
</script>

<style scoped>
#app {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}
</style>
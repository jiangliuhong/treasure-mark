<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    title="GitHub 授权"
    positive-text="知道了"
    negative-text="取消"
    @negative-click="handleCancel"
    :mask-closable="false"
  >
    <div class="auth-content">
      <div class="auth-info">
        <n-alert type="warning" title="OAuth 认证限制">
          由于浏览器CORS策略限制，当前无法直接使用GitHub OAuth流程。
        </n-alert>
        
        <div class="token-instructions">
          <h4>推荐解决方案：使用 Personal Access Token</h4>
          <p>Personal Access Token 是更简单、更安全的认证方式：</p>
          <ol>
            <li>访问 <a href="https://github.com/settings/tokens" target="_blank">GitHub Personal Access Tokens</a></li>
            <li>点击 "Generate new token (classic)"</li>
            <li>为token命名（如：Treasure Mark）</li>
            <li>选择权限：<code>user:email</code> 和 <code>gist</code></li>
            <li>点击 "Generate token"</li>
            <li>复制生成的token（格式类似：<code>ghp_...</code>）</li>
            <li>在头像菜单中选择"使用 Personal Access Token"</li>
          </ol>
        </div>
        
        <div class="oauth-alternative">
          <h4>其他解决方案</h4>
          <ul>
            <li><strong>部署后端代理：</strong>创建后端服务器处理OAuth流程</li>
            <li><strong>GitHub Apps：</strong>使用GitHub Apps API（更复杂）</li>
          </ul>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NAlert } from 'naive-ui'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const showModal = ref(props.show)

watch(() => props.show, (newShow) => {
  showModal.value = newShow
})

watch(showModal, (newShow) => {
  emit('update:show', newShow)
})

const handleCancel = () => {
  showModal.value = false
}
</script>

<style scoped>
.auth-content {
  max-width: 600px;
}

.auth-info {
  text-align: left;
}

.token-instructions {
  margin: 20px 0;
  padding: 16px;
  background: var(--n-modal-color);
  border-radius: 6px;
}

.token-instructions h4 {
  margin: 0 0 12px 0;
  color: var(--n-text-color);
}

.token-instructions p {
  margin-bottom: 12px;
  color: var(--n-text-color-2);
}

.token-instructions ol {
  margin: 12px 0;
  padding-left: 20px;
  color: var(--n-text-color-2);
}

.token-instructions li {
  margin-bottom: 8px;
}

.token-instructions code {
  background: var(--n-code-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.token-instructions a {
  color: var(--n-primary-color);
  text-decoration: none;
}

.token-instructions a:hover {
  text-decoration: underline;
}

.oauth-alternative {
  margin: 20px 0;
}

.oauth-alternative h4 {
  margin: 0 0 12px 0;
  color: var(--n-text-color);
}

.oauth-alternative ul {
  margin: 12px 0;
  padding-left: 20px;
  color: var(--n-text-color-2);
}

.oauth-alternative li {
  margin-bottom: 8px;
}

.oauth-alternative strong {
  color: var(--n-text-color);
}
</style>
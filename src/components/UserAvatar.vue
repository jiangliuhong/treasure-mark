<template>
  <div class="user-avatar-container">
    <n-dropdown
      trigger="click"
      :options="dropdownOptions"
      @select="handleDropdownSelect"
      placement="bottom-end"
    >
      <n-avatar
        :size="36"
        :src="userStore.user?.avatarUrl"
        :fallback-src="defaultAvatar"
        class="user-avatar"
        round
      />
    </n-dropdown>
    
    <DeviceAuthModal
      v-model:show="showAuthModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NAvatar, NDropdown } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import DeviceAuthModal from './DeviceAuthModal.vue'

const userStore = useUserStore()
const showAuthModal = ref(false)

// 默认头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM0MjQ1NDUiLz4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxNCIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE4IDIyQzEyLjQ3NzIgMjIgOCAyNi40NzcyIDggMzJIMjhDMjggMjYuNDc3MiAyMy41MjI4IDIyIDE4IDIyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'

// 下拉菜单选项
const dropdownOptions = computed(() => {
  if (userStore.isLoggedIn && userStore.user) {
    return [
      {
        label: 'GitHub个人信息',
        key: 'profile',
        type: 'render',
        render: () => h('div', { class: 'user-profile' }, [
          h('div', { class: 'user-profile-header' }, [
            h('img', { 
              src: userStore.user!.avatarUrl, 
              alt: userStore.user!.name,
              class: 'profile-avatar'
            }),
            h('div', { class: 'profile-info' }, [
              h('div', { class: 'profile-name' }, userStore.user!.name),
              h('div', { class: 'profile-login' }, `@${userStore.user!.login}`)
            ])
          ]),
          userStore.user!.bio && h('div', { class: 'profile-bio' }, userStore.user!.bio),
          h('div', { class: 'profile-stats' }, [
            userStore.user!.followers && h('span', `${userStore.user!.followers} 关注者`),
            userStore.user!.following && h('span', `${userStore.user!.following} 关注中`),
            userStore.user!.publicRepos && h('span', `${userStore.user!.publicRepos} 仓库`)
          ].filter(Boolean).map(stat => h('span', stat))),
          userStore.user!.location && h('div', { class: 'profile-location' }, `📍 ${userStore.user!.location}`),
          userStore.user!.company && h('div', { class: 'profile-company' }, `🏢 ${userStore.user!.company}`)
        ].filter(Boolean))
      },
      {
        type: 'divider'
      },
      {
        label: '查看GitHub主页',
        key: 'github'
      },
      {
        label: '查看数据Gist',
        key: 'gist'
      },
      {
        label: '登出',
        key: 'logout'
      }
    ]
  } else {
    return [
      {
        label: 'GitHub登录（推荐）',
        key: 'login'
      },
      {
        label: '使用Personal Access Token',
        key: 'token'
      }
    ]
  }
})

const handleDropdownSelect = async (key: string) => {
  switch (key) {
    case 'login':
      showAuthModal.value = true
      break
    case 'token': {
      // 弹出输入框让用户输入Personal Access Token
      const token = prompt('请输入您的GitHub Personal Access Token:\n\n获取方法：\n1. 访问 https://github.com/settings/tokens\n2. 点击 "Generate new token (classic)"\n3. 选择权限：user:email, gist\n4. 复制生成的token并粘贴在此处')
      
      if (token) {
        try {
          await userStore.loginWithToken(token.trim())
        } catch (err) {
          console.error('Token登录失败:', err)
          alert('Token登录失败，请检查token是否正确')
        }
      }
      break
    }
    case 'logout':
      userStore.logout()
      break
    case 'github':
      if (userStore.user?.htmlUrl) {
        window.open(userStore.user.htmlUrl, '_blank')
      }
      break
    case 'gist':
      try {
        const { GistService } = await import('@/services/gist')
        const gistUrl = await GistService.getGistUrl()
        if (gistUrl) {
          window.open(gistUrl, '_blank')
        }
      } catch (error) {
        console.error('获取Gist链接失败:', error)
      }
      break
  }
}
</script>

<style scoped>
.user-avatar-container {
  position: relative;
  display: inline-block;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

/* 下拉菜单中的用户信息样式 */
:deep(.user-profile) {
  padding: 12px;
  min-width: 280px;
}

:deep(.user-profile-header) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.profile-avatar) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

:deep(.profile-info) {
  flex: 1;
}

:deep(.profile-name) {
  font-weight: 600;
  font-size: 14px;
  color: var(--n-text-color);
  margin-bottom: 2px;
}

:deep(.profile-login) {
  font-size: 12px;
  color: var(--n-text-color-2);
}

:deep(.profile-bio) {
  font-size: 12px;
  color: var(--n-text-color-2);
  margin-bottom: 8px;
  line-height: 1.4;
}

:deep(.profile-stats) {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

:deep(.profile-stats span) {
  font-size: 12px;
  color: var(--n-text-color-2);
}

:deep(.profile-location),
:deep(.profile-company) {
  font-size: 12px;
  color: var(--n-text-color-2);
  margin-bottom: 4px;
}
</style>
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  login: string
  name: string
  avatarUrl: string
  htmlUrl: string
  email?: string
  bio?: string
  location?: string
  company?: string
  followers?: number
  following?: number
  publicRepos?: number
  accessToken?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadUser = () => {
    const saved = localStorage.getItem('treasure-mark-user')
    if (saved) {
      try {
        const userData = JSON.parse(saved)
        user.value = userData
        isLoggedIn.value = true
      } catch (e) {
        console.error('Failed to parse saved user data:', e)
        localStorage.removeItem('treasure-mark-user')
      }
    }
  }

  const saveUser = (userData: User) => {
    user.value = userData
    isLoggedIn.value = true
    localStorage.setItem('treasure-mark-user', JSON.stringify(userData))
    
    // 登录成功后，加载用户的数据
    loadUserData()
  }

  const login = async (): Promise<{ deviceCode: string; verificationUri: string; verificationUriComplete?: string }> => {
    isLoading.value = true
    error.value = null
    
    try {
      // 使用 GitHub Device Flow
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      const scope = 'user:email gist'
      
      if (!clientId) {
        throw new Error('未配置 GitHub Client ID，请在 .env 文件中设置 VITE_GITHUB_CLIENT_ID')
      }
      
      // 生成用户代码和验证代码
      const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          scope: scope
        })
      })
      
      if (!deviceCodeResponse.ok) {
        throw new Error('无法初始化 GitHub 认证')
      }
      
      const deviceData = await deviceCodeResponse.json()
      
      // 保存 device_code 和验证代码，用于后续轮询
      sessionStorage.setItem('github_device_code', deviceData.device_code)
      sessionStorage.setItem('github_verification_uri', deviceData.verification_uri)
      sessionStorage.setItem('github_verification_uri_complete', deviceData.verification_uri_complete || '')
      
      // 返回设备流信息，模态框可以使用这些信息打开授权页面
      return {
        deviceCode: deviceData.device_code,
        verificationUri: deviceData.verification_uri,
        verificationUriComplete: deviceData.verification_uri_complete || ''
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      isLoading.value = false
      throw err
    }
  }
  
  // 使用 Personal Access Token 登录
  const loginWithToken = async (token: string) => {
    if (!token || !token.startsWith('ghp_') && !token.startsWith('github_pat_') && !token.startsWith('gho_') && !token.startsWith('ghs_')) {
      throw new Error('无效的GitHub Personal Access Token格式')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // 验证token并获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Treasure-Mark'
        }
      })
      
      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          throw new Error('Token无效或已过期')
        }
        throw new Error(`获取用户信息失败: ${userResponse.statusText}`)
      }
      
      const userData = await userResponse.json()
      
      // 获取用户邮箱（如果设置为私有）
      let email = userData.email
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'Treasure-Mark'
          }
        })
        
        if (emailResponse.ok) {
          const emails = await emailResponse.json()
          const primaryEmail = emails.find((e: any) => e.primary && e.verified)
          email = primaryEmail?.email
        }
      }
      
      const userObj: User = {
        id: userData.id.toString(),
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        email: email,
        bio: userData.bio,
        location: userData.location,
        company: userData.company,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        accessToken: token
      }
      
      // 保存用户数据
      saveUser(userObj)
      
    } catch (err) {
      console.error('Token登录失败:', err)
      error.value = err instanceof Error ? err.message : 'Token登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 保留方法以保持向后兼容
  const handleAuthCallback = async () => {
    console.log('OAuth flow is not available due to CORS restrictions')
  }

  

  // 加载用户数据
  const loadUserData = async () => {
    if (!isLoggedIn.value) return
    
    try {
      // 动态导入store以避免循环依赖
      const { useGroupStore } = await import('./groups')
      const { useBookmarkStore } = await import('./bookmarks')
      
      const groupStore = useGroupStore()
      const bookmarkStore = useBookmarkStore()
      
      // 并行加载分组和书签数据
      await Promise.all([
        groupStore.loadGroups(),
        bookmarkStore.loadBookmarks()
      ])
    } catch (err) {
      console.error('加载用户数据失败:', err)
    }
  }

  // 清理用户数据
  const clearUserData = () => {
    // 清理内存中的数据，但保留localStorage作为备份
    // 这样用户下次登录时可以恢复数据
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    localStorage.removeItem('treasure-mark-user')
    
    // 登出时清理数据
    clearUserData()
  }

  // 初始化时加载数据
  loadUser()

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    login,
    loginWithToken,
    logout,
    handleAuthCallback,
    loadUserData
  }
})
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

  const login = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 使用 GitHub Device Flow
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      const scope = 'user:email gist'
      
      // 第一步：获取 device code 和 user code
      const deviceResponse = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: clientId,
          scope: scope
        })
      })
      
      if (!deviceResponse.ok) {
        throw new Error('获取设备码失败')
      }
      
      const deviceData = await deviceResponse.json()
      
      // 保存设备信息到 sessionStorage
      sessionStorage.setItem('github_device_code', deviceData.device_code)
      sessionStorage.setItem('github_interval', deviceData.interval.toString())
      sessionStorage.setItem('github_expires_in', deviceData.expires_in.toString())
      
      // 触发显示设备码的事件
      window.dispatchEvent(new CustomEvent('show-device-code', {
        detail: {
          userCode: deviceData.user_code,
          verificationUri: deviceData.verification_uri,
          interval: deviceData.interval,
          expiresIn: deviceData.expires_in
        }
      }))
      
      // 开始轮询获取 token
      await pollForToken(deviceData.device_code, deviceData.interval)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      isLoading.value = false
    }
  }

  const handleAuthCallback = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Handling auth callback...')
      console.log('URL hash:', window.location.hash)
      console.log('URL search:', window.location.search)
      
      // 从 URL fragment 中获取参数
      const fragment = window.location.hash.substring(1)
      console.log('Fragment:', fragment)
      
      const params = new URLSearchParams(fragment)
      const accessToken = params.get('access_token')
      const tokenType = params.get('token_type')
      const state = params.get('state')
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')
      
      console.log('Parsed params:', { accessToken: !!accessToken, tokenType, state, errorParam })
      
      if (errorParam) {
        throw new Error(errorDescription || `GitHub授权失败: ${errorParam}`)
      }
      
      if (!accessToken || !state) {
        console.log('Missing parameters, checking if this is a code flow...')
        // 如果没有 token，可能是 code flow，尝试从 search 参数获取
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        const searchState = searchParams.get('state')
        
        if (code && searchState) {
          console.log('Detected code flow, but this is not implemented for pure frontend')
          throw new Error('检测到授权码，但纯前端应用无法处理授权码交换。请使用支持代理服务器的环境。')
        }
        
        throw new Error('缺少必要的授权参数')
      }
      
      // 验证state参数
      const savedState = sessionStorage.getItem('github_oauth_state')
      if (!savedState || savedState !== state) {
        throw new Error('Invalid state parameter')
      }
      
      // 清除sessionStorage
      sessionStorage.removeItem('github_oauth_state')
      
      console.log('Fetching user data...')
      // 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'Treasure-Mark'
        }
      })
      
      if (!userResponse.ok) {
        throw new Error(`获取用户信息失败: ${userResponse.statusText}`)
      }
      
      const userData = await userResponse.json()
      console.log('User data received:', userData)
      
      // 获取用户邮箱（如果设置为私有）
      let email = userData.email
      if (!email) {
        console.log('Fetching user emails...')
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `token ${accessToken}`,
            'User-Agent': 'Treasure-Mark'
          }
        })
        
        if (!emailResponse.ok) {
          console.warn('Failed to fetch emails:', emailResponse.statusText)
        } else {
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
        accessToken: accessToken
      }
      
      console.log('Saving user data...')
      saveUser(userObj)
      
      // 重定向到主页
      console.log('Redirecting to home...')
      window.location.href = '/'
      
    } catch (err) {
      console.error('Auth callback error:', err)
      error.value = err instanceof Error ? err.message : '登录失败'
      isLoading.value = false
    }
  }

  // 轮询获取 token
  const pollForToken = async (deviceCode: string, interval: number) => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    let attempts = 0
    const maxAttempts = 30 // 最多尝试30次
    
    const poll = async () => {
      try {
        attempts++
        
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            client_id: clientId,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        })
        
        if (!tokenResponse.ok) {
          throw new Error('Token请求失败')
        }
        
        const tokenData = await tokenResponse.json()
        
        if (tokenData.access_token) {
          // 获取到 token，处理用户信息
          await handleTokenReceived(tokenData.access_token)
          return
        }
        
        if (tokenData.error === 'authorization_pending') {
          // 用户还未授权，继续轮询
          if (attempts < maxAttempts) {
            setTimeout(poll, interval * 1000)
          } else {
            throw new Error('授权超时，请重试')
          }
        } else if (tokenData.error === 'slow_down') {
          // 需要减慢轮询速度
          setTimeout(poll, (interval + 5) * 1000)
        } else {
          throw new Error(tokenData.error_description || '授权失败')
        }
        
      } catch (err) {
        error.value = err instanceof Error ? err.message : '登录失败'
        isLoading.value = false
        window.dispatchEvent(new CustomEvent('hide-device-code'))
      }
    }
    
    // 开始轮询
    setTimeout(poll, interval * 1000)
  }

  // 处理获取到的 token
  const handleTokenReceived = async (accessToken: string) => {
    try {
      // 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'Treasure-Mark'
        }
      })
      
      if (!userResponse.ok) {
        throw new Error(`获取用户信息失败: ${userResponse.statusText}`)
      }
      
      const userData = await userResponse.json()
      
      // 获取用户邮箱（如果设置为私有）
      let email = userData.email
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `token ${accessToken}`,
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
        accessToken: accessToken
      }
      
      saveUser(userObj)
      
      // 隐藏设备码显示
      window.dispatchEvent(new CustomEvent('hide-device-code'))
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '处理用户信息失败'
      isLoading.value = false
      window.dispatchEvent(new CustomEvent('hide-device-code'))
    }
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
    logout,
    handleAuthCallback,
    loadUserData
  }
})
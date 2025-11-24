import { useUserStore } from '@/stores/user'
import type { Group } from '@/stores/groups'
import type { Bookmark } from '@/stores/bookmarks'

export interface GistData {
  groups: Group[]
  bookmarks: Bookmark[]
}

export interface GistResponse {
  id: string
  description: string
  public: boolean
  created_at: string
  updated_at: string
  files: Record<string, {
    filename: string
    type: string
    language: string
    raw_url: string
    size: number
    content?: string
  }>
}

export class GistService {
  private static readonly GIST_FILENAME = 'treasure-mark-data.json'
  private static readonly GIST_DESCRIPTION = '藏宝书签数据'

  static async getAccessToken(): Promise<string> {
    const userStore = useUserStore()
    if (!userStore.user?.accessToken) {
      throw new Error('用户未登录或缺少访问令牌')
    }
    return userStore.user.accessToken
  }

  static async findOrCreateGist(): Promise<string> {
    const token = await this.getAccessToken()
    
    // 首先查找现有的gist
    const existingGist = await this.findExistingGist(token)
    if (existingGist) {
      return existingGist.id
    }
    
    // 如果没有找到，创建新的gist
    return await this.createGist(token)
  }

  private static async findExistingGist(token: string): Promise<GistResponse | null> {
    try {
      const response = await fetch('https://api.github.com/gists', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`获取gist列表失败: ${response.statusText}`)
      }
      
      const gists: GistResponse[] = await response.json()
      
      // 查找包含我们文件名的gist
      return gists.find(gist => 
        gist.description === this.GIST_DESCRIPTION && 
        Object.keys(gist.files).includes(this.GIST_FILENAME)
      ) || null
    } catch (error) {
      console.error('查找现有gist失败:', error)
      return null
    }
  }

  private static async createGist(token: string): Promise<string> {
    const initialData: GistData = {
      groups: [
        {
          id: 1,
          name: '默认分组',
          parentId: null,
          children: [],
          isDefault: true
        }
      ],
      bookmarks: []
    }

    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: this.GIST_DESCRIPTION,
          public: false,
          files: {
            [this.GIST_FILENAME]: {
              content: JSON.stringify(initialData, null, 2)
            }
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`创建gist失败: ${response.statusText}`)
      }
      
      const gist: GistResponse = await response.json()
      return gist.id
    } catch (error) {
      console.error('创建gist失败:', error)
      throw error
    }
  }

  static async loadData(): Promise<GistData> {
    const token = await this.getAccessToken()
    const gistId = await this.findOrCreateGist()
    
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`获取gist失败: ${response.statusText}`)
      }
      
      const gist: GistResponse = await response.json()
      const fileContent = gist.files[this.GIST_FILENAME]?.content
      
      if (!fileContent) {
        throw new Error('gist中找不到数据文件')
      }
      
      return JSON.parse(fileContent)
    } catch (error) {
      console.error('加载数据失败:', error)
      // 返回默认数据
      return {
        groups: [
          {
            id: 1,
            name: '默认分组',
            parentId: null,
            children: [],
            isDefault: true
          }
        ],
        bookmarks: []
      }
    }
  }

  static async saveData(data: GistData): Promise<void> {
    const token = await this.getAccessToken()
    const gistId = await this.findOrCreateGist()
    
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: this.GIST_DESCRIPTION,
          files: {
            [this.GIST_FILENAME]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`保存gist失败: ${response.statusText}`)
      }
    } catch (error) {
      console.error('保存数据失败:', error)
      throw error
    }
  }

  static async getGistUrl(): Promise<string | null> {
    const token = await this.getAccessToken()
    const gistId = await this.findOrCreateGist()
    
    return `https://gist.github.com/${(await this.getCurrentUser(token))?.login}/${gistId}`
  }

  private static async getCurrentUser(token: string): Promise<{ login: string } | null> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Treasure-Mark'
        }
      })
      
      if (!response.ok) {
        throw new Error(`获取用户信息失败: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
}
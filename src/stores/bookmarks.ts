import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GistService } from '@/services/gist'
import { useUserStore } from './user'
import { useGroupStore } from './groups'

export interface Bookmark {
  id: number
  title: string
  url: string
  description: string
  createdAt: string
  groupId: number
  tags?: string[]
}

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref<Bookmark[]>([])
  const categories = ref(['开发', '设计', '工具', '学习', '娱乐', '其他'])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const loadBookmarks = async () => {
    const userStore = useUserStore()
    
    // 如果用户未登录，使用localStorage
    if (!userStore.isLoggedIn) {
      const saved = localStorage.getItem('treasure-mark-bookmarks')
      if (saved) {
        bookmarks.value = JSON.parse(saved)
      }
      return
    }
    
    // 用户已登录，从Gist加载
    isLoading.value = true
    error.value = null
    
    try {
      const data = await GistService.loadData()
      bookmarks.value = data.bookmarks || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载书签失败'
      // 如果Gist加载失败，回退到localStorage
      const saved = localStorage.getItem('treasure-mark-bookmarks')
      if (saved) {
        bookmarks.value = JSON.parse(saved)
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const saveBookmarks = async () => {
    const userStore = useUserStore()
    
    // 如果用户未登录，使用localStorage
    if (!userStore.isLoggedIn) {
      localStorage.setItem('treasure-mark-bookmarks', JSON.stringify(bookmarks.value))
      return
    }
    
    // 用户已登录，保存到Gist
    isLoading.value = true
    error.value = null
    
    try {
      // 获取当前分组数据
      const groupStore = useGroupStore()
      const data = {
        groups: groupStore.groups,
        bookmarks: bookmarks.value
      }
      
      await GistService.saveData(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存书签失败'
      // 如果Gist保存失败，仍然保存到localStorage作为备份
      localStorage.setItem('treasure-mark-bookmarks', JSON.stringify(bookmarks.value))
    } finally {
      isLoading.value = false
    }
  }
  
  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    }
    bookmarks.value.push(newBookmark)
    saveBookmarks()
    return newBookmark
  }
  
  const updateBookmark = (id: number, updates: Partial<Bookmark>) => {
    const index = bookmarks.value.findIndex(bookmark => bookmark.id === id)
    if (index > -1) {
      bookmarks.value[index] = { ...bookmarks.value[index], ...updates }
      saveBookmarks()
      return bookmarks.value[index]
    }
    return null
  }
  
  const deleteBookmark = (id: number) => {
    const index = bookmarks.value.findIndex(bookmark => bookmark.id === id)
    if (index > -1) {
      bookmarks.value.splice(index, 1)
      saveBookmarks()
      return true
    }
    return false
  }
  
  const getBookmarkById = (id: number) => {
    return bookmarks.value.find(bookmark => bookmark.id === id)
  }
  
  const searchBookmarks = (query: string) => {
    if (!query) return bookmarks.value
    const lowerQuery = query.toLowerCase()
    return bookmarks.value.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery) ||
      bookmark.description.toLowerCase().includes(lowerQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  const getBookmarksByGroup = (groupId: number) => {
    return bookmarks.value.filter(bookmark => bookmark.groupId === groupId)
  }

  const getBookmarksByGroups = (groupIds: number[]) => {
    return bookmarks.value.filter(bookmark => groupIds.includes(bookmark.groupId))
  }

  const getAllBookmarks = () => {
    return bookmarks.value
  }
  
  // 初始化时加载数据
  loadBookmarks()
  
  return {
    bookmarks,
    isLoading,
    error,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmarkById,
    searchBookmarks,
    getBookmarksByGroup,
    getBookmarksByGroups,
    getAllBookmarks,
    loadBookmarks,
    saveBookmarks
  }
})
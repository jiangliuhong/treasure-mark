import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Bookmark {
  id: number
  title: string
  url: string
  category: string
  description: string
  createdAt: string
  tags?: string[]
}

export const useBookmarkStore = defineStore('bookmarks', () => {
  const bookmarks = ref<Bookmark[]>([])
  const categories = ref(['开发', '设计', '工具', '学习', '娱乐', '其他'])
  
  const loadBookmarks = () => {
    const saved = localStorage.getItem('treasure-mark-bookmarks')
    if (saved) {
      bookmarks.value = JSON.parse(saved)
    }
  }
  
  const saveBookmarks = () => {
    localStorage.setItem('treasure-mark-bookmarks', JSON.stringify(bookmarks.value))
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
      bookmark.category.toLowerCase().includes(lowerQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  const getBookmarksByCategory = (category: string) => {
    return bookmarks.value.filter(bookmark => bookmark.category === category)
  }
  
  // 初始化时加载数据
  loadBookmarks()
  
  return {
    bookmarks,
    categories,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmarkById,
    searchBookmarks,
    getBookmarksByCategory,
    loadBookmarks,
    saveBookmarks
  }
})
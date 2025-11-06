<template>
  <div class="options-app">
    <n-layout style="min-height: 100vh;">
      <n-layout-header bordered style="height: 64px; padding: 0 24px;">
        <div style="display: flex; align-items: center; height: 100%;">
          <h1 style="margin: 0;">藏宝书签 - 设置</h1>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <n-space vertical size="large">
          <n-card title="数据管理">
            <n-space>
              <n-button @click="exportBookmarks">导出书签</n-button>
              <n-button @click="importBookmarks">导入书签</n-button>
              <n-button type="error" @click="clearAllBookmarks">清空所有书签</n-button>
            </n-space>
          </n-card>
          
          <n-card title="书签列表">
            <n-data-table
              :columns="columns"
              :data="bookmarks"
              :pagination="pagination"
              :bordered="false"
            />
          </n-card>
        </n-space>
      </n-layout-content>
    </n-layout>
    
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useMessage, NButton } from 'naive-ui'

interface Bookmark {
  id: number
  title: string
  url: string
  category: string
  description: string
  createdAt: string
}

const message = useMessage()
const fileInput = ref<HTMLInputElement>()
const bookmarks = ref<Bookmark[]>([])

const columns = [
  {
    title: '标题',
    key: 'title',
    render(row: Bookmark) {
      return h('a', { href: row.url, target: '_blank' }, row.title)
    }
  },
  {
    title: '网址',
    key: 'url'
  },
  {
    title: '分类',
    key: 'category'
  },
  {
    title: '描述',
    key: 'description'
  },
  {
    title: '创建时间',
    key: 'createdAt'
  },
  {
    title: '操作',
    key: 'actions',
    render(row: Bookmark) {
      return h(NButton, {
        size: 'small',
        type: 'error',
        onClick: () => deleteBookmark(row.id)
      }, '删除')
    }
  }
]

const pagination = {
  pageSize: 20
}

const loadBookmarks = async () => {
  try {
    const result = await chrome.storage.local.get(['treasure-mark-bookmarks'])
    bookmarks.value = result['treasure-mark-bookmarks'] || []
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
    message.error('加载书签失败')
  }
}

const saveBookmarks = async () => {
  try {
    await chrome.storage.local.set({ 'treasure-mark-bookmarks': bookmarks.value })
  } catch (error) {
    console.error('Failed to save bookmarks:', error)
    message.error('保存失败')
  }
}

const exportBookmarks = () => {
  const dataStr = JSON.stringify(bookmarks.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `treasure-mark-bookmarks-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  message.success('导出成功')
}

const importBookmarks = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const importedBookmarks = JSON.parse(text) as Bookmark[]
    
    if (Array.isArray(importedBookmarks)) {
      // 重新生成ID以避免冲突
      const processedBookmarks = importedBookmarks.map((bookmark, index) => ({
        ...bookmark,
        id: Date.now() + index
      }))
      
      bookmarks.value = [...processedBookmarks, ...bookmarks.value]
      await saveBookmarks()
      message.success(`成功导入 ${processedBookmarks.length} 个书签`)
    } else {
      message.error('无效的文件格式')
    }
  } catch (error) {
    console.error('Import failed:', error)
    message.error('导入失败')
  }
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const deleteBookmark = async (id: number) => {
  const index = bookmarks.value.findIndex(bookmark => bookmark.id === id)
  if (index > -1) {
    bookmarks.value.splice(index, 1)
    await saveBookmarks()
    message.success('删除成功')
  }
}

const clearAllBookmarks = async () => {
  if (confirm('确定要清空所有书签吗？此操作不可恢复。')) {
    bookmarks.value = []
    await saveBookmarks()
    message.success('已清空所有书签')
  }
}

onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped>
.options-app {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
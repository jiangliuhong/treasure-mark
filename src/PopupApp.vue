<template>
  <div class="popup-app">
    <n-layout style="height: 500px;">
      <n-layout-header bordered style="height: 60px; padding: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="margin: 0;">藏宝书签</h3>
          <n-button size="small" @click="openOptions">设置</n-button>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding: 12px;">
        <n-space vertical size="small">
          <n-input
            v-model:value="searchText"
            placeholder="搜索书签..."
            size="small"
            clearable
          />
          <n-button
            type="primary"
            size="small"
            block
            @click="addCurrentPage"
          >
            添加当前页面
          </n-button>
          <n-divider style="margin: 8px 0;" />
          <div class="bookmark-list">
            <n-virtual-list
              :items="filteredBookmarks"
              :item-size="60"
              style="max-height: 320px;"
            >
              <template #default="{ item }">
                <n-card
                  size="small"
                  hoverable
                  style="margin-bottom: 8px; cursor: pointer;"
                  @click="openBookmark(item.url)"
                >
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ item.title }}
                      </div>
                      <div style="font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ item.url }}
                      </div>
                    </div>
                    <n-button
                      size="tiny"
                      type="error"
                      style="margin-left: 8px; flex-shrink: 0;"
                      @click.stop="deleteBookmark(item.id)"
                    >
                      删除
                    </n-button>
                  </div>
                </n-card>
              </template>
            </n-virtual-list>
          </div>
        </n-space>
      </n-layout-content>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

interface Bookmark {
  id: number
  title: string
  url: string
  category: string
  description: string
  createdAt: string
}

const message = useMessage()
const searchText = ref('')
const bookmarks = ref<Bookmark[]>([])

const filteredBookmarks = computed(() => {
  if (!searchText.value) return bookmarks.value
  return bookmarks.value.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const loadBookmarks = async () => {
  try {
    const result = await chrome.storage.local.get(['treasure-mark-bookmarks'])
    bookmarks.value = result['treasure-mark-bookmarks'] || []
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
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

const addCurrentPage = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.url && tab.title) {
      const newBookmark: Bookmark = {
        id: Date.now(),
        title: tab.title,
        url: tab.url,
        category: '未分类',
        description: '',
        createdAt: new Date().toISOString().split('T')[0]
      }
      bookmarks.value.unshift(newBookmark)
      await saveBookmarks()
      message.success('书签添加成功')
    }
  } catch (error) {
    console.error('Failed to add current page:', error)
    message.error('添加失败')
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

const openBookmark = (url: string) => {
  chrome.tabs.create({ url })
}

const openOptions = () => {
  chrome.runtime.openOptionsPage()
}

onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped>
.popup-app {
  width: 100%;
  height: 100%;
}

.bookmark-list {
  max-height: 320px;
  overflow-y: auto;
}
</style>
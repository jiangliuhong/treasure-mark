<template>
  <div class="bookmarks">
    <n-card title="书签管理">
      <n-space vertical size="large">
        <n-space>
          <n-button type="primary" @click="showAddModal = true">
            添加书签
          </n-button>
          <n-input v-model:value="searchText" placeholder="搜索书签..." clearable />
        </n-space>
        
        <n-data-table
          :columns="columns"
          :data="filteredBookmarks"
          :pagination="pagination"
          :bordered="false"
        />
      </n-space>
    </n-card>
    
    <n-modal v-model:show="showAddModal" preset="dialog" title="添加书签">
      <template #default>
        <n-form ref="formRef" :model="newBookmark" :rules="rules">
          <n-form-item label="标题" path="title">
            <n-input v-model:value="newBookmark.title" placeholder="输入书签标题" />
          </n-form-item>
          <n-form-item label="网址" path="url">
            <n-input v-model:value="newBookmark.url" placeholder="https://example.com" />
          </n-form-item>
          <n-form-item label="分类" path="category">
            <n-select v-model:value="newBookmark.category" :options="categoryOptions" />
          </n-form-item>
          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="newBookmark.description"
              type="textarea"
              placeholder="输入描述（可选）"
            />
          </n-form-item>
        </n-form>
      </template>
      <template #action>
        <n-space>
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="addBookmark">添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useMessage, NButton, NForm, NFormItem } from 'naive-ui'
import { useBookmarkStore } from '@/stores/bookmarks'

const props = defineProps<{
  selectedGroupId: number | null
}>()

interface Bookmark {
  id: number
  title: string
  url: string
  category: string
  description: string
  createdAt: string
}

const message = useMessage()
const bookmarkStore = useBookmarkStore()
const showAddModal = ref(false)
const searchText = ref('')
const formRef = ref()

const newBookmark = ref({
  title: '',
  url: '',
  category: '开发',
  description: ''
})

const categoryOptions = bookmarkStore.categories.map(category => ({
  label: category,
  value: category
}))

const rules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  url: { required: true, message: '请输入网址', trigger: 'blur' }
}

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
  pageSize: 10
}

const filteredBookmarks = computed(() => {
  return bookmarkStore.searchBookmarks(searchText.value)
})

const addBookmark = async () => {
  if (!newBookmark.value.title || !newBookmark.value.url) {
    message.error('请填写必填项')
    return
  }
  
  try {
    bookmarkStore.addBookmark(newBookmark.value)
    
    newBookmark.value = {
      title: '',
      url: '',
      category: '开发',
      description: ''
    }
    
    showAddModal.value = false
    message.success('书签添加成功')
  } catch (error) {
    message.error('添加失败')
  }
}

const deleteBookmark = (id: number) => {
  if (bookmarkStore.deleteBookmark(id)) {
    message.success('书签删除成功')
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.bookmarks {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
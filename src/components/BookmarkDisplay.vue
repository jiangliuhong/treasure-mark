<template>
  <div class="bookmark-display">
    <div class="search-bar">
      <n-input
        v-model:value="searchQuery"
        placeholder="搜索书签名称或地址..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
            </svg>
          </n-icon>
        </template>
      </n-input>
    </div>
    
    <div class="bookmark-content">
      <div v-if="filteredBookmarks.length === 0" class="empty-bookmarks">
        <n-empty :description="props.selectedGroupId ? '该分组暂无书签' : '暂无书签'">
          <template #extra>
            <n-button type="primary" @click="showAddModal = true">
              添加第一个书签
            </n-button>
          </template>
        </n-empty>
      </div>
      
      <div v-else>
        <!-- 如果有搜索，显示所有匹配的书签，不按分组分隔 -->
        <template v-if="searchQuery">
          <div class="bookmark-grid">
            <n-card
              v-for="bookmark in filteredBookmarks"
              :key="bookmark.id"
              hoverable
              size="small"
              class="bookmark-card"
              @click="openBookmark(bookmark.url)"
            >
              <div class="bookmark-title">{{ bookmark.title }}</div>
              <div class="bookmark-url">{{ bookmark.url }}</div>
              <div class="bookmark-actions" @click.stop>
                <n-dropdown
                  trigger="click"
                  :options="[
                    { label: '编辑', key: 'edit' },
                    { label: '删除', key: 'delete' }
                  ]"
                  @select="(key) => handleBookmarkAction(key, bookmark)"
                >
                  <n-button size="tiny" text @click.stop>⋯</n-button>
                </n-dropdown>
              </div>
            </n-card>
            
            <!-- 添加书签按钮 - 与搜索结果同行 -->
            <n-card
              hoverable
              size="small"
              class="add-bookmark-card"
              @click="showAddModal = true"
            >
              <div class="add-bookmark-content">
                <n-icon size="24">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                  </svg>
                </n-icon>
                <div>添加书签</div>
              </div>
            </n-card>
          </div>
        </template>
        
        <!-- 如果没有搜索，按分组显示 -->
        <template v-else>
          <!-- 如果未选中分组，显示所有分组 -->
          <template v-if="!props.selectedGroupId">
            <div v-for="group in groupStore.getGroupTree()" :key="group.id" class="group-section">
              <n-divider v-if="getBookmarksByGroup(group.id).length > 0">
                <n-text type="primary" strong>{{ group.name }}</n-text>
              </n-divider>
              <div v-if="getBookmarksByGroup(group.id).length > 0" class="bookmark-grid">
                <n-card
                  v-for="bookmark in getBookmarksByGroup(group.id)"
                  :key="bookmark.id"
                  hoverable
                  size="small"
                  class="bookmark-card"
                  @click="openBookmark(bookmark.url)"
                >
                  <div class="bookmark-title">{{ bookmark.title }}</div>
                  <div class="bookmark-url">{{ bookmark.url }}</div>
                  <div class="bookmark-actions" @click.stop>
                    <n-dropdown
                      trigger="click"
                      :options="[
                        { label: '编辑', key: 'edit' },
                        { label: '删除', key: 'delete' }
                      ]"
                      @select="(key) => handleBookmarkAction(key, bookmark)"
                    >
                      <n-button size="tiny" text @click.stop>⋯</n-button>
                    </n-dropdown>
                  </div>
                </n-card>
                
                <!-- 主分组的添加书签按钮 -->
                <n-card
                  hoverable
                  size="small"
                  class="add-bookmark-card"
                  @click="showAddModal = true"
                >
                  <div class="add-bookmark-content">
                    <n-icon size="24">
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                      </svg>
                    </n-icon>
                    <div>添加书签</div>
                  </div>
                </n-card>
              </div>
              
              <!-- 递归显示子分组 -->
              <template v-if="group.children && group.children.length > 0">
                <div v-for="childGroup in group.children" :key="childGroup.id" class="group-section" style="margin-left: 20px;">
                  <n-divider v-if="getBookmarksByGroup(childGroup.id).length > 0">
                    <n-text type="primary" strong>{{ childGroup.name }}</n-text>
                  </n-divider>
                  <div v-if="getBookmarksByGroup(childGroup.id).length > 0" class="bookmark-grid">
                    <n-card
                      v-for="bookmark in getBookmarksByGroup(childGroup.id)"
                      :key="bookmark.id"
                      hoverable
                      size="small"
                      class="bookmark-card"
                      @click="openBookmark(bookmark.url)"
                    >
                      <div class="bookmark-title">{{ bookmark.title }}</div>
                      <div class="bookmark-url">{{ bookmark.url }}</div>
                      <div class="bookmark-actions" @click.stop>
                        <n-dropdown
                          trigger="click"
                          :options="[
                            { label: '编辑', key: 'edit' },
                            { label: '删除', key: 'delete' }
                          ]"
                          @select="(key) => handleBookmarkAction(key, bookmark)"
                        >
                          <n-button size="tiny" text @click.stop>⋯</n-button>
                        </n-dropdown>
                      </div>
                    </n-card>
                    
                    <!-- 子分组的添加书签按钮 -->
                    <n-card
                      hoverable
                      size="small"
                      class="add-bookmark-card"
                      @click="showAddModal = true"
                    >
                      <div class="add-bookmark-content">
                        <n-icon size="24">
                          <svg viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                          </svg>
                        </n-icon>
                        <div>添加书签</div>
                      </div>
                    </n-card>
                  </div>
                </div>
              </template>
            </div>
          </template>
          
          <!-- 如果选中了分组，显示该分组及其子分组 -->
          <template v-else>
            <!-- 先显示当前分组的书签 -->
            <div class="group-section">
              <n-divider v-if="currentGroupBookmarks.length > 0 || selectedGroupChildren.length > 0">
                <n-text type="primary" strong>{{ selectedGroupName }}</n-text>
              </n-divider>
              <div class="bookmark-grid">
                <n-card
                  v-for="bookmark in currentGroupBookmarks"
                  :key="bookmark.id"
                  hoverable
                  size="small"
                  class="bookmark-card"
                  @click="openBookmark(bookmark.url)"
                >
                  <div class="bookmark-title">{{ bookmark.title }}</div>
                  <div class="bookmark-url">{{ bookmark.url }}</div>
                  <div class="bookmark-actions" @click.stop>
                    <n-dropdown
                      trigger="click"
                      :options="[
                        { label: '编辑', key: 'edit' },
                        { label: '删除', key: 'delete' }
                      ]"
                      @select="(key) => handleBookmarkAction(key, bookmark)"
                    >
                      <n-button size="tiny" text @click.stop>⋯</n-button>
                    </n-dropdown>
                  </div>
                </n-card>
                
                <!-- 添加书签按钮 - 与书签同行 -->
                <n-card
                  hoverable
                  size="small"
                  class="add-bookmark-card"
                  @click="showAddModal = true"
                >
                  <div class="add-bookmark-content">
                    <n-icon size="24">
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                      </svg>
                    </n-icon>
                    <div>添加书签</div>
                  </div>
                </n-card>
              </div>
            </div>
            
            <!-- 然后显示子分组的书签 -->
            <template v-if="selectedGroupChildren.length > 0">
              <div v-for="childGroup in selectedGroupChildren" :key="childGroup.id" class="group-section">
                <n-divider v-if="getBookmarksByGroup(childGroup.id).length > 0">
                  <n-text type="primary" strong>{{ childGroup.name }}</n-text>
                </n-divider>
                <div v-if="getBookmarksByGroup(childGroup.id).length > 0" class="bookmark-grid">
                  <n-card
                    v-for="bookmark in getBookmarksByGroup(childGroup.id)"
                    :key="bookmark.id"
                    hoverable
                    size="small"
                    class="bookmark-card"
                    @click="openBookmark(bookmark.url)"
                  >
                    <div class="bookmark-title">{{ bookmark.title }}</div>
                    <div class="bookmark-url">{{ bookmark.url }}</div>
                    <div class="bookmark-actions" @click.stop>
                      <n-dropdown
                        trigger="click"
                        :options="[
                          { label: '编辑', key: 'edit' },
                          { label: '删除', key: 'delete' }
                        ]"
                        @select="(key) => handleBookmarkAction(key, bookmark)"
                      >
                        <n-button size="tiny" text @click.stop>⋯</n-button>
                      </n-dropdown>
                    </div>
                  </n-card>
                  
                  <!-- 子分组的添加书签按钮 -->
                  <n-card
                    hoverable
                    size="small"
                    class="add-bookmark-card"
                    @click="showAddModal = true"
                  >
                    <div class="add-bookmark-content">
                      <n-icon size="24">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                        </svg>
                      </n-icon>
                      <div>添加书签</div>
                    </div>
                  </n-card>
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>
    
    <!-- 添加书签对话框 -->
    <n-modal v-model:show="showAddModal" preset="dialog" title="添加书签">
      <template #default>
        <n-form ref="formRef" :model="newBookmark" :rules="rules">
          <n-form-item label="名称" path="title">
            <n-input v-model:value="newBookmark.title" placeholder="请输入书签名称" />
          </n-form-item>
          <n-form-item label="地址" path="url">
            <n-input v-model:value="newBookmark.url" placeholder="请输入书签地址" />
          </n-form-item>
          <n-form-item label="分组" path="groupId">
            <n-tree-select
              v-model:value="newBookmark.groupId"
              :options="allGroupOptions"
              placeholder="选择分组"
              key-field="value"
              label-field="label"
              children-field="children"
            />
          </n-form-item>
        </n-form>
      </template>
      <template #action>
        <n-space>
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddBookmark">确定</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <!-- 编辑书签对话框 -->
    <n-modal v-model:show="showEditModal" preset="dialog" title="编辑书签">
      <template #default>
        <n-form ref="editFormRef" :model="editingBookmark" :rules="rules">
          <n-form-item label="名称" path="title">
            <n-input v-model:value="editingBookmark.title" placeholder="请输入书签名称" />
          </n-form-item>
          <n-form-item label="地址" path="url">
            <n-input v-model:value="editingBookmark.url" placeholder="请输入书签地址" />
          </n-form-item>
          <n-form-item label="分组" path="groupId">
            <n-tree-select
              v-model:value="editingBookmark.groupId"
              :options="allGroupOptions"
              placeholder="选择分组"
              key-field="value"
              label-field="label"
              children-field="children"
            />
          </n-form-item>
        </n-form>
      </template>
      <template #action>
        <n-space>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditBookmark">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useBookmarkStore, type Bookmark } from '@/stores/bookmarks'
import { useGroupStore } from '@/stores/groups'

const props = defineProps<{
  selectedGroupId: number | null
}>()

const emit = defineEmits<{
  bookmarkSelected: [bookmark: Bookmark]
}>()

const message = useMessage()
const bookmarkStore = useBookmarkStore()
const groupStore = useGroupStore()

const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const formRef = ref()
const editFormRef = ref()

const newBookmark = ref({
  title: '',
  url: '',
  groupId: props.selectedGroupId || 1
})

const editingBookmark = ref({
  id: 0,
  title: '',
  url: '',
  groupId: 1
})

const rules = {
  title: { required: true, message: '请输入书签名称', trigger: 'blur' },
  url: { required: true, message: '请输入书签地址', trigger: 'blur' },
  groupId: { 
    required: true, 
    type: 'number',
    message: '请选择分组', 
    trigger: ['blur', 'change'] 
  }
}

// 获取选中的分组信息
const selectedGroup = computed(() => {
  if (!props.selectedGroupId) return null
  return groupStore.getGroupById(props.selectedGroupId)
})

const selectedGroupName = computed(() => {
  return selectedGroup.value?.name || ''
})

// 获取选中分组的子分组
const selectedGroupChildren = computed(() => {
  if (!props.selectedGroupId) return []
  return groupStore.getChildGroups(props.selectedGroupId)
})

// 获取当前分组的书签
const currentGroupBookmarks = computed(() => {
  if (!props.selectedGroupId) return []
  return bookmarkStore.getBookmarksByGroup(props.selectedGroupId)
})

// 获取所有相关的书签（包括子分组的）
const allRelatedBookmarks = computed(() => {
  if (props.selectedGroupId) {
    // 如果选中了分组，显示该分组及其子分组的书签
    const groupIds = [props.selectedGroupId, ...selectedGroupChildren.value.map(g => g.id)]
    return bookmarkStore.getBookmarksByGroups(groupIds)
  } else {
    // 如果未选中分组，显示所有书签
    return bookmarkStore.getAllBookmarks()
  }
})

// 获取所有分组选项用于选择
const allGroupOptions = computed(() => {
  return groupStore.getGroupTree().map(group => buildGroupSelectOption(group))
})

const buildGroupSelectOption = (group: any) => {
  return {
    label: group.name,
    value: group.id,
    children: group.children && group.children.length > 0 
      ? group.children.map((child: any) => buildGroupSelectOption(child))
      : undefined
  }
}

// 搜索过滤后的书签
const filteredBookmarks = computed(() => {
  if (!searchQuery.value) return allRelatedBookmarks.value
  
  let bookmarksToSearch
  if (props.selectedGroupId) {
    // 如果选中了分组，在相关分组中搜索
    const groupIds = [props.selectedGroupId, ...selectedGroupChildren.value.map(g => g.id)]
    bookmarksToSearch = bookmarkStore.getBookmarksByGroups(groupIds)
  } else {
    // 如果未选中分组，在所有书签中搜索
    bookmarksToSearch = bookmarkStore.getAllBookmarks()
  }
  
  return bookmarksToSearch.filter(bookmark => {
    const query = searchQuery.value.toLowerCase()
    return bookmark.title.toLowerCase().includes(query) ||
           bookmark.url.toLowerCase().includes(query) ||
           bookmark.description.toLowerCase().includes(query)
  })
})

// 根据分组ID获取书签
const getBookmarksByGroup = (groupId: number) => {
  const bookmarks = bookmarkStore.getBookmarksByGroup(groupId)
  
  if (!searchQuery.value) return bookmarks
  
  const query = searchQuery.value.toLowerCase()
  return bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(query) ||
    bookmark.url.toLowerCase().includes(query)
  )
}

// 打开书签
const openBookmark = (url: string) => {
  if (!url) return
  
  // 确保URL格式正确
  let finalUrl = url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = 'https://' + url
  }
  
  // 在新窗口打开
  window.open(finalUrl, '_blank', 'noopener,noreferrer')
}

// 处理书签操作
const handleBookmarkAction = (action: string, bookmark: Bookmark) => {
  if (action === 'edit') {
    editingBookmark.value = {
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      groupId: bookmark.groupId
    }
    showEditModal.value = true
  } else if (action === 'delete') {
    if (confirm(`确定要删除书签"${bookmark.title}"吗？`)) {
      if (bookmarkStore.deleteBookmark(bookmark.id)) {
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    }
  }
}

// 添加书签
const handleAddBookmark = () => {
  console.log('提交前的新书签数据:', newBookmark.value)
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      const result = bookmarkStore.addBookmark({
        title: newBookmark.value.title,
        url: newBookmark.value.url,
        description: '',
        groupId: newBookmark.value.groupId
      })
      
      if (result) {
        message.success('书签添加成功')
        showAddModal.value = false
        newBookmark.value = { 
          title: '', 
          url: '',
          groupId: props.selectedGroupId || 1
        }
      } else {
        message.error('添加失败')
      }
    } else {
      console.log('验证错误:', errors)
    }
  })
}

// 编辑书签
const handleEditBookmark = () => {
  editFormRef.value?.validate((errors: any) => {
    if (!errors) {
      const result = bookmarkStore.updateBookmark(editingBookmark.value.id, {
        title: editingBookmark.value.title,
        url: editingBookmark.value.url,
        groupId: editingBookmark.value.groupId
      })
      
      if (result) {
        message.success('书签更新成功')
        showEditModal.value = false
      } else {
        message.error('更新失败')
      }
    }
  })
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑在computed中处理
}

// 监听选中分组变化，重置搜索和更新默认分组
watch(() => props.selectedGroupId, (newGroupId) => {
  searchQuery.value = ''
  if (newGroupId) {
    newBookmark.value.groupId = newGroupId
    console.log('更新新书签默认分组:', newGroupId)
  }
})

// 监听对话框打开状态，确保分组ID正确
watch(() => showAddModal.value, (isOpen) => {
  if (isOpen) {
    newBookmark.value.groupId = props.selectedGroupId || 1
    console.log('打开对话框时设置分组:', newBookmark.value.groupId)
  }
})
</script>

<style scoped>
.bookmark-display {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  margin-bottom: 16px;
}

.bookmark-content {
  flex: 1;
  overflow-y: auto;
}

.welcome-message,
.empty-bookmarks {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.group-section {
  margin-bottom: 24px;
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.bookmark-card {
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 6px;
  min-height: 48px;
}

.bookmark-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bookmark-card:hover .bookmark-title {
  color: white;
}

.bookmark-card:hover .bookmark-actions {
  opacity: 1;
}

.bookmark-title {
  font-weight: 500;
  font-size: 12px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
  transition: color 0.3s ease;
  letter-spacing: 0.3px;
}

.bookmark-url {
  font-size: 10px;
  color: #7f8c8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.bookmark-card:hover .bookmark-url {
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.8);
}

.bookmark-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bookmark-actions .n-button {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.bookmark-card:hover .bookmark-actions .n-button:hover {
  background: white;
  transform: scale(1.1);
}

.add-bookmark-card {
  border: 1px dashed #cbd5e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.add-bookmark-card:hover {
  border-color: #f6ad55;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.add-bookmark-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-bookmark-card:hover .add-bookmark-content {
  color: #2d3748;
  transform: scale(1.05);
}

.add-bookmark-content .n-icon {
  transition: transform 0.3s ease;
  font-size: 20px;
}

.add-bookmark-card:hover .add-bookmark-content .n-icon {
  transform: rotate(90deg);
}

/* 暗色主题适配 */
[data-theme="dark"] .bookmark-display {
  background: #1a202c;
}

[data-theme="dark"] .search-bar {
  /* 搜索框在暗色主题下的样式 */
}

[data-theme="dark"] .bookmark-card {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  border: 1px solid rgba(159, 122, 234, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .bookmark-card:hover {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  box-shadow: 0 12px 24px rgba(159, 122, 234, 0.3);
}

[data-theme="dark"] .bookmark-title {
  color: #e2e8f0;
}

[data-theme="dark"] .bookmark-url {
  color: #a0aec0;
}

[data-theme="dark"] .bookmark-card:hover .bookmark-title,
[data-theme="dark"] .bookmark-card:hover .bookmark-url {
  color: white;
}

[data-theme="dark"] .add-bookmark-card {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  border-color: #9f7aea;
}

[data-theme="dark"] .add-bookmark-card:hover {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  border-color: #ed8936;
}

[data-theme="dark"] .add-bookmark-content {
  color: #e2e8f0;
}

[data-theme="dark"] .group-section {
  /* 分组区域暗色主题样式 */
}

[data-theme="dark"] .bookmark-actions .n-button {
  background: rgba(45, 55, 72, 0.9);
  border: 1px solid rgba(159, 122, 234, 0.3);
}

[data-theme="dark"] .bookmark-actions .n-button:hover {
  background: rgba(159, 122, 234, 0.2);
  border-color: #9f7aea;
}
</style>
<template>
  <div class="group-tree">
    <div class="tree-header">
      <n-button size="small" type="primary" block @click="showAddModal = true">
        新建分组
      </n-button>
    </div>
    
    <n-tree
      :data="treeData"
      :render-label="renderLabel"
      :node-props="nodeProps"
      :default-expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      @update:selected-keys="handleSelect"
    />
    
    <!-- 添加分组对话框 -->
    <n-modal v-model:show="showAddModal" preset="dialog" title="新建分组" @close="resetAddForm">
      <template #default>
        <n-form ref="formRef" :model="newGroup" :rules="rules">
          <n-form-item label="分组名称" path="name">
            <n-input v-model:value="newGroup.name" placeholder="请输入分组名称" />
          </n-form-item>
          <n-form-item label="父分组" path="parentId">
            <n-tree-select
              v-model:value="newGroup.parentId"
              :options="parentGroupOptions"
              placeholder="选择父分组（可选）"
              clearable
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
          <n-button type="primary" @click="handleAddGroup">确定</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <!-- 编辑分组对话框 -->
    <n-modal v-model:show="showEditModal" preset="dialog" title="编辑分组">
      <template #default>
        <n-form ref="editFormRef" :model="editingGroup" :rules="rules">
          <n-form-item label="分组名称" path="name">
            <n-input v-model:value="editingGroup.name" placeholder="请输入分组名称" />
          </n-form-item>
        </n-form>
      </template>
      <template #action>
        <n-space>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditGroup">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useMessage, NButton, NDropdown, type TreeOption } from 'naive-ui'
import { useGroupStore, type Group } from '@/stores/groups'

const emit = defineEmits<{
  groupSelected: [groupId: number | null]
}>()

const message = useMessage()
const groupStore = useGroupStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const expandedKeys = ref<number[]>([]) // 默认不展开任何分组
const selectedKeys = ref<number[]>([])

const formRef = ref()
const editFormRef = ref()

const newGroup = ref({
  name: '',
  parentId: null as number | null
})

const editingGroup = ref({
  id: 0,
  name: ''
})

const rules = {
  name: { required: true, message: '请输入分组名称', trigger: 'blur' }
}

// 构建树形数据
const treeData = computed(() => {
  return groupStore.getGroupTree().map(group => buildTreeNode(group))
})

// 构建父分组选项（排除默认分组）
const parentGroupOptions = computed(() => {
  return buildTreeSelectOptions(groupStore.groups.filter(g => !g.isDefault))
})

const buildTreeNode = (group: Group): TreeOption => {
  return {
    key: group.id,
    label: group.name,
    children: group.children.map(child => buildTreeNode(child)),
    isDefault: group.isDefault
  }
}

const buildTreeSelectOptions = (groups: Group[]) => {
  return groups.map(group => ({
    label: group.name,
    value: group.id,
    children: group.children.length > 0 
      ? buildTreeSelectOptions(group.children) 
      : undefined
  }))
}

const renderLabel = ({ option }: { option: TreeOption }) => {
  const labelContent = [
    h('span', {
      style: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, option.label as string)
  ]
  
  if (!(option as any).isDefault) {
    labelContent.push(
      h(NDropdown, {
        trigger: 'click',
        options: [
          {
            label: '编辑',
            key: 'edit'
          },
          {
            label: '删除',
            key: 'delete'
          }
        ],
        onSelect: (key: string) => handleGroupAction(key, option.key as number)
      }, {
        default: () => h(NButton, {
          size: 'tiny',
          text: true,
          style: { 
            marginLeft: '8px',
            flexShrink: 0,
            minWidth: '20px',
            height: '20px',
            padding: '0'
          }
        }, { default: () => '⋯' })
      })
    )
  }
  
  return h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      gap: '8px'
    }
  }, labelContent)
}

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick: () => {
      if (!(option as any).isDefault) {
        selectedKeys.value = [option.key as number]
      }
    }
  }
}

const handleSelect = (keys: number[]) => {
  selectedKeys.value = keys
  const groupId = keys.length > 0 ? keys[0] : null
  emit('groupSelected', groupId)
}

const handleGroupAction = (action: string, groupId: number) => {
  const group = groupStore.getGroupById(groupId)
  if (!group) return
  
  if (action === 'edit') {
    editingGroup.value = {
      id: group.id,
      name: group.name
    }
    showEditModal.value = true
  } else if (action === 'delete') {
    if (group.children.length > 0) {
      message.error('不能删除包含子分组的分组')
      return
    }
    
    if (confirm(`确定要删除分组"${group.name}"吗？`)) {
      if (groupStore.deleteGroup(groupId)) {
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    }
  }
}

const handleAddGroup = () => {
  formRef.value?.validate((errors: any) => {
    if (!errors) {
      const parentId = newGroup.value.parentId
      const result = groupStore.addGroup(newGroup.value.name, parentId)
      if (result) {
        message.success('分组创建成功')
        showAddModal.value = false
        
        // 如果有父分组，展开父分组
        if (parentId) {
          expandedKeys.value.push(parentId)
        }
      } else {
        message.error('创建失败，可能是父分组选择错误')
      }
    }
  })
}

const handleEditGroup = () => {
  editFormRef.value?.validate((errors: any) => {
    if (!errors) {
      if (groupStore.updateGroup(editingGroup.value.id, editingGroup.value.name)) {
        message.success('分组更新成功')
        showEditModal.value = false
      } else {
        message.error('更新失败')
      }
    }
  })
}

const resetAddForm = () => {
  newGroup.value = { name: '', parentId: null }
  formRef.value?.restoreValidation()
}
</script>

<style scoped>
.group-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* padding: 4px; */
  overflow: hidden;
}

.tree-header {
  flex-shrink: 0;
  padding: 16px 12px 12px;
  margin-bottom: 12px;
}



:deep(.n-tree) {
  width: 100%;
  background: transparent;
  padding: 8px;
  flex: 1;
  overflow: hidden;
}

:deep(.n-tree-node-content) {
  width: 100%;
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

:deep(.n-tree-node-content:hover) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

:deep(.n-tree-node-content:hover) span {
  color: #2c3e50 !important;
}

:deep(.n-tree-node--selected > .n-tree-node-content) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #2c3e50 !important;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateX(6px);
}

:deep(.n-tree-node--selected > .n-tree-node-content) span {
  color: #2c3e50 !important;
  font-weight: 600 !important;
}

:deep(.n-tree-node-switcher) {
  color: #667eea !important;
  transition: transform 0.3s ease;
}

:deep(.n-tree-node--expanded > .n-tree-node-content > .n-tree-node-switcher) {
  transform: rotate(90deg);
}

:deep(.n-button--primary-type) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

:deep(.n-button--primary-type:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

:deep(.n-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

:deep(.n-dropdown-option) {
  border-radius: 6px;
  margin: 2px 4px;
  transition: all 0.2s ease;
}

:deep(.n-dropdown-option:hover) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateX(2px);
}

/* 暗色主题适配 */
:deep(.n-config-provider.dark) .group-tree {
  background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
}

:deep(.n-config-provider.dark) .tree-header {
  background: rgba(45, 55, 72, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}



:deep(.n-config-provider.dark) .n-tree-node-content:hover {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  box-shadow: 0 4px 12px rgba(159, 122, 234, 0.3);
}

:deep(.n-config-provider.dark) .n-tree-node-content:hover span,
:deep(.n-config-provider.dark) .n-tree-node--selected > .n-tree-node-content span {
  color: white !important;
}

:deep(.n-config-provider.dark) .n-tree-node--selected > .n-tree-node-content {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  color: white !important;
  box-shadow: 0 4px 16px rgba(159, 122, 234, 0.4);
}

:deep(.n-config-provider.dark) .n-tree-node--selected > .n-tree-node-content span {
  color: white !important;
  font-weight: 600 !important;
}

:deep(.n-config-provider.dark) .n-tree-node-switcher {
  color: #9f7aea !important;
}

:deep(.n-tree) .n-tree-node-switcher {
  margin-top: 7px;
}

:deep(.n-config-provider.dark) .n-button--primary-type {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  box-shadow: 0 4px 12px rgba(159, 122, 234, 0.4);
}

:deep(.n-config-provider.dark) .n-button--primary-type:hover {
  box-shadow: 0 8px 20px rgba(159, 122, 234, 0.5);
}

:deep(.n-config-provider.dark) .n-dropdown-menu {
  background: rgba(45, 55, 72, 0.95);
  border: 1px solid rgba(159, 122, 234, 0.3);
}

:deep(.n-config-provider.dark) .n-dropdown-option:hover {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
}

/* 使用[data-theme="dark"]的暗色主题样式 */
[data-theme="dark"] .n-tree-node-content:hover {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  box-shadow: 0 4px 12px rgba(159, 122, 234, 0.3);
}

[data-theme="dark"] .n-tree-node-content:hover span {
  color: white !important;
}

[data-theme="dark"] .n-tree-node--selected > .n-tree-node-content {
  background: linear-gradient(135deg, #9f7aea 0%, #ed8936 100%);
  color: white !important;
  box-shadow: 0 4px 16px rgba(159, 122, 234, 0.4);
}

[data-theme="dark"] .n-tree-node--selected > .n-tree-node-content span {
  color: white !important;
  font-weight: 600 !important;
}
</style>
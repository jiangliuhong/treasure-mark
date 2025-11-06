import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Group {
  id: number
  name: string
  parentId: number | null
  children: Group[]
  isDefault?: boolean
}

export const useGroupStore = defineStore('groups', () => {
  const groups = ref<Group[]>([
    {
      id: 1,
      name: '默认分组',
      parentId: null,
      children: [],
      isDefault: true
    }
  ])
  
  const nextId = ref(2)
  
  const loadGroups = () => {
    const saved = localStorage.getItem('treasure-mark-groups')
    if (saved) {
      groups.value = JSON.parse(saved)
      // 确保默认分组存在
      if (!groups.value.some(g => g.isDefault)) {
        groups.value.unshift({
          id: 1,
          name: '默认分组',
          parentId: null,
          children: [],
          isDefault: true
        })
      }
    }
    
    // 计算下一个ID
    const maxId = Math.max(...groups.value.map(g => g.id))
    nextId.value = maxId + 1
  }
  
  const saveGroups = () => {
    localStorage.setItem('treasure-mark-groups', JSON.stringify(groups.value))
  }
  
  const addGroup = (name: string, parentId: number | null = null): Group | null => {
    // 检查父分组是否为默认分组
    if (parentId === 1) {
      console.error('不能在默认分组下创建子分组')
      return null
    }
    
    // 检查父分组是否存在
    if (parentId && !groups.value.find(g => g.id === parentId)) {
      console.error('父分组不存在')
      return null
    }
    
    const newGroup: Group = {
      id: nextId.value++,
      name,
      parentId,
      children: []
    }
    
    groups.value.push(newGroup)
    
    // 如果有父分组，更新父分组的children
    if (parentId) {
      const parentGroup = groups.value.find(g => g.id === parentId)
      if (parentGroup) {
        parentGroup.children.push(newGroup)
      }
    }
    
    saveGroups()
    return newGroup
  }
  
  const updateGroup = (id: number, name: string) => {
    const group = groups.value.find(g => g.id === id)
    if (group && !group.isDefault) {
      group.name = name
      saveGroups()
      return true
    }
    return false
  }
  
  const deleteGroup = (id: number) => {
    const groupIndex = groups.value.findIndex(g => g.id === id)
    if (groupIndex === -1) return false
    
    const group = groups.value[groupIndex]
    
    // 不能删除默认分组
    if (group.isDefault) {
      console.error('不能删除默认分组')
      return false
    }
    
    // 检查是否有子分组
    if (group.children.length > 0) {
      console.error('不能删除包含子分组的分组')
      return false
    }
    
    // 从父分组的children中移除
    if (group.parentId) {
      const parentGroup = groups.value.find(g => g.id === group.parentId)
      if (parentGroup) {
        const childIndex = parentGroup.children.findIndex(c => c.id === id)
        if (childIndex > -1) {
          parentGroup.children.splice(childIndex, 1)
        }
      }
    }
    
    groups.value.splice(groupIndex, 1)
    saveGroups()
    return true
  }
  
  const getGroupById = (id: number): Group | undefined => {
    return groups.value.find(g => g.id === id)
  }
  
  const getRootGroups = () => {
    return groups.value.filter(g => g.parentId === null)
  }
  
  const getChildGroups = (parentId: number) => {
    return groups.value.filter(g => g.parentId === parentId)
  }
  
  const getGroupTree = () => {
    return buildTree(groups.value.filter(g => g.parentId === null))
  }
  
  const buildTree = (rootGroups: Group[]): Group[] => {
    return rootGroups.map(group => {
      const children = groups.value.filter(g => g.parentId === group.id)
      return {
        ...group,
        children: buildTree(children)
      }
    })
  }
  
  // 初始化时加载数据
  loadGroups()
  
  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    getRootGroups,
    getChildGroups,
    getGroupTree,
    loadGroups,
    saveGroups
  }
})
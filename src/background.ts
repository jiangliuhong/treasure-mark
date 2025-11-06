// Chrome extension background script

chrome.runtime.onInstalled.addListener(() => {
  console.log('藏宝书签插件已安装')
})

// 右键菜单添加书签
chrome.contextMenus.create({
  id: 'addBookmark',
  title: '添加到藏宝书签',
  contexts: ['page']
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addBookmark' && tab?.url && tab?.title) {
    chrome.storage.local.get(['treasure-mark-bookmarks'], (result) => {
      const bookmarks = result['treasure-mark-bookmarks'] || []
      const newBookmark = {
        id: Date.now(),
        title: tab.title,
        url: tab.url,
        category: '未分类',
        description: '',
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      bookmarks.unshift(newBookmark)
      chrome.storage.local.set({ 'treasure-mark-bookmarks': bookmarks })
      
      // 显示通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '藏宝书签',
        message: '书签添加成功'
      })
    })
  }
})

// 快捷键支持
chrome.commands.onCommand.addListener((command) => {
  if (command === 'add-bookmark') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (tab?.url && tab?.title) {
        chrome.storage.local.get(['treasure-mark-bookmarks'], (result) => {
          const bookmarks = result['treasure-mark-bookmarks'] || []
          const newBookmark = {
            id: Date.now(),
            title: tab.title,
            url: tab.url,
            category: '未分类',
            description: '',
            createdAt: new Date().toISOString().split('T')[0]
          }
          
          bookmarks.unshift(newBookmark)
          chrome.storage.local.set({ 'treasure-mark-bookmarks': bookmarks })
        })
      }
    })
  }
})
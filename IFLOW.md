# Treasure Mark (藏宝书签) 项目概览

## 项目描述

Treasure Mark（藏宝书签）是一个现代化的书签管理程序，支持多平台使用：
- **Web应用**: 基于Vue 3的响应式Web应用
- **桌面应用**: 使用Tauri 2构建的跨平台桌面应用
- **Chrome插件**: 功能完整的浏览器扩展程序

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Naive UI
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **桌面应用**: Tauri 2
- **Chrome插件**: vite-plugin-crx + Manifest V3

## 项目结构

```
C:\Workspace\localproject\treasure-mark\
├── src/                      # Web应用源代码
│   ├── components/           # Vue组件
│   ├── views/               # 页面视图
│   │   ├── HomeView.vue     # 首页
│   │   ├── BookmarksView.vue # 书签管理页
│   │   ├── PopupApp.vue     # Chrome插件弹窗
│   │   └── OptionsApp.vue   # Chrome插件设置页
│   ├── stores/              # Pinia状态管理
│   │   └── bookmarks.ts     # 书签数据管理
│   ├── router/              # 路由配置
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   ├── popup.html           # Chrome插件弹窗HTML
│   ├── options.html         # Chrome插件设置HTML
│   ├── background.ts        # Chrome插件后台脚本
│   └── manifest.json        # Chrome插件配置
├── src-tauri/               # Tauri桌面应用配置
│   ├── src/                 # Rust源代码
│   ├── Cargo.toml           # Rust依赖配置
│   └── tauri.conf.json      # Tauri应用配置
├── dist/                    # Web应用构建输出
├── crx-dist/                # Chrome插件构建输出
├── package.json             # 项目依赖配置
├── vite.config.ts           # Vite Web应用配置
├── vite.config.chrome.ts    # Vite Chrome插件配置
├── tsconfig.json            # TypeScript配置
└── IFLOW.md                 # 项目说明文档（本文件）
```

## 核心功能

### 书签管理
- ✅ 添加、编辑、删除书签
- ✅ 书签分类管理
- ✅ 书签搜索功能
- ✅ 本地数据持久化
- ✅ 数据导入导出

### 多平台特性
- **Web应用**: 完整的书签管理界面
- **桌面应用**: 使用Tauri 2构建的跨平台应用
- **Chrome插件**: 
  - 弹窗快速添加/查看书签
  - 右键菜单添加书签
  - 后台脚本支持
  - 完整设置页面

## 开发环境

- 操作系统: Windows (win32)
- Node.js: 推荐使用 v18+
- Rust: Tauri桌面应用开发需要
- 工作目录: `C:\Workspace\localproject\treasure-mark`
- Git 仓库: 否

## 开发命令

### Web应用开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### 桌面应用开发
```bash
# 启动Tauri开发环境
npm run tauri dev

# 构建桌面应用
npm run tauri build
```

### Chrome插件开发
```bash
# 开发Chrome插件
npm run dev:crx

# 构建Chrome插件
npm run build:crx
```

## 开发约定

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint 进行代码质量检查
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### 状态管理
- 使用 Pinia 进行状态管理
- 数据持久化使用 localStorage (Web) / Chrome Storage API (插件)
- 书签数据结构统一管理

### UI/UX 规范
- 使用 Naive UI 组件库保持界面一致性
- 支持明暗主题切换
- 响应式设计适配不同屏幕尺寸

## 部署说明

### Web应用部署
1. 运行 `npm run build` 构建Web应用
2. 将 `dist` 目录部署到Web服务器

### 桌面应用分发
1. 运行 `npm run tauri build` 构建桌面应用
2. 在 `src-tauri/target/release/bundle/` 中找到安装包

### Chrome插件发布
1. 运行 `npm run build:crx` 构建插件
2. 将 `crx-dist` 目录打包为ZIP文件
3. 上传到Chrome Web Store开发者控制台

## 下一步开发计划

- [ ] 书签标签系统
- [ ] 书签收藏夹功能
- [ ] 书签导入浏览器书签
- [ ] 云同步功能
- [ ] 书签分享功能
- [ ] 高级搜索和过滤
- [ ] 书签使用统计
- [ ] 快捷键支持增强
- [ ] 主题自定义
- [ ] 多语言支持

## 注意事项

- 本文件将作为 iFlow CLI 的上下文参考
- 项目开发过程中请及时更新此文件以反映最新的项目状态
- Chrome插件需要在Chrome浏览器中手动加载开发者模式进行测试
- Tauri桌面应用开发需要安装Rust环境
- 建议定期备份重要文件和数据

---
*此文件由 iFlow CLI 更新于 2025年11月6日*
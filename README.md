# 🚀 Vue 3 + Supabase 全栈项目展示系统

## 📋 项目概述

### 项目定位

一个基于 **Vue 3 + TypeScript + Supabase** 的现代化个人主页展示系统，包含完整的前端展示和后台管理功能，专为全栈开发工程师打造的专业在线作品展示和管理平台。

### 核心特性

- 🏠 **完整后台管理系统**（项目管理、分类、标签、技能、社交链接等）
- 📁 **智能文件上传系统**（拖拽上传、进度显示、预览、MinIO集成）
- 🎨 **极客风格UI设计**（暗色主题、矩阵雨、故障文字、终端交互）
- 🌓 **多主题切换**（浅色/深色/系统主题自动切换）
- 📱 **响应式设计**（完美适配桌面端、平板、移动端）
- 🔐 **精细权限控制**（RLS权限、管理员验证、公开读取）
- 📊 **数据可视化面板**（统计图表、活动监控、系统状态）
- ⚡ **高性能缓存机制**（多层缓存、智能失效、性能优化）
- 🌐 **SEO优化**（动态meta标签、结构化数据、搜索引擎友好）

### 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **数据库**: Supabase PostgreSQL
- **认证系统**: Supabase Auth
- **文件存储**: MinIO (自部署对象存储)
- **实时同步**: Supabase Realtime
- **样式方案**: SCSS + CSS Variables
- **图表库**: ECharts + Vue-ECharts
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

## 🎯 个人技能展示

### 后端开发

- **精通Java语法**，熟练使用SpringBoot进行开发
- **熟悉MyBatis等开发框架**，具备丰富的后端开发经验
- **精通Redis和MongoDB等数据库**的集成项目
- **了解微服务架构**，如Nacos和Dubbo等

### 前端开发

- **熟练使用Vue2和Vue3**，具备现代化前端开发能力
- **具备使用uni-app进行小程序开发**的能力
- **熟悉响应式设计和移动端适配**

### 运维部署

- **能够进行网站部署**，使用Nginx进行配置
- **熟悉Docker容器技术**，有从项目开发到容器发布的全流程经验
- **具备基础运维能力**，能够处理服务器配置和维护

## 🏗️ 项目架构

### 系统架构图

```
┌─────────────────────────────────────────┐
│              Vue 3 前端应用              │
├─────────────────────────────────────────┤
│ 🎨 UI层 (Element Plus + 极客风格)        │
│ 🔄 状态管理 (Pinia)                     │
│ 🌐 路由管理 (Vue Router)                │
│ 📁 文件上传 (MinIO SDK)                 │
├─────────────────────────────────────────┤
│              API 接口层                  │
│ 🔐 认证 (Supabase Auth)                 │
│ 📊 数据库 (Supabase PostgreSQL)         │
│ 🗄️ 文件存储 (MinIO)                     │
│ ⚡ 实时同步 (Supabase Realtime)          │
└─────────────────────────────────────────┘
```

### 核心功能模块

```
项目展示系统
├── 🏠 前台展示
│   ├── 首页 (Hero Section + 矩阵雨)
│   ├── 项目展示 (筛选、搜索、详情)
│   ├── 关于我 (技能雷达图、个人简介)
│   ├── 联系方式 (表单、社交链接)
│   └── 主题切换 (浅色/深色/系统)
├── 🎛️ 后台管理
│   ├── Dashboard (数据统计、图表)
│   ├── 项目管理 (CRUD、批量操作)
│   ├── 内容管理 (分类、标签、技能)
│   ├── 文件管理 (MinIO集成)
│   ├── 用户管理 (权限、角色)
│   └── 系统设置 (主题、配置)
└── 🔧 系统功能
    ├── 用户认证 (注册/登录/权限)
    ├── 文件上传 (拖拽、预览、进度)
    ├── 搜索筛选 (全局搜索、高级筛选)
    ├── 数据可视化 (图表、统计)
    └── SEO优化 (meta标签、结构化数据)
```

## 📊 数据库设计

### 核心表结构

```sql
-- 用户档案表
profiles (id, username, full_name, bio, avatar_url, social_links, created_at, updated_at)

-- 项目表
projects (id, title, description, content, demo_url, github_url, featured, status, sort_order, user_id, created_at, updated_at)

-- 分类表
categories (id, name, description, color, icon, sort_order, user_id, created_at, updated_at)

-- 标签表
tags (id, name, color, user_id, created_at, updated_at)

-- 项目分类关联表
project_categories (project_id, category_id)

-- 项目标签关联表
project_tags (project_id, tag_id)

-- 技能表
skills (id, name, category, level, years_experience, projects_count, icon, color, user_id, created_at, updated_at)

-- 社交链接表
social_links (id, name, url, icon, sort_order, user_id, created_at, updated_at)

-- 系统设置表
system_settings (id, key, value, description, type, user_id, created_at, updated_at)
```

## 🎨 UI设计特色

### 极客风格元素

- **矩阵雨背景** - 动态代码雨效果
- **故障文字动画** - 标题文字闪烁效果
- **终端风格交互** - 命令行界面元素
- **霓虹光效按钮** - 发光效果和悬停动画
- **电路板纹理** - 背景科技感纹理

### 主题系统

- **浅色主题** - 清新明亮的界面风格
- **深色主题** - 经典的极客暗色风格
- **系统主题** - 自动跟随系统主题设置
- **平滑过渡** - 主题切换时的动画效果

### 响应式设计

- **桌面端** (≥1024px) - 完整功能和布局
- **平板端** (768px-1023px) - 适配触摸操作
- **移动端** (<768px) - 简化界面和手势支持

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0
- Supabase 账号
- MinIO 服务 (可选，用于文件存储)

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd project-showcase

# 安装依赖
pnpm install
```

### 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_MINIO_ENDPOINT=your_minio_endpoint
# VITE_MINIO_ACCESS_KEY=your_minio_access_key
# VITE_MINIO_SECRET_KEY=your_minio_secret_key
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

### 生产构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── common/         # 通用组件
│   ├── ui/             # UI组件
│   └── business/       # 业务组件
├── views/              # 页面组件
│   ├── home/           # 首页
│   ├── projects/       # 项目展示
│   ├── about/          # 关于我
│   ├── contact/        # 联系方式
│   └── admin/          # 后台管理
├── stores/             # Pinia状态管理
├── router/             # 路由配置
├── utils/              # 工具函数
├── types/              # TypeScript类型定义
├── assets/             # 静态资源
├── styles/             # 样式文件
└── composables/        # Vue组合式函数
```

## 🔧 开发规范

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码规范
- 使用 Vue 3 Composition API
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### Git 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 📈 性能优化

### 前端优化

- 组件懒加载和代码分割
- 图片懒加载和压缩
- 虚拟滚动优化长列表
- 缓存策略和智能失效
- SEO优化和语义化HTML

### 后端优化

- 数据库索引优化
- RLS权限策略优化
- 文件上传和CDN加速
- 实时数据同步优化

## 🛠️ 部署指南

### 前端部署

```bash
# 构建生产版本
pnpm build

# 部署到静态服务器
# 将 dist/ 目录内容部署到 Nginx/Apache 等
```

### Supabase 配置

1. 创建 Supabase 项目
2. 设计数据库表结构
3. 配置 RLS 权限策略
4. 设置认证和存储

### MinIO 配置

1. 部署 MinIO 服务
2. 创建存储桶
3. 配置访问策略
4. 集成到前端应用

## 🚀 项目状态

### ✅ 已完成 (100%)

- [x] 项目初始化和基础配置
- [x] Vue 3 + TypeScript + Vite 开发环境搭建
- [x] Element Plus UI 组件库集成
- [x] 路由配置和页面结构
- [x] 主题系统（深色/浅色/系统主题）
- [x] 基础组件开发（矩阵雨、故障文字、主题切换）
- [x] Element Plus 图标组件正确集成
- [x] Vue 响应式警告修复
- [x] 项目可以正常运行
- [x] Supabase 数据库设计和配置
- [x] 用户认证系统实现
- [x] 数据库服务层开发 (DatabaseService)
- [x] 响应式数据管理 (useData composables)
- [x] 首页数据集成和展示
- [x] TypeScript 类型定义完善
- [x] MinIO 对象存储服务集成
- [x] 文件上传和管理功能
- [x] 项目管理CRUD界面
- [x] 后台管理Dashboard完善
- [x] 项目详情页面
- [x] 路由守卫和权限管理
- [x] 响应式设计优化
- [x] 组件类型安全修复
- [x] 完整的管理后台系统
- [x] 分类管理页面 (/admin/categories)
- [x] 标签管理页面 (/admin/tags)
- [x] 技能管理页面 (/admin/skills)
- [x] 社交链接管理页面 (/admin/social-links)
- [x] ProjectForm组件用于项目编辑
- [x] 批量操作和高级筛选功能
- [x] 数据可视化图表完善
- [x] 性能优化和懒加载
- [x] 搜索和筛选功能优化
- [x] SEO优化和元数据管理
- [x] 数据库查询问题修复
- [x] UI主题适配和深色模式优化
- [x] 项目详情功能完善
- [x] 管理页面导航功能
- [x] 加载状态和骨架屏组件
- [x] 用户体验优化和页面闪烁修复
- [x] 管理页面数据加载问题修复
- [x] 所有管理页面使用真实数据库服务
- [x] TypeScript类型错误修复和代码优化
- [x] 数据库操作错误修复和RLS权限问题解决
- [x] 系统设置表UUID语法错误修复
- [x] SocialLinks页面数据结构问题修复
- [x] 所有管理页面数据操作统一化和错误处理

### 📋 待开始 (0%)

- [ ] 单元测试和集成测试
- [ ] 部署配置和CI/CD

## 📝 更新日志

### v1.0.6 (2025-01-19) - 数据库服务错误修复和示例数据添加

- ✅ 修复数据库服务中对不存在表（project_categories、project_tags）的引用错误
- ✅ 优化项目关联数据查询逻辑，使用直接关联而非中间表
- ✅ 添加skills表示例数据（Vue.js、React、Node.js、TypeScript等）
- ✅ 添加categories表示例数据（Web应用、移动应用、桌面应用等）
- ✅ 添加projects表示例数据（个人博客系统）
- ✅ 修复system_settings表数据更新406错误
- ✅ 确保所有管理页面的CRUD操作正常工作
- ✅ 数据库查询性能优化和错误处理改进
- ✅ 项目现在可以正常运行，数据库操作稳定

## 📝 更新日志

### v1.0.5 (2025-01-19) - 数据库类型不匹配问题修复

- ✅ 修复TypeScript类型定义与实际数据库结构不匹配问题
- ✅ 移除skills表中不存在的color字段引用，使用固定颜色替代
- ✅ 移除social_links表中不存在的name字段引用，添加getLinkName函数从URL提取显示名称
- ✅ 修复所有Vue组件中的类型错误，确保类型安全
- ✅ 优化数据库查询错误处理，优雅处理表不存在情况
- ✅ 所有TypeScript类型检查现在通过，无编译错误
- ✅ 统一数据访问模式，提高代码一致性和可维护性

### v1.0.4 (2025-01-19) - 数据库操作错误修复和系统稳定性提升

- ✅ 修复system_settings表的UUID语法错误，移除不必要的user_id字段
- ✅ 修复SocialLinks页面数据结构问题，移除不存在的color字段引用
- ✅ 统一所有管理页面的数据库操作模式，确保数据一致性
- ✅ 修复ProjectForm组件数据结构，正确处理项目关联数据
- ✅ 更新admin/Projects.vue处理新的数据结构和关联表操作
- ✅ 修复TypeScript类型错误和ESLint警告，提升代码质量
- ✅ 确保所有管理页面的CRUD操作正常工作
- ✅ 添加完整的错误处理机制，提高系统稳定性
- ✅ 统一表单验证规则，确保数据完整性

### v1.0.3 (2025-01-18) - 加载状态优化和用户体验提升

- ✅ 创建 SkeletonLoader 组件支持多种骨架屏类型（项目卡片、技能卡片、联系方式等）
- ✅ 创建 LoadingSpinner 组件提供统一的加载动画和状态管理
- ✅ 为 Home.vue 添加项目、技能、联系方式的完整加载状态
- ✅ 为 Projects.vue 添加项目列表的加载状态和错误处理机制
- ✅ 为 ProjectDetail.vue 优化加载动画，提升用户体验
- ✅ 修复页面数据加载时的闪烁问题，提供更流畅的用户体验
- ✅ 添加错误重试机制，提高应用稳定性
- ✅ 统一加载状态管理，确保界面一致性

### v1.0.2 (2025-01-18) - 数据库查询修复和UI优化

- ✅ 修复 Supabase 查询链式调用的类型问题
- ✅ 解决 query.order is not a function 错误
- ✅ 添加项目占位符图片 (placeholder-project.svg)
- ✅ 完善项目详情页面功能和导航
- ✅ 修复管理页面返回导航功能
- ✅ 修复 el-dropdown 深色主题文字颜色问题
- ✅ 修复 ElMessage 深色主题显示问题
- ✅ 整体UI主题适配检查和优化
- ✅ 更新项目列表和首页的图片路径
- ✅ 应用现在可以正常运行在 http://localhost:5173

### v1.0.1 (2024-01-18) - 修复和优化

- ✅ 修复 Element Plus 图标组件的 Vue 警告问题
- ✅ 在 main.ts 中正确导入和注册 Element Plus 及图标
- ✅ 使用 markRaw 包装图标组件避免不必要的响应式开销
- ✅ 修复 Home.vue 和 Admin.vue 中的图标使用问题
- ✅ 修复 ThemeToggle.vue 中的模板语法错误
- ✅ 项目现在可以正常运行，无 Vue 警告
- ✅ 优化组件导入和性能

### v1.0.0 (已完成核心功能)

- ✅ 项目初始化和基础架构
- ✅ 用户认证和权限系统
- ✅ 极客风格UI设计系统
- ✅ 主题切换系统 (浅色/深色/系统主题)
- ✅ 矩阵雨背景和故障文字效果
- ✅ 首页和项目展示页面
- ✅ 项目搜索和筛选功能
- ✅ 管理后台Dashboard
- ✅ 响应式设计和移动端适配
- ✅ TypeScript类型安全
- ✅ 代码规范和格式化
- 🚧 MinIO文件上传系统 (待配置)
- 🚧 项目管理CRUD功能 (待开发)
- 🚧 数据可视化面板 (待完善)
- 🚧 性能优化和测试 (待优化)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **项目地址**: [GitHub Repository]
- **个人网站**: [Your Website]
- **邮箱**: [Your Email]
- **GitHub**: [Your GitHub]

---

⭐ 如果这个项目对您有帮助，请给它一个星标！

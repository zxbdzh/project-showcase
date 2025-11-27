INSERT INTO "public"."projects" ("id", "title", "description", "content", "cover_image", "demo_url", "github_url", "tech_stack", "category_id", "featured", "status", "sort_order", "view_count", "created_at", "updated_at", "user_id") VALUES ('03461a0e-d463-4b07-bc7f-100b4f7817bf', '个人项目展示', '一个基于 Vue 3 + TypeScript + Supabase 的现代化个人作品展示和管理平台。', '# 🚀 Vue 3 + Supabase 全栈项目展示系统

## 📋 项目概述

### 项目定位

一个基于 **Vue 3 + TypeScript + Supabase** 的现代化个人主页展示系统，包含完整的前端展示和后台管理功能，专为全栈开发工程师打造的专业在线作品展示和管理平台。

### 项目图片

![](https://minio.zxbdwy.online:443/picgo/19-32-11.png)
![](https://minio.zxbdwy.online:443/picgo/19-29-35.png)
![](https://minio.zxbdwy.online:443/picgo/19-31-16.png)
![](https://minio.zxbdwy.online:443/picgo/19-31-23.png)
![](https://minio.zxbdwy.online:443/picgo/19-31-30.png)
![](https://minio.zxbdwy.online:443/picgo/19-31-37.png)
![](https://minio.zxbdwy.online:443/picgo/19-31-51.png)

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
- 📝 **Markdown支持**（项目详情页完整markdown渲染和样式）
- 🦶 **动态页脚系统**（可配置页脚样式、链接管理、实时预览）

### 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **数据库**: Supabase PostgreSQL
- **认证系统**: Supabase Auth
- **文件存储**: MinIO (自部署对象存储)
- **缓存系统**: Supabase数据库缓存 + 本地缓存双重策略 (无Redis依赖，完全集成)
- **实时同步**: Supabase Realtime
- **样式方案**: SCSS + CSS Variables
- **图表库**: ECharts + Vue-ECharts
- **Markdown渲染**: markdown-it
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
│ 📝 Markdown渲染 (markdown-it)             │
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
│   ├── 项目展示 (筛选、搜索、详情、Markdown)
│   ├── 关于我 (技能雷达图、个人简介)
│   ├── 联系方式 (表单、社交链接)
│   └── 主题切换 (浅色/深色/系统)
├── 🎛️ 后台管理
│   ├── Dashboard (数据统计、图表)
│   ├── 项目管理 (CRUD、批量操作、Markdown编辑)
│   ├── 内容管理 (分类、标签、技能)
│   ├── 文件管理 (MinIO集成)
│   ├── 用户管理 (权限、角色、密码更新)
│   └── 系统设置 (主题、配置)
└── 🔧 系统功能
    ├── 用户认证 (注册/登录/权限/密码管理)
    ├── 文件上传 (拖拽、预览、进度)
    ├── 搜索筛选 (全局搜索、高级筛选)
    ├── 数据可视化 (图表、统计)
    ├── Markdown渲染 (代码高亮、表格、引用)
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
system_settings (id, key, value, description, type, created_at, updated_at)
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

### Markdown渲染

- **代码高亮** - 支持多种编程语言语法高亮
- **表格样式** - 美观的表格展示和悬停效果
- **引用样式** - 优雅的引用块设计
- **链接样式** - 带下划线动画的链接效果
- **响应式设计** - 移动端友好的markdown展示

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
- **Redis多层缓存系统**（智能降级、路由级策略）
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
4. 集成到前端应用', 'https://minio.zxbdwy.online/project-showcase/covers/1763897393141-l74xle.png', 'https://project.zxbdwy.online/', 'https://github.com/zxbdzh/project-showcase', null, '14e7dc0b-6aa1-4b5a-80f2-11cd273e485c', 'true', 'published', '0', '0', '2025-11-23 11:33:18.635299+00', '2025-11-24 05:45:44.206225+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('1a161e13-bdcc-4e7c-be97-dcb3d2800e02', 'AI代码生成器', '一个基于Vue 3 + TypeScript + Vite的智能代码生成工具，专门用于生成HTML5游戏。支持多种AI模型，提供丰富的游戏预设和自定义配置选项。
', '# AI代码生成器

一个基于Vue 3 + TypeScript + Vite的智能代码生成工具，专门用于生成HTML5游戏。支持多种AI模型，提供丰富的游戏预设和自定义配置选项。

## ✨ 特性

- 🎮 **多种游戏预设** - 内置贪吃蛇、2048、俄罗斯方块、Flappy Bird等经典游戏模板
- 🤖 **多AI模型支持** - 支持OpenAI GPT和Deepseek等多种AI服务
- ⚙️ **灵活配置** - 每个游戏预设都有可自定义的配置选项
- 🎨 **主题切换** - 支持亮色/暗色主题切换
- 📱 **响应式设计** - 适配桌面和移动设备
- ⚡ **实时预览** - 生成代码后可立即预览效果
- 💾 **代码下载** - 支持将生成的HTML游戏下载到本地
- 🌈 **语法高亮** - 代码显示支持语法高亮
- 🎯 **打字动画** - 代码生成过程带有流畅的打字动画效果

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式预处理**: SCSS
- **HTTP客户端**: Axios
- **代码高亮**: Highlight.js
- **文件下载**: File-saver
- **工具库**: @vueuse/core

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖

```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或使用npm
npm run dev
```

### 构建生产版本

```bash
# 构建生产版本
pnpm build

# 或使用npm
npm run build
```

### 预览生产版本

```bash
# 预览构建结果
pnpm preview

# 或使用npm
npm run preview
```

## 📖 使用指南

### 1. 配置AI服务

1. 在"大模型配置"面板中选择AI模型（OpenAI或Deepseek）
2. 输入对应的API密钥
3. API密钥会自动保存到本地存储中

### 2. 选择游戏类型

- 从预设的游戏类型中选择一个（贪吃蛇、2048、俄罗斯方块、Flappy Bird）
- 或选择"自定义游戏"来创建自己的游戏

### 3. 自定义配置

根据选择的游戏类型，可以配置以下选项：
- 控制方式（方向键、WASD等）
- 游戏难度参数
- 网格大小
- 得分规则等

### 4. 生成代码

点击"生成代码"按钮，AI将根据您的配置生成完整的HTML5游戏代码。

### 5. 预览和下载

- 生成完成后可以实时预览游戏效果
- 点击"下载HTML"按钮将游戏保存到本地

## 🎯 支持的游戏类型

### 🐍 贪吃蛇
- 经典的贪吃蛇游戏
- 可配置控制方式和增长长度
- 支持方向键和WASD控制

### 🔢 2048
- 数字合成益智游戏
- 可配置网格大小（3x3、4x4、5x5）
- 可自定义新方块生成规则

### 🧱 俄罗斯方块
- 经典的俄罗斯方块游戏
- 可配置控制方式和得分规则
- 支持多种方块形状

### 🐦 Flappy Bird
- 飞行躲避游戏
- 可配置控制方式和飞行速度
- 支持多种难度级别

### 🎯 自定义游戏
- 完全自定义的游戏类型
- 自由描述游戏规则和玩法
- AI根据描述生成对应游戏

## 🔧 项目结构

```
src/
├── components/          # Vue组件
│   ├── CodeGenerator.vue    # 主要的代码生成组件
│   └── ThemeSwitcher.vue    # 主题切换组件
├── composables/         # Vue组合式函数
│   ├── useClickEffect.ts    # 点击效果
│   └── useTheme.ts          # 主题管理
├── data/               # 数据文件
│   └── gamePresets.ts       # 游戏预设配置
├── services/           # 服务层
│   ├── aiService.ts         # AI服务基类和工厂
│   ├── deepseekService.ts   # Deepseek AI服务
│   └── openaiService.ts     # OpenAI服务
├── types/              # TypeScript类型定义
│   └── index.ts             # 主要类型定义
├── App.vue             # 根组件
├── main.ts             # 应用入口
└── style.css           # 全局样式
```

## 🔌 API配置

### OpenAI配置
```typescript
{
  type: ''openai'',
  name: ''OpenAI'',
  baseURL: ''https://api.openai.com/v1'',
  defaultModel: ''gpt-3.5-turbo''
}
```

### Deepseek配置
```typescript
{
  type: ''deepseek'',
  name: ''Deepseek'',
  baseURL: ''https://api.deepseek.com/v1'',
  defaultModel: ''deepseek-chat''
}
```

## 🎨 主题系统

项目支持亮色和暗色两种主题：

- **亮色主题**: 清爽的白色背景，适合白天使用
- **暗色主题**: 护眼的深色背景，适合夜间使用

主题切换会自动保存到本地存储，下次访问时会记住您的选择。

## 🌟 核心功能

### AI代码生成
- 支持流式输出，实时显示生成进度
- 智能的代码格式化和优化
- 支持自定义提示词和参数替换

### 代码预览
- 内置iframe预览窗口
- 实时渲染生成的HTML游戏
- 支持全屏预览模式

### 代码管理
- 语法高亮显示
- 支持代码折叠和展开
- 一键下载生成的HTML文件

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程
1. Fork本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m ''Add some amazing feature''`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 代码规范
- 使用TypeScript进行类型检查
- 遵循Vue 3 Composition API最佳实践
- 使用SCSS编写样式
- 保持代码简洁和可读性

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [Highlight.js](https://highlightjs.org/) - 语法高亮库
- [@vueuse/core](https://vueuse.org/) - Vue组合式函数工具集

## 📞 联系方式

如果您有任何问题或建议，欢迎通过以下方式联系：

- 提交Issue: [GitHub Issues](https://github.com/your-username/ai-code/issues)
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
', 'https://minio.zxbdwy.online/project-showcase/covers/1763967812545-xmdy22.png', 'https://x6kmueeah-aicode-38x4d0ke.maozi.io/', 'https://github.com/zxbdzh/ai_code', null, '14e7dc0b-6aa1-4b5a-80f2-11cd273e485c', 'false', 'published', '0', '0', '2025-11-24 07:04:28.652862+00', '2025-11-24 07:05:16.065134+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('216ee828-bd38-4ee4-b99a-5724262edb29', 'webstack-vue', '使用vue3 + vite 构建的webstack项目', '# webstack-vue

使用vue3 + vite 构建的webstack项目，原项目：https://github.com/WebStackPage/WebStackPage.github.io

## 📖 介绍

根据原项目制作的网页导航，特点如下：
- 🌟 现代化界面：基于 Vue 3 + Element Plus 构建的现代化UI
- 📱 响应式设计：完美适配桌面端和移动端
- 🔖 书签管理：支持浏览器书签导入导出功能
- 📂 分类系统：书签进行分类管理，支持多级分类
- 🛠️ 后台系统：完整的管理员后台，支持标签、分类、用户管理
- 👥 用户系统：用户登录注册功能（持续完善中）
- 🎨 主题切换：支持暗黑模式和亮色模式切换
- 📖 用户引导：新用户首次使用引导功能

## 🚀 技术栈

### 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **Vue Router 4** - 官方路由管理器
- **Pinia** - Vue状态管理库

### UI组件库
- **Element Plus** - Vue 3 UI组件库
- **Element Plus Icons** - 图标组件库

### 构建工具
- **Vite** - 下一代前端构建工具
- **Vue DevTools** - Vue开发者工具

### 工具库
- **Axios** - HTTP客户端
- **VueUse** - Vue组合式API工具集
- **Driver.js** - 用户引导库
- **Pinia Plugin Persistedstate** - Pinia持久化插件

### 开发工具
- **ESLint** - 代码质量检查工具
- **Prettier** - 代码格式化工具
- **unplugin-auto-import** - 自动导入插件
- **unplugin-vue-components** - 组件自动导入插件

## 📁 项目结构

```
webstack-vue/
├── public/                 # 静态资源
│   └── favicon.ico        # 网站图标
├── src/                   # 源代码
│   ├── assets/           # 资源文件
│   │   ├── css/          # 样式文件
│   │   ├── js/           # JavaScript文件
│   │   └── logo.svg      # Logo文件
│   ├── components/       # 公共组件
│   │   ├── form/         # 表单组件
│   │   ├── AdminSideBar.vue
│   │   ├── CardHeader.vue
│   │   ├── CardVue.vue
│   │   ├── CommonHeader.vue
│   │   ├── CommonUpload.vue
│   │   ├── SideBar.vue
│   │   └── ToggleDarkButton.vue
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # 状态管理
│   │   └── user.js
│   ├── utils/            # 工具函数
│   │   └── request.js
│   ├── views/            # 页面组件
│   │   ├── Admin/        # 管理员页面
│   │   ├── User/         # 用户页面
│   │   └── HomeView.vue  # 首页
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
├── .eslintrc.cjs         # ESLint配置
├── .prettierrc.json      # Prettier配置
├── .gitignore           # Git忽略文件
├── index.html           # HTML模板
├── jsconfig.json        # JavaScript配置
├── package.json         # 项目依赖
├── pnpm-lock.yaml       # 锁定文件
├── vite.config.js       # Vite配置
└── README.md            # 项目文档
```

## 🛠️ 安装与使用

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/zxbdzh/webstack-vue.git
cd webstack-vue
```

2. **安装依赖**
```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

3. **环境配置**

修改环境变量文件：
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

主要配置项：
```env
# 开发环境API地址
VITE_API_URL=http://localhost:3000/api

# 生产环境API地址
VITE_API_URL=https://your-api-domain.com/api

# 基础路径（可选）
VITE_BASE_API=/
```

4. **启动开发服务器**
```bash
pnpm dev
```

5. **构建生产版本**
```bash
pnpm build
```

6. **预览生产构建**
```bash
pnpm preview
```

### 后端API部署

项目需要配合后端API使用，请自行部署API服务：
- 后端项目地址：[webstack-backend](https://github.com/zxbdzh/webstack-backend)
- 按照后端项目的说明进行部署和配置

## 📋 项目相关指令

### 开发指令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 部署说明

#### Nginx部署示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/webstack-vue/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### OpenResty部署

OpenResty部署方式与Nginx类似，可以直接使用上述配置。

## 🌟 功能特性

### 主要功能

- **🏠 首页导航**：展示分类书签，支持折叠侧边栏
- **🔍 分类浏览**：按分类浏览书签，支持多级分类
- **👤 用户系统**：用户注册、登录、个人中心
- **🛠️ 管理后台**：
  - 标签管理：增删改查书签标签
  - 分类管理：管理书签分类结构
  - 用户管理：管理系统用户
  - 书签管理：批量管理书签数据

### 界面特性

- **📱 响应式设计**：自适应桌面端和移动端
- **🌙 暗黑模式**：支持亮色/暗色主题切换
- **✨ 动画效果**：流畅的页面过渡和交互动画
- **📖 用户引导**：新用户首次使用的功能介绍

### 技术特性

- **🚀 现代化构建**：基于Vite的快速开发和构建
- **💾 状态持久化**：用户数据和设置的本地存储
- **🔧 自动导入**：组件和API的自动导入优化开发体验
- **✅ 代码规范**：ESLint + Prettier保证代码质量

## 🔧 开发指南

### 添加新功能

1. 在 `src/views/` 中创建新页面组件
2. 在 `src/router/index.js` 中添加路由配置
3. 如需状态管理，在 `src/stores/` 中创建store
4. 在 `src/components/` 中创建可复用组件

### 样式规范

- 使用Element Plus主题系统
- 遵循BEM命名规范
- 响应式设计优先

### 代码规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API最佳实践

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m ''Add some AmazingFeature''`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [WebStackPage](https://github.com/WebStackPage/WebStackPage.github.io) - 原项目灵感来源
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/zxbdzh/webstack-vue/issues)
- 发送邮件到：your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
', 'https://minio.zxbdwy.online/project-showcase/covers/1764035309845-vk6uxi.png', 'https://project.zxbdwy.online/webstack/', 'https://github.com/zxbdzh/webstack-vue', null, '21b7e3f4-4ed9-40e0-b580-9af65063e483', 'false', 'archived', '0', '0', '2025-11-25 01:51:55.605433+00', '2025-11-25 01:51:55.605433+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('4455d7bf-9d54-406f-aec0-57cdcfedd2c3', '无人机教学虚拟仿真平台', 'ty_virtual_flight_control_system（无人机教学虚拟仿真平台）是一个基于微服务架构的综合性飞行控制与仿真平台。该系统集成了多种飞行场景模拟、CAAC（中国民用航空局）科目训练、巡检任务、植保作业等功能，为无人机飞行培训、作业管理和技术研究提供完整的解决方案。
', '# ty_virtual_flight_control_system

成品地址：https://gitee.com/mainfunction/ty_virtual_flight_control_system/gitee_go/pipelines?tab=release

视频演示：https://www.bilibili.com/video/BV19PUkB8Eie/

## 项目介绍

ty_virtual_flight_control_system（无人机教学虚拟仿真平台）是一个基于微服务架构的综合性飞行控制与仿真平台。该系统集成了多种飞行场景模拟、CAAC（中国民用航空局）科目训练、巡检任务、植保作业等功能，为无人机飞行培训、作业管理和技术研究提供完整的解决方案。

系统采用前后端分离架构，前端使用Vue.js + Element UI构建现代化用户界面，后端基于Spring Boot微服务架构，支持高并发、高可用的企业级应用场景。

## 核心功能

### 🚁 飞行仿真与训练
- **CAAC科目训练**：支持CAAC科目2、科目3等专业飞行训练
- **仿真飞行**：提供多场景飞行仿真环境
- **飞行复现**：支持飞行轨迹回放和分析

### 📋 作业管理
- **植保调运**：农业植保和物流运输作业管理
- **巡检任务**：电力线路、基础设施巡检
- **测绘作业**：航空测绘和地形测量
- **分布式货运**：多机协同货物运输

### 📊 数据分析与监控
- **碳排放监测**：飞行作业碳足迹计算与分析
- **任务报表**：作业数据统计和可视化报表
- **实时监控**：飞行状态实时监控和告警

## 技术架构

### 前端技术栈
- **框架**：Vue.js 2.6.12
- **UI组件库**：Element UI 2.14.1
- **状态管理**：Vuex 3.6.0
- **路由管理**：Vue Router 3.4.9
- **图表库**：ECharts 5.3.3 +Q Vue-ECharts 6.2.3
- **构建工具**：Vue CLI 4.4.6
- **样式处理**：Sass + Tailwind CSS

### 后端技术栈
- **核心框架**：Spring Boot 2.2.12.RELEASE
- **数据库连接池**：Alibaba Druid 1.2.4
- **ORM框架**：MyBatis + PageHelper分页插件
- **安全框架**：JWT Token认证
- **API文档**：Swagger 2.10.5
- **定时任务**：Quartz
- **缓存**：Spring Cache
- **日志框架**：SLF4J + Log4j2

### 微服务模块
- **neu-admin**：系统管理入口
- **neu-framework**：核心框架模块
- **neu-system**：系统基础服务
- **neu-carbon-flights**：飞行管理服务
- **neu-carbon-task**：任务管理服务
- **neu-carbon-wms**：仓库管理服务
- **neu-carbon-mes**：制造执行服务
- **neu-carbon-scm**：供应链管理
- **neu-carbon-footprint**：碳足迹计算
- **neu-carbon-report**：报表服务
- **neu-carbon-service**：业务服务层
- **neu-carbon-mapper**：数据访问层

## 快速开始

### 环境要求
- **Node.js**：>= 8.9
- **Java**：JDK 1.8+
- **Maven**：3.6+
- **MySQL**：5.7+

### 后端启动

1. **克隆项目**
```bash
git clone https://gitee.com/mainfunction/ty_virtual_flight_control_system.git
cd ty_virtual_flight_control_system/flight_control_system_backend
```

2. **数据库配置**
```bash
# 导入数据库脚本
mysql -u root -p < sql/mysql-2025_11_14_18_12_26-dump.sql
```

3. **编译打包**
```bash
# 使用Maven编译
mvn clean compile

# 打包所有模块
mvn clean package

# 或使用脚本快速启动
cd bin
./run.sh  # Linux/Mac
run.bat   # Windows
```

4. **启动服务**
```bash
# 启动主应用
java -jar neu-admin/target/neu-admin.jar
```

默认访问地址：http://localhost:9090

### 前端启动

1. **安装依赖**
```bash
cd flight_control_system_frontend
npm install
# 或使用pnpm
pnpm install
```

2. **开发环境启动**
```bash
npm run dev
```

3. **生产环境构建**
```bash
npm run build:prod
```

4. **预览构建结果**
```bash
npm run preview
```

默认访问地址：http://localhost:80

## 插件系统

项目提供了丰富的插件配置，支持不同应用场景：

### 训练类插件
- `CAAC科目2_settings适用于c1c3/` - CAAC科目2训练配置
- `CAAC科目3_settings适用于c2c4/` - CAAC科目3训练配置
- `仿真飞行settings适用于c6c7c8c9/` - 飞行仿真配置

### 作业类插件
- `植保调运适用于c12c13/` - 植保作业配置
- `巡检settings适用于c15/` - 巡检任务配置
- `测绘settings适用于c10/` - 测绘作业配置
- `电力settings适用于c11/` - 电力巡检配置
- `分布式货运settings适用于c14/` - 货运配置

### 工具类插件
- `飞行复现settings/` - 飞行轨迹回放
- `录像settings适用于c16/` - 录像功能配置

### Python脚本
- `airsim_weather.py` - AirSim天气控制
- `reshow_from_ulg.py` - ULG文件回放
- `show_hud_for_c1c3.py` - HUD显示脚本
- `random_pos_with_hud_for_c2c4.py` - 随机位置生成

## 项目结构

```
ty_virtual_flight_control_system/
├── flight_control_system_backend/     # 后端服务
│   ├── neu-admin/                    # 系统管理模块
│   ├── neu-framework/                # 核心框架
│   ├── neu-system/                   # 系统服务
│   ├── neu-carbon-*/                 # 业务模块
│   ├── sql/                          # 数据库脚本
│   └── bin/                          # 启动脚本
├── flight_control_system_frontend/   # 前端应用
│   ├── src/                          # 源码
│   ├── public/                       # 静态资源
│   └── dist1/                        # 构建输出
├── plugins/                          # 插件目录
│   ├── all_settings/                 # 配置文件
│   ├── bat_scripts/                  # Windows脚本
│   └── py_scripts/                   # Python脚本
├── README.md                         # 中文文档
└── README.en.md                      # 英文文档
```

## 开发指南

### 后端开发
1. **新增模块**：在`neu-carbon-*`下创建新模块
2. **数据库操作**：使用MyBatis进行数据访问
3. **API开发**：遵循RESTful规范，使用Swagger文档
4. **权限控制**：基于JWT Token的认证授权

### 前端开发
1. **页面开发**：在`src/views/`下创建页面组件
2. **API调用**：使用Axios进行HTTP请求
3. **状态管理**：使用Vuex管理全局状态
4. **路由配置**：在`src/router/`下配置路由

### 插件开发
1. **配置文件**：在`plugins/all_settings/`下创建配置目录
2. **Python脚本**：在`plugins/py_scripts/`下添加功能脚本
3. **批处理脚本**：在`plugins/bat_scripts/`下添加启动脚本

## 部署说明

### 开发环境部署
1. 后端服务：默认端口9090
2. 前端服务：默认端口80
3. 数据库：MySQL 5.7+

### 生产环境部署
1. **后端部署**：使用Docker容器化部署
2. **前端部署**：Nginx静态文件服务
3. **数据库**：MySQL主从复制
4. **负载均衡**：Nginx + Spring Cloud Gateway

## 常见问题

### Q: 如何修改数据库连接配置？
A: 修改`neu-admin/src/main/resources/application.yml`中的数据库配置。

### Q: 如何添加新的飞行场景？
A: 在`plugins/all_settings/`下创建新的配置目录，并添加相应的设置文件。

### Q: 如何扩展新的业务模块？
A: 参考现有`neu-carbon-*`模块结构，创建新的微服务模块。

### Q: 前端如何配置API代理？
A: 修改`flight_control_system_frontend/vue.config.js`中的devServer.proxy配置。

## 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request

### 贡献规范
- 代码风格遵循ESLint和PMD规范
- 提交信息使用语义化格式
- 新功能需要添加相应的测试用例
- 文档更新与代码提交同步进行

## 版本历史

- **v3.3.0**：当前版本，完整的微服务架构
- **v3.2.x**：基础功能完善
- **v3.1.x**：前端界面优化
- **v3.0.x**：微服务架构重构

## 联系方式

- **项目维护者**：天翼团队
- **问题反馈**：[Gitee Issues](https://gitee.com/mainfunction/ty_virtual_flight_control_system/issues)
- **技术交流**：项目讨论区

## 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 致谢

感谢以下开源项目的支持：
- Vue.js生态系统
- Spring Boot框架
- Element UI组件库
- AirSim仿真平台
- QGroundControl地面站

---

**无人机教学虚拟仿真平台** - 让飞行控制更智能，让作业管理更高效！
', 'https://minio.zxbdwy.online/project-showcase/covers/1763970026730-1u3ept.png', 'https://www.bilibili.com/video/BV19PUkB8Eie/', 'https://github.com/zxbdzh/ty_virtual_flight_control_system', null, '21b7e3f4-4ed9-40e0-b580-9af65063e483', 'true', 'published', '0', '0', '2025-11-24 07:39:15.661003+00', '2025-11-24 07:40:35.256815+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('5c2c379b-2389-4ba6-8ef9-38fab7b5946e', '设备插入运行工具', '一个基于 Electron + Vue 3 + TypeScript 的设备插件自动运行工具，用于监控可移动存储设备并自动执行预配置的任务。', '# DevicePlug-RunTool

一个基于 Electron + Vue 3 + TypeScript 的设备插件自动运行工具，用于监控可移动存储设备并自动执行预配置的任务。

## 项目图片

![](https://minio.zxbdwy.online:443/picgo/14-11-20.png)
![](https://minio.zxbdwy.online:443/picgo/14-12-21.png)
![](https://minio.zxbdwy.online:443/picgo/14-12-29.png)
![](https://minio.zxbdwy.online:443/picgo/14-12-37.png)

## 🚀 功能特性

- **设备监控**: 实时监控可移动存储设备的连接和断开
- **任务配置**: 为不同设备配置自定义的可执行程序任务
- **自动执行**: 设备插入时自动执行配置的任务（通过Windows任务计划）
- **手动执行**: 支持立即手动执行设备任务
- **卷标识别**: 支持通过设备ID和卷标两种方式识别设备
- **多程序支持**: 单个设备可配置多个可执行程序并行启动
- **配置持久化**: 任务配置自动保存到本地文件

## 🛠️ 技术栈

### 核心框架
- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的构建工具

### UI组件
- **Element Plus** - Vue 3 UI组件库
- **@element-plus/icons-vue** - Element Plus图标库

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **unplugin-auto-import** - 自动导入API
- **unplugin-vue-components** - 按需自动导入组件

### 系统集成
- **Windows任务计划** - 实现设备插入时的自动任务执行
- **PowerShell** - 查询可移动存储设备信息
- **批处理脚本** - 任务执行的具体实现

## 📦 安装和使用

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0（推荐）或 npm

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev
```

### 构建应用

```bash
# 构建所有平台
pnpm build

# 仅构建 Windows 版本
pnpm build:win

# 仅构建 macOS 版本
pnpm build:mac

# 仅构建 Linux 版本
pnpm build:linux
```

### 代码质量

```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 类型检查
pnpm typecheck
```

## 🎯 使用指南

### 1. 设备管理
- 应用启动后会自动监控可移动存储设备
- 在"设备管理"标签页查看当前连接的设备
- 支持实时显示设备连接/断开状态

### 2. 配置任务
- 点击设备卡片上的"配置任务"按钮
- 填写任务名称（默认为设备名称+任务）
- 配置可执行文件路径（支持多个程序）
- 可选填卷标名称用于设备识别
- 保存配置后自动创建Windows任务计划

### 3. 任务执行
- **自动执行**: 设备插入时通过Windows任务计划自动执行
- **手动执行**: 在设备卡片或任务配置页面点击"立即执行"

### 4. 任务管理
- 在"任务配置"标签页查看所有已配置的任务
- 支持立即执行、删除配置等操作

## 📁 项目结构

```
DevicePlug-RunTool/
├── src/
│   ├── main/                 # Electron 主进程
│   │   └── index.ts         # 主进程入口文件
│   ├── preload/             # 预加载脚本
│   │   ├── index.ts         # 预加载脚本入口
│   │   └── index.d.ts       # 类型定义
│   └── renderer/            # 渲染进程（Vue应用）
│       ├── src/
│       │   ├── App.vue      # 主应用组件
│       │   ├── main.ts      # 渲染进程入口
│       │   └── components/
│       │       └── DeviceCard.vue  # 设备卡片组件
│       └── index.html       # HTML模板
├── resources/
│   └── icon.png             # 应用图标
├── electron.vite.config.ts   # Electron + Vite 配置
├── electron-builder.yml      # 应用打包配置
├── package.json             # 项目配置
└── README.md               # 项目文档
```

## 🔧 配置说明

### 应用配置
- 配置文件位置: `~/.deviceplug-runtool/task-configs.json`
- 脚本文件位置: `~/.deviceplug-runtool/scripts/`
- 任务计划前缀: `DevicePlug_`

### 设备识别策略
1. **优先使用设备ID**: 精确匹配特定设备
2. **卷标匹配**: 当设备ID变化时使用卷标识别
3. **自动检测**: 每5秒检查一次设备连接状态

## 🚨 注意事项

1. **权限要求**: 应用需要管理员权限来创建Windows任务计划
2. **杀毒软件**: 某些杀毒软件可能会阻止自动执行功能
3. **路径格式**: 可执行文件路径需要使用绝对路径
4. **中文支持**: 批处理脚本使用GBK编码确保中文正确显示

## 🐛 故障排除

### 常见问题

**Q: 任务计划创建失败？**
A: 请确保以管理员身份运行应用

**Q: 设备检测不到？**
A: 检查设备是否为可移动存储设备，确认驱动正常安装

**Q: 任务执行没有反应？**
A: 检查可执行文件路径是否正确，确认程序可以正常启动

### 日志查看
- 开发模式: 查看控制台输出
- 生产模式: 检查Windows事件查看器中的任务计划日志

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m ''Add some AmazingFeature''`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 组件库](https://element-plus.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 搜索现有的 Issues
3. 创建新的 Issue 并提供详细信息

---

**DevicePlug-RunTool** - 让设备管理更加智能化 🚀
', 'https://minio.zxbdwy.online/project-showcase/covers/1763964599549-rtzn53.png', 'https://www.bilibili.com/video/BV1vHxMzhE4x/', 'https://github.com/zxbdzh/DevicePlug-RunTool', null, '91cef50a-1efc-4b43-9783-018003155486', 'true', 'published', '0', '0', '2025-11-24 06:33:04.865204+00', '2025-11-24 06:33:04.865204+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('9748c6b0-2fb5-4017-b7bb-480711423c79', '伙伴匹配系统', '微服务架构用户中心系统，基于 Spring Boot 构建，核心技术栈涵盖 Java 17、Spring Cloud、MySQL、Redis 等。项目采用多模块设计，包含公共、网关、用户、团队、标签五大核心模块，实现用户注册登录、团队管理、标签系统、用户匹配推荐等关键功能，兼具教学价值与实战意义，可作为微服务学习实践项目、企业用户管理系统参考', '# YuPao Backend 项目描述

## 项目概述

YuPao Backend 是一个基于 Spring Boot 的微服务架构用户中心系统，由程序员鱼皮开发，源自编程导航知识星球的原创全栈项目。该项目实现了用户注册、登录、团队管理、标签系统等核心功能，是一个企业级的用户管理和社交平台后端系统。

## 项目图片

![](https://minio.zxbdwy.online:443/picgo/21-24-22.png)
![](https://minio.zxbdwy.online:443/picgo/21-26-21.png)
![](https://minio.zxbdwy.online:443/picgo/21-26-42.png)
![](https://minio.zxbdwy.online:443/picgo/21-26-46.png)
![](https://minio.zxbdwy.online:443/picgo/21-26-53.png)
![](https://minio.zxbdwy.online:443/picgo/21-27-24.png)
![](https://minio.zxbdwy.online:443/picgo/21-27-29.png)
![](https://minio.zxbdwy.online:443/picgo/21-27-32.png)
![](https://minio.zxbdwy.online:443/picgo/21-27-36.png)
![](https://minio.zxbdwy.online:443/picgo/21-27-40.png)

## 技术架构

### 核心技术栈

- __编程语言__: Java 17
- __框架__: Spring Boot 2.6.4
- __微服务__: Spring Cloud 2021.0.1
- __服务注册与发现__: Alibaba Nacos
- __数据访问__: MyBatis + MyBatis Plus 3.5.1
- __数据库__: MySQL
- __缓存__: Redis + Redisson
- __API文档__: Knife4j (Swagger)
- __构建工具__: Maven
- __其他__: Lombok, Gson, jUnit

### 微服务模块架构

项目采用多模块 Maven 结构，包含以下核心模块：

#### 1. yupao-common-module (公共模块)

- __功能__: 提供公共工具类、异常处理、数据模型和常量定义

- __核心组件__:

  - 数据模型: User, Team, Tag, UserTeam
  - 通用工具: BaseResponse, ResultUtils, ErrorCode
  - 异常处理: BusinessException, GlobalExceptionHandler
  - 枚举类: TeamStatusEnum, UserConstant
  - 算法工具: AlgorithmUtils (用户匹配算法)

#### 2. yupao-gateway-module (网关模块)

- __功能__: API 网关服务，负责请求路由、负载均衡和统一入口
- __特性__: 关闭热加载，提供稳定的网关服务

#### 3. yupao-user-module (用户模块)

- __功能__: 用户管理核心服务

- __主要特性__:

  - 用户注册、登录、注销
  - 用户信息管理
  - 用户标签系统
  - 用户匹配推荐算法
  - 缓存预热机制
  - Excel 数据导入功能

#### 4. yupao-team-module (团队模块)

- __功能__: 团队管理服务

- __主要特性__:

  - 团队创建、加入、退出
  - 团队权限管理
  - 团队状态控制 (公开/私有/加密)
  - 用户-团队关联管理
  - Feign 客户端调用用户服务

#### 5. yupao-tags-module (标签模块)

- __功能__: 标签管理服务

- __主要特性__:

  - 标签的增删改查
  - 父子标签关系管理
  - 用户标签关联

## 数据模型设计

### 核心实体

1. __User (用户)__

   - 基本信息: 用户名、账号、头像、性别、电话、邮箱
   - 系统字段: 状态、角色、星球编号、标签、简介
   - 审计字段: 创建时间、更新时间、逻辑删除

2. __Team (团队)__

   - 基本信息: 团队名称、描述、最大人数、过期时间
   - 权限控制: 状态 (公开/私有/加密)、密码
   - 关联字段: 创建用户ID、加入人数

3. __Tag (标签)__

   - 基本信息: 标签名、用户ID、父标签ID
   - 层级关系: 是否父标签标识
   - 审计字段: 创建时间、更新时间、逻辑删除

4. __UserTeam (用户团队关联)__

   - 关联关系: 用户ID、团队ID、加入时间
   - 状态管理: 团队角色、状态

## 业务功能特性

### 用户管理

- 用户注册与登录验证
- 用户信息完善与管理
- 基于标签的用户匹配推荐
- 用户状态与权限控制
- 批量用户数据导入

### 团队管理

- 团队创建与配置
- 多种团队模式 (公开/私有/加密)
- 团队成员管理
- 团队权限控制
- 团队过期管理

### 标签系统

- 层级标签结构
- 用户自定义标签
- 标签关联管理
- 标签推荐算法

### 系统特性

- 微服务架构设计
- 分布式缓存支持
- 统一异常处理
- API 文档自动生成
- 逻辑删除机制
- 数据库连接池优化

## 配置与部署

### 数据库配置

- MySQL 数据库支持
- MyBatis Plus 增强功能
- 逻辑删除全局配置
- 驼峰命名映射

### 缓存配置

- Redis 分布式缓存
- Session 存储到 Redis
- Redisson 分布式锁支持

### API 文档

- Knife4j 增强 Swagger
- 中文界面支持
- 基础认证配置

## 项目特色

1. __教学价值__: 从零到一完整的企业级项目开发流程
2. __技术全面__: 涵盖前端、后端、部署全栈技术
3. __架构合理__: 微服务架构设计，易于扩展和维护
4. __代码规范__: 统一的代码风格和异常处理机制
5. __实战导向__: 基于真实业务场景的功能设计

## 适用场景

该项目适合作为：

- 学习微服务架构的实践项目
- 企业用户管理系统的技术参考
- 后端开发面试的项目经验
- 团队协作开发的技术基础


', 'https://minio.zxbdwy.online/project-showcase/covers/1763818318925-jmpdje.png', 'https://project.zxbdwy.online/partner', 'https://github.com/zxbdzh/partner-match', '"{]}', '21b7e3f4-4ed9-40e0-b580-9af65063e483', 'true', 'published', '1', '0', '2025-11-19 03:24:50.191915+00', '2025-11-24 05:47:11.622576+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('d45a8ce8-0a88-44b0-be1b-e6284eb6cc59', '锄山智慧旅游服务平台', '锄山智慧旅游服务平台是一个集成了地图服务、移动应用、管理后台和API接口的综合性旅游服务平台。该平台为游客提供景区导览、预约服务、特产购买等一站式旅游服务体验。', '# 锄山智慧旅游服务平台

## 项目简介

锄山智慧旅游服务平台是一个集成了地图服务、移动应用、管理后台和API接口的综合性旅游服务平台。该平台为游客提供景区导览、预约服务、特产购买等一站式旅游服务体验。

## 项目图片

![](https://minio.zxbdwy.online:443/picgo/21-47-43.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-46.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-49.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-53.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-58.png)
![](https://minio.zxbdwy.online:443/picgo/21-48-04.png)
![](https://minio.zxbdwy.online:443/picgo/21-46-23.png)
![](https://minio.zxbdwy.online:443/picgo/21-46-48.png)
![](https://minio.zxbdwy.online:443/picgo/21-46-51.png)
![](https://minio.zxbdwy.online:443/picgo/21-46-55.png)
![](https://minio.zxbdwy.online:443/picgo/21-46-58.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-03.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-07.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-10.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-15.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-18.png)
![](https://minio.zxbdwy.online:443/picgo/21-47-34.png)

## 项目DEMO

- 锄山地图：https://project.zxbdwy.online/chushan-map
- 锄山服务h5版：https://project.zxbdwy.online/chushan/
- 锄山服务后台管理系统：https://project.zxbdwy.online/chushan-admin/

## 项目架构

本项目采用前后端分离的微服务架构，包含以下四个主要模块：

```
chushan_project/
├── chushan_map/              # 地图服务前端 (Vue 3 + Vite)
├── chushan_service/          # 移动端应用 (uni-app)
├── chushan_service_backend/  # 后端服务
│   ├── admin-vue/           # 管理后台 (Vue 3 + TypeScript)
│   └── api/                 # API服务 (Spring Boot 3 + Java 21)
└── README.md                # 项目说明文档
```

## 功能模块

### 1. 锄山地图 (chushan_map)
- **技术栈**: Vue 3 + Vite + 腾讯地图API + ECharts
- **主要功能**: 
  - 景区地图展示
  - 标记点管理
  - 数据可视化图表
- **开发环境**: Node.js + pnpm

### 2. 锄山服务 (chushan_service)
- **技术栈**: uni-app + Vue 3
- **支持平台**: 微信小程序、Android、iOS
- **主要功能**:
  - 🏠 首页：轮播图、景点推荐、人气榜单
  - 📰 景区动态：最新资讯和活动信息
  - 🎫 景点预约：在线预约景点门票
  - 🏨 房间预约：住宿预订服务
  - 🚗 停车预约：停车位在线预约
  - 🛍️ 特产商城：当地特产展示和购买
  - 🛠️ 服务中心：各类便民服务

### 3. 管理后台 (admin-vue)
- **技术栈**: Vue 3 + TypeScript + Element Plus + Vite
- **主要功能**:
  - 👤 用户管理：用户信息维护
  - 🏛️ 内容管理：景点、特产、攻略等内容管理
  - 📅 预约管理：景点预约、房间预约、停车预约管理
  - 📊 数据统计：平台运营数据分析

### 4. API服务 (api)
- **技术栈**: Spring Boot 3 + Java 21 + MyBatis Plus + MySQL
- **主要功能**:
  - RESTful API接口
  - JWT身份认证
  - 数据库操作
  - 文件上传 (S3)
  - API文档 (Knife4j)

## 技术特性

### 前端技术
- **Vue 3**: 采用Composition API和响应式系统
- **TypeScript**: 类型安全和更好的开发体验
- **Element Plus**: 企业级UI组件库
- **uni-app**: 跨平台移动应用开发
- **Vite**: 快速的构建工具
- **Pinia**: 现代化状态管理

### 后端技术
- **Spring Boot 3**: 最新的Spring Boot框架
- **Java 21**: LTS版本的Java语言
- **MyBatis Plus**: 强大的ORM框架
- **MySQL**: 关系型数据库
- **JWT**: 安全的身份认证机制
- **Knife4j**: API文档生成工具

### 开发工具
- **pnpm**: 高效的包管理器
- **ESLint + Prettier**: 代码质量和格式化
- **Maven**: Java项目构建工具

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- Java >= 21
- MySQL >= 8.0
- pnpm >= 8.0.0

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd chushan_project
```

#### 2. 安装前端依赖
```bash
# 地图服务
cd chushan_map
pnpm install

# 移动端应用
cd ../chushan_service
pnpm install

# 管理后台
cd ../chushan_service_backend/admin-vue
pnpm install
```

#### 3. 配置后端服务
```bash
cd ../../api
# 配置数据库连接 (application-dev.yml)
# 运行SQL脚本创建数据库表
mvn clean install
```

#### 4. 启动服务

**启动API服务**
```bash
cd chushan_service_backend/api
mvn spring-boot:run
```

**启动地图服务**
```bash
cd chushan_map
pnpm dev
```

**启动管理后台**
```bash
cd chushan_service_backend/admin-vue
pnpm dev
```

**启动移动端开发**
```bash
cd chushan_service
# 使用HBuilderX或uni-app CLI进行开发
```

## 项目配置

### 数据库配置
在 `chushan_service_backend/api/src/main/resources/application-dev.yml` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/chushan_service?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    username: your_username
    password: your_password
```

### API接口文档
启动后端服务后，访问：`http://localhost:8080/doc.html` 查看API文档

## 开发规范

### 代码规范
- 使用ESLint和Prettier进行代码格式化
- 遵循Vue 3 Composition API最佳实践
- TypeScript项目严格类型检查

### 提交规范
- 使用语义化提交信息
- 功能开发使用feature分支
- 代码审查后合并到主分支

## 部署说明

### 前端部署
```bash
# 构建地图服务
cd chushan_map
pnpm build

# 构建管理后台
cd ../chushan_service_backend/admin-vue
pnpm build
```

### 后端部署
```bash
cd chushan_service_backend/api
mvn clean package
java -jar target/api-0.0.1-SNAPSHOT.jar
```

### 移动端部署
- 微信小程序：通过微信开发者工具发布
- Android/iOS：通过uni-app云打包或本地打包

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m ''Add some AmazingFeature''`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目地址：[repository-url]

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成基础功能开发
- 支持地图服务、移动应用、管理后台和API服务

---

', 'https://minio.zxbdwy.online/project-showcase/covers/1763992662043-biee41.png', 'https://project.zxbdwy.online/chushan', 'https://github.com/zxbdzh/chushan_project', null, '21b7e3f4-4ed9-40e0-b580-9af65063e483', 'true', 'published', '0', '0', '2025-11-24 13:57:10.216887+00', '2025-11-24 13:57:46.207489+00', '413a7876-2101-4866-8de3-43400eb38fe8'), ('f0843180-9461-4cf0-9150-74fc1a4afd5d', '思源笔记插件——siyuan-plugin-export-s3-markdown', '一个用于将思源笔记导出为 Markdown 并上传到 S3 兼容存储的插件。', '# SiYuan Plugin Export S3 Markdown

一个用于将思源笔记导出为 Markdown 并上传到 S3 兼容存储的插件。

## 项目图片

![](https://minio.zxbdwy.online:443/picgo/13-56-44.png)
![](https://minio.zxbdwy.online:443/picgo/13-57-14.png)
![](https://minio.zxbdwy.online:443/picgo/13-57-23.png)
![](https://minio.zxbdwy.online:443/picgo/13-55-52.png)

## 功能特性

- 将思源笔记文档导出为标准 Markdown 格式
- 自动上传文档中的图片资源到 S3 存储服务
- 支持多种 S3 兼容服务（AWS S3、阿里云 OSS、腾讯云 COS、MinIO 等）
- 批量导出多个文档为 ZIP 包
- 可配置的版权前缀和后缀
- 支持自定义 S3 存储路径后缀

## 使用教程

[bilibili 视频教程](https://b23.tv/WTEFxxz)

## 安装方式

1. 在思源笔记中打开集市
2. 搜索 "Export S3 Markdown" 插件
3. 下载并启用插件

## 配置说明

### S3 配置

在插件设置中配置以下信息：

- **endpoint**: S3 服务地址（例如：https://s3.amazonaws.com）
- **accessKey**: 访问密钥 ID
- **secretKey**: 私有访问密钥
- **bucket**: 存储桶名称
- **region**: AWS 区域（可选，默认 us-east-1）
- **版权前缀**: 在导出的 Markdown 文件顶部添加的内容
- **版权后缀**: 在导出的 Markdown 文件底部添加的内容

### 支持的服务

- AWS S3
- 阿里云 OSS
- 腾讯云 COS
- MinIO
- 其他 S3 兼容存储服务

## 使用方法

### 单文档导出

1. 在文档树中右键点击要导出的文档
2. 选择 "导出md文件" 或 "导出md文件到剪切板"
3. 插件会自动上传图片到配置的 S3 存储并更新 Markdown 中的链接

### 批量导出

1. 在文档树中选择多个文档
2. 右键选择 "批量导出为ZIP"
3. 插件会处理所有选中的文档并打包为 ZIP 文件

### 仅上传图片

1. 在文档树中右键点击文档
2. 选择 "仅上传图床"
3. 插件仅上传文档中的图片资源到 S3

## 开发说明

### 技术栈

- 使用 Vite + TypeScript 开发
- 基于思源笔记插件 API
- 集成 AWS SDK for S3 操作
- 使用 JSZip 进行批量导出打包

### 构建部署

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 生产构建
pnpm run build
```


### 目录结构

```
src/
├── index.ts          # 插件主入口
├── api.ts            # S3 和文件操作 API
├── setting-example.svelte  # 设置界面
└── libs/
    └── setting-utils.ts    # 设置工具类
```


## 注意事项

1. 确保 S3 配置信息正确，包括访问权限
2. 导出的 Markdown 文件会自动去除思源笔记的 front matter
3. 图片上传后会替换为 S3 公共访问链接
4. 建议在使用前先测试 S3 连接配置

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=zxbdzh/siyuan-plugin-export-s3-markdown&type=date&legend=top-left)](https://www.star-history.com/#zxbdzh/siyuan-plugin-export-s3-markdown&type=date&legend=top-left)', 'https://minio.zxbdwy.online/project-showcase/covers/1763963670795-onexfz.png', 'https://github.com/zxbdzh/siyuan-plugin-export-s3-markdown', 'https://github.com/zxbdzh/siyuan-plugin-export-s3-markdown', null, '198db731-a664-45e0-9200-dbf6c5390c24', 'true', 'published', '0', '0', '2025-11-24 05:59:59.519628+00', '2025-11-24 06:01:34.641404+00', '413a7876-2101-4866-8de3-43400eb38fe8');
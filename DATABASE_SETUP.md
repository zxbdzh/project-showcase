# 数据库设置指南

## 概述

本项目使用 Supabase 作为后端数据库服务。需要执行以下步骤来正确设置数据库结构。

## 前置条件

1. 已创建 Supabase 项目
2. 已配置环境变量（`.env` 文件）
3. 已安装 Supabase CLI（可选）

## 数据库表结构

### 核心表

1. **profiles** - 用户档案
2. **projects** - 项目信息
3. **categories** - 项目分类
4. **tags** - 项目标签
5. **skills** - 技能信息
6. **social_links** - 社交链接
7. **system_settings** - 系统设置

### 关联表

1. **project_categories** - 项目与分类的关联
2. **project_tags** - 项目与标签的关联

## 设置步骤

### 方法一：通过 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `database-init.sql` 文件中的内容
5. 粘贴到 SQL 编辑器中
6. 点击 **Run** 执行脚本

### 方法二：通过 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到项目
supabase link --project-ref your-project-ref

# 执行 SQL 脚本
supabase db push database-init.sql
```

## RLS (Row Level Security) 策略

项目启用了行级安全策略，确保：

- 用户只能操作自己的数据
- 关联表通过项目所有者权限控制
- 公开数据（如已发布的项目）可以被所有人查看

## 示例数据

脚本包含以下示例数据：

- 3个项目分类
- 5个技术标签
- 5个技能项
- 3个社交链接
- 4个系统设置

## 验证设置

执行脚本后，可以通过以下方式验证：

1. 检查 Supabase Dashboard 中的表是否创建成功
2. 运行应用程序，查看是否能正常加载数据
3. 尝试创建新项目，验证关联功能

## 常见问题

### Q: 表已存在但仍然报错

A: 检查表结构是否与类型定义匹配，特别是外键关系

### Q: RLS 策略阻止访问

A: 确保用户已登录，并且 `auth.uid()` 返回正确的用户ID

### Q: 关联查询失败

A: 检查外键约束是否正确设置，确保引用的表存在

## 开发环境

在开发环境中，可以使用 `demo-user` 作为用户ID来测试功能。生产环境中应该使用真实的用户认证系统。

## 更新数据库结构

如果需要修改数据库结构：

1. 创建新的 SQL 迁移脚本
2. 在 Supabase Dashboard 中执行
3. 更新 TypeScript 类型定义（`src/utils/supabase.ts`）
4. 更新相关的服务代码

## 备份

建议定期备份 Supabase 数据库：

```bash
# 通过 CLI 备份
supabase db dump > backup.sql

# 或通过 Dashboard 导出
```

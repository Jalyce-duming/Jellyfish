# Jellyfish Frontend（简体中文）

<p align="center">
  <img src="./logo.svg" alt="Jellyfish Logo" width="160" />
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.md">入口</a>
</p>

一个基于 **Vite + React + TypeScript** 的现代化前端脚手架，集成了 Tailwind CSS 和 Ant Design。

## 技术栈

- **Vite** - 下一代前端构建工具
- **React 18** - UI 库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用工具优先的 CSS 框架
- **Ant Design** - 企业级 UI 设计系统
- **ESLint** - 代码检查工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

编译后的文件将在 `dist` 目录中。

### 代码检查

```bash
npm run lint
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
jellyfish/
├── src/
│   ├── components/        # React 组件
│   │   ├── CustomButton.tsx
│   │   ├── CustomCard.tsx
│   │   └── index.ts
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
├── .eslintrc.json         # ESLint 配置
└── package.json           # 项目依赖
```

## 功能特性

✅ **Vite 快速开发** - HMR 热更新，极速开发体验  
✅ **React 18** - 最新的 React 版本和特性  
✅ **TypeScript** - 完整的类型支持和智能提示  
✅ **Tailwind CSS** - 快速构建现代化 UI  
✅ **Ant Design** - 丰富的企业级组件库  
✅ **ESLint** - 代码规范检查  

## 配置说明

### 环境变量（Vite）

复制示例文件并按需修改：

```bash
cp .env.example .env
```

示例（来自 `.env.example`）：

- `VITE_USE_MOCK=true`：是否使用 Mock 数据（启用 MSW 与本地演示数据）
- `VITE_API_URL`：API 地址（可选）
- `VITE_APP_TITLE`：应用标题（可选）

代码中读取：

```tsx
const apiUrl = import.meta.env.VITE_API_URL
```

### Tailwind CSS 配置

`tailwind.config.js` 已配置为：

- 扫描 `src` 目录下所有 `.tsx` 文件
- 禁用 Tailwind 的 preflight 样式以避免与 Ant Design 冲突

### Ant Design 使用

在组件中直接导入使用：

```tsx
import { Button, Card, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
```

## 开发建议

1. **组件化开发** - 在 `src/components` 目录中创建可复用组件
2. **类型定义** - 充分利用 TypeScript 的类型检查
3. **样式管理** - 优先使用 Tailwind CSS 类名，复杂样式在 CSS 文件中定义
4. **代码规范** - 运行 `npm run lint` 检查代码规范

## 常见问题

### Q: 如何添加新的依赖包？

```bash
npm install package-name
```

### Q: 如何自定义 Ant Design 主题？

在 `tailwind.config.js` 中的 `theme` 部分进行自定义，或使用 Ant Design 的 `ConfigProvider`。

### Q: 如何处理环境变量？

在项目根目录创建 `.env` 或 `.env.local` 文件，例如：

```
VITE_API_URL=https://api.example.com
```

## 许可证

MIT

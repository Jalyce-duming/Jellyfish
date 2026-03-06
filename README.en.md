# Jellyfish Frontend (English)

<p align="center">
  <img src="./logo.svg" alt="Jellyfish Logo" width="160" />
</p>

<p align="center">
  <a href="./README.en.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.md">Entry</a>
</p>

A modern frontend starter built with **Vite + React + TypeScript**, integrated with Tailwind CSS and Ant Design.

## Tech Stack

- **Vite** - Next-generation frontend tooling
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design** - Enterprise-grade UI system
- **ESLint** - Linting and code quality

## Quick Start

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server will start at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Build output will be generated in the `dist` directory.

### Lint

```bash
npm run lint
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
jellyfish/
├── src/
│   ├── components/        # React components
│   │   ├── CustomButton.tsx
│   │   ├── CustomCard.tsx
│   │   └── index.ts
│   ├── App.tsx            # App root component
│   ├── main.tsx           # Entry
│   └── index.css          # Global styles
├── index.html             # HTML template
├── vite.config.ts         # Vite config
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
├── postcss.config.js      # PostCSS config
├── .eslintrc.json         # ESLint config
└── package.json           # Dependencies & scripts
```

## Features

✅ **Fast Vite DX** - HMR and rapid feedback  
✅ **React 18** - Latest React features  
✅ **TypeScript** - Strong typing and IDE hints  
✅ **Tailwind CSS** - Build modern UI quickly  
✅ **Ant Design** - Rich enterprise component library  
✅ **ESLint** - Consistent code style and safety checks  

## Configuration

### Environment variables (Vite)

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

Example keys (from `.env.example`):

- `VITE_USE_MOCK=true`: enable mock data (MSW + local demo data)
- `VITE_API_URL`: API base URL (optional)
- `VITE_APP_TITLE`: app title (optional)

Read values in code:

```tsx
const apiUrl = import.meta.env.VITE_API_URL
```

### Tailwind CSS

`tailwind.config.js` is set up to:

- Scan all `.tsx` files under `src`
- Disable Tailwind preflight to reduce conflicts with Ant Design

### Ant Design usage

Import directly in components:

```tsx
import { Button, Card, Table } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
```

## Development Notes

1. **Component-first** - put reusable components in `src/components`
2. **Types matter** - lean on TypeScript for correctness
3. **Styling** - prefer Tailwind classes; use CSS for complex cases
4. **Keep it clean** - run `npm run lint` regularly

## FAQ

### Q: How do I add a dependency?

```bash
npm install package-name
```

### Q: How do I customize the Ant Design theme?

Customize your `theme` in `tailwind.config.js`, or use Ant Design's `ConfigProvider`.

### Q: How do I manage environment variables?

Create `.env` or `.env.local` at the project root, for example:

```
VITE_API_URL=https://api.example.com
```

## License

MIT

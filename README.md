# 研发之星抽奖系统 (R&D Star Lottery)

一个基于 React + TypeScript + Vite 的员工抽奖应用，支持 Excel 数据导入、自定义背景音乐、多轮抽奖等功能。

## 功能特性

- 🎯 **随机抽奖**: 公平的随机抽奖算法
- 📊 **Excel 导入**: 支持上传 Excel 文件导入员工数据
- 🎵 **背景音乐**: 支持自定义背景音乐播放
- 🖼️ **自定义背景**: 可上传自定义背景图片
- 🎉 **动画效果**: 抽奖过程中的动态显示效果
- 📱 **响应式设计**: 支持移动端和桌面端访问
- 🔄 **多轮抽奖**: 支持多轮抽奖，避免重复中奖
- 📝 **中奖记录**: 保存并显示历史中奖记录

## 技术栈

- **前端框架**: React 18.3.1
- **开发语言**: TypeScript 5.6.2
- **构建工具**: Vite 6.0.1
- **样式方案**: Tailwind CSS 3.4.16 + Radix UI
- **文件处理**: XLSX (Excel 文件解析)
- **图标库**: Lucide React

## 快速开始

### 本地开发

1. **安装依赖**
```bash
npm install
# 或
pnpm install
```

2. **启动开发服务器**
```bash
npm run dev
# 或
pnpm run dev
```

3. **访问应用**
- 本地访问: http://localhost:5173/

### 外网访问部署

如需要外网访问，需要执行以下步骤：

1. **启动服务器并绑定所有网络接口**
```bash
npx vite --host
```

2. **配置防火墙** (Ubuntu/CentOS)
```bash
# Ubuntu (UFW)
sudo ufw allow 5173

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

3. **配置云服务商安全组**
如果使用云服务器（阿里云、腾讯云等），需要在控制台的安全组中开放 5173 端口：
- 端口范围: `5173/5173`
- 协议类型: `TCP`
- 授权对象: `0.0.0.0/0` (允许所有 IP 访问)

4. **访问应用**
- 外网访问: `http://你的服务器IP:5173/`

### 生产环境部署

1. **构建项目**
```bash
npm run build
```

2. **预览构建结果**
```bash
npm run preview
```

3. **使用 Nginx 代理** (推荐)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run build:preview` - 构建预览版本
- `npm run preview` - 预览构建结果
- `npm run lint` - 代码检查

## 使用说明

1. **加载员工数据**: 应用启动后会自动加载默认员工数据，也可以上传 Excel 文件导入新数据
2. **设置抽奖**: 点击设置按钮，可以上传背景音乐和背景图片
3. **开始抽奖**: 点击"开始抽奖"按钮开始抽奖动画
4. **停止抽奖**: 点击"停止抽奖"确定中奖者
5. **多轮抽奖**: 完成一轮后可以继续进行下一轮，系统会自动排除已中奖人员

## 项目结构

```
src/
├── components/
│   ├── LotterySystem.tsx    # 主要抽奖组件
│   └── ErrorBoundary.tsx    # 错误边界组件
├── hooks/
│   └── use-mobile.tsx       # 移动端检测 Hook
├── lib/
│   └── utils.ts            # 工具函数
├── App.tsx                 # 应用根组件
├── main.tsx               # 应用入口
└── index.css              # 全局样式
```

## 数据格式

员工 Excel 文件应包含以下列：
- `name` - 员工姓名
- `department` - 部门
- `position` - 职位

## 开发

项目使用 TypeScript + React + Vite 开发，支持热重载和 ESLint 代码检查。

更多开发信息请参考 `CLAUDE.md` 文件。

# AGENTS.md

## 项目概述

"与我周旋久" —— 宁荣荣 2026 生日庆典预热活动的双端响应式 H5 页面。用户可在坐标系中拖放 41 个 Logo 素材，支持撤销/重做、缩放平移、自动保存与恢复。

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript (ES6+)
- 无框架、无构建工具、无 Node.js 依赖
- 纯静态页面，可直接由任意 HTTP 服务器托管
- 部署于 GitHub Pages（`.nojekyll` 标识）

## 目录结构

```
/workspace/projects/
├── index.html              # 主页面入口
├── styles.css              # 全局样式（响应式布局）
├── app.js                  # 核心交互逻辑（拖放、坐标系、存储）
├── .nojekyll               # GitHub Pages 配置
├── .gitignore
├── README.md               # 项目说明
├── ASSET_REPLACEMENT_GUIDE.md  # 素材替换指南
├── assets/
│   ├── logos/              # Logo 缩略图（41 组）
│   └── detail-images/      # 预览大图（41 组）
├── scripts/
│   ├── coze-preview-build.sh   # 预览构建脚本（验证入口文件）
│   ├── coze-preview-run.sh     # 预览运行脚本（Python HTTP Server :5000）
│   ├── coze-deploy-build.sh    # 部署构建脚本（验证入口文件）
│   └── coze-deploy-run.sh      # 部署运行脚本（Python HTTP Server :5000）
└── .coze                   # 平台配置
```

## 关键入口 / 核心模块

- `index.html`：页面结构，包含坐标系工作区、素材库、工具栏、预览浮层等
- `styles.css`：PC/Mobile 双端响应式样式，坐标系布局，动画效果
- `app.js`：核心逻辑模块
  - 素材数据管理（41 个 Logo，slot 命名规则 `行_列`）
  - 拖放交互（点击放置、拖拽定位、拖回待选区）
  - 坐标系操作（缩放、平移、辅助线、小地图）
  - 撤销/重做栈
  - localStorage 自动保存（30 天 TTL）
  - 移动端长按三段式反馈、沉浸模式
  - 预览浮层（按图片原始比例自适应）

## 运行与预览

- 纯静态项目，无需构建步骤
- 预览通过 Python HTTP 服务器提供静态文件服务
- 入口文件：`index.html`

## 部署配置

- **项目类型判定**：`web`（核心实现为浏览器可访问的 H5 页面，包含 `index.html` 入口、前端框架级交互逻辑、响应式样式）
- **部署形态**：`service` / `flavor = web`（平台不支持纯静态站点部署，需通过 HTTP 服务提供文件）
- **运行时**：`python-3.13`（使用 Python 内置 `http.server` 模块提供静态文件服务）
- **预览链路**：`[dev].build` 验证入口文件 → `[dev].run` 启动 Python HTTP Server 监听 `0.0.0.0:5000`
- **部署链路**：`[deploy].build` 验证入口文件 → `[deploy].run` 启动 Python HTTP Server 监听 `0.0.0.0:5000`
- **根 `.coze` 与子项目关系**：技术项目根目录与工作区根目录重合（`path = "."`），根 `.coze` 同时承担子项目 `.coze` 职责
- **维护注意**：
  - 脚本均基于 `SCRIPT_DIR` 推导 `PROJECT_DIR`，可从任意工作目录安全执行
  - 端口固定为 `5000`，绑定 `0.0.0.0`（IPv4 全接口）
  - 脚本具备幂等性：每次执行前清理 5000 端口残留进程

## 用户偏好与长期约束

- **版本管理**：每次更新必须记录版本号和更新日志，写入 `CHANGELOG.md`（格式遵循 Keep a Changelog，版本号遵循 Semantic Versioning）
- 素材命名规则：`行_列.png`（如 `1_1.png`），覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应文件即可替换
- 不依赖任何第三方 CDN 或 npm 包
- 需兼容 iOS Safari / 微信内置浏览器 / Android WebView

## 常见问题和预防

- 素材替换只需覆盖同名 PNG，无需修改代码
- 用户发送的截图（如 image.png、image_20260720191824384.png 等）不应保存在 assets 根目录，这些是临时文件，处理完素材后应删除
- 素材处理流程：用户提供的原始图片应直接处理并保存到 `assets/logos/` 或 `assets/detail-images/` 对应位置，不要在 `assets/` 根目录额外保存原图副本
- 素材处理流程：用户提供的原始图片应直接处理并保存到 `assets/logos/` 或 `assets/detail-images/` 对应位置，不要在 `assets/` 根目录额外保存原图副本
- localStorage key 为 `ningrongrong-2026-coordinate-v1`，清除浏览器数据会重置坐标
- 移动端交互依赖 touch 事件，桌面端依赖 mouse 事件，通过 `matchMedia` 区分

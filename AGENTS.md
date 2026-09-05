# AGENTS.md

## 项目概述

"与我周旋久" —— 宁荣荣 2026 生日庆典预热活动的双端响应式 H5 页面。用户可在坐标系中拖放碎片素材，支持撤销/重做、缩放平移、自动保存与恢复。当前共 20 个有效碎片（另有 15 个占位、9 个空槽，合计 44 个槽位）。

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript (ES6+)
- 无框架、无构建工具、无 Node.js 依赖
- 纯静态页面，可直接由任意 HTTP 服务器托管
- 部署于火山引擎服务器（GitHub Pages 已下线）

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
│   ├── logos/              # 碎片缩略图（18 个有效 + 15 个占位）
│   └── detail-images/      # 预览大图（18 个有效 + 15 个占位）
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
  - 素材数据管理（20 个有效碎片 + 24 个占位/空槽，slot 命名规则 `行_列`）
  - 拖放交互（点击放置、拖拽定位、拖回待选区）
  - 坐标系操作（缩放、平移、辅助线、小地图）
  - 撤销/重做栈
  - localStorage 自动保存（30 天 TTL）
  - 移动端长按三段式反馈、沉浸模式
  - 预览浮层（按图片原始比例自适应）

### 碎片对照表（以线上 officialNames 为准，共 22 个有效碎片）

| 槽位 | 碎片名称 | Logo 缩略图 | 预览原图 |
|---|---|---|---|
| `1_1` | 致绽放的你 | assets/logos/1_1.webp (16KB) | assets/detail-images/1_1.webp (142KB) |
| `1_2` | 韶光慢 | assets/logos/1_2.webp (18KB) | assets/detail-images/1_2.webp (191KB) |
| `1_3` | 赴明日如赴前尘 | assets/logos/1_3.webp (20KB) | assets/detail-images/1_3.webp (224KB) |
| `1_4` | 涌流幻梦之蝶 | assets/logos/1_4.webp (23KB) | assets/detail-images/1_4.webp (74KB) |
| `2_1` | 锋芒 | assets/logos/2_1.webp (20KB) | assets/detail-images/2_1.webp (50KB) |
| `2_2` | 知晓我在的人 | assets/logos/2_2.webp (22KB) | assets/detail-images/2_2.webp (409KB) |
| `2_3` | 珠如雨 | assets/logos/2_3.webp (21KB) | assets/detail-images/2_3.webp (211KB) |
| `2_4` | 已收款三块五 | assets/logos/2_4.webp (22KB) | assets/detail-images/2_4.webp (135KB) |
| `3_1` | 冲调午后 | assets/logos/3_1.webp (18KB) | assets/detail-images/3_1.webp (172KB) |
| `3_2` | 左满舵 | assets/logos/3_2.webp (20KB) | assets/detail-images/3_2.webp (81KB) |
| `3_3` | 槐花冰奶七分糖 | assets/logos/3_3.webp (18KB) | assets/detail-images/3_3.webp (84KB) |
| `3_4` | 何人消隐于风声 | assets/logos/3_4.webp (18KB) | assets/detail-images/3_4.webp (122KB) |
| `4_3` | 暝夜 | assets/logos/4_3.webp (22KB) | assets/detail-images/4_3.webp (40KB) |
| `4_4` | 心动瞬间 | assets/logos/4_4.webp (16KB) | assets/detail-images/4_4.webp (174KB) |
| `5_1` | 莲花去国一千年 | assets/logos/5_1.webp (20KB) | assets/detail-images/5_1.webp (398KB) |
| `5_3` | 引梦渡海 | assets/logos/5_3.webp (20KB) | assets/detail-images/5_3.webp (177KB) |
| `5_4` | 海落潮升 | assets/logos/5_4.webp (24KB) | assets/detail-images/5_4.webp (141KB) |
| `6_3` | 现实童话 | assets/logos/6_3.webp (23KB) | assets/detail-images/6_3.webp (296KB) |
| `6_4` | 阿女不答 | assets/logos/6_4.webp (35KB) | assets/detail-images/6_4.webp (677KB) |
| `7_1` | 伴生 | assets/logos/7_1.webp (19KB) | assets/detail-images/7_1.webp (176KB) |
| `7_2` | 直到世界听到 | assets/logos/7_2.webp (24KB) | assets/detail-images/7_2.webp (133KB) |
| `8_1` | 再加九克好奇心 | assets/logos/8_1.webp (23KB) | assets/detail-images/8_1.webp (271KB) |

**占位槽位**（有 ~1KB 占位图标，无碎片名称）：`6_1` `6_2` `7_3` `7_4` `8_2` `8_3` `8_4` `9_1`-`9_4` `10_1`-`10_4`（共 15 个）
**空槽位**（无素材文件）：`4_1` `4_2` `5_2` `11_1`-`11_4`（共 7 个）

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
- **命名规范**：前台所有用户可见文案中，原"Logo"统一称为"碎片"。代码标识符（CSS 类名、JS 变量名、文件路径等）可保留 `logo` 命名，但用户界面、提示语、说明文档等前台表述必须使用"碎片"
- 素材命名规则：`行_列.webp`（如 `1_1.webp`），覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应文件即可替换；用户提供的 PNG 碎片必须转为 WebP 且压缩到 50KB 以下
- 不依赖任何第三方 CDN 或 npm 包
- 需兼容 iOS Safari / 微信内置浏览器 / Android WebView

## 常见问题和预防

- 素材替换只需覆盖同名 WebP，无需修改代码；碎片文件必须小于 50KB
- **透明图标处理红线**：处理带透明通道的 PNG 时禁止 `convert('RGB')`（透明区会被填成黑色），必须保留 RGBA；处理完必须做像素级验证（四角 alpha=0，或合成浅色背景扫描无黑块），详见 ASSET_REPLACEMENT_GUIDE.md
- **部署排查顺序**：先查远端仓库实际内容（GitHub API / `git rev-parse origin/main:<file>`），再查 Actions run 状态，最后查服务器文件（`curl -sI` 看 Content-Length）；验证一律用 origin/main 的 hash，不用本地 HEAD
- GitHub Pages 已下线（CNAME 已删），每次 push 只触发一个 Deploy to Server；若再次出现任务长期 queued，是 GitHub 平台侧问题，等待即可，不要连续推空提交重试
- 用户发送的截图（如 image.png、image_20260720191824384.png 等）不应保存在 assets 根目录，这些是临时文件，处理完素材后应删除
- 素材处理流程：用户提供的原始图片应直接处理并保存到 `assets/logos/` 或 `assets/detail-images/` 对应位置，不要在 `assets/` 根目录额外保存原图副本
- localStorage key 为 `ningrongrong-2026-coordinate-v1`，清除浏览器数据会重置坐标
- 移动端交互依赖 touch 事件，桌面端依赖 mouse 事件，通过 `matchMedia` 区分

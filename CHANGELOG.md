# 更新日志

本文件记录项目所有版本变更。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。
**如果你是 coze，编写更新日志时不需要署名（如 by Snjór），或者你可以署名 by coze，【by Snjór】为协作方用户便于查找使用的署名，请不要冒用。**
**如果回退版本，也请在更新日志中标注。**

---

## [1.8.18] - 2026-07-28

### Changed — by Snjór
- 压缩 5 张重点预览大图和当前实际使用的 4 张结果卡线稿，降低交互后图片加载体积
- 为已放置 Logo 的 detail 大图增加空闲预加载，提升移动端首次点击预览大图的响应速度
- 为 detail 大图和结果卡线稿追加资源版本，避免移动端继续使用旧缓存

---

## [1.8.17] - 2026-07-28

### 修正
- 修正 3_3 焦点和 3_4 拙习的 icon 和原图配置
  - 3_3 焦点：使用正确的 icon 和原图
  - 3_4 拙习：使用正确的 icon 和原图

---

## [1.8.16] - 2026-07-28

### 新增
- 新增 3_3 位置素材：焦点
  - Logo 缩略图：assets/logos/3_3.webp (19.5 KB)
  - 预览大图：assets/detail-images/3_3.webp (293.7 KB)
- 新增 3_4 位置素材：拙习
  - Logo 缩略图：assets/logos/3_4.webp (20.1 KB)
  - 预览大图：assets/detail-images/3_4.webp (260.7 KB)
- app.js: officialNames 数组添加"焦点"、"拙习"
- ASSET_REPLACEMENT_GUIDE.md: 更新素材对应位置表

---

## [1.8.15] - 2026-07-28

### 新增
- 新增 3_2 位置素材：华光
  - Logo 缩略图：assets/logos/3_2.webp (18.6 KB)
  - 预览大图：assets/detail-images/3_2.webp (304.9 KB)
- app.js: officialNames 数组添加"华光"

### 文档
- ASSET_REPLACEMENT_GUIDE.md: 更新素材对应位置表，3_2 从"暂未命名"改为"华光"

---

## [1.8.14] - 2026-07-28

### 新增
- wrapText 函数支持 `\n` 强制换行

### 调整
- R13（风里飞絮）：在第一个句号处换行
- R15（织梦者）：在第一个句号处换行
- R16（春日信使）：在第一个句号处换行

### 修复
- `\n` 强制换行后不再重新分配字数，避免内容被分成第三行

---

## [1.8.13] - 2026-07-28

### 调整
- N 系列（R09-R12）标题和描述文案整体往下挪动（title y: 142 → 200，desc y: 232 → 290）

---

## [1.8.12] - 2026-07-28

### 调整
- N 系列（R09-R12）坐标系往右挪动（coord x: 23 → 72）

---

## [1.8.11] - 2026-07-28

### 调整
- N 系列（R09-R12）落款改为左对齐（footer x: 300 → 72）

---

## [1.8.10] - 2026-07-28

### 调整
- N 系列（R09-R12）结果解析文案改为左对齐（align: right → left）

---

## [1.8.9] - 2026-07-28

### 调整
- 调整 O 系列（R05-R08）卡片布局：坐标系、标题、描述整体上移 100px
  - coord y: 245 → 145
  - title y: 810 → 710
  - desc y: 898 → 798

---

## [1.8.8] - 2026-07-27

### Fixed
- 修复 `wrapText` 函数吞字问题：使用原始 `chars` 数组重新分配，避免字符丢失
- 修复上下行字数不一致问题：最后一行≤2 字时自动减少 `baseLength`，确保每行字数一致
- 实现中文排版避头尾规则：
  - 行首禁则：，。！？；：、）】》」』等
  - 行尾禁则：（【《「『等

### Known Issues
- **R06**（35 字）：按 16 字分行得到 16/16/3，最后一行"重生。"开头不是禁则字符，无需调整。若文案长度变化可能再次触发字数不一致。

---

## [1.8.5] - 2026-07-27

### Changed
- 统一调整结果分析文案排版：
  - 字号：42.67 → 34.67
  - 行高：61.33 → 50
  - 每行字数：14 → 17
  - 总容量：42 字 → 51 字（满足 50 字需求）
- R/O/N/G 四种格式统一参数

---

## [1.8.4] - 2026-07-27

### Changed
- 更新 16 种结果清单文案（结果名称 + 结果分析）
- 同步更新 RESULT_REPLACEMENT_GUIDE.md 中的结果清单

---

## [1.8.3] - 2026-07-27

### Changed
- 手机端署名去掉括号内容（微博/米画师），仅保留用户名

---

## [1.8.2] - 2026-07-27

### Fixed — by Snjór
- 修复三星浏览器第二次短按已放置 Logo 时，预览大图出现后被后续合成 click 事件立刻关闭的问题
- 保留移动端预览刚打开时的关闭保护，将浮层和预览图的 click 关闭也纳入保护，仅 pointerdown 作为用户主动关闭入口
- 更新静态资源版本号，确保三星浏览器预览闪退修复及时生效

---

## [1.8.1] - 2026-07-27

### Fixed — by Snjór
- 加强荣耀 / 安卓浏览器对 Logo 图片的原生菜单屏蔽，避免短按或误触时弹出保存图片、复制图片等系统操作菜单
- 将 Logo 图片、预览大图和拖拽浮层中的图片事件交给外层按钮处理，避免浏览器直接选中图片资源
- 为移动端预览大图增加短时关闭保护，避免短按已放置 Logo 时预览刚打开就被同次触控链路关闭
- 更新静态资源版本号，确保荣耀机型触控修复及时生效

---

## [1.8.0] - 2026-07-27

### Fixed — by Snjór
- 修复安卓 / 华为浏览器在待选 Logo 区长按 Logo 时触发系统"保存图片"等原生操作菜单的问题
- 修复安卓 / 华为浏览器点击坐标系内已放置 Logo 时预览大图一闪而过、并出现文本选中态的问题
- 移动端点击已放置 Logo 时保持页面变暗浮层与大图预览稳定展示，点击浮层或预览外区域关闭
- 补充 Logo 与预览图片的拖拽、长按菜单、文本选中抑制处理，不改变 iOS 当前拖动与预览体验
- 更新静态资源版本号，确保安卓触控修复及时生效

---

## [1.7.30] - 2026-07-27

### Changed — by Snjór
- 对调主页坐标系与小地图四象限颜色映射：
  - 第三象限（左下）：蓝色 → 绿色
  - 第二象限（左上）：粉色 → 蓝色
  - 第一象限（右上）：黄色（不变）
  - 第四象限（右下）：绿色 → 粉色
- 仅调整 `styles.css` 顶部 `--coord-q-*-main` 与 `--coord-q-*-soft` 的变量指向，不修改基础色数值、渐变位置、透明度或覆盖范围
- 更新静态资源版本号，确保主页坐标系颜色映射调整及时生效

---

## [1.7.29] - 2026-07-24

### Changed — by coze
- 更新结果图背景颜色与线稿文件名后缀一致：
  - R (Restrained)：蓝色 → 绿色
  - O (Orthodox)：粉色 → 蓝色
  - N (Numinous)：黄色（不变）
  - G (Gentle)：绿色 → 粉色
- 更新 share-card.js 中的 background 配置
- 更新 RESULT_REPLACEMENT_GUIDE.md 中的搭配表

---

## [1.7.28] - 2026-07-24

### Changed — by coze
- 重命名线稿文件，交换 n 和 o 前缀：
  - 原 n-lineart-* → o-lineart-*
  - 原 o-lineart-* → n-lineart-*
- 更新 share-card.js 中的 lineart 引用
- 更新 RESULT_REPLACEMENT_GUIDE.md 中的搭配表

---

## [1.7.27] - 2026-07-24

### Changed — by coze
- 修改四主倾向对应的底图（线稿）：
  - R (Restrained)：r-lineart-blue → r-lineart-green
  - O (Orthodox)：o-lineart-pink → n-lineart-blue
  - N (Numinous)：n-lineart-yellow → o-lineart-yellow
  - G (Gentle)：g-lineart-green → g-lineart-pink

---

## [1.7.26] - 2026-07-24

### Changed — by coze
- 修改主倾向系列名：
  - O: Obdurate → Orthodox
  - G: Gentled → Gentle

---

## [1.7.25] - 2026-07-23

### Changed — by coze
- 结果卡配置抽象为多个配置项（RESULT_CARD_MAPPINGS / CARD_PALETTES / CARD_LAYOUTS / LABEL_LAYOUTS / LABEL_PALETTES / LINEART_OPACITIES）
- 字体资源本地化（DM Serif Display Italic）

---

## [1.7.24] - 2026-07-23

### Changed — by coze
- 结果卡线稿透明度调整：R:64% / O:60% / N:52% / G:56%

---

## [1.7.23] - 2026-07-23

### Changed — by coze
- 结果卡英文题签字体改为 DM Serif Display Italic

---

## [1.7.22] - 2026-07-23

### Changed — by coze
- 结果卡英文题签位置五元素独立配置（首字母/主词/副词/斜线/发丝线）

---

## [1.7.21] - 2026-07-23

### Changed — by coze
- 结果卡排版位置四套独立配置（R/O/N/G）

---

## [1.7.20] - 2026-07-23

### Changed — by coze
- 结果卡背景色四套独立配置（blue/pink/yellow/green）

---

## [1.7.19] - 2026-07-23

### Changed — by coze
- 结果卡线稿资源 16 张（4 字母 × 4 颜色）

---

## [1.7.18] - 2026-07-23

### Changed — by coze
- 结果卡生成逻辑重构为配置驱动

---

## [1.7.17] - 2026-07-22

### Changed — by coze
- 结果卡主倾向标签改为完整单词（Restrained/Obdurate/Numinous/Gentled）

---

## [1.7.16] - 2026-07-22

### Changed — by coze
- 结果卡底图颜色配置更新匹配新的主倾向定义

---

## [1.7.15] - 2026-07-22

### Changed — by coze
- 结果卡底图配置更新（颜色 + 图片）匹配新的主倾向定义

---

## [1.7.14] - 2026-07-22

### Fixed — by coze
- 修复结果图生成失败问题（quadrantFor 函数返回大写 key）

---

## [1.7.13] - 2026-07-22

### Changed — by coze
- 主倾向定义更新：R=Restrained / O=Obdurate / N=Numinous / G=Gentled

---

## [1.7.12] - 2026-07-22

### Changed — by coze
- 同步 GitHub 后台最新代码

---

## [1.7.11] - 2026-07-21

### Changed — by coze
- 全局字体替换 serif → sans

---

## [1.7.10] - 2026-07-21

### Changed — by coze
- 3_1 素材更新（晨曦）

---

## [1.7.9] - 2026-07-21

### Changed — by coze
- 2_4 素材更新（幻蝶）

---

## [1.7.8] - 2026-07-21

### Changed — by coze
- H01 标题字体改为 sans

---

## [1.7.7] - 2026-07-21

### Changed — by coze
- 配置自定义域名 ningrr.fun（CNAME 文件）

---

## [1.7.6] - 2026-07-21

### Changed — by coze
- 移动端图片懒加载优化（loading="lazy"）

---

## [1.7.5] - 2026-07-21

### Changed — by coze
- 2_3 素材更新（昏晓）

---

## [1.7.4] - 2026-07-21

### Changed — by coze
- 落款文本更新：甘吉得藕 → 甘吉得橘

---

## [1.7.3] - 2026-07-21

### Changed — by coze
- 1_1 预览图更新（远航）

---

## [1.7.2] - 2026-07-21

### Added — by coze
- 创建 CHANGELOG.md 版本更新日志
- 更新 AGENTS.md 记录版本管理约束

---

## [1.7.1] - 2026-07-20

### Changed — by coze
- 发布 GitHub Pages 预览页面

---

## [1.7.0] - 2026-07-20

### Added — by coze
- 项目初始化
- 建立预览与部署链路
- 补建 AGENTS.md

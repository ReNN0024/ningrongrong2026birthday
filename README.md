# 与我周旋久 · H5

宁荣荣 2026 生日庆典预热活动的双端响应式 H5。原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

**在线体验**：https://renn0024.github.io/ningrongrong2026birthday/

**当前版本**：1.7.14

## 已实现能力

### 1. 页面结构与双端体验

- 原生静态 H5，支持 PC / Mobile 双端响应式布局，无需构建工具或第三方 CDN。
- PC 端采用三栏等高布局：左侧说明、中间坐标系、右侧素材与工具；坐标系尺寸会随屏幕宽高自适应。
- 移动端提供沉浸式操作体验，适配 iOS Safari、微信内置浏览器与 Android WebView，并对触控热区、长按反馈和预览关闭方式做了小屏优化。

### 2. 坐标摆放与编辑

- 内置 41 个 Logo 素材，支持点击放置、拖拽定位、拖回待选区、筛选未放置素材。
- 坐标系支持缩放、受约束平移、复位视角、参考线、小地图导航，以及撤销 / 重做 / 二次确认清空。
- 已放置 Logo 独立渲染并实时映射到坐标位置，页面会自动保存进度，30 天内可恢复。

### 3. 结果生成与保存

- 放置 7 个及以上 Logo 后展示「生成我的坐标」入口，生成固定 3:4 的「我的故事坐标」结果图。
- 结果由主象限 × 副倾向组合而成，共 16 种结果；结果名称与短分析集中在 `personality-results.js` 中维护。
- 结果卡按 R / O / N / G 主倾向使用不同视觉模板，并把用户真实摆放的 Logo 映射到对应卡片坐标系上。
- iOS Safari 优先调用系统分享面板保存结果图；不支持时会留在当前弹窗内展示保存指引，不跳转空白页面。

### 4. 视觉与配置能力

- 主页坐标系与小地图的四象限背景色已经抽象为 CSS 变量，位于 `styles.css` 顶部 `:root`：
  - 基础色：`--coord-pink-*`、`--coord-yellow-*`、`--coord-blue-*`、`--coord-green-*`
  - 象限映射：`--coord-q-ul-*`、`--coord-q-ur-*`、`--coord-q-ll-*`、`--coord-q-lr-*`
- 如果只是调整四象限颜色顺序，优先只修改 `--coord-q-*-main` 与 `--coord-q-*-soft` 的变量指向，不需要改渐变位置、透明度或覆盖范围。
- 结果卡的【测试结果象限、系列名、结果图背景颜色、对应线稿】集中在 `share-card.js` 顶部 `RESULT_CARD_MAPPINGS` 中配置；背景色细节与排版分别拆分在 `CARD_PALETTES` 和 `CARD_LAYOUTS` 中。
- 字体配置集中在 `fonts.css`，每条主要文案都有编号，便于按编号替换字体和字重。

### 5. 资源与性能

- 图片素材统一使用 WebP，Logo 缩略图控制在 50KB 以下，并对待选素材启用原生懒加载。
- 分享卡生成已优化资源链路：Logo 并行转换、人物线稿预热、同一摆放状态复用结果，并使用 Blob / Object URL 预览与保存。

## 目录结构

```text
index.html              主页面
fonts.css               字体配置（字体族、字重、选择器绑定）
styles.css              样式（布局、颜色、动画）
app.js                  交互逻辑
personality-results.js  16种结果名称与短分析
share-card.js           3:4结果图生成逻辑（R/O/N/G 四款结果卡模板）
.nojekyll               GitHub Pages 配置
assets/
  logos/                Logo 缩略图（41组）
  detail-images/        预览大图（41组）
  share-card-figures/   16 张结果卡线稿裁切资源
  fonts/                自定义字体文件（按需添加）
ASSET_REPLACEMENT_GUIDE.md    素材替换指南
FONT_REPLACEMENT_GUIDE.md     字体替换指南
RESULT_REPLACEMENT_GUIDE.md   结果文案替换指南
```

## 素材替换

41 组素材均采用"行_列"命名规则，覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应 WebP 即可，无需修改代码；如果拿到的是 PNG Logo，请先转换为同名 WebP，并确保 `assets/logos/` 中最终文件小于 50KB 再替换。详见 [`ASSET_REPLACEMENT_GUIDE.md`](./ASSET_REPLACEMENT_GUIDE.md)。

## 字体替换

所有文案的字体和字重配置集中在 `fonts.css` 中管理。每条文案均有唯一编号（如 H01、C01、L15），替换时只需提交需要修改的编号、新字体和新字重。详见 [`FONT_REPLACEMENT_GUIDE.md`](./FONT_REPLACEMENT_GUIDE.md)。

## 结果文案替换

16 种结果名称与短分析集中在 `personality-results.js` 中维护，结果 key 结构为「主倾向 r/o/n/g × 副倾向 thorn/flower/memory/daily」。替换时请保持 key 不变，只更新展示文案。详见 [`RESULT_REPLACEMENT_GUIDE.md`](./RESULT_REPLACEMENT_GUIDE.md)。

## GitHub Pages

本项目为纯静态站点，GitHub Pages 直接发布仓库根目录即可。仓库内保留 `.nojekyll`，避免 Pages 对下划线目录或静态资源做 Jekyll 处理。

## Credits

- 主办 / 发行 · @宁荣荣_琉璃记熠（微博）
- 网页 / 策划 · @酒起子起不来（微博）
- LOGO 绘制 · 甘吉得橘（米画师）

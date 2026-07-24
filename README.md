# 与我周旋久 · H5

宁荣荣 2026 生日庆典预热活动的双端响应式 H5。原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

**在线体验**：https://renn0024.github.io/ningrongrong2026birthday/

**当前版本**：1.7.13

## 已实现能力

- PC / Mobile 双端响应式布局
- PC 三栏等高自适应布局（`--stage-size` 统一控制坐标系与面板高度，自动适配屏幕宽高）
- 41 个 Logo 素材库，点击放至原点、拖拽精准放置、拖回待选区
- 素材库支持「全部 / 未放置」筛选，已放置 Logo 会标记状态，全部放置后展示空状态
- 撤销、重做、一键清空（二次确认，清空后仍可撤销恢复）
- 坐标缩放、受约束平移、复原与辅助线
- PC 端：外置固定工具轨（坐标系左右对称布局）、右侧视口导航小地图、悬停预览大图
- PC 端：坐标系底部细进度条，随已放置 Logo 数量实时增长
- 放置 7 个及以上 Logo 后展示「生成我的坐标」入口，可生成固定 3:4 的「我的故事坐标」结果图
- 结果图采用 16 种人格测试结果（主象限 × 副倾向），结果名称与短分析集中在 `personality-results.js` 中维护
- 主页坐标系与小地图四象限背景色通过 CSS 变量配置，常规换色只需调整变量映射顺序，不改渐变位置和透明度参数
- 结果卡片按主倾向拆分为 R / O / N / G 四套视觉模板，并把用户真实摆放的 Logo 坐标映射到对应卡片坐标系上
- 结果卡片顶部分类采用展示用英文标签（如 `R-MEMORY`、`O-BLOOM`、`G-HEARTH`），内部计算 key 保持稳定
- iOS Safari 保存结果图优先调用系统分享面板；不支持时留在当前弹窗内展示保存指引浮层，不跳转空白页面
- 移动端：长按三段式反馈（进度条→振动→Logo 浮起）、轻触预览、半透明遮罩关闭预览
- 移动端：进场操作指引隐藏后会缓慢收起并释放空间；同一页面 session 内隐藏后不因清空 Logo 再次展示，拖拽期间锁定占位避免画面抖动
- 移动端：工具栏默认轻透明，拖动后自动吸附边缘/角落；移动端隐藏全屏按钮，仅保留复位视角与参考线
- 移动端：已放置 Logo 尺寸与透明点击热区优化，提升小屏点选命中率
- 预览浮层按图片原始比例自适应（横图横向、竖图竖向）
- Logo 图层独立于 coordinate-world，按缩放比例实时渲染
- 待选 Logo 列表采用增量更新，减少预览、放置、撤销、重做时的图片重载闪烁
- Toast 采用单例原地更新机制，并对无效拖放、参考线切换、复位视角等高频反馈做去重限流
- 图片素材统一使用 WebP，并对待选素材启用原生懒加载（`loading="lazy"`）；Logo 缩略图均控制在 50KB 以下
- iOS Safari / 微信内置浏览器 / Android WebView 沉浸模式
- `localStorage` 自动保存与 30 天内自动恢复，支持旧版 Logo ID 数据迁移，并提示多页面本地进度更新
- 键盘焦点、无障碍按钮名称、最小触控热区、减少动态效果适配

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

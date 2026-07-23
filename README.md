# 与我周旋久 · H5

宁荣荣 2026 生日庆典预热活动的双端响应式 H5。原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

**在线体验**：https://renn0024.github.io/ningrongrong2026birthday/

## 已实现能力

- PC / Mobile 双端响应式布局
- PC 三栏等高自适应布局（`--stage-size` 统一控制坐标系与面板高度，自动适配屏幕宽高）
- 41 个 Logo 素材库，点击放至原点、拖拽精准放置、拖回待选区
- 素材库支持「全部 / 未放置」筛选，已放置 Logo 会标记状态，全部放置后展示空状态
- 撤销、重做、一键清空（二次确认，清空后仍可撤销恢复）
- 坐标缩放、受约束平移、复原与辅助线
- PC 端：外置固定工具轨（坐标系左右对称布局）、右侧视口导航小地图、悬停预览大图
- PC 端：坐标系底部细进度条，随已放置 Logo 数量实时增长
- 完成全部放置后展示结果出口，可生成固定 3:4 的「我的故事坐标」结果图
- 结果图采用 16 种人格测试结果（主象限 × 副倾向），结果名称与短分析集中在 `personality-results.js` 中维护
- 移动端：长按三段式反馈（进度条→振动→Logo 浮起）、轻触预览、半透明遮罩关闭预览
- 移动端：进场操作指引渐进收起；每次进入先提示，放置后变为「轻触预览 · 长按拖动」，点击「我知道了」或达到隐藏条件后渐隐隐藏
- 移动端：已放置 Logo 尺寸与透明点击热区优化，提升小屏点选命中率
- 预览浮层按图片原始比例自适应（横图横向、竖图竖向）
- Logo 图层独立于 coordinate-world，按缩放比例实时渲染
- 待选 Logo 列表采用增量更新，减少预览、放置、撤销、重做时的图片重载闪烁
- 高频 Toast 已精简，仅保留清空、复位视角、辅助线、全屏、无效拖放、恢复进度、多页面同步、重叠提示等必要反馈
- 图片素材统一使用 WebP，并对待选素材启用原生懒加载（`loading="lazy"`）
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
share-card.js           3:4结果图生成逻辑
.nojekyll               GitHub Pages 配置
assets/
  logos/                Logo 缩略图（41组）
  detail-images/        预览大图（41组）
  fonts/                自定义字体文件（按需添加）
ASSET_REPLACEMENT_GUIDE.md   素材替换指南
FONT_REPLACEMENT_GUIDE.md    字体替换指南
```

## 素材替换

41 组素材均采用"行_列"命名规则，覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应 WebP 即可，无需修改代码；如果拿到的是 PNG，请先转换为同名 WebP 再替换。详见 [`ASSET_REPLACEMENT_GUIDE.md`](./ASSET_REPLACEMENT_GUIDE.md)。

## 字体替换

所有文案的字体和字重配置集中在 `fonts.css` 中管理。每条文案均有唯一编号（如 H01、C01、L15），替换时只需提交需要修改的编号、新字体和新字重。详见 [`FONT_REPLACEMENT_GUIDE.md`](./FONT_REPLACEMENT_GUIDE.md)。

## Credits

- 主办 / 发行 · @宁荣荣_琉璃记熠（微博）
- 网页 / 策划 · @酒起子起不来（微博）
- LOGO 绘制 · 甘吉得橘（米画师）

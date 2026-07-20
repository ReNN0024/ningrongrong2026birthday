# 与我周旋久 · H5

宁荣荣 2026 生日庆典预热活动的双端响应式 H5。原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

**在线体验**：https://renn0024.github.io/ningrongrong2026birthday/

## 已实现能力

- PC / Mobile 双端响应式布局
- PC 三栏等高自适应布局（`--stage-size` 统一控制坐标系与面板高度，自动适配屏幕宽高）
- 41 个 Logo 素材库，点击放至原点、拖拽精准放置、拖回待选区
- 撤销、重做、一键清空（二次确认）
- 坐标缩放、受约束平移、复原与辅助线
- PC 端：外置固定工具轨（坐标系左右对称布局）、悬停预览大图
- 移动端：长按三段式反馈（进度条→振动→Logo浮起）、轻触预览
- 预览浮层按图片原始比例自适应（横图横向、竖图竖向）
- Logo 图层独立于 coordinate-world，按缩放比例实时渲染
- iOS Safari / 微信内置浏览器 / Android WebView 沉浸模式
- `localStorage` 自动保存与 30 天内自动恢复
- 键盘焦点、无障碍按钮名称、最小触控热区、减少动态效果适配

## 目录结构

```text
index.html              主页面
fonts.css               字体配置（字体族、字重、选择器绑定）
styles.css              样式（布局、颜色、动画）
app.js                  交互逻辑
.nojekyll               GitHub Pages 配置
assets/
  logos/                Logo 缩略图（41组）
  detail-images/        预览大图（41组）
  fonts/                自定义字体文件（按需添加）
ASSET_REPLACEMENT_GUIDE.md   素材替换指南
FONT_REPLACEMENT_GUIDE.md    字体替换指南
```

## 素材替换

41 组素材均采用"行_列"命名规则，覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应 PNG 即可，无需修改代码。详见 [`ASSET_REPLACEMENT_GUIDE.md`](./ASSET_REPLACEMENT_GUIDE.md)。

## 字体替换

所有文案的字体和字重配置集中在 `fonts.css` 中管理。每条文案均有唯一编号（如 H01、C01、L15），替换时只需提交需要修改的编号、新字体和新字重。详见 [`FONT_REPLACEMENT_GUIDE.md`](./FONT_REPLACEMENT_GUIDE.md)。

## Credits

- 主办 / 发行 · @宁荣荣_琉璃记熠（微博）
- 网页 / 策划 · @酒起子起不来（微博）
- LOGO 绘制 · 甘吉得橘（米画师）

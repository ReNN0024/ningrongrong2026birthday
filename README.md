# 与我周旋久 · H5

宁荣荣 2026 宁做我生日庆典预热活动的双端响应式 H5。项目为原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

## GitHub Pages 发布

1. 将本文件包解压后，把包内全部文件上传到 GitHub 仓库根目录。
2. 打开仓库 `Settings → Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/ (root)`，点击 `Save`。
5. 等待 GitHub Pages 完成部署后访问页面地址。

不要只上传 `index.html`；`styles.css`、`app.js` 和 `assets/` 必须保持当前相对目录结构。

后续替换 Logo 或大图时，参见 [`ASSET_REPLACEMENT_GUIDE.md`](./ASSET_REPLACEMENT_GUIDE.md)。41 组素材已全部预建为“行_列”同名路径，覆盖对应 PNG 即可，无需修改代码。

## 已实现能力

- PC / Mobile 响应式布局与 41 个 Logo 滚动素材库
- 点击素材放至原点、拖拽精准放置、拖回待选区
- 撤销、重做、一键清空二次确认
- 坐标精细放大、受约束平移、复原与辅助线；PC 使用外置固定工具轨，移动端工具条可拖动
- PC 悬停轻量预览、移动端轻触预览和点击别处关闭
- iOS Safari / 微信内置浏览器 / Android WebView 的 CSS 沉浸模式降级
- `localStorage` 自动保存与 30 天内自动恢复
- 键盘焦点、可识别按钮名称、最小触控热区及减少动态效果适配

## 目录

```text
index.html
styles.css
app.js
.nojekyll
assets/
  logos/
  detail-images/
ASSET_REPLACEMENT_GUIDE.md
```

设计交付材料位于 `h5-coordinate-delivery/`，不影响页面运行；仅部署页面时可以不上传该目录。

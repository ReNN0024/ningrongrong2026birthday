# 与我周旋久 · H5

宁荣荣 2026 生日庆典预热活动的双端响应式 H5。原生静态页面，不依赖 Node.js、构建工具或第三方 CDN。

**在线体验**：https://snjor-kii.github.io/ningrongrong2026birthday/

## 已实现能力

- PC / Mobile 双端响应式布局
- 41 个 Logo 素材库，点击放至原点、拖拽精准放置、拖回待选区
- 撤销、重做、一键清空（二次确认）
- 坐标缩放、受约束平移、复原与辅助线
- PC 端：外置固定工具轨（坐标系左右对称布局）、悬停预览大图
- 移动端：长按三段式反馈（进度条→振动→Logo浮起）、轻触预览
- 预览浮层按图片原始比例自适应（横图横向、竖图竖向）
- iOS Safari / 微信内置浏览器 / Android WebView 沉浸模式
- `localStorage` 自动保存与 30 天内自动恢复
- 键盘焦点、无障碍按钮名称、最小触控热区、减少动态效果适配

## 目录结构

```text
index.html              主页面
styles.css              样式
app.js                  交互逻辑
.nojekyll               GitHub Pages 配置
assets/
  logos/                Logo 缩略图（41组）
  detail-images/        预览大图（41组）
ASSET_REPLACEMENT_GUIDE.md   素材替换指南
```

## 素材替换

41 组素材均采用"行_列"命名规则，覆盖 `assets/logos/` 和 `assets/detail-images/` 中对应 PNG 即可，无需修改代码。详见 [`ASSET_REPLACEMENT_GUIDE.md`](./ASSET_REPLACEMENT_GUIDE.md)。

## Credits

- 主办 / 发行 · @宁荣荣_琉璃记熠（微博）
- 网页 / 策划 · @酒起子起不来（微博）
- LOGO 绘制 · 甘吉得藕（米画师）

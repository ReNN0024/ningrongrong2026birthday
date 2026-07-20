# 更新日志 · 2026-07-20

## 版本变更

| 版本 | 说明 |
|---|---|
| v1.1.0 | 替换远航 (1_1) 预览图为正式素材 |
| v1.1.1 | 修正落款文本：甘吉得藕 → 甘吉得橘 |
| v1.1.2 | 添加昏晓 (2_3) Logo 与预览图 |
| v1.1.3 | 添加 2_3 名称「昏晓」 |
| v1.2.0 | 素材库图片启用懒加载，优化移动端首次加载 |
| v1.2.1 | H01 标题字体从 serif 改为 sans |
| v1.2.2 | 添加幻蝶 (2_4) Logo 与预览图 |
| v1.2.3 | 添加幻蝶 (3_1) Logo 与预览图 |

---

## 一、布局与渲染

- **Logo 图层独立渲染**：Logo 图层从 coordinate-world 中独立，按缩放比例实时渲染，解决缩放时 Logo 模糊问题
- **PC 三栏等高自适应布局**：新增 `@media (min-width: 1024px)` 媒体查询，引入 `--stage-size` 变量统一控制坐标系与左右面板高度，自动适配屏幕宽高比

## 二、字体系统重构

- **新建 `fonts.css`**：将字体配置从 `styles.css` 中完全抽离
- **基础字体库**：定义 `--font-serif-base`、`--font-sans-base`、`--font-symbol-base` 三个基础变量
- **14 个场景变量**：按文案用途拆分（page-title / subtitle / section-label / panel-title / guide-heading / body / coordinate-title / coordinate-description / logo-name / placeholder / ui / number / credit / symbol），每个变量包含 font-family 和 font-weight
- **选择器绑定**：在 `fonts.css` 中直接通过 CSS 选择器绑定字体，后续替换字体只需修改 `:root` 变量值
- **加载顺序调整**：`fonts.css` 在 `styles.css` 之后加载，确保字体选择器具有更高覆盖优先级
- **H01 标题字体变更**：页面主标题从 serif 改为 sans

## 三、素材更新

- 替换远航 (1_1) 预览大图为正式素材
- 添加昏晓 (2_3) Logo 缩略图与预览图
- 添加幻蝶 (2_4) Logo 缩略图与预览图
- 添加幻蝶 (3_1) Logo 缩略图与预览图
- 移除多余的远航素材原图

## 四、性能优化

- 素材库图片启用懒加载（`loading="lazy"`），降低移动端首屏加载时间

## 五、部署与配置

- 初始化项目配置，建立预览与部署链路
- 合并 PR #1，更新在线体验链接
- 配置自定义域名 `ningrr.fun`（CNAME）

## 六、文档

- 新增 `CHANGELOG.md`，建立版本记录规范
- 新增 `FONT_REPLACEMENT_GUIDE.md`：字体替换指南，包含全部文案编号、当前字体/字重对照表、AI 执行规则
- 新增 `AGENTS.md`，明确素材处理流程
- 更新 `README.md`：补充目录结构、字体替换章节
- 更新 `ASSET_REPLACEMENT_GUIDE.md`：2_3 标记为「昏晓」正式素材

## 七、修复

- 修正落款文本：甘吉得藕 → 甘吉得橘

---

**贡献者**：hibikibao · snjor-kii · user8006203432（Coze）

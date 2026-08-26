# 碎片与预览图替换说明

本文档面向协作 AI 阅读，描述如何接收用户提供的 PNG 素材并完成替换，以及碎片位置调整的完整 SOP。

---

## 文档结构

- **一、素材编号规则**：位置编号与文件路径的对应关系
- **二、用户提供素材时的操作流程**：接收 PNG → 转 WebP → 替换文件
- **三、重要约束**：格式、大小、命名等硬性要求
- **四、碎片位置调整 SOP**：调整碎片位置时的完整流程（名称 + icon + 原图同步移动）
- **五、当前正式素材对应位置**：各位置的素材状态表
- **六、建议规格**：给用户参考的素材规格建议
- **七、占位图说明**：编号占位图的作用

---

## 一、素材编号规则

运行时的 46 组素材全部采用"行_列"编号，按照待选碎片面板从左到右、从上到下排列。每行 4 项：

- 第一排：`1_1`、`1_2`、`1_3`、`1_4`
- 第二排：`2_1`、`2_2`、`2_3`、`2_4`
- 依此类推，最后一项为 `11_2`

每个编号对应两个文件路径（**注意：当前格式为 WebP，不是 PNG**）：

```text
assets/logos/{行}_{列}.webp          ← 碎片缩略图（素材库中展示）
assets/detail-images/{行}_{列}.webp  ← 预览大图（悬停/轻触预览时展示）
```

## 二、用户提供素材时的操作流程

用户会提供一张 **PNG 图片**，并告知放在哪个位置（如"放到 2_3"）。

### 完整执行步骤

1. **确认位置编号**：用户会说"放到 X_Y 位置"或"替换 X_Y"。确认编号格式为 `{行}_{列}`。

2. **判断素材类型**：
   - 如果用户只提供一张图 → 同时用作碎片和预览图（分别处理尺寸）。
   - 如果用户分别提供了两张图 → 一张用于碎片，一张用于预览图。

3. **处理碎片缩略图**：
   - 所有用户提供的 PNG 格式碎片都必须转换为 WebP，不允许直接保留或提交 PNG 碎片。
   - 将 PNG 缩放到 **512×512 像素**（保持透明通道）。
   - 转换为 WebP 格式，并将最终文件压缩到 **50KB 以下**；可从 quality=85 开始，若超过 50KB，则逐步降低 quality，必要时再降低最大尺寸（如 448、384、320px）。
   - 输出路径：`assets/logos/{行}_{列}.webp`（覆盖原文件）。

4. **处理预览大图**：
   - 宽度限制为 **1200px 以内**（若原图宽度 ≤1200px 则保持原尺寸）。
   - 保持原始宽高比，不强制裁剪。
   - 转换为 WebP 格式（quality=85）。
   - 输出路径：`assets/detail-images/{行}_{列}.webp`（覆盖原文件）。

5. **验证文件已替换**：确认两个文件都已覆盖。

6. **提交并推送**：
   ```bash
   git add assets/logos/{行}_{列}.webp assets/detail-images/{行}_{列}.webp
   git commit -m "feat: 替换 {名称} ({行}_{列}) 碎片与预览图"
   git push
   ```

7. **报告结果**：告知用户已完成，列出替换的文件路径和最终文件大小。

### 代码示例（Python + Pillow）

```python
from pathlib import Path
from PIL import Image

# 假设用户提供的文件为 input.png，位置为 2_3
slot = "2_3"
img = Image.open("input.png")

# 碎片缩略图：缩放到 512x512，并压缩到 50KB 以下
# ⚠️ 必须保留 RGBA 透明通道：任何 .convert('RGB') 都会把透明区域填成黑色，
#    产出的 icon 会带黑色底（2026-08-27 6_4 事故根因）
logo = img.copy().convert("RGBA")
logo.thumbnail((512, 512), Image.LANCZOS)
for quality in (85, 80, 75, 70, 65, 60, 55, 50, 45, 40):
    output = f"assets/logos/{slot}.webp"
    logo.save(output, "WEBP", quality=quality, method=6)
    if Path(output).stat().st_size <= 50 * 1024:
        break

# 预览大图：宽度限制 1200px，保持比例
detail = img.copy()
if detail.width > 1200:
    ratio = 1200 / detail.width
    detail = detail.resize((1200, int(detail.height * ratio)), Image.LANCZOS)
detail.save(f"assets/detail-images/{slot}.webp", "WEBP", quality=85)
```

## 三、重要约束

- **文件格式必须为 WebP**，扩展名为 `.webp`。不要保存为 PNG。
- **所有用户提供的 PNG 格式碎片都必须转换为 WebP，并压缩到 50KB 以下**；推送前必须检查 `assets/logos/*.webp`，不得存在大于 50KB 的碎片文件。
- **碎片缩略图必须保留透明通道**：处理时保持 `RGBA` 模式保存 WebP；禁止 `convert('RGB')`（透明区域会被填成黑色）。处理完成后必须验证：`Image.open(f).mode == 'RGBA'` 且四角像素 alpha 为 0。
- **文件名必须严格匹配编号**（如 `2_3.webp`），不能有空格、大写或其他变体。
- **不需要修改任何代码**（app.js、HTML、CSS 均不需要改动），替换图片文件即可。
- **碎片缩略图建议保持正方形**（512×512），主体居中并保留安全边距。
- **推送前如果远程有新提交**，先执行 `git pull --rebase` 再 push。
- **碎片位置调整时的冲突处理规则**：当调整碎片 A 的位置，而目标位置已被碎片 B 占据时，先将 B 移动到从后往前数第一个空位处，再将 A 放到 B 原来的位置。若后续重新指定 B 的位置，且与 C 冲突，则同样将 C 移至当前从后往前数第一个空位处，依此类推。此规则确保每次调整只产生一次连锁位移，避免循环冲突。

## 四、碎片位置调整 SOP

当用户要求调整碎片位置时（如"将 2_2 移到 1_1"），需要同时调整**名称、icon、原图**三者，保持一一映射关系。

### 完整执行步骤

1. **确认调整方案**：
   - 读取当前 `app.js` 中的 `officialNames` 数组，确定源位置和目标位置的索引。
   - 检查目标位置是否已被其他碎片占据，若冲突则按冲突处理规则确定被挤占碎片的去向。
   - **在调整前告知用户完整的调整方案**，包括每个受影响碎片的最终位置，获得用户确认后再执行。

2. **调整名称数组**：
   - 修改 `app.js` 中的 `officialNames` 数组，将名称移动到对应索引位置。
   - 原位置若不再使用，设为空字符串 `""`。

3. **移动 icon 和原图文件**：
   - 使用 `cp` 命令复制文件（先备份，再覆盖，最后删除多余文件）。
   - **必须同时移动两个文件**：`assets/logos/{位置}.webp` 和 `assets/detail-images/{位置}.webp`。
   - 示例：将 A 移到 B 的位置
     ```bash
     # 备份 B 的原文件
     cp assets/logos/B.webp /tmp/B_logo_backup.webp
     cp assets/detail-images/B.webp /tmp/B_detail_backup.webp
     # 将 A 的文件复制到 B 的位置
     cp assets/logos/A.webp assets/logos/B.webp
     cp assets/detail-images/A.webp assets/detail-images/B.webp
     # 将 B 的原文件复制到 A 的新位置（或空位）
     cp /tmp/B_logo_backup.webp assets/logos/新位置.webp
     cp /tmp/B_detail_backup.webp assets/detail-images/新位置.webp
     # 删除 A 原位置的文件（如果 A 原位置不再使用）
     rm -f assets/logos/A.webp assets/detail-images/A.webp
     ```

4. **验证文件对应关系**：
   - 检查调整后的文件大小，确保每个位置的 icon 和原图来自同一个原始碎片。
   - 示例验证：
     ```bash
     ls -la assets/logos/1_1.webp assets/detail-images/1_1.webp
     ```
     两个文件的时间戳应一致（都是刚才复制的），大小应与源文件匹配。

5. **注意 placeholder 判断逻辑**：
   - `app.js` 中 `placeholder` 的判断条件是：`index >= officialNames.length || !officialNames[index]`
   - 当名称为空字符串时，该位置会显示占位图（灰色方块），不会尝试加载素材文件。
   - **如果某个位置不再使用，必须将 `officialNames` 中对应索引设为空字符串 `""`**，否则会出现加载异常。

6. **提交并推送**：
   ```bash
   git add app.js assets/logos/*.webp assets/detail-images/*.webp
   git commit -m "feat: 调整碎片位置 - {名称 A} 移至{位置 B}，{名称 B} 移至{位置 C}"
   git push
   ```

7. **报告结果**：告知用户调整完成，列出每个位置的最终状态（名称、icon 来源、原图来源）。

### 调整示例

**需求**：将 2_2（致绽放的你）移到 1_1，1_1 原有碎片（左满舵）移到 4_2（空位）。

**调整前状态**：
| 位置 | 名称 | icon 来源 | 原图来源 |
|------|------|----------|---------|
| 1_1 | 左满舵 | 1_1.webp | 1_1.webp |
| 2_2 | 致绽放的你 | 2_2.webp | 2_2.webp |
| 4_2 | （空） | 无 | 无 |

**调整后状态**：
| 位置 | 名称 | icon 来源 | 原图来源 |
|------|------|----------|---------|
| 1_1 | 致绽放的你 | 原 2_2.webp | 原 2_2.webp |
| 2_2 | （空） | 已删除 | 已删除 |
| 4_2 | 左满舵 | 原 1_1.webp | 原 1_1.webp |

**代码修改**：
```javascript
// 修改前
const officialNames = ["左满舵", "夜", "心动瞬间", "冲调午后", "槐花冰奶七分糖", "致绽放的你", ...];
// 修改后
const officialNames = ["致绽放的你", "夜", "心动瞬间", "冲调午后", "槐花冰奶七分糖", "", ...];
// 注意：4_2 对应 index 13，需要添加"左满舵"
const officialNames = ["致绽放的你", "夜", "心动瞬间", "冲调午后", "槐花冰奶七分糖", "", "海落潮升", "涌流幻梦之蝶", "引梦渡海", "伴生", "锋芒", "拙习", "八音", "左满舵", ...];
```

**文件操作**：
```bash
# 备份 1_1 原文件
cp assets/logos/1_1.webp /tmp/1_1_logo_backup.webp
cp assets/detail-images/1_1.webp /tmp/1_1_detail_backup.webp
# 将 2_2 的文件复制到 1_1
cp assets/logos/2_2.webp assets/logos/1_1.webp
cp assets/detail-images/2_2.webp assets/detail-images/1_1.webp
# 将 1_1 的原文件复制到 4_2
cp /tmp/1_1_logo_backup.webp assets/logos/4_2.webp
cp /tmp/1_1_detail_backup.webp assets/detail-images/4_2.webp
# 删除 2_2 的文件（不再使用）
rm -f assets/logos/2_2.webp assets/detail-images/2_2.webp
```

### 关键注意事项

- **标题、icon、原图必须保持一一映射**：调整位置时，三者必须同步移动，不能只改名字不改文件，或只改文件不改名字。
- **空位置必须清空名称**：如果某个位置不再使用，`officialNames` 中对应索引必须设为空字符串 `""`，触发 placeholder 逻辑。
- **文件操作使用 cp 而非 mv**：先用 cp 复制，验证无误后再删除原文件，避免操作失误导致文件丢失。
- **调整前必须告知用户方案**：在修改代码和文件前，先向用户说明完整的调整方案（每个碎片的最终位置），获得确认后再执行。

## 五、当前正式素材对应位置

| 位置 | 碎片名称 | 碎片 | 预览图 |
|---|---|---|---|
| `1_1` | 远航 | 正式素材 | 正式素材 |
| `1_2` | 暝夜 | 正式素材 | 编号占位图 |
| `1_3` | 心跳 | 正式素材 | 编号占位图 |
| `1_4` | 醇香 | 正式素材 | 正式素材 |
| `2_1` | 代言 | 正式素材 | 编号占位图 |
| `2_2` | 心意 | 正式素材 | 正式素材 |
| `2_3` | 昏晓 | 正式素材 | 正式素材 |
| `2_4` | 幻蝶 | 正式素材 | 正式素材 |
| `3_1` | 晨曦 | 正式素材 | 正式素材 |
| `3_2` | 华光 | 正式素材 | 正式素材 |
| `3_3` | 焦点 | 正式素材 | 正式素材 |
| `3_4` | 拙习 | 正式素材 | 正式素材 |
| `4_1`～`11_1` | 暂未命名 | 编号占位图 | 编号占位图 |

## 六、建议规格（给用户参考）

- **Logo 原图**：透明背景 PNG，建议 1024×1024 或 2048×2048，主体居中；进入项目资源后必须由 AI 转为 WebP，并压缩到 50KB 以下。
- **预览图原图**：PNG，建议 1200×750 或更大，页面使用 `object-fit: cover` 展示。
- 用户不需要自己压缩或转格式，AI 负责处理。

## 七、占位图说明

编号占位图上的文字编号同时也是文件名，用于快速核对页面位置和素材路径。替换后占位图即消失，显示正式素材。

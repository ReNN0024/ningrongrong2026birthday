# 结果文案替换说明

本文档面向协作 AI 阅读，描述如何替换「生成我的坐标」结果图中的 16 种结果文案。

---

## 一、结果文案所在文件

16 种结果统一维护在：

```text
personality-results.js
```

文件结构如下：

```js
window.PERSONALITY_RESULTS = {
  "O-thorn": {
    name: "荆棘守忆者",
    description: "你把风霜认真收藏，也把每一次坚持写进骨血。"
  }
};
```

每个结果包含两个可替换字段：

- `name`：结果名称，展示在结果图中较大的标题位置。
- `description`：结果分析，一句话短分析，展示在结果名称下方。

## 二、结果 key 规则

结果 key 由「主倾向」+「副倾向」组成，格式为：

```text
{主倾向}-{副倾向}
```

### 主倾向

| 主倾向 | 对应象限 | 英文定义 | 含义 |
|---|---|---|---|
| `R` | 荆棘 × 寻常 | **R**estrained | 偏向痛楚、日常、归于平静的力量 |
| `O` | 荆棘 × 不忘 | **O**rthodox | 偏向痛楚、坚持、记忆深处的刺 |
| `N` | 繁花 × 不忘 | **N**uminous | 偏向美好、圆满、值得珍藏的光 |
| `G` | 繁花 × 寻常 | **G**entle | 偏向日常、烟火、把美好落进生活 |

### 副倾向

副倾向在 `personality-results.js` 中仍使用内部 key；结果卡顶部展示时会转换为当前展示英文。

| 副倾向内部 key | 结果卡展示英文 | 含义 |
|---|---|---|
| `thorn` | `THORN` | 更靠近荆棘倾向 |
| `flower` | `BLOOM` | 更靠近繁花倾向 |
| `memory` | `MEMORY` | 更靠近不忘倾向 |
| `daily` | `HEARTH` | 更靠近寻常倾向 |

## 三、结果图背景与线稿搭配

结果图的搭配入口集中在 `share-card.js` 顶部的 `RESULT_CARD_MAPPINGS`。当前线稿图已裁切为 **810×1080**，与设计稿底图尺寸一致；在 SVG 中会按 `TEMPLATE_SCALE = 4 / 3` 放大到 **1080×1440**，并从分享卡片背景原点 `(0, 0)` 重合放置。线稿叠在结果卡背景上时，通过 `LINEART_OPACITIES` 按系列单独配置透明度：R 为 **64%**、O 为 **60%**、N 为 **52%**、G 为 **56%**。

目前【测试结果象限、系列名、结果图背景颜色、对应线稿】已经尽量抽象为单一配置：

- `RESULT_CARD_MAPPINGS`：后续调整搭配时优先只改这里，包括结果象限、系列名、背景颜色、线稿文件。
- `CARD_PALETTES`：只在需要新增或修改某个背景色的具体色值、光斑、文字色时才改。
- `LINEART_OPACITIES`：只在需要按 R/O/N/G 单独调整线稿叠加透明度时才改。
- `KICKER_FONT_FAMILY` / `LABEL_SUB_FONT_FAMILY` / `FONT_ASSETS`：只在需要调整结果卡顶部英文题签的主词/副词字体或本地字体文件时才改；当前首字母与主词使用本地内嵌的 DM Serif Display Italic，副词使用小型大写无衬线。
- `LABEL_LAYOUTS` / `LABEL_PALETTES`：只在需要调整英文题签的五元素位置或颜色时才改，包括首字母、主词、副词、斜线和发丝线。
- `CARD_LAYOUTS`：只在需要改变某个系列的坐标系/中文文案排版位置时才改。
- `personality-results.js`：只负责 16 个结果文案，不负责结果图背景和线稿搭配。

当前正在使用的搭配如下：

| 测试结果象限 | 系列名 | 结果图背景颜色 | 当前对应线稿预览 |
|---|---|---|---|
| 第三象限：荆棘 × 寻常（x < 0，y < 0） | **R**estrained | 绿色 `green` / `#E7F3E7` | <img src="assets/share-card-figures/r-lineart-green.webp" width="90" alt="R线稿裁切-绿色"> |
| 第二象限：荆棘 × 不忘（x < 0，y > 0） | **O**rthodox | 蓝色 `blue` / `#E2F0F8` | <img src="assets/share-card-figures/o-lineart-blue.webp" width="90" alt="O线稿裁切-蓝色"> |
| 第一象限：繁花 × 不忘（x > 0，y > 0） | **N**uminous | 黄色 `yellow` / `#F8F0D8` | <img src="assets/share-card-figures/n-lineart-yellow.webp" width="90" alt="N线稿裁切-黄色"> |
| 第四象限：繁花 × 寻常（x > 0，y < 0） | **G**entle | 粉色 `pink` / `#FAE9EF` | <img src="assets/share-card-figures/g-lineart-pink.webp" width="90" alt="G线稿裁切-粉色"> |

### 如何更换结果图搭配

#### 用户需要提供什么

如果只想更换结果图搭配，建议直接提供一张四列表格，字段如下：

| 测试结果象限 | 系列名 | 结果图背景颜色 | 对应线稿预览 |
|---|---|---|---|
| 例如：第三象限：荆棘 × 寻常（x < 0，y < 0） | 例如：**R**estrained | 例如：蓝色 / 粉色 / 黄色 / 绿色 | 例如：R线稿裁切-蓝色，或直接贴预览图 |

注意：

1. **测试结果象限**决定用户坐标落在哪个象限时，最终会归入哪个系列。
2. **系列名**必须是 R、O、N、G 开头的英文单词，用于结果卡顶部英文展示。
3. **结果图背景颜色**建议使用现有颜色名：`blue`、`pink`、`yellow`、`green`。如果要新增颜色，需要同时给出具体色值或设计稿。
4. **对应线稿预览**可以写文件名，也可以贴图；如果贴的是 PNG 新图，AI 需要先转换为 WebP 后放入 `assets/share-card-figures/`。

#### AI 收到上述指示后怎么改

AI 应优先只修改 `share-card.js` 顶部的 `RESULT_CARD_MAPPINGS`，不要改 16 个结果文案：

1. 根据用户提供的“测试结果象限”，调整对应对象的 `quadrant` 和 `quadrantLabel`：
   - 第一象限：`quadrant: "first"`，通常对应 `x >= 0 && y >= 0`
   - 第二象限：`quadrant: "second"`，通常对应 `x < 0 && y >= 0`
   - 第三象限：`quadrant: "third"`，通常对应 `x < 0 && y < 0`
   - 第四象限：`quadrant: "fourth"`，通常对应 `x >= 0 && y < 0`
2. 根据“系列名”，调整对应对象的 `seriesName`，但 `series` 仍保持为内部主倾向 key：`R` / `O` / `N` / `G`。除非用户明确要求改变内部 key，否则不要改 `personality-results.js` 的 `R-thorn` 等 key。
3. 根据“结果图背景颜色”，调整对应对象的 `background`：优先使用已有 `CARD_PALETTES` 中的 `blue` / `pink` / `yellow` / `green`。
4. 根据“对应线稿预览”，调整对应对象的 `lineart` 和 `lineartLabel`。如果用户提供新图，先把新图转成 WebP，放入 `assets/share-card-figures/`，再把 `lineart` 指向新文件名。
5. 一般不要改 `CARD_PALETTES` 和 `CARD_LAYOUTS`；只有当用户明确要求改变背景色具体色值、光斑、文字色或排版位置时才改。
6. 修改完成后，同步更新本文件的“当前正在使用的搭配”表、`README.md` 当前版本、`CHANGELOG.md`，并检查 `share-card.js` 语法。

### 可选线稿资源预览

16 张线稿都存放在 `assets/share-card-figures/`。如果后续要更换背景色与线稿搭配，优先只修改 `share-card.js` 顶部的 `RESULT_CARD_MAPPINGS`。

| 线稿名称 | 文件名 | 预览图 |
|---|---|---|
| G线稿裁切-粉色 | `g-lineart-pink.webp` | <img src="assets/share-card-figures/g-lineart-pink.webp" width="90" alt="G线稿裁切-粉色"> |
| G线稿裁切-黄色 | `g-lineart-yellow.webp` | <img src="assets/share-card-figures/g-lineart-yellow.webp" width="90" alt="G线稿裁切-黄色"> |
| G线稿裁切-蓝色 | `g-lineart-blue.webp` | <img src="assets/share-card-figures/g-lineart-blue.webp" width="90" alt="G线稿裁切-蓝色"> |
| G线稿裁切-绿色 | `g-lineart-green.webp` | <img src="assets/share-card-figures/g-lineart-green.webp" width="90" alt="G线稿裁切-绿色"> |
| N线稿裁切-粉色 | `n-lineart-pink.webp` | <img src="assets/share-card-figures/n-lineart-pink.webp" width="90" alt="N线稿裁切-粉色"> |
| N线稿裁切-黄色 | `n-lineart-yellow.webp` | <img src="assets/share-card-figures/n-lineart-yellow.webp" width="90" alt="N线稿裁切-黄色"> |
| N线稿裁切-蓝色 | `n-lineart-blue.webp` | <img src="assets/share-card-figures/n-lineart-blue.webp" width="90" alt="N线稿裁切-蓝色"> |
| N线稿裁切-绿色 | `n-lineart-green.webp` | <img src="assets/share-card-figures/n-lineart-green.webp" width="90" alt="N线稿裁切-绿色"> |
| O线稿裁切-粉色 | `o-lineart-pink.webp` | <img src="assets/share-card-figures/o-lineart-pink.webp" width="90" alt="O线稿裁切-粉色"> |
| O线稿裁切-黄色 | `o-lineart-yellow.webp` | <img src="assets/share-card-figures/o-lineart-yellow.webp" width="90" alt="O线稿裁切-黄色"> |
| O线稿裁切-蓝色 | `o-lineart-blue.webp` | <img src="assets/share-card-figures/o-lineart-blue.webp" width="90" alt="O线稿裁切-蓝色"> |
| O线稿裁切-绿色 | `o-lineart-green.webp` | <img src="assets/share-card-figures/o-lineart-green.webp" width="90" alt="O线稿裁切-绿色"> |
| R线稿裁切-粉色 | `r-lineart-pink.webp` | <img src="assets/share-card-figures/r-lineart-pink.webp" width="90" alt="R线稿裁切-粉色"> |
| R线稿裁切-黄色 | `r-lineart-yellow.webp` | <img src="assets/share-card-figures/r-lineart-yellow.webp" width="90" alt="R线稿裁切-黄色"> |
| R线稿裁切-蓝色 | `r-lineart-blue.webp` | <img src="assets/share-card-figures/r-lineart-blue.webp" width="90" alt="R线稿裁切-蓝色"> |
| R线稿裁切-绿色 | `r-lineart-green.webp` | <img src="assets/share-card-figures/r-lineart-green.webp" width="90" alt="R线稿裁切-绿色"> |

## 四、当前 16 种结果清单

| 结果编号 | 主倾向 | 副倾向 | 英文 key | 结果名称 | 结果分析 |
|---|---|---|---|---|---|
| R01 | Restrained（荆棘 × 寻常） | 荆棘 | `R-thorn` | 枷锁行僧 | 重枷压肩，长路接天。曾怨天公设樊笼，到头来方知：心为形役，身作征蓬，解脱只在一念中。 |
| R02 | | 繁花 | `R-flower` | 祈光者 | 于暗隅昂首，于寒夜掌灯。莫道微光不足恃，一点星火，也能照彻半生。 |
| R03 | | 不忘 | `R-memory` | 孤帆 | 两岸青山向后退去，前路雾色漫过船舷。孤帆万里，游过断鸿声里，行过半世萍踪。 |
| R04 | | 寻常 | `R-daily` | 鲛人泪 | 波心浸冷月，鲛珠坠水无声。莫羡珠玑贵，粒粒皆从泣泪成。 |
| R05 | Orthodox（荆棘 × 不忘） | 荆棘 | `O-thorn` | 困斗之兽 | 方寸疆土中，困兽犹斗。满身伤痕都源于无望的跋涉，所有挣扎皆化作无边的沉沦。 |
| R06 | | 繁花 | `O-flower` | 芜地新枝 | 焦黑的土层底下，亦有生机盘根。或许人间总有烈火焚不尽的美好，破土重生。 |
| R07 | | 不忘 | `O-memory` | 自囚人 | 不曾被世事枷锁拘禁，却亲手为自己圈定一方地界。余生或许会是一场刻舟求剑的画地为牢。 |
| R08 | | 寻常 | `O-daily` | 摆渡客 | 江水日夜奔流，浮沉皆是过客。须知，死生无常正是人生之常。 |
| R09 | Numinous（繁花 × 不忘） | 荆棘 | `N-thorn` | 定风铎 | 廊下铎声悠悠，阅尽人间风骤雨稠。八面横风穿万窍，岿然不动韵长留。 |
| R10 | | 繁花 | `N-flower` | 四莳岁花 | 四时轮番催花事，开落循环未有歇。谢了春红，还有冬妆。荣枯互为底色，四季皆为回答。 |
| R11 | | 不忘 | `N-memory` | 启明星 | 长夜欲曙，孤星悬天。它藏在破晓前的天幕，也刻在赶路人的心底。向着它，便能走到天明。 |
| R12 | | 寻常 | `N-daily` | 隙中白驹 | 见过春风得意马蹄疾，也历过寒雨沾衣步履迟，到如今，浮沉都成寻常事。岁月如隙中走马，倏忽便是一程。 |
| R13 | Gentle（繁花 × 寻常） | 荆棘 | `G-thorn` | 风里飞絮 | 柳絮辞别旧木，擦肩便是相逢一场。浮沉非关私意，行止尽赴天涯。 |
| R14 | | 繁花 | `G-flower` | 点金手 | 掌底藏温，化凡物为珍章。不倚天赐鸿运，自有我渡风霜、我即荣光。 |
| R15 | | 不忘 | `G-memory` | 织梦者 | 梦里揽星河入怀，醒时携清风入世。织满温柔与理想，前路自有一程晴朗。 |
| R16 | | 寻常 | `G-daily` | 春日信使 | 踏残冬余冷，衔繁花讯息遍走尘寰。四季轮转，暖意定会如期抵达人间。 |

## 五、用户提交替换文案时的推荐格式

要求用户只提交需要修改的结果，未提交的结果保持不变。

推荐格式：

| 英文 key | 新结果名称 | 新结果分析 |
|---|---|---|
| `O-flower` | 新名称 | 新的一句话结果分析。 |
| `G-daily` | 新名称 | 新的一句话结果分析。 |

也可以使用结果编号提交：

| 结果编号 | 新结果名称 | 新结果分析 |
|---|---|---|
| R06 | 新名称 | 新的一句话结果分析。 |
| R16 | 新名称 | 新的一句话结果分析。 |

## 六、替换规则

收到用户提交的新结果文案后，严格执行以下规则：

1. 根据 `英文 key` 或 `结果编号` 定位对应结果。
2. 只修改用户提交的结果；未提交的 16 种结果必须保持不变。
3. 只修改 `personality-results.js` 中对应对象的：
   - `name`
   - `description`
4. 不要修改 key 名称，除非用户明确要求调整结果分类体系。
5. 不要修改 `share-card.js` 的结果计算逻辑，除非用户明确要求更改分类规则。
6. 结果名称建议控制在 4～8 个中文字符，避免结果图标题过长。
7. 结果分析建议保持一句话，长度尽量控制在 28 个中文字符以内；过长会在结果图中自动换行，但可能影响画面留白。
8. 文案中如需使用英文引号或代码字符串，代码文件里必须使用 ASCII 直引号。
9. 修改后运行 JavaScript 语法检查：

```bash
/Users/hibikibao/.workbuddy/binaries/node/versions/22.12.0/bin/node --check personality-results.js
```

10. 如本次修改需要上线，更新 `CHANGELOG.md` 和 `index.html` 中的静态资源版本号，提交并推送。

## 七、AI 执行 Prompt

收到用户提交的「英文 key / 结果编号｜新结果名称｜新结果分析」后，按以下流程执行：

1. 先读取本文档和 `personality-results.js`。
2. 校验用户提交的 key 或编号是否存在于 16 种结果中。
3. 如果 key 或编号不存在，先向用户指出无效项并暂停，不要猜测替换目标。
4. 如果用户只提供新名称，则只替换 `name`，保留原 `description`。
5. 如果用户只提供新分析，则只替换 `description`，保留原 `name`。
6. 如果用户同时提供新名称和新分析，则两个字段都替换。
7. 替换完成后检查 `personality-results.js` 语法。
8. 最终只报告已替换的结果 key、结果名称和结果分析，不要复述未修改的结果。

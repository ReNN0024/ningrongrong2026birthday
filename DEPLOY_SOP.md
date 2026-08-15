# GitHub Actions 自动部署 SOP

> 本文档沉淀自 2026-08-15 首次配置自动部署的实战经验，用于后续快速复用和避坑。

---

## 一、环境准备

### 1.1 SSH 密钥生成（Windows）

```cmd
# 使用 %USERPROFILE% 而非 ~/.ssh/
ssh-keygen -t ed25519 -C "github-actions" -f "%USERPROFILE%\.ssh\github_actions_ed25519"
```

**避坑点：**
- Windows 下 `~/.ssh/` 路径不解析，必须用 `%USERPROFILE%\.ssh`
- 如果 `.ssh` 目录已存在，直接生成密钥即可，无需重新创建目录

### 1.2 服务器配置

```bash
# 在服务器上添加公钥
cat ~/.ssh/authorized_keys
# 将本地公钥内容追加到服务器
```

### 1.3 GitHub Secrets 配置

在仓库 **Settings → Secrets and variables → Actions** 中添加：
- `SSH_PRIVATE_KEY`：本地私钥内容（`%USERPROFILE%\.ssh\github_actions_ed25519` 文件内容）

**避坑点：**
- 不要创建 `SERVER_HOST` secret，直接在 deploy.yml 中硬编码 IP 更简单
- 私钥必须完整复制，包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和结尾行

---

## 二、deploy.yml 配置

### 2.1 标准模板

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avz --delete --exclude='.git' --exclude='.github' --exclude='*.md'
          path: ./
          remote_path: /var/www/html/
          remote_host: 115.191.2.56
          remote_user: root
          remote_port: 22
          remote_key: ${{ secrets.SSH_PRIVATE_KEY }}
```

**避坑点：**
- ✅ **必须硬编码 `remote_host`**，不要用 `${{ secrets.SERVER_HOST }}`（容易忘记创建 secret）
- ✅ **必须添加 `--exclude='.git'`**，否则同步 .git 目录会导致部署卡住（6+ 分钟）
- ✅ **首次 SSH 连接会要求确认主机密钥**，需在 rsync 参数中添加 `-o StrictHostKeyChecking=no`（如遇到卡住）
- ✅ **只监听 `main` 分支**，避免 main/master 双分支混乱

---

## 三、分支管理

### 3.1 黄金法则：**只用一个分支**

```cmd
# 永远只用 main 分支
git checkout main
git add .
git commit -m "描述改动"
git push
```

**避坑点：**
- ❌ 不要同时维护 `main` 和 `master` 两个分支
- ❌ 不要用 `git push origin master:main` 这种跨分支推送（容易混乱）
- ✅ GitHub 默认分支是 `main`，本地也统一用 `main`
- ✅ 如果已有 `master` 分支，在 GitHub 网页上删掉（分支切换器 → 垃圾桶图标）

### 3.2 分支切换器位置

GitHub 仓库页面左上角，显示当前分支名的下拉菜单。

---

## 四、推送与部署验证

### 4.1 推送流程

```cmd
git add .
git commit -m "描述改动"
git push
```

### 4.2 验证部署

1. 进仓库 → **Actions** → 查看 "Deploy to Server" 运行状态
2. 绿色 ✅ = 部署成功，访问 `http://115.191.2.56/` 验证
3. 红色 ❌ = 部署失败，点击查看详情

### 4.3 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Actions 没有新记录 | 推送到错误分支（如 master） | 确保推送到 `main` 分支 |
| 部署卡住 6+ 分钟 | 同步了 .git 目录 | 添加 `--exclude='.git'` |
| "Could not resolve hostname" | `remote_host` 为空 | 硬编码 IP 地址 |
| "Password authentication is not supported" | GitHub 不支持密码推送 | 使用 Personal Access Token |
| "remote rejected" (deploy.yml) | Token 缺少 `workflow` 权限 | 重新生成带 `repo` + `workflow` scope 的 Token |
| 推送失败 "Connection was reset" | 网络问题 | 等待后重试，或直接在 GitHub 网页编辑 |

---

## 五、Personal Access Token 配置

### 5.1 生成 Token

1. GitHub → 头像 → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. 点 **Generate new token (classic)**
3. 勾选权限：`repo`（全选）、`workflow`
4. 生成后复制 Token

### 5.2 使用 Token 推送

```cmd
git remote set-url origin https://<TOKEN>@github.com/<USER>/<REPO>.git
git push
```

或直接在推送时输入 Token 作为密码。

**避坑点：**
- Token 必须包含 `workflow` 权限，否则无法推送 `.github/workflows/` 下的文件
- Token 只显示一次，立即保存

---

## 六、浏览器缓存问题

### 6.1 症状

代码已更新，但网页显示旧版本（如"八音"显示为"4_1"）。

### 6.2 解决方案

- **强制刷新**：`Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）
- **清缓存**：浏览器设置 → 清除浏览数据 → 缓存的图片和文件
- **无痕模式**：打开无痕/隐私窗口访问，验证是否缓存问题

---

## 七、快速检查清单

每次推送前确认：

- [ ] 当前分支是 `main`（`git branch` 查看）
- [ ] `deploy.yml` 中 `remote_host` 是硬编码 IP
- [ ] `deploy.yml` 中 `branches: [main]` 监听正确分支
- [ ] GitHub Actions 页面能看到新的部署运行
- [ ] 部署成功后访问服务器 URL 验证

---

## 八、本次实战时间线

| 时间 | 事件 | 教训 |
|------|------|------|
| 15:30 | 生成 SSH 密钥 | Windows 用 `%USERPROFILE%` 而非 `~` |
| 15:35 | 配置 GitHub Secrets | 不要创建多余的 `SERVER_HOST` secret |
| 15:40 | 首次推送 deploy.yml | Token 需要 `workflow` 权限 |
| 15:45 | 首次部署卡住 6+ 分钟 | 必须排除 `.git` 目录 |
| 15:50 | 第二次部署成功（22 秒） | ✅ 正确配置 |
| 16:00 | 新增"八音"碎片 | 代码正确，但部署未触发 |
| 16:05 | 推送到 master 分支 | Actions 只监听 main，不触发 |
| 16:10 | 尝试推送到 main | 网络问题失败 |
| 16:15 | 直接在 GitHub 编辑 deploy.yml | 硬编码主机名 |
| 16:20 | 推送成功，部署触发 | ✅ 统一使用 main 分支 |

---

## 九、后续维护

- 新增碎片：只需覆盖 `assets/logos/` 和 `assets/detail-images/` 中的同名 WebP 文件
- 修改配置：直接编辑 `deploy.yml`，推送到 `main` 自动部署
- 查看日志：GitHub → Actions → 点击运行记录 → 查看日志

---

**文档版本**：v1.0  
**最后更新**：2026-08-15  
**维护者**：项目团队

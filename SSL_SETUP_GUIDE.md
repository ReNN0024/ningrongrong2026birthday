# SSL 证书配置指南（Let's Encrypt + Certbot + Nginx）

> 适用域名：`ningrr.fun` / `www.ningrr.fun`
> 服务器：Ubuntu + Nginx 1.18（115.191.2.56）
> 预计耗时：5 分钟

---

## 前置条件

1. SSH 登录到服务器：
   ```bash
   ssh root@115.191.2.56
   ```

2. 确认 Nginx 正在运行：
   ```bash
   sudo systemctl status nginx
   ```

3. 确认防火墙已开放 443 端口（如果有的话）：
   ```bash
   # 如果用 ufw
   sudo ufw allow 443/tcp

   # 如果用 iptables
   sudo iptables -L -n | grep 443
   ```

4. **火山引擎安全组**：登录火山引擎控制台 → 云服务器 → 安全组 → 入站规则 → 确认已放行 **TCP 443** 端口（和 80 端口一样）。

---

## 第一步：安装 Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

验证安装：
```bash
certbot --version
```

---

## 第二步：申请证书并自动配置 Nginx

一条命令搞定（同时覆盖 `ningrr.fun` 和 `www.ningrr.fun`）：

```bash
sudo certbot --nginx -d ningrr.fun -d www.ningrr.fun
```

执行过程中会提示：

1. **Enter email address**：输入你的邮箱（用于证书到期提醒）
2. **Agree to terms**：输入 `Y` 回车
3. **Share email with EFF**：输入 `N` 回车（可选）

成功后会显示：
```
Congratulations! You have successfully enabled
https://ningrr.fun and https://www.ningrr.fun
```

---

## 第三步：验证

```bash
# 测试 HTTPS 是否生效
curl -sI https://ningrr.fun/ | head -5
curl -sI https://www.ningrr.fun/ | head -5
```

应该看到 `HTTP/2 200` 或 `HTTP/1.1 200`。

同时在手机浏览器访问：
- `https://ningrr.fun` ✅
- `https://www.ningrr.fun` ✅
- `ningrr.fun`（应自动跳转到 https）✅

---

## 第四步：确认自动续签

Let's Encrypt 证书有效期 90 天，certbot 会自动设置定时任务续签。

验证自动续签是否正常：
```bash
sudo certbot renew --dry-run
```

看到 `Congratulations, all simulated renewals succeeded` 就没问题。

---

## Certbot 做了什么（原理说明）

1. 在 `/etc/letsencrypt/live/ningrr.fun/` 下生成证书文件
2. 修改了你的 Nginx 配置（`/etc/nginx/sites-available/` 下对应文件），增加：
   - 监听 443 端口的 server block
   - SSL 证书路径引用
   - HTTP → HTTPS 的 301 跳转
3. 自动 reload Nginx

---

## 后续维护

| 操作 | 命令 |
|------|------|
| 查看证书状态 | `sudo certbot certificates` |
| 手动续签 | `sudo certbot renew` |
| 删除证书 | `sudo certbot delete --cert-name ningrr.fun` |
| 查看 Nginx 配置 | `cat /etc/nginx/sites-available/*` |

---

## 常见问题

### Q: 443 端口不通？
检查火山引擎安全组是否放行了 TCP 443 入站。这是最常见的原因。

### Q: certbot 报 "Connection refused"？
同上，安全组或防火墙未开放 443。

### Q: 证书到期没自动续签？
检查 cron/timer：
```bash
sudo systemctl status certbot.timer
```
如果没运行：
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Q: 想强制使用 HTTP/2？
certbot 默认会配置 HTTP/2，如果没生效，在 Nginx 配置中确认：
```nginx
listen 443 ssl http2;
```

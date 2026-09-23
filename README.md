# flclash-adblock

一套「**一次配置，永久稳定**」的去广告规则集流水线，专为 **FlClash / mihomo** 设计。

解决的核心痛点：直接引用第三方规则集的 raw 地址，**上游一改名/换路径就静默失效**。
本方案把规则**构建成你自己的产物、发布到你自己仓库的固定地址**，从此 URL 永不失效。

---

## 它做什么

```
anti-AD  (纯域名表)  ┐
                     ├─→ 合并去重 → mihomo convert-ruleset → adblock.mrs
REIJI007 (payload)   ┘                                          │
                                                                ▼
                                    GitHub Release 固定地址（你的仓库）
                                                                │
                                                                ▼
                                             FlClash 覆写脚本引用该地址
```

- **主**：anti-AD —— 误杀低、针对国内优化。
- **辅**：REIJI007 —— 覆盖广、更新勤（20 分钟一更）。
- 两者合并成**一个** `.mrs`，FlClash 里只需挂**一条**规则。
- 上游怎么折腾都影响不到你：你只依赖**自己的 Release**.

> ⚠️ 本方案是**域名级拦截**（把广告域名路由到 `REJECT`）。
> 它能干掉绝大多数广告请求、弹窗、追踪、开屏广告的素材下载；
> 但**对「摇一摇广告」无效**（那是本地传感器触发，不走网络）。
> 也**做不到** AdGuard 那种解密 HTTPS + 隐藏网页广告元素的「美化过滤」。

---

## 目录结构

```
flclash-adblock/
├── .github/workflows/build.yml   # GitHub Actions：定时构建 + 发布 Release
├── scripts/build.py              # 核心构建脚本（合并去重 + 转 mrs）
├── flclash-override.js           # 粘到 FlClash 的覆写脚本
├── whitelist.txt                 # 白名单：剔除误杀域名
└── dist/                         # 构建产物（adblock.mrs / adblock.txt）
```

---

## 一、部署到你自己的 GitHub（一次性）

1. **建仓库**：在 GitHub 新建一个 **Public** 仓库（公开仓库的 Actions 才免费不限量），
   例如叫 `flclash-adblock`。

2. **上传文件**：把本目录的 `.github/`、`scripts/`、`flclash-override.js`、`whitelist.txt`
   推上去（`.github` 是隐藏目录，别漏）。
   ```bash
   git init
   git add -A
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/你的用户名/flclash-adblock.git
   git push -u origin main
   ```

3. **开许可**：仓库 → `Settings → Actions → General → Workflow permissions`，
   选 **Read and write permissions**（发布 Release 需要写权限），保存。

4. **跑起来**：仓库 → `Actions` → 左侧 `Build adblock ruleset` → `Run workflow`。
   第一次跑完，去 `Releases` 页面就能看到 tag 为 `ruleset` 的发布，
   里面有 `adblock.mrs` 和 `adblock.txt`。

5. **你的稳定地址**（把 `你的用户名` 换掉）：
   ```
   https://github.com/你的用户名/flclash-adblock/releases/download/ruleset/adblock.mrs
   ```

---

## 二、在 FlClash 里启用

1. 打开 FlClash → **进阶配置 → 脚本（覆写脚本）**。
2. 粘贴 `flclash-override.js` 的内容，**把 `OWNER/REPO` 改成你的用户名/仓库名**。
3. 保存 → 回到主页**重新连接**。
4. 在 `规则` 页面应能看到 `my-adblock` 规则集，且规则表顶部有
   `RULE-SET,my-adblock,REJECT`。

---

## 三、本地手动构建（可选）

想在电脑或 Termux 里手动跑：

```bash
# 1. 下载 mihomo 内核（按你的系统选对应版本）
#    https://github.com/MetaCubeX/mihomo/releases
# 2. 构建
python3 scripts/build.py --mihomo ./mihomo --out-dir dist
```

更多参数：

| 参数 | 说明 |
|---|---|
| `--no-reiji` | 只用 anti-AD（更保守，误杀更少） |
| `--no-mrs` | 只产出 `adblock.txt`，不调用 mihomo |
| `--min-entries N` | 安全阈值，默认 20000；低于此数直接报错退出 |
| `--whitelist 文件` | 指定白名单文件 |
| `--antiad-url URL` | 覆盖 anti-AD 地址（可重复，用于源迁移） |
| `--reiji-url URL` | 覆盖 REIJI007 地址（可重复） |

---

## 四、修正误杀（白名单）

某个正常网站/App 被误拦时：

1. 把它的域名写进 `whitelist.txt`（一行一个）。
2. `git push`（或手动 `Run workflow`）。
3. 等 Actions 重新构建发布，FlClash 到点会自动拉到新规则集。

---

## 五、常见问题

**Q：改了上游地址怎么办？**
用 `--antiad-url` / `--reiji-url` 覆盖即可；或者直接在 `build.py` 顶部的
`DEFAULT_ANTIAD` / `DEFAULT_REIJI` 列表里换新的。**你的 Release 地址始终不变。**

**Q：为什么不用 `releases/latest`？**
本方案用固定 tag `ruleset`，地址是
`releases/download/ruleset/adblock.mrs`，比 `latest` 更可控。

**Q：构建失败 / 规则数骤降？**
`build.py` 有 `--min-entries` 保护：条目数低于阈值会**直接失败**，
不会发布半成品把你现有的拦截清空。看 Actions 日志定位是哪个源挂了。

**Q：能治摇一摇广告吗？**
不能。摇一摇是本地传感器触发，不走网络，域名拦截无能为力。
需要各 App 自带的「关闭摇一摇」开关，或 root / LSPosed 方案。

**Q：FlClash 的 mihomo 也支持直接读文本规则吗？**
支持（`format: text` / `yaml`），但 `.mrs` 加载更快、体积更小，故首选 mrs。

---

## 六、许可与来源

- anti-AD：https://github.com/privacy-protection-tools/anti-AD
- REIJI007：https://github.com/REIJI007/AdBlock_Rule_For_Clash
- mihomo：https://github.com/MetaCubeX/mihomo

规则内容版权归各上游项目所有，请遵循其许可。

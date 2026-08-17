# 三形连锁棋（D:\codex）项目记忆

## Git 推送与部署（重要，别忘）

1. **沙箱用户问题**：本地沙箱以 `CodexSandboxOffline` 运行，读不到真实用户 `ikun` 的系统证书/GitHub 凭据。沙箱内 `git push` 会报 `schannel: SEC_E_NO_CREDENTIALS`。**推送与访问 GitHub 网络一律用 `require_escalated` 非沙箱执行**。
2. **分支**：本地默认分支 `master` 跟踪远端 `main`；GitHub Pages 只部署 `main`。仓库本地已配 `push.default=upstream`，直接 `git push` 即可，**不要** `git push origin master`（会误建远端 master）。
3. **流程**：沙箱内 `git add` + `git commit`（中文提交信息）→ 非沙箱 `git push` → `git ls-remote --heads origin` 确认只有 `main` → 查 GitHub Actions runs 确认 Deploy 成功 → 请求 `https://ikun1314888.github.io/Three/` 校验含新标识符。
4. 详细流程见技能 `$sanxing-git-push`（C:\Users\ikun\.codex\skills\sanxing-git-push）。

## 工程要点

- 单文件游戏：`D:\codex\index.html`（HTML+CSS+内联 PeerJS+Cloudflare Worker 学习上报），改动仅限该文件。
- 测试脚本放 `D:\codex\.tmp-work\`，不提交。
- 联机：PeerJS 公共信令；学习数据后端（CloudBase 云函数 + 云数据库，原 workers.dev 因国内不可达已弃用）：`https://three-d6ggbjqi55fd47560-1469881280.ap-shanghai.app.tcloudbase.com/sanxing-ai`（云函数 `sanxing-ai`，集合 `ai_global`，权限 ADMINONLY）。

## CloudBase 学习后端运维（2026-08 接入）

- 环境 `three-d6ggbjqi55fd47560`（ap-shanghai，体验版，3000 资源点/月，过期 2027-02-17）；云函数 `sanxing-ai`（Nodejs18.15 事件函数，handler index.main）；数据库集合 `ai_global`（ADMINONLY，单文档 id=`global`）。
- HTTP 网关路由 `/sanxing-ai` → 云函数；接口 `GET /profile`、`POST /report`，与旧 Worker 完全兼容，前端只改 `AI_PROFILE.endpoint`。
- CLI：`npm i -g @cloudbase/cli` 已装且已登录；Windows 下用 `tcb.cmd` 绕过 PowerShell 脚本限制。
- 部署：本地 `npm install --omit=dev` 装好依赖后，`tcb fn deploy sanxing-ai --force --deployMode cos`（zip 超 1.5MB 会被拒；云端 installDependencies 不可靠，务必本地装好依赖上传）。
- 坑：云函数 `ensureDoc()` 必须"先查后建"，`.set()` 是覆盖写，否则每次上报会清空聚合（已修复）。

# 三形连锁棋（D:\codex）项目记忆

## Git 推送与部署（重要，别忘）

1. **沙箱用户问题**：本地沙箱以 `CodexSandboxOffline` 运行，读不到真实用户 `ikun` 的系统证书/GitHub 凭据。沙箱内 `git push` 会报 `schannel: SEC_E_NO_CREDENTIALS`。**推送与访问 GitHub 网络一律用 `require_escalated` 非沙箱执行**。
2. **分支**：本地默认分支 `master` 跟踪远端 `main`；GitHub Pages 只部署 `main`。仓库本地已配 `push.default=upstream`，直接 `git push` 即可，**不要** `git push origin master`（会误建远端 master）。
3. **流程**：沙箱内 `git add` + `git commit`（中文提交信息）→ 非沙箱 `git push` → `git ls-remote --heads origin` 确认只有 `main` → 查 GitHub Actions runs 确认 Deploy 成功 → 请求 `https://ikun1314888.github.io/Three/` 校验含新标识符。
4. 详细流程见技能 `$sanxing-git-push`（C:\Users\ikun\.codex\skills\sanxing-git-push）。

## 工程要点

- 单文件游戏：`D:\codex\index.html`（HTML+CSS+内联 PeerJS+Cloudflare Worker 学习上报），改动仅限该文件。
- 测试脚本放 `D:\codex\.tmp-work\`，不提交。
- 联机：PeerJS 公共信令；学习数据 Worker：`https://sanxing-ai.2332734249.workers.dev`。

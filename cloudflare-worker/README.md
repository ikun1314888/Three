# 三形连锁棋 · 全局学习聚合 Worker

免费版 Cloudflare Worker + KV，用于收集所有玩家的匿名对局统计并聚合出"全局画像"，供随机匹配的成长型人机模仿。

## 部署步骤（一次性，约 3 分钟）

1. 注册/登录 [Cloudflare](https://dash.cloudflare.com)（免费）。
2. 本地安装 Node.js 后，在此目录执行：
   ```bash
   npm i -g wrangler
   wrangler login          # 浏览器授权
   wrangler kv namespace create AI_KV   # 输出 Namespace ID
   ```
3. 把上一步输出的 **Namespace ID** 填进 `wrangler.toml` 的 `id = "..."`。
4. 部署：
   ```bash
   wrangler deploy
   ```
   完成后会输出你的 Worker 地址，形如 `https://sanxing-ai.<子域>.workers.dev`。

> 也可以不用命令行：在 Cloudflare 控制台 `Workers & Pages → 创建 Worker`，把 `src/index.js` 内容粘贴进去，再在 Settings → KV 里绑定名为 `AI_KV` 的命名空间（先创建 KV 命名空间）。

## 接入前端

把部署得到的地址填到 `index.html` 中 `AI_PROFILE.endpoint`（形如 `https://sanxing-ai.xxx.workers.dev`，**不要带末尾斜杠**）。前端会在对局结束后匿名上报本局统计，并定期拉取 `/profile` 作为人机风格数据源；接口不可达时自动降级为纯本地学习，不影响游戏。

## 数据说明

- 仅收集匿名统计：三种棋子使用次数、首手类型、落子离中心距离之和/次数、攻防走法计数、思考时间样本（上限 400 条）、胜负结果。
- 不含任何账号、昵称、设备标识等个人信息。
- 无鉴权写接口（任何玩家可上报），服务端对字段做了上限校验；若担心被刷，可在 Worker 里加 Cloudflare 限流规则。

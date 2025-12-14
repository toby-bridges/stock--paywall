# 24h Stock Wall (v0.3) — Sponsor Proof Upload + Admin Review + Dual Theme

**作业/MVP定位：**
- 赞助墙是必选项（BMC / 微信支付宝二维码）
- 不接真实支付 API
- 用户上传赞助截图 → pending → Admin 审核通过 → 开始 24h 冷却倒计时 → 解锁当日股票价格与榜单
- 两套 UI：玻璃版（美股绿涨红跌）/ 长辈版（A股红涨绿跌），同一套组件只换主题

## 运行
```bash
npm i
npm run dev
```

## 环境变量
复制 `.env.example` 为 `.env.local`

## Supabase 初始化
把 `supabase.sql` 复制到 Supabase SQL Editor 执行。

## 使用流程
1) 用户：注册/登录 → `/sponsor` 上传截图（pending）
2) 你：打开 `/admin`，输入 ADMIN_TOKEN → 点击「批准并开始24h」
3) 用户：到 `/dashboard` 看到倒计时，24h 后看到数据

> 注：为了快速交付，截图以 base64 写入表 `sponsor_proofs.image_base64`（demo 用）。

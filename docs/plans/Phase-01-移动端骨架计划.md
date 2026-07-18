# Phase 01：移动端骨架计划

## 1. 阶段目标

建立 `mom-mobile` 的工程、平台、API、离线和设计交付基础，使后续页面不是直接堆叠 uni-app API 和临时网络请求。

## 2. 当前基础

已经具备：

- Node 22、pnpm 11.7。
- uni-app Vue 3、TypeScript、Vite、Pinia。
- H5 开发和构建脚本。
- Mobile CI。
- 首页、收货、上架、领料、发运和离线页面骨架。
- Scanner、Network、Storage Adapter。
- Gateway Request Client。
- 幂等键生成。
- 离线命令入队、持久化列表、删除和手工重试。

## 3. Slice 01：工程门禁

任务：

- 锁定 DCloud 匹配版本。
- 保持冻结锁文件安装。
- 执行目录边界校验。
- Type Check 和 H5 Build。
- 增加文档链接检查。

验收：

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm type-check
pnpm build:h5
```

全部通过。

## 4. Slice 02：应用 Shell 与会话

任务：

- 首页任务工作台。
- 当前用户、工厂和网络状态。
- OAuth2.1/OIDC 登录接入方案。
- 会话过期、退出和账号切换。
- 应用版本和设备诊断入口。

验收：

- 未登录无法进入业务页。
- 会话过期不丢失未提交表单。
- 切换账号后清理会话缓存。

## 5. Slice 03：平台适配器

任务：

- 完善 Scanner Adapter。
- 完善 Network Adapter。
- 完善 Storage Adapter。
- 增加 Feedback Adapter。
- 预留 Printer Adapter。
- 提供 Fake Adapter 用于 H5 与测试。

验收：

- 页面不直接调用 `uni.scanCode` 或存储 API。
- H5 可使用 Fake Adapter 演示扫码结果。
- 厂商 SDK 接入不修改页面流程。

## 6. Slice 04：Gateway API Client

任务：

- 统一 Base URL。
- Bearer Token。
- Factory Context。
- correlation ID。
- idempotency key。
- 超时和错误标准化。
- 401、403、409、429 和 5xx 处理。

验收：

- 页面不直接调用 `uni.request`。
- 错误对象包含业务码和 correlation ID。
- 写命令重试保持原幂等键。

## 7. Slice 05：离线命令状态机

目标状态：

```text
PENDING
→ SYNCING
→ COMPLETED
   ├── FAILED_RETRYABLE
   ├── CONFLICT
   ├── UNKNOWN_RESULT
   ├── MANUAL_REQUIRED
   └── CANCELLED
```

任务：

- 扩展命令类型和状态。
- 同步锁和单命令串行执行。
- 指数退避。
- 最大重试和下一次执行时间。
- 服务端状态查询。
- 冲突快照。
- 人工处理动作。

验收：

- 应用重启后状态保留。
- 同一命令不会并发同步。
- 409 不自动无限重试。
- 超时不直接判定业务失败。

## 8. Slice 06：设计系统和组件

任务：

- 工业移动端颜色、字号、间距和状态 Token。
- 大触控按钮。
- 扫描输入组件。
- 网络徽标。
- 操作卡片。
- 命令状态组件。
- 错误和人工接管组件。

验收：

- 页面不重复实现网络和离线提示。
- 同类业务状态视觉一致。
- 小屏和戴手套场景可操作。

## 9. Slice 07：测试与诊断

任务：

- Adapter 单元测试。
- 离线状态机测试。
- API 错误映射测试。
- H5 页面状态测试。
- 断网、重启、冲突和重复命令测试。
- 应用版本、设备和关联 ID 诊断。

## 10. 不在本阶段完成

- 全部正式业务页面。
- 多厂商 PDA SDK。
- 正式 Android 上架渠道。
- 复杂 MDM 设备管理。
- 后台无限常驻同步。

## 11. 完成定义

- 工程门禁通过。
- 会话、平台、API 和离线边界明确。
- 离线状态机有测试。
- 原型与 API 映射模板可用。
- 当前能力和待实现内容在 README 中准确呈现。

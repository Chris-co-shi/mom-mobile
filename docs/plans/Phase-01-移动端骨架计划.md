# Phase 01：移动端骨架计划

## 1. 阶段状态

- 状态：**Foundation Complete / P1.5 S11 Auth Runtime Complete**
- 后续安全阶段：[P1.5 Mobile 认证与授权实施计划](P1.5-Mobile认证授权实施计划.md)

> Mobile Phase 01 已完成工程、页面、平台适配器、Gateway Request Client 和基础离线命令骨架，但未完成正式 Android OAuth/OIDC Auth Runtime。

## 2. 阶段目标

建立 `mom-mobile` 的工程、平台、API、离线和设计交付基础，使后续页面不直接堆叠 uni-app API、临时网络请求或不受控本地存储。

## 3. 已完成基础

- Node 22、pnpm 11.7。
- uni-app Vue 3、TypeScript、Vite、Pinia。
- H5 开发、构建和 Mobile CI。
- 首页、收货、上架、领料、发运和离线页面骨架。
- Scanner、Network、Storage Adapter。
- Gateway Request Client。
- 幂等键生成。
- 离线命令入队、持久化列表、删除和手工重试基础。

## 4. 尚未完成

以下能力统一进入 P1.5 S11：

- `mom-mobile-pda` 正式 Public Client。
- 仅允许 `INTERNAL` + Mobile Access 的应用入口。
- 系统浏览器 Authorization Code + PKCE S256 + OIDC。
- HTTPS App Link。
- 可恢复 PKCE 一次性事务。
- Access Token 内存管理。
- Refresh Token Android 安全存储。
- Single Flight Refresh 和本地原子替换。
- 冷启动、前后台和 Session 撤销恢复。
- `/api/iam/me` 与 Permissions/Factory/Mobile Access Context。
- 离线命令完整 user/sid/client/factory/party/permission 归属。
- Android 真机安全 E2E。

## 5. 原 Phase 01 Slice 解释

### Slice 01：工程门禁

持续使用：

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm type-check
pnpm build:h5
```

### Slice 02：应用 Shell 与会话

应用 Shell 和基础页面已具备；OAuth 登录、Token、Session、账号切换和 Mobile Access 尚未实现，由 P1.5 S11 替代。

### Slice 03：平台适配器

Scanner、Network、普通 Storage 已有基础。P1.5 S11 新增 Browser/App Link、Auth Secure Storage 和 PKCE Transaction Adapter。

### Slice 04：Gateway API Client

已有 Request Client 基础。P1.5 S11 补齐：

- 内存 Bearer Token。
- Single Flight 401 恢复。
- 每请求最多一次自动重试。
- 403 不刷新。
- 404 防枚举、409、429 和结果未知。
- `X-Factory-Id` 只作为工作上下文。

### Slice 05：离线命令状态机

已有基础入队与持久化。正式状态机和自动同步仍待后续实现；P1.5 S11 先补齐用户、Session、Client、Factory、Party 和 Permission 归属门禁。

### Slice 06：设计系统和组件

作为 Mobile 基础能力继续演进，不属于 P1.5 S00 实现范围。

### Slice 07：测试与诊断

已有测试方向。P1.5 S12 增加系统浏览器、App Link、安全存储、Refresh Rotation、进程回收、设备丢失和跨用户离线命令 E2E。

## 6. 修正后的完成定义

Mobile Phase 01 完成表示：

- 工程和 H5 构建基础可用。
- 页面、Adapter、API Client 和离线命令存在可继续演进的骨架。
- Gateway-only、幂等、弱网恢复和本地数据最小化原则明确。

Mobile Phase 01 不表示 OAuth、App Link、Token 安全存储、Session 恢复或 Mobile 安全闭环已实现。

## 7. P1.5 后续

| Slice | Mobile 工作 |
|---|---|
| S00 | 设计对齐与状态纠偏 |
| S11 | Mobile Auth Runtime、Android 安全存储与离线身份归属 |
| S12 | Android 真机、安全 E2E 与跨仓库封板 |

完整实施范围见 [P1.5 Mobile 认证与授权实施计划](P1.5-Mobile认证授权实施计划.md)。

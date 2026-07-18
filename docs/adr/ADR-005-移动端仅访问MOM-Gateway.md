# ADR-005：移动端仅访问 MOM Gateway

- 状态：Accepted
- 日期：2026-07-18

## 背景

MOM 后端包含 IAM、MES、WMS、QMS 等多个服务。若 PDA 直接调用内部服务，会泄漏拓扑并导致认证、错误和版本治理分散。

## 决策

所有移动端 API 访问统一经过 MOM API Gateway。PDA 不保存和调用内部服务地址。

## 理由

- 统一认证与授权。
- 统一限流和审计。
- 统一 correlation ID 和错误模型。
- 隐藏内部拓扑。
- 支持后端服务重构。

## 后果

- Gateway 成为关键依赖。
- API 契约需要为移动端场景设计。
- 移动端仍需处理 Gateway 不可用和限流。

## 约束

- Base URL 仅指向 Gateway。
- 所有业务错误在 API Client 边界标准化。
- 401、403、409、429 和 5xx 使用统一处理。
- 内部服务地址不得进入配置或文档示例供客户端使用。

## 验证

- 代码搜索无 IAM/MES/WMS/QMS 直连地址。
- 请求携带工厂、版本和关联上下文。
- 后端 Trace 可从 correlation ID 定位。

# MOM Mobile 文档中心

本目录是 `mom-mobile` 的产品需求、移动端架构、认证运行时、原型、页面状态、离线策略、测试发布和架构决策权威入口。

> 文档变更使用与具体 Work/Slice 对应的任务分支。本次 P1.5 S00 使用 `feat/p15-s00-design-baseline`；历史 `agent/complete-chinese-docs` 仅作为既有文档整理分支。

## 文档原则

1. 页面设计从现场任务和用户流程出发，不从接口字段或数据库表出发。
2. Android PDA 是产品目标，H5 只是 CI、开发调试和交互评审目标。
3. 扫码、网络、普通存储、Auth 安全存储、振动和厂商 SDK 必须经过平台适配器。
4. 离线写操作保存为业务命令，并显式记录用户、Session、Client、Factory、Party、Permission、幂等、关联、重试和冲突状态。
5. 前端权限只改善体验，服务端执行最终授权。
6. 文档不得把计划能力描述为已实现能力。
7. 同一安全事实只维护一个权威来源，Mobile 文档不得重定义后端协议。

## 当前阶段

- Mobile Phase 01：应用、适配器、API Client 和离线队列基础已具备。
- P1.5 S00：Mobile 认证授权设计已对齐，正式实现安排在 S11。

## P1.5 认证与授权

- [P1.5 Mobile 认证与授权运行时基线](architecture/P1.5-Mobile认证授权运行时基线.md)
- [P1.5 Mobile 认证与授权实施计划](plans/P1.5-Mobile认证授权实施计划.md)
- [ADR-009：P1.5 Mobile 认证运行时](adr/ADR-009-P1.5-Mobile认证运行时.md)
- [mom-platform P1.5 S00 权威 PR](https://github.com/Chris-co-shi/mom-platform/pull/15)
- [mom-web P1.5 S00 对齐 PR](https://github.com/Chris-co-shi/mom-web/pull/3)

## 需求

- [移动端产品范围](requirements/移动端产品范围.md)
- [V1 页面需求](requirements/V1页面需求.md)
- [移动端非功能需求](requirements/移动端非功能需求.md)
- [用户角色与设备场景](requirements/用户角色与设备场景.md)

## 计划

- [V1 移动端路线图](plans/V1移动端路线图.md)
- [Phase 01：移动端骨架计划](plans/Phase-01-移动端骨架计划.md)
- [P1.5：Mobile 认证与授权实施计划](plans/P1.5-Mobile认证授权实施计划.md)
- [VS-01：移动端页面设计计划](plans/VS-01-移动端页面设计计划.md)

## 架构

- [移动端总体架构](architecture/移动端总体架构.md)
- [P1.5 Mobile 认证与授权运行时基线](architecture/P1.5-Mobile认证授权运行时基线.md)
- [模块边界](architecture/模块边界.md)
- [状态管理与页面数据流](architecture/状态管理与页面数据流.md)
- [离线命令队列与同步](architecture/离线命令队列与同步.md)
- [扫描与设备适配](architecture/扫描与设备适配.md)
- [API、幂等与错误处理](architecture/API幂等与错误处理.md)
- [认证、权限与工厂范围](architecture/认证权限与工厂范围.md)
- [本地存储与数据安全](architecture/本地存储与数据安全.md)
- [移动端可观测性](architecture/移动端可观测性.md)

## 设计交付

- [用户流程](user-flows/README.md)
- [移动端原型](prototypes/README.md)
- [页面状态矩阵](page-state-matrix/README.md)
- [组件映射](component-mapping/README.md)
- [API 映射](api-mapping/README.md)
- [VS-01 原型 Backlog](prototypes/mobile/VS-01-material-to-finished-goods/README.md)

## 测试与发布

- [移动端测试策略](testing/移动端测试策略.md)
- [Android 构建发布与签名](release/Android构建发布与签名.md)
- [环境配置与版本发布](release/环境配置与版本发布.md)

## 架构决策

- [ADR 索引](adr/README.md)
- [ADR 模板](adr/ADR-模板.md)

## 开源合规

- [开源来源登记](open-source/source-origin.md)
- [第三方声明](../THIRD-PARTY-NOTICES.md)

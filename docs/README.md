# MOM Mobile 文档中心

本目录是 `mom-mobile` 的产品需求、移动端架构、原型、页面状态、离线策略、测试发布和架构决策权威入口。

> 所有文档、原型和 ADR 统一在 `agent/complete-chinese-docs` 分支维护，详见 [文档维护约定](文档维护约定.md)。

## 文档原则

1. 页面设计从现场任务和用户流程出发，不从接口字段或数据库表出发。
2. Android PDA 是产品目标，H5 是 CI 和交互评审目标，两者不能混为一谈。
3. 扫码、网络、存储、振动和厂商 SDK 必须经过平台适配器。
4. 离线写操作保存为业务命令，并显式记录幂等、关联、重试和冲突状态。
5. 正式页面实现前必须完成用户流程、竖屏原型、状态矩阵、组件映射和 API 映射。
6. 文档不得把计划能力描述为已实现能力。

## 需求

- [移动端产品范围](requirements/移动端产品范围.md)
- [V1 页面需求](requirements/V1页面需求.md)
- [移动端非功能需求](requirements/移动端非功能需求.md)
- [用户角色与设备场景](requirements/用户角色与设备场景.md)

## 计划

- [V1 移动端路线图](plans/V1移动端路线图.md)
- [Phase 01：移动端骨架计划](plans/Phase-01-移动端骨架计划.md)
- [VS-01：移动端页面设计计划](plans/VS-01-移动端页面设计计划.md)

## 架构

- [移动端总体架构](architecture/移动端总体架构.md)
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

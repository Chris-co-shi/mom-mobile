# MOM Mobile 架构决策记录

ADR 用于记录会长期约束移动端实现的关键决策。已接受的 ADR 不应静默改写；架构变化应创建新 ADR 并标记替代关系。

## ADR 状态

- `Proposed`：待评审。
- `Accepted`：当前有效。
- `Rejected`：未采用。
- `Deprecated`：不再建议使用。
- `Superseded`：被新 ADR 替代。

## 当前 ADR

| ADR | 标题 | 状态 |
|---|---|---|
| [ADR-001](ADR-001-uni-app与Android产品目标.md) | uni-app Vue 3 与 Android PDA 产品目标 | Accepted |
| [ADR-002](ADR-002-平台能力必须经过适配器.md) | 平台能力必须经过适配器 | Accepted |
| [ADR-003](ADR-003-离线写操作采用持久化业务命令.md) | 离线写操作采用持久化业务命令 | Accepted |
| [ADR-004](ADR-004-移动端原型先行交付.md) | 移动端原型先行交付 | Accepted |
| [ADR-005](ADR-005-移动端仅访问MOM-Gateway.md) | 移动端仅访问 MOM Gateway | Accepted |
| [ADR-006](ADR-006-离线冲突必须显式处理.md) | 离线冲突必须显式处理 | Accepted |
| [ADR-007](ADR-007-本地数据最小化与用户工厂隔离.md) | 本地数据最小化与用户工厂隔离 | Accepted |
| [ADR-008](ADR-008-应用升级必须兼容未完成离线命令.md) | 应用升级必须兼容未完成离线命令 | Accepted |

## 新建 ADR

使用 [ADR 模板](ADR-模板.md)，并按照下一可用编号创建文件。

ADR 至少包含背景、候选方案、决策、后果、约束和验证方式。

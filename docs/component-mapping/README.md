# 移动端组件映射规范

原型中的每个交互元素必须明确是 uni-app 基础能力、MOM 通用组件、领域组件、平台能力还是页面专用实现。

## 1. 组件层级

### 1.1 uni-app 基础组件

- `view`
- `text`
- `button`
- `input`
- `scroll-view`
- `swiper`
- `picker`

### 1.2 MOM 通用移动组件

建议逐步建设：

- `NetworkBadge`
- `OperationCard`
- `ScanTrigger`
- `ScanResultCard`
- `TaskStatusTag`
- `OfflineQueueBadge`
- `CommandStatusPanel`
- `ErrorRecoveryPanel`
- `ConfirmSummary`
- `LargeActionButton`

### 1.3 领域组件

- `DeliverySummary`
- `ContainerSummary`
- `LocationSummary`
- `MaterialRequirement`
- `WeightInput`
- `ConflictComparison`

领域组件接收 View Model，不直接请求 API。

### 1.4 Platform Adapter

- Scanner。
- Network。
- Storage。
- Feedback。
- Device Info。
- Printer。

## 2. 映射模板

| 原型元素 | 实现层级 | 组件/Adapter | 状态 | 可访问性 | 备注 |
|---|---|---|---|---|---|
| 扫描送货单按钮 | MOM 通用组件 | `ScanTrigger` | Ready/Scanning/Error | 大触控区 | 调用 Scanner Adapter |
| 网络状态 | MOM 通用组件 | `NetworkBadge` | Online/Weak/Offline | 图标+文字 | 不只使用颜色 |
| 收货确认 | MOM 通用组件 | `ConfirmSummary` | Valid/Submitting | 支持返回修改 | 不直接提交 API |

## 3. 触控要求

- 主要按钮适合戴手套操作。
- 危险操作与主要操作保持足够距离。
- 连续扫码时页面焦点明确。
- 不依赖双击、右键或悬停。

## 4. 状态表达

状态组件必须同时使用：

- 文字。
- 图标或形状。
- 颜色。

不能仅靠红绿颜色区分。

## 5. 扫码组件

应支持：

- 单次扫描。
- 连续扫描。
- 取消。
- 手工输入入口。
- 最近结果。
- 重复扫描提示。
- 权限和设备错误。

## 6. 离线组件

应支持：

- 待同步数量。
- 当前网络状态。
- 命令状态。
- 尝试次数。
- 最近错误。
- 冲突和结果未知入口。
- 人工处理动作。

## 7. 抽象准入

组件满足以下条件后才进入通用层：

- 至少两个页面有稳定复用需求。
- Props 和 Events 清晰。
- 不包含页面路由或 API 调用。
- 有关键状态示例或测试。
- 不泄漏特定设备 SDK。

## 8. 验收

- 原型元素都有映射归属。
- 页面不重复实现网络和离线状态。
- 领域组件不依赖 API Client。
- 平台差异不进入展示组件。
- 关键组件在小屏、弱网和错误状态下可用。

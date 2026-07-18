# 移动端页面状态矩阵规范

页面状态矩阵用于确保正常、离线、冲突、设备和恢复状态在编码前被明确设计。

## 1. 模板

| 状态 | 触发条件 | 页面反馈 | 允许操作 | 禁止操作 | 恢复路径 |
|---|---|---|---|---|---|
| READY | 页面初始化完成 | 扫码提示 | 扫描/返回 | 提交 | 扫描 |
| SCANNING | 扫描器激活 | 扫描界面 | 取消 | 重复启动 | 返回 READY |
| VALIDATED | 对象校验成功 | 摘要卡 | 下一步/修改 | 非法提交 | 继续流程 |

## 2. 通用状态

- INITIALIZING
- LOADING
- EMPTY
- READY
- SCANNING
- VALIDATING
- VALIDATED
- SUBMITTING
- COMPLETED
- WEAK_NETWORK
- OFFLINE
- QUEUED
- SYNCING
- FAILED_RETRYABLE
- CONFLICT
- UNKNOWN_RESULT
- RATE_LIMITED
- SESSION_EXPIRED
- FORBIDDEN
- HARDWARE_ERROR
- MANUAL_REQUIRED
- CANCELLED

## 3. 矩阵要求

每个状态必须说明：

- 进入条件。
- 可见信息。
- 主操作。
- 禁止操作。
- 是否保留输入。
- 是否允许离开页面。
- 是否产生离线命令。
- 恢复目标状态。

## 4. 状态分离

必须区分：

- 扫码器正在扫描。
- 扫码值已获取。
- 业务对象校验中。
- 业务命令提交中。
- 命令已进入离线队列。
- 服务端结果未知。

不得用一个 `loading` 覆盖全部状态。

## 5. 视觉规则

- 状态使用文字和图标，不只依赖颜色。
- 离线入队不显示为业务完成。
- 冲突和普通失败视觉不同。
- 结果未知应避免“再次提交”作为默认按钮。
- 人工处理应显示责任角色和下一步。

## 6. 验收

- 原型中的状态与矩阵一致。
- 自动化测试可引用状态名称。
- 状态迁移没有不可恢复死路。
- 关键状态明确是否可离线和是否保留输入。

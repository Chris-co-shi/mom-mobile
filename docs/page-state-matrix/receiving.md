# 原料收货页面状态矩阵

| 状态 | 触发条件 | 页面反馈 | 允许操作 | 恢复路径 |
|---|---|---|---|---|
| INITIALIZING | 页面启动 | 骨架屏、网络状态 | 返回 | 加载任务 |
| READY | 可开始操作 | 扫描送货单提示 | 扫描、手输、返回 | 进入 SCANNING |
| SCANNING | Scanner 激活 | 扫描界面 | 取消 | READY 或 VALIDATING |
| VALIDATING | 已获取码值 | 校验进度 | 取消较低风险操作 | VALIDATED / INVALID |
| INVALID | 格式或对象错误 | 错误原因 | 重扫、修正 | READY |
| VALIDATED | 送货单有效 | 供应商和物料摘要 | 扫描容器、继续 | CONTAINER_READY |
| CONTAINER_READY | 容器有效 | 容器摘要 | 输入重量、换容器 | WEIGHT_READY |
| WEIGHT_READY | 重量校验完成 | 收货确认摘要 | 提交、返回修改 | SUBMITTING / QUEUED |
| SUBMITTING | 在线命令提交 | 禁止重复操作 | 取消页面跳转限制 | COMPLETED / CONFLICT / UNKNOWN_RESULT |
| OFFLINE | 无网络 | 橙色状态与离线说明 | 入队、返回修改 | QUEUED |
| QUEUED | 命令已持久化 | 本地命令号、待同步 | 查看队列、继续任务 | SYNCING |
| SYNCING | 队列同步 | 进度和尝试次数 | 查看详情 | COMPLETED / FAILED_RETRYABLE / CONFLICT / UNKNOWN_RESULT |
| FAILED_RETRYABLE | 网络或可恢复错误 | 最近错误、下次时间 | 手工重试、取消 | PENDING / MANUAL_REQUIRED |
| CONFLICT | 服务端状态变化 | 本地与服务端对比 | 刷新、修正、转人工 | PENDING / CANCELLED |
| UNKNOWN_RESULT | 请求结果无法确认 | 关联 ID、查询状态 | 查询、转人工 | COMPLETED / MANUAL_REQUIRED |
| RATE_LIMITED | 429 | 等待时间 | 稍后重试 | READY / PENDING |
| SESSION_EXPIRED | 401 | 登录提示 | 重新登录 | 重新校验后恢复 |
| FORBIDDEN | 403 | 权限或工厂范围说明 | 返回、申请权限 | 工作台 |
| HARDWARE_ERROR | 扫描器不可用 | 设备错误与设置指引 | 重试、手输、诊断 | READY / MANUAL_REQUIRED |
| COMPLETED | 服务端已完成 | 收货单、批次、容器、标签状态 | 下一单、查看详情 | READY |
| MANUAL_REQUIRED | 自动恢复失败 | 主管处理说明 | 转交、取消、导出诊断 | PENDING / CANCELLED |

## 关键规则

- `QUEUED` 仅表示命令已保存在本地，不表示收货完成。
- `SUBMITTING` 超时后优先进入 `UNKNOWN_RESULT`，不直接回到可提交状态。
- `CONFLICT` 不自动覆盖服务端。
- 原幂等键在重试和状态查询过程中保持不变。
- `SESSION_EXPIRED` 后重新登录必须再次校验送货单和权限。

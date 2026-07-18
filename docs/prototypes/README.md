# 移动端原型规范

移动端原型是正式页面实现的强制设计输入，不是开发完成后的补充截图。

## 1. 目录约定

```text
docs/prototypes/mobile/<vertical-slice>/<page>/
├── README.md
├── normal.png
├── loading.png
├── offline.png
├── conflict.png
├── unknown-result.png
├── hardware-error.png
└── manual-takeover.png
```

## 2. 画布

- 以常见工业 PDA 竖屏为主。
- 标注目标分辨率和安全区。
- 不依赖鼠标悬停。
- 关键操作在单手和戴手套场景下可点击。
- 底部操作区避免被系统导航栏遮挡。

## 3. 原型必须体现

- 页面标题和任务上下文。
- 当前用户、工厂或仓库摘要。
- 网络和离线队列状态。
- 扫码入口和允许手工输入的边界。
- 当前步骤和进度。
- 主要操作和危险操作。
- 业务编号、容器、批次、工单或库位摘要。
- correlation ID 的错误入口。

## 4. 强制状态

每个关键页面按适用范围覆盖：

- Initial。
- Loading。
- Empty。
- Ready。
- Scanning。
- Validated。
- Submitting。
- Completed。
- Offline。
- Queued。
- Syncing。
- Rate Limited。
- Conflict。
- Unknown Result。
- Session Expired。
- Permission Denied。
- Hardware Error。
- Manual Takeover。

## 5. 扫码标注

原型需标注：

- 扫描对象。
- 支持码制。
- 连续或单次扫描。
- 是否允许手工输入。
- 重复扫码处理。
- 扫码成功和失败反馈。

## 6. 离线标注

需要说明：

- 页面是否允许离线查询。
- 写操作是否允许离线入队。
- 离线数据的有效期。
- 命令进入队列后的提示。
- 网络恢复后的同步入口。
- 冲突和结果未知的恢复动作。

## 7. 组件映射

每个原型元素应映射到：

1. uni-app 基础组件。
2. MOM 通用移动组件。
3. MOM 领域组件。
4. Platform Adapter 能力。
5. 页面专用实现。

## 8. 版本

原型文件和页面说明需要记录：

- 版本。
- 日期。
- 关联需求。
- 关联 API 契约。
- 评审状态。
- 替代版本。

## 9. 验收门禁

页面不得进入正式开发，除非：

- 正常流程原型完成。
- 强制异常状态完成。
- 用户流程完成。
- 状态矩阵完成。
- 组件映射完成。
- API、权限、幂等和离线映射完成。
- 业务和架构评审通过。

# 开源来源登记

本文件记录 `mom-mobile` 的项目模板、运行依赖、设计参考和后续源码迁移来源。

## 1. 当前来源

| 组件 | 上游 | 当前基线 | 使用方式 | 许可证处理 |
|---|---|---|---|---|
| uni-app 项目模板 | `dcloudio/uni-preset-vue` | `vite-ts`，2026-07-18 检查 | 项目结构与依赖基线 | 按上游声明 |
| uni-app | `dcloudio/uni-app` | `3.0.0-5010520260709002` | App/H5 运行与 Vite 集成 | 按具体包声明，包含 Apache-2.0 组件 |
| Vue | `vuejs/core` | `3.4.21` | UI 运行时 | MIT |
| Pinia | `vuejs/pinia` | `2.1.7` | 会话和页面状态 | MIT |
| Vue I18n | `intlify/vue-i18n` | `9.14.x` | 国际化基础 | MIT |
| Vite | `vitejs/vite` | `5.2.8` | H5 构建工具 | MIT |
| TypeScript | `microsoft/TypeScript` | `5.8.3` | 类型系统 | Apache-2.0 |
| vue-tsc | `vuejs/language-tools` | `2.2.12` | Vue 类型检查 | MIT |
| Sass | `sass/dart-sass` | `1.101.0` | 样式编译 | MIT |

具体安装版本以 `package.json` 和 `pnpm-lock.yaml` 为准。

## 2. 模板复用边界

初始工程参考官方 uni-app Vue 3 TypeScript 模板的目录和依赖方式。

以下内容由 MOM 项目自主设计：

- 工业 PDA 页面。
- 收货、上架、领退料、成品入库和发运流程。
- Platform Adapter 接口。
- 离线命令模型和同步策略。
- 幂等与冲突处理。
- UI 结构和原型。

## 3. 后续厂商 SDK

接入工业 PDA、打印机或称重设备 SDK 时，必须登记：

- 厂商和产品名称。
- SDK 版本。
- 官方下载地址。
- 许可证或商业授权。
- 支持的设备型号和 Android 版本。
- 引入文件和二进制 Hash。
- 本地封装和修改。
- 是否允许开源分发。

不允许把无再分发权的厂商 SDK 二进制直接提交到公开仓库。

## 4. 源码复制规则

复制或改写上游源码前必须记录：

- 上游仓库。
- Tag 或 Commit SHA。
- 原始路径。
- 许可证。
- 复制原因。
- MOM 修改内容。
- NOTICE 或署名要求。

优先通过包依赖和适配器复用，避免无必要复制源码。

## 5. 禁止来源

禁止进入仓库：

- 前雇主或客户私有源码。
- 真实客户 Logo、页面、生产数据或条码。
- 来源不明的图标、字体、音效和图片。
- 未确认分发权的厂商 SDK。
- 破解或反编译得到的组件。

## 6. 维护要求

新增依赖、原生插件、设备 SDK、字体、图标或音效时，同步更新：

- 本文件。
- `THIRD-PARTY-NOTICES.md`。
- 锁文件。
- 相关 ADR 或发布文档。

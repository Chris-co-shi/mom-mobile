# ADR-001：采用 uni-app Vue 3，Android PDA 为产品目标

- 状态：Accepted
- 日期：2026-07-18

## 背景

项目需要同时支持快速前端开发、H5 自动化验证和 Android 工业 PDA 落地，并保留接入厂商扫描 SDK 的能力。

## 候选方案

1. 原生 Android。
2. Flutter。
3. uni-app Vue 3。
4. 单纯 H5/PWA。

## 决策

采用 uni-app Vue 3 CLI、Vite 和 TypeScript。Android App 是正式产品目标，H5 是确定性 CI、原型评审和快速联调目标。

DCloud 相关运行包必须使用同一匹配发行标识，禁止混用不同版本。

## 理由

- 与现有 Vue 技能和前端生态一致。
- 可以快速产出 H5 验证目标。
- 支持 App 平台和原生插件扩展。
- 适合个人开源项目快速迭代。

## 后果

正向：

- 开发效率高。
- H5 和 App 可共享大部分业务代码。
- 平台差异可通过 Adapter 隔离。

负向：

- 厂商 SDK 仍可能需要原生插件。
- H5 行为不能代表真机行为。
- DCloud 版本兼容需要严格管理。

## 约束

- README 必须区分 H5 和 Android 状态。
- H5 Build 通过不得宣称真机发布完成。
- 原生能力不得直接进入业务页面。

## 验证

- H5 CI 构建通过。
- Android PoC 可启动。
- Scanner Adapter 可切换实现。
- 目标 PDA 真机核心流程通过。

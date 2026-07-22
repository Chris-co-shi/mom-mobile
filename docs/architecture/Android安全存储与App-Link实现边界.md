# Android 安全存储与 App Link 实现边界

## 1. TypeScript 与原生边界

TypeScript 只依赖 `AndroidSecureStorageBridge`，不得直接访问 SharedPreferences、文件或普通 uni storage。原生插件必须实现：

| 方法 | 原子语义 | 失败策略 |
|---|---|---|
| `read` | 读取单个安全记录 | IN_FLIGHT 不可恢复使用 |
| `storeInitial` | 空记录写入 READY | 不确定返回 UNKNOWN |
| `beginUse` | READY CAS 为 IN_FLIGHT，并返回一次性租约 | 冲突返回 null |
| `commitReplacement` | 匹配 operationId 后替换为新 READY | 不确定返回 UNKNOWN |
| `invalidate` | 删除匹配租约或全部记录 | 删除失败不得恢复旧 Token |
| `clear` | 清理安全记录 | App 保持未认证 |

原生记录至少包含密文 Refresh Token、状态、operationId 和更新时间。加密密钥由 Android Keystore 生成和保护，不可导出；记录更新采用临时文件加原子替换或具备等价事务/CAS 的加密存储。不得因生物识别取消、Key 失效、设备迁移或 I/O 异常回退到明文。

## 2. 进程回收语义

发起网络 Refresh 前必须先完成 READY → IN_FLIGHT。进程在此后任何时点终止，下一次启动都把 IN_FLIGHT 当作结果不确定并 Fail Closed。只有确认新 Refresh Token 已原子提交为 READY 后，后续启动才可恢复。

## 3. HTTPS App Link

正式包必须在最终 Android Manifest 中声明 `android:autoVerify="true"` 的 HTTPS intent-filter，仅包含批准的 scheme、host 和 callback path。域名 `/.well-known/assetlinks.json` 必须绑定最终 Application ID 与发布证书 SHA-256。

uni-app/HBuilder 生成配置、原生插件或宿主工程负责写入最终 Manifest；TypeScript 不伪造域名验证结果。自定义 scheme 只允许受控开发环境，不能作为正式验收替代。

## 4. H5 边界

`H5MemoryRefreshTokenStorage` 只在当前 JavaScript 进程保存 Refresh Token。它不调用 localStorage、sessionStorage、Pinia 持久化、uni storage 或文件系统，页面刷新后凭证消失。H5 自动化只验证协议状态机，不能证明 Android Keystore 或 App Link 安全。

## 5. 自动化与真机

Fake/Memory Adapter 自动覆盖正常 CAS、并发 Single Flight、冷启动恢复和 UNKNOWN Fail Closed。Android 真机必须按[验收清单](../testing/P1.5-S11-Android真机验收清单.md)验证 Keystore、系统浏览器、App Link、强杀进程和敏感信息扫描。

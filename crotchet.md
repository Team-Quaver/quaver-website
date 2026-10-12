# CROTCHET Mode - 调试模式

该功能为了做性能测试评估，开发测试使用，打开它，将会启动以下功能

- Chromium 测试服务器
- 详细日志
- 关闭手动安装插件弹窗

:::danger 警告
该功能目的仅为调试/开发使用，为了安全和性能考虑，普通用户严禁使用<br>如果安装了插件发现问题，请使用 `QUAVER_REDFLAG=1` 打开安全模式。
:::

## 使用

目前 CROTCHET Mode 需要使用环境变量 `QUAVER_CROTCHET` 环境变量，值可以是任意字符串或者 `端口号`，如果是任意字符串，则以默认端口打开调试模式

## 无警告安装插件

启动 CROTCHET Mode 后，可直接在花火插件 Marketplace 里面无警告手动安装插件

## 详细日志

启动 CROTCHET Mode 后，前后端日志 + dbus /部分系统日志将会直接写入日志内，方便调查问题

## 性能测试/触控测试

启动 CROTCHET Mode 后，可在 `chrome://inspect` 中进行性能和元素调试
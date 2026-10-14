---
name: blocks-build
description: 小游戏《拼消块》Blocks（Cocos Creator 2.4.13）的本地命令行构建流程。当用户要求构建、打包、出包、生成网页版（web-mobile）产物或准备上线发布时使用。
---
## 项目信息

- 游戏：《拼消块》Blocks（Cocos Creator JS 项目）
- 引擎版本：**Cocos Creator 2.4.13**（`project.json` 中 `"version": "2.4.13"`）
- 工程根目录：`D:\Work\GameCode\cocos\games\Blocks`
- 编辑器可执行文件（命令行构建用）：
  `C:\ProgramData\cocos\editors\Creator\2.4.13\CocosCreator.exe`
  （由 Cocos Dashboard 安装，登记在 `C:\Users\Administrator\.Cocos\profiles\editor.json`）

## 一、构建前检查

1. 关闭正在运行的 Cocos Creator 编辑器（命令行构建与编辑器互斥，同时跑会锁工程）
2. 确认工程用的是 **2.4.13** 编辑器，不要用 3.8.x 打开（版本不匹配会迁移升级工程，破坏兼容）
3. 首次构建会自动生成 `library/`、`temp/` 目录，体积较大，属正常现象（已被 .gitignore 排除，不入库）

## 二、命令行构建（web-mobile 网页版）

在 PowerShell 中执行：

```powershell
& "C:\ProgramData\cocos\editors\Creator\2.4.13\CocosCreator.exe" `
  --project "D:\Work\GameCode\cocos\games\Blocks" `
  --build "platform=web-mobile"
```

说明：

- 构建过程会自动启动一个后台编辑器进程，**无窗口、约 1~3 分钟**，结束后进程自行退出
- 可加常用参数（分号分隔，写在引号串内），例如开启 md5 缓存：`"platform=web-mobile;md5Cache=true"`
- 若构建卡住或报错，优先去看工程目录下 `temp/` 与编辑器日志 `C:\Users\Administrator\.CocosCreator\logs\`

## 三、构建产物

- 输出目录：`build/web-mobile/`
  - `index.html` —— 游戏入口页面
  - `src/` —— 编译后的游戏逻辑代码
  - `res/` —— 图片、音频等资源
- 该目录已在 `.gitignore` 中排除（`/build/`），**不随源码入库**；它是用来发布 Pages 的产物

## 四、本地验证

构建完成后，在工程根目录起一个静态服务器验证：

```powershell
cd "D:\Work\GameCode\cocos\games\Blocks\build\web-mobile"
npx serve .
```

浏览器打开提示的地址，确认：能进游戏主界面、可正常点击开始、能玩一局再退出。
（直接双击 index.html 用 file:// 打开会因跨域加载资源失败，必须走 http 服务。）

## 五、硬性约束

1. 只用 2.4.13 编辑器 / CLI 构建，禁止用高版本编辑器打开升级
2. 产物在 `build/web-mobile/`，不要改输出路径，后续 gh-pages 发布固定引用这个目录
3. web-mobile 产物内部使用相对路径引用资源，部署到 `https://zlToT.github.io/Blocks/` 这种子路径下可直接运行，无需改 base

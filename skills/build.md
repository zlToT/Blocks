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
  - `index.html` —— Cocos 默认生成的游戏入口（**下一步要改名**）
  - `src/` —— 编译后的游戏逻辑代码
  - `res/` —— 图片、音频等资源
- 该目录已在 `.gitignore` 中排除（`/build/`），**不随源码入库**；它是用来发布 Pages 的产物

## 四、构建后必做：PC 端套手机壳（上传 gh-pages 前必做，别漏）

游戏设计分辨率是 **720×1280 竖屏**，Cocos 默认产物在 PC 宽屏下会被拉满整个窗口、棋盘拉伸裁切。所以每次构建后、推 gh-pages 前，必须手动处理产物目录：

1. 把 Cocos 生成的 `index.html` 改名为 `game.html`
2. 新建一个 `index.html` 作为"壳"：手机端 iframe 全屏，PC 宽屏时游戏居中套一个严格 720:1280 的竖屏框
3. 壳的模板如下（直接照抄，别自己写 `min()` 算宽高，会算歪比例）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,user-scalable=no,initial-scale=1,minimum-scale=1,maximum-scale=1" />
  <title>Blocks · 拼消块</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body { background: radial-gradient(ellipse at 30% 20%, #2b5840, #16352a 70%); }
    .frame { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
    @media (min-width: 768px) {
      iframe {
        height: 86vh;
        aspect-ratio: 720 / 1280;
        max-width: 92vw;
        border-radius: 18px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08);
        background: #fff;
      }
    }
  </style>
</head>
<body>
  <div class="frame">
    <iframe src="game.html" allow="autoplay; fullscreen; gamepad"></iframe>
  </div>
</body>
</html>
```

注意：每次重新构建，Cocos 会**重新生成 index.html 覆盖掉壳**，必须重做这一步。

## 五、本地验证

构建完成后，在工程根目录起一个静态服务器验证：

```powershell
cd "D:\Work\GameCode\cocos\games\Blocks\build\web-mobile"
npx serve .
```

浏览器打开提示的地址，确认：能进游戏主界面、可正常点击开始、能玩一局再退出。
（直接双击 index.html 用 file:// 打开会因跨域加载资源失败，必须走 http 服务。）

## 六、硬性约束

1. 只用 2.4.13 编辑器 / CLI 构建，禁止用高版本编辑器打开升级
2. 产物在 `build/web-mobile/`，不要改输出路径，后续 gh-pages 发布固定引用这个目录
3. web-mobile 产物内部使用相对路径引用资源，部署到 `https://zlToT.github.io/Blocks/` 这种子路径下可直接运行，无需改 base
4. 每次新构建后必须重做「第四节 PC 端套手机壳」，否则 PC 端游戏又会被拉伸

## 七、本机踩过的坑

- **命令行 `--build` 在这台机器上会卡死在 `connected!`**（2026-10 实测三次），工程搬家后尤其如此。可靠做法：用 Cocos Dashboard 打开项目 → 菜单「项目 → 构建发布」→ 平台选 web-mobile → 点构建。构建完再按第四节补壳。

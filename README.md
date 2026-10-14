# Blocks · 拼消块

一款 5×5 棋盘上的数字消除类休闲小游戏，点击方块让它"升一级"，凑齐三个以上同色连通块即可消除得分。

## 玩法说明

- 棋盘为 **5×5** 共 25 个方块，方块带 0~8 共 9 种数字（对应不同颜色样式）
- 开局有 **5 点生命值**（红心），初始棋盘保证相邻方块颜色不重复
- **点击任意方块**：该方块数字 +1（变色），消耗 1 点生命
- 点击后自动检测：以该块为中心，四方向连通的同数字方块
  - 连通数量 **≥ 3** → 整组消除，得分 =（数字+1）× 消除个数；被点的方块本身再升一级；每次成功消除回复 1 点生命
  - 连通数量 < 3 → 不消除，仅变色，生命照常扣除
- 消除后上方方块**下落补位**，空位随机补入新方块（数字 0~4），并自动连锁检测，直到棋盘上没有可消除的连通组
- 数字升到 8 后点击无效（防止溢出）
- **生命耗尽即游戏结束**，播放结束音乐后自动回到登录页
- 连续成功消除会触发递进的**连击音效**，手速越快、连锁越多，分数越高

小技巧：与其乱点凑数，不如先观察棋盘，把点击留给"差一步就连成 3 个"的位置，生命花在刀刃上。

## 使用技术

- **引擎**：Cocos Creator 2.4.13（2D，纯 JavaScript，`cc.Class` 组件式开发）
- **场景**：`login`（登录页 + 背景音乐）、`main`（主玩法）
- **核心脚本**（`assets/scripts/`）：
  - `main/main-canvas.js` —— 触摸坐标换算、生命值与分数管理、游戏流程控制
  - `main/main-blockManager.js` —— 棋盘管理：`map`（数字表）/ `mapNode`（节点表）/ `book`（检测标记表）三张二维数组；flood-fill 递归找连通块；下落、补块、连锁检测
  - `main/main-music.js`、`login/login-music.js` —— 点击 / 消除 / 连击 / 结束音效
- **关键实现**：`cc.NodePool` 对象池复用方块预制体、`cc.director.loadScene` 场景切换、`cc` 动作系统（`moveBy` / `scaleTo` / `sequence` / `callFunc` / `scheduleOnce`）、触摸事件 `TOUCH_END` + `convertToNodeSpaceAR` 坐标换算、`cc.Label` 分数 UI、SpriteFrame 数组换肤
- **资源目录**：`assets/res/blocks`（方块贴图）、`assets/res/music`（音频）、`assets/res/ui`（UI 素材）
- **构建产物**：`build/web-mobile/`（H5 网页版），构建命令见 [`skills/build.md`](skills/build.md)

cc.Class({
    extends: cc.Component,

    properties: () => ({
        blockPrefab: cc.Prefab,
        blockSpriteFrames: [cc.SpriteFrame],
        mainCanvas: require('main-canvas'),
        musicRoot: require('main-music')
    }),

    onLoad() {
        // 在检测连接时，还要一个间接数组，存入被检测方块标志
        this.init();
        // 对象池
        this.pool = new cc.NodePool();
        // 5*5 = 25，多装几个备用，避免回收期未完成前不够用
        for (let i = 0; i < 30; i++) {
            this.pool.put(cc.instantiate(this.blockPrefab));
        }
        // 用于计数
        this.count = 0;
        // 用于记录连击音效
        this.hits = 0;
    },

    start() {
        // 创建方块
        this.gameStart();
    },

    init() {
        // 存图片索引
        this.map = [];
        // 存节点（用于动画操作）
        this.mapNode = [];
        // 标志消除数组
        this.book = [];
        // 5*5 棋盘
        for (let row = 0; row < 5; row++) {
            this.map[row] = [];
            this.mapNode[row] = [];
            this.book[row] = [];
            for (let col = 0; col < 5; col++) {
                this.map[row][col] = null;
                this.mapNode[row][col] = null;
                this.book[row][col] = 0;
            }
        }
    },

    gameStart() {
        // 随机创建 5*5 个方块
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                // 方块边长 130，5 个一排共 650 宽，中心在原点
                // col=0 最左 x=-260，col=4 最右 x=260
                let x = -260 + col * 130;
                // row=0 最上 y=260，row=4 最下 y=-260
                let y = 260 - row * 130;
                // 随机 0-4
                let num = this.randNum(0, 4);
                this.map[row][col] = num;
                // 检查上面一行和左边一列（按 row 外层 col 内层遍历，这两个方向已生成）
                while ((row > 0 && this.map[row - 1][col] === num) ||
                    (col > 0 && this.map[row][col - 1] === num)) {
                    num = this.randNum(0, 4);
                    this.map[row][col] = num;
                }
                // 创建完的节点存入节点数组
                this.mapNode[row][col] = this.createBlock(x, y, num);
            }
        }
    },

    /**
     * 通过给定坐标和图片索引创建一个方块
     * @param {number} x
     * @param {number} y
     * @param {number} num
     */
    createBlock(x, y, num) {
        let b = null;
        // 获取前判断对象池是否为空
        if (this.pool.size() > 0) {
            b = this.pool.get();
        } else {
            b = cc.instantiate(this.blockPrefab);
        }
        b.parent = this.node;
        b.x = x;
        b.y = y;
        b.getComponent(cc.Sprite).spriteFrame = this.blockSpriteFrames[num];
        return b;
    },

    /**
     * 点击方块加一
     * @param {number} row
     * @param {number} col
     */
    blockAddOne(row, col) {
        if (this.map[row][col] === 8) {
            console.log('到9了');
            return false;
        }
        this.map[row][col] += 1;
        let num = this.map[row][col];
        this.mapNode[row][col].getComponent(cc.Sprite).spriteFrame = this.blockSpriteFrames[num];
        return true;
    },

    setZeroBook() {
        this.count = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.book[row][col] = 0;
            }
        }
    },

    /**
     * 检测方块周围相同方块，记录于book
     * @param {number} row 行（垂直）
     * @param {number} col 列（水平）
     * @param {number} num
     */
    mapForCount(row, col, num) {
        // 上下左右：[行增量, 列增量]
        let dir = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        for (let k = 0; k < 4; k++) {
            let r = row + dir[k][0];
            let c = col + dir[k][1];
            if (r < 0 || r > 4 || c < 0 || c > 4) {
                continue;
            }
            if (this.map[r][c] === num && this.book[r][c] === 0) {
                this.book[r][c] = 1;
                this.count += 1;
                this.mapForCount(r, c, num);
            }
        }
    },

    clearHits() {
        this.hits = 0;
    },

    /**
     * 将已经标记的方块消除
     * @param {number} row 点击的行
     * @param {number} col 点击的列
     */
    doActionForBook(row, col) {
        // 分数
        this.mainCanvas.updateScoreLabel(this.count, this.map[row][col]);
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (r === row && c === col) {
                    continue;
                } else if (this.book[r][c] === 1) {
                    this.mapNode[r][c].runAction(
                        cc.sequence(
                            cc.scaleTo(0.15, 0),
                            cc.callFunc(() => {
                                this.pool.put(this.mapNode[r][c]);
                                this.map[r][c] = null;
                                this.mapNode[r][c] = null;
                            }, this)
                        )
                    );
                }
            }
        }
        // 本身操作
        this.mapNode[row][col].runAction(
            cc.sequence(
                cc.scaleTo(0.15, 1.2),
                cc.callFunc(() => {
                    this.blockAddOne(row, col);
                }, this),
                cc.scaleTo(0.15, 1),
                cc.callFunc(() => {
                    // 进行下落
                    this.blockDown();
                }, this)
            )
        );

        // 每一次消除，hp += 1
        this.mainCanvas.hp += 1;
        this.mainCanvas.updateHpShow(this.mainCanvas.hp);
        // 连击加一
        this.musicRoot.playCombo(this.hits);
        this.hits += 1;
    },

    /**
     * 方块下落
     */
    blockDown() {
        let downFlag = true;
        while (downFlag) {
            downFlag = false;
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 4; row++) {
                    if (this.mapNode[row][col] !== null && this.mapNode[row + 1][col] === null) {
                        this.mapNode[row][col].runAction(cc.moveBy(0.1, 0, -130));
                        this.mapNode[row + 1][col] = this.mapNode[row][col];
                        this.map[row + 1][col] = this.map[row][col];
                        this.mapNode[row][col] = null;
                        this.map[row][col] = null;
                        downFlag = true;
                    }
                }
            }
        }
        // 下落之后，需要把空补上
        this.scheduleOnce(this.checkNullBlock, 0.3);
    },

    checkNullBlock() {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (this.mapNode[row][col] === null) {
                    let num = this.randNum(0, 4);
                    let x = -260 + col * 130;
                    let y = 260 - row * 130;
                    this.map[row][col] = num;
                    this.mapNode[row][col] = this.createBlock(x, y, num);
                    // 新方块从 0 缩放到 1
                    this.mapNode[row][col].scale = 0;
                    this.mapNode[row][col].runAction(cc.scaleTo(0.1, 1));
                }
            }
        }
        // 新建方块后继续检测三连
        this.scheduleOnce(this.checkCount, 0.3);
    },

    /**
     * 新建方块后继续检测是否有超过3个方块连接
     */
    checkCount() {
        let checkFlag = true;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (checkFlag === false) break;
                this.setZeroBook();
                this.mapForCount(row, col, this.map[row][col]);
                if (this.count >= 3) {
                    this.doActionForBook(row, col);
                    checkFlag = false;
                }
            }
        }
        if (checkFlag === true) {
            this.mainCanvas.openTouch();
        }
    },

    /**
     * 返回 [min - max] 的随机值
     * @param {number} min
     * @param {number} max
     */
    randNum(min, max) {
        let value = min + (max - min + 1) * Math.random();
        return Math.floor(value);
    },

    /**
     * 打印当前棋盘，值 +1 显示（对应 b1~b9），空位显示 -
     */
    printMap() {
        let ret = []
        for (let row = 0; row < 5; row++) {
            let line = [];
            for (let col = 0; col < 5; col++) {
                let val = this.map[row][col];
                line.push(val === null ? '-' : val + 1);
            }
            ret.push(line)
        }
        console.log(ret);
    },
});

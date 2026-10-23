// 我们在引入其他脚本时常这么写
// var manager = require('main-blockManager');
// 但是这样存在一个问题，无法互相引用
cc.Class({
    extends: cc.Component,

    // 解决方案，延迟引用，写在属性里
    properties: () => ({
        // 管理5个生命值
        hpManager: cc.Node,
        // 分数显示
        showScoreLabel: cc.Label,
        blockManager: require('main-blockManager'),
        musicRoot: require('main-music')
    }),

    onLoad() {
        this.hp = 5;
        this.score = 0;

        // debug
        window.game = this;
    },

    start() {
        this.openTouch();
        // 测试
        this.updateHpShow(this.hp);
    },

    /**
     * 打开触摸
     */
    openTouch() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    },

    /**
     * 关闭触摸
     */
    closeTouch() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
    },

    touchEnd(e) {
        this.musicRoot.playHit();
        // 获取下位置
        let pos = this.node.convertToNodeSpaceAR(e.getLocation());

        // 每个方块空间为 130*130，5 个一排共 650 宽，中心在原点
        // row = 行（垂直/y）最上 y=325 对应 row=0 索引 0~4
        // col = 列（水平/x）最左 x=-325 对应 col=0 索引 0~4 
        let row = Math.floor((325 - pos.y) / 130);
        let col = Math.floor((325 + pos.x) / 130);
        console.log("点击行和列", row + 1, col + 1)
        // 如果出界
        if (row < 0 || row > 4 || col < 0 || col > 4) {
            console.log('不在范围内');
            return;
        }

        if (!this.blockManager.blockAddOne(row, col)) {
            return;
        }

        this.hp -= 1;
        this.updateHpShow(this.hp);
        this.closeTouch();

        // 每次检测前都应归零book，count也需要归零
        this.blockManager.setZeroBook();
        let num = this.blockManager.map[row][col];
        this.blockManager.mapForCount(row, col, num);
        if (this.blockManager.count < 3) {
            if (this.hp <= 0) {
                this.musicRoot.playOver();
                console.log('游戏结束');
                this.scheduleOnce(() => {
                    cc.director.loadScene('login');
                }, 1);
            } else {
                this.openTouch();
            }
            return;
        }

        this.blockManager.clearHits()
        this.blockManager.doActionForBook(row, col);
    },

    /**
     * 刷新血量
     */
    updateHpShow(hp) {
        if (hp < 0) hp = 0;
        if (hp > 5) hp = 5;
        for (let i = 0; i < 5; i++) {
            this.hpManager.children[i].opacity = 0;
        }
        for (let i = 0; i < hp; i++) {
            this.hpManager.children[i].opacity = 255;
        }
    },

    /**
     * 分数增加，传入消除的数量与消除方块的数
     * 例子：消除了3个1 3* 1  4个2 4*2
     */
    updateScoreLabel(num, k) {
        this.showScoreLabel.node.runAction(cc.sequence(
            cc.scaleTo(0.1, 1.2),
            cc.callFunc(() => {
                this.score += (k + 1) * num;
                this.showScoreLabel.string = this.score + "";
            }, this),
            cc.scaleTo(0.1, 1)
        ));
    },
});

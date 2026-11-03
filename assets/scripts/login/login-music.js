cc.Class({
    extends: cc.Component,

    properties: {
        bgm: {
            type: cc.AudioClip,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.audioEngine.setMusicVolume(0.2)
    },

    start() {
        //cc.audioEngine.playMusic(this.bgm, true);
        if (!cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.playMusic(this.bgm, true);
        }
    },

    // update (dt) {},
});

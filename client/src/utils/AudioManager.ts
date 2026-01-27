// AudioManager - BGM と SE の再生を管理するクラス

class AudioManager {
    private bgm: HTMLAudioElement | null = null;
    private seMap: Map<string, HTMLAudioElement> = new Map();
    private bgmVolume: number = 0.3;
    private seVolume: number = 0.5;
    private isBgmPlaying: boolean = false;

    constructor() {
        this.initializeBGM();
        this.initializeSE();
    }

    /**
     * BGM の初期化
     */
    private initializeBGM() {
        try {
            this.bgm = new Audio('/assets/audio/bgm_main.mp3');
            this.bgm.loop = true;
            this.bgm.volume = this.bgmVolume;
        } catch (error) {
            console.warn('BGM の初期化に失敗しました:', error);
        }
    }

    /**
     * SE の初期化
     */
    private initializeSE() {
        const seFiles = ['se_drop', 'se_role', 'se_win', 'se_newrecord'];

        seFiles.forEach(seName => {
            try {
                const audio = new Audio(`/assets/audio/${seName}.mp3`);
                audio.volume = this.seVolume;
                this.seMap.set(seName, audio);
            } catch (error) {
                console.warn(`SE ${seName} の初期化に失敗しました:`, error);
            }
        });
    }

    /**
     * BGM を再生
     */
    playBGM() {
        if (this.bgm && !this.isBgmPlaying) {
            this.bgm.play().catch(error => {
                console.warn('BGM の再生に失敗しました:', error);
            });
            this.isBgmPlaying = true;
        }
    }

    /**
     * BGM を停止
     */
    stopBGM() {
        if (this.bgm && this.isBgmPlaying) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
            this.isBgmPlaying = false;
        }
    }

    /**
     * SE を再生
     */
    playSE(seName: 'se_drop' | 'se_role' | 'se_win' | 'se_newrecord') {
        const se = this.seMap.get(seName);
        if (se) {
            // 既に再生中の場合は最初から再生し直す
            se.currentTime = 0;
            se.play().catch(error => {
                console.warn(`SE ${seName} の再生に失敗しました:`, error);
            });
        }
    }

    /**
     * BGM の音量を設定
     */
    setBGMVolume(volume: number) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
    }

    /**
     * SE の音量を設定
     */
    setSEVolume(volume: number) {
        this.seVolume = Math.max(0, Math.min(1, volume));
        this.seMap.forEach(se => {
            se.volume = this.seVolume;
        });
    }

    /**
     * BGM が再生中かどうか
     */
    isBGMPlaying(): boolean {
        return this.isBgmPlaying;
    }
}

// シングルトンインスタンス
export const audioManager = new AudioManager();

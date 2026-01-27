// ScoreManager - ハイスコアデータの保存・取得を管理するクラス

export interface ScoreEntry {
    name: string;
    score: number;
    date: string; // ISO 8601 形式
}

class ScoreManager {
    private readonly ALL_TIME_KEY = 'connectx_alltime_scores';
    private readonly TODAY_KEY = 'connectx_today_scores';

    /**
     * ALL-TIME TOP 3 を取得
     */
    getAllTimeTop3(): ScoreEntry[] {
        const scores = this.loadScores(this.ALL_TIME_KEY);
        return scores.slice(0, 3);
    }

    /**
     * TODAY'S BEST を取得
     */
    getTodayBest(): ScoreEntry | null {
        const today = this.getTodayString();
        const scores = this.loadScores(this.TODAY_KEY);

        // 今日のスコアのみをフィルタリング
        const todayScores = scores.filter(entry => {
            const entryDate = entry.date.split('T')[0];
            return entryDate === today;
        });

        return todayScores.length > 0 ? todayScores[0] : null;
    }

    /**
     * スコアを保存（必要に応じてランキングを更新）
     */
    saveScore(name: string, score: number): { isAllTimeRecord: boolean; isTodayRecord: boolean } {
        const entry: ScoreEntry = {
            name,
            score,
            date: new Date().toISOString()
        };

        const isAllTimeRecord = this.updateAllTimeScores(entry);
        const isTodayRecord = this.updateTodayScores(entry);

        return { isAllTimeRecord, isTodayRecord };
    }

    /**
     * ALL-TIME スコアを更新
     */
    private updateAllTimeScores(entry: ScoreEntry): boolean {
        const scores = this.loadScores(this.ALL_TIME_KEY);
        scores.push(entry);
        scores.sort((a, b) => b.score - a.score);

        const isRecord = scores.indexOf(entry) < 3;

        // TOP 10 のみ保存
        const top10 = scores.slice(0, 10);
        this.saveScores(this.ALL_TIME_KEY, top10);

        return isRecord;
    }

    /**
     * TODAY スコアを更新
     */
    private updateTodayScores(entry: ScoreEntry): boolean {
        const scores = this.loadScores(this.TODAY_KEY);
        const today = this.getTodayString();

        // 古いデータを削除（7日以上前）
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const filteredScores = scores.filter(s => {
            const scoreDate = new Date(s.date);
            return scoreDate >= sevenDaysAgo;
        });

        filteredScores.push(entry);
        filteredScores.sort((a, b) => b.score - a.score);

        // 今日のベストスコアかチェック
        const todayScores = filteredScores.filter(s => {
            const entryDate = s.date.split('T')[0];
            return entryDate === today;
        });
        const isRecord = todayScores.length > 0 && todayScores[0].score === entry.score;

        this.saveScores(this.TODAY_KEY, filteredScores);

        return isRecord;
    }

    /**
     * スコアをローカルストレージから読み込み
     */
    private loadScores(key: string): ScoreEntry[] {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('スコアの読み込みに失敗しました:', error);
            return [];
        }
    }

    /**
     * スコアをローカルストレージに保存
     */
    private saveScores(key: string, scores: ScoreEntry[]) {
        try {
            localStorage.setItem(key, JSON.stringify(scores));
        } catch (error) {
            console.error('スコアの保存に失敗しました:', error);
        }
    }

    /**
     * 今日の日付文字列を取得（YYYY-MM-DD）
     */
    private getTodayString(): string {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * ベストスコアを取得（ALL-TIME TOP 1）
     */
    getBestScore(): number {
        const scores = this.loadScores(this.ALL_TIME_KEY);
        return scores.length > 0 ? scores[0].score : 0;
    }
}

// シングルトンインスタンス
export const scoreManager = new ScoreManager();

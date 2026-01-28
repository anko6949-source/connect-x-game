// ScoreManager - ハイスコアデータの保存・取得を管理するクラス（サーバーAPI連携版）

export interface ScoreEntry {
    name: string;
    score: number;
    date: string; // ISO 8601 形式
}

class ScoreManager {
    private get apiUrl() {
        return import.meta.env.VITE_API_URL || 'http://localhost:3000';
    }

    /**
     * ALL-TIME TOP 3 を取得
     */
    async getAllTimeTop3(): Promise<ScoreEntry[]> {
        try {
            const response = await fetch(`${this.apiUrl}/scores/top3`);
            if (!response.ok) throw new Error('Failed to fetch top3');
            const data = await response.json();
            return data.scores || [];
        } catch (error) {
            console.error('Failed to get top3 scores:', error);
            return [];
        }
    }

    /**
     * TODAY'S BEST を取得
     */
    async getTodayBest(): Promise<ScoreEntry | null> {
        try {
            const response = await fetch(`${this.apiUrl}/scores/today`);
            if (!response.ok) throw new Error('Failed to fetch today best');
            const data = await response.json();
            return data.score || null;
        } catch (error) {
            console.error('Failed to get today best:', error);
            return null;
        }
    }

    /**
     * スコアを保存
     * サーバーからのレスポンスで新記録かどうかを判定して返す
     */
    async saveScore(name: string, score: number): Promise<{ isNewRecord: boolean }> {
        try {
            const response = await fetch(`${this.apiUrl}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, score }),
            });

            if (!response.ok) throw new Error('Failed to save score');

            const data = await response.json();
            return { isNewRecord: data.isNewRecord };
        } catch (error) {
            console.error('Failed to save score:', error);
            return { isNewRecord: false };
        }
    }
}

// シングルトンインスタンス
export const scoreManager = new ScoreManager();

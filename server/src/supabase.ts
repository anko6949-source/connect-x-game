import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// 環境変数の検証
// サーバー起動時にチェックされるため、ここでの厳密なエラーソローは避けるか、
// あるいは必須とするか。今回はログを出してクライアント作成を試みる方針。
if (!supabaseUrl || !supabaseKey) {
    console.error('Warning: Supabase credentials not found in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface ScoreEntry {
    name: string;
    score: number;
    date: string;
}

/**
 * JST（日本標準時）で今日の日付を取得 (YYYY-MM-DD)
 */
export function getTodayJST(): string {
    const now = new Date();
    // UTCから+9時間でJSTに変換
    const jstOffset = 9 * 60;
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    return jstTime.toISOString().split('T')[0];
}

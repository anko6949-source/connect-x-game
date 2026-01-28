import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// 環境変数の検証（Fail Fast: 設定がない場合は起動させない）
if (!supabaseUrl || !supabaseKey) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('FATAL ERROR: Supabase environment variables are missing!');
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in Render dashboard.');
    console.error('Current URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('Current Key:', supabaseKey ? 'Set' : 'Missing');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    process.exit(1);
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

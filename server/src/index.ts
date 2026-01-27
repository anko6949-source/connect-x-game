import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { GameRoom } from './GameRoom.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// ルーム管理
const rooms = new Map<string, GameRoom>();

/**
 * ルームID生成
 */
function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
}

/**
 * POST /room/create
 * ルーム作成
 */
app.post('/room/create', (req: Request, res: Response) => {
    try {
        const { playerName, isCPUGame } = req.body;

        if (!playerName) {
            return res.status(400).json({ error: 'Player name is required' });
        }

        const roomId = generateRoomId();
        const room = new GameRoom(roomId, isCPUGame || false);

        const playerId = `player-${Date.now()}`;
        room.addPlayer(playerId, playerName);

        rooms.set(roomId, room);

        res.json({
            roomId,
            playerId,
            state: room.getState()
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

/**
 * POST /room/join
 * ルーム参加
 */
app.post('/room/join', (req: Request, res: Response) => {
    try {
        const { roomId, playerName } = req.body;

        if (!roomId || !playerName) {
            return res.status(400).json({ error: 'Room ID and player name are required' });
        }

        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const playerId = `player-${Date.now()}`;
        const success = room.addPlayer(playerId, playerName);

        if (!success) {
            return res.status(400).json({ error: 'Room is full' });
        }

        res.json({
            playerId,
            state: room.getState()
        });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
});

/**
 * POST /room/start
 * ゲーム開始
 */
app.post('/room/start', (req: Request, res: Response) => {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ error: 'Room ID is required' });
        }

        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const success = room.startGame();
        if (!success) {
            return res.status(400).json({ error: 'Cannot start game' });
        }

        res.json({
            state: room.getState()
        });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
});

/**
 * POST /room/move
 * コマ配置
 */
app.post('/room/move', (req: Request, res: Response) => {
    try {
        const { roomId, playerId, column } = req.body;

        if (!roomId || !playerId || column === undefined) {
            return res.status(400).json({ error: 'Room ID, player ID, and column are required' });
        }

        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const state = room.getState();
        const playerIndex = state.players.findIndex(p => p.id === playerId);

        if (playerIndex === -1) {
            return res.status(403).json({ error: 'Player not in this room' });
        }

        const success = room.makeMove(playerIndex, column);
        if (!success) {
            return res.status(400).json({ error: 'Invalid move' });
        }

        // CPU対戦の場合、CPUの手番を自動実行
        if (state.isCPUGame && room.getState().status === 'playing') {
            setTimeout(() => {
                room.makeCPUMove();
            }, 2000); // 2秒後にCPUが手を打つ
        }

        res.json({
            state: room.getState()
        });
    } catch (error) {
        console.error('Error making move:', error);
        res.status(500).json({ error: 'Failed to make move' });
    }
});

/**
 * GET /room/state
 * 状態取得
 */
app.get('/room/state', (req: Request, res: Response) => {
    try {
        const { roomId } = req.query;

        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({ error: 'Room ID is required' });
        }

        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({
            state: room.getState()
        });
    } catch (error) {
        console.error('Error getting state:', error);
        res.status(500).json({ error: 'Failed to get state' });
    }
});

/**
 * POST /room/rematch
 * 再戦
 */
app.post('/room/rematch', (req: Request, res: Response) => {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ error: 'Room ID is required' });
        }

        const room = rooms.get(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        room.rematch();

        res.json({
            state: room.getState()
        });
    } catch (error) {
        console.error('Error rematching:', error);
        res.status(500).json({ error: 'Failed to rematch' });
    }
});

/**
 * POST /scores
 * スコア保存
 */
app.post('/scores', async (req: Request, res: Response) => {
    console.log('📝 POST /scores - Request received');
    console.log('Request body:', req.body);

    try {
        const { name, score } = req.body;

        if (!name || score === undefined) {
            console.log('❌ Validation failed: name or score missing');
            return res.status(400).json({ error: 'Name and score are required' });
        }

        console.log(`🎯 Saving score: ${name} - ${score}`);

        const { supabase } = await import('./supabase.js');

        // スコアを保存
        console.log('💾 Attempting to insert into Supabase...');
        const { data: insertData, error: insertError } = await supabase
            .from('scores')
            .insert([
                {
                    player_name: name,
                    score: score
                }
            ])
            .select();

        if (insertError) {
            console.error('❌ Supabase insert error:', insertError);
            return res.status(500).json({ error: 'Failed to save score', details: insertError.message });
        }

        console.log('✅ Score saved successfully:', insertData);

        // TOP 3を取得して新記録か判定
        console.log('🔍 Fetching TOP 3 for new record check...');
        const { data: top3, error: top3Error } = await supabase
            .from('scores')
            .select('score')
            .order('score', { ascending: false })
            .limit(3);

        if (top3Error) {
            console.error('❌ Error fetching top3:', top3Error);
        } else {
            console.log('📊 Current TOP 3:', top3);
        }

        const isNewRecord = top3 && top3.length > 0 ? score >= top3[0].score : true;
        console.log(`🏆 Is new record: ${isNewRecord}`);

        res.json({
            success: true,
            isNewRecord
        });
        console.log('✅ Response sent successfully');
    } catch (error) {
        console.error('❌ Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

/**
 * GET /scores/top3
 * ALL-TIME TOP 3取得
 */
app.get('/scores/top3', async (req: Request, res: Response) => {
    try {
        const { supabase } = await import('./supabase.js');

        const { data, error } = await supabase
            .from('scores')
            .select('player_name, score, created_at')
            .order('score', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error fetching top3:', error);
            return res.status(500).json({ error: 'Failed to fetch top scores' });
        }

        const scores = (data || []).map(entry => ({
            name: entry.player_name,
            score: entry.score,
            date: entry.created_at
        }));

        res.json({ scores });
    } catch (error) {
        console.error('Error fetching top3:', error);
        res.status(500).json({ error: 'Failed to fetch top scores' });
    }
});

/**
 * GET /scores/today
 * TODAY'S BEST取得（JST基準）
 */
app.get('/scores/today', async (req: Request, res: Response) => {
    try {
        const { supabase, getTodayJST } = await import('./supabase.js');
        const todayJST = getTodayJST();

        // JSTで今日の開始時刻と終了時刻を計算
        const startOfDayJST = new Date(`${todayJST}T00:00:00+09:00`);
        const endOfDayJST = new Date(`${todayJST}T23:59:59+09:00`);

        const { data, error } = await supabase
            .from('scores')
            .select('player_name, score, created_at')
            .gte('created_at', startOfDayJST.toISOString())
            .lte('created_at', endOfDayJST.toISOString())
            .order('score', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching today best:', error);
            return res.status(500).json({ error: 'Failed to fetch today best' });
        }

        const score = data && data.length > 0 ? {
            name: data[0].player_name,
            score: data[0].score,
            date: data[0].created_at
        } : null;

        res.json({ score });
    } catch (error) {
        console.error('Error fetching today best:', error);
        res.status(500).json({ error: 'Failed to fetch today best' });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

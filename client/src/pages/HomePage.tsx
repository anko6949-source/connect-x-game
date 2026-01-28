import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../api';
import { scoreManager, ScoreEntry } from '../utils/ScoreManager';
import { audioManager } from '../utils/AudioManager';
import './HomePage.css';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [allTimeTop3, setAllTimeTop3] = useState<ScoreEntry[]>([]);
    const [todayBest, setTodayBest] = useState<ScoreEntry | null>(null);

    useEffect(() => {
        // スコアデータを読み込み
        const fetchScores = async () => {
            const top3 = await scoreManager.getAllTimeTop3();
            setAllTimeTop3(top3);

            const today = await scoreManager.getTodayBest();
            setTodayBest(today);
        };
        fetchScores();
    }, []);

    // BGM の再生開始
    useEffect(() => {
        audioManager.playBGM();
    }, []);

    const handleCreateRoom = async (isCPUGame: boolean) => {
        if (!playerName.trim()) {
            setError('プレイヤー名を入力してください');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Creating room...', { playerName, isCPUGame });
            const response = await createRoom(playerName, isCPUGame);
            console.log('Room created:', response);
            localStorage.setItem('roomId', response.roomId);
            localStorage.setItem('playerId', response.playerId);
            navigate(`/game/${response.roomId}`);
        } catch (err: any) {
            console.error('Failed to create room:', err);

            // より詳細なエラーメッセージを表示
            if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
                setError('サーバーに接続できません。サーバーが起動しているか確認してください。(http://localhost:3000)');
            } else if (err.message.includes('Failed to create room')) {
                setError('ルームの作成に失敗しました。もう一度お試しください。');
            } else {
                setError(`エラーが発生しました: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!playerName.trim()) {
            setError('プレイヤー名を入力してください');
            return;
        }

        if (!roomCode.trim()) {
            setError('ルームコードを入力してください');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await joinRoom(roomCode.toUpperCase(), playerName);
            localStorage.setItem('roomId', roomCode.toUpperCase());
            localStorage.setItem('playerId', response.playerId);
            navigate(`/game/${roomCode.toUpperCase()}`);
        } catch (err) {
            setError('ルームへの参加に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-page">
            <div className="home-container fade-in">
                <h1 className="game-title">CONNECT X</h1>
                <p className="game-subtitle">形を作って得点を競え！</p>
                <div className="version-tag">v1.1</div>

                {/* スコア表示 */}
                <div className="score-display">
                    <div className="score-section">
                        <h3>🏆 ALL-TIME TOP 3</h3>
                        {allTimeTop3.length > 0 ? (
                            <ol className="score-list">
                                {allTimeTop3.map((entry, index) => (
                                    <li key={index}>
                                        <span className="score-name">{entry.name}</span>
                                        <span className="score-value">{entry.score}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="no-score">---</p>
                        )}
                    </div>
                    <div className="score-section">
                        <h3>⭐ TODAY'S BEST</h3>
                        {todayBest ? (
                            <div className="today-best">
                                <span className="score-name">{todayBest.name}</span>
                                <span className="score-value">{todayBest.score}</span>
                            </div>
                        ) : (
                            <p className="no-score">---</p>
                        )}
                    </div>
                </div>

                <div className="home-card">
                    <div className="input-group">
                        <label htmlFor="playerName">プレイヤー名</label>
                        <input
                            id="playerName"
                            type="text"
                            className="input"
                            placeholder="名前を入力"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={20}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="mode-selection">
                        <h2>モード選択</h2>

                        <button
                            className="btn btn-primary mode-btn"
                            onClick={() => handleCreateRoom(true)}
                            disabled={loading}
                        >
                            <span className="mode-icon">🤖</span>
                            <span className="mode-text">
                                <strong>CPU対戦</strong>
                                <small>1人でプレイ</small>
                            </span>
                        </button>

                        <button
                            className="btn btn-primary mode-btn"
                            onClick={() => handleCreateRoom(false)}
                            disabled={loading}
                        >
                            <span className="mode-icon">🎮</span>
                            <span className="mode-text">
                                <strong>オンライン対戦</strong>
                                <small>ルームを作成</small>
                            </span>
                        </button>

                        <div className="divider">
                            <span>または</span>
                        </div>

                        <div className="join-section">
                            <input
                                type="text"
                                className="input"
                                placeholder="ルームコード"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={handleJoinRoom}
                                disabled={loading}
                            >
                                ルームに参加
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

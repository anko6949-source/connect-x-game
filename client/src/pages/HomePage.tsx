import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../api';
import './HomePage.css';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateRoom = async (isCPUGame: boolean) => {
        if (!playerName.trim()) {
            setError('プレイヤー名を入力してください');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createRoom(playerName, isCPUGame);
            localStorage.setItem('roomId', response.roomId);
            localStorage.setItem('playerId', response.playerId);
            navigate(`/game/${response.roomId}`);
        } catch (err) {
            setError('ルームの作成に失敗しました');
            console.error(err);
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

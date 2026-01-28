import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState, getRoomState, makeMove, startGame, rematch } from '../api';
import { GameBoard } from '../components/GameBoard';
import { TemplateDisplay } from '../components/TemplateDisplay';
import { GameInfo } from '../components/GameInfo';
import { GameEndModal } from '../components/GameEndModal';
import { NewRecordModal } from '../components/NewRecordModal';
import { audioManager } from '../utils/AudioManager';
import { scoreManager } from '../utils/ScoreManager';
import './GamePage.css';

export const GamePage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerId, setPlayerId] = useState<string>('');
    const [showTemplates, setShowTemplates] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showGameEnd, setShowGameEnd] = useState(false);
    const [showNewRecord, setShowNewRecord] = useState(false);
    const [newRecordData, setNewRecordData] = useState<{ score: number; playerName: string } | null>(null);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [previousStatus, setPreviousStatus] = useState<string>('');

    useEffect(() => {
        const storedPlayerId = localStorage.getItem('playerId');
        if (!storedPlayerId) {
            navigate('/');
            return;
        }
        setPlayerId(storedPlayerId);
    }, [navigate]);

    // BGM の再生開始
    useEffect(() => {
        audioManager.playBGM();
    }, []);

    // ポーリングで状態を取得
    useEffect(() => {
        if (!roomId || !playerId) return;

        const fetchState = async () => {
            try {
                const response = await getRoomState(roomId);
                const newState = response.state;

                // 初回のゲーム開始時にお題を全画面表示
                if (gameState?.status !== 'playing' && newState.status === 'playing') {
                    setShowTemplates(true);
                    setTimeout(() => {
                        setShowTemplates(false);
                    }, 4000);
                }

                // 役成立時の SE 再生
                if (newState.lastScoreResults && newState.lastScoreResults.length > 0) {
                    if (!gameState?.lastScoreResults || gameState.lastScoreResults.length === 0) {
                        audioManager.playSE('se_role');
                    }
                }

                // ゲーム終了判定
                if (previousStatus !== 'finished' && newState.status === 'finished') {
                    setIsInputDisabled(true);

                    // CPU対戦の場合、ハイスコア判定
                    if (newState.isCPUGame) {
                        const playerIndex = newState.players.findIndex((p: { id: string }) => p.id === playerId);
                        const playerScore = newState.scores[playerIndex];
                        const playerName = newState.players[playerIndex].name;

                        // 非同期でスコアを保存し、新記録かどうか判定
                        scoreManager.saveScore(playerName, playerScore).then(({ isNewRecord }) => {
                            if (isNewRecord) {
                                // ハイスコア更新
                                setNewRecordData({ score: playerScore, playerName });
                                setShowNewRecord(true);
                                audioManager.playSE('se_newrecord');
                            } else {
                                audioManager.playSE('se_win');
                            }
                        });
                    } else {
                        audioManager.playSE('se_win');
                    }

                    // 2秒後に勝敗画面を表示
                    setTimeout(() => {
                        setShowGameEnd(true);
                        setIsInputDisabled(false);
                    }, 2000);
                }

                setPreviousStatus(newState.status);
                setGameState(newState);
                setLoading(false);
            } catch (err) {
                setError('ルームの取得に失敗しました');
                console.error(err);
                setLoading(false);
            }
        };

        fetchState();
        const interval = setInterval(fetchState, 1000); // 1秒ごとにポーリング

        return () => clearInterval(interval);
    }, [roomId, playerId, gameState?.status, previousStatus]);

    const handleStartGame = async () => {
        if (!roomId) return;

        try {
            await startGame(roomId);
        } catch (err) {
            setError('ゲームの開始に失敗しました');
            console.error(err);
        }
    };

    const handleColumnClick = async (column: number) => {
        if (!roomId || !playerId || !gameState || isInputDisabled) return;

        try {
            await makeMove(roomId, playerId, column);
            // コマ落下 SE を再生
            audioManager.playSE('se_drop');
        } catch (err) {
            console.error('Failed to make move:', err);
        }
    };

    const handleRematch = async () => {
        if (!roomId) return;

        try {
            setShowGameEnd(false);
            setShowNewRecord(false);
            setNewRecordData(null);
            await rematch(roomId);
        } catch (err) {
            setError('再戦の開始に失敗しました');
            console.error(err);
        }
    };

    const handleExit = () => {
        localStorage.removeItem('roomId');
        localStorage.removeItem('playerId');
        navigate('/');
    };

    const handleCopyRoomCode = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            alert('ルームコードをコピーしました！');
        }
    };

    if (loading) {
        return (
            <div className="game-page">
                <div className="loading">読み込み中...</div>
            </div>
        );
    }

    if (error || !gameState) {
        return (
            <div className="game-page">
                <div className="error">{error || 'エラーが発生しました'}</div>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    ホームに戻る
                </button>
            </div>
        );
    }

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    const isHost = playerIndex === 0;

    return (
        <div className="game-page">
            {/* お題全画面表示 */}
            {showTemplates && (
                <TemplateDisplay
                    templates={gameState.selectedTemplates}
                    fullScreen={true}
                />
            )}

            {/* ハイスコア更新演出 */}
            {showNewRecord && newRecordData && (
                <NewRecordModal
                    score={newRecordData.score}
                    playerName={newRecordData.playerName}
                    onClose={() => setShowNewRecord(false)}
                />
            )}

            {/* ゲーム終了モーダル */}
            {showGameEnd && gameState.status === 'finished' && (
                <GameEndModal
                    gameState={gameState}
                    playerId={playerId}
                    onRematch={handleRematch}
                    onExit={handleExit}
                />
            )}

            {/* ヘッダー */}
            <div className="game-header">
                <h2>CONNECT X</h2>
                <div className="room-info">
                    <span>ルーム: {roomId}</span>
                    <button className="btn-copy" onClick={handleCopyRoomCode}>
                        📋 コピー
                    </button>
                </div>
            </div>

            {/* ロビー画面 */}
            {gameState.status === 'waiting' && (
                <div className="lobby fade-in">
                    <h2>プレイヤーを待っています...</h2>
                    <p>ルームコードを共有してください: <strong>{roomId}</strong></p>
                    <div className="players-waiting">
                        {gameState.players.map((player, index) => (
                            <div key={player.id} className="player-waiting">
                                <div className={`player-indicator player${index + 1}`} />
                                <span>{player.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 開始待機画面 */}
            {gameState.status === 'ready' && (
                <div className="ready-screen fade-in">
                    <h2>準備完了！</h2>
                    {isHost ? (
                        <button className="btn btn-primary" onClick={handleStartGame}>
                            ゲーム開始
                        </button>
                    ) : (
                        <p>ホストがゲームを開始するのを待っています...</p>
                    )}
                </div>
            )}

            {/* ゲーム画面 */}
            {gameState.status === 'playing' && (
                <div className="game-content">
                    <div className="game-main">
                        <GameInfo gameState={gameState} playerId={playerId} />
                        <GameBoard
                            gameState={gameState}
                            playerId={playerId}
                            onColumnClick={handleColumnClick}
                        />
                    </div>
                    <TemplateDisplay templates={gameState.selectedTemplates} />
                </div>
            )}
        </div>
    );
};

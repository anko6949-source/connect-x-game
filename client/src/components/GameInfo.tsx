import React from 'react';
import { GameState } from '../api';
import './GameInfo.css';

interface GameInfoProps {
    gameState: GameState;
    playerId: string;
}

export const GameInfo: React.FC<GameInfoProps> = ({ gameState, playerId }) => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    const isMyTurn = gameState.currentTurn === playerIndex;

    return (
        <div className="game-info">
            {/* プレイヤー情報 */}
            <div className="players-info">
                {gameState.players.map((player, index) => (
                    <div
                        key={player.id}
                        className={`player-card ${index === gameState.currentTurn ? 'active' : ''} ${index === playerIndex ? 'me' : ''
                            }`}
                    >
                        <div className={`player-indicator player${index + 1}`} />
                        <div className="player-details">
                            <h3 className="player-name">
                                {player.name}
                                {index === playerIndex && ' (あなた)'}
                            </h3>
                            <p className="player-score">{gameState.scores[index]}pt</p>
                        </div>
                        {index === gameState.currentTurn && gameState.status === 'playing' && (
                            <div className="turn-indicator pulse">手番</div>
                        )}
                    </div>
                ))}
            </div>

            {/* ゲーム状態 */}
            <div className="game-status">
                {gameState.status === 'waiting' && <p>プレイヤーを待っています...</p>}
                {gameState.status === 'ready' && <p>ゲーム開始準備完了</p>}
                {gameState.status === 'playing' && (
                    <p className="status-playing">
                        {isMyTurn ? 'あなたの手番です！' : `${gameState.players[gameState.currentTurn].name}の手番`}
                    </p>
                )}
            </div>
        </div>
    );
};

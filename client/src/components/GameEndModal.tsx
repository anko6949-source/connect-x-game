import React from 'react';
import { GameState } from '../api';
import './GameEndModal.css';

interface GameEndModalProps {
    gameState: GameState;
    playerId: string;
    onRematch: () => void;
    onExit: () => void;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
    gameState,
    playerId,
    onRematch,
    onExit
}) => {
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    const isWinner = gameState.winner === playerIndex;
    const isDraw = gameState.winner === null;

    let resultText = '';
    let resultClass = '';

    if (isDraw) {
        resultText = '引き分け！';
        resultClass = 'draw';
    } else if (isWinner) {
        resultText = '勝利！';
        resultClass = 'win';
    } else {
        resultText = '敗北...';
        resultClass = 'lose';
    }

    return (
        <div className="game-end-overlay fade-in">
            <div className={`game-end-modal ${resultClass}`}>
                <h1 className="result-title">{resultText}</h1>

                <div className="final-scores">
                    {gameState.players.map((player, index) => (
                        <div key={player.id} className="final-score-item">
                            <div className={`score-indicator player${index + 1}`} />
                            <span className="score-player-name">{player.name}</span>
                            <span className="score-value">{gameState.scores[index]}pt</span>
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={onRematch}>
                        再戦
                    </button>
                    <button className="btn btn-secondary" onClick={onExit}>
                        退出
                    </button>
                </div>
            </div>
        </div>
    );
};

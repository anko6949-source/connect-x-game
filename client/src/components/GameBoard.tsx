import React, { useState, useEffect } from 'react';
import { GameState, Position } from '../api';
import './GameBoard.css';

interface GameBoardProps {
    gameState: GameState;
    playerId: string;
    onColumnClick: (column: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, playerId, onColumnClick }) => {
    const [animatingPiece, setAnimatingPiece] = useState<{ col: number; row: number; player: number } | null>(null);
    const [glowingCells, setGlowingCells] = useState<Position[]>([]);

    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    const isMyTurn = gameState.currentTurn === playerIndex && gameState.status === 'playing';

    // 形成立時の発光演出
    useEffect(() => {
        if (gameState.lastScoreResults.length > 0) {
            const allPositions: Position[] = [];
            gameState.lastScoreResults.forEach(result => {
                allPositions.push(...result.positions);
            });

            setGlowingCells(allPositions);

            setTimeout(() => {
                setGlowingCells([]);
            }, 800);
        }
    }, [gameState.lastScoreResults]);

    // コマ落下アニメーション（一度だけ実行）
    useEffect(() => {
        if (gameState.lastMove) {
            const [col, row] = gameState.lastMove;
            const player = gameState.board[row][col];

            setAnimatingPiece({ col, row, player });

            setTimeout(() => {
                setAnimatingPiece(null);
            }, 1500);
        }
    }, [gameState.lastMove?.[0], gameState.lastMove?.[1]]);

    const handleColumnClick = (col: number) => {
        if (!isMyTurn) return;
        if (gameState.board[0][col] !== 0) return; // 列が満杯

        onColumnClick(col);
    };

    const isCellGlowing = (col: number, row: number): boolean => {
        return glowingCells.some(([c, r]) => c === col && r === row);
    };

    const isAnimating = (col: number, row: number): boolean => {
        return animatingPiece?.col === col && animatingPiece?.row === row;
    };

    return (
        <div className="game-board-container">
            <div className="game-board">
                {/* 列選択ボタン */}
                <div className="column-selectors">
                    {[0, 1, 2, 3, 4, 5, 6].map(col => (
                        <button
                            key={col}
                            className={`column-selector ${isMyTurn ? 'active' : ''}`}
                            onClick={() => handleColumnClick(col)}
                            disabled={!isMyTurn || gameState.board[0][col] !== 0}
                        >
                            ▼
                        </button>
                    ))}
                </div>

                {/* ボード */}
                <div className="board-grid">
                    {gameState.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="board-row">
                            {row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`board-cell ${cell === 1 ? 'player1' : cell === 2 ? 'player2' : ''} ${isCellGlowing(colIndex, rowIndex) ? 'glowing' : ''
                                        } ${isAnimating(colIndex, rowIndex) ? 'animating' : ''}`}
                                >
                                    {cell !== 0 && <div className="piece" />}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 得点ポップアップ */}
            {gameState.lastScoreResults.length > 0 && (
                <div className={`score-popup fade-in ${gameState.lastScoreResults.length >= 2 ? 'multi-combo' : ''}`}>
                    {gameState.lastScoreResults.length >= 2 && (
                        <div className="combo-header">
                            🎉 {gameState.lastScoreResults.length}役同時成立！ 🎉
                        </div>
                    )}
                    {gameState.lastScoreResults.map((result, index) => (
                        <div key={index} className="score-item">
                            <span className="template-name">{result.template.name}</span>
                            <span className="points">+{result.points}pt</span>
                        </div>
                    ))}
                    {gameState.lastScoreResults.length >= 2 && (
                        <div className="combo-total">
                            合計: +{gameState.lastScoreResults.reduce((sum, r) => sum + r.points, 0)}pt
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

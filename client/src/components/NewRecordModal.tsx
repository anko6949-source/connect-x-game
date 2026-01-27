import React, { useEffect } from 'react';
import './NewRecordModal.css';

interface NewRecordModalProps {
    score: number;
    playerName: string;
    onClose: () => void;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({ score, playerName, onClose }) => {
    useEffect(() => {
        // 1.5秒後に自動的に閉じる
        const timer = setTimeout(() => {
            onClose();
        }, 1500);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="new-record-overlay">
            <div className="new-record-modal">
                <div className="new-record-icon">🏆</div>
                <h2 className="new-record-title">NEW RECORD!</h2>
                <div className="new-record-details">
                    <div className="new-record-score">Score: {score}</div>
                    <div className="new-record-player">Player: {playerName}</div>
                </div>
            </div>
        </div>
    );
};

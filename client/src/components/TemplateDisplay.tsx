import React from 'react';
import { Template } from '../api';
import './TemplateDisplay.css';

interface TemplateDisplayProps {
    templates: Template[];
    fullScreen?: boolean;
    onClose?: () => void;
}

export const TemplateDisplay: React.FC<TemplateDisplayProps> = ({
    templates,
    fullScreen = false,
    onClose
}) => {
    const renderTemplate = (template: Template) => {
        // 相対座標から表示用のグリッドを生成
        const positions = template.positions;
        const minX = Math.min(...positions.map(p => p[0]));
        const maxX = Math.max(...positions.map(p => p[0]));
        const minY = Math.min(...positions.map(p => p[1]));
        const maxY = Math.max(...positions.map(p => p[1]));

        const width = maxX - minX + 1;
        const height = maxY - minY + 1;

        const grid: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

        positions.forEach(([x, y]) => {
            grid[y - minY][x - minX] = true;
        });

        return (
            <div className="template-grid">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="template-row">
                        {row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`template-cell ${cell ? 'filled' : 'empty'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    if (fullScreen) {
        return (
            <div className="template-fullscreen fade-in">
                <div className="fullscreen-content">
                    <h1 className="fullscreen-title">今回のお題</h1>
                    <div className="templates-grid-fullscreen">
                        {templates.map(template => (
                            <div key={template.id} className="template-card-fullscreen">
                                <div className="template-visual">
                                    {renderTemplate(template)}
                                </div>
                                <div className="template-info">
                                    <h3>{template.name}</h3>
                                    <p className="template-points">{template.points}pt</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {onClose && (
                        <p className="fullscreen-hint">まもなくゲーム開始...</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="template-sidebar">
            <h3 className="sidebar-title">お題</h3>
            <div className="templates-list">
                {templates.map(template => (
                    <div key={template.id} className="template-card">
                        <div className="template-visual-small">
                            {renderTemplate(template)}
                        </div>
                        <div className="template-info-small">
                            <span className="template-name-small">{template.name}</span>
                            <span className="template-points-small">{template.points}pt</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

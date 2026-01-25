// 型定義（サーバーと同期）
export type Position = [number, number];

export interface Template {
    id: string;
    name: string;
    positions: Position[];
    points: number;
    size: number;
}

export interface Player {
    id: string;
    name: string;
    isReady: boolean;
}

export type GameStatus = 'waiting' | 'ready' | 'playing' | 'finished';

export interface ScoreResult {
    template: Template;
    positions: Position[];
    points: number;
}

export interface GameState {
    roomId: string;
    players: Player[];
    board: number[][];
    scores: number[];
    currentTurn: number;
    selectedTemplates: Template[];
    status: GameStatus;
    winner: number | null;
    lastMove: Position | null;
    lastScoreResults: ScoreResult[];
    isCPUGame: boolean;
}

// API関数
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function createRoom(playerName: string, isCPUGame: boolean = false) {
    const response = await fetch(`${API_URL}/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, isCPUGame })
    });

    if (!response.ok) {
        throw new Error('Failed to create room');
    }

    return response.json();
}

export async function joinRoom(roomId: string, playerName: string) {
    const response = await fetch(`${API_URL}/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerName })
    });

    if (!response.ok) {
        throw new Error('Failed to join room');
    }

    return response.json();
}

export async function startGame(roomId: string) {
    const response = await fetch(`${API_URL}/room/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
    });

    if (!response.ok) {
        throw new Error('Failed to start game');
    }

    return response.json();
}

export async function makeMove(roomId: string, playerId: string, column: number) {
    const response = await fetch(`${API_URL}/room/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId, column })
    });

    if (!response.ok) {
        throw new Error('Failed to make move');
    }

    return response.json();
}

export async function getRoomState(roomId: string) {
    const response = await fetch(`${API_URL}/room/state?roomId=${roomId}`);

    if (!response.ok) {
        throw new Error('Failed to get room state');
    }

    return response.json();
}

export async function rematch(roomId: string) {
    const response = await fetch(`${API_URL}/room/rematch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
    });

    if (!response.ok) {
        throw new Error('Failed to rematch');
    }

    return response.json();
}

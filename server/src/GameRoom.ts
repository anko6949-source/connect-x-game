import { Template, selectRandomTemplates } from './templates.js';
import { Board, ScoreResult, checkPatterns, calculateScore } from './scoring.js';
import { CPUPlayer } from './cpu.js';
import { Position } from './templates.js';

export interface Player {
    id: string;
    name: string;
    isReady: boolean;
}

export type GameStatus = 'waiting' | 'ready' | 'playing' | 'finished';

export interface GameState {
    roomId: string;
    players: Player[];
    board: Board;
    scores: number[];
    currentTurn: number; // 0 or 1
    selectedTemplates: Template[];
    status: GameStatus;
    winner: number | null; // 0, 1, or null (draw)
    lastMove: Position | null;
    lastScoreResults: ScoreResult[];
    isCPUGame: boolean;
}

export class GameRoom {
    private state: GameState;
    private cpuPlayer: CPUPlayer | null = null;

    constructor(roomId: string, isCPUGame: boolean = false) {
        this.state = {
            roomId,
            players: [],
            board: this.createEmptyBoard(),
            scores: [0, 0],
            currentTurn: 0,
            selectedTemplates: selectRandomTemplates(6),
            status: 'waiting',
            winner: null,
            lastMove: null,
            lastScoreResults: [],
            isCPUGame
        };

        if (isCPUGame) {
            this.cpuPlayer = new CPUPlayer(this.state.selectedTemplates);
        }
    }

    private createEmptyBoard(): Board {
        return Array(6).fill(null).map(() => Array(7).fill(0));
    }

    /**
     * プレイヤーを追加
     */
    addPlayer(playerId: string, playerName: string): boolean {
        if (this.state.players.length >= 2) {
            return false;
        }

        this.state.players.push({
            id: playerId,
            name: playerName,
            isReady: false
        });

        if (this.state.isCPUGame && this.state.players.length === 1) {
            // CPU対戦の場合、自動的にCPUを追加
            this.state.players.push({
                id: 'cpu',
                name: 'CPU (Easy)',
                isReady: true
            });
            this.state.status = 'ready';
        } else if (this.state.players.length === 2) {
            this.state.status = 'ready';
        }

        return true;
    }

    /**
     * ゲーム開始
     */
    startGame(): boolean {
        if (this.state.status !== 'ready') {
            return false;
        }

        this.state.status = 'playing';
        return true;
    }

    /**
     * コマを配置
     */
    makeMove(playerIndex: number, column: number): boolean {
        if (this.state.status !== 'playing') {
            return false;
        }

        if (this.state.currentTurn !== playerIndex) {
            return false;
        }

        if (column < 0 || column >= 7) {
            return false;
        }

        // コマを落とす
        const row = this.dropPiece(column, playerIndex + 1);
        if (row === -1) {
            return false; // 列が満杯
        }

        this.state.lastMove = [column, row];

        // 得点判定
        const results = checkPatterns(
            this.state.board,
            [column, row],
            playerIndex + 1,
            this.state.selectedTemplates
        );

        this.state.lastScoreResults = results;
        const points = calculateScore(results);
        this.state.scores[playerIndex] += points;

        // ゲーム終了判定
        if (this.isBoardFull()) {
            this.state.status = 'finished';
            if (this.state.scores[0] > this.state.scores[1]) {
                this.state.winner = 0;
            } else if (this.state.scores[1] > this.state.scores[0]) {
                this.state.winner = 1;
            } else {
                this.state.winner = null; // DRAW
            }
        } else {
            // 手番交代
            this.state.currentTurn = 1 - this.state.currentTurn;
        }

        return true;
    }

    /**
     * CPUの手番を実行
     */
    makeCPUMove(): boolean {
        if (!this.state.isCPUGame || !this.cpuPlayer) {
            return false;
        }

        if (this.state.currentTurn !== 1) {
            return false;
        }

        const column = this.cpuPlayer.selectColumn(this.state.board, 1); // プレイヤー1を防御
        return this.makeMove(1, column);
    }

    /**
     * コマを指定列に落とす
     */
    private dropPiece(column: number, player: number): number {
        for (let row = 5; row >= 0; row--) {
            if (this.state.board[row][column] === 0) {
                this.state.board[row][column] = player;
                return row;
            }
        }
        return -1; // 列が満杯
    }

    /**
     * 盤面が満杯かチェック
     */
    private isBoardFull(): boolean {
        return this.state.board[0].every(cell => cell !== 0);
    }

    /**
     * 再戦（盤面リセット）
     */
    rematch(): void {
        this.state.board = this.createEmptyBoard();
        this.state.scores = [0, 0];
        this.state.currentTurn = 0;
        this.state.selectedTemplates = selectRandomTemplates(6);
        this.state.status = 'playing';
        this.state.winner = null;
        this.state.lastMove = null;
        this.state.lastScoreResults = [];

        if (this.state.isCPUGame && this.cpuPlayer) {
            this.cpuPlayer = new CPUPlayer(this.state.selectedTemplates);
        }
    }

    /**
     * 現在の状態を取得
     */
    getState(): GameState {
        return { ...this.state };
    }

    /**
     * ルームIDを取得
     */
    getRoomId(): string {
        return this.state.roomId;
    }
}

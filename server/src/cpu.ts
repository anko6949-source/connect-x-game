import { Template, Position } from './templates.js';
import { Board, checkPatterns } from './scoring.js';

/**
 * CPU (Easy難易度) の思考ロジック
 * 1. プレイヤーが次の1手で形を成立できるか判定
 * 2. 成立する場合: それを防げる列を選択
 * 3. 成立しない場合: ランダムに選択
 */
export class CPUPlayer {
    private templates: Template[];

    constructor(templates: Template[]) {
        this.templates = templates;
    }

    /**
     * 次の手を決定
     * @param board 現在の盤面
     * @param playerNumber プレイヤー番号 (人間プレイヤー)
     * @returns 選択する列 (0-6)
     */
    selectColumn(board: Board, playerNumber: number): number {
        // 合法手を取得
        const legalMoves = this.getLegalMoves(board);
        if (legalMoves.length === 0) {
            throw new Error('No legal moves available');
        }

        // プレイヤーが次に形を成立させられる列を検出
        const threateningColumns = this.findThreateningMoves(board, playerNumber);

        if (threateningColumns.length > 0) {
            // 脅威がある場合、その中からランダムに選択して防御
            const randomIndex = Math.floor(Math.random() * threateningColumns.length);
            return threateningColumns[randomIndex];
        }

        // 脅威がない場合、ランダムに選択
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return legalMoves[randomIndex];
    }

    /**
     * 合法手（空いている列）を取得
     */
    private getLegalMoves(board: Board): number[] {
        const legalMoves: number[] = [];
        for (let col = 0; col < 7; col++) {
            if (board[0][col] === 0) {
                legalMoves.push(col);
            }
        }
        return legalMoves;
    }

    /**
     * プレイヤーが次の手で形を成立させられる列を検出
     */
    private findThreateningMoves(board: Board, playerNumber: number): number[] {
        const threateningColumns: number[] = [];

        for (let col = 0; col < 7; col++) {
            // この列に置けるか確認
            const row = this.getDropRow(board, col);
            if (row === -1) continue; // 列が満杯

            // 仮想的にコマを配置
            const testBoard = board.map(row => [...row]);
            testBoard[row][col] = playerNumber;

            // この手で形が成立するかチェック
            const results = checkPatterns(
                testBoard,
                [col, row],
                playerNumber,
                this.templates
            );

            if (results.length > 0) {
                threateningColumns.push(col);
            }
        }

        return threateningColumns;
    }

    /**
     * 指定された列にコマを落とした時の行を取得
     */
    private getDropRow(board: Board, col: number): number {
        for (let row = 5; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1; // 列が満杯
    }
}

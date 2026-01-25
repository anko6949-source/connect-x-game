import { Template, Position, getAllTransformations } from './templates.js';

export interface ScoreResult {
    template: Template;
    positions: Position[]; // 盤面上の絶対座標
    points: number;
}

// 盤面の型定義 (0: 空, 1: プレイヤー1, 2: プレイヤー2)
export type Board = number[][];

/**
 * 最新の手を起点に、指定されたテンプレートが成立しているかチェック
 * @param board 盤面 (7x6)
 * @param lastMove 最新の手の座標 [x, y]
 * @param player プレイヤー番号 (1 or 2)
 * @param templates 判定対象のテンプレート配列
 * @returns 成立した形の配列
 */
export function checkPatterns(
    board: Board,
    lastMove: Position,
    player: number,
    templates: Template[]
): ScoreResult[] {
    const results: ScoreResult[] = [];
    const [baseX, baseY] = lastMove;

    for (const template of templates) {
        // すべての変換パターンを試す
        const transformations = getAllTransformations(template);

        for (const pattern of transformations) {
            // 基準点(0,0)が最新の手の位置になるようにマッピング
            const absolutePositions: Position[] = pattern.map(([dx, dy]) => [
                baseX + dx,
                baseY + dy
            ]);

            // すべての位置が盤面内かつ同じプレイヤーのコマか確認
            const isValid = absolutePositions.every(([x, y]) => {
                if (x < 0 || x >= 7 || y < 0 || y >= 6) return false;
                return board[y][x] === player;
            });

            if (isValid) {
                // 重複チェック（同じ座標セットは追加しない）
                const isDuplicate = results.some(result => {
                    if (result.template.id !== template.id) return false;
                    const sortedNew = absolutePositions.map(p => p.join(',')).sort();
                    const sortedExisting = result.positions.map(p => p.join(',')).sort();
                    return sortedNew.every((p, i) => p === sortedExisting[i]);
                });

                if (!isDuplicate) {
                    results.push({
                        template,
                        positions: absolutePositions,
                        points: template.points
                    });
                }
            }
        }
    }

    return results;
}

/**
 * 得点を計算
 */
export function calculateScore(results: ScoreResult[]): number {
    return results.reduce((sum, result) => sum + result.points, 0);
}

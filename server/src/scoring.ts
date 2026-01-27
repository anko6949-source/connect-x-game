import { Template, Position, getAllTransformations } from './templates.js';

export interface ScoreResult {
    template: Template;
    positions: Position[]; // 盤面上の絶対座標
    points: number;
}

// 盤面の型定義 (0: 空, 1: プレイヤー1, 2: プレイヤー2)
export type Board = number[][];

/**
 * 直線系役の判定（最新手を起点に正方向・逆方向を探索）
 */
function checkLinearPattern(
    board: Board,
    lastMove: Position,
    player: number,
    template: Template
): ScoreResult[] {
    const results: ScoreResult[] = [];
    const [baseX, baseY] = lastMove;

    // 直線系テンプレートかチェック（すべての点が一直線上にあるか）
    const isLinear = (positions: Position[]): boolean => {
        if (positions.length <= 1) return true;

        // 方向ベクトルを計算
        const dx = positions[1][0] - positions[0][0];
        const dy = positions[1][1] - positions[0][1];

        // すべての点が同じ方向ベクトルを持つかチェック
        for (let i = 2; i < positions.length; i++) {
            const currentDx = positions[i][0] - positions[i - 1][0];
            const currentDy = positions[i][1] - positions[i - 1][1];
            if (currentDx !== dx || currentDy !== dy) return false;
        }
        return true;
    };

    if (!isLinear(template.positions)) {
        return results; // 直線系でない場合は空配列を返す
    }

    // 方向ベクトルを取得
    const dx = template.positions[1][0] - template.positions[0][0];
    const dy = template.positions[1][1] - template.positions[0][1];

    // 正方向と逆方向を探索（空マスも含めて範囲を確認）
    const forwardPositions: Position[] = [[baseX, baseY]];
    const backwardPositions: Position[] = [];

    // 正方向に探索（空マスがあっても継続）
    for (let i = 1; i < template.size; i++) {
        const x = baseX + dx * i;
        const y = baseY + dy * i;
        if (x < 0 || x >= 7 || y < 0 || y >= 6) break;
        forwardPositions.push([x, y]);
    }

    // 逆方向に探索（空マスがあっても継続）
    for (let i = 1; i < template.size; i++) {
        const x = baseX - dx * i;
        const y = baseY - dy * i;
        if (x < 0 || x >= 7 || y < 0 || y >= 6) break;
        backwardPositions.push([x, y]);
    }

    // 連結数を合算
    const totalPositions = [...backwardPositions.reverse(), ...forwardPositions];

    // テンプレートのサイズ分の範囲内で、プレイヤーのコマが何個あるかカウント
    const playerPieces = totalPositions.filter(([x, y]) => board[y][x] === player);

    // プレイヤーのコマがテンプレートのサイズ以上あれば成立
    if (playerPieces.length >= template.size) {
        results.push({
            template,
            positions: playerPieces.slice(0, template.size),
            points: template.points
        });
    }

    return results;
}

/**
 * V字形状の役判定（相対座標一致）
 */
function checkVShapePattern(
    board: Board,
    lastMove: Position,
    player: number,
    template: Template
): ScoreResult[] {
    const results: ScoreResult[] = [];
    const [baseX, baseY] = lastMove;

    // すべての変換パターンを試す
    const transformations = getAllTransformations(template);

    for (const pattern of transformations) {
        // 最新手がパターン内のどの位置にあるかを試す
        for (let anchorIndex = 0; anchorIndex < pattern.length; anchorIndex++) {
            const [anchorDx, anchorDy] = pattern[anchorIndex];

            // 最新手を基準にパターンをマッピング
            const absolutePositions: Position[] = pattern.map(([dx, dy]) => [
                baseX + (dx - anchorDx),
                baseY + (dy - anchorDy)
            ]);

            // すべての位置が盤面内かつ同じプレイヤーのコマか確認
            const isValid = absolutePositions.every(([x, y]) => {
                if (x < 0 || x >= 7 || y < 0 || y >= 6) return false;
                return board[y][x] === player;
            });

            if (isValid) {
                // 重複チェック
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

    for (const template of templates) {
        // 直線系役の判定
        const linearResults = checkLinearPattern(board, lastMove, player, template);
        results.push(...linearResults);

        // V字系役の判定（直線系でない場合）
        if (linearResults.length === 0) {
            const vShapeResults = checkVShapePattern(board, lastMove, player, template);
            results.push(...vShapeResults);
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

// 型定義
export type Position = [number, number]; // [x, y]

export interface Template {
    id: string;
    name: string;
    positions: Position[]; // 相対座標 (0,0)が基準点
    points: number;
    size: number; // マス数
}

// 形テンプレート定義
export const TEMPLATES: Template[] = [
    // 3マス形 (1pt)
    {
        id: '3-line',
        name: '直線3',
        positions: [[0, 0], [1, 0], [2, 0]],
        points: 1,
        size: 3
    },
    {
        id: '3-l',
        name: 'L字',
        positions: [[0, 0], [1, 0], [0, 1]],
        points: 1,
        size: 3
    },
    {
        id: '3-v',
        name: 'V字',
        positions: [[0, 0], [1, 1], [-1, 1]],
        points: 1,
        size: 3
    },
    {
        id: '3-corner',
        name: 'コーナー',
        positions: [[0, 0], [1, 0], [1, 1]],
        points: 1,
        size: 3
    },
    {
        id: '3-diagonal',
        name: '斜め3',
        positions: [[0, 0], [1, 1], [2, 2]],
        points: 1,
        size: 3
    },

    // 4マス形 (3pt)
    {
        id: '4-line',
        name: '直線4',
        positions: [[0, 0], [1, 0], [2, 0], [3, 0]],
        points: 3,
        size: 4
    },
    {
        id: '4-square',
        name: '正方形',
        positions: [[0, 0], [1, 0], [0, 1], [1, 1]],
        points: 3,
        size: 4
    },
    {
        id: '4-t',
        name: 'T字',
        positions: [[0, 0], [-1, 0], [1, 0], [0, 1]],
        points: 3,
        size: 4
    },
    {
        id: '4-s',
        name: 'S字',
        positions: [[0, 0], [1, 0], [1, 1], [2, 1]],
        points: 3,
        size: 4
    },
    {
        id: '4-z',
        name: 'Z字',
        positions: [[0, 0], [1, 0], [1, 1], [0, 1]],
        points: 3,
        size: 4
    },
    {
        id: '4-l-big',
        name: '大L字',
        positions: [[0, 0], [0, 1], [0, 2], [1, 0]],
        points: 3,
        size: 4
    },

    // 5マス形 (5pt)
    {
        id: '5-line',
        name: '直線5',
        positions: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        points: 5,
        size: 5
    },
    {
        id: '5-cross',
        name: '十字',
        positions: [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]],
        points: 5,
        size: 5
    },
    {
        id: '5-u',
        name: 'コの字',
        positions: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]],
        points: 5,
        size: 5
    },
    {
        id: '5-t-big',
        name: '大T字',
        positions: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
        points: 5,
        size: 5
    },

    // 6マス形 (10pt)
    {
        id: '6-line',
        name: '直線6',
        positions: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
        points: 10,
        size: 6
    },
    {
        id: '6-stairs',
        name: '階段',
        positions: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
        points: 10,
        size: 6
    },
    {
        id: '6-rect',
        name: '長方形',
        positions: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
        points: 10,
        size: 6
    }
];

// 回転・反転用のユーティリティ関数
export function rotatePosition(pos: Position, times: number): Position {
    let [x, y] = pos;
    for (let i = 0; i < times; i++) {
        [x, y] = [-y, x]; // 90度回転
    }
    return [x, y];
}

export function flipHorizontal(pos: Position): Position {
    return [-pos[0], pos[1]];
}

export function flipVertical(pos: Position): Position {
    return [pos[0], -pos[1]];
}

// テンプレートの全変換パターンを生成
export function getAllTransformations(template: Template): Position[][] {
    const transformations: Position[][] = [];
    const { positions } = template;

    // 元の形
    transformations.push(positions);

    // 90度, 180度, 270度回転
    for (let rotation = 1; rotation <= 3; rotation++) {
        transformations.push(positions.map(pos => rotatePosition(pos, rotation)));
    }

    // 左右反転
    transformations.push(positions.map(flipHorizontal));

    // 左右反転 + 回転
    for (let rotation = 1; rotation <= 3; rotation++) {
        transformations.push(
            positions.map(pos => rotatePosition(flipHorizontal(pos), rotation))
        );
    }

    return transformations;
}

// ランダムにテンプレートを選択
export function selectRandomTemplates(count: number = 6): Template[] {
    const templates = [...TEMPLATES];
    const selected: Template[] = [];

    // 3-4マス形を多めに含める
    const smallTemplates = templates.filter(t => t.size <= 4);
    const largeTemplates = templates.filter(t => t.size > 4);

    // 3-4マス形から4つ選択
    for (let i = 0; i < 4 && smallTemplates.length > 0; i++) {
        const index = Math.floor(Math.random() * smallTemplates.length);
        selected.push(smallTemplates.splice(index, 1)[0]);
    }

    // 残りを全体から選択
    const remaining = [...smallTemplates, ...largeTemplates];
    while (selected.length < count && remaining.length > 0) {
        const index = Math.floor(Math.random() * remaining.length);
        selected.push(remaining.splice(index, 1)[0]);
    }

    return selected;
}

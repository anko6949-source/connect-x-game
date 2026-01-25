# CONNECT X

完全仕様書に基づいたターン制対戦型ボードゲーム

## 技術スタック

- **フロントエンド**: Vite + React + TypeScript
- **バックエンド**: Node.js + Express + TypeScript
- **通信**: HTTPポーリング

## セットアップ

### サーバー

```bash
cd server
npm install
npm run dev
```

サーバーはポート3000で起動します。

### クライアント

```bash
cd client
npm install
npm run dev
```

クライアントはポート5173で起動します。

## ゲームルール

- **盤面**: 7×6グリッド
- **重力**: 列を選択してコマを落下
- **得点**: 形テンプレートを成立させると得点
- **勝利条件**: 盤面が埋まった時点で得点が高い方が勝利

## 機能

- ✅ オンライン対戦（ルームコード制）
- ✅ CPU対戦（Easy難易度）
- ✅ 形テンプレート判定（相対座標・合同判定）
- ✅ コマ落下アニメーション（1.5秒）
- ✅ 形成立時の発光演出（0.8秒）
- ✅ 再戦機能
- ✅ 自動再接続（ポーリング）

## デプロイ

### Vercel（フロントエンド）

```bash
cd client
npm run build
# Vercelにデプロイ
```

### Render（バックエンド）

```bash
cd server
npm run build
# Renderにデプロイ
```

## ライセンス

MIT

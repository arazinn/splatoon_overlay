# SPLATOON 3 TOURNAMENT OVERLAY

Splatoon 3の大会配信向けオーバーレイ・操作システムです。  
大会情報、チーム情報、セットスコアを操作画面から更新し、OBSの配信画面にリアルタイムで反映します。

## 概要

本プロジェクトは、配信者が大会情報を操作し、OBS上のオーバーレイに表示するためのシステムです。

### 主な機能

- 大会名・ラウンドの表示
- チーム名の表示
- チームメンバーの表示（各チーム4人）
- セットスコアの変更・リセット
- 試合ルール・ステージの表示
- 試合状況の表示
- WebSocketによるリアルタイム更新
- サーバー接続状態の表示
- WebSocket切断時の自動再接続

## システム構成

```text
Operation (HTML / CSS / JavaScript)
            |
            | HTTP POST
            v
       FastAPI Server
            |
            | WebSocket
            v
      Overlay (HTML / CSS / JavaScript)
            |
            v
            OBS
```

## 使用技術

- Python
- FastAPI
- Uvicorn
- WebSocket
- HTML
- CSS
- JavaScript
- OBS Studio
- PyInstaller（実行ファイル作成）

## ディレクトリ構成

```text
Proguram/
├── server/
│   └── server.py
├── operation/
│   ├── index.html
│   ├── css.css
│   └── js.js
└── overlay/
    ├── overlay.html
    ├── overlay.css
    └── overlay.js
```

※ 実際のファイル名・配置に合わせて調整してください。

## 起動方法（開発環境）

### 1. 必要なライブラリのインストール

Pythonをインストールした環境で実行します。

```bash
python -m pip install fastapi "uvicorn[standard]" websockets
```

### 2. サーバーの起動

```bash
cd server
python server.py
```

正常に起動したら、以下のURLでAPIを確認できます。

- APIドキュメント: http://127.0.0.1:8000/docs

### 3. 操作画面を開く

`operation/index.html` をブラウザで開きます。

接続状態が「接続中」になっていることを確認してください。

### 4. オーバーレイを開く

`overlay/overlay.html` をブラウザで開き、表示が更新されることを確認します。

## OBS設定

1. OBS Studioを起動します。
2. ソースから「ブラウザ」を追加します。
3. ローカルファイルを指定します。
4. `overlay/overlay.html` を選択します。
5. 配信画面に合わせて幅・高さを設定します。
6. 表示が正常に更新されることを確認します。

オーバーレイの背景を透過させる場合は、HTML・CSS側の背景設定も確認してください。

## 実行ファイルの作成

PyInstallerを利用してサーバーを実行ファイル化できます。

### PyInstallerのインストール

```bash
python -m pip install pyinstaller
```

### ビルド

`server` ディレクトリで実行します。

```bash
python -m PyInstaller --clean --noconfirm --onedir --name OverlayServer server.py
```

生成先：

```text
server/dist/OverlayServer/
```

生成された `OverlayServer.exe` を実行するとサーバーが起動します。

```powershell
.\dist\OverlayServer\OverlayServer.exe
```

※ 最初は `onedir` 形式を推奨します。生成物のフォルダ全体を維持してください。

## 通信仕様

### HTTP API

| Endpoint | Method | 用途 |
|---|---|---|
| `/match` | POST | 大会・試合情報の更新 |
| `/score` | POST | スコアの更新 |
| `/members` | POST | メンバー情報の更新 |

### WebSocket

```text
ws://127.0.0.1:8000/ws
```

サーバーから現在の試合情報を受信し、更新されたデータをオーバーレイへ反映します。

## 動作環境

- Windows
- Python実行環境（開発時）
- OBS Studio
- WebSocket通信が可能なブラウザ環境

実行ファイル配布時は、配布先PCでの動作確認が必要です。

## 注意事項

- 現在の接続先は `127.0.0.1:8000` です。
- 操作画面とオーバーレイは、サーバーが起動している必要があります。
- ポート8000が使用中の場合、サーバーが起動できないことがあります。
- 現在の構成は開発・ローカル利用を想定しています。
- サーバーのデータはメモリ上で管理され、サーバー再起動時には初期化されます。
- 本システムは大会の勝敗判定やトーナメント進行管理を目的としていません。

## License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

## Author

klam

# SPLATOON 3 TOURNAMENT OVERLAY

Splatoon 3の大会配信向けに制作した、OBS用の大会情報オーバーレイシステムです。

Webブラウザから大会情報や試合状況を操作し、OBS上のオーバーレイへリアルタイムに反映できます。

Pythonによるサーバー処理と、HTML・CSS・JavaScriptによる操作画面および配信画面で構成されています。

Windows向けの実行ファイルを同梱しているため、windows以外の環境で実験していませんので行う際は自己責任でお願いします**通常の利用ではPythonのインストールは必要ありません。**

## 1. 主な機能

- 大会名・ラウンド名の表示
- チーム名の変更
- 各チーム最大4名の選手名表示
- チームごとのセットスコア管理
- ルール・ステージ情報の変更
- 試合状況の表示
- WebSocketによるリアルタイム更新
- サーバーとの接続状態の表示
- WebSocket切断時の自動再接続

## 2. システム構成

本システムは、次の3つの主要コンポーネントで構成されています。

### Operation（操作画面）

大会運営者が使用する操作画面です。

大会情報、チーム名、選手名、スコアなどを変更できます。

### Server（サーバー）

FastAPIを利用したローカルサーバーです。

操作画面から送信された情報を受け取り、WebSocketを通じてオーバーレイへ配信します。

### Overlay（配信画面）

OBSに表示する大会情報画面です。

サーバーから情報を受信し、表示内容をリアルタイムに更新します。

### 通信の流れ

```text
Operation
  HTML / CSS / JavaScript
          |
          | HTTP POST
          v
     FastAPI Server
          |
          | WebSocket
          v
       Overlay
  HTML / CSS / JavaScript
          |
          v
         OBS
```

## 3. 動作環境

### 一般利用者

- Windows
- OBS Studio
- Webブラウザ（Chrome、Edgeなど）

Pythonのインストールは不要です。

### 開発者

- Python 3
- FastAPI
- Uvicorn
- WebSockets
- PyInstaller（実行ファイルを再作成する場合）

## 4. ファイル構成

以下は主要ファイルの構成例です。実際の配布フォルダ構成に応じて読み替えてください。

```text
Proguram/
├── server/
│   ├── server.py
│   └── dist/
│       └── OverlayServer/
│           ├── OverlayServer.exe
│           └── _internal/
│
├── operation/
│   ├── index.html
│   ├── css.css
│   └── js.js
│
├── overlay/
│   ├── overlay.html
│   ├── overlay.css
│   └── overlay.js
│
├── README.md
└── LICENSE
```

※ `_internal` はPyInstallerの`--onedir`形式で生成される依存ファイルの格納先です。実際の生成内容は環境によって異なります。

## 5. 使用方法（一般利用者向け）

### STEP 1：サーバーを起動

同梱されている以下の実行ファイルを起動してください。

```text
server/dist/OverlayServer/OverlayServer.exe
```

実行ファイルと同じフォルダに含まれる依存ファイルは削除しないでください。

起動後、サーバーは通常、以下のアドレスで待ち受けます。

```text
http://127.0.0.1:8000
```

### STEP 2：操作画面を開く

以下のファイルをWebブラウザで開いてください。

```text
operation/index.html
```

操作画面から大会情報や試合情報を変更できます。

## STEP 3：オーバーレイをOBSに追加

本システムでは、OBSのブラウザソースにURLを指定してオーバーレイを表示する方法を推奨しています。

### 設定手順

1. `overlay/overlay.html`をGoogle ChromeまたはMicrosoft Edgeで開きます。
2. ブラウザのアドレスバーに表示されたURLをコピーします。
3. OBS Studioを起動します。
4. 「ソース」から「ブラウザ」を追加します。
5. 「ローカルファイル」は**無効**にします。
6. 「URL」欄にコピーしたURLを貼り付けます。
7. 配信画面に合わせて幅と高さを設定します。

### URLの例

```text
file:///C:/Users/username/Desktop/Proguram/overlay/overlay.html
```

※ 実際のURLはファイルの保存場所によって異なります。

### 推奨する理由

本プロジェクトでは、ブラウザで開いたHTMLファイルのURLをOBSに指定する方法で、比較的安定した動作を確認しています。

そのため、OBSの「ローカルファイル」機能による読み込みよりも、URLを直接指定する方法を推奨します。

### 注意事項

- オーバーレイを使用する前にサーバーを起動してください。
- HTMLファイルを移動するとURLが変わるため、OBS側の設定も変更する必要があります。
- WebSocketの接続先は`ws://127.0.0.1:8000/ws`です。
- URLを指定しても表示されない場合は、ファイルの場所とサーバーの起動状態を確認してください。

### STEP 4：動作確認

操作画面から大会名やスコアを変更してください。

サーバーに正常に接続されていれば、OBS上のオーバーレイへ変更内容が反映されます。

**注意：** サーバーを終了すると、操作画面とオーバーレイ間のリアルタイム通信は停止します。

## 6. 開発者向けセットアップ

ソースコードから実行する場合はPythonが必要です。

### 必要ライブラリのインストール

```bash
python -m pip install fastapi "uvicorn[standard]" websockets
```

### サーバーの起動

```bash
cd server
python server.py
```

起動後、以下のURLからAPIドキュメントを確認できます。

```text
http://127.0.0.1:8000/docs
```

## 7. 実行ファイルについて

本プロジェクトでは、PythonがインストールされていないWindows環境でもサーバーを実行できるよう、PyInstallerで実行ファイルを作成しています。

**実行ファイルの作成と梱包は完了しています。**

### ビルド形式

PyInstallerの`--onedir`形式を使用しています。

```bash
python -m PyInstaller --clean --noconfirm --onedir --name OverlayServer server.py
```

生成先：

```text
server/dist/OverlayServer/
```

実行ファイル：

```text
OverlayServer.exe
```

`--onedir`形式では、実行ファイルと依存ファイルを同じフォルダにまとめて配置します。

配布時は`OverlayServer.exe`だけでなく、**`OverlayServer`フォルダ全体を同梱してください。**

通常の利用者はビルドコマンドを実行する必要はありません。

## 8. API仕様

サーバーは操作画面からのHTTPリクエストを受け付けます。

| エンドポイント | メソッド | 用途 |
|---|---|---|
| `/match` | POST | 大会・試合情報の更新 |
| `/score` | POST | スコア情報の更新 |
| `/members` | POST | 選手情報の更新 |
| `/ws` | WebSocket | オーバーレイへのリアルタイム配信 |

WebSocket接続先：

```text
ws://127.0.0.1:8000/ws
```

## 9. 注意事項

- サーバーを起動してから操作画面とオーバーレイを使用してください。
- 標準の接続先は`127.0.0.1:8000`です。
- ポート8000を他のアプリケーションが使用している場合、正常に起動できないことがあります。
- サーバーの実行中は、サーバープログラムを終了しないでください。
- 現在のシステムはローカル環境での使用を想定しています。
- サーバーのメモリ上で管理している情報は、再起動時に初期化されます。
- 本システムは大会情報の表示・操作を目的としており、試合結果の自動判定や大会進行の自動管理を行うものではありません。

## 10. 使用技術

| 分類 | 技術 |
|---|---|
| バックエンド | Python |
| Webフレームワーク | FastAPI |
| ASGIサーバー | Uvicorn |
| リアルタイム通信 | WebSocket |
| フロントエンド | HTML / CSS / JavaScript |
| 配信ソフト | OBS Studio |
| 実行ファイル生成 | PyInstaller |

## 11. ライセンス

本プロジェクトは**MIT License**のもとで公開しています。

詳細については`LICENSE`ファイルを参照してください。

Copyright (c) 2026 klam

## 12. 作者

**klam**

Splatoon 3の大会配信における情報表示と運営操作を効率化するために制作しました。

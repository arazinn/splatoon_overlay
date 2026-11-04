from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 試合データ
# =========================

match_data = {
    "event_name": "INK CLASH CUP",
    "round_name": "GRAND FINAL",
    "series_format": "BEST OF 5",
    "game_number": "GAME 1",
    "mode": "ガチヤグラ",
    "stage": "ステージ名",
    "match_status": "BEST OF 5",
    "team_a": {"name": "BLUE", "wins": 0, "members": ["A1", "A2", "A3", "A4"]},
    "team_b": {"name": "ORANGE", "wins": 0, "members": ["B1", "B2", "B3", "B4"]},
}

connections = []


# =========================
# 受信データの形式
# =========================


class MatchUpdate(BaseModel):
    event_name: str
    round_name: str
    team_a: str
    team_b: str
    series_format: str
    game_number: str
    mode: str
    stage: str
    match_status: Literal["BEST OF 3", "BEST OF 5", "BEST OF 7"]


class ScoreUpdate(BaseModel):
    wins_a: int = Field(ge=0)
    wins_b: int = Field(ge=0)


class MemberUpdate(BaseModel):
    members_a: list[str] = Field(min_length=4, max_length=4)
    members_b: list[str] = Field(min_length=4, max_length=4)


# =========================
# WebSocket配信
# =========================


async def broadcast():
    disconnected = []

    for ws in connections:
        try:
            await ws.send_json(match_data)
        except Exception:
            disconnected.append(ws)

    for ws in disconnected:
        if ws in connections:
            connections.remove(ws)


# =========================
# API
# =========================


@app.get("/")
def home():
    return {"message": "Hello Server!"}


# 大会・試合情報
@app.post("/match")
async def update_match(data: MatchUpdate):

    match_data.update(
        {
            "event_name": data.event_name,
            "round_name": data.round_name,
            "series_format": data.series_format,
            "game_number": data.game_number,
            "mode": data.mode,
            "stage": data.stage,
            "match_status": data.match_status,
        }
    )

    match_data["team_a"]["name"] = data.team_a
    match_data["team_b"]["name"] = data.team_b

    await broadcast()

    return {"message": "試合情報を更新しました", "match_data": match_data}


# スコア
@app.post("/score")
async def update_score(data: ScoreUpdate):

    match_data["team_a"]["wins"] = data.wins_a
    match_data["team_b"]["wins"] = data.wins_b

    await broadcast()

    return {"message": "スコアを更新しました", "match_data": match_data}


# メンバー
@app.post("/members")
async def update_members(data: MemberUpdate):

    match_data["team_a"]["members"] = data.members_a
    match_data["team_b"]["members"] = data.members_b

    await broadcast()

    return {"message": "メンバーを更新しました", "match_data": match_data}


# 現在の試合情報取得
@app.get("/score")
def get_score():
    return match_data


# WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    connections.append(websocket)

    try:
        await websocket.send_json(match_data)

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        pass

    finally:
        if websocket in connections:
            connections.remove(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)

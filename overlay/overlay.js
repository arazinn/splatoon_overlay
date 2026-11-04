"use strict";

// ==============================
// HTML要素の取得
// ==============================

const elements = {
    eventName: document.getElementById("eventName"),
    roundName: document.getElementById("roundName"),

    mode: document.getElementById("mode"),
    stage: document.getElementById("stage"),
    matchStatus: document.getElementById("matchStatus"),

    teamA: document.getElementById("tamenameA"),
    scoreA: document.getElementById("Anum"),

    teamB: document.getElementById("tamenameB"),
    scoreB: document.getElementById("Bnum"),

    membersA: [
        document.getElementById("Aname1"),
        document.getElementById("Aname2"),
        document.getElementById("Aname3"),
        document.getElementById("Aname4")
    ],

    membersB: [
        document.getElementById("Bname1"),
        document.getElementById("Bname2"),
        document.getElementById("Bname3"),
        document.getElementById("Bname4")
    ]
};


// ==============================
// オーバーレイ更新
// ==============================

function updateOverlay(data) {

    elements.eventName.textContent = data.event_name;
    elements.roundName.textContent = data.round_name;

    elements.mode.textContent = data.mode;
    elements.stage.textContent = data.stage;
    elements.matchStatus.textContent = data.match_status;

    elements.teamA.textContent = data.team_a.name;
    elements.scoreA.textContent = data.team_a.wins;

    elements.teamB.textContent = data.team_b.name;
    elements.scoreB.textContent = data.team_b.wins;

    data.team_a.members.forEach((member, index) => {
        elements.membersA[index].textContent = member;
    });

    data.team_b.members.forEach((member, index) => {
        elements.membersB[index].textContent = member;
    });
}


// ==============================
// WebSocket接続
// ==============================

let socket;
let reconnectTimer = null;

function connectWebSocket() {

    socket = new WebSocket("ws://127.0.0.1:8000/ws");

    socket.addEventListener("open", () => {
        console.log("WebSocket接続成功");

        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    });

    socket.addEventListener("message", (event) => {

        const data = JSON.parse(event.data);

        updateOverlay(data);

    });

    socket.addEventListener("close", () => {
        console.log("WebSocket切断");

        reconnectTimer = setTimeout(() => {
            console.log("再接続を試みます");
            connectWebSocket();
        }, 3000);
    });

    socket.addEventListener("error", (error) => {
        console.error("WebSocketエラー:", error);
    });
}


// ==============================
// 初回接続
// ==============================

connectWebSocket();
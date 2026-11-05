"use strict";

// ==============================
// HTML要素の取得
// ==============================

const elements = {
    eventName: document.getElementById("eventName"),
    roundName: document.getElementById("roundName"),

    mode: document.getElementById("mode"),
    stage: document.getElementById("stage"),
    seriesFormat: document.getElementById("seriesFormat"),

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
function updateLamps(container, wins, seriesFormat, reverse = false) {

    const bestOf = Number(
        seriesFormat.replace("BEST OF ", "")
    );

    const maxWins = Math.ceil(bestOf / 2);

    const activeWins = Math.min(
        maxWins,
        Math.max(0, Number(wins))
    );

    container.replaceChildren();

    for (let i = 0; i < maxWins; i++) {

        const lamp = document.createElement("div");
        lamp.classList.add("lamp");

        if (reverse) {
            // 右から左に点灯
            if (i >= maxWins - activeWins) {
                lamp.classList.add("on");
            }
        } else {
            // 左から右に点灯
            if (i < activeWins) {
                lamp.classList.add("on");
            }
        }

        container.appendChild(lamp);
    }
}

function updateOverlay(data) {

    // 大会情報
    elements.eventName.textContent = data.event_name;
    elements.roundName.textContent = data.round_name;

    // 試合情報
    elements.mode.textContent = data.mode;
    elements.stage.textContent = data.stage;
    elements.seriesFormat.textContent = data.series_format;

    // チーム名
    elements.teamA.textContent = data.team_a.name;
    elements.teamB.textContent = data.team_b.name;

    // ランプ表示
// チームA：左から右に点灯
    updateLamps(
        elements.scoreA,
        data.team_a.wins,
        data.series_format,
        false
    );

    // チームB：右から左に点灯
    updateLamps(
        elements.scoreB,
        data.team_b.wins,
        data.series_format,
        true
    );
    // メンバー情報
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
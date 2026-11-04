
"use strict";

// ==============================
// 基本設定
// ==============================

const API_BASE = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws";

// HTML要素取得
const getElement = (id) => document.getElementById(id);

// 接続状態
const connection = getElement("connection");
const feedback = getElement("feedback");

// スコア管理
let winsA = 0;
let winsB = 0;

// WebSocket管理
let socket = null;
let reconnectTimer = null;


// ==============================
// フィードバック表示
// ==============================

function showFeedback(message, success = true) {
    feedback.textContent = message;
    feedback.style.color = success ? "#72e0a0" : "#ff8585";
}


// ==============================
// API送信
// ==============================

async function sendAPI(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(
            `${path} HTTP ${response.status}: ${message}`
        );
    }

    return response.json();
}


// ==============================
// 大会・試合情報
// ==============================

function getMatchData() {
    return {
        event_name: getElement("eventName").value,
        round_name: getElement("roundName").value,

        team_a: getElement("teamA").value,
        team_b: getElement("teamB").value,

        series_format: getElement("seriesFormat").value,
        game_number: getElement("gameNumber").value,

        mode: getElement("mode").value,
        stage: getElement("stage").value,

        match_status: getElement("matchStatus").value
    };
}

async function submitMatch() {
    try {
        await sendAPI("/match", getMatchData());

        showFeedback("大会・試合情報を更新しました");
    } catch (error) {
        console.error(error);
        showFeedback("大会・試合情報の更新に失敗しました", false);
    }
}


// ==============================
// チーム名表示
// ==============================

function updateTeamNames() {
    getElement("nameA").textContent =
        getElement("teamA").value;

    getElement("nameB").textContent =
        getElement("teamB").value;
}

getElement("teamA").addEventListener("input", updateTeamNames);
getElement("teamB").addEventListener("input", updateTeamNames);


// ==============================
// スコア管理
// ==============================

function updateScoreDisplay() {
    getElement("winsA").textContent = winsA;
    getElement("winsB").textContent = winsB;
}

// スコア増減ボタン
document.querySelectorAll(".scorebuttons button").forEach(button => {
    button.addEventListener("click", () => {
        const side = button.dataset.side;
        const delta = Number(button.dataset.delta);

        if (side === "A") {
            winsA = Math.max(0, winsA + delta);
        } else if (side === "B") {
            winsB = Math.max(0, winsB + delta);
        }

        updateScoreDisplay();
    });
});

// スコア送信
async function submitScore() {
    try {
        await sendAPI("/score", {
            wins_a: winsA,
            wins_b: winsB
        });

        showFeedback("スコアを更新しました");
    } catch (error) {
        console.error(error);
        showFeedback("スコアの更新に失敗しました", false);
    }
}

// スコアリセット
getElement("reset").addEventListener("click", async () => {
    winsA = 0;
    winsB = 0;

    updateScoreDisplay();

    await submitScore();
});


// ==============================
// 表示更新ボタン
// ==============================

getElement("send").addEventListener("click", async () => {
    try {
        // 大会情報とスコアを更新
        const results = await Promise.all([
            sendAPI("/match", getMatchData()),
            sendAPI("/score", {
                wins_a: winsA,
                wins_b: winsB
            })
        ]);

        showFeedback("配信画面を更新しました");
    } catch (error) {
        console.error(error);
        showFeedback("更新に失敗しました。サーバーを確認してください", false);
    }
});


// ==============================
// メンバー情報
// ==============================

function getMembers() {
    const membersA = Array.from(
        document.querySelectorAll(".memberA")
    ).map(input => input.value);

    const membersB = Array.from(
        document.querySelectorAll(".memberB")
    ).map(input => input.value);

    return {
        members_a: membersA,
        members_b: membersB
    };
}

// メンバー送信
async function submitMembers() {
    try {
        await sendAPI("/members", getMembers());

        showFeedback("メンバー情報を更新しました");
    } catch (error) {
        console.error(error);
        showFeedback("メンバー情報の更新に失敗しました", false);
    }
}

getElement("sendMember").addEventListener("click", submitMembers);

// メンバーリセット
getElement("resetMember").addEventListener("click", async () => {
    document.querySelectorAll(".memberA").forEach((input, index) => {
        input.value = `A${index + 1}`;
    });

    document.querySelectorAll(".memberB").forEach((input, index) => {
        input.value = `B${index + 1}`;
    });

    await submitMembers();
});


// ==============================
// WebSocket接続状態
// ==============================

function setConnectionStatus(online) {
    connection.textContent = online ? "接続中" : "未接続";

    connection.classList.toggle("online", online);
    connection.classList.toggle("offline", !online);
}

function connectWebSocket() {
    socket = new WebSocket(WS_URL);

    socket.addEventListener("open", () => {
        setConnectionStatus(true);

        console.log("WebSocket接続成功");

        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    });

    socket.addEventListener("close", () => {
        setConnectionStatus(false);

        console.log("WebSocket切断");

        if (reconnectTimer === null) {
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                connectWebSocket();
            }, 3000);
        }
    });

    socket.addEventListener("error", error => {
        console.error("WebSocketエラー:", error);
    });
}


// ==============================
// 初期化
// ==============================

updateTeamNames();
updateScoreDisplay();
setConnectionStatus(false);
connectWebSocket();

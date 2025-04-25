const maxXP = 50000;
const xpInput = document.getElementById("xpInput");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const resetBtn = document.getElementById("resetBtn");
const audio = document.getElementById("questComplete");
const xpLevels = [
    6, 10, 14, 18, 22, 28, 34, 40, 48, 56, 66, 76, 88, 100, 114, 128, 144, 160,
    180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460,
    480, 500, 520, 540, 560, 580, 600, 620, 650, 680, 710, 740, 770, 800, 830,
    860, 900
];
let hasPlayedAudio = false;
let lastTouch = 0;
let xpTotal = parseInt(localStorage.getItem('ccirvine_wrxpcalc_xpTotal')) || 0;
let counts = JSON.parse(localStorage.getItem('ccirvine_wrxpcalc_counts')) || { btn1: 0, btn3: 0, btn5: 0 };
let savedXPPerMission = parseInt(localStorage.getItem('ccirvine_wrxpcalc_xpPerMission')) || 1080;
xpInput.value = savedXPPerMission;

function saveState() {
    localStorage.setItem('ccirvine_wrxpcalc_xpTotal', xpTotal);
    localStorage.setItem('ccirvine_wrxpcalc_counts', JSON.stringify(counts));
    localStorage.setItem('ccirvine_wrxpcalc_xpPerMission', xpInput.value);
}

function updateProgressBar() {
    const percent = (xpTotal / maxXP) * 100;
    progressBar.style.width = `${percent}%`;

    if (percent >= 100) {
        progressBar.style.backgroundColor = 'red';
        if (!hasPlayedAudio) {
            progressBar.classList.add("flash");
            audio.play();
            hasPlayedAudio = true;
            if (!document.querySelector('.freeze-overlay')) {
                const freeze = document.createElement('div');
                freeze.className = 'freeze-overlay';
                freeze.innerText = '¡Daily XP cap reached!';
                document.body.appendChild(freeze);
                setTimeout(() => {
                    freeze.remove();
                }, 3000);
            }
            setTimeout(() => {
                progressBar.classList.remove("flash");
            }, 2500);
        }

    } else {
        hasPlayedAudio = false;
        if (percent >= 90) {
            progressBar.style.backgroundColor = 'orange';
        } else if (percent >= 70) {
            progressBar.style.backgroundColor = 'yellow';
        } else {
            progressBar.style.backgroundColor = '#4caf50';
        }
    }
}

function updateDisplay() {
    const xpPerMission = parseInt(xpInput.value) || 0;
    counter.textContent = `XP: ${xpTotal} / ${maxXP}`;
    updateProgressBar();

    [
        { id: 'btn1', labelId: 'label1', countId: 'count1', multiplier: 1 },
        { id: 'btn3', labelId: 'label3', countId: 'count3', multiplier: 3 },
        { id: 'btn5', labelId: 'label5', countId: 'count5', multiplier: 5 }
    ].forEach(({ id, labelId, countId, multiplier }) => {
        const remaining = xpPerMission > 0 ? Math.ceil((maxXP - xpTotal) / (xpPerMission * multiplier + 12)) : 0;
        document.getElementById(labelId).textContent = `Remaining: ${remaining}`;
        document.getElementById(countId).textContent = counts[id];

        const plusBtn = document.querySelector(`button[onclick*="updateCounter(${multiplier}, '${id}'"]`);
        if (xpTotal >= maxXP) {
            plusBtn.disabled = true;
            plusBtn.style.opacity = 0.4;
            plusBtn.style.cursor = "not-allowed";
        } else {
            plusBtn.disabled = false;
            plusBtn.style.opacity = 1;
            plusBtn.style.cursor = "pointer";
        }
    });
    const totalMissions = counts.btn1 + counts.btn3 + counts.btn5;
    document.getElementById("totalMissions").textContent = `Total missions completed: ${totalMissions}`;
    document.getElementById("btnMinus1").disabled = counts.btn1 === 0;
    document.getElementById("btnMinus3").disabled = counts.btn3 === 0;
    document.getElementById("btnMinus5").disabled = counts.btn5 === 0;
    updateXPLevelInfo();

}

function updateCounter(multiplier, id, labelId, countId) {
    const xpPerMission = parseInt(xpInput.value) || 0;
    const addition = xpPerMission * multiplier + 12;

    if (xpTotal < maxXP) {
        xpTotal += addition;
        if (xpTotal > maxXP) xpTotal = maxXP;
        document.getElementById("audioLevelUp").play();
        counts[id]++;
        saveState();
        updateDisplay();
    }
}

function decrementCounter(multiplier, id, labelId, countId) {
    const xpPerMission = parseInt(xpInput.value) || 0;
    if (counts[id] > 0) {
        counts[id]--;
        xpTotal -= xpPerMission * multiplier + 12;
        if (xpTotal < 0) xpTotal = 0;
        document.getElementById("audioSubtract").play();
        saveState();
        updateDisplay();
    }
}

function updateResetCountdown() {
    const now = new Date();
    const nextResetUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        18, 0, 0, 0
    ));

    if (now.getTime() > nextResetUTC.getTime()) {
        nextResetUTC.setUTCDate(nextResetUTC.getUTCDate() + 1);
    }

    const diff = nextResetUTC - now;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("resetCountdown").textContent =
        `Reset in: ${hours}h ${minutes}m ${seconds}s`;
}

function checkOrInitializeReset() {
    const now = new Date();

    const todayResetUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        18, 0, 0, 0
    ));

    const lastReset = parseInt(localStorage.getItem('ccirvine_wrxpcalc_lastReset')) || 0;

    if (!localStorage.getItem('ccirvine_wrxpcalc_lastReset')) {
        localStorage.setItem('ccirvine_wrxpcalc_lastReset', todayResetUTC.getTime());
        return;
    }

    if (now.getTime() >= todayResetUTC.getTime() && lastReset < todayResetUTC.getTime()) {
        xpTotal = 0;
        counts = { btn1: 0, btn3: 0, btn5: 0 };
        localStorage.setItem('ccirvine_wrxpcalc_lastReset', todayResetUTC.getTime());
        saveState();
    }
}

function toggleXPTable() {
    const wrapper = document.getElementById("xpTableWrapper");
    wrapper.style.display = wrapper.style.display === "none" ? "block" : "none";
}

function populateXPTable() {
    const tbody = document.getElementById("xpTableBody");
    xpLevels.forEach((xp, i) => {
        const row = document.createElement("tr");
        const col1 = document.createElement("td");
        const col2 = document.createElement("td");
        const col3 = document.createElement("td");

        col1.textContent = `Level ${i + 1}`;
        col2.textContent = xp;
        col3.textContent = Math.round(xp * 1.2);

        col2.className = "xp-cell";
        col3.className = "booster-cell";

        col2.onclick = () => setXPPerMission(xp);
        col3.onclick = () => setXPPerMission(Math.round(xp * 1.2));

        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        tbody.appendChild(row);
    });
}

function setXPPerMission(value) {
    const input = document.getElementById("xpInput");
    input.value = value;
    saveState();
    updateDisplay();
    updateXPLevelInfo();
}

function toggleXPTable() {
    const wrapper = document.getElementById("xpTableWrapper");
    const button = document.querySelector(".xp-table-toggle");

    const isHidden = wrapper.style.display === "none";

    wrapper.style.display = isHidden ? "block" : "none";
    button.textContent = isHidden ? "Hide XP Table" : "Show XP Table";
}

function updateXPLevelInfo() {
    const inputVal = parseInt(document.getElementById("xpInput").value) || 0;
    const infoDiv = document.getElementById("xpLevelInfo");

    let matchIndex = -1;
    let isBooster = false;

    for (let i = 0; i < xpLevels.length; i++) {
        const base = xpLevels[i];
        const booster = Math.round(base * 1.2);

        if (inputVal === base) {
            matchIndex = i;
            isBooster = false;
            break;
        }
        if (inputVal === booster) {
            matchIndex = i;
            isBooster = true;
            break;
        }
    }

    if (matchIndex >= 0) {
        infoDiv.textContent = `Level ${matchIndex + 1} — ${isBooster ? "Arclight Booster active" : "Base XP"}`;
    } else {
        infoDiv.textContent = "";
    }
}


resetBtn.addEventListener("click", () => {
    xpTotal = 0;
    counts = { btn1: 0, btn3: 0, btn5: 0 };
    document.getElementById("audioReset").play();
    saveState();
    updateDisplay();
});

xpInput.addEventListener("input", () => {
    saveState();
    updateDisplay();
    updateXPLevelInfo();
});

populateXPTable();
updateResetCountdown();
setInterval(updateResetCountdown, 1000);
checkOrInitializeReset();
updateDisplay();

document.addEventListener('touchend', function (e) {
  const now = new Date().getTime();
  if (now - lastTouch <= 300) {
    e.preventDefault();
  }
  lastTouch = now;
}, { passive: false });

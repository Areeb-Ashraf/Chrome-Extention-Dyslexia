export function initializePomodoro() {
    const pomodoroButton = document.getElementById("startPomodoro");
    const pomodoroDisplay = document.getElementById("pomodoroTimer");
    const pomodoroInput = document.getElementById("pomodoroInput");
    let timerInterval = null;
    const alarmSound = new Audio("alarm.mp3");

    // Style the display for a digital timer look.
    pomodoroDisplay.style.fontSize = "2em";
    pomodoroDisplay.style.fontFamily = "monospace";
    pomodoroDisplay.style.textAlign = "center";
    pomodoroDisplay.style.margin = "10px 0";
    pomodoroDisplay.style.padding = "10px";
    pomodoroDisplay.style.backgroundColor = "#000";
    pomodoroDisplay.style.color = "#fff";
    pomodoroDisplay.style.borderRadius = "5px";

    // Updates the timer display based on stored endTime.
    function updateDisplay() {
        chrome.storage.local.get(["endTime"], (result) => {
            if (result.endTime) {
                let timeLeft = Math.round((result.endTime - Date.now()) / 1000);
                if (timeLeft < 0) timeLeft = 0;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                pomodoroDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                pomodoroDisplay.textContent = "00:00";
            }
        });
    }

    // Starts a new timer based on the user's input.
    function startTimer() {
        const customTime = parseInt(pomodoroInput.value, 10);
        if (isNaN(customTime) || customTime <= 0) {
            alert("Please enter a valid time (in minutes).");
            return;
        }
        // Calculate an absolute endTime.
        const endTime = Date.now() + customTime * 60 * 1000;
        chrome.storage.local.set({ endTime: endTime });
        pomodoroButton.textContent = "Stop Timer";
        updateDisplay();

        // Set up an interval to update the display every second.
        timerInterval = setInterval(() => {
            chrome.storage.local.get(["endTime"], (result) => {
                if (!result.endTime) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    pomodoroButton.textContent = "Start Timer";
                    updateDisplay();
                    return;
                }
                let timeLeft = Math.round((result.endTime - Date.now()) / 1000);
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    pomodoroButton.textContent = "Start Timer";
                    alarmSound.play();
                    alert("Time's up! Take a break.");
                    chrome.storage.local.remove("endTime");
                    updateDisplay();
                } else {
                    updateDisplay();
                }
            });
        }, 1000);
    }

    // Stops the current timer.
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        pomodoroButton.textContent = "Start Timer";
        chrome.storage.local.remove("endTime");
        updateDisplay();
    }

    // On popup load, check if there's an active timer.
    chrome.storage.local.get(["endTime"], (result) => {
        if (result.endTime && result.endTime > Date.now()) {
            pomodoroButton.textContent = "Stop Timer";
            timerInterval = setInterval(() => {
                chrome.storage.local.get(["endTime"], (result) => {
                    if (!result.endTime) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        pomodoroButton.textContent = "Start Timer";
                        updateDisplay();
                        return;
                    }
                    let timeLeft = Math.round((result.endTime - Date.now()) / 1000);
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                        pomodoroButton.textContent = "Start Timer";
                        alarmSound.play();
                        alert("Time's up! Take a break.");
                        chrome.storage.local.remove("endTime");
                        updateDisplay();
                    } else {
                        updateDisplay();
                    }
                });
            }, 1000);
        } else {
            chrome.storage.local.remove("endTime");
            updateDisplay();
        }
    });

    pomodoroButton.addEventListener("click", () => {
        chrome.storage.local.get(["endTime"], (result) => {
            if (result.endTime && result.endTime > Date.now()) {
                stopTimer();
            } else {
                startTimer();
            }
        });
    });
}
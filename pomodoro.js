export function initializePomodoro() {
    const pomodoroButton = document.getElementById("startPomodoro");
    const pomodoroDisplay = document.getElementById("pomodoroTimer");

    let timeLeft = 25 * 60;
    let timerInterval;
    const alarmSound = new Audio("alarm.mp3");

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        pomodoroDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    pomodoroButton.addEventListener("click", () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            pomodoroButton.textContent = "Start Pomodoro";
        } else {
            pomodoroButton.textContent = "Stop Pomodoro";
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    pomodoroButton.textContent = "Start Pomodoro";
                    alarmSound.play();
                    alert("Time's up! Take a break.");
                    timeLeft = 25 * 60;
                    updateDisplay();
                }
            }, 1000);
        }
    });

    updateDisplay();
}

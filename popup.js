import { initializeTodoList } from "./todo.js";
import { initializePomodoro } from "./pomodoro.js";
import { initializeReadAloud } from "./readAloud.js";
import { initializeFontSwitcher } from "./fontSwitcher.js";
import { initializeTextAdjuster } from "./textAdjuster.js";
import { initializeColorOverlay } from "./colorOverlay.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeTodoList();
    initializePomodoro();
    initializeReadAloud();
    initializeFontSwitcher();
    initializeTextAdjuster();
    initializeColorOverlay();
});
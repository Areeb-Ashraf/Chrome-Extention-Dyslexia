import { initializeTodoList } from "./todo.js";
import { initializePomodoro } from "./pomodoro.js";
import { initializeReadAloud } from "./readAloud.js";
import { initializeFontSwitcher } from "./fontSwitcher.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeTodoList();
    initializePomodoro();
    initializeReadAloud();
    initializeFontSwitcher();
});
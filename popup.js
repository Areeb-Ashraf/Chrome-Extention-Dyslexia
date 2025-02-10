import { initializeTodoList } from "./todo.js";
import { initializePomodoro } from "./pomodoro.js";
import { initializeReadAloud } from "./readAloud.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeTodoList();
    initializePomodoro();
    initializeReadAloud();
});

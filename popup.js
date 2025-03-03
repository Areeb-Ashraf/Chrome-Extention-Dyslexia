import { initializeTodoList } from "./todo.js";
import { initializePomodoro } from "./pomodoro.js";
import { initializeReadAloud } from "./readAloud.js";
import { initializeFontSwitcher } from "./fontSwitcher.js";
import { initializeTextAdjuster } from "./textAdjuster.js";
import { initializeColorOverlay } from "./colorOverlay.js";
import { initializeLineFocus } from "./lineFocus.js";
import { initializeSyllableSplitter } from "./syllableSplitter.js";
import { initializeGeminiShortener } from "./geminiShortener.js";
import { initializeTrackingAid } from "./trackingAid.js";
import { initializeDistractionReducer } from "./distractionReducer.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeTodoList();
    initializePomodoro();
    initializeReadAloud();
    initializeFontSwitcher();
    initializeTextAdjuster();
    initializeColorOverlay();
    initializeLineFocus();
    initializeSyllableSplitter();
    initializeGeminiShortener();
    initializeTrackingAid();
    initializeDistractionReducer();
});
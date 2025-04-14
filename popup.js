// import { initializePomodoro } from "./pomodoro.js";
import { initializeReadAloud } from "./readAloud.js";
import { initializeTextAdjuster } from "./textAdjuster.js";
import { initializeColorOverlay } from "./colorOverlay.js";
import { initializeLineFocus } from "./lineFocus.js";
import { initializeSyllableSplitter } from "./syllableSplitter.js";
// import { initializeGeminiShortener } from "./geminiShortener.js";
import { initializeTrackingAid } from "./trackingAid.js";
import { initializeTextSimplifier } from "./textSimplifier.js";
import { initializeDistractionReducer } from "./distractionReducer.js";
import { initializeDictionaryLookup } from "./dictionary.js";
import { initializeLineGuide } from "./lineGuide.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeReadAloud();
  initializeTextAdjuster();
  initializeColorOverlay();
  initializeLineFocus();
  initializeSyllableSplitter();
  // initializeGeminiShortener();
  initializeTrackingAid();
  initializeLineGuide();
  initializeDistractionReducer();
  initializeDictionaryLookup();
  initializeTextSimplifier();
  initializeTextSimplifier();
  });

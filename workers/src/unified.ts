// ============================================================
// AI Content Factory — Unified Pipeline Worker
// Runs all BullMQ queue workers in a single Node process to optimize RAM & speed
// ============================================================
import 'dotenv/config';

import './research/main';
import './script/main';
import './voice/main';
import './image/main';
import './video/main';
import './thumbnail/main';
import './upload/main';
import './analytics/main';

console.log('🚀 AI Content Factory — Unified Worker started (Research, Script, Voice, Image, Video, Thumbnail, Upload, Analytics active)');

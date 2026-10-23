const fs = require('fs');
const html = fs.readFileSync('ulang-tahun.html', 'utf8');
const has = s => html.includes(s);
const count = s => (html.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
const r = [];

// Structure
r.push(['DOCTYPE',                   has('<!DOCTYPE html>')]);
r.push(['lang=id',                   has('lang="id"')]);
r.push(['charset UTF-8',             has('charset="UTF-8"')]);
r.push(['viewport meta',             has('name="viewport"')]);
r.push(['description meta',          has('name="description"')]);
r.push(['theme-color',               has('theme-color')]);
r.push(['og:title',                  has('og:title')]);
r.push(['og:description',            has('og:description')]);
r.push(['favicon inline',            has('rel="icon"')]);
r.push(['Google Fonts',              has('fonts.googleapis.com')]);
r.push(['Playfair Display',          has('Playfair Display')]);
r.push(['Cormorant Garamond',        has('Cormorant Garamond')]);

// 3 Themes
r.push(['data-theme attribute',      has('data-theme')]);
r.push(['[data-theme="pink"]',       has('[data-theme="pink"]')]);
r.push(['[data-theme="blue"]',       has('[data-theme="blue"]')]);
r.push(['setTheme function',         has('function setTheme')]);
r.push(['theme dots (3)',            count('theme-dot') >= 3]);
r.push(['localStorage theme',        has('localStorage')]);
r.push(['tema URL param',            has("p.get('tema')")]);

// Envelope
r.push(['envelopeScreen div',        has('id="envelopeScreen"')]);
r.push(['env-wrap',                  has('env-wrap')]);
r.push(['env-flap CSS',              has('env-flap')]);
r.push(['env-seal',                  has('env-seal')]);
r.push(['openEnvelope function',     has('function openEnvelope')]);
r.push(['flicker keyframe',          has('@keyframes flicker')]);
r.push(['sealPulse keyframe',        has('@keyframes sealPulse')]);
r.push(['blink keyframe',            has('@keyframes blink')]);

// Canvas & Animations
r.push(['canvas element',            has('id="canvas"')]);
r.push(['Particle class',            has('class Particle')]);
r.push(['Spark class',               has('class Spark')]);
r.push(['Rocket class',              has('class Rocket')]);
r.push(['Confetto class',            has('class Confetto')]);
r.push(['spawnConfetti fn',          has('function spawnConfetti')]);
r.push(['CONFETTI array',            has('const CONFETTI')]);
r.push(['launchFireworks fn',        has('function launchFireworks')]);
r.push(['prefersReduced motion',     has('prefers-reduced-motion')]);
r.push(['isMobile check',            has('isMobile')]);

// Music
r.push(['audio element',             has('<audio')]);
r.push(['music-bar',                 has('music-bar')]);
r.push(['toggleMusic fn',            has('function toggleMusic')]);
r.push(['autoPlayMusic fn',          has('function autoPlayMusic')]);
r.push(['startGenerated fn',         has('function startGenerated')]);
r.push(['stopAudio fn',              has('function stopAudio')]);
r.push(['AudioContext',              has('AudioContext')]);
r.push(['MELODY array',              has('const MELODY')]);
r.push(['musicFileInput',            has('id="musicFileInput"')]);
r.push(['loadMusicFile fn',          has('function loadMusicFile')]);
r.push(['createObjectURL',           has('createObjectURL')]);
r.push(['music-upload-btn',          has('music-upload-btn')]);

// Photo Upload
r.push(['photoInput',                has('id="photoInput"')]);
r.push(['loadPhoto fn',              has('function loadPhoto')]);
r.push(['FileReader',                has('new FileReader')]);
r.push(['photo-area CSS',            has('.photo-area')]);
r.push(['photoImg element',          has('id="photoImg"')]);

// URL Params
r.push(['readURLParams fn',          has('function readURLParams')]);
r.push(['URLSearchParams',           has('URLSearchParams')]);
r.push(['?nama= param',              has("p.get('nama')")]);
r.push(['?tahun= param',             has("p.get('tahun')")]);
r.push(['?tanggal= param',           has("p.get('tanggal')")]);
r.push(['buildShareURL fn',          has('function buildShareURL')]);

// Name & Age
r.push(['nameInput',                 has('id="nameInput"')]);
r.push(['onNameInput fn',            has('function onNameInput')]);
r.push(['typing class',              has('.typing')]);
r.push(['birthYear input',           has('id="birthYear"')]);
r.push(['updateAge fn',              has('function updateAge')]);
r.push(['ageBadge',                  has('id="ageBadge"')]);

// Message Templates
r.push(['TEMPLATES array (5)',       has('const TEMPLATES')]);
r.push(['5 template buttons',        count('tpl-btn') >= 5]);
r.push(['setTemplate fn',            has('function setTemplate')]);
r.push(['toggleEditor fn',           has('function toggleEditor')]);
r.push(['applyCustomMsg fn',         has('function applyCustomMsg')]);
r.push(['DEFAULT_MSG stored',        has('DEFAULT_MSG')]);
r.push(['edit-msg-btn',              has('edit-msg-btn')]);

// Wish Chips
r.push(['6 wish chips',              count('wish-chip') >= 6]);
r.push(['toggleWish fn',             has('function toggleWish')]);
r.push(['activeWishes Set',          has('activeWishes')]);
r.push(['aria-pressed on chips',     has('aria-pressed')]);

// Celebrate
r.push(['celebrate fn',              has('function celebrate')]);
r.push(['shakeCard fn',              has('function shakeCard')]);
r.push(['shake keyframe',            has('@keyframes shake')]);

// Presentation Mode
r.push(['enterPresent fn',           has('function enterPresent')]);
r.push(['exitPresent fn',            has('function exitPresent')]);
r.push(['body.present CSS',          has('body.present')]);
r.push(['exit-present-btn',          has('exit-present-btn')]);
r.push(['Escape exits present',      has("'Escape'")]);

// Countdown
r.push(['startCountdown fn',         has('function startCountdown')]);
r.push(['getNextBday fn',            has('function getNextBday')]);
r.push(['isBdayToday fn',            has('function isBdayToday')]);
r.push(['animateTile fn',            has('function animateTile')]);
r.push(['countdown-today',           has('id="countdownToday"')]);
r.push(['countdown-done',            has('id="countdownDone"')]);
r.push(['<24h warning',              has('86400000')]);

// Share
r.push(['shareWA fn',                has('function shareWA')]);
r.push(['shareTelegram fn',          has('function shareTelegram')]);
r.push(['copyLink fn',               has('function copyLink')]);
r.push(['fbCopy fallback fn',        has('function fbCopy')]);
r.push(['buildShareText fn',         has('function buildShareText')]);
r.push(['Print button',              has('window.print()')]);

// Toast & A11y
r.push(['showToast fn',              has('function showToast')]);
r.push(['role=main',                 has('role="main"')]);
r.push(['role=dialog envelope',      has('role="dialog"')]);
r.push(['aria-modal',                has('aria-modal')]);
r.push(['aria-live on toast',        has('aria-live="assertive"')]);
r.push(['aria-hidden on canvas',     has('aria-hidden="true"')]);
r.push(['focus-visible CSS',         has(':focus-visible')]);

// CSS Keyframes
r.push(['@keyframes fadeUp',         has('@keyframes fadeUp')]);
r.push(['@keyframes shimmer',        has('@keyframes shimmer')]);
r.push(['@keyframes cakeFloat',      has('@keyframes cakeFloat')]);
r.push(['@keyframes barB',           has('@keyframes barB')]);
r.push(['@keyframes hbeat',          has('@keyframes hbeat')]);
r.push(['@keyframes pulse-soft',     has('@keyframes pulse-soft')]);

// CSS features
r.push(['Print CSS',                 has('@media print')]);
r.push(['520px media query',         has('@media(max-width:520px)')]);
r.push(['360px media query',         has('@media(max-width:360px)')]);
r.push(['prefers-reduced CSS',       has('prefers-reduced-motion:reduce')]);
r.push(['CSS custom properties',     has(':root{')]);

// HTML balance
const od=(html.match(/<div/g)||[]).length, cd=(html.match(/<\/div>/g)||[]).length;
r.push(['<div> balance ('+od+'/'+cd+')', od===cd]);
const os=(html.match(/<script/g)||[]).length, cs=(html.match(/<\/script>/g)||[]).length;
r.push(['<script> balance', os===cs]);
const osec=(html.match(/<section/g)||[]).length, csec=(html.match(/<\/section>/g)||[]).length;
r.push(['<section> balance ('+osec+'/'+csec+')', osec===csec]);

// File size
const bytes=Buffer.byteLength(html,'utf8');
r.push(['File > 20KB', bytes>20000]);
r.push(['File < 250KB', bytes<250000]);

// Print results
let pass=0,fail=0;
r.forEach(([n,ok])=>{ if(ok)pass++;else fail++; process.stdout.write((ok?'PASS':'FAIL')+'  '+n+'\n'); });
process.stdout.write('\n══════════════════════════════════════\n');
process.stdout.write('RESULT: '+pass+' PASS  /  '+fail+' FAIL  /  '+r.length+' TOTAL\n');
process.stdout.write('File: '+(bytes/1024).toFixed(1)+' KB  |  Lines: '+html.split('\n').length+'\n');
process.exitCode=fail>0?1:0;

/**
 * SOVEREIGN v7.0 PANEL — BULLETPROOF ENGINE
 * @author: Antigravity / winse
 */

// ============================================================
// 1. IMMEDIATE TAB SWITCHING — Must run first
// ============================================================
(function () {
    function switchTab(targetId, label) {
        try {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            var pane = document.getElementById(targetId);
            if (pane) pane.classList.add('active');
            var nameEl = document.getElementById('activeTabName');
            if (nameEl && label) nameEl.textContent = label;
        } catch (e) { }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Bind all nav items directly
        document.querySelectorAll('.nav-item[data-tab]').forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                var target = item.getAttribute('data-tab');
                var label = item.querySelector('span') ? item.querySelector('span').textContent : '';
                switchTab(target, label);
            }, true);
        });

        // Save button
        var saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                sealProtocol();
            });
        }
    });
})();

// ============================================================
// 2. STATE SYSTEM
// ============================================================
const SYNC_CH = 'SOVEREIGN_CHANNEL';
let imperialBridge = null;

const safeGet = (k, d) => {
    try {
        const r = localStorage.getItem('svrgn_' + k);
        if (!r) return d;
        // Optimization: Do NOT JSON.parse strings that are purely digits (BigInt IDs)
        if (/^\d{16,}$/.test(r)) return r;
        try { return JSON.parse(r); } catch { return r; }
    } catch (e) { return d; }
};

const safeSave = (k, v) => {
    try { localStorage.setItem('svrgn_' + k, typeof v === 'object' ? JSON.stringify(v) : v); } catch (e) { }
};

const DEF_COLORS = {
    name: ['#facc15', '#f59e0b'],
    border: ['#facc15', '#27272a'],
    cardGlow: ['#000000', '#0a0a0a'],
    borderGlow: ['#facc15', '#000000'],
    bgGlow: ['#000000', '#050505'],
    icons: ['#ffffff', '#9ca3af'],
    avatarBg: '#000000',
    avatarGlow: '#facc15'
};
const DEF_EFFECTS = {
    glitchName: true, rainbowName: false, floatCard: true,
    glowCard: true, tiltEnabled: true, textShadow: true,
    cardEntrance: true, bgGlowPulse: true
};
const DEF_MEDIA = {
    bgMode: 'stars', videoUrl: '', cursorUrl: '', audioUrl: '',
    avatarOverride: '', atomSpeed: 1.5, atomDensity: 180,
    atomColor: '#facc15', atomShape: 'circle'
};
const DEF_DISCORD = {
    sync: true, customStatus: 'Sovereign Protocol', guildName: 'SVRGN Empire',
    guildIcon: '', customRpc: 'X-Vision Telemetry Active',
    showSpotify: true, showActivities: true, forceIdle: false,
    discordSince: 'Since 2021', showStatusWidget: true, showJoinedWidget: true
};
const DEF_LINKS = {
    discord: '', github: '', spotify: '', tiktok: '',
    instagram: '', twitter: '', youtube: '', steam: '',
    telegram: '', snapchat: '', soundcloud: '', reddit: ''
};
const DEF_FEATURES = {
    badges: ['verified', 'developer', 'premium'],
    typewriter: true,
    viewCounter: true
};

function deepMerge(def, user) {
    const res = Object.assign({}, def);
    if (!user || typeof user !== 'object') return res;
    for (const key in user) {
        if (user[key] !== null && typeof user[key] !== 'undefined') {
            if (typeof user[key] === 'object' && !Array.isArray(user[key]) && def[key]) {
                res[key] = deepMerge(def[key], user[key]);
            } else {
                res[key] = user[key];
            }
        }
    }
    return res;
}

function loadState() {
    return {
        discordId: safeGet('discordId', '1158363483256147978') || '1158363483256147978',
        siteTitle: safeGet('siteTitle', 'winse | SOVEREIGN') || 'winse | SOVEREIGN',
        bio: safeGet('bio', '// initializing imperial protocol...') || '// initializing imperial protocol...',
        splashTitle: safeGet('splashTitle', 'S O V E R E I G N') || 'S O V E R E I G N',
        splashStatusText: safeGet('statusText', '// TERMINAL INITIALIZING...') || '// TERMINAL INITIALIZING...',
        splashBtnText: safeGet('splashBtnText', 'ENTER SYSTEM') || 'ENTER SYSTEM',
        colors: deepMerge(DEF_COLORS, safeGet('colors', DEF_COLORS)),
        effects: deepMerge(DEF_EFFECTS, safeGet('effects', DEF_EFFECTS)),
        media: deepMerge(DEF_MEDIA, safeGet('media', DEF_MEDIA)),
        discord: deepMerge(DEF_DISCORD, safeGet('discord', DEF_DISCORD)),
        links: deepMerge(DEF_LINKS, safeGet('links', DEF_LINKS)),
        features: deepMerge(DEF_FEATURES, safeGet('features', DEF_FEATURES))
    };
}

let state = loadState();

// ============================================================
// 3. BOOT
// ============================================================
async function bootPanel() {
    try { imperialBridge = new BroadcastChannel(SYNC_CH); } catch (e) { }
    
    // Fetch remote state
    try {
        logTerminal('Sunucudan global veriler çekiliyor...');
        const res = await fetch('/api/state');
        if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0 && !data.error) {
                state = deepMerge(state, data);
            }
        }
    } catch(e) { logTerminal('Bağlantı hatası, yerel veriler kullanılıyor.'); }

    fillUI();
    logTerminal('X-VISION G9 Kernel Initialized. System Ready.');
}

// ============================================================
// 4. FILL UI FROM STATE
// ============================================================
function fillUI() {
    const set = (id, val, isCheck) => {
        try {
            const el = document.getElementById(id);
            if (!el) return;
            if (isCheck) el.checked = !!val;
            else el.value = val || '';
        } catch (e) { }
    };

    set('inputDiscordId', state.discordId);
    set('inputTitle', state.siteTitle);
    set('inputBio', state.bio);
    set('splashTitle', state.splashTitle);
    set('splashStatusText', state.splashStatusText);
    set('splashBtnText', state.splashBtnText);

    const c = state.colors;
    set('nameColor1', c.name[0]); set('nameColor2', c.name[1]);
    const ng = c.nameGlow || c.name;
    if (ng) { set('nameGlow1', ng[0]); set('nameGlow2', ng[1]); }
    set('borderColor1', c.border[0]); set('borderColor2', c.border[1]);
    set('cardGlow1', c.cardGlow[0]); set('cardGlow2', c.cardGlow[1]);
    set('borderGlow1', c.borderGlow[0]); set('borderGlow2', c.borderGlow[1]);
    set('bgGlow1', c.bgGlow[0]); set('bgGlow2', c.bgGlow[1]);
    set('iconColor1', c.icons[0]); set('iconColor2', c.icons[1]);
    set('avatarBgColor', c.avatarBg || '#000000');
    set('avatarGlowColor', c.avatarGlow || '#7d3cff');

    const eff = state.effects;
    set('checkGlitchName', eff.glitchName, true);
    set('checkRainbowName', eff.rainbowName, true);
    set('checkFloatCard', eff.floatCard, true);
    set('checkGlowCard', eff.glowCard, true);
    set('checkTiltEnabled', eff.tiltEnabled, true);
    set('checkTextShadow', eff.textShadow, true);
    set('checkCardEntrance', eff.cardEntrance, true);
    set('checkBgGlowPulse', eff.bgGlowPulse, true);

    const med = state.media;
    set('bgMode', med.bgMode); set('videoUrl', med.videoUrl);
    set('bannerUrl', med.bannerUrl);
    set('cursorUrl', med.cursorUrl); set('audioUrl', med.audioUrl);
    set('avatarOverride', med.avatarOverride);
    set('atomSpeed', med.atomSpeed); set('atomDensity', med.atomDensity);
    set('atomColor', med.atomColor); set('atomShape', med.atomShape);

    const dis = state.discord;
    set('discordSync', dis.sync, true);
    set('showSpotify', dis.showSpotify, true);
    set('showActivities', dis.showActivities, true);

    set('checkShowStatus', dis.showStatusWidget, true);
    set('checkShowJoined', dis.showJoinedWidget, true);
    set('discordSince', dis.discordSince);
    set('guildName', dis.guildName);
    set('guildIcon', dis.guildIcon);
    set('customRpc', dis.customRpc);

    const lnk = state.links;
    set('linkDiscord', lnk.discord); set('linkGithub', lnk.github);
    set('linkSpotify', lnk.spotify); set('linkTiktok', lnk.tiktok);
    set('linkInstagram', lnk.instagram); set('linkTwitter', lnk.twitter);
    set('linkYoutube', lnk.youtube); set('linkSteam', lnk.steam);
    set('linkTelegram', lnk.telegram); set('linkSnapchat', lnk.snapchat);
    set('linkSoundcloud', lnk.soundcloud); set('linkReddit', lnk.reddit);

    const feat = state.features;
    set('checkTypewriter', feat.typewriter, true);
    set('checkViewCounter', feat.viewCounter, true);
    document.querySelectorAll('.badge-check').forEach(cb => {
        cb.checked = feat.badges.includes(cb.value);
    });
}

// ============================================================
// 5. LISTEN TO ALL INPUTS (Real-time preview sync)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('input', function (e) {
        try { handleInput(e.target.id, e.target.value); notifyPreview(); } catch (err) { }
    });
    document.addEventListener('change', function (e) {
        try {
            if (e.target && e.target.classList.contains('badge-check')) {
                const val = e.target.value;
                if (e.target.checked) {
                    if (!state.features.badges.includes(val)) state.features.badges.push(val);
                } else {
                    state.features.badges = state.features.badges.filter(b => b !== val);
                }
            } else {
                handleChange(e.target.id, e.target.value, e.target.checked);
            }
            notifyPreview();
        } catch (err) { }
    });
});

function handleInput(id, val) {
    if (id === 'inputDiscordId') state.discordId = val;
    else if (id === 'inputTitle') state.siteTitle = val;
    else if (id === 'inputBio') state.bio = val;
    else if (id === 'splashTitle') state.splashTitle = val;
    else if (id === 'splashStatusText') state.splashStatusText = val;
    else if (id === 'splashBtnText') state.splashBtnText = val;
    else if (id === 'videoUrl') state.media.videoUrl = val;
    else if (id === 'bannerUrl') state.media.bannerUrl = val;
    else if (id === 'cursorUrl') state.media.cursorUrl = val;
    else if (id === 'audioUrl') state.media.audioUrl = val;
    else if (id === 'avatarOverride') state.media.avatarOverride = val;
    else if (id === 'atomSpeed') state.media.atomSpeed = val;
    else if (id === 'atomDensity') state.media.atomDensity = val;
    else if (id === 'atomColor') state.media.atomColor = val;
    else if (id === 'discordSince') state.discord.discordSince = val;
    else if (id === 'guildName') state.discord.guildName = val;
    else if (id === 'guildIcon') state.discord.guildIcon = val;
    else if (id === 'customRpc') state.discord.customRpc = val;
    else if (id === 'linkDiscord') state.links.discord = val;
    else if (id === 'linkGithub') state.links.github = val;
    else if (id === 'linkSpotify') state.links.spotify = val;
    else if (id === 'linkTiktok') state.links.tiktok = val;
    else if (id === 'linkInstagram') state.links.instagram = val;
    else if (id === 'linkTwitter') state.links.twitter = val;
    else if (id === 'linkYoutube') state.links.youtube = val;
    else if (id === 'linkSteam') state.links.steam = val;
    else if (id === 'linkTelegram') state.links.telegram = val;
    else if (id === 'linkSnapchat') state.links.snapchat = val;
    else if (id === 'linkSoundcloud') state.links.soundcloud = val;
    else if (id === 'linkReddit') state.links.reddit = val;

    // Color map
    const cmap = {
        nameColor1: ['name', 0], nameColor2: ['name', 1],
        nameGlow1: ['nameGlow', 0], nameGlow2: ['nameGlow', 1],
        borderColor1: ['border', 0], borderColor2: ['border', 1],
        cardGlow1: ['cardGlow', 0], cardGlow2: ['cardGlow', 1],
        borderGlow1: ['borderGlow', 0], borderGlow2: ['borderGlow', 1],
        bgGlow1: ['bgGlow', 0], bgGlow2: ['bgGlow', 1],
        iconColor1: ['icons', 0], iconColor2: ['icons', 1]
    };
    if (cmap[id]) state.colors[cmap[id][0]][cmap[id][1]] = val;
    // Single-value color fields
    if (id === 'avatarBgColor') state.colors.avatarBg = val;
    if (id === 'avatarGlowColor') state.colors.avatarGlow = val;
}

function handleChange(id, val, checked) {
    if (id === 'bgMode') state.media.bgMode = val;
    else if (id === 'atomShape') state.media.atomShape = val;
    else if (id === 'discordSync') state.discord.sync = checked;
    else if (id === 'showSpotify') state.discord.showSpotify = checked;
    else if (id === 'showActivities') state.discord.showActivities = checked;

    else if (id === 'checkShowStatus') state.discord.showStatusWidget = checked;
    else if (id === 'checkShowJoined') state.discord.showJoinedWidget = checked;
    else if (id === 'checkGlitchName') state.effects.glitchName = checked;
    else if (id === 'checkRainbowName') state.effects.rainbowName = checked;
    else if (id === 'checkFloatCard') state.effects.floatCard = checked;
    else if (id === 'checkGlowCard') state.effects.glowCard = checked;
    else if (id === 'checkTiltEnabled') state.effects.tiltEnabled = checked;
    else if (id === 'checkTextShadow') state.effects.textShadow = checked;
    else if (id === 'checkCardEntrance') state.effects.cardEntrance = checked;
    else if (id === 'checkBgGlowPulse') state.effects.bgGlowPulse = checked;
    else if (id === 'checkTypewriter') state.features.typewriter = checked;
    else if (id === 'checkViewCounter') state.features.viewCounter = checked;
}

// ============================================================
// 6. SAVE & SEAL
// ============================================================
async function sealProtocol() {
    try {
        const pwd = prompt("Siteyi kaydetmek için Admin Şifresi girin (örn: winserules123):");
        if (!pwd) {
            logTerminal('İşlem iptal edildi.');
            return;
        }

        Object.keys(state).forEach(k => safeSave(k, state[k]));
        
        logTerminal('Cloudflare KV sunucusuna veriler gönderiliyor...');
        const payload = Object.assign({}, state, { adminPassword: pwd });

        const res = await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const resData = await res.json();
        
        if (!res.ok || resData.error) {
            logTerminal('HATA: ' + (resData.error || 'Yetkisizlik / Şifre yanlış!'));
            return;
        }

        if (imperialBridge) imperialBridge.postMessage(state);
        notifyPreview();

        const btn = document.getElementById('saveBtn');
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i><span>MÜHÜRLENDİ!</span>';
            btn.style.background = '#22c55e';
            setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2500);
        }
        logTerminal('Protokol mühürlendi. Global State senkronize edildi.');
    } catch (e) { logTerminal('HATA: ' + e.message); }
}

// ============================================================
// 7. PREVIEW SYNC
// ============================================================
function notifyPreview() {
    try {
        const frame = document.getElementById('previewIframe');
        if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage({ type: 'PREVIEW_SYNC', state }, '*');
        }
    } catch (e) { }
}

// ============================================================
// 8. TERMINAL LOG
// ============================================================
function logTerminal(msg) {
    try {
        const term = document.getElementById('v5-terminal-output');
        if (!term) return;
        const line = document.createElement('div');
        line.innerHTML = '<span style="color:#555">[' + new Date().toLocaleTimeString() + ']</span> > ' + msg;
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;
    } catch (e) { }
}

// ============================================================
// 9. START
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPanel);
} else {
    bootPanel();
}

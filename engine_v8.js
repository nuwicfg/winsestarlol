/**
 * SOVEREIGN v7.0 "THE EMPEROR" - BULLETPROOF ENGINE
 * @author: Antigravity / winse
 */

// ============================================================
// 1. IMMEDIATE ENTRY FIX — This MUST run first, no dependencies
// ============================================================
(function () {
    function doEntry() {
        var splash = document.getElementById('splashLayer');
        var main = document.getElementById('mainUI');
        if (splash) splash.classList.add('splash-exited');
        if (main) main.classList.add('main-visible');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.getElementById('enterBtn');
        if (btn) {
            btn.addEventListener('click', doEntry, true);
            btn.onclick = doEntry;
        }
        // Also attach to splash layer as fallback
        var splash = document.getElementById('splashLayer');
        if (splash) {
            splash.addEventListener('click', function (e) {
                if (e.target.closest('#enterBtn')) doEntry();
            }, true);
        }
    });
})();

// ============================================================
// 2. STATE SYSTEM
// ============================================================
"use strict";

const config = { discordId: '1158363483256147978', syncChannel: 'SOVEREIGN_CHANNEL' };
let syncBridge = null;
let ytEngine = null;

const safeGet = (k, d) => {
    try {
        const r = localStorage.getItem('svrgn_' + k);
        if (!r) return d;
        // Optimization: Do NOT JSON.parse strings that are purely digits (BigInt IDs)
        if (/^\d{16,}$/.test(r)) return r;
        try { return JSON.parse(r); } catch { return r; }
    } catch (e) { return d; }
};

const safeObj = (val, def) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) return val;
    return def;
};

const safeArr = (val, def) => {
    if (Array.isArray(val) && val.length >= 2) return val;
    return def;
};

const DEF_COLORS = {
    name: ['#facc15', '#f59e0b'],
    border: ['#facc15', '#27272a'],
    cardGlow: ['#000000', '#0a0a0a'],
    borderGlow: ['#facc15', '#000000'],
    bgGlow: ['#000000', '#050505'],
    icons: ['#ffffff', '#9ca3af'],
    nameGlow: ['#facc15', '#f59e0b']
};
const DEF_EFFECTS = {
    glitchName: true, rainbowName: false, floatCard: true,
    glowCard: true, tiltEnabled: true, textShadow: true,
    cardEntrance: true, bgGlowPulse: true
};
const DEF_MEDIA = {
    bgMode: 'stars', videoUrl: '', cursorUrl: '', audioUrl: '',
    avatarOverride: '', atomSpeed: 1.5, atomDensity: 180,
    atomColor: '#facc15', atomShape: 'circle', bannerUrl: ''
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

let rawState = {
    discordId: safeGet('discordId', config.discordId) || config.discordId,
    siteTitle: safeGet('siteTitle', 'winse | SOVEREIGN') || 'winse | SOVEREIGN',
    bio: safeGet('bio', '// initializing imperial protocol...') || '// initializing imperial protocol...',
    splashTitle: safeGet('splashTitle', 'S O V E R E I G N') || 'S O V E R E I G N',
    splashStatusText: safeGet('statusText', '// TERMINAL INITIALIZING...') || '// TERMINAL INITIALIZING...',
    splashBtnText: safeGet('splashBtnText', 'ENTER SYSTEM') || 'ENTER SYSTEM',
    colors: safeGet('colors', DEF_COLORS),
    effects: safeGet('effects', DEF_EFFECTS),
    media: safeGet('media', DEF_MEDIA),
    discord: safeGet('discord', DEF_DISCORD),
    links: safeGet('links', DEF_LINKS),
    features: safeGet('features', DEF_FEATURES)
};

let sState = {
    discordId: rawState.discordId,
    siteTitle: rawState.siteTitle,
    bio: rawState.bio,
    splashTitle: rawState.splashTitle,
    splashStatusText: rawState.splashStatusText,
    splashBtnText: rawState.splashBtnText,
    colors: deepMerge(DEF_COLORS, rawState.colors),
    effects: deepMerge(DEF_EFFECTS, rawState.effects),
    media: deepMerge(DEF_MEDIA, rawState.media),
    discord: deepMerge(DEF_DISCORD, rawState.discord),
    links: deepMerge(DEF_LINKS, rawState.links),
    features: deepMerge(DEF_FEATURES, rawState.features)
};

// Ensure sub-arrays are and names are valid
['name', 'border', 'cardGlow', 'borderGlow', 'bgGlow', 'icons'].forEach(k => {
    if (!Array.isArray(sState.colors[k]) || sState.colors[k].length < 2) sState.colors[k] = DEF_COLORS[k];
});

// ============================================================
// 3. BOOT SEQUENCE
// ============================================================
// ============================================================
// 3. EMERGENCY MIGRATION v4.0.3
// ============================================================
function runv4Migration() {
    const v = localStorage.getItem('svrgn_v');
    if (v !== '4.0.5') {
        const oldName = localStorage.getItem('svrgn_name');
        const oldBio = localStorage.getItem('svrgn_bio');
        // Clear common default/placeholder overrides
        if (oldName === 'winse' || !oldName) localStorage.removeItem('svrgn_name');
        if (oldBio === 'MR <3' || !oldBio) localStorage.removeItem('svrgn_bio');
        // Force Enable Lanyard & Elite v4 Features
        localStorage.setItem('svrgn_discord', JSON.stringify({
            ...DEF_DISCORD,
            showSpotify: true,
            showActivities: true
        }));
        localStorage.setItem('svrgn_features', JSON.stringify({
            ...DEF_FEATURES,
            typewriter: true,
            viewCounter: true
        }));
        localStorage.setItem('svrgn_v', '4.0.3');
        console.log('Sovereign v4.0.3 Migration Complete: Clean Elite State.');
    }
}

async function bootX() {
    runv4Migration();
    try { syncBridge = new BroadcastChannel(config.syncChannel); } catch (e) { }
    
    // Fetch global state from KV
    try {
        const res = await fetch('/api/state');
        if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0 && !data.error) {
                sState = deepMerge(sState, data);
            }
        }
    } catch(e) { console.warn('[Sovereign] Remote state fetch warning:', e); }

    applySovereignState(sState);
    setupAtomicRadar();
    preloadAvatar();
    fetchTelemetry();
    setInterval(fetchTelemetry, 10000);
}

// Immediately loads avatar from Lanyard so splash shows profile photo
function buildAvatarUrl(user, override) {
    if (override) return override;
    if (!user || !user.avatar) return '';
    // Animated avatars start with 'a_'
    const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
    return 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.' + ext + '?size=512';
}

function applyAvatar(url) {
    const fallback = 'radial-gradient(circle at 35% 35%, #a855f7, #7d3cff, #2e0066)';
    ['splashAvatar', 'profileAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!url) {
            el.removeAttribute('src');
            el.style.background = fallback;
            return;
        }
        el.onerror = () => {
            console.error('Avatar failed to load for:', id, 'URL:', url);
            el.removeAttribute('src');
            el.style.background = fallback;
        };
        el.src = url;
        console.log('Avatar set for', id, '=>', url);
        // Make sure it's visible if it was hidden
        el.style.opacity = '1';
    });
}

async function preloadAvatar() {
    try {
        const id = sState.discordId || config.discordId;
        const res = await fetch('https://api.lanyard.rest/v1/users/' + id);
        const json = await res.json();
        if (!json || !json.data) return;
        const u = json.data.discord_user;
        const override = sState.media && sState.media.avatarOverride;
        applyAvatar(buildAvatarUrl(u, override));

        // Also update profile name & username if not overridden
        const nameEl = document.getElementById('profileName');
        const userEl = document.getElementById('profileUsername');
        if (nameEl && u.global_name) { nameEl.textContent = u.global_name; nameEl.setAttribute('data-text', u.global_name); }
        if (userEl && u.username) userEl.textContent = '@' + u.username;

        // Debug: log real Discord flags
        console.log('[Sovereign] discord_user public_flags:', u.public_flags, '| premium_type:', u.premium_type);

        // Render real badges early (on page load, before presence arrives)
        if (typeof renderRealDiscordBadges === 'function') renderRealDiscordBadges(u);
        console.log('Avatar and Profile Info loaded successfully');
    } catch (e) {
        console.error('Lanyard Avatar Fetch Error:', e);
    }
}

// ============================================================
// 4. APPLY STATE
// ============================================================
function applySovereignState(s) {
    const root = document.documentElement;
    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    if (s.siteTitle) document.title = s.siteTitle;

    // Bio Typewriter
    const bioEl = document.getElementById('profileBio');
    if (bioEl) {
        const feat = s.features || DEF_FEATURES;
        if (feat.typewriter) {
            applyTypewriter(bioEl, s.bio);
        } else {
            bioEl.innerHTML = s.bio;
        }
    }

    setT('splashStatusText', s.splashStatusText);
    setT('splashMainText', s.splashTitle);

    const c = s.colors || DEF_COLORS;
    root.style.setProperty('--text-start', (c.name || DEF_COLORS.name)[0]);
    root.style.setProperty('--text-end', (c.name || DEF_COLORS.name)[1]);
    root.style.setProperty('--border-start', (c.border || DEF_COLORS.border)[0]);
    root.style.setProperty('--border-end', (c.border || DEF_COLORS.border)[1]);
    root.style.setProperty('--card-glow-start', (c.cardGlow || DEF_COLORS.cardGlow)[0]);
    root.style.setProperty('--card-glow-end', (c.cardGlow || DEF_COLORS.cardGlow)[1]);
    root.style.setProperty('--border-glow-start', (c.borderGlow || DEF_COLORS.borderGlow)[0]);
    root.style.setProperty('--icon-start', (c.icons || DEF_COLORS.icons)[0]);
    root.style.setProperty('--icon-end', (c.icons || DEF_COLORS.icons)[1]);
    root.style.setProperty('--name-glow-start', (c.nameGlow || c.name || DEF_COLORS.nameGlow || DEF_COLORS.name)[0]);
    root.style.setProperty('--name-glow-end', (c.nameGlow || c.name || DEF_COLORS.nameGlow || DEF_COLORS.name)[1]);
    root.style.setProperty('--accent-primary', (c.name || DEF_COLORS.name)[0]);
    root.style.setProperty('--bg-glow-start', (c.bgGlow || DEF_COLORS.bgGlow)[0]);
    root.style.setProperty('--bg-glow-end', (c.bgGlow || DEF_COLORS.bgGlow)[1]);
    root.style.setProperty('--avatar-bg', c.avatarBg || '#000000');
    root.style.setProperty('--avatar-glow', c.avatarGlow || '#7d3cff');

    const eff = s.effects || DEF_EFFECTS;
    const nameEl = document.getElementById('profileName');
    const cardEl = document.getElementById('mainCard');

    if (nameEl) {
        nameEl.classList.toggle('active-glitch', !!eff.glitchName);
        nameEl.classList.toggle('rainbow-text', !!eff.rainbowName);
    }
    if (cardEl) {
        cardEl.classList.toggle('float-animation', !!eff.floatCard);
        cardEl.classList.toggle('glow-animation', !!eff.glowCard);
        cardEl.classList.add('gradient-border');
    }

    const actMed = s.media || DEF_MEDIA;
    const bannerEl = document.getElementById('cardBanner');
    if (bannerEl) {
        if (actMed.bannerUrl) {
            bannerEl.style.background = 'url(' + actMed.bannerUrl + ') center/cover no-repeat';
            bannerEl.style.opacity = '0.6';
        } else {
            bannerEl.style.background = 'linear-gradient(135deg, var(--card-glow-start), var(--card-glow-end))';
            bannerEl.style.opacity = '0.15';
        }
    }

    handleBgMatrix(actMed);
    if (actMed.cursorUrl) root.style.cursor = 'url(' + actMed.cursorUrl + '), auto';
    renderSovereignSocial(s.links || DEF_LINKS);

    // Apply Guns.lol Features
    const feat = s.features || DEF_FEATURES;
    applyBadges(feat.badges);
    applyViewCounter(feat.viewCounter);

    // NEW: Always render prefs (Status/Joined) even if Lanyard is off
    renderDiscordPrefs();

    // Always render guild widget from state (no Lanyard needed)
    if (typeof renderGuildWidget === 'function') renderGuildWidget();
}

// ============================================================
// 5. BACKGROUND
// ============================================================
function handleBgMatrix(m) {
    const atom = document.getElementById('particles-js');
    const vLayer = document.getElementById('videoLayer');
    const native = document.getElementById('nativeVideo');
    if (!atom || !vLayer) return;

    if (m.bgMode === 'video' && m.videoUrl) {
        atom.style.opacity = '0';
        vLayer.classList.add('active');
        vLayer.classList.remove('hidden');
        if (m.videoUrl.includes('youtube.com') || m.videoUrl.includes('youtu.be')) {
            initYT(m.videoUrl);
        } else if (native) {
            native.src = m.videoUrl;
            native.style.display = 'block';
        }
        stopCanvasAnimation();
    } else if (['matrix', 'snow', 'stars', 'fireflies', 'vaporwave'].includes(m.bgMode)) {
        vLayer.classList.remove('active');
        vLayer.classList.add('hidden');
        atom.style.opacity = '0';
        document.getElementById('bgCanvas').classList.remove('hidden');
        startCanvasAnimation(m.bgMode, m);
    } else {
        vLayer.classList.remove('active');
        vLayer.classList.add('hidden');
        document.getElementById('bgCanvas').classList.add('hidden');
        stopCanvasAnimation();
        atom.style.opacity = '0.5';
        if (window.particlesJS) {
            try {
                particlesJS('particles-js', {
                    particles: {
                        number: { value: parseInt(m.atomDensity) || 150 },
                        color: { value: m.atomColor || '#ffffff' },
                        opacity: { value: 0.5 }, size: { value: 3 },
                        line_linked: { enable: true, distance: 150, color: m.atomColor || '#ffffff', opacity: 0.3, width: 1 },
                        shape: { type: m.atomShape || 'circle' },
                        move: { enable: true, speed: parseFloat(m.atomSpeed) || 2 }
                    }
                });
            } catch (e) { }
        }
    }
}

function initYT(url) {
    const vidId = url.split('v=')[1] || url.split('/').pop();
    if (ytEngine && ytEngine.loadVideoById) { ytEngine.loadVideoById(vidId); return; }
    if (window.YT && window.YT.Player) {
        ytEngine = new YT.Player('ytPlayer', {
            videoId: vidId,
            playerVars: { autoplay: 1, controls: 0, mute: 1, loop: 1, playlist: vidId },
            events: { onReady: e => e.target.playVideo() }
        });
    }
}

// ============================================================
// 6. SOCIALS
// ============================================================
function renderSovereignSocial(links) {
    const grid = document.getElementById('socialLinks');
    if (!grid) return;
    grid.innerHTML = '';
    const icons = {
        discord: 'fa-discord', github: 'fa-github', spotify: 'fa-spotify',
        tiktok: 'fa-tiktok', instagram: 'fa-instagram', twitter: 'fa-x-twitter',
        youtube: 'fa-youtube', steam: 'fa-steam', telegram: 'fa-telegram',
        snapchat: 'fa-snapchat', soundcloud: 'fa-soundcloud', reddit: 'fa-reddit-alien'
    };
    Object.keys(icons).forEach(k => {
        if (links[k]) {
            grid.innerHTML += '<a href="' + links[k] + '" target="_blank" class="social-item"><i class="fa-brands ' + icons[k] + '"></i></a>';
        }
    });
}

// ============================================================
// 7. DISCORD TELEMETRY
// ============================================================
async function fetchTelemetry() {
    // 1. Def ID Fallback
    const dId = sState.discordId || config.discordId || '1158363483256147978';

    // 2. State Guard
    if (!sState.discord) sState.discord = DEF_DISCORD;
    if (sState.discord.sync === false) {
        console.warn('Lanyard Sync is manually disabled in sState.');
        return;
    }

    try {
        const r = await fetch('https://api.lanyard.rest/v1/users/' + dId);
        const { data } = await r.json();

        if (data) {
            console.log('Lanyard Telemetry Received Successfully for:', dId);
            renderTelemetry(data);
        } else {
            console.warn('Lanyard data is empty for:', dId);
        }
    } catch (e) {
        console.warn('Telemetry Fetch Error:', e);
        // Quick retry if it fails (initial boot)
        if (!window._telemetryRetried) {
            window._telemetryRetried = true;
            setTimeout(fetchTelemetry, 3000);
        }
    }
}

function getStatusMeta(status) {
    const map = {
        online: { color: '#22c55e', icon: 'fa-solid fa-circle' },
        idle: { color: '#f59e0b', icon: 'fa-solid fa-moon' },
        dnd: { color: '#ef4444', icon: 'fa-solid fa-circle-minus' },
        offline: { color: '#4b5563', icon: 'fa-solid fa-circle' }
    };
    return map[status] || map.offline;
}

function getBadgesHtml(badges) {
    if (!badges || badges.length === 0) return '';
    const badgeMap = {
        'verified': { icon: 'fa-solid fa-check-circle', color: '#3b82f6' },
        'premium': { icon: 'fa-solid fa-gem', color: '#10b981' },
        'developer': { icon: 'fa-solid fa-code', color: '#8b5cf6' },
        'supporter': { icon: 'fa-solid fa-heart', color: '#ef4444' },
        'bot': { icon: 'fa-solid fa-robot', color: '#9ca3af' },
        'staff': { icon: 'fa-solid fa-shield-halved', color: '#f59e0b' }
    };
    return badges.map(b => {
        const bdg = badgeMap[b];
        if (!bdg) return '';
        return `<i class="${bdg.icon}" style="color: ${bdg.color}; font-size: 11px;"></i>`;
    }).join(' ');
}

// Real Discord badges from public_flags bitmask (Lanyard API)
const DISCORD_FLAGS = [
    { flag: 1, label: 'Staff', img: 'https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c2da70d0a96feb.png' },
    { flag: 2, label: 'Partner', img: 'https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png' },
    { flag: 4, label: 'HypeSquad', img: 'https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png' },
    { flag: 8, label: 'Bug Hunter', img: 'https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png' },
    { flag: 64, label: 'Bravery', img: 'https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45afe70.png' },
    { flag: 128, label: 'Brilliance', img: 'https://cdn.discordapp.com/badge-icons/011940fd013082d99d0897f8d27cf336.png' },
    { flag: 256, label: 'Balance', img: 'https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png' },
    { flag: 512, label: 'Early Supporter', img: 'https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png' },
    { flag: 16384, label: 'Bug Hunter L2', img: 'https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png' },
    { flag: 131072, label: 'Verified Dev', img: 'https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png' },
    { flag: 4194304, label: 'Active Dev', img: 'https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png' },
];

function renderRealDiscordBadges(discordUser) {
    const el = document.getElementById('discordBadgesRow');
    if (!el) return;
    // Lanyard may provide public_flags or public_flags_v2
    const flags = discordUser.public_flags_v2 || discordUser.public_flags || 0;
    // Nitro: check premium_type (1 = Nitro Classic, 2 = Nitro, 3 = Nitro Basic)
    const hasNitro = discordUser.premium_type && discordUser.premium_type > 0;
    let html = '';
    if (hasNitro) {
        html += `<span class="d-badge"><img src="https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png" alt="Nitro"> Nitro</span>`;
    }
    DISCORD_FLAGS.forEach(b => {
        // Use bitwise AND with BigInt-safe check
        if ((flags & b.flag) !== 0) {
            html += `<span class="d-badge"><img src="${b.img}" alt="${b.label}"> ${b.label}</span>`;
        }
    });
    if (html) {
        el.innerHTML = html;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function renderGuildWidget() {
    const el = document.getElementById('guildWidget');
    if (!el) return;
    const d = sState.discord || DEF_DISCORD;
    const name = d.guildName;
    const icon = d.guildIcon;
    if (!name) { el.classList.add('hidden'); return; }
    const iconHtml = icon
        ? `<img src="${icon}" class="guild-icon" alt="${name}">`
        : `<div class="guild-icon-placeholder">${name.charAt(0).toUpperCase()}</div>`;
    el.innerHTML = `
        ${iconHtml}
        <div class="guild-info">
            <span class="guild-label"><i class="fa-brands fa-discord"></i> SUNUCU</span>
            <span class="guild-name">${name}</span>
        </div>`;
    el.classList.remove('hidden');
}

function renderTelemetry(data) {
    if (!data) return;
    try {
        const u = data.discord_user;
        const override = sState.media && sState.media.avatarOverride;
        const activeAvatar = buildAvatarUrl(u, override);
        applyAvatar(activeAvatar);

        let dStatus = data.discord_status || 'offline';
        const sMeta = getStatusMeta(dStatus);

        const statusEl = document.getElementById('discordStatus');
        if (statusEl) statusEl.style.background = sMeta.color;

        // Render real Discord badges from public_flags
        renderRealDiscordBadges(u);
        // Render guild widget from panel settings
        renderGuildWidget();

        const presenceWrap = document.getElementById('presenceRoot');
        if (!presenceWrap) return;
        presenceWrap.innerHTML = '';

        const badgeHtml = getBadgesHtml(sState.features.badges);
        const displayName = u.global_name || u.username;

        // Common Horizontal Card Builder
        const buildCard = (config) => {
            return `
                <div class="p-card ${config.isSpotify ? 'spotify-active' : ''}">
                    <div class="p-left">
                        <div class="p-avatar-wrap">
                            <img src="${activeAvatar}" class="p-av-img">
                            <div class="p-av-status ${dStatus}">
                                <i class="${sMeta.icon}"></i>
                            </div>
                        </div>
                        <div class="p-mid">
                            <div class="p-name-row">
                                <span class="p-n-text">${displayName}</span>
                                <div class="p-n-badge-row">${badgeHtml}</div>
                            </div>
                            <div class="p-info-row"><span>${config.header}</span> ${config.title}</div>
                            <div class="p-sub-row">${config.sub}</div>
                        </div>
                    </div>
                    <div class="p-right">
                        <img src="${config.img}" class="p-art-img">
                    </div>
                    ${config.isSpotify ? '<div class="spotify-progress-wrap"><div class="spotify-progress-bar"></div></div>' : ''}
                </div>`;
        };

        const isSpotify = data.listening_to_spotify && (sState.discord && sState.discord.showSpotify !== false);
        if (isSpotify && data.spotify) {
            const sp = data.spotify;
            presenceWrap.innerHTML += buildCard({
                isSpotify: true,
                header: '<span style="color: #22c55e;">Listening to</span>',
                title: sp.song || sp.track || 'Unknown',
                sub: `by ${sp.artist}`,
                img: sp.album_art_url
            });
        }

        if (data.activities && (sState.discord.showActivities !== false)) {
            data.activities.filter(a => a.type !== 4).forEach(act => {
                // EXCLUDE REDUNDANT SPOTIFY ACTIVITY
                if (act.name === 'Spotify') return;

                let asset = '';
                if (act.assets && act.assets.large_image) {
                    const img = act.assets.large_image;
                    asset = img.includes('spotify')
                        ? 'https://i.scdn.co/image/' + img.split(':')[1]
                        : 'https://cdn.discordapp.com/app-assets/' + act.application_id + '/' + img + '.png';
                }
                presenceWrap.innerHTML += buildCard({
                    isSpotify: false,
                    header: 'Playing',
                    title: act.name,
                    sub: act.details || act.state || 'Active Session',
                    img: asset || 'https://i.imgur.com/7b2z6z5.png' // Default fallback
                });
            });
        }

        const content = presenceWrap.innerHTML.trim();
        if (content !== "") {
            presenceWrap.classList.remove('hidden');
            // ELITE FORCE VISIBILITY
            presenceWrap.setAttribute('style', 'display: block !important; opacity: 1 !important; visibility: visible !important;');
        } else {
            presenceWrap.classList.add('hidden');
            presenceWrap.style.display = 'none';
        }

        // Ensure parent containers aren't hiding it
        const cardBody = document.querySelector('.main-card-body-v7');
        if (cardBody) cardBody.style.overflow = 'visible';

        renderDiscordPrefs(data);
    } catch (e) { console.error('Telemetry Render Crash:', e); }
}

function renderDiscordPrefs(lanyardData = null) {
    const prefsWrap = document.getElementById('discordPrefs');
    if (!prefsWrap) return;

    const d = sState.discord || DEF_DISCORD;
    const showStatus = d.showStatusWidget !== false; // handle legacy state
    const showJoined = d.showJoinedWidget !== false; // handle legacy state

    prefsWrap.innerHTML = '';

    if (lanyardData && lanyardData.listening_to_spotify) {
        const s = lanyardData.spotify;
        prefsWrap.innerHTML += `
            <div class="v8-pref-widget spotify-box-v8">
                <div class="pref-label"><i class="fa-brands fa-spotify"></i> NOW PLAYING</div>
                <div class="pref-val">${s.song || s.track} — ${s.artist}</div>
            </div>`;
    } else if (lanyardData && lanyardData.activities && lanyardData.activities.length > 0) {
        const act = lanyardData.activities.find(a => a.type === 0);
        if (act) {
            prefsWrap.innerHTML += `
                <div class="v8-pref-widget activity-box-v8">
                    <div class="pref-label"><i class="fa-solid fa-gamepad"></i> PLAYING</div>
                    <div class="pref-val">${act.name}</div>
                </div>`;
        }
    }
}

// ============================================================
// 8. EVENT RADAR (SECONDARY — entry already bound at top)
// ============================================================
function setupAtomicRadar() {
    // Bind tilt if enabled
    if (sState.effects && sState.effects.tiltEnabled) {
        setupStaticTilt();
    }
    // Sync bridge listener
    if (syncBridge) {
        syncBridge.onmessage = e => { try { sState = e.data; applySovereignState(e.data); } catch (err) { } };
    }
    window.addEventListener('message', e => {
        try {
            if (e.data && e.data.type === 'PREVIEW_SYNC') {
                sState = e.data.state;
                applySovereignState(e.data.state);
                fetchTelemetry(); // Force refresh telemetry on sync
            }
        } catch (err) { }
    });
}

function setupStaticTilt() {
    try {
        const card = document.getElementById('cardTilt');
        if (!card || card._tiltBound) return;
        card._tiltBound = true;
        let ticking = false;
        card.addEventListener('mousemove', e => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -12;
                    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 12;
                    card.style.transform = 'perspective(2000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.02,1.02,1.02)';
                    ticking = false;
                });
                ticking = true;
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(2000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    } catch (e) { }
}

// ============================================================
// 9. GUNS.LOL FEATURES (BADGES, TYPEWRITER, VIEWS, CANVAS)
// ============================================================

// Typewriter
let typewTimeout;
function applyTypewriter(el, text) {
    if (el._typingText === text) return; // ignore same text
    el._typingText = text;
    clearTimeout(typewTimeout);
    el.innerHTML = '<span class="tw-text"></span><span class="typewriter-cursor"></span>';
    const textSpan = el.querySelector('.tw-text');
    let i = 0;
    function typeChar() {
        if (!el.isConnected || el._typingText !== text) return;
        if (i < text.length) {
            textSpan.textContent += text.charAt(i);
            i++;
            typewTimeout = setTimeout(typeChar, 40 + Math.random() * 50);
        }
    }
    typeChar();
}

// Badges
function applyBadges(badges) {
    const wrap = document.getElementById('badgeContainer');
    if (!wrap) return;
    if (!badges || badges.length === 0) {
        wrap.classList.add('hidden');
        wrap.innerHTML = '';
        return;
    }
    wrap.classList.remove('hidden');

    // DB
    const badgeMap = {
        'verified': { icon: 'fa-solid fa-check-circle', tip: 'Verified Sovereign' },
        'premium': { icon: 'fa-solid fa-gem', tip: 'Premium Membership' },
        'developer': { icon: 'fa-solid fa-code', tip: 'System Architect' },
        'supporter': { icon: 'fa-solid fa-heart', tip: 'Early Supporter' },
        'bot': { icon: 'fa-solid fa-robot', tip: 'Automated Agent' },
        'staff': { icon: 'fa-solid fa-shield-halved', tip: 'Sovereign Staff' }
    };

    wrap.innerHTML = '';
    badges.forEach(b => {
        const bdg = badgeMap[b];
        if (bdg) {
            wrap.innerHTML += '<div class="badge-item" data-tooltip="' + bdg.tip + '"><i class="' + bdg.icon + '"></i></div>';
        }
    });
}

// Views Counter
function applyViewCounter(enabled) {
    const vc = document.getElementById('viewCounter');
    if (!vc) return;
    if (!enabled) {
        vc.classList.add('hidden');
        return;
    }
    vc.classList.remove('hidden');
    let views = safeGet('profileViewsCount', 1337);
    if (!vc._viewIncremented) {
        if (!window.location.href.includes('panel')) {
            views++;
            try { localStorage.setItem('svrgn_profileViewsCount', views); } catch (e) { }
        }
        vc._viewIncremented = true;
    }
    const valEl = document.getElementById('viewCountVal');
    if (valEl) valEl.textContent = views.toLocaleString();
}

// Canvas FX
let canvasAnimId;
function startCanvasAnimation(mode, m) {
    stopCanvasAnimation();
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (mode === 'matrix') {
        const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const fontSize = 14;
        const cols = canvas.width / fontSize;
        const drops = Array(Math.floor(cols)).fill(1);
        const color = m.atomColor || '#0f0';
        const speedVal = parseFloat(m.atomSpeed) || 2;
        const throttle = Math.max(1, Math.floor(10 / speedVal));
        let frameCount = 0;
        function drawMatrix() {
            if (frameCount % throttle === 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = color;
                ctx.font = fontSize + 'px monospace';
                for (let i = 0; i < drops.length; i++) {
                    const text = letters[Math.floor(Math.random() * letters.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
            }
            frameCount++;
            canvasAnimId = requestAnimationFrame(drawMatrix);
        }
        drawMatrix();
    } else if (mode === 'snow') {
        const mp = m.atomDensity || 100;
        const particles = [];
        for (let i = 0; i < mp; i++) {
            particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 3 + 1, d: Math.random() * mp });
        }
        let angle = 0;
        const sMod = (parseFloat(m.atomSpeed) || 2) * 0.5;
        function drawSnow() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            for (let i = 0; i < mp; i++) {
                const p = particles[i];
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            }
            ctx.fill();
            angle += 0.01;
            for (let i = 0; i < mp; i++) {
                const p = particles[i];
                p.y += Math.max(0.5, (Math.cos(angle + p.d) + 1 + p.r / 2) * sMod);
                p.x += Math.sin(angle) * 2 * sMod;
                if (p.x > canvas.width + 5 || p.x < -5 || p.y > canvas.height) {
                    if (i % 3 > 0) { particles[i] = { x: Math.random() * canvas.width, y: -10, r: p.r, d: p.d }; }
                    else {
                        if (Math.sin(angle) > 0) particles[i] = { x: -5, y: Math.random() * canvas.height, r: p.r, d: p.d };
                        else particles[i] = { x: canvas.width + 5, y: Math.random() * canvas.height, r: p.r, d: p.d };
                    }
                }
            }
            canvasAnimId = requestAnimationFrame(drawSnow);
        }
        drawSnow();
    } else if (mode === 'stars') {
        const starCount = m.atomDensity || 100;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * canvas.width });
        }
        let speedX = parseFloat(m.atomSpeed) || 2;
        function drawStars() {
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = m.atomColor || "#ffffff";
            for (let i = 0; i < starCount; i++) {
                let s = stars[i];
                s.z -= speedX * 2;
                if (s.z <= 0) { s.z = canvas.width; s.x = Math.random() * canvas.width; s.y = Math.random() * canvas.height; }
                let px = (s.x - canvas.width / 2) * (canvas.width / s.z) + canvas.width / 2;
                let py = (s.y - canvas.height / 2) * (canvas.width / s.z) + canvas.height / 2;
                let r = (1 - s.z / canvas.width) * 3;
                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);
                ctx.fill();
            }
            canvasAnimId = requestAnimationFrame(drawStars);
        }
        drawStars();
    } else if (mode === 'fireflies') {
        const fCount = m.atomDensity || 50;
        const fireflies = [];
        for (let i = 0; i < fCount; i++) {
            fireflies.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                s: Math.random() * 2 + 1, a: Math.random() * 360, v: (Math.random() * 0.5 + 0.1) * (parseFloat(m.atomSpeed) || 2)
            });
        }
        function drawFireflies() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const color = m.atomColor || '#facc15';
            for (let i = 0; i < fCount; i++) {
                let f = fireflies[i];
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
                ctx.shadowBlur = 15; ctx.shadowColor = color;
                ctx.fillStyle = color; ctx.fill();
                ctx.shadowBlur = 0;
                f.x += Math.cos(f.a) * f.v; f.y += Math.sin(f.a) * f.v;
                f.a += (Math.random() - 0.5) * 0.2;
                if (f.x < 0 || f.x > canvas.width || f.y < 0 || f.y > canvas.height) {
                    f.x = Math.random() * canvas.width; f.y = Math.random() * canvas.height;
                }
            }
            canvasAnimId = requestAnimationFrame(drawFireflies);
        }
        drawFireflies();
    } else if (mode === 'vaporwave') {
        const speed = parseFloat(m.atomSpeed) || 2;
        let offset = 0;
        const color = m.atomColor || '#ff00ff';
        function drawVaporwave() {
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            const cy = canvas.height * 0.65;
            for (let i = 0; i < 15; i++) {
                let y = cy + Math.pow(i, 2) * 2 + (offset % 10) * 2;
                if (y > canvas.height) continue;
                ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
            }
            for (let i = -20; i < 20; i++) {
                let xTop = canvas.width / 2 + i * 30;
                let xBot = canvas.width / 2 + i * 180;
                ctx.moveTo(xTop, cy); ctx.lineTo(xBot, canvas.height);
            }
            ctx.stroke();

            const grad = ctx.createLinearGradient(0, cy - 50, 0, cy + 50);
            grad.addColorStop(0, "transparent");
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.fillRect(0, cy - 5, canvas.width, 10);

            offset += speed * 0.5;
            canvasAnimId = requestAnimationFrame(drawVaporwave);
        }
        drawVaporwave();
    }
}
function stopCanvasAnimation() {
    if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
}

// ============================================================
// 10. LAUNCH
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootX);
} else {
    bootX();
}

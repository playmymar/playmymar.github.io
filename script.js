/**
 * MYMAR - Profesyonel Macera Oyunu
 * @version 2.0
 * @description Platform oyunu - 10 bölüm, 4 karakter, özelleştirilebilir ayarlar
 * @author AI Assistant
 */

// ============================================================
// OYUN ANA SINIFI
// ============================================================
class Game {
    constructor() {
        // ======================================================
        // CANVAS VE CONTEXT
        // ======================================================
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // ======================================================
        // OYUN DURUMU
        // ======================================================
        this.state = 'menu';              // menu, playing, paused, levelComplete, gameOver
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.goldCollected = 0;
        this.totalGold = 0;
        this.gemsCollected = 0;
        this.time = 0;
        this.difficulty = 'normal';
        this.selectedCharacter = 'warrior';
        this.charColor = '#ff6b35';
        this.speedMultiplier = 3;
        this.currentBg = 'default';
        this.comboCount = 0;
        this.maxCombo = 0;
        this.totalKills = 0;
        this.totalGoldCollected = 0;
        this.totalGemsCollected = 0;
        
        // ======================================================
        // GİRİŞ DURUMU
        // ======================================================
        this.keys = {};
        this.input = {
            left: false,
            right: false,
            jump: false,
            interact: false,
            up: false,
            down: false
        };
        
        // ======================================================
        // OYUN NESNELERİ
        // ======================================================
        this.player = null;
        this.platforms = [];
        this.goldItems = [];
        this.gemItems = [];
        this.enemies = [];
        this.particles = [];
        this.exit = null;
        this.traps = [];
        this.powerups = [];
        this.floatingTexts = [];
        this.projectiles = [];
        
        // ======================================================
        // KAMERA
        // ======================================================
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            targetX: 0,
            targetY: 0,
            shake: 0,
            shakeX: 0,
            shakeY: 0
        };
        
        // ======================================================
        // SES SİSTEMİ
        // ======================================================
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.audioContext = null;
        this.soundPool = {};
        
        // ======================================================
        // ZAMAN
        // ======================================================
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // ======================================================
        // FİZİK AYARLARI
        // ======================================================
        this.gravity = 0.6;
        this.friction = 0.82;
        this.maxFallSpeed = 15;
        this.jumpBufferTime = 0.1;
        this.jumpBufferTimer = 0;
        this.coyoteTime = 0.08;
        this.coyoteTimer = 0;
        
        // ======================================================
        // KARAKTER ÖZELLİKLERİ
        // ======================================================
        this.characters = {
            warrior: {
                speed: 4.5,
                jumpPower: 11,
                color: '#ff6b6b',
                emoji: '⚔️',
                name: 'Savaşçı',
                health: 120,
                damage: 1.2,
                description: 'Güçlü ve dayanıklı'
            },
            mage: {
                speed: 5,
                jumpPower: 13,
                color: '#6b5bff',
                emoji: '🧙',
                name: 'Büyücü',
                health: 80,
                damage: 1.5,
                description: 'Zeki ve hızlı'
            },
            rogue: {
                speed: 6,
                jumpPower: 10,
                color: '#5bff6b',
                emoji: '🗡️',
                name: 'Haydut',
                health: 90,
                damage: 1.3,
                description: 'Hızlı ve çevik'
            },
            archer: {
                speed: 4.5,
                jumpPower: 12,
                color: '#5bb5ff',
                emoji: '🏹',
                name: 'Okçu',
                health: 100,
                damage: 1.4,
                description: 'Hassas ve isabetli'
            }
        };
        
        // ======================================================
        // ARKA PLAN TEMALARI
        // ======================================================
        this.backgrounds = {
            default: ['#0a0a2e', '#1a1a4e', '#2a1a3e'],
            forest: ['#0a1a0a', '#1a3a1a', '#2a5a2a'],
            desert: ['#3a2a1a', '#5a3a2a', '#7a4a2a'],
            snow: ['#aaccee', '#bbddff', '#ddeeff'],
            volcano: ['#1a0a0a', '#3a1a0a', '#5a2a0a'],
            space: ['#0a0a1a', '#1a0a2a', '#2a0a3a']
        };
        
        // ======================================================
        // BÖLÜM VERİLERİ
        // ======================================================
        this.levels = [];
        this.levelScores = {};
        
        // ======================================================
        // BAŞLANGIÇ
        // ======================================================
        this.init();
    }
    
    // ============================================================
    // BAŞLANGIÇ METODU
    // ============================================================
    init() {
        console.log('⚔️ MYMAR Oyunu başlatılıyor...');
        
        // Bölümleri oluştur
        this.levels = this.generateLevels();
        console.log(`📊 ${this.levels.length} bölüm oluşturuldu`);
        
        // Canvas boyutlandırma
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Klavye olayları
        this.setupKeyboard();
        
        // Mobil kontroller
        this.setupMobileControls();
        
        // UI olayları
        this.setupUI();
        
        // Ses sistemi
        this.initAudio();
        
        // Karakter seçimi
        this.setupCharacterSelect();
        
        // Arka plan seçimi
        this.setupBackgroundSelect();
        
        // Oyun döngüsü
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        console.log('✅ MYMAR Oyunu başlatıldı!');
        console.log(`🎮 Seçili Karakter: ${this.characters[this.selectedCharacter].name}`);
        console.log(`📖 Nasıl oynanır menüsünden kontrolleri öğrenebilirsiniz.`);
    }
    
    // ============================================================
    // CANVAS BOYUTLANDIRMA
    // ============================================================
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
    }
    
    // ============================================================
    // KARAKTER SEÇİMİ
    // ============================================================
    setupCharacterSelect() {
        const charBtns = document.querySelectorAll('.select-char-btn');
        const cards = document.querySelectorAll('.character-card');
        
        charBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const char = btn.dataset.char;
                this.selectedCharacter = char;
                
                cards.forEach(c => c.classList.remove('selected'));
                const parent = btn.closest('.character-card');
                if (parent) parent.classList.add('selected');
                
                this.charColor = this.characters[char].color;
                document.getElementById('charColorPicker').value = this.charColor;
                
                if (this.player) {
                    this.player.color = this.charColor;
                    this.player.speed = this.characters[char].speed * (this.speedMultiplier / 3);
                    this.player.jumpPower = this.characters[char].jumpPower;
                    this.player.maxHealth = this.characters[char].health;
                    this.player.health = this.characters[char].health;
                    this.health = this.characters[char].health;
                    this.maxHealth = this.characters[char].health;
                }
                
                console.log(`👤 Karakter seçildi: ${this.characters[char].name}`);
            });
        });
        
        const defaultCard = document.querySelector(`.character-card[data-character="${this.selectedCharacter}"]`);
        if (defaultCard) defaultCard.classList.add('selected');
        
        document.getElementById('charSelectBackBtn').addEventListener('click', () => {
            document.getElementById('characterSelectMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('characterSelectBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('characterSelectMenu').classList.add('active');
        });
    }
    
    // ============================================================
    // ARKA PLAN SEÇİMİ
    // ============================================================
    setupBackgroundSelect() {
        const bgSelect = document.getElementById('bgSelect');
        bgSelect.addEventListener('change', (e) => {
            this.currentBg = e.target.value;
            
            this.canvas.className = '';
            if (this.currentBg !== 'default') {
                this.canvas.classList.add(`bg-${this.currentBg}`);
            }
            
            console.log(`🎨 Arka plan değiştirildi: ${this.currentBg}`);
        });
    }
    
    // ============================================================
    // MOBİL KONTROLLER - GÖRÜNMEZ ALANLAR
    // ============================================================
    setupMobileControls() {
        const leftZone = document.getElementById('mobileLeft');
        const jumpZone = document.getElementById('mobileJump');
        const rightZone = document.getElementById('mobileRight');
        
        // === SOL BÖLGE ===
        leftZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.left = true;
        });
        leftZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.left = false;
        });
        leftZone.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.input.left = false;
        });
        leftZone.addEventListener('mousedown', () => {
            this.input.left = true;
        });
        leftZone.addEventListener('mouseup', () => {
            this.input.left = false;
        });
        leftZone.addEventListener('mouseleave', () => {
            this.input.left = false;
        });
        
        // === ZIPLAMA BÖLGESİ (ORTA) ===
        jumpZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.jump = true;
            this.jumpBufferTimer = this.jumpBufferTime;
        });
        jumpZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.jump = false;
        });
        jumpZone.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.input.jump = false;
        });
        jumpZone.addEventListener('mousedown', () => {
            this.input.jump = true;
            this.jumpBufferTimer = this.jumpBufferTime;
        });
        jumpZone.addEventListener('mouseup', () => {
            this.input.jump = false;
        });
        jumpZone.addEventListener('mouseleave', () => {
            this.input.jump = false;
        });
        
        // === SAĞ BÖLGE ===
        rightZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.right = true;
        });
        rightZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.right = false;
        });
        rightZone.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.input.right = false;
        });
        rightZone.addEventListener('mousedown', () => {
            this.input.right = true;
        });
        rightZone.addEventListener('mouseup', () => {
            this.input.right = false;
        });
        rightZone.addEventListener('mouseleave', () => {
            this.input.right = false;
        });
        
        console.log('📱 Mobil kontroller hazır (görünmez alanlar)');
    }
    
    // ============================================================
    // SES SİSTEMİ
    // ============================================================
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Ses sistemi başlatıldı');
        } catch (e) {
            console.warn('🔇 Ses desteği yok');
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            switch(type) {
                case 'jump':
                    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.08);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                    break;
                    
                case 'collect':
                    osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.12);
                    break;
                    
                case 'gem':
                    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.16);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.16);
                    break;
                    
                case 'damage':
                    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                    osc.type = 'sawtooth';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                    
                case 'complete':
                    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    osc.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
                    osc.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
                    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.35);
                    break;
                    
                case 'gameover':
                    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                    osc.type = 'sawtooth';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.5);
                    break;
                    
                case 'trap':
                    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                    osc.type = 'square';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;
                    
                case 'powerup':
                    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                    
                default:
                    osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
            }
        } catch (e) {
            // Ses hatasını yok say
        }
    }
    
    // ============================================================
    // BÖLÜM ÜRETİCİ - 10 BÖLÜM
    // ============================================================
    generateLevels() {
        const levels = [];
        
        for (let i = 0; i < this.maxLevel; i++) {
            const difficulty = Math.min(i + 1, 5);
            const platformCount = 5 + Math.floor(i * 0.8);
            const goldCount = 3 + Math.floor(i * 0.7);
            const gemCount = Math.floor(i / 2) + 1;
            const enemyCount = Math.min(2 + Math.floor(i / 2), 7);
            const trapCount = Math.floor(i / 3);
            const powerupCount = Math.floor(i / 4);
            
            const platforms = [];
            const golds = [];
            const gems = [];
            const enemies = [];
            const traps = [];
            const powerups = [];
            
            let xPos = 0;
            let yPos = 450 - Math.random() * 50;
            
            // Platform oluştur
            for (let p = 0; p < platformCount; p++) {
                const width = 80 + Math.random() * 140;
                const height = 20 + Math.random() * 12;
                const x = xPos + (80 + Math.random() * 120);
                const y = Math.max(180, Math.min(550, yPos + (Math.random() - 0.5) * 140));
                
                platforms.push({ x, y, width, height, id: p });
                
                xPos = x + width;
                yPos = y;
            }
            
            // Çıkış platformu
            const lastX = xPos + 120;
            platforms.push({ x: lastX, y: 550, width: 160, height: 30, id: platforms.length });
            
            // Altınlar
            for (let g = 0; g < goldCount; g++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 1));
                const plat = platforms[platIndex];
                if (plat) {
                    golds.push({
                        x: plat.x + 15 + Math.random() * (plat.width - 30),
                        y: plat.y - 28 - Math.random() * 10,
                        width: 18,
                        height: 18,
                        collected: false,
                        bobPhase: Math.random() * Math.PI * 2,
                        bobSpeed: 0.04 + Math.random() * 0.03,
                        glow: 0
                    });
                }
            }
            
            // Mücevherler (bonus)
            for (let g = 0; g < gemCount; g++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 2)) + 1;
                const plat = platforms[platIndex];
                if (plat) {
                    gems.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 20),
                        y: plat.y - 40 - Math.random() * 15,
                        width: 14,
                        height: 14,
                        collected: false,
                        bobPhase: Math.random() * Math.PI * 2,
                        bobSpeed: 0.05 + Math.random() * 0.03,
                        glow: 0
                    });
                }
            }
            
            // Düşmanlar
            for (let e = 0; e < enemyCount; e++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 2));
                const plat = platforms[platIndex];
                if (plat) {
                    const enemyType = Math.floor(Math.random() * 3);
                    const enemyColors = ['#ff6b6b', '#ff6b3a', '#ff3a6b'];
                    enemies.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 38),
                        y: plat.y - 28,
                        width: 28,
                        height: 28,
                        range: 60 + Math.random() * 100,
                        speed: 0.8 + difficulty * 0.25 + Math.random() * 0.3,
                        startX: plat.x + 10 + Math.random() * (plat.width - 38),
                        direction: Math.random() > 0.5 ? 1 : -1,
                        alive: true,
                        type: enemyType,
                        color: enemyColors[enemyType],
                        health: 1 + Math.floor(difficulty / 3),
                        maxHealth: 1 + Math.floor(difficulty / 3),
                        hitTimer: 0,
                        patrolTimer: 0,
                        waitTime: 1 + Math.random() * 2,
                        isWaiting: false
                    });
                }
            }
            
            // Tuzaklar
            for (let t = 0; t < trapCount; t++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 1));
                const plat = platforms[platIndex];
                if (plat) {
                    traps.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 30),
                        y: plat.y - 12,
                        width: 22,
                        height: 12,
                        active: true,
                        timer: 0,
                        phase: Math.random() * Math.PI * 2,
                        type: Math.floor(Math.random() * 2) // 0: ateş, 1: buz
                    });
                }
            }
            
            // Power-uplar
            for (let p = 0; p < powerupCount; p++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 2)) + 1;
                const plat = platforms[platIndex];
                if (plat) {
                    const types = ['health', 'speed', 'shield'];
                    powerups.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 20),
                        y: plat.y - 35 - Math.random() * 10,
                        width: 20,
                        height: 20,
                        type: types[Math.floor(Math.random() * types.length)],
                        collected: false,
                        bobPhase: Math.random() * Math.PI * 2,
                        glow: 0
                    });
                }
            }
            
            // Çıkış
            const exitPlat = platforms[platforms.length - 1];
            
            levels.push({
                levelNumber: i + 1,
                difficulty: difficulty,
                platforms: platforms,
                gold: golds,
                gems: gems,
                enemies: enemies,
                traps: traps,
                powerups: powerups,
                exit: {
                    x: exitPlat.x + exitPlat.width / 2 - 20,
                    y: exitPlat.y - 50,
                    width: 40,
                    height: 50
                },
                totalGold: goldCount,
                totalGems: gemCount,
                width: xPos + 200,
                height: 600,
                background: this.backgrounds.default
            });
        }
        
        return levels;
    }
    
    // ============================================================
    // BÖLÜM YÜKLEME
    // ============================================================
    loadLevel(levelIndex) {
        if (levelIndex > this.maxLevel || levelIndex > this.levels.length) {
            this.showLevelComplete();
            return;
        }
        
        const level = this.levels[levelIndex - 1];
        if (!level) {
            this.showLevelComplete();
            return;
        }
        
        console.log(`📊 Bölüm ${levelIndex} yükleniyor... (Zorluk: ${level.difficulty})`);
        
        this.currentLevel = levelIndex;
        this.goldCollected = 0;
        this.gemsCollected = 0;
        this.totalGold = level.totalGold;
        this.time = 0;
        this.comboCount = 0;
        this.floatingTexts = [];
        this.projectiles = [];
        
        const char = this.characters[this.selectedCharacter];
        const speedMult = this.speedMultiplier / 3;
        
        // İlk platformu bul
        const firstPlat = level.platforms[0];
        
        // Oyuncuyu oluştur
        this.player = {
            x: firstPlat ? firstPlat.x + 20 : 50,
            y: firstPlat ? firstPlat.y - 45 : 500,
            width: 30,
            height: 42,
            vx: 0,
            vy: 0,
            onGround: false,
            facing: 1,
            jumping: false,
            speed: char.speed * speedMult,
            jumpPower: char.jumpPower,
            color: this.charColor,
            character: this.selectedCharacter,
            animTimer: 0,
            health: char.health || 100,
            maxHealth: char.health || 100,
            damage: char.damage || 1,
            invincible: false,
            invincibleTimer: 0,
            dashCooldown: 0,
            canDash: true,
            isDashing: false,
            dashTimer: 0,
            groundedTimer: 0,
            doubleJump: false,
            canDoubleJump: true,
            shield: false,
            shieldTimer: 0,
            speedBoost: false,
            speedBoostTimer: 0
        };
        
        // Varsayılan can
        this.health = this.player.health;
        this.maxHealth = this.player.maxHealth;
        
        // Platformları kopyala
        this.platforms = level.platforms.map(p => ({...p}));
        
        // Altınları kopyala
        this.goldItems = level.gold.map(g => ({
            ...g,
            collected: false
        }));
        
        // Mücevherleri kopyala
        this.gemItems = (level.gems || []).map(g => ({
            ...g,
            collected: false
        }));
        
        // Düşmanları kopyala
        this.enemies = level.enemies.map(e => ({
            ...e,
            alive: true,
            health: e.maxHealth || 1
        }));
        
        // Tuzakları kopyala
        this.traps = (level.traps || []).map(t => ({
            ...t,
            active: true
        }));
        
        // Power-upları kopyala
        this.powerups = (level.powerups || []).map(p => ({
            ...p,
            collected: false
        }));
        
        // Çıkışı kopyala
        this.exit = {...level.exit};
        
        // Kamerayı sıfırla
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.shake = 0;
        
        // Partikülleri temizle
        this.particles = [];
        
        // HUD'u güncelle
        this.updateHUD();
        
        // Oyun durumunu güncelle
        this.state = 'playing';
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('settingsMenu').classList.remove('active');
        document.getElementById('howToPlayMenu').classList.remove('active');
        document.getElementById('characterSelectMenu').classList.remove('active');
        document.getElementById('leaderboardMenu').classList.remove('active');
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('levelComplete').classList.remove('active');
        document.getElementById('gameOver').classList.remove('active');
        
        this.playSound('collect');
        console.log(`✅ Bölüm ${levelIndex} yüklendi! Altın: ${this.totalGold}`);
    }
    
    // ============================================================
    // OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;
        
        // FPS hesapla
        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        
        // Oyunu güncelle
        if (this.state === 'playing') {
            this.update();
        }
        
        // Render et
        this.render();
        
        // Döngüyü devam ettir
        requestAnimationFrame(this.gameLoop);
    }
    
    // ============================================================
    // OYUN GÜNCELLEME
    // ============================================================
    update() {
        // Zamanı güncelle
        this.time += this.deltaTime * 0.06;
        
        // Buff sürelerini güncelle
        if (this.player) {
            if (this.player.invincibleTimer > 0) {
                this.player.invincibleTimer -= this.deltaTime * 0.06;
            } else {
                this.player.invincible = false;
            }
            
            if (this.player.shieldTimer > 0) {
                this.player.shieldTimer -= this.deltaTime * 0.06;
            } else {
                this.player.shield = false;
            }
            
            if (this.player.speedBoostTimer > 0) {
                this.player.speedBoostTimer -= this.deltaTime * 0.06;
            } else {
                this.player.speedBoost = false;
            }
            
            if (this.player.dashCooldown > 0) {
                this.player.dashCooldown -= this.deltaTime * 0.06;
            } else {
                this.player.canDash = true;
            }
            
            if (this.player.isDashing) {
                this.player.dashTimer -= this.deltaTime * 0.06;
                if (this.player.dashTimer <= 0) {
                    this.player.isDashing = false;
                }
            }
        }
        
        // Oyun nesnelerini güncelle
        this.updatePlayer();
        this.updateGold();
        this.updateGems();
        this.updateEnemies();
        this.updateTraps();
        this.updatePowerups();
        this.updateParticles();
        this.updateFloatingTexts();
        this.checkExit();
        this.updateCamera();
        this.updateHUD();
    }
    
    // ============================================================
    // OYUNCU FİZİK
    // ============================================================
    updatePlayer() {
        const p = this.player;
        if (!p) return;
        
        // Zıplama buffer
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= this.deltaTime * 0.06;
        }
        
        // Coyote time
        if (p.onGround) {
            this.coyoteTimer = this.coyoteTime;
            p.groundedTimer = 0;
        } else {
            this.coyoteTimer -= this.deltaTime * 0.06;
            p.groundedTimer += this.deltaTime * 0.06;
        }
        
        // Hız hesapla
        let speed = p.speed;
        if (p.speedBoost) speed *= 1.5;
        if (this.difficulty === 'hard') speed *= 1.15;
        if (this.difficulty === 'nightmare') speed *= 1.3;
        
        // Animasyon
        p.animTimer += this.deltaTime * 0.1;
        
        // Yatay hareket
        if (this.input.left && !this.input.right) {
            p.vx = -speed;
            p.facing = -1;
        } else if (this.input.right && !this.input.left) {
            p.vx = speed;
            p.facing = 1;
        } else {
            p.vx *= this.friction;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }
        
        // Dash
        if (this.input.interact && p.canDash && !p.isDashing && !p.onGround) {
            p.canDash = false;
            p.isDashing = true;
            p.dashTimer = 0.15;
            p.dashCooldown = 1.5;
            p.vx = p.facing * speed * 3;
            p.vy = -2;
            this.spawnParticles(p.x + p.width/2, p.y + p.height/2, p.color, 15);
            this.playSound('jump');
        }
        
        // Dash hareketi
        if (p.isDashing) {
            p.vx = p.facing * speed * 3;
            p.vy *= 0.9;
        }
        
        // Zıplama
        const jumpPressed = this.input.jump || this.jumpBufferTimer > 0;
        
        if (jumpPressed) {
            // Normal zıplama
            if (p.onGround || this.coyoteTimer > 0) {
                p.vy = -p.jumpPower;
                p.onGround = false;
                p.jumping = true;
                this.coyoteTimer = 0;
                this.jumpBufferTimer = 0;
                this.playSound('jump');
                this.spawnParticles(p.x + p.width/2, p.y + p.height, p.color, 10);
            }
            // Çift zıplama
            else if (p.canDoubleJump && !p.onGround && p.groundedTimer > 0.15) {
                p.vy = -p.jumpPower * 0.85;
                p.canDoubleJump = false;
                p.jumping = true;
                this.playSound('jump');
                this.spawnParticles(p.x + p.width/2, p.y + p.height/2, '#ffd93d', 15);
            }
        }
        
        // Yerçekimi
        p.vy += this.gravity;
        if (p.vy > this.maxFallSpeed) p.vy = this.maxFallSpeed;
        
        // Yatay çarpışma
        p.x += p.vx * this.deltaTime;
        this.handleCollision(p, 'horizontal');
        
        // Dikey çarpışma
        p.y += p.vy * this.deltaTime;
        this.handleCollision(p, 'vertical');
        
        // Düşme kontrolü
        if (p.y > 800) {
            this.takeDamage(50);
            const firstPlat = this.platforms[0];
            if (firstPlat) {
                p.x = firstPlat.x + 20;
                p.y = firstPlat.y - 45;
                p.vy = 0;
            }
        }
        
        // Zıplama flag'leri
        if (p.onGround) {
            p.jumping = false;
            p.canDoubleJump = true;
        }
        
        // Ekran sınırları
        const level = this.levels[this.currentLevel - 1];
        const levelWidth = level ? level.width : 2500;
        p.x = Math.max(0, Math.min(p.x, levelWidth - p.width));
    }
    
    // ============================================================
    // ÇARPISMA KONTROLÜ
    // ============================================================
    handleCollision(player, axis) {
        const margin = 3;
        
        for (const plat of this.platforms) {
            if (player.x + player.width > plat.x + margin &&
                player.x < plat.x + plat.width - margin &&
                player.y + player.height > plat.y + margin &&
                player.y < plat.y + plat.height - margin) {
                
                if (axis === 'horizontal') {
                    if (player.vx > 0) {
                        player.x = plat.x - player.width;
                    } else if (player.vx < 0) {
                        player.x = plat.x + plat.width;
                    }
                    player.vx = 0;
                } else {
                    if (player.vy > 0) {
                        player.y = plat.y - player.height;
                        player.vy = 0;
                        player.onGround = true;
                        this.coyoteTimer = this.coyoteTime;
                    } else if (player.vy < 0) {
                        player.y = plat.y + plat.height;
                        player.vy = 0;
                    }
                }
            }
        }
    }
    
    // ============================================================
    // ALTIN TOPLAMA
    // ============================================================
    updateGold() {
        const p = this.player;
        if (!p) return;
        
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            
            gold.bobPhase += gold.bobSpeed || 0.05;
            gold.glow = 0.5 + Math.sin(gold.bobPhase) * 0.3;
            const bobY = Math.sin(gold.bobPhase) * 3;
            
            if (p.x + p.width > gold.x + 4 &&
                p.x < gold.x + gold.width - 4 &&
                p.y + p.height > gold.y + bobY + 4 &&
                p.y < gold.y + bobY + gold.height - 4) {
                
                gold.collected = true;
                this.goldCollected++;
                this.totalGoldCollected++;
                
                const points = 10 + (this.difficulty === 'hard' ? 5 : this.difficulty === 'nightmare' ? 8 : 0);
                this.score += points;
                this.comboCount++;
                
                if (this.comboCount > this.maxCombo) {
                    this.maxCombo = this.comboCount;
                }
                
                this.playSound('collect');
                this.spawnParticles(gold.x + gold.width/2, gold.y + gold.height/2, '#ffd93d', 15);
                this.addFloatingText(gold.x, gold.y - 20, `+${points} ⭐`, '#ffd93d');
            }
        }
    }
    
    // ============================================================
    // MÜCEVHER TOPLAMA
    // ============================================================
    updateGems() {
        const p = this.player;
        if (!p) return;
        
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            
            gem.bobPhase += gem.bobSpeed || 0.07;
            gem.glow = 0.5 + Math.sin(gem.bobPhase) * 0.3;
            const bobY = Math.sin(gem.bobPhase) * 4;
            
            if (p.x + p.width > gem.x + 3 &&
                p.x < gem.x + gem.width - 3 &&
                p.y + p.height > gem.y + bobY + 3 &&
                p.y < gem.y + bobY + gem.height - 3) {
                
                gem.collected = true;
                this.gemsCollected++;
                this.totalGemsCollected++;
                
                const points = 25 + (this.difficulty === 'hard' ? 10 : this.difficulty === 'nightmare' ? 15 : 0);
                this.score += points;
                
                this.playSound('gem');
                this.spawnParticles(gem.x + gem.width/2, gem.y + gem.height/2, '#4d96ff', 25);
                this.addFloatingText(gem.x, gem.y - 25, `+${points} 💎`, '#4d96ff');
            }
        }
    }
    
    // ============================================================
    // DÜŞMANLAR
    // ============================================================
    updateEnemies() {
        const p = this.player;
        if (!p) return;
        
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            // Düşman hareketi
            enemy.patrolTimer += this.deltaTime * 0.06;
            
            if (enemy.isWaiting) {
                if (enemy.patrolTimer >= enemy.waitTime) {
                    enemy.isWaiting = false;
                    enemy.patrolTimer = 0;
                    enemy.direction = Math.random() > 0.5 ? 1 : -1;
                }
            } else {
                enemy.x += enemy.direction * enemy.speed * this.deltaTime;
                
                if (enemy.x > enemy.startX + enemy.range) {
                    enemy.direction = -1;
                    enemy.isWaiting = true;
                    enemy.patrolTimer = 0;
                } else if (enemy.x < enemy.startX - enemy.range) {
                    enemy.direction = 1;
                    enemy.isWaiting = true;
                    enemy.patrolTimer = 0;
                }
            }
            
            // Düşman çarpışması
            if (p.x + p.width > enemy.x + 3 &&
                p.x < enemy.x + enemy.width - 3 &&
                p.y + p.height > enemy.y + 3 &&
                p.y < enemy.y + enemy.height - 3) {
                
                // Üstten vurma
                if (p.vy > 0 && p.y + p.height - enemy.y < 25 && !p.isDashing) {
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        enemy.alive = false;
                        this.totalKills++;
                        this.score += 20 + (this.difficulty === 'hard' ? 10 : this.difficulty === 'nightmare' ? 15 : 0);
                        this.playSound('collect');
                        this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#6bcb77', 30);
                        this.addFloatingText(enemy.x, enemy.y - 20, '+20 ⚔️', '#6bcb77');
                        p.vy = -8;
                    } else {
                        // Düşmana hasar
                        this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff6b6b', 10);
                        p.vy = -6;
                    }
                } else if (!p.invincible && !p.isDashing) {
                    this.takeDamage(15);
                    // Geri tepme
                    p.vx = p.facing * -8;
                    p.vy = -5;
                }
            }
        }
    }
    
    // ============================================================
    // TUZAKLAR
    // ============================================================
    updateTraps() {
        const p = this.player;
        if (!p) return;
        
        for (const trap of this.traps) {
            if (!trap.active) continue;
            
            trap.phase += 0.05 * this.deltaTime;
            const flameHeight = 5 + Math.sin(trap.phase) * 10;
            const isActive = Math.sin(trap.phase) > -0.3;
            
            if (isActive) {
                // Tuzak çarpışması
                if (p.x + p.width > trap.x + 4 &&
                    p.x < trap.x + trap.width - 4 &&
                    p.y + p.height > trap.y - flameHeight + 4 &&
                    p.y < trap.y + trap.height - 4 &&
                    !p.invincible) {
                    
                    this.takeDamage(10);
                    this.playSound('trap');
                    this.spawnParticles(trap.x + trap.width/2, trap.y, '#ff6b00', 20);
                    
                    // Geri tepme
                    p.vx = p.facing * -5;
                    p.vy = -6;
                }
            }
            
            // Tuzak görsel efekti
            trap.glow = isActive ? 1 : 0.3;
        }
    }
    
    // ============================================================
    // POWER-UPLAR
    // ============================================================
    updatePowerups() {
        const p = this.player;
        if (!p) return;
        
        for (const powerup of this.powerups) {
            if (powerup.collected) continue;
            
            powerup.bobPhase += 0.06;
            powerup.glow = 0.5 + Math.sin(powerup.bobPhase) * 0.3;
            const bobY = Math.sin(powerup.bobPhase) * 5;
            
            if (p.x + p.width > powerup.x + 4 &&
                p.x < powerup.x + powerup.width - 4 &&
                p.y + p.height > powerup.y + bobY + 4 &&
                p.y < powerup.y + bobY + powerup.height - 4) {
                
                powerup.collected = true;
                this.playSound('powerup');
                
                switch(powerup.type) {
                    case 'health':
                        const healAmount = 25;
                        p.health = Math.min(p.maxHealth, p.health + healAmount);
                        this.health = p.health;
                        this.addFloatingText(powerup.x, powerup.y - 20, `❤️ +${healAmount} Can`, '#ff6b6b');
                        this.spawnParticles(powerup.x + powerup.width/2, powerup.y + powerup.height/2, '#ff6b6b', 25);
                        break;
                        
                    case 'speed':
                        p.speedBoost = true;
                        p.speedBoostTimer = 5;
                        this.addFloatingText(powerup.x, powerup.y - 20, '⚡ Hız Artışı!', '#5bff6b');
                        this.spawnParticles(powerup.x + powerup.width/2, powerup.y + powerup.height/2, '#5bff6b', 25);
                        break;
                        
                    case 'shield':
                        p.shield = true;
                        p.shieldTimer = 5;
                        this.addFloatingText(powerup.x, powerup.y - 20, '🛡️ Kalkan!', '#4d96ff');
                        this.spawnParticles(powerup.x + powerup.width/2, powerup.y + powerup.height/2, '#4d96ff', 25);
                        break;
                }
            }
        }
    }
    
    // ============================================================
    // PARTİKÜLLER
    // ============================================================
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.012 + Math.random() * 0.025,
                radius: 2 + Math.random() * 5,
                color: color,
                gravity: 0.05 + Math.random() * 0.1,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0.1;
            p.life -= p.decay;
            p.rotation += p.rotSpeed || 0;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // ============================================================
    // YÜZEN YAZILAR
    // ============================================================
    addFloatingText(x, y, text, color) {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            life: 1,
            decay: 0.015,
            vy: -2
        });
    }
    
    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.life -= ft.decay;
            
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }
    
    // ============================================================
    // ÇIKIŞ KONTROLÜ
    // ============================================================
    checkExit() {
        const p = this.player;
        if (!p || !this.exit) return;
        
        const e = this.exit;
        
        if (p.x + p.width > e.x + 4 &&
            p.x < e.x + e.width - 4 &&
            p.y + p.height > e.y + 4 &&
            p.y < e.y + e.height - 4) {
            
            if (this.goldCollected >= this.totalGold) {
                this.showLevelComplete();
            } else {
                const remaining = this.totalGold - this.goldCollected;
                this.spawnParticles(e.x + e.width/2, e.y, '#ff6b6b', 15);
                this.addFloatingText(e.x, e.y - 30, `⚠️ ${remaining} altın kaldı!`, '#ff6b6b');
            }
        }
    }
    
    // ============================================================
    // KAMERA
    // ============================================================
    updateCamera() {
        const p = this.player;
        if (!p) return;
        
        const targetX = p.x - this.canvas.width * 0.35;
        const targetY = p.y - this.canvas.height * 0.4;
        
        this.camera.targetX = Math.max(0, targetX);
        this.camera.targetY = Math.max(0, targetY);
        
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.06;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.06;
        
        // Kamera sarsıntısı
        if (this.camera.shake > 0) {
            this.camera.shakeX = (Math.random() - 0.5) * this.camera.shake * 2;
            this.camera.shakeY = (Math.random() - 0.5) * this.camera.shake * 2;
            this.camera.shake *= 0.9;
            if (this.camera.shake < 0.1) this.camera.shake = 0;
        } else {
            this.camera.shakeX = 0;
            this.camera.shakeY = 0;
        }
    }
    
    shakeCamera(amount) {
        this.camera.shake = Math.max(this.camera.shake, amount);
    }
    
    // ============================================================
    // HASAR SİSTEMİ
    // ============================================================
    takeDamage(amount) {
        const p = this.player;
        if (!p) return;
        
        // Kalkan kontrolü
        if (p.shield) {
            p.shield = false;
            p.shieldTimer = 0;
            this.spawnParticles(p.x + p.width/2, p.y + p.height/2, '#4d96ff', 30);
            this.addFloatingText(p.x, p.y - 30, '🛡️ Kalkan Kırıldı!', '#4d96ff');
            return;
        }
        
        // Hasar alma
        p.health -= amount;
        this.health = p.health;
        p.invincible = true;
        p.invincibleTimer = 0.5;
        
        this.playSound('damage');
        this.shakeCamera(5);
        this.spawnParticles(p.x + p.width/2, p.y + p.height/2, '#ff6b6b', 20);
        this.addFloatingText(p.x, p.y - 30, `-${amount} ❤️`, '#ff6b6b');
        
        if (p.health <= 0) {
            p.health = 0;
            this.health = 0;
            this.showGameOver();
        }
        
        this.updateHUD();
    }
    
    // ============================================================
    // HUD GÜNCELLEME
    // ============================================================
    updateHUD() {
        document.getElementById('healthDisplay').textContent = Math.max(0, Math.round(this.health));
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('gemDisplay').textContent = this.gemsCollected;
        document.getElementById('levelDisplay').textContent = `📊 Bölüm ${this.currentLevel}`;
        document.getElementById('objectiveDisplay').textContent = `🎯 Altın: ${this.goldCollected}/${this.totalGold}`;
        
        const mins = Math.floor(this.time / 60);
        const secs = Math.floor(this.time % 60);
        document.getElementById('timerDisplay').textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    // ============================================================
    // RENDER
    // ============================================================
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Arka plan
        const bgColors = this.backgrounds[this.currentBg] || this.backgrounds.default;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, bgColors[0]);
        gradient.addColorStop(0.5, bgColors[1]);
        gradient.addColorStop(1, bgColors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        // Yıldızlar
        this.renderStars(ctx);
        
        // Kamera
        ctx.save();
        ctx.translate(-this.camera.x + this.camera.shakeX, -this.camera.y + this.camera.shakeY);
        
        // === PLATFORMLAR ===
        for (const plat of this.platforms) {
            const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
            grad.addColorStop(0, '#5a5a9a');
            grad.addColorStop(1, '#3a3a6a');
            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(74, 74, 138, 0.3)';
            ctx.shadowBlur = 12;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.shadowBlur = 0;
            
            // Üst çizgi
            ctx.fillStyle = 'rgba(120, 120, 220, 0.3)';
            ctx.fillRect(plat.x, plat.y, plat.width, 3);
            
            // Desen
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            for (let i = 0; i < plat.width; i += 25) {
                ctx.fillRect(plat.x + i, plat.y + 6, 2, 6);
            }
        }
        
        // === TUZAKLAR ===
        for (const trap of this.traps) {
            if (!trap.active) continue;
            
            const flameHeight = 5 + Math.sin(trap.phase) * 12;
            const isActive = Math.sin(trap.phase) > -0.3;
            
            if (isActive) {
                // Alev
                const grad = ctx.createRadialGradient(
                    trap.x + trap.width/2, trap.y, 2,
                    trap.x + trap.width/2, trap.y - flameHeight/2, flameHeight
                );
                grad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
                grad.addColorStop(0.3, 'rgba(255, 150, 0, 0.7)');
                grad.addColorStop(0.7, 'rgba(255, 80, 0, 0.4)');
                grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(trap.x + trap.width/2, trap.y - flameHeight/2, flameHeight, 0, Math.PI * 2);
                ctx.fill();
                
                // Alev parçacıkları
                for (let i = 0; i < 3; i++) {
                    const offsetX = (Math.random() - 0.5) * trap.width;
                    const offsetY = -Math.random() * flameHeight;
                    const size = 2 + Math.random() * 4;
                    ctx.fillStyle = `rgba(255, 200, 50, ${0.3 + Math.random() * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(trap.x + trap.width/2 + offsetX, trap.y + offsetY, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Tuzak tabanı
            const baseColor = trap.type === 0 ? '#8a4a3a' : '#3a5a8a';
            ctx.fillStyle = baseColor;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 5;
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
            ctx.shadowBlur = 0;
        }
        
        // === ALTINLAR ===
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            const bobY = Math.sin(gold.bobPhase) * 3;
            const glow = 0.5 + Math.sin(gold.bobPhase) * 0.3;
            
            ctx.shadowColor = `rgba(255, 217, 61, ${glow * 0.8})`;
            ctx.shadowBlur = 25;
            
            // Altın ışıltısı
            const grad = ctx.createRadialGradient(
                gold.x + gold.width/2, gold.y + gold.height/2 + bobY, 2,
                gold.x + gold.width/2, gold.y + gold.height/2 + bobY, gold.width
            );
            grad.addColorStop(0, '#ffd93d');
            grad.addColorStop(0.7, '#ffb300');
            grad.addColorStop(1, '#ff8f00');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(gold.x + gold.width/2, gold.y + gold.height/2 + bobY, gold.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Parlak nokta
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(gold.x + gold.width/2 - 4, gold.y + gold.height/2 + bobY - 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // === MÜCEVHERLER ===
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            const bobY = Math.sin(gem.bobPhase) * 4;
            const glow = 0.5 + Math.sin(gem.bobPhase) * 0.3;
            
            ctx.shadowColor = `rgba(77, 150, 255, ${glow * 0.8})`;
            ctx.shadowBlur = 30;
            
            // Elmas şekli
            ctx.fillStyle = '#4d96ff';
            ctx.beginPath();
            ctx.moveTo(gem.x + gem.width/2, gem.y + bobY);
            ctx.lineTo(gem.x + gem.width, gem.y + gem.height/2 + bobY);
            ctx.lineTo(gem.x + gem.width/2, gem.y + gem.height + bobY);
            ctx.lineTo(gem.x, gem.y + gem.height/2 + bobY);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // İç parlaklık
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(gem.x + gem.width/2, gem.y + 4 + bobY);
            ctx.lineTo(gem.x + gem.width/2 + 4, gem.y + gem.height/2 + bobY);
            ctx.lineTo(gem.x + gem.width/2, gem.y + gem.height - 4 + bobY);
            ctx.lineTo(gem.x + gem.width/2 - 4, gem.y + gem.height/2 + bobY);
            ctx.closePath();
            ctx.fill();
        }
        
        // === POWER-UPLAR ===
        for (const powerup of this.powerups) {
            if (powerup.collected) continue;
            const bobY = Math.sin(powerup.bobPhase) * 5;
            
            ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
            ctx.shadowBlur = 15;
            
            // Arka plan halkası
            const colors = {
                health: '#ff6b6b',
                speed: '#5bff6b',
                shield: '#4d96ff'
            };
            const color = colors[powerup.type] || '#ffffff';
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 + Math.sin(powerup.bobPhase) * 0.1;
            ctx.beginPath();
            ctx.arc(powerup.x + powerup.width/2, powerup.y + powerup.height/2 + bobY, powerup.width, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            // İçerik
            const icons = {
                health: '❤️',
                speed: '⚡',
                shield: '🛡️'
            };
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText(icons[powerup.type] || '?', powerup.x + powerup.width/2, powerup.y + powerup.height/2 + bobY);
        }
        
        // === DÜŞMANLAR ===
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            const color = enemy.color || '#ff6b6b';
            const isHit = enemy.hitTimer > 0;
            
            // Düşman gövdesi
            const grad = ctx.createRadialGradient(
                enemy.x + enemy.width/2, enemy.y + enemy.height/2 - 5, 3,
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2
            );
            grad.addColorStop(0, isHit ? '#ffffff' : color);
            grad.addColorStop(0.5, isHit ? '#ff6b6b' : this.darkenColor(color, 0.7));
            grad.addColorStop(1, this.darkenColor(color, 0.4));
            ctx.fillStyle = grad;
            ctx.shadowColor = `rgba(255, 0, 0, 0.3)`;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Gözler
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 - 6 + enemy.direction * 2, enemy.y + enemy.height/2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 6 + enemy.direction * 2, enemy.y + enemy.height/2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 - 4 + enemy.direction * 4, enemy.y + enemy.height/2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 8 + enemy.direction * 4, enemy.y + enemy.height/2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Ağız
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2 + 6, 5, 0, Math.PI);
            ctx.stroke();
            
            // Can çubuğu
            if (enemy.maxHealth > 1) {
                const barWidth = enemy.width + 10;
                const barHeight = 4;
                const barX = enemy.x - 5;
                const barY = enemy.y - 10;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = enemy.health / enemy.maxHealth > 0.5 ? '#6bcb77' : '#ff6b6b';
                ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
            }
        }
        
        // === ÇIKIŞ ===
        if (this.exit) {
            const isComplete = this.goldCollected >= this.totalGold;
            const pulse = 0.8 + Math.sin(this.time * 3) * 0.2;
            
            // Işık hüzmesi
            ctx.save();
            ctx.globalAlpha = 0.15 * pulse;
            const grad2 = ctx.createRadialGradient(
                this.exit.x + this.exit.width/2, this.exit.y + this.exit.height/2, 10,
                this.exit.x + this.exit.width/2, this.exit.y + this.exit.height/2, 80
            );
            grad2.addColorStop(0, isComplete ? 'rgba(100, 255, 100, 0.8)' : 'rgba(100, 200, 255, 0.8)');
            grad2.addColorStop(1, isComplete ? 'rgba(100, 255, 100, 0)' : 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(this.exit.x - 50, this.exit.y - 50, this.exit.width + 100, this.exit.height + 100);
            ctx.restore();
            
            // Kapı
            const doorColor = isComplete ? '#6bcb77' : '#4d96ff';
            ctx.fillStyle = doorColor;
            ctx.shadowColor = isComplete ? 'rgba(107, 203, 119, 0.6)' : 'rgba(77, 150, 255, 0.4)';
            ctx.shadowBlur = isComplete ? 40 : 25;
            ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            ctx.shadowBlur = 0;
            
            // Kemer
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width/2, this.exit.y, this.exit.width/2, Math.PI, 0);
            ctx.fill();
            
            // Kapı kolu
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width - 10, this.exit.y + this.exit.height/2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Tamamlandı yazısı
            if (isComplete) {
                ctx.fillStyle = 'rgba(107, 203, 119, 0.8)';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('✅ TAMAM', this.exit.x + this.exit.width/2, this.exit.y - 10);
            }
            
            // Işık sütunu
            ctx.fillStyle = isComplete ? 'rgba(107, 203, 119, 0.1)' : 'rgba(100, 200, 255, 0.08)';
            ctx.fillRect(this.exit.x + 10, this.exit.y - 40, this.exit.width - 20, 40);
        }
        
        // === OYUNCU ===
        if (this.player) {
            const p = this.player;
            
            // Gölge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(p.x + p.width/2, p.y + p.height + 6, p.width/2 + 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Kalkan efekti
            if (p.shield) {
                ctx.strokeStyle = 'rgba(77, 150, 255, 0.6)';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(77, 150, 255, 0.4)';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            
            // Hız artışı efekti
            if (p.speedBoost) {
                ctx.fillStyle = 'rgba(91, 255, 107, 0.1)';
                ctx.beginPath();
                ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width + 12, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Gövde
            const isInvincible = p.invincible && Math.floor(p.invincibleTimer * 20) % 2 === 0;
            if (!isInvincible) {
                const grad3 = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
                const baseColor = p.color || '#6bcb77';
                grad3.addColorStop(0, baseColor);
                grad3.addColorStop(1, this.darkenColor(baseColor, 0.5));
                ctx.fillStyle = grad3;
                ctx.shadowColor = baseColor + '40';
                ctx.shadowBlur = 15;
                
                // Yuvarlak gövde
                const radius = 8;
                ctx.beginPath();
                ctx.moveTo(p.x + radius, p.y);
                ctx.lineTo(p.x + p.width - radius, p.y);
                ctx.quadraticCurveTo(p.x + p.width, p.y, p.x + p.width, p.y + radius);
                ctx.lineTo(p.x + p.width, p.y + p.height - radius);
                ctx.quadraticCurveTo(p.x + p.width, p.y + p.height, p.x + p.width - radius, p.y + p.height);
                ctx.lineTo(p.x + radius, p.y + p.height);
                ctx.quadraticCurveTo(p.x, p.y + p.height, p.x, p.y + p.height - radius);
                ctx.lineTo(p.x, p.y + radius);
                ctx.quadraticCurveTo(p.x, p.y, p.x + radius, p.y);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            // Karakter emojisi
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const charEmoji = this.characters[p.character]?.emoji || '⚔️';
            ctx.fillText(charEmoji, p.x + p.width/2, p.y + p.height/2 - 2);
            
            // Gözler (sadece görünürken)
            if (!isInvincible) {
                ctx.fillStyle = '#ffffff';
                const eyeX = p.facing === 1 ? 8 : 2;
                ctx.beginPath();
                ctx.arc(p.x + 7 + eyeX, p.y + 12, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x + 23 + eyeX, p.y + 12, 5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#1a1a2e';
                const pupilX = p.facing === 1 ? 3 : -3;
                ctx.beginPath();
                ctx.arc(p.x + 9 + eyeX + pupilX, p.y + 14, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x + 25 + eyeX + pupilX, p.y + 14, 2.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Ağız
                ctx.strokeStyle = '#1a1a2e';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                if (p.jumping || !p.onGround) {
                    ctx.arc(p.x + 15, p.y + 20, 6, 0, Math.PI);
                } else {
                    ctx.arc(p.x + 15, p.y + 24, 6, 0, Math.PI);
                }
                ctx.stroke();
            }
        }
        
        // === PARTİKÜLLER ===
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation || 0);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // === YÜZEN YAZILAR ===
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.life;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
        
        ctx.restore();
        
        // === ALT BİLGİ ===
        if (this.state === 'playing') {
            const remaining = this.totalGold - this.goldCollected;
            if (remaining > 0) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.font = '13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`⭐ Kalan Altın: ${remaining}`, this.canvas.width / 2, this.canvas.height - 15);
            }
            
            // Combo gösterimi
            if (this.comboCount > 1) {
                ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(this.time * 5) * 0.2})`;
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`🔥 ${this.comboCount}x Combo!`, this.canvas.width - 20, this.canvas.height - 15);
            }
        }
        
        // FPS (debug)
        // ctx.fillStyle = 'rgba(255,255,255,0.3)';
        // ctx.font = '12px monospace';
        // ctx.textAlign = 'left';
        // ctx.textBaseline = 'top';
        // ctx.fillText(`FPS: ${this.fps}`, 10, 10);
    }
    
    // ============================================================
    // YARDIMCI METODLAR
    // ============================================================
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    renderStars(ctx) {
        const starCount = 80;
        const time = this.time || 0;
        
        for (let i = 0; i < starCount; i++) {
            const seed = i * 137.508;
            const x = ((seed) % this.canvas.width);
            const y = ((seed * 269.361) % (this.canvas.height * 0.7));
            const size = ((i * 73) % 3) + 1;
            const twinkle = 0.5 + Math.sin(time * 0.5 + i * 0.7) * 0.5;
            const alpha = 0.15 + ((i * 43) % 7) / 10 * twinkle;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // ============================================================
    // UI OLAYLARI
    // ============================================================
    setupUI() {
        // Ana Menü
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.resetGame();
            this.loadLevel(this.currentLevel);
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('settingsMenu').classList.add('active');
        });
        
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('howToPlayMenu').classList.add('active');
        });
        
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('leaderboardMenu').classList.add('active');
        });
        
        // Ayarlar
        document.getElementById('settingsBackBtn').addEventListener('click', () => {
            document.getElementById('settingsMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        
        document.getElementById('musicToggle').addEventListener('change', (e) => {
            this.musicEnabled = e.target.checked;
        });
        
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            console.log(`📊 Zorluk değiştirildi: ${this.difficulty}`);
        });
        
        document.getElementById('charColorPicker').addEventListener('input', (e) => {
            this.charColor = e.target.value;
            if (this.player) {
                this.player.color = this.charColor;
            }
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speedMultiplier = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speedMultiplier;
            if (this.player) {
                const char = this.characters[this.selectedCharacter];
                this.player.speed = char.speed * (this.speedMultiplier / 3);
            }
        });
        
        // Nasıl Oynanır
        document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
            document.getElementById('howToPlayMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Skor Tablosu
        document.getElementById('leaderboardBackBtn').addEventListener('click', () => {
            document.getElementById('leaderboardMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Duraklatma
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('pauseRestartBtn').addEventListener('click', () => {
            document.getElementById('pauseMenu').classList.remove('active');
            this.loadLevel(this.currentLevel);
        });
        
        document.getElementById('pauseMainMenuBtn').addEventListener('click', () => {
            document.getElementById('pauseMenu').classList.remove('active');
            this.state = 'menu';
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Bölüm Tamamlama
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            document.getElementById('levelComplete').classList.remove('active');
            this.currentLevel++;
            if (this.currentLevel > this.maxLevel) {
                this.currentLevel = 1;
            }
            this.loadLevel(this.currentLevel);
        });
        
        document.getElementById('levelCompleteMenuBtn').addEventListener('click', () => {
            document.getElementById('levelComplete').classList.remove('active');
            this.state = 'menu';
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Oyun Bitti
        document.getElementById('gameOverRestartBtn').addEventListener('click', () => {
            document.getElementById('gameOver').classList.remove('active');
            this.loadLevel(this.currentLevel);
        });
        
        document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
            document.getElementById('gameOver').classList.remove('active');
            this.state = 'menu';
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
    }
    
    // ============================================================
    // KLAVYE KONTROLLERİ
    // ============================================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    this.input.jump = true;
                    this.jumpBufferTimer = this.jumpBufferTime;
                    e.preventDefault();
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.input.left = true;
                    e.preventDefault();
                    break;
                case 'd':
                case 'ArrowRight':
                    this.input.right = true;
                    e.preventDefault();
                    break;
                case ' ':
                    this.input.interact = true;
                    e.preventDefault();
                    break;
                case 's':
                case 'ArrowDown':
                    this.input.down = true;
                    e.preventDefault();
                    break;
                case 'Escape':
                    if (this.state === 'playing') {
                        this.togglePause();
                    } else if (this.state === 'paused') {
                        this.togglePause();
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    this.input.jump = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.input.left = false;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.input.right = false;
                    break;
                case ' ':
                    this.input.interact = false;
                    break;
                case 's':
                case 'ArrowDown':
                    this.input.down = false;
                    break;
            }
        });
    }
    
    // ============================================================
    // OYUN DURUMU DEĞİŞTİRİCİLER
    // ============================================================
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseMenu').classList.add('active');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseMenu').classList.remove('active');
        }
    }
    
    showLevelComplete() {
        this.state = 'levelComplete';
        this.playSound('complete');
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalGold').textContent = this.goldCollected;
        document.getElementById('finalGems').textContent = this.gemsCollected;
        document.getElementById('finalTime').textContent = Math.round(this.time);
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('levelComplete').classList.add('active');
        
        // Büyük zafer patlaması
        for (let i = 0; i < 80; i++) {
            const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9f43'];
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 100;
            const x = this.exit.x + this.exit.width/2 + Math.cos(angle) * dist;
            const y = this.exit.y + this.exit.height/2 + Math.sin(angle) * dist;
            this.spawnParticles(
                x,
                y,
                colors[Math.floor(Math.random() * colors.length)],
                3
            );
        }
    }
    
    showGameOver() {
        this.state = 'gameOver';
        this.playSound('gameover');
        document.getElementById('gameOverScore').textContent = this.score;
        document.getElementById('gameOverGold').textContent = this.goldCollected;
        document.getElementById('gameOverLevel').textContent = this.currentLevel;
        document.getElementById('gameOver').classList.add('active');
    }
    
    resetGame() {
        this.score = 0;
        this.health = this.maxHealth;
        this.currentLevel = 1;
        this.goldCollected = 0;
        this.gemsCollected = 0;
        this.time = 0;
        this.particles = [];
        this.comboCount = 0;
        this.maxCombo = 0;
        this.totalKills = 0;
        this.totalGoldCollected = 0;
        this.totalGemsCollected = 0;
        this.floatingTexts = [];
    }
}

// ============================================================
// OYUNU BAŞLAT
// ============================================================
const game = new Game();

// Hata yakalama
window.addEventListener('error', (e) => {
    console.error('❌ Oyun hatası:', e.message);
});

console.log('🎮 MYMAR oyunu başarıyla yüklendi!');
console.log('📖 Nasıl oynanır menüsünden kontrolleri öğrenebilirsiniz.');
console.log('🔥 İyi eğlenceler!');

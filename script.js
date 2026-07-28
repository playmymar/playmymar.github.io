/**
 * MYMAR - Profesyonel Web Oyunu
 * @version 2.0
 * @author AI Assistant
 */

// ============================================================
// OYUN ANA SINIFI
// ============================================================
class Game {
    constructor() {
        // Canvas ve context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Oyun durumu
        this.state = 'menu';
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
        
        // Giriş durumu
        this.keys = {};
        this.input = {
            left: false,
            right: false,
            jump: false,
            interact: false
        };
        
        // Oyun nesneleri
        this.player = null;
        this.platforms = [];
        this.goldItems = [];
        this.gemItems = [];
        this.enemies = [];
        this.particles = [];
        this.exit = null;
        this.traps = [];
        
        // Kamera
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        // Ses sistemi
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.audioContext = null;
        
        // Zaman
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Hareket ayarları
        this.gravity = 0.6;
        this.friction = 0.8;
        
        // Karakter özellikleri
        this.characters = {
            warrior: { speed: 4.5, jumpPower: 11, color: '#ff6b6b', emoji: '⚔️', name: 'Savaşçı' },
            mage: { speed: 5, jumpPower: 13, color: '#6b5bff', emoji: '🧙', name: 'Büyücü' },
            rogue: { speed: 6, jumpPower: 10, color: '#5bff6b', emoji: '🗡️', name: 'Haydut' },
            archer: { speed: 4.5, jumpPower: 12, color: '#5bb5ff', emoji: '🏹', name: 'Okçu' }
        };
        
        // Arka plan temaları
        this.backgrounds = {
            default: ['#0a0a2e', '#1a1a4e', '#2a1a3e'],
            forest: ['#0a1a0a', '#1a3a1a', '#2a5a2a'],
            desert: ['#3a2a1a', '#5a3a2a', '#7a4a2a'],
            snow: ['#aaccee', '#bbddff', '#ddeeff'],
            volcano: ['#1a0a0a', '#3a1a0a', '#5a2a0a'],
            space: ['#0a0a1a', '#1a0a2a', '#2a0a3a']
        };
        
        // Bölüm verileri
        this.levels = [];
        
        // Başlangıç
        this.init();
    }
    
    // ============================================================
    // BAŞLANGIÇ
    // ============================================================
    init() {
        // Bölümleri oluştur
        this.levels = this.generateLevels();
        
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
        
        console.log('⚔️ MYMAR Oyunu başlatıldı!');
        console.log(`🎮 Seçili Karakter: ${this.characters[this.selectedCharacter].name}`);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
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
                
                // Seçimi güncelle
                cards.forEach(c => c.classList.remove('selected'));
                const parent = btn.closest('.character-card');
                if (parent) parent.classList.add('selected');
                
                // Karakter rengini güncelle
                this.charColor = this.characters[char].color;
                document.getElementById('charColorPicker').value = this.charColor;
                
                // Oyuncuyu güncelle (eğer oyunda ise)
                if (this.player) {
                    this.player.color = this.charColor;
                }
                
                console.log(`👤 Karakter seçildi: ${this.characters[char].name}`);
            });
        });
        
        // Varsayılan seçim
        const defaultCard = document.querySelector(`.character-card[data-character="${this.selectedCharacter}"]`);
        if (defaultCard) defaultCard.classList.add('selected');
        
        // Karakter seç menüsüne dönüş
        document.getElementById('charSelectBackBtn').addEventListener('click', () => {
            document.getElementById('characterSelectMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Ana menüden karakter seç butonu
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
            
            // Canvas arka planını güncelle
            if (this.currentBg !== 'default') {
                this.canvas.classList.add(`bg-${this.currentBg}`);
            } else {
                this.canvas.className = '';
            }
            
            console.log(`🎨 Arka plan değiştirildi: ${this.currentBg}`);
        });
    }
    
    // ============================================================
    // MOBİL KONTROLLER
    // ============================================================
    setupMobileControls() {
        const jumpBtn = document.getElementById('mobileJump');
        const leftBtn = document.getElementById('mobileLeft');
        const rightBtn = document.getElementById('mobileRight');
        
        // Zıplama (ALT - ORTA)
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.jump = true;
        });
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.jump = false;
        });
        jumpBtn.addEventListener('mousedown', () => {
            this.input.jump = true;
        });
        jumpBtn.addEventListener('mouseup', () => {
            this.input.jump = false;
        });
        
        // Sol
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.left = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.left = false;
        });
        leftBtn.addEventListener('mousedown', () => {
            this.input.left = true;
        });
        leftBtn.addEventListener('mouseup', () => {
            this.input.left = false;
        });
        
        // Sağ
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.right = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.right = false;
        });
        rightBtn.addEventListener('mousedown', () => {
            this.input.right = true;
        });
        rightBtn.addEventListener('mouseup', () => {
            this.input.right = false;
        });
    }
    
    // ============================================================
    // SES SİSTEMİ
    // ============================================================
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
                    osc.frequency.value = 400;
                    gain.gain.value = 0.1;
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                    break;
                case 'collect':
                    osc.frequency.value = 600;
                    gain.gain.value = 0.12;
                    osc.type = 'sine';
                    osc.start();
                    setTimeout(() => { osc.frequency.value = 800; }, 50);
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;
                case 'gem':
                    osc.frequency.value = 900;
                    gain.gain.value = 0.12;
                    osc.type = 'sine';
                    osc.start();
                    setTimeout(() => { osc.frequency.value = 1200; }, 80);
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                case 'damage':
                    osc.frequency.value = 150;
                    gain.gain.value = 0.15;
                    osc.type = 'sawtooth';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                case 'complete':
                    osc.frequency.value = 500;
                    gain.gain.value = 0.12;
                    osc.type = 'sine';
                    osc.start();
                    setTimeout(() => { osc.frequency.value = 700; }, 100);
                    setTimeout(() => { osc.frequency.value = 900; }, 200);
                    osc.stop(this.audioContext.currentTime + 0.3);
                    break;
                case 'gameover':
                    osc.frequency.value = 300;
                    gain.gain.value = 0.15;
                    osc.type = 'sawtooth';
                    osc.start();
                    setTimeout(() => { osc.frequency.value = 150; }, 200);
                    setTimeout(() => { osc.frequency.value = 80; }, 400);
                    osc.stop(this.audioContext.currentTime + 0.6);
                    break;
                case 'trap':
                    osc.frequency.value = 200;
                    gain.gain.value = 0.2;
                    osc.type = 'square';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;
            }
        } catch (e) {
            // Ses hatasını yok say
        }
    }
    
    // ============================================================
    // BÖLÜM ÜRETİCİ
    // ============================================================
    generateLevels() {
        const levels = [];
        
        // 10 bölüm oluştur
        for (let i = 0; i < 10; i++) {
            const difficulty = Math.min(i + 1, 5);
            const platformCount = 5 + i * 1;
            const goldCount = 3 + i * 1;
            const gemCount = Math.floor(i / 2) + 1;
            const enemyCount = Math.min(2 + Math.floor(i / 2), 6);
            const trapCount = Math.floor(i / 3);
            
            const platforms = [];
            const golds = [];
            const gems = [];
            const enemies = [];
            const traps = [];
            
            let xPos = 0;
            let yPos = 450 - Math.random() * 50;
            
            // Platformlar
            for (let p = 0; p < platformCount; p++) {
                const width = 80 + Math.random() * 120;
                const height = 20 + Math.random() * 10;
                const x = xPos + (100 + Math.random() * 100);
                const y = Math.max(200, Math.min(550, yPos + (Math.random() - 0.5) * 120));
                
                platforms.push({ x, y, width, height });
                
                xPos = x + width;
                yPos = y;
            }
            
            // Son platform (çıkış için)
            const lastX = xPos + 100;
            platforms.push({ x: lastX, y: 550, width: 150, height: 30 });
            
            // Altınlar
            for (let g = 0; g < goldCount; g++) {
                const platIndex = Math.floor(Math.random() * platforms.length);
                const plat = platforms[platIndex];
                if (plat) {
                    golds.push({
                        x: plat.x + 20 + Math.random() * (plat.width - 40),
                        y: plat.y - 25 - Math.random() * 10,
                        width: 18,
                        height: 18,
                        collected: false,
                        bobPhase: Math.random() * Math.PI * 2
                    });
                }
            }
            
            // Mücevherler (bonus)
            for (let g = 0; g < gemCount; g++) {
                const platIndex = Math.floor(Math.random() * platforms.length);
                const plat = platforms[platIndex];
                if (plat && platIndex > 0) {
                    gems.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 20),
                        y: plat.y - 35 - Math.random() * 15,
                        width: 14,
                        height: 14,
                        collected: false,
                        bobPhase: Math.random() * Math.PI * 2
                    });
                }
            }
            
            // Düşmanlar
            for (let e = 0; e < enemyCount; e++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 1));
                const plat = platforms[platIndex];
                if (plat) {
                    enemies.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 35),
                        y: plat.y - 25,
                        width: 28,
                        height: 28,
                        range: 60 + Math.random() * 80,
                        speed: 0.8 + difficulty * 0.2 + Math.random() * 0.3,
                        startX: plat.x + 10 + Math.random() * (plat.width - 35),
                        direction: Math.random() > 0.5 ? 1 : -1,
                        alive: true,
                        type: Math.floor(Math.random() * 3)
                    });
                }
            }
            
            // Tuzaklar
            for (let t = 0; t < trapCount; t++) {
                const platIndex = Math.floor(Math.random() * Math.max(1, platforms.length - 1));
                const plat = platforms[platIndex];
                if (plat) {
                    traps.push({
                        x: plat.x + 10 + Math.random() * (plat.width - 20),
                        y: plat.y - 12,
                        width: 20,
                        height: 12,
                        active: true,
                        timer: 0,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
            
            // Çıkış
            const exitPlat = platforms[platforms.length - 1];
            
            levels.push({
                platforms: platforms,
                gold: golds,
                gems: gems,
                enemies: enemies,
                traps: traps,
                exit: {
                    x: exitPlat.x + exitPlat.width / 2 - 20,
                    y: exitPlat.y - 45,
                    width: 40,
                    height: 45
                },
                totalGold: goldCount,
                totalGems: gemCount,
                levelNumber: i + 1,
                difficulty: difficulty
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
        
        this.currentLevel = levelIndex;
        this.goldCollected = 0;
        this.gemsCollected = 0;
        this.totalGold = level.totalGold;
        this.time = 0;
        
        const char = this.characters[this.selectedCharacter];
        const speedMult = this.speedMultiplier / 3;
        
        // Oyuncu oluştur
        this.player = {
            x: 50,
            y: 500,
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
            animTimer: 0
        };
        
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
            alive: true
        }));
        
        // Tuzakları kopyala
        this.traps = (level.traps || []).map(t => ({
            ...t,
            active: true
        }));
        
        // Çıkışı kopyala
        this.exit = {...level.exit};
        
        // Kamerayı sıfırla
        this.camera.x = 0;
        this.camera.y = 0;
        
        // Partikülleri temizle
        this.particles = [];
        
        // UI'ı güncelle
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
        console.log(`📊 Bölüm ${levelIndex} yüklendi - Zorluk: ${level.difficulty}`);
    }
    
    // ============================================================
    // OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;
        
        if (this.state === 'playing') {
            this.update();
        }
        
        this.render();
        requestAnimationFrame(this.gameLoop);
    }
    
    // ============================================================
    // OYUN GÜNCELLEME
    // ============================================================
    update() {
        this.time += this.deltaTime * 0.06;
        this.updatePlayer();
        this.updateGold();
        this.updateGems();
        this.updateEnemies();
        this.updateTraps();
        this.updateParticles();
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
        
        const speed = p.speed * (this.difficulty === 'hard' ? 1.15 : this.difficulty === 'nightmare' ? 1.3 : 1);
        
        p.animTimer += this.deltaTime * 0.1;
        
        // Yatay hareket
        if (this.input.left) {
            p.vx = -speed;
            p.facing = -1;
        } else if (this.input.right) {
            p.vx = speed;
            p.facing = 1;
        } else {
            p.vx *= this.friction;
            if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }
        
        // Zıplama
        if (this.input.jump && p.onGround) {
            p.vy = -p.jumpPower;
            p.onGround = false;
            p.jumping = true;
            this.playSound('jump');
            this.spawnParticles(p.x + p.width/2, p.y + p.height, p.color, 8);
        }
        
        // Yerçekimi
        p.vy += this.gravity;
        if (p.vy > 15) p.vy = 15;
        
        // Yatay çarpışma
        p.x += p.vx;
        this.handleCollision(p, 'horizontal');
        
        // Dikey çarpışma
        p.y += p.vy;
        this.handleCollision(p, 'vertical');
        
        // Ekran sınırları
        if (p.x < 0) p.x = 0;
        if (p.x > 2500) p.x = 2500;
        
        // Düşme kontrolü
        if (p.y > 750) {
            this.takeDamage(50);
            p.y = 100;
            p.vy = 0;
        }
        
        if (p.onGround) {
            p.jumping = false;
        }
    }
    
    handleCollision(player, axis) {
        const margin = 2;
        
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
            
            gold.bobPhase += 0.05;
            const bobY = Math.sin(gold.bobPhase) * 3;
            
            if (p.x + p.width > gold.x + 2 &&
                p.x < gold.x + gold.width - 2 &&
                p.y + p.height > gold.y + bobY + 2 &&
                p.y < gold.y + bobY + gold.height - 2) {
                
                gold.collected = true;
                this.goldCollected++;
                const points = 10 + (this.difficulty === 'hard' ? 5 : this.difficulty === 'nightmare' ? 8 : 0);
                this.score += points;
                this.playSound('collect');
                this.spawnParticles(gold.x + gold.width/2, gold.y + gold.height/2, '#ffd93d', 15);
            }
        }
    }
    
    // ============================================================
    // MÜCEVHER TOPLAMA (BONUS)
    // ============================================================
    updateGems() {
        const p = this.player;
        if (!p) return;
        
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            
            gem.bobPhase += 0.07;
            const bobY = Math.sin(gem.bobPhase) * 4;
            
            if (p.x + p.width > gem.x + 2 &&
                p.x < gem.x + gem.width - 2 &&
                p.y + p.height > gem.y + bobY + 2 &&
                p.y < gem.y + bobY + gem.height - 2) {
                
                gem.collected = true;
                this.gemsCollected++;
                this.score += 25 + (this.difficulty === 'hard' ? 10 : this.difficulty === 'nightmare' ? 15 : 0);
                this.playSound('gem');
                this.spawnParticles(gem.x + gem.width/2, gem.y + gem.height/2, '#4d96ff', 20);
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
            
            enemy.x += enemy.direction * enemy.speed * this.deltaTime;
            
            if (enemy.x > enemy.startX + enemy.range) {
                enemy.direction = -1;
            } else if (enemy.x < enemy.startX - enemy.range) {
                enemy.direction = 1;
            }
            
            // Düşman çarpışması
            if (p.x + p.width > enemy.x + 2 &&
                p.x < enemy.x + enemy.width - 2 &&
                p.y + p.height > enemy.y + 2 &&
                p.y < enemy.y + enemy.height - 2) {
                
                if (p.vy > 0 && p.y + p.height - enemy.y < 25) {
                    enemy.alive = false;
                    this.score += 20;
                    this.playSound('collect');
                    this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#6bcb77', 20);
                    p.vy = -10;
                } else {
                    this.takeDamage(15);
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
            
            trap.phase += 0.04 * this.deltaTime;
            const flameHeight = 5 + Math.sin(trap.phase) * 8;
            
            // Tuzak çarpışması
            if (p.x + p.width > trap.x + 2 &&
                p.x < trap.x + trap.width - 2 &&
                p.y + p.height > trap.y - flameHeight + 2 &&
                p.y < trap.y + trap.height - 2) {
                
                this.takeDamage(10);
                this.playSound('trap');
                trap.active = false;
                setTimeout(() => {
                    trap.active = true;
                }, 2000);
            }
        }
    }
    
    // ============================================================
    // PARTİKÜLLER
    // ============================================================
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.015 + Math.random() * 0.025,
                radius: 3 + Math.random() * 5,
                color: color
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
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
        
        if (p.x + p.width > e.x + 2 &&
            p.x < e.x + e.width - 2 &&
            p.y + p.height > e.y + 2 &&
            p.y < e.y + e.height - 2) {
            
            if (this.goldCollected >= this.totalGold) {
                this.showLevelComplete();
            } else {
                this.spawnParticles(e.x + e.width/2, e.y, '#ff6b6b', 10);
                // Uyarı mesajı
                this.showFloatingText(e.x, e.y - 20, '⚠️ Tüm altınları topla!', '#ff6b6b');
            }
        }
    }
    
    showFloatingText(x, y, text, color) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -1,
            life: 1.5,
            decay: 0.008,
            radius: 0,
            color: color,
            text: text,
            isText: true
        });
    }
    
    // ============================================================
    // KAMERA
    // ============================================================
    updateCamera() {
        const p = this.player;
        if (!p) return;
        
        const targetX = p.x - this.canvas.width * 0.35;
        const targetY = p.y - this.canvas.height * 0.4;
        
        this.camera.x += (targetX - this.camera.x) * 0.08;
        this.camera.y += (targetY - this.camera.y) * 0.08;
        
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(0, this.camera.y);
    }
    
    // ============================================================
    // HASAR SİSTEMİ
    // ============================================================
    takeDamage(amount) {
        this.health -= amount;
        this.playSound('damage');
        const p = this.player;
        if (p) {
            this.spawnParticles(p.x + p.width/2, p.y + p.height/2, '#ff6b6b', 15);
        }
        
        if (this.health <= 0) {
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
        
        // Süre
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
        
        // Yıldızlar (arka plan efekti)
        this.renderStars(ctx);
        
        // Kamera transformasyonu
        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Platformlar
        for (const plat of this.platforms) {
            const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
            grad.addColorStop(0, '#4a4a8a');
            grad.addColorStop(1, '#2a2a5a');
            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(74, 74, 138, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.shadowBlur = 0;
            
            // Platform üst çizgisi
            ctx.fillStyle = 'rgba(100, 100, 200, 0.25)';
            ctx.fillRect(plat.x, plat.y, plat.width, 3);
            
            // Platform deseni
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            for (let i = 0; i < plat.width; i += 20) {
                ctx.fillRect(plat.x + i, plat.y + 5, 2, 5);
            }
        }
        
        // Tuzaklar
        for (const trap of this.traps) {
            if (!trap.active) continue;
            const flameHeight = 5 + Math.sin(trap.phase) * 8;
            
            // Alev efekti
            const grad = ctx.createLinearGradient(trap.x, trap.y, trap.x, trap.y - flameHeight);
            grad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            grad.addColorStop(0.5, 'rgba(255, 200, 0, 0.6)');
            grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(trap.x, trap.y);
            ctx.quadraticCurveTo(trap.x + trap.width/2, trap.y - flameHeight, trap.x + trap.width, trap.y);
            ctx.fill();
            
            // Tuzak tabanı
            ctx.fillStyle = '#8a4a3a';
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        }
        
        // Altınlar
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            const bobY = Math.sin(gold.bobPhase) * 3;
            
            ctx.shadowColor = '#ffd93d';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(gold.x + gold.width/2, gold.y + gold.height/2 + bobY, gold.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // İç parlaklık
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(gold.x + gold.width/2 - 3, gold.y + gold.height/2 + bobY - 3, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Mücevherler
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            const bobY = Math.sin(gem.bobPhase) * 4;
            
            ctx.shadowColor = '#4d96ff';
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#4d96ff';
            ctx.beginPath();
            // Elmas şekli
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
            ctx.moveTo(gem.x + gem.width/2, gem.y + 3 + bobY);
            ctx.lineTo(gem.x + gem.width/2 + 4, gem.y + gem.height/2 + bobY);
            ctx.lineTo(gem.x + gem.width/2, gem.y + gem.height - 3 + bobY);
            ctx.lineTo(gem.x + gem.width/2 - 4, gem.y + gem.height/2 + bobY);
            ctx.closePath();
            ctx.fill();
        }
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            const colors = ['#ff6b6b', '#ff6b3a', '#ff3a6b'];
            const color = colors[enemy.type % colors.length];
            
            // Düşman gövdesi
            const grad = ctx.createRadialGradient(
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, 5,
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2
            );
            grad.addColorStop(0, color);
            grad.addColorStop(1, '#cc0000');
            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(255, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
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
        }
        
        // Çıkış
        if (this.exit) {
            // Işık hüzmesi
            ctx.save();
            ctx.globalAlpha = 0.15 + Math.sin(this.time * 2) * 0.05;
            const grad2 = ctx.createRadialGradient(
                this.exit.x + this.exit.width/2, this.exit.y + this.exit.height/2, 10,
                this.exit.x + this.exit.width/2, this.exit.y + this.exit.height/2, 70
            );
            grad2.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
            grad2.addColorStop(1, 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(this.exit.x - 50, this.exit.y - 50, this.exit.width + 100, this.exit.height + 100);
            ctx.restore();
            
            // Kapı
            ctx.fillStyle = '#4d96ff';
            ctx.shadowColor = 'rgba(77, 150, 255, 0.4)';
            ctx.shadowBlur = 25;
            ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            ctx.shadowBlur = 0;
            
            // Kapı detayları - kemer
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width/2, this.exit.y, this.exit.width/2, Math.PI, 0);
            ctx.fill();
            
            // Kapı kolu
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width - 10, this.exit.y + this.exit.height/2, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Işık sütunu
            ctx.fillStyle = 'rgba(100, 200, 255, 0.08)';
            ctx.fillRect(this.exit.x + 10, this.exit.y - 30, this.exit.width - 20, 30);
        }
        
        // Oyuncu
        if (this.player) {
            const p = this.player;
            
            // Gölge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(p.x + p.width/2, p.y + p.height + 5, p.width/2 + 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Karakter gövdesi
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
            
            // Karakter emojisi (üzerinde)
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const charEmoji = this.characters[p.character]?.emoji || '⚔️';
            ctx.fillText(charEmoji, p.x + p.width/2, p.y + p.height/2 - 2);
            
            // Gözler
            ctx.fillStyle = '#ffffff';
            const eyeX = p.facing === 1 ? 8 : 2;
            ctx.beginPath();
            ctx.arc(p.x + 7 + eyeX, p.y + 12, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x + 23 + eyeX, p.y + 12, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Göz bebekleri
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
        
        // Partiküller
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            if (p.isText) {
                ctx.fillStyle = p.color;
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.text, p.x, p.y);
            } else {
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        // Altın toplama bilgisi (ekran üstü)
        if (this.state === 'playing' && this.goldCollected < this.totalGold) {
            const remaining = this.totalGold - this.goldCollected;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`⭐ Kalan Altın: ${remaining}`, this.canvas.width / 2, this.canvas.height - 50);
        }
    }
    
    darkenColor(color, factor) {
        // Basit renk koyulaştırma
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
        const starCount = 60;
        for (let i = 0; i < starCount; i++) {
            const x = ((i * 137.508) % this.canvas.width);
            const y = ((i * 269.361) % (this.canvas.height * 0.7));
            const size = ((i * 73) % 3) + 1;
            const alpha = 0.2 + ((i * 43) % 7) / 10;
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
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            switch(e.key) {
                case 'w':
                case 'ArrowUp':
                    this.input.jump = true;
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
        
        // Zafer partikülleri
        for (let i = 0; i < 50; i++) {
            const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#ff6bff'];
            this.spawnParticles(
                this.exit.x + this.exit.width/2 + (Math.random() - 0.5) * 100,
                this.exit.y + this.exit.height/2 + (Math.random() - 0.5) * 100,
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

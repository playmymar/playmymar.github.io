/**
 * MYMAR - Profesyonel Macera Oyunu
 * @version 4.0
 * @description 50 Bölüm - 10 Boss - 6 Karakter - Mağaza - Mini-Map - İsim Sistemi
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
        this.miniMapCanvas = document.getElementById('miniMapCanvas');
        this.miniMapCtx = this.miniMapCanvas.getContext('2d');

        // ======================================================
        // OYUN DURUMU
        // ======================================================
        this.state = 'menu';
        this.currentLevel = 1;
        this.maxLevel = 50;
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
        this.isBossLevel = false;
        this.bossDefeated = false;
        this.autoSave = true;
        this.playerName = 'İsimsiz';
        this.isNameSet = false;
        this.gems = 0;
        this.ownedItems = [];
        this.activeSkin = null;
        this.activeTrail = null;
        this.bossIntroActive = false;
        this.bossIntroTimer = 0;

        // ======================================================
        // SAVE SİSTEMİ
        // ======================================================
        this.saveData = {
            level: 1,
            score: 0,
            character: 'warrior',
            difficulty: 'normal',
            totalGold: 0,
            totalGems: 0,
            totalKills: 0,
            maxCombo: 0,
            lastPlayed: null,
            playerName: 'İsimsiz',
            gems: 0,
            ownedItems: [],
            activeSkin: null,
            activeTrail: null
        };

        // ======================================================
        // GİRİŞ DURUMU
        // ======================================================
        this.keys = {};
        this.input = {
            left: false,
            right: false,
            jump: false,
            interact: false,
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
        this.boss = null;
        this.bossAttacks = [];
        this.savePoints = [];
        this.trailParticles = [];

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
        // MİNİ-MAP
        // ======================================================
        this.miniMap = {
            visible: true,
            dragStartX: 0,
            dragStartY: 0,
            isDragging: false,
            offsetX: 0,
            offsetY: 0,
            scale: 0.15
        };

        // ======================================================
        // SES SİSTEMİ
        // ======================================================
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.audioContext = null;

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
            },
            knight: {
                speed: 3.8,
                jumpPower: 10,
                color: '#ffb347',
                emoji: '🛡️',
                name: 'Şövalye',
                health: 150,
                damage: 1.6,
                description: 'Zırh ve kalkan'
            },
            ninja: {
                speed: 6.5,
                jumpPower: 14,
                color: '#8b5bff',
                emoji: '🥷',
                name: 'Ninja',
                health: 70,
                damage: 1.1,
                description: 'Hızlı ve ölümcül'
            }
        };

        // ======================================================
        // MAĞAZA ÜRÜNLERİ
        // ======================================================
        this.shopItems = {
            'skin_warrior_gold': { name: 'Altın Savaşçı', price: 50, type: 'skin', emoji: '⚔️', character: 'warrior' },
            'skin_mage_dark': { name: 'Karanlık Büyücü', price: 75, type: 'skin', emoji: '🧙', character: 'mage' },
            'skin_rogue_shadow': { name: 'Gölge Haydut', price: 60, type: 'skin', emoji: '🗡️', character: 'rogue' },
            'skin_archer_elite': { name: 'Elit Okçu', price: 80, type: 'skin', emoji: '🏹', character: 'archer' },
            'skin_knight_royal': { name: 'Kraliyet Şövalyesi', price: 100, type: 'skin', emoji: '🛡️', character: 'knight' },
            'skin_ninja_void': { name: 'Void Ninja', price: 90, type: 'skin', emoji: '🥷', character: 'ninja' },
            'trail_fire': { name: 'Ateş İzi', price: 30, type: 'trail', emoji: '🔥' },
            'trail_star': { name: 'Yıldız İzi', price: 40, type: 'trail', emoji: '✨' }
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
            space: ['#0a0a1a', '#1a0a2a', '#2a0a3a'],
            underwater: ['#0a1a2a', '#0a2a4a', '#0a3a5a'],
            cyber: ['#0a0a1a', '#1a0a2a', '#2a0a4a']
        };

        // ======================================================
        // ZORLUK AYARLARI
        // ======================================================
        this.difficultySettings = {
            easy: {
                enemySpeed: 0.7,
                enemyHealth: 1,
                trapDamage: 5,
                enemyDamage: 8,
                bossHealth: 0.7,
                spawnRate: 1.2,
                goldMultiplier: 1.5,
                description: '🟢 Rahat oyun deneyimi'
            },
            normal: {
                enemySpeed: 1.0,
                enemyHealth: 1,
                trapDamage: 10,
                enemyDamage: 15,
                bossHealth: 1.0,
                spawnRate: 1.0,
                goldMultiplier: 1.0,
                description: '🟡 Dengeli oyun deneyimi'
            },
            hard: {
                enemySpeed: 1.4,
                enemyHealth: 1.5,
                trapDamage: 18,
                enemyDamage: 25,
                bossHealth: 1.5,
                spawnRate: 0.8,
                goldMultiplier: 0.8,
                description: '🔴 Zorlu mücadele'
            },
            nightmare: {
                enemySpeed: 1.8,
                enemyHealth: 2,
                trapDamage: 25,
                enemyDamage: 35,
                bossHealth: 2.0,
                spawnRate: 0.6,
                goldMultiplier: 0.6,
                description: '💀 Gerçek kabus!'
            }
        };

        // ======================================================
        // BÖLÜM VERİLERİ
        // ======================================================
        this.levels = [];
        this.bossLevels = [10, 20, 30, 40, 50];

        // ======================================================
        // BAŞLANGIÇ
        // ======================================================
        this.init();
    }

    // ============================================================
    // BAŞLANGIÇ
    // ============================================================
    init() {
        console.log('⚔️ MYMAR Oyunu başlatılıyor...');

        // Kayıtlı oyunu yükle
        this.loadGame();

        // İsim kontrolü
        this.checkPlayerName();

        // Bölümleri oluştur
        this.levels = this.generateLevels();
        console.log(`📊 ${this.levels.length} bölüm oluşturuldu`);

        // Canvas boyutlandırma
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mini-map
        this.setupMiniMap();

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

        // Zorluk seçimi
        this.setupDifficultySelect();

        // Mağaza
        this.setupShop();

        // Otomatik kayıt
        this.setupAutoSave();

        // Oyun döngüsü
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);

        console.log('✅ MYMAR Oyunu başlatıldı!');
        console.log(`👤 Oyuncu: ${this.playerName}`);
        console.log(`🎮 Karakter: ${this.characters[this.selectedCharacter].name}`);
        console.log(`📊 Zorluk: ${this.difficulty}`);
        console.log(`💎 Elmas: ${this.gems}`);
        console.log(`💾 Kayıt: Bölüm ${this.saveData.level}, Puan ${this.saveData.score}`);
        console.log('📖 Nasıl oynanır menüsünden kontrolleri öğrenebilirsiniz.');
    }

    // ============================================================
    // İSİM SİSTEMİ
    // ============================================================
    checkPlayerName() {
        const savedName = localStorage.getItem('mymar_player_name');
        if (savedName) {
            this.playerName = savedName;
            this.isNameSet = true;
            document.getElementById('playerNameDisplay').textContent = `👤 ${this.playerName}`;
            console.log(`👤 İsim yüklendi: ${this.playerName}`);
        } else {
            // İsim girme ekranını göster
            document.getElementById('nameScreen').classList.add('active');
            document.getElementById('mainMenu').classList.remove('active');
            console.log('📝 İsim girişi bekleniyor...');
        }
    }

    setupNameSystem() {
        const nameInput = document.getElementById('playerNameInput');
        const confirmBtn = document.getElementById('nameConfirmBtn');

        confirmBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name.length >= 2) {
                this.playerName = name;
                this.isNameSet = true;
                localStorage.setItem('mymar_player_name', name);
                document.getElementById('playerNameDisplay').textContent = `👤 ${name}`;
                document.getElementById('nameScreen').classList.remove('active');
                document.getElementById('mainMenu').classList.add('active');
                this.saveGame();
                console.log(`✅ İsim kaydedildi: ${name}`);
            } else {
                nameInput.style.borderColor = '#ff4444';
                nameInput.placeholder = '❌ En az 2 karakter girin!';
                setTimeout(() => {
                    nameInput.style.borderColor = 'rgba(255,255,255,0.1)';
                    nameInput.placeholder = 'Kahraman Adı...';
                }, 2000);
            }
        });

        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });

        // Enter tuşu ile onay
        nameInput.focus();
    }

    // ============================================================
    // SAVE SİSTEMİ
    // ============================================================
    saveGame() {
        if (!this.autoSave) return;

        try {
            this.saveData.level = this.currentLevel;
            this.saveData.score = this.score;
            this.saveData.character = this.selectedCharacter;
            this.saveData.difficulty = this.difficulty;
            this.saveData.totalGold = this.totalGoldCollected;
            this.saveData.totalGems = this.totalGemsCollected;
            this.saveData.totalKills = this.totalKills;
            this.saveData.maxCombo = this.maxCombo;
            this.saveData.lastPlayed = new Date().toISOString();
            this.saveData.playerName = this.playerName;
            this.saveData.gems = this.gems;
            this.saveData.ownedItems = this.ownedItems;
            this.saveData.activeSkin = this.activeSkin;
            this.saveData.activeTrail = this.activeTrail;

            localStorage.setItem('mymar_save', JSON.stringify(this.saveData));
            localStorage.setItem('mymar_player_name', this.playerName);

            // Güncelleme
            document.getElementById('playerCurrencyDisplay').textContent = `💎 ${this.gems}`;
            console.log('💾 Oyun kaydedildi');
        } catch (e) {
            console.warn('⚠️ Kayıt başarısız:', e);
        }
    }

    loadGame() {
        try {
            const saved = localStorage.getItem('mymar_save');
            if (saved) {
                const data = JSON.parse(saved);
                this.saveData = data;
                this.currentLevel = data.level || 1;
                this.score = data.score || 0;
                this.selectedCharacter = data.character || 'warrior';
                this.difficulty = data.difficulty || 'normal';
                this.totalGoldCollected = data.totalGold || 0;
                this.totalGemsCollected = data.totalGems || 0;
                this.totalKills = data.totalKills || 0;
                this.maxCombo = data.maxCombo || 0;
                this.gems = data.gems || 0;
                this.ownedItems = data.ownedItems || [];
                this.activeSkin = data.activeSkin || null;
                this.activeTrail = data.activeTrail || null;
                this.playerName = data.playerName || 'İsimsiz';

                // Mağazayı güncelle
                this.updateShopUI();

                console.log(`💾 Kayıt yüklendi: Bölüm ${this.currentLevel}, 💎 ${this.gems} elmas`);
            }
        } catch (e) {
            console.warn('⚠️ Kayıt yüklenemedi');
        }
    }

    deleteSave() {
        try {
            localStorage.removeItem('mymar_save');
            localStorage.removeItem('mymar_player_name');
            this.saveData = {
                level: 1,
                score: 0,
                character: 'warrior',
                difficulty: 'normal',
                totalGold: 0,
                totalGems: 0,
                totalKills: 0,
                maxCombo: 0,
                lastPlayed: null,
                playerName: 'İsimsiz',
                gems: 0,
                ownedItems: [],
                activeSkin: null,
                activeTrail: null
            };
            this.currentLevel = 1;
            this.score = 0;
            this.gems = 0;
            this.ownedItems = [];
            this.activeSkin = null;
            this.activeTrail = null;
            console.log('🗑️ Kayıt silindi');
            location.reload();
        } catch (e) {
            console.warn('⚠️ Kayıt silinemedi');
        }
    }

    // ============================================================
    // MAĞAZA SİSTEMİ
    // ============================================================
    setupShop() {
        const shopBtn = document.getElementById('shopBtn');
        const shopBackBtn = document.getElementById('shopBackBtn');
        const shopMenu = document.getElementById('shopMenu');

        shopBtn.addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            shopMenu.classList.add('active');
            this.updateShopUI();
        });

        shopBackBtn.addEventListener('click', () => {
            shopMenu.classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });

        // Satın alma butonları
        document.querySelectorAll('.shop-buy-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const itemId = btn.dataset.item;
                const price = parseInt(btn.dataset.price);
                this.buyItem(itemId, price);
            });
        });
    }

    updateShopUI() {
        document.getElementById('shopGems').textContent = this.gems;

        document.querySelectorAll('.shop-item').forEach((item) => {
            const itemId = item.dataset.item;
            const btn = item.querySelector('.shop-buy-btn');
            const ownedLabel = item.querySelector('.shop-owned');

            if (this.ownedItems.includes(itemId)) {
                item.classList.add('owned');
                if (ownedLabel) ownedLabel.style.display = 'block';
                if (btn) btn.disabled = true;
                btn.textContent = '✅ Sahipsin';
            } else {
                item.classList.remove('owned');
                if (ownedLabel) ownedLabel.style.display = 'none';
                if (btn) {
                    btn.disabled = false;
                    const price = parseInt(btn.dataset.price);
                    btn.textContent = `💎 ${price} Satın Al`;
                    if (this.gems < price) {
                        btn.style.opacity = '0.5';
                    } else {
                        btn.style.opacity = '1';
                    }
                }
            }
        });
    }

    buyItem(itemId, price) {
        if (this.ownedItems.includes(itemId)) {
            this.addFloatingText(0, 0, 'Zaten sahipsin!', '#ffd93d');
            return;
        }

        if (this.gems < price) {
            this.addFloatingText(0, 0, '⚠️ Yeterli elmas yok!', '#ff4444');
            return;
        }

        // Satın al
        this.gems -= price;
        this.ownedItems.push(itemId);

        // Skin ise aktif et
        const item = this.shopItems[itemId];
        if (item.type === 'skin') {
            this.activeSkin = itemId;
            // Karakter rengini güncelle
            this.charColor = this.characters[item.character].color;
            document.getElementById('charColorPicker').value = this.charColor;
            if (this.player) {
                this.player.color = this.charColor;
            }
        } else if (item.type === 'trail') {
            this.activeTrail = itemId;
        }

        this.saveGame();
        this.updateShopUI();
        this.addFloatingText(0, 0, `✅ ${item.name} satın alındı!`, '#6bcb77');
        console.log(`🛒 ${item.name} satın alındı!`);
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

        // Mini-map boyutlandırma
        const miniMapEl = document.getElementById('miniMap');
        if (window.innerWidth < 480) {
            this.miniMapCanvas.width = 200;
            this.miniMapCanvas.height = 60;
        } else if (window.innerWidth < 768) {
            this.miniMapCanvas.width = 250;
            this.miniMapCanvas.height = 70;
        } else {
            this.miniMapCanvas.width = 300;
            this.miniMapCanvas.height = 80;
        }
    }

    // ============================================================
    // MİNİ-MAP
    // ============================================================
    setupMiniMap() {
        const miniMapEl = document.getElementById('miniMap');

        // Dokunmatik kaydırma
        miniMapEl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.miniMap.isDragging = true;
            this.miniMap.dragStartX = touch.clientX;
            this.miniMap.dragStartY = touch.clientY;
        });

        miniMapEl.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.miniMap.isDragging) return;
            const touch = e.touches[0];
            const dx = touch.clientX - this.miniMap.dragStartX;
            const dy = touch.clientY - this.miniMap.dragStartY;
            this.miniMap.offsetX += dx;
            this.miniMap.offsetY += dy;
            this.miniMap.dragStartX = touch.clientX;
            this.miniMap.dragStartY = touch.clientY;

            // Sınırlar
            const level = this.levels[this.currentLevel - 1];
            if (level) {
                const maxOffset = level.width * this.miniMap.scale - this.miniMapCanvas.width;
                this.miniMap.offsetX = Math.max(-maxOffset, Math.min(0, this.miniMap.offsetX));
            }
        });

        miniMapEl.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.miniMap.isDragging = false;
        });

        // Fare ile kaydırma
        miniMapEl.addEventListener('mousedown', (e) => {
            this.miniMap.isDragging = true;
            this.miniMap.dragStartX = e.clientX;
            this.miniMap.dragStartY = e.clientY;
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.miniMap.isDragging) return;
            const dx = e.clientX - this.miniMap.dragStartX;
            const dy = e.clientY - this.miniMap.dragStartY;
            this.miniMap.offsetX += dx;
            this.miniMap.offsetY += dy;
            this.miniMap.dragStartX = e.clientX;
            this.miniMap.dragStartY = e.clientY;

            const level = this.levels[this.currentLevel - 1];
            if (level) {
                const maxOffset = level.width * this.miniMap.scale - this.miniMapCanvas.width;
                this.miniMap.offsetX = Math.max(-maxOffset, Math.min(0, this.miniMap.offsetX));
            }
        });

        document.addEventListener('mouseup', () => {
            this.miniMap.isDragging = false;
        });

        // Mini-map'i göster
        miniMapEl.style.display = 'block';
        this.miniMap.visible = true;
    }

    renderMiniMap() {
        const ctx = this.miniMapCtx;
        const w = this.miniMapCanvas.width;
        const h = this.miniMapCanvas.height;

        // Arka plan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        const level = this.levels[this.currentLevel - 1];
        if (!level) return;

        const scale = this.miniMap.scale;
        const offsetX = this.miniMap.offsetX;
        const offsetY = this.miniMap.offsetY;

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Platformlar
        ctx.fillStyle = 'rgba(100, 100, 200, 0.3)';
        for (const plat of level.platforms) {
            ctx.fillRect(plat.x * scale, plat.y * scale, plat.width * scale, plat.height * scale);
        }

        // Altınlar
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc((gold.x + gold.width / 2) * scale, (gold.y + gold.height / 2) * scale, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mücevherler
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            ctx.fillStyle = '#4d96ff';
            ctx.fillRect(gem.x * scale, gem.y * scale, gem.width * scale, gem.height * scale);
        }

        // Düşmanlar
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(enemy.x * scale, enemy.y * scale, enemy.width * scale, enemy.height * scale);
        }

        // Boss
        if (this.boss && this.boss.alive) {
            ctx.fillStyle = '#ff0044';
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.boss.x * scale, this.boss.y * scale, this.boss.width * scale, this.boss.height * scale);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👾', (this.boss.x + this.boss.width / 2) * scale, (this.boss.y + this.boss.height / 2) * scale + 4);
        }

        // Çıkış
        if (this.exit) {
            ctx.fillStyle = '#4d96ff';
            ctx.fillRect(this.exit.x * scale, this.exit.y * scale, this.exit.width * scale, this.exit.height * scale);
        }

        // Oyuncu (kırmızı daire)
        if (this.player) {
            const p = this.player;
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowColor = '#ff6b6b';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc((p.x + p.width / 2) * scale, (p.y + p.height / 2) * scale, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Görüş alanı (kamera)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                (this.camera.x) * scale,
                (this.camera.y) * scale,
                this.camera.width * scale,
                this.camera.height * scale
            );
        }

        ctx.restore();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, w, h);
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

                // Skin kontrolü
                const skinId = `skin_${char}`;
                const skinVariants = Object.keys(this.shopItems).filter(
                    id => this.shopItems[id].type === 'skin' && this.shopItems[id].character === char
                );

                let useDefault = true;
                for (const skin of skinVariants) {
                    if (this.ownedItems.includes(skin) && this.activeSkin === skin) {
                        this.charColor = this.characters[char].color;
                        useDefault = false;
                        break;
                    }
                }

                if (useDefault) {
                    this.charColor = this.characters[char].color;
                }

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

                this.saveGame();
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
    // ZORLUK SEÇİMİ
    // ============================================================
    setupDifficultySelect() {
        const diffSelect = document.getElementById('difficultySelect');
        const diffDesc = document.getElementById('difficultyDesc');

        diffSelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            const settings = this.difficultySettings[this.difficulty];
            diffDesc.textContent = settings.description;

            // Zor ve Kabus'ta hız sabit
            if (this.difficulty === 'hard' || this.difficulty === 'nightmare') {
                document.getElementById('speedSlider').disabled = true;
                document.getElementById('speedValue').textContent = '3 (Sabit)';
                this.speedMultiplier = 3;
            } else {
                document.getElementById('speedSlider').disabled = false;
                this.speedMultiplier = parseInt(document.getElementById('speedSlider').value);
                document.getElementById('speedValue').textContent = this.speedMultiplier;
            }

            this.saveGame();
            console.log(`📊 Zorluk değiştirildi: ${this.difficulty}`);
        });

        // İlk açıklamayı ayarla
        const initialSettings = this.difficultySettings[this.difficulty];
        if (initialSettings) {
            diffDesc.textContent = initialSettings.description;
        }
    }

    // ============================================================
    // OTOMATİK KAYIT
    // ============================================================
    setupAutoSave() {
        const toggle = document.getElementById('autoSaveToggle');
        toggle.addEventListener('change', (e) => {
            this.autoSave = e.target.checked;
            if (this.autoSave) {
                this.saveGame();
            }
            console.log(`💾 Otomatik kayıt: ${this.autoSave ? 'Açık' : 'Kapalı'}`);
        });
    }

    // ============================================================
    // MOBİL KONTROLLER
    // ============================================================
    setupMobileControls() {
        const leftZone = document.getElementById('mobileLeft');
        const jumpZone = document.getElementById('mobileJump');
        const rightZone = document.getElementById('mobileRight');

        // SOL
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
        leftZone.addEventListener('mousedown', () => { this.input.left = true; });
        leftZone.addEventListener('mouseup', () => { this.input.left = false; });
        leftZone.addEventListener('mouseleave', () => { this.input.left = false; });

        // Zıplama
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
        jumpZone.addEventListener('mouseup', () => { this.input.jump = false; });
        jumpZone.addEventListener('mouseleave', () => { this.input.jump = false; });

        // SAĞ
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
        rightZone.addEventListener('mousedown', () => { this.input.right = true; });
        rightZone.addEventListener('mouseup', () => { this.input.right = false; });
        rightZone.addEventListener('mouseleave', () => { this.input.right = false; });

        console.log('📱 Mobil kontroller hazır');
    }

    // ============================================================
    // SES SİSTEMİ
    // ============================================================
    initAudio() {
        try {
            this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
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

            switch (type) {
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

                case 'boss_hit':
                    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                    osc.type = 'sawtooth';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;

                case 'boss_defeated':
                    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    osc.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.15);
                    osc.frequency.setValueAtTime(900, this.audioContext.currentTime + 0.3);
                    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.45);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.5);
                    break;

                case 'boss_intro':
                    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    osc.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.2);
                    osc.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.4);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                    osc.type = 'square';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.5);
                    break;

                default:
                    osc.frequency.setValueAtTime(500, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
                    osc.type = 'sine';
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
            }
        } catch (e) {}
    }

    // ============================================================
    // BÖLÜM ÜRETİCİ - 50 BÖLÜM + 10 BOSS
    // ============================================================
    generateLevels() {
        const levels = [];

        for (let i = 1; i <= this.maxLevel; i++) {
            const isBoss = this.bossLevels.includes(i);
            const difficulty = Math.min(Math.ceil(i / 5), 5);
            const platformCount = 5 + Math.floor(i * 0.5);
            const goldCount = 3 + Math.floor(i * 0.4);
            const gemCount = Math.floor(i / 3) + 1;
            const enemyCount = isBoss ? 0 : Math.min(2 + Math.floor(i / 3), 8);
            const trapCount = isBoss ? 0 : Math.floor(i / 4);
            const powerupCount = isBoss ? 2 : Math.floor(i / 5);

            const platforms = [];
            const golds = [];
            const gems = [];
            const enemies = [];
            const traps = [];
            const powerups = [];

            let xPos = 0;
            let yPos = 450 - Math.random() * 50;

            // Platformlar
            const actualPlatformCount = isBoss ? Math.max(5, platformCount) : platformCount;
            for (let p = 0; p < actualPlatformCount; p++) {
                const width = 80 + Math.random() * 140;
                const height = 20 + Math.random() * 12;
                const x = xPos + (80 + Math.random() * 120);
                const y = Math.max(180, Math.min(550, yPos + (Math.random() - 0.5) * 140));

                platforms.push({ x, y, width, height, id: p });
                xPos = x + width;
                yPos = y;
            }

            // Boss platformu
            if (isBoss) {
                const bossPlatX = xPos + 50;
                platforms.push({
                    x: bossPlatX,
                    y: 450,
                    width: 400,
                    height: 30,
                    id: platforms.length,
                    isBoss: true
                });
                xPos = bossPlatX + 400;
            }

            // Çıkış platformu
            const lastX = xPos + 120;
            platforms.push({ x: lastX, y: 550, width: 160, height: 30, id: platforms.length });

            // Altınlar
            const actualGoldCount = isBoss ? Math.max(5, goldCount) : goldCount;
            for (let g = 0; g < actualGoldCount; g++) {
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

            // Mücevherler
            const actualGemCount = isBoss ? Math.max(3, gemCount) : gemCount;
            for (let g = 0; g < actualGemCount; g++) {
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
            if (!isBoss) {
                const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;
                const enemySpeedMult = diffSettings.enemySpeed;
                const enemyHealthMult = diffSettings.enemyHealth;

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
                            speed: (0.8 + difficulty * 0.2 + Math.random() * 0.3) * enemySpeedMult,
                            startX: plat.x + 10 + Math.random() * (plat.width - 38),
                            direction: Math.random() > 0.5 ? 1 : -1,
                            alive: true,
                            type: enemyType,
                            color: enemyColors[enemyType],
                            health: Math.ceil((1 + Math.floor(difficulty / 3)) * enemyHealthMult),
                            maxHealth: Math.ceil((1 + Math.floor(difficulty / 3)) * enemyHealthMult),
                            hitTimer: 0,
                            patrolTimer: 0,
                            waitTime: 1 + Math.random() * 2,
                            isWaiting: false,
                            chaseTimer: 0,
                            isChasing: false,
                            seePlayer: false
                        });
                    }
                }
            }

            // Tuzaklar
            if (!isBoss) {
                const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;
                const trapDamage = diffSettings.trapDamage;

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
                            type: Math.floor(Math.random() * 2),
                            damage: trapDamage
                        });
                    }
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

            // Boss
            let bossData = null;
            if (isBoss) {
                const bossIndex = Math.floor(i / 10);
                const bossColors = ['#ff0044', '#ff6600', '#ffcc00', '#00ff66', '#0044ff'];
                const bossNames = ['Karanlık Lord', 'Ateş Şeytanı', 'Buz Devi', 'Gök Ejderi', 'Kaos Hükümdarı'];
                const bossTypes = ['fire', 'ice', 'thunder', 'dark', 'void'];

                bossData = {
                    x: platforms[platforms.length - 2].x + 150,
                    y: 390,
                    width: 80,
                    height: 90,
                    name: bossNames[bossIndex % bossNames.length],
                    type: bossTypes[bossIndex % bossTypes.length],
                    color: bossColors[bossIndex % bossColors.length],
                    health: 50 + i * 5,
                    maxHealth: 50 + i * 5,
                    speed: 0.5 + i * 0.02,
                    attackTimer: 0,
                    attackCooldown: 2 - Math.min(i * 0.02, 1),
                    phase: 0,
                    phaseTimer: 0,
                    hitTimer: 0,
                    isAttacking: false,
                    attackType: 0,
                    direction: -1,
                    alive: true,
                    damage: 10 + i * 0.5,
                    size: 1 + i * 0.005
                };
            }

            levels.push({
                levelNumber: i,
                difficulty: difficulty,
                isBoss: isBoss,
                platforms: platforms,
                gold: golds,
                gems: gems,
                enemies: enemies,
                traps: traps,
                powerups: powerups,
                boss: bossData,
                exit: {
                    x: exitPlat.x + exitPlat.width / 2 - 20,
                    y: exitPlat.y - 50,
                    width: 40,
                    height: 50
                },
                totalGold: actualGoldCount,
                totalGems: actualGemCount,
                width: xPos + 300,
                height: 600
            });
        }

        return levels;
    }

    // ============================================================
    // BÖLÜM YÜKLEME
    // ============================================================
    loadLevel(levelIndex) {
        if (levelIndex > this.maxLevel) {
            this.showWinScreen();
            return;
        }

        const level = this.levels[levelIndex - 1];
        if (!level) {
            this.showWinScreen();
            return;
        }

        console.log(`📊 Bölüm ${levelIndex} yükleniyor... ${level.isBoss ? '👾 BOSS SAVAŞI!' : ''}`);

        this.currentLevel = levelIndex;
        this.isBossLevel = level.isBoss || false;
        this.bossDefeated = false;
        this.goldCollected = 0;
        this.gemsCollected = 0;
        this.totalGold = level.totalGold;
        this.time = 0;
        this.comboCount = 0;
        this.bossIntroActive = false;
        this.bossIntroTimer = 0;

        const char = this.characters[this.selectedCharacter];
        const speedMult = this.speedMultiplier / 3;
        const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;

        // İlk platform
        const firstPlat = level.platforms[0];

        // Oyuncu
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
            speedBoostTimer: 0,
            trailTimer: 0
        };

        this.health = this.player.health;
        this.maxHealth = this.player.maxHealth;

        // Nesneleri kopyala
        this.platforms = level.platforms.map(p => ({ ...p }));
        this.goldItems = level.gold.map(g => ({ ...g, collected: false }));
        this.gemItems = level.gems.map(g => ({ ...g, collected: false }));
        this.enemies = level.enemies.map(e => ({ ...e, alive: true }));
        this.traps = level.traps.map(t => ({ ...t, active: true }));
        this.powerups = level.powerups.map(p => ({ ...p, collected: false }));
        this.exit = { ...level.exit };
        this.boss = level.boss ? { ...level.boss, alive: true } : null;
        this.bossAttacks = [];
        this.projectiles = [];
        this.floatingTexts = [];
        this.particles = [];
        this.trailParticles = [];

        // Boss can çubuğu
        const bossHealthBar = document.getElementById('bossHealthBar');
        const bossIndicator = document.getElementById('bossIndicator');

        if (this.isBossLevel && this.boss) {
            bossHealthBar.style.display = 'block';
            bossIndicator.style.display = 'flex';
            this.updateBossHealth();

            // Boss giriş animasyonu
            this.showBossIntro();
        } else {
            bossHealthBar.style.display = 'none';
            bossIndicator.style.display = 'none';
        }

        // Mini-map sıfırla
        this.miniMap.offsetX = 0;
        this.miniMap.offsetY = 0;

        // Kamera
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.shake = 0;

        // HUD
        this.updateHUD();

        // Oyun durumu
        this.state = 'playing';
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('settingsMenu').classList.remove('active');
        document.getElementById('howToPlayMenu').classList.remove('active');
        document.getElementById('characterSelectMenu').classList.remove('active');
        document.getElementById('leaderboardMenu').classList.remove('active');
        document.getElementById('shopMenu').classList.remove('active');
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('levelComplete').classList.remove('active');
        document.getElementById('gameOver').classList.remove('active');
        document.getElementById('bossDefeated').classList.remove('active');
        document.getElementById('bossIntro').classList.remove('active');

        this.playSound('collect');
        console.log(`✅ Bölüm ${levelIndex} yüklendi! Altın: ${this.totalGold}`);
    }

    // ============================================================
    // BOSS GİRİŞ ANİMASYONU
    // ============================================================
    showBossIntro() {
        if (!this.boss) return;

        this.bossIntroActive = true;
        this.bossIntroTimer = 0;
        const introEl = document.getElementById('bossIntro');
        const nameEl = document.getElementById('bossIntroName');

        nameEl.textContent = `👾 ${this.boss.name}`;
        introEl.classList.add('active');
        this.playSound('boss_intro');

        // 2 saniye sonra kapat
        setTimeout(() => {
            introEl.classList.remove('active');
            this.bossIntroActive = false;
        }, 2500);
    }

    // ============================================================
    // BOSS SAĞLIĞI
    // ============================================================
    updateBossHealth() {
        if (!this.boss) return;
        const percent = (this.boss.health / this.boss.maxHealth) * 100;
        document.getElementById('bossHealthFill').style.width = Math.max(0, percent) + '%';
        document.getElementById('bossHealthText').textContent = Math.max(0, Math.round(percent)) + '%';
    }

    // ============================================================
    // OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;

        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        if (this.fpsTimer >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

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

        // Oyuncu buff'ları
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

        // Güncellemeler
        this.updatePlayer();
        this.updateGold();
        this.updateGems();
        this.updateEnemies();
        this.updateTraps();
        this.updatePowerups();
        this.updateParticles();
        this.updateTrailParticles();
        this.updateFloatingTexts();

        // Boss
        if (this.isBossLevel && this.boss && this.boss.alive) {
            this.updateBoss();
            this.updateBossAttacks();
            this.checkBossCollision();
        }

        this.checkExit();
        this.updateCamera();
        this.updateHUD();

        // Mini-map
        this.renderMiniMap();

        // Otomatik kayıt (her 30 saniye)
        if (this.autoSave && Math.floor(this.time) % 30 === 0 && this.time > 0) {
            this.saveGame();
        }
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

        // Hız
        let speed = p.speed;
        if (p.speedBoost) speed *= 1.5;
        if (this.difficulty === 'hard') speed *= 0.85;
        if (this.difficulty === 'nightmare') speed *= 0.7;

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
            this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, p.color, 15);
            this.playSound('jump');
        }

        if (p.isDashing) {
            p.vx = p.facing * speed * 3;
            p.vy *= 0.9;
        }

        // Zıplama
        const jumpPressed = this.input.jump || this.jumpBufferTimer > 0;

        if (jumpPressed) {
            if (p.onGround || this.coyoteTimer > 0) {
                p.vy = -p.jumpPower;
                p.onGround = false;
                p.jumping = true;
                this.coyoteTimer = 0;
                this.jumpBufferTimer = 0;
                this.playSound('jump');
                this.spawnParticles(p.x + p.width / 2, p.y + p.height, p.color, 10);
            } else if (p.canDoubleJump && !p.onGround && p.groundedTimer > 0.15) {
                p.vy = -p.jumpPower * 0.85;
                p.canDoubleJump = false;
                p.jumping = true;
                this.playSound('jump');
                this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ffd93d', 15);
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

        // Düşme
        if (p.y > 800) {
            this.takeDamage(50);
            const firstPlat = this.platforms[0];
            if (firstPlat) {
                p.x = firstPlat.x + 20;
                p.y = firstPlat.y - 45;
                p.vy = 0;
            }
        }

        if (p.onGround) {
            p.jumping = false;
            p.canDoubleJump = true;
        }

        // İz efekti
        if (this.activeTrail && (p.onGround || p.vx !== 0)) {
            p.trailTimer += this.deltaTime * 0.06;
            if (p.trailTimer > 0.05) {
                p.trailTimer = 0;
                const trailColor = this.activeTrail === 'trail_fire' ? '#ff6600' : '#ffd93d';
                this.trailParticles.push({
                    x: p.x + p.width / 2,
                    y: p.y + p.height / 2,
                    color: trailColor,
                    life: 0.5,
                    radius: 4,
                    decay: 0.03
                });
            }
        }

        // Ekran sınırları
        const level = this.levels[this.currentLevel - 1];
        const levelWidth = level ? level.width : 2500;
        p.x = Math.max(0, Math.min(p.x, levelWidth - p.width));
    }

    // ============================================================
    // ÇARPIŞMA
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
    // ALTIN
    // ============================================================
    updateGold() {
        const p = this.player;
        if (!p) return;

        const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;

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

                const basePoints = 10;
                const points = Math.round(basePoints * diffSettings.goldMultiplier);
                this.score += points;
                this.comboCount++;

                if (this.comboCount > this.maxCombo) {
                    this.maxCombo = this.comboCount;
                }

                this.playSound('collect');
                this.spawnParticles(gold.x + gold.width / 2, gold.y + gold.height / 2, '#ffd93d', 15);
                this.addFloatingText(gold.x, gold.y - 20, `+${points} ⭐`, '#ffd93d');
            }
        }
    }

    // ============================================================
    // MÜCEVHER
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
                this.gems += 1; // Elmas kazan

                this.score += 25;
                this.playSound('gem');
                this.spawnParticles(gem.x + gem.width / 2, gem.y + gem.height / 2, '#4d96ff', 25);
                this.addFloatingText(gem.x, gem.y - 25, '+25 💎 +1💎', '#4d96ff');
                this.saveGame();
            }
        }
    }

    // ============================================================
    // DÜŞMANLAR
    // ============================================================
    updateEnemies() {
        const p = this.player;
        if (!p) return;

        const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;
        const enemyDamage = diffSettings.enemyDamage;

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            // Oyuncuyu görme
            const dx = p.x - enemy.x;
            const dy = p.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const seeRange = 200;

            enemy.seePlayer = dist < seeRange;

            // Kovalama
            if (enemy.seePlayer && !enemy.isWaiting) {
                enemy.isChasing = true;
                enemy.chaseTimer += this.deltaTime * 0.06;

                if (dx > 0) {
                    enemy.direction = 1;
                } else {
                    enemy.direction = -1;
                }

                const chaseSpeed = enemy.speed * (1 + Math.min(enemy.chaseTimer * 0.1, 0.5));
                enemy.x += enemy.direction * chaseSpeed * this.deltaTime;

                // Zıplama (oyuncunun üzerine)
                if (dy < -50 && Math.abs(dx) < 80 && enemy.onGround === undefined) {
                    // Düşman zıplaması (basit)
                }
            } else {
                enemy.isChasing = false;
                enemy.chaseTimer = 0;

                // Normal patrol
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
            }

            // Çarpışma
            if (p.x + p.width > enemy.x + 3 &&
                p.x < enemy.x + enemy.width - 3 &&
                p.y + p.height > enemy.y + 3 &&
                p.y < enemy.y + enemy.height - 3) {

                if (p.vy > 0 && p.y + p.height - enemy.y < 25 && !p.isDashing) {
                    enemy.health--;
                    enemy.hitTimer = 0.3;

                    if (enemy.health <= 0) {
                        enemy.alive = false;
                        this.totalKills++;
                        this.score += 20;
                        this.playSound('collect');
                        this.spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#6bcb77', 30);
                        this.addFloatingText(enemy.x, enemy.y - 20, '+20 ⚔️', '#6bcb77');
                        p.vy = -8;
                    } else {
                        this.spawnParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff6b6b', 10);
                        p.vy = -6;
                    }
                } else if (!p.invincible && !p.isDashing) {
                    this.takeDamage(enemyDamage);
                    p.vx = p.facing * -8;
                    p.vy = -5;
                }
            }

            if (enemy.hitTimer > 0) {
                enemy.hitTimer -= this.deltaTime * 0.06;
            }
        }
    }

    // ============================================================
    // TUZAKLAR
    // ============================================================
    updateTraps() {
        const p = this.player;
        if (!p) return;

        const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;

        for (const trap of this.traps) {
            if (!trap.active) continue;

            trap.phase += 0.05 * this.deltaTime;
            const flameHeight = 5 + Math.sin(trap.phase) * 10;
            const isActive = Math.sin(trap.phase) > -0.3;

            if (isActive) {
                if (p.x + p.width > trap.x + 4 &&
                    p.x < trap.x + trap.width - 4 &&
                    p.y + p.height > trap.y - flameHeight + 4 &&
                    p.y < trap.y + trap.height - 4 &&
                    !p.invincible) {

                    const damage = trap.damage || diffSettings.trapDamage || 10;
                    this.takeDamage(damage);
                    this.playSound('trap');
                    this.spawnParticles(trap.x + trap.width / 2, trap.y, '#ff6b00', 20);
                    p.vx = p.facing * -5;
                    p.vy = -6;
                }
            }

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

                switch (powerup.type) {
                    case 'health':
                        const healAmount = 25;
                        p.health = Math.min(p.maxHealth, p.health + healAmount);
                        this.health = p.health;
                        this.addFloatingText(powerup.x, powerup.y - 20, `❤️ +${healAmount} Can`, '#ff6b6b');
                        this.spawnParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, '#ff6b6b', 25);
                        break;

                    case 'speed':
                        p.speedBoost = true;
                        p.speedBoostTimer = 5;
                        this.addFloatingText(powerup.x, powerup.y - 20, '⚡ Hız Artışı!', '#5bff6b');
                        this.spawnParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, '#5bff6b', 25);
                        break;

                    case 'shield':
                        p.shield = true;
                        p.shieldTimer = 5;
                        this.addFloatingText(powerup.x, powerup.y - 20, '🛡️ Kalkan!', '#4d96ff');
                        this.spawnParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, '#4d96ff', 25);
                        break;
                }
            }
        }
    }

    // ============================================================
    // BOSS SİSTEMİ
    // ============================================================
    updateBoss() {
        if (!this.boss || !this.boss.alive) return;
        if (this.bossIntroActive) return;

        const boss = this.boss;
        const p = this.player;
        if (!p) return;

        const diffSettings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;

        this.updateBossHealth();

        // Boss hareketi
        const dx = p.x - boss.x;
        const dy = p.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Boss saldırı
        boss.attackTimer += this.deltaTime * 0.06;

        if (boss.attackTimer >= boss.attackCooldown && dist < 400) {
            boss.isAttacking = true;
            boss.attackType = Math.floor(Math.random() * 3);
            boss.attackTimer = 0;

            switch (boss.attackType) {
                case 0:
                    if (dist < 150) {
                        if (!p.invincible) {
                            const damage = (boss.damage || 15) * diffSettings.bossHealth;
                            this.takeDamage(damage);
                            p.vx = p.facing * -12;
                            p.vy = -8;
                            this.shakeCamera(8);
                        }
                    }
                    this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff4444', 30);
                    break;

                case 1:
                    this.bossAttacks.push({
                        x: boss.x + boss.width / 2,
                        y: boss.y + 20,
                        vx: (p.x - boss.x) / dist * 4,
                        vy: (p.y - boss.y) / dist * 4,
                        life: 2,
                        radius: 8,
                        damage: 15 * diffSettings.bossHealth,
                        color: '#ff6600'
                    });
                    break;

                case 2:
                    const explosionRange = 120;
                    if (dist < explosionRange && !p.invincible) {
                        const damage = 20 * diffSettings.bossHealth;
                        this.takeDamage(damage);
                        p.vx = p.facing * -10;
                        p.vy = -10;
                        this.shakeCamera(10);
                    }
                    for (let i = 0; i < 40; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * explosionRange;
                        this.spawnParticles(
                            boss.x + boss.width / 2 + Math.cos(angle) * radius,
                            boss.y + boss.height / 2 + Math.sin(angle) * radius,
                            '#ff4444', 5
                        );
                    }
                    break;
            }

            boss.isAttacking = false;
            this.playSound('boss_hit');
        }

        // Boss hareketi
        if (dist > 50) {
            const moveSpeed = boss.speed * (1 + Math.min(this.currentLevel * 0.01, 1));
            if (dx > 0) {
                boss.x += moveSpeed * this.deltaTime;
                boss.direction = 1;
            } else {
                boss.x -= moveSpeed * this.deltaTime;
                boss.direction = -1;
            }
        }

        // Boss sınırları
        const level = this.levels[this.currentLevel - 1];
        const levelWidth = level ? level.width : 2500;
        boss.x = Math.max(50, Math.min(boss.x, levelWidth - boss.width - 50));
        boss.y = Math.max(300, Math.min(boss.y, 500));

        if (boss.hitTimer > 0) {
            boss.hitTimer -= this.deltaTime * 0.06;
        }

        // Faz değişimi
        const healthPercent = boss.health / boss.maxHealth;
        if (healthPercent < 0.5 && boss.phase === 0) {
            boss.phase = 1;
            boss.attackCooldown *= 0.8;
            boss.speed *= 1.3;
            this.addFloatingText(boss.x, boss.y - 50, '💢 FAZ 2!', '#ff4444');
            this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff4444', 40);
        }

        if (healthPercent < 0.25 && boss.phase === 1) {
            boss.phase = 2;
            boss.attackCooldown *= 0.7;
            boss.speed *= 1.4;
            this.addFloatingText(boss.x, boss.y - 50, '💀 FAZ 3!', '#ff0000');
            this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff0000', 50);
        }
    }

    // ============================================================
    // BOSS SALDIRILARI
    // ============================================================
    updateBossAttacks() {
        for (let i = this.bossAttacks.length - 1; i >= 0; i--) {
            const attack = this.bossAttacks[i];
            attack.x += attack.vx;
            attack.y += attack.vy;
            attack.life -= this.deltaTime * 0.06;

            if (attack.life <= 0) {
                this.bossAttacks.splice(i, 1);
                continue;
            }

            const p = this.player;
            if (p) {
                const dx = p.x + p.width / 2 - attack.x;
                const dy = p.y + p.height / 2 - attack.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < attack.radius + p.width / 2 && !p.invincible) {
                    this.takeDamage(attack.damage || 10);
                    this.spawnParticles(attack.x, attack.y, '#ff4444', 20);
                    this.bossAttacks.splice(i, 1);
                }
            }
        }
    }

    // ============================================================
    // BOSS ÇARPIŞMASI
    // ============================================================
    checkBossCollision() {
        if (!this.boss || !this.boss.alive) return;
        if (this.bossIntroActive) return;

        const p = this.player;
        if (!p) return;

        const boss = this.boss;

        if (p.x + p.width > boss.x + 5 &&
            p.x < boss.x + boss.width - 5 &&
            p.y + p.height > boss.y + 5 &&
            p.y < boss.y + boss.height - 5) {

            if (p.vy > 0 && p.y + p.height - boss.y < 30 && !p.isDashing) {
                const damage = p.damage || 1;
                boss.health -= damage * 5;
                boss.hitTimer = 0.3;
                this.shakeCamera(6);
                this.playSound('boss_hit');
                this.spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ffd93d', 20);
                p.vy = -10;

                if (boss.health <= 0) {
                    boss.alive = false;
                    this.bossDefeated = true;
                    this.score += 100 + this.currentLevel * 5;
                    this.gems += 10;
                    this.playSound('boss_defeated');

                    for (let i = 0; i < 80; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * 150;
                        this.spawnParticles(
                            boss.x + boss.width / 2 + Math.cos(angle) * dist,
                            boss.y + boss.height / 2 + Math.sin(angle) * dist,
                            ['#ffd93d', '#ff6b6b', '#4d96ff', '#6bcb77', '#ff6bff'][Math.floor(Math.random() * 5)],
                            3
                        );
                    }

                    this.addFloatingText(boss.x, boss.y - 50, '👾 BOSS YENİLDİ! +10💎', '#ffd93d');
                    this.saveGame();
                    this.showBossDefeated();
                }
            } else if (!p.invincible && !p.isDashing) {
                const damage = (boss.damage || 15) *
                    (this.difficultySettings[this.difficulty]?.bossHealth || 1);
                this.takeDamage(damage);
                p.vx = p.facing * -10;
                p.vy = -8;
                this.shakeCamera(10);
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
    // İZ PARTİKÜLLERİ
    // ============================================================
    updateTrailParticles() {
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.life -= p.decay;
            p.radius *= 0.98;

            if (p.life <= 0 || p.radius < 0.5) {
                this.trailParticles.splice(i, 1);
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

        if (this.isBossLevel && this.boss && this.boss.alive) {
            return;
        }

        const e = this.exit;

        if (p.x + p.width > e.x + 4 &&
            p.x < e.x + e.width - 4 &&
            p.y + p.height > e.y + 4 &&
            p.y < e.y + e.height - 4) {

            if (this.goldCollected >= this.totalGold) {
                if (this.isBossLevel && this.boss && this.boss.alive) {
                    return;
                }
                this.showLevelComplete();
            } else {
                const remaining = this.totalGold - this.goldCollected;
                this.spawnParticles(e.x + e.width / 2, e.y, '#ff6b6b', 15);
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

        let targetX = p.x - this.canvas.width * 0.35;
        let targetY = p.y - this.canvas.height * 0.4;

        if (this.isBossLevel && this.boss && this.boss.alive) {
            const midX = (p.x + this.boss.x) / 2;
            targetX = midX - this.canvas.width * 0.45;
            targetY = Math.min(p.y, this.boss.y) - this.canvas.height * 0.35;
        }

        this.camera.targetX = Math.max(0, targetX);
        this.camera.targetY = Math.max(0, targetY);

        this.camera.x += (this.camera.targetX - this.camera.x) * 0.06;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.06;

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

        if (p.shield) {
            p.shield = false;
            p.shieldTimer = 0;
            this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#4d96ff', 30);
            this.addFloatingText(p.x, p.y - 30, '🛡️ Kalkan Kırıldı!', '#4d96ff');
            return;
        }

        p.health -= amount;
        this.health = p.health;
        p.invincible = true;
        p.invincibleTimer = 0.5;

        this.playSound('damage');
        this.shakeCamera(5);
        this.spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff6b6b', 20);
        this.addFloatingText(p.x, p.y - 30, `-${amount} ❤️`, '#ff6b6b');

        if (p.health <= 0) {
            p.health = 0;
            this.health = 0;
            this.showGameOver();
        }

        this.updateHUD();
    }

    // ============================================================
    // HUD
    // ============================================================
    updateHUD() {
        document.getElementById('healthDisplay').textContent = Math.max(0, Math.round(this.health));
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('gemDisplay').textContent = this.gemsCollected;
        document.getElementById('comboDisplay').textContent = this.comboCount > 1 ? this.comboCount + 'x' : '0';
        document.getElementById('levelDisplay').textContent = `📊 Bölüm ${this.currentLevel}`;
        document.getElementById('objectiveDisplay').textContent = `🎯 Altın: ${this.goldCollected}/${this.totalGold}`;

        const mins = Math.floor(this.time / 60);
        const secs = Math.floor(this.time % 60);
        document.getElementById('timerDisplay').textContent =
            `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

        // Platformlar
        for (const plat of this.platforms) {
            const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
            grad.addColorStop(0, '#5a5a9a');
            grad.addColorStop(1, '#3a3a6a');
            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(74, 74, 138, 0.3)';
            ctx.shadowBlur = 12;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(120, 120, 220, 0.3)';
            ctx.fillRect(plat.x, plat.y, plat.width, 3);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            for (let i = 0; i < plat.width; i += 25) {
                ctx.fillRect(plat.x + i, plat.y + 6, 2, 6);
            }

            if (plat.isBoss) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.lineWidth = 2;
                ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
                ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            }
        }

        // Tuzaklar
        for (const trap of this.traps) {
            if (!trap.active) continue;

            const flameHeight = 5 + Math.sin(trap.phase) * 12;
            const isActive = Math.sin(trap.phase) > -0.3;

            if (isActive) {
                const grad = ctx.createRadialGradient(
                    trap.x + trap.width / 2, trap.y, 2,
                    trap.x + trap.width / 2, trap.y - flameHeight / 2, flameHeight
                );
                grad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
                grad.addColorStop(0.3, 'rgba(255, 150, 0, 0.7)');
                grad.addColorStop(0.7, 'rgba(255, 80, 0, 0.4)');
                grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(trap.x + trap.width / 2, trap.y - flameHeight / 2, flameHeight, 0, Math.PI * 2);
                ctx.fill();

                for (let i = 0; i < 3; i++) {
                    const offsetX = (Math.random() - 0.5) * trap.width;
                    const offsetY = -Math.random() * flameHeight;
                    const size = 2 + Math.random() * 4;
                    ctx.fillStyle = `rgba(255, 200, 50, ${0.3 + Math.random() * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(trap.x + trap.width / 2 + offsetX, trap.y + offsetY, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            const baseColor = trap.type === 0 ? '#8a4a3a' : '#3a5a8a';
            ctx.fillStyle = baseColor;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 5;
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
            ctx.shadowBlur = 0;
        }

        // Altınlar
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            const bobY = Math.sin(gold.bobPhase) * 3;
            const glow = 0.5 + Math.sin(gold.bobPhase) * 0.3;

            ctx.shadowColor = `rgba(255, 217, 61, ${glow * 0.8})`;
            ctx.shadowBlur = 25;

            const grad = ctx.createRadialGradient(
                gold.x + gold.width / 2, gold.y + gold.height / 2 + bobY, 2,
                gold.x + gold.width / 2, gold.y + gold.height / 2 + bobY, gold.width
            );
            grad.addColorStop(0, '#ffd93d');
            grad.addColorStop(0.7, '#ffb300');
            grad.addColorStop(1, '#ff8f00');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(gold.x + gold.width / 2, gold.y + gold.height / 2 + bobY, gold.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(gold.x + gold.width / 2 - 4, gold.y + gold.height / 2 + bobY - 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mücevherler
        for (const gem of this.gemItems) {
            if (gem.collected) continue;
            const bobY = Math.sin(gem.bobPhase) * 4;
            const glow = 0.5 + Math.sin(gem.bobPhase) * 0.3;

            ctx.shadowColor = `rgba(77, 150, 255, ${glow * 0.8})`;
            ctx.shadowBlur = 30;

            ctx.fillStyle = '#4d96ff';
            ctx.beginPath();
            ctx.moveTo(gem.x + gem.width / 2, gem.y + bobY);
            ctx.lineTo(gem.x + gem.width, gem.y + gem.height / 2 + bobY);
            ctx.lineTo(gem.x + gem.width / 2, gem.y + gem.height + bobY);
            ctx.lineTo(gem.x, gem.y + gem.height / 2 + bobY);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.moveTo(gem.x + gem.width / 2, gem.y + 4 + bobY);
            ctx.lineTo(gem.x + gem.width / 2 + 4, gem.y + gem.height / 2 + bobY);
            ctx.lineTo(gem.x + gem.width / 2, gem.y + gem.height - 4 + bobY);
            ctx.lineTo(gem.x + gem.width / 2 - 4, gem.y + gem.height / 2 + bobY);
            ctx.closePath();
            ctx.fill();
        }

        // Power-uplar
        for (const powerup of this.powerups) {
            if (powerup.collected) continue;
            const bobY = Math.sin(powerup.bobPhase) * 5;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
            ctx.shadowBlur = 15;

            const colors = { health: '#ff6b6b', speed: '#5bff6b', shield: '#4d96ff' };
            const color = colors[powerup.type] || '#ffffff';

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 + Math.sin(powerup.bobPhase) * 0.1;
            ctx.beginPath();
            ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2 + bobY, powerup.width, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;

            const icons = { health: '❤️', speed: '⚡', shield: '🛡️' };
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 0;
            ctx.fillText(icons[powerup.type] || '?', powerup.x + powerup.width / 2, powerup.y + powerup.height / 2 + bobY);
        }

        // Düşmanlar
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            const color = enemy.color || '#ff6b6b';
            const isHit = enemy.hitTimer > 0;

            const grad = ctx.createRadialGradient(
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 - 5, 3,
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2
            );
            grad.addColorStop(0, isHit ? '#ffffff' : color);
            grad.addColorStop(0.5, isHit ? '#ff6b6b' : this.darkenColor(color, 0.7));
            grad.addColorStop(1, this.darkenColor(color, 0.4));
            ctx.fillStyle = grad;
            ctx.shadowColor = `rgba(255, 0, 0, 0.3)`;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Gözler
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 - 6 + enemy.direction * 2, enemy.y + enemy.height / 2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 + 6 + enemy.direction * 2, enemy.y + enemy.height / 2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 - 4 + enemy.direction * 4, enemy.y + enemy.height / 2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2 + 8 + enemy.direction * 4, enemy.y + enemy.height / 2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + 6, 5, 0, Math.PI);
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

            if (enemy.isChasing) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width + 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // BOSS
        if (this.isBossLevel && this.boss && this.boss.alive) {
            const boss = this.boss;
            const isHit = boss.hitTimer > 0;

            // Boss gölgesi
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(boss.x + boss.width / 2, boss.y + boss.height + 10, boss.width / 2 + 10, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Boss gövdesi
            const grad = ctx.createRadialGradient(
                boss.x + boss.width / 2, boss.y + boss.height / 2 - 10, 10,
                boss.x + boss.width / 2, boss.y + boss.height / 2, boss.width / 2
            );
            grad.addColorStop(0, isHit ? '#ffffff' : boss.color);
            grad.addColorStop(0.5, isHit ? '#ff6b6b' : this.darkenColor(boss.color, 0.7));
            grad.addColorStop(1, this.darkenColor(boss.color, 0.3));
            ctx.fillStyle = grad;
            ctx.shadowColor = `rgba(255, 0, 0, 0.5)`;
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Boss ismi
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`👾 ${boss.name}`, boss.x + boss.width / 2, boss.y - 10);

            // Faz göstergesi
            const phaseText = boss.phase === 0 ? 'FAZ 1' : boss.phase === 1 ? '⚡ FAZ 2' : '💀 FAZ 3';
            const phaseColor = boss.phase === 0 ? '#6bcb77' : boss.phase === 1 ? '#ffd93d' : '#ff4444';
            ctx.fillStyle = phaseColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(phaseText, boss.x + boss.width / 2, boss.y + boss.height + 5);

            // Boss gözleri
            const eyeSize = 12;
            const eyeY = boss.y + boss.height / 2 - 10;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2 - 18, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2 + 18, eyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Gözbebekleri
            const pupilOffset = boss.direction * 4;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2 - 18 + pupilOffset, eyeY + 2, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2 + 18 + pupilOffset, eyeY + 2, 5, 0, Math.PI * 2);
            ctx.fill();

            // Ağız
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2 + 15, 15, 0, Math.PI);
            ctx.stroke();

            // Dişler
            ctx.fillStyle = '#ffffff';
            for (let i = -12; i <= 12; i += 6) {
                ctx.fillRect(boss.x + boss.width / 2 + i - 1, boss.y + boss.height / 2 + 15, 3, 6);
            }

            // Saldırı hazırlık göstergesi
            if (boss.isAttacking) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, 70, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
                ctx.beginPath();
                ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, 100, 0, Math.PI * 2);
                ctx.fill();
            }

            // Boss saldırıları
            for (const attack of this.bossAttacks) {
                ctx.fillStyle = attack.color || '#ff6600';
                ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(attack.x, attack.y, attack.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(attack.x - 3, attack.y - 3, attack.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Çıkış
        if (this.exit) {
            const isComplete = this.goldCollected >= this.totalGold;
            const pulse = 0.8 + Math.sin(this.time * 3) * 0.2;

            const bossAlive = this.isBossLevel && this.boss && this.boss.alive;

            ctx.save();
            ctx.globalAlpha = bossAlive ? 0.3 : (0.15 * pulse);
            const grad2 = ctx.createRadialGradient(
                this.exit.x + this.exit.width / 2, this.exit.y + this.exit.height / 2, 10,
                this.exit.x + this.exit.width / 2, this.exit.y + this.exit.height / 2, 80
            );
            const glowColor = isComplete && !bossAlive ? 'rgba(100, 255, 100, 0.8)' : 'rgba(100, 200, 255, 0.8)';
            grad2.addColorStop(0, glowColor);
            grad2.addColorStop(1, isComplete && !bossAlive ? 'rgba(100, 255, 100, 0)' : 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(this.exit.x - 50, this.exit.y - 50, this.exit.width + 100, this.exit.height + 100);
            ctx.restore();

            const doorColor = isComplete && !bossAlive ? '#6bcb77' : (bossAlive ? '#666666' : '#4d96ff');
            ctx.fillStyle = doorColor;
            ctx.shadowColor = isComplete && !bossAlive ? 'rgba(107, 203, 119, 0.6)' : 'rgba(77, 150, 255, 0.4)';
            ctx.shadowBlur = isComplete && !bossAlive ? 40 : 25;
            ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width / 2, this.exit.y, this.exit.width / 2, Math.PI, 0);
            ctx.fill();

            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(this.exit.x + this.exit.width - 10, this.exit.y + this.exit.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            if (isComplete && !bossAlive) {
                ctx.fillStyle = 'rgba(107, 203, 119, 0.8)';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('✅ TAMAM', this.exit.x + this.exit.width / 2, this.exit.y - 10);
            } else if (bossAlive) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('👾 Önce Boss!', this.exit.x + this.exit.width / 2, this.exit.y - 10);
            }

            ctx.fillStyle = isComplete && !bossAlive ? 'rgba(107, 203, 119, 0.1)' : 'rgba(100, 200, 255, 0.08)';
            ctx.fillRect(this.exit.x + 10, this.exit.y - 40, this.exit.width - 20, 40);
        }

        // Oyuncu
        if (this.player) {
            const p = this.player;

            // Gölge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(p.x + p.width / 2, p.y + p.height + 6, p.width / 2 + 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Kalkan efekti
            if (p.shield) {
                ctx.strokeStyle = 'rgba(77, 150, 255, 0.6)';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(77, 150, 255, 0.4)';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Hız artışı efekti
            if (p.speedBoost) {
                ctx.fillStyle = 'rgba(91, 255, 107, 0.1)';
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width + 12, 0, Math.PI * 2);
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
            let emoji = this.characters[p.character]?.emoji || '⚔️';

            // Skin kontrolü
            if (this.activeSkin) {
                const skinItem = this.shopItems[this.activeSkin];
                if (skinItem && skinItem.type === 'skin') {
                    emoji = skinItem.emoji;
                }
            }

            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, p.x + p.width / 2, p.y + p.height / 2 - 2);

            // Gözler
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

            // Dash efekti
            if (p.isDashing) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width + 6, 0, Math.PI * 2);
                ctx.fill();

                for (let i = 1; i <= 3; i++) {
                    const alpha = 0.1 - i * 0.03;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fillRect(p.x - p.facing * i * 15, p.y, p.width, p.height);
                }
            }
        }

        // İz partikülleri
        for (const tp of this.trailParticles) {
            ctx.globalAlpha = tp.life;
            ctx.fillStyle = tp.color;
            ctx.shadowColor = tp.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, tp.radius * tp.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;

        // Partiküller
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

        // Yüzen yazılar
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

        // Alt bilgi
        if (this.state === 'playing') {
            const remaining = this.totalGold - this.goldCollected;
            if (remaining > 0) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
                ctx.font = '13px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`⭐ Kalan Altın: ${remaining}`, this.canvas.width / 2, this.canvas.height - 15);
            }

            if (this.comboCount > 1) {
                ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(this.time * 5) * 0.2})`;
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`🔥 ${this.comboCount}x Combo!`, this.canvas.width - 20, this.canvas.height - 15);
            }

            const levelInfo = this.isBossLevel ? '👾 BOSS SAVAŞI' : `📊 Bölüm ${this.currentLevel}/${this.maxLevel}`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(levelInfo, 15, this.canvas.height - 15);
        }
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
        // İsim sistemi
        this.setupNameSystem();

        // Ana Menü
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.resetGame();
            this.loadLevel(this.currentLevel);
        });

        document.getElementById('continueGameBtn').addEventListener('click', () => {
            this.loadGame();
            this.loadLevel(this.saveData.level || 1);
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

        document.getElementById('charColorPicker').addEventListener('input', (e) => {
            this.charColor = e.target.value;
            if (this.player) {
                this.player.color = this.charColor;
            }
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            if (this.difficulty === 'hard' || this.difficulty === 'nightmare') {
                return;
            }
            this.speedMultiplier = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speedMultiplier;
            if (this.player) {
                const char = this.characters[this.selectedCharacter];
                this.player.speed = char.speed * (this.speedMultiplier / 3);
            }
        });

        document.getElementById('deleteSaveBtn').addEventListener('click', () => {
            if (confirm('Tüm kayıtlarınız silinecek. Devam etmek istediğinize emin misiniz?')) {
                this.deleteSave();
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
            this.saveGame();
        });

        // Bölüm Tamamlama
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            document.getElementById('levelComplete').classList.remove('active');
            this.currentLevel++;
            this.saveGame();
            this.loadLevel(this.currentLevel);
        });

        document.getElementById('levelCompleteMenuBtn').addEventListener('click', () => {
            document.getElementById('levelComplete').classList.remove('active');
            this.state = 'menu';
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
            this.saveGame();
        });

        // Boss Yenildi
        document.getElementById('bossNextBtn').addEventListener('click', () => {
            document.getElementById('bossDefeated').classList.remove('active');
            this.currentLevel++;
            this.saveGame();
            this.loadLevel(this.currentLevel);
        });

        document.getElementById('bossMenuBtn').addEventListener('click', () => {
            document.getElementById('bossDefeated').classList.remove('active');
            this.state = 'menu';
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
            this.saveGame();
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
    // KLAVYE
    // ============================================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            switch (e.key) {
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

            switch (e.key) {
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
        this.saveGame();

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalGold').textContent = this.goldCollected;
        document.getElementById('finalGems').textContent = this.gemsCollected;
        document.getElementById('finalCombo').textContent = this.maxCombo;
        document.getElementById('finalTime').textContent = Math.round(this.time);
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('levelComplete').classList.add('active');

        for (let i = 0; i < 80; i++) {
            const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9f43'];
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 100;
            const x = this.exit.x + this.exit.width / 2 + Math.cos(angle) * dist;
            const y = this.exit.y + this.exit.height / 2 + Math.sin(angle) * dist;
            this.spawnParticles(x, y, colors[Math.floor(Math.random() * colors.length)], 3);
        }
    }

    showBossDefeated() {
        this.state = 'levelComplete';
        this.playSound('boss_defeated');
        this.saveGame();

        document.getElementById('bossScore').textContent = this.score;
        document.getElementById('bossGold').textContent = this.goldCollected;
        document.getElementById('bossGems').textContent = this.gemsCollected;
        document.getElementById('bossDefeated').classList.add('active');

        for (let i = 0; i < 120; i++) {
            const colors = ['#ffd93d', '#ff6b6b', '#4d96ff', '#6bcb77', '#ff6bff', '#ff9f43', '#ff4444'];
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 150;
            const x = this.boss.x + this.boss.width / 2 + Math.cos(angle) * dist;
            const y = this.boss.y + this.boss.height / 2 + Math.sin(angle) * dist;
            this.spawnParticles(x, y, colors[Math.floor(Math.random() * colors.length)], 4);
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

    showWinScreen() {
        this.state = 'levelComplete';
        this.playSound('complete');
        this.saveGame();

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalGold').textContent = this.totalGoldCollected;
        document.getElementById('finalGems').textContent = this.totalGemsCollected;
        document.getElementById('finalCombo').textContent = this.maxCombo;
        document.getElementById('finalTime').textContent = Math.round(this.time);
        document.getElementById('finalLevel').textContent = '🏆 TAMAMLANDI!';
        document.getElementById('levelComplete').classList.add('active');

        for (let i = 0; i < 150; i++) {
            const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9f43'];
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 200;
            const x = this.canvas.width / 2 + Math.cos(angle) * dist;
            const y = this.canvas.height / 2 + Math.sin(angle) * dist;
            this.spawnParticles(x, y, colors[Math.floor(Math.random() * colors.length)], 3);
        }

        document.getElementById('nextLevelBtn').textContent = '🎮 Tekrar Oyna';
        document.getElementById('nextLevelBtn').onclick = () => {
            document.getElementById('levelComplete').classList.remove('active');
            this.currentLevel = 1;
            this.resetGame();
            this.loadLevel(1);
        };
    }

    resetGame() {
        this.score = 0;
        this.health = this.maxHealth;
        this.currentLevel = 1;
        this.goldCollected = 0;
        this.gemsCollected = 0;
        this.time = 0;
        this.particles = [];
        this.trailParticles = [];
        this.comboCount = 0;
        this.maxCombo = 0;
        this.totalKills = 0;
        this.totalGoldCollected = 0;
        this.totalGemsCollected = 0;
        this.floatingTexts = [];
        this.boss = null;
        this.bossAttacks = [];
        this.bossDefeated = false;
        this.isBossLevel = false;
        this.bossIntroActive = false;
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
console.log('🔥 50 bölüm, 10 boss, 6 karakter, mağaza, mini-map, isim sistemi!');
console.log('💪 İyi eğlenceler!');

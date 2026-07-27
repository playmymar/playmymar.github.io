/**
 * MYMAR - Profesyonel Web Oyunu
 * @version 1.0
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
        this.state = 'menu'; // menu, playing, paused, levelComplete, gameOver
        this.currentLevel = 1;
        this.maxLevel = 3;
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.goldCollected = 0;
        this.totalGold = 0;
        this.time = 0;
        this.difficulty = 'normal';
        
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
        this.enemies = [];
        this.particles = [];
        this.exit = null;
        
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
        
        // Bölüm verileri
        this.levels = this.generateLevels();
        
        // Başlangıç
        this.init();
    }
    
    // ============================================================
    // BAŞLANGIÇ
    // ============================================================
    init() {
        // Canvas boyutlandırma
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Klavye olayları
        this.setupKeyboard();
        
        // UI olayları
        this.setupUI();
        
        // Ses sistemi
        this.initAudio();
        
        // Oyun döngüsü
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        console.log('MYMAR Oyunu başlatıldı!');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }
    
    // ============================================================
    // SES SİSTEMİ
    // ============================================================
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Ses desteği yok');
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
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                    break;
                case 'collect':
                    osc.frequency.value = 600;
                    gain.gain.value = 0.15;
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;
                case 'damage':
                    osc.frequency.value = 150;
                    gain.gain.value = 0.2;
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                case 'complete':
                    osc.frequency.value = 800;
                    gain.gain.value = 0.15;
                    osc.start();
                    setTimeout(() => {
                        osc.frequency.value = 1000;
                    }, 100);
                    osc.stop(this.audioContext.currentTime + 0.3);
                    break;
                case 'gameover':
                    osc.frequency.value = 200;
                    gain.gain.value = 0.2;
                    osc.start();
                    setTimeout(() => {
                        osc.frequency.value = 100;
                    }, 200);
                    osc.stop(this.audioContext.currentTime + 0.5);
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
        return [
            // Bölüm 1 - Başlangıç
            {
                platforms: [
                    { x: 0, y: 550, width: 200, height: 30 },
                    { x: 250, y: 500, width: 150, height: 30 },
                    { x: 450, y: 450, width: 150, height: 30 },
                    { x: 650, y: 500, width: 200, height: 30 },
                    { x: 900, y: 550, width: 300, height: 30 },
                ],
                gold: [
                    { x: 280, y: 460 },
                    { x: 490, y: 410 },
                    { x: 700, y: 460 },
                    { x: 950, y: 510 },
                    { x: 1100, y: 510 },
                ],
                enemies: [
                    { x: 400, y: 420, range: 100, speed: 1 },
                    { x: 700, y: 470, range: 80, speed: 1.2 },
                ],
                exit: { x: 1150, y: 500 },
                totalGold: 5
            },
            // Bölüm 2 - Orta
            {
                platforms: [
                    { x: 0, y: 550, width: 150, height: 30 },
                    { x: 200, y: 480, width: 120, height: 30 },
                    { x: 370, y: 420, width: 120, height: 30 },
                    { x: 540, y: 480, width: 120, height: 30 },
                    { x: 710, y: 420, width: 120, height: 30 },
                    { x: 880, y: 480, width: 120, height: 30 },
                    { x: 1050, y: 550, width: 200, height: 30 },
                    { x: 200, y: 350, width: 100, height: 20 },
                    { x: 540, y: 350, width: 100, height: 20 },
                    { x: 880, y: 350, width: 100, height: 20 },
                ],
                gold: [
                    { x: 240, y: 440 },
                    { x: 410, y: 380 },
                    { x: 580, y: 440 },
                    { x: 750, y: 380 },
                    { x: 920, y: 440 },
                    { x: 240, y: 310 },
                    { x: 580, y: 310 },
                    { x: 920, y: 310 },
                ],
                enemies: [
                    { x: 300, y: 450, range: 120, speed: 1.5 },
                    { x: 600, y: 450, range: 100, speed: 1.3 },
                    { x: 900, y: 450, range: 80, speed: 1.8 },
                ],
                exit: { x: 1170, y: 500 },
                totalGold: 8
            },
            // Bölüm 3 - Zor
            {
                platforms: [
                    { x: 0, y: 550, width: 120, height: 30 },
                    { x: 170, y: 480, width: 100, height: 30 },
                    { x: 320, y: 410, width: 100, height: 30 },
                    { x: 470, y: 480, width: 100, height: 30 },
                    { x: 620, y: 410, width: 100, height: 30 },
                    { x: 770, y: 480, width: 100, height: 30 },
                    { x: 920, y: 410, width: 100, height: 30 },
                    { x: 1070, y: 480, width: 100, height: 30 },
                    { x: 1220, y: 550, width: 150, height: 30 },
                    { x: 300, y: 330, width: 80, height: 20 },
                    { x: 650, y: 330, width: 80, height: 20 },
                    { x: 1000, y: 330, width: 80, height: 20 },
                ],
                gold: [
                    { x: 210, y: 440 },
                    { x: 360, y: 370 },
                    { x: 510, y: 440 },
                    { x: 660, y: 370 },
                    { x: 810, y: 440 },
                    { x: 960, y: 370 },
                    { x: 1110, y: 440 },
                    { x: 340, y: 290 },
                    { x: 690, y: 290 },
                    { x: 1040, y: 290 },
                ],
                enemies: [
                    { x: 250, y: 450, range: 130, speed: 2 },
                    { x: 500, y: 450, range: 110, speed: 1.8 },
                    { x: 750, y: 450, range: 120, speed: 2.2 },
                    { x: 1000, y: 450, range: 100, speed: 1.5 },
                ],
                exit: { x: 1300, y: 500 },
                totalGold: 10
            }
        ];
    }
    
    // ============================================================
    // BÖLÜM YÜKLEME
    // ============================================================
    loadLevel(levelIndex) {
        const level = this.levels[levelIndex - 1];
        if (!level) {
            this.showLevelComplete();
            return;
        }
        
        this.currentLevel = levelIndex;
        this.goldCollected = 0;
        this.totalGold = level.totalGold;
        this.time = 0;
        
        // Oyuncu oluştur
        this.player = {
            x: 50,
            y: 500,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            onGround: false,
            facing: 1,
            jumping: false,
            speed: 5,
            jumpPower: 12
        };
        
        // Platformları kopyala
        this.platforms = level.platforms.map(p => ({...p}));
        
        // Altınları kopyala
        this.goldItems = level.gold.map(g => ({
            ...g,
            width: 20,
            height: 20,
            collected: false,
            bobPhase: Math.random() * Math.PI * 2
        }));
        
        // Düşmanları kopyala
        this.enemies = level.enemies.map(e => ({
            ...e,
            width: 25,
            height: 25,
            startX: e.x,
            direction: 1,
            alive: true
        }));
        
        // Çıkışı kopyala
        this.exit = {...level.exit, width: 40, height: 40};
        
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
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('levelComplete').classList.remove('active');
        document.getElementById('gameOver').classList.remove('active');
        
        this.playSound('collect');
    }
    
    // ============================================================
    // OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        // Delta time hesapla
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;
        
        // Oyunu güncelle
        if (this.state === 'playing') {
            this.update();
        }
        
        // Render
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
        
        // Oyuncu güncelle
        this.updatePlayer();
        
        // Altınları güncelle
        this.updateGold();
        
        // Düşmanları güncelle
        this.updateEnemies();
        
        // Partikülleri güncelle
        this.updateParticles();
        
        // Çıkış kontrolü
        this.checkExit();
        
        // Kamerayı güncelle
        this.updateCamera();
        
        // HUD'ı güncelle
        this.updateHUD();
    }
    
    // ============================================================
    // OYUNCU FİZİK
    // ============================================================
    updatePlayer() {
        const p = this.player;
        const speed = p.speed * (1 + (this.difficulty === 'hard' ? 0.2 : 0));
        
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
            this.spawnP

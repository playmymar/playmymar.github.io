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
            this.spawnParticles(p.x + p.width/2, p.y + p.height, '#ff6b6b', 8);
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
        if (p.x > 2000) p.x = 2000;
        
        // Düşme kontrolü
        if (p.y > 700) {
            this.takeDamage(100);
        }
        
        // Zıplama flag'i
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
        
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            
            // Altın animasyonu
            gold.bobPhase += 0.05;
            const bobY = Math.sin(gold.bobPhase) * 3;
            
            // Çarpışma kontrolü
            if (p.x + p.width > gold.x + 2 &&
                p.x < gold.x + gold.width - 2 &&
                p.y + p.height > gold.y + bobY + 2 &&
                p.y < gold.y + bobY + gold.height - 2) {
                
                gold.collected = true;
                this.goldCollected++;
                this.score += 10 + (this.difficulty === 'hard' ? 5 : 0);
                this.playSound('collect');
                this.spawnParticles(gold.x + gold.width/2, gold.y + gold.height/2, '#ffd93d', 15);
            }
        }
    }
    
    // ============================================================
    // DÜŞMANLAR
    // ============================================================
    updateEnemies() {
        const p = this.player;
        
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            // Düşman hareketi
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
                
                // Üstten vurma
                if (p.vy > 0 && p.y + p.height - enemy.y < 20) {
                    enemy.alive = false;
                    this.score += 20;
                    this.playSound('collect');
                    this.spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#6bcb77', 20);
                    p.vy = -8;
                } else {
                    this.takeDamage(20);
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
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                radius: 3 + Math.random() * 4,
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
        const e = this.exit;
        
        if (p.x + p.width > e.x + 2 &&
            p.x < e.x + e.width - 2 &&
            p.y + p.height > e.y + 2 &&
            p.y < e.y + e.height - 2) {
            
            // Tüm altınlar toplandı mı?
            if (this.goldCollected >= this.totalGold) {
                this.showLevelComplete();
            } else {
                // Eksik altın var, uyarı
                this.spawnParticles(e.x + e.width/2, e.y, '#ff6b6b', 10);
            }
        }
    }
    
    // ============================================================
    // KAMERA
    // ============================================================
    updateCamera() {
        const p = this.player;
        const targetX = p.x - this.canvas.width * 0.35;
        const targetY = p.y - this.canvas.height * 0.4;
        
        this.camera.x += (targetX - this.camera.x) * 0.08;
        this.camera.y += (targetY - this.camera.y) * 0.08;
        
        // Kamera sınırları
        this.camera.x = Math.max(0, this.camera.x);
        this.camera.y = Math.max(0, this.camera.y);
    }
    
    // ============================================================
    // HASAR SİSTEMİ
    // ============================================================
    takeDamage(amount) {
        this.health -= amount;
        this.playSound('damage');
        this.spawnParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff6b6b', 15);
        
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
        document.getElementById('levelDisplay').textContent = `Bölüm ${this.currentLevel}`;
        document.getElementById('objectiveDisplay').textContent = `Altınları Topla: ${this.goldCollected}/${this.totalGold}`;
    }
    
    // ============================================================
    // RENDER
    // ============================================================
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Arka plan
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#1a1a4e');
        gradient.addColorStop(1, '#2a1a3e');
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
            ctx.shadowColor = 'rgba(74, 74, 138, 0.5)';
            ctx.shadowBlur = 15;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.shadowBlur = 0;
            
            // Platform üst çizgisi
            ctx.fillStyle = 'rgba(100, 100, 200, 0.3)';
            ctx.fillRect(plat.x, plat.y, plat.width, 3);
        }
        
        // Altınlar
        for (const gold of this.goldItems) {
            if (gold.collected) continue;
            const bobY = Math.sin(gold.bobPhase) * 3;
            
            // Parlama efekti
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
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            // Düşman gövdesi
            const grad = ctx.createRadialGradient(
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, 5,
                enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2
            );
            grad.addColorStop(0, '#ff6b6b');
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
            ctx.arc(enemy.x + enemy.width/2 - 5 + enemy.direction * 2, enemy.y + enemy.height/2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 5 + enemy.direction * 2, enemy.y + enemy.height/2 - 4, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 - 3 + enemy.direction * 4, enemy.y + enemy.height/2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(enemy.x + enemy.width/2 + 7 + enemy.direction * 4, enemy.y + enemy.height/2 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Çıkış
        if (this.exit) {
            // Işık hüzmesi
            ctx.save();
            ctx.globalAlpha = 0.2 + Math.sin(this.time * 2) * 0.1;
            const grad2 = ctx.createRadialGradient(
                this.exit.x + this.exit.width/2, this.exit.y, 10,
                this.exit.x + this.exit.width/2, this.exit.y, 60
            );
            grad2.addColorStop(0, 'rgba(100, 200, 255, 0.5)');
            grad2.addColorStop(1, 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(this.exit.x - 40, this.exit.y - 40, this.exit.width + 80, this.exit.height + 80);
            ctx.restore();
            
            // Kapı
            ctx.fillStyle = '#4d96ff';
            ctx.shadowColor = 'rgba(77, 150, 255, 0.3)';
            ctx.shadowBlur = 20;
            ctx.fillRect(this.exit.x, this.exit.y, this.exit.width, this.exit.height);
            ctx.shadowBlur = 0;
            
            // Kapı detayları
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(this.exit.x + 10, this.exit.y + 10, 8, 20);
            ctx.fillRect(this.exit.x + this.exit.width - 18, this.exit.y + 10, 8, 20);
            
            // Işık
            ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
            ctx.fillRect(this.exit.x + 15, this.exit.y - 20, 10, 20);
        }
        
        // Oyuncu
        if (this.player) {
            const p = this.player;
            
            // Gölge
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(p.x + p.width/2, p.y + p.height + 5, p.width/2 + 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Gövde
            const grad3 = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
            grad3.addColorStop(0, '#6bcb77');
            grad3.addColorStop(1, '#2d8a4e');
            ctx.fillStyle = grad3;
            ctx.shadowColor = 'rgba(107, 203, 119, 0.3)';
            ctx.shadowBlur = 10;
            
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
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        
        ctx.restore();
        
        // Altın toplama bilgisi
        if (this.state === 'playing' && this.goldCollected < this.totalGold) {
            const remaining = this.totalGold - this.goldCollected;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`⭐ Kalan Altın: ${remaining}`, this.canvas.width / 2, this.canvas.height - 30);
        }
    }
    
    renderStars(ctx) {
        // Yıldızlar sabit (kamera hareketinden etkilenmez)
        const starCount = 60;
        const seed = 12345;
        for (let i = 0; i < starCount; i++) {
            const x = ((i * 137.508) % this.canvas.width);
            const y = ((i * 269.361) % (this.canvas.height * 0.7));
            const size = ((i * 73) % 3) + 1;
            const alpha = 0.3 + ((i * 43) % 7) / 10;
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
        });
        
        // Nasıl Oynanır
        document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
            document.getElementById('howToPlayMenu').classList.remove('active');
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
        
        // Mobil dokunmatik kontroller (basit)
        let touchX = 0;
        let touchY = 0;
        let touchActive = false;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            touchX = touch.clientX - rect.left;
            touchY = touch.clientY - rect.top;
            touchActive = true;
            
            // Ekranın sol yarısı sol, sağ yarısı sağ, yukarısı zıplama
            if (touchY < rect.height * 0.4) {
                this.input.jump = true;
            } else if (touchX < rect.width * 0.4) {
                this.input.left = true;
            } else if (touchX > rect.width * 0.6) {
                this.input.right = true;
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const newX = touch.clientX - rect.left;
            const newY = touch.clientY - rect.top;
            
            // Sürükleyerek kontrol
            const dx = newX - touchX;
            const dy = newY - touchY;
            
            if (Math.abs(dx) > 20) {
                this.input.left = dx < 0;
                this.input.right = dx > 0;
            }
            
            if (dy < -20) {
                this.input.jump = true;
            }
            
            touchX = newX;
            touchY = newY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchActive = false;
            this.input.left = false;
            this.input.right = false;
            this.input.jump = false;
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
        document.getElementById('finalTime').textContent = Math.round(this.time);
        document.getElementById('levelComplete').classList.add('active');
        
        // Altın patlaması
        for (let i = 0; i < 30; i++) {
            this.spawnParticles(
                this.exit.x + this.exit.width/2,
                this.exit.y + this.exit.height/2,
                ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff'][Math.floor(Math.random() * 4)],
                5
            );
        }
    }
    
    showGameOver() {
        this.state = 'gameOver';
        this.playSound('gameover');
        document.getElementById('gameOverScore').textContent = this.score;
        document.getElementById('gameOverLevel').textContent = this.currentLevel;
        document.getElementById('gameOver').classList.add('active');
    }
    
    resetGame() {
        this.score = 0;
        this.health = this.maxHealth;
        this.currentLevel = 1;
        this.goldCollected = 0;
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
    console.error('Oyun hatası:', e.message);
});

// PWA için service worker kaydı (isteğe bağlı)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
                }

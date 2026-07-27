/**
 * MYMAR - 3D FPS Oyunu
 * Krunker.io tarzı, 3D model kullanmadan 3D görünümlü
 * @version 2.0
 */

// ============================================================
// OYUN ANA SINIFI
// ============================================================
class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Boyutlar
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Oyun durumu
        this.state = 'menu';
        this.score = 0;
        this.kills = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.wave = 1;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.isReloading = false;
        this.reloadTime = 0;
        this.shootCooldown = 0;
        
        // Oyuncu pozisyonu (3D alanda)
        this.player = {
            x: 0,
            y: 0,
            z: 0,
            rotX: 0, // Yatay bakış
            rotY: 0, // Dikey bakış
            height: 1.7,
            speed: 0.08,
            jumping: false,
            jumpVel: 0,
            onGround: true
        };
        
        // Silahlar
        this.weapons = {
            pistol: { name: 'Tabanca', damage: 25, ammo: 12, maxAmmo: 12, fireRate: 200, reloadTime: 1000, spread: 0.03 },
            rifle: { name: 'Tüfek', damage: 35, ammo: 30, maxAmmo: 30, fireRate: 100, reloadTime: 1500, spread: 0.05 },
            shotgun: { name: 'Pompalı', damage: 15, ammo: 8, maxAmmo: 8, fireRate: 400, reloadTime: 2000, spread: 0.15 }
        };
        this.currentWeapon = 'rifle';
        this.weaponIndex = 0;
        this.weaponList = ['pistol', 'rifle', 'shotgun'];
        
        // Dünyadaki nesneler
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.pickups = [];
        this.walls = [];
        
        // 3D render ayarları
        this.fov = 90;
        this.near = 0.1;
        this.far = 100;
        
        // Giriş
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false, rightDown: false };
        this.isPointerLocked = false;
        
        // Ayarlar
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sensitivity = 5;
        this.crosshairType = 'cross';
        this.highScore = parseInt(localStorage.getItem('mymar_highscore')) || 0;
        
        // Zaman
        this.lastTime = 0;
        this.deltaTime = 0;
        this.time = 0;
        this.enemySpawnTimer = 0;
        this.maxEnemies = 8;
        
        // Ses
        this.audioContext = null;
        
        // Başlat
        this.init();
    }
    
    // ============================================================
    // BAŞLANGIÇ
    // ============================================================
    init() {
        this.setupKeyboard();
        this.setupMouse();
        this.setupUI();
        this.initAudio();
        this.updateHighScore();
        
        // Demo dünya oluştur
        this.generateWorld();
        
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        console.log('MYMAR FPS başlatıldı!');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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
                case 'shoot':
                    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.05);
                    break;
                case 'reload':
                    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
                    osc.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.2);
                    break;
                case 'hit':
                    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                    break;
                case 'kill':
                    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
                    osc.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.15);
                    break;
                case 'damage':
                    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.1);
                    break;
            }
        } catch(e) {}
    }
    
    // ============================================================
    // DÜNYA OLUŞTURMA
    // ============================================================
    generateWorld() {
        // Duvarlar (arenanın sınırları)
        const wallHeight = 2;
        this.walls = [
            { x: -15, z: -15, w: 30, d: 0.5 }, // Arka
            { x: -15, z: 15, w: 30, d: 0.5 },  // Ön
            { x: -15, z: -15, w: 0.5, d: 30 }, // Sol
            { x: 15, z: -15, w: 0.5, d: 30 },  // Sağ
        ];
        
        // Engel kutuları (3D görünüm)
        const boxPositions = [
            [-5, -4], [3, -6], [-3, 7], [8, 2], [-8, -2], [2, 4], [-6, 6], [7, -5], [0, 0]
        ];
        
        for (const [x, z] of boxPositions) {
            const size = 1 + Math.random() * 0.8;
            this.walls.push({
                x: x,
                z: z,
                w: size,
                d: size,
                height: 0.5 + Math.random() * 1.5,
                color: `hsl(${Math.random() * 60 + 200}, 30%, ${20 + Math.random() * 20}%)`
            });
        }
    }
    
    // ============================================================
    // DÜŞMAN OLUŞTURMA
    // ============================================================
    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 12;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        // Oyuncunun yakınında spawn olmasın
        if (Math.abs(x) < 3 && Math.abs(z) < 3) return;
        
        const health = 30 + this.wave * 5;
        this.enemies.push({
            x: x,
            z: z,
            health: health,
            maxHealth: health,
            speed: 0.02 + this.wave * 0.002,
            size: 0.5,
            attackCooldown: 0,
            attackRange: 1.5,
            damage: 10 + this.wave * 2,
            state: 'idle', // idle, chase, attack
            stateTimer: 0,
            color: `hsl(${Math.random() * 40 + 350}, 70%, 50%)`,
            eyeAngle: 0,
            hitFlash: 0
        });
    }
    
    // ============================================================
    // KLAVYE & MOUSE
    // ============================================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'r' && this.state === 'playing') {
                this.startReload();
            }
            
            if (e.key >= '1' && e.key <= '3' && this.state === 'playing') {
                const idx = parseInt(e.key) - 1;
                if (idx < this.weaponList.length) {
                    this.switchWeapon(idx);
                }
            }
            
            if (e.key === 'Escape') {
                if (this.state === 'playing') {
                    this.togglePause();
                } else if (this.state === 'paused') {
                    this.togglePause();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupMouse() {
        // Pointer lock
        this.canvas.addEventListener('click', () => {
            if (this.state === 'playing' && !document.pointerLockElement) {
                this.canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (!this.isPointerLocked && this.state === 'playing') {
                // Mouse çıktı ama oyun devam ediyor
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || this.state !== 'playing') return;
            
            const sens = this.sensitivity / 100;
            this.player.rotX -= e.movementX * sens * 0.05;
            this.player.rotY -= e.movementY * sens * 0.05;
            this.player.rotY = Math.max(-1.2, Math.min(1.2, this.player.rotY));
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouse.down = true;
                if (this.state === 'playing' && !this.isReloading) {
                    this.shoot();
                }
            }
            if (e.button === 2) {
                this.mouse.rightDown = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.down = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // ============================================================
    // SİLAH SİSTEMİ
    // ============================================================
    switchWeapon(index) {
        if (index === this.weaponIndex) return;
        if (this.isReloading) return;
        
        this.weaponIndex = index;
        this.currentWeapon = this.weaponList[index];
        const weapon = this.weapons[this.currentWeapon];
        this.ammo = weapon.maxAmmo;
        this.updateHUD();
    }
    
    startReload() {
        if (this.isReloading) return;
        const weapon = this.weapons[this.currentWeapon];
        if (this.ammo >= weapon.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTime = weapon.reloadTime;
        this.playSound('reload');
    }
    
    shoot() {
        if (this.isReloading) return;
        const weapon = this.weapons[this.currentWeapon];
        if (this.ammo <= 0) {
            this.startReload();
            return;
        }
        if (this.shootCooldown > 0) return;
        
        this.ammo--;
        this.shootCooldown = weapon.fireRate;
        this.playSound('shoot');
        
        // Mermi gönder
        const spread = weapon.spread;
        const count = this.currentWeapon === 'shotgun' ? 8 : 1;
        
        for (let i = 0; i < count; i++) {
            const angleX = (Math.random() - 0.5) * spread;
            const angleY = (Math.random() - 0.5) * spread;
            
            this.bullets.push({
                x: this.player.x,
                y: this.player.height - 0.3,
                z: this.player.z,
                dx: Math.sin(this.player.rotX + angleX) * Math.cos(this.player.rotY + angleY),
                dy: -Math.sin(this.player.rotY + angleY),
                dz: Math.cos(this.player.rotX + angleX) * Math.cos(this.player.rotY + angleY),
                life: 2,
                damage: weapon.damage,
                speed: 0.8
            });
        }
        
        // Mermi partikülü
        this.spawnParticles(
            this.player.x + Math.sin(this.player.rotX) * 0.5,
            this.player.height - 0.3,
            this.player.z + Math.cos(this.player.rotX) * 0.5,
            '#ffd93d', 3
        );
        
        if (this.ammo <= 0) {
            setTimeout(() => this.startReload(), 200);
        }
        
        this.updateHUD();
    }
    
    // ============================================================
    // ANA OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;
        this.time += this.deltaTime * 0.001;
        
        if (this.state === 'playing') {
            this.update();
            this.render();
        } else if (this.state === 'menu') {
            this.renderMenu();
        } else {
            this.render();
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    // ============================================================
    // GÜNCELLEME
    // ============================================================
    update() {
        // Soğuma süreleri
        if (this.shootCooldown > 0) this.shootCooldown -= this.deltaTime;
        if (this.reloadTime > 0 && this.isReloading) {
            this.reloadTime -= this.deltaTime;
            if (this.reloadTime <= 0) {
                const weapon = this.weapons[this.currentWeapon];
                this.ammo = weapon.maxAmmo;
                this.isReloading = false;
                this.updateHUD();
            }
        }
        
        // Oyuncu hareketi
        this.updatePlayer();
        
        // Düşman spawn
        this.enemySpawnTimer += this.deltaTime;
        if (this.enemySpawnTimer > 2000 / (1 + this.wave * 0.1)) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }
        
        // Düşmanları güncelle
        this.updateEnemies();
        
        // Mermileri güncelle
        this.updateBullets();
        
        // Partikülleri güncelle
        this.updateParticles();
        
        // HUD'ı güncelle
        this.updateHUD();
    }
    
    // ============================================================
    // OYUNCU HAREKETİ
    // ============================================================
    updatePlayer() {
        const p = this.player;
        const speed = p.speed * this.deltaTime;
        
        // Hareket yönü
        let dx = 0, dz = 0;
        if (this.keys['w'] || this.keys['arrowup']) {
            dx += Math.sin(p.rotX);
            dz += Math.cos(p.rotX);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            dx -= Math.sin(p.rotX);
            dz -= Math.cos(p.rotX);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            dx -= Math.cos(p.rotX);
            dz += Math.sin(p.rotX);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            dx += Math.cos(p.rotX);
            dz -= Math.sin(p.rotX);
        }
        
        // Normalize
        const len = Math.sqrt(dx*dx + dz*dz);
        if (len > 0) {
            dx /= len;
            dz /= len;
            p.x += dx * speed;
            p.z += dz * speed;
        }
        
        // Zıplama
        if ((this.keys[' '] || this.keys['space']) && p.onGround) {
            p.jumpVel = 0.15;
            p.onGround = false;
            p.jumping = true;
            this.playSound('jump');
        }
        
        // Yerçekimi
        p.jumpVel -= 0.006 * this.deltaTime;
        p.y += p.jumpVel * this.deltaTime;
        
        if (p.y <= 0) {
            p.y = 0;
            p.onGround = true;
            p.jumping = false;
        }
        
        // Sınırlar
        p.x = Math.max(-13, Math.min(13, p.x));
        p.z = Math.max(-13, Math.min(13, p.z));
    }
    
    // ============================================================
    // DÜŞMAN GÜNCELLEME
    // ============================================================
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Hit flash
            if (enemy.hitFlash > 0) enemy.hitFlash -= this.deltaTime * 0.05;
            
            // Mesafe
            const dx = this.player.x - enemy.x;
            const dz = this.player.z - enemy.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            // Düşman AI
            enemy.stateTimer += this.deltaTime;
            
            if (dist < enemy.attackRange) {
                enemy.state = 'attack';
                if (enemy.attackCooldown <= 0) {
                    // Saldır
                    this.takeDamage(enemy.damage);
                    enemy.attackCooldown = 1000;
                    this.playSound('damage');
                    this.spawnParticles(enemy.x, 0.5, enemy.z, '#ff6b6b', 10);
                }
            } else if (dist < 12) {
                enemy.state = 'chase';
                // Düşmana doğru hareket et
                const angle = Math.atan2(dx, dz);
                const speed = enemy.speed * this.deltaTime;
                enemy.x += Math.sin(angle) * speed;
                enemy.z += Math.cos(angle) * speed;
                enemy.eyeAngle = angle;
            } else {
                enemy.state = 'idle';
                // Rastgele hareket
                if (enemy.stateTimer > 2000) {
                    enemy.stateTimer = 0;
                    enemy.eyeAngle = Math.random() * Math.PI * 2;
                }
                const speed = enemy.speed * 0.3 * this.deltaTime;
                enemy.x += Math.sin(enemy.eyeAngle) * speed;
                enemy.z += Math.cos(enemy.eyeAngle) * speed;
            }
            
            // Saldırı cooldown
            if (enemy.attackCooldown > 0) enemy.attackCooldown -= this.deltaTime;
            
            // Sınırlar
            enemy.x = Math.max(-14, Math.min(14, enemy.x));
            enemy.z = Math.max(-14, Math.min(14, enemy.z));
            
            // Düşman öldü mü?
            if (enemy.health <= 0) {
                this.kills++;
                this.score += 10 + this.wave * 2;
                this.playSound('kill');
                this.spawnParticles(enemy.x, 0.5, enemy.z, enemy.color, 25);
                this.enemies.splice(i, 1);
                this.updateHUD();
                
                // Dalga kontrolü
                if (this.kills % 5 === 0) {
                    this.wave++;
                    this.maxEnemies = Math.min(8 + this.wave, 20);
                    this.spawnEnemy();
                }
            }
        }
    }
    
    // ============================================================
    // MERMİLER
    // ============================================================
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.dx * b.speed * this.deltaTime;
            b.y += b.dy * b.speed * this.deltaTime;
            b.z += b.dz * b.speed * this.deltaTime;
            b.life -= this.deltaTime * 0.01;
            
            // Düşman çarpışma kontrolü
            let hit = false;
            for (const enemy of this.enemies) {
                const dx = b.x - enemy.x;
                const dz = b.z - enemy.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                if (dist < enemy.size + 0.2 && b.y < 1.5) {
                    enemy.health -= b.damage;
                    enemy.hitFlash = 1;
                    this.playSound('hit');
                    this.spawnParticles(b.x, b.y, b.z, '#ff6b6b', 8);
                    hit = true;
                    break;
                }
            }
            
            // Duvar çarpışması
            if (!hit) {
                for (const wall of this.walls) {
                    if (b.x > wall.x - wall.w/2 && b.x < wall.x + wall.w/2 &&
                        b.z > wall.z - wall.d/2 && b.z < wall.z + wall.d/2) {
                        hit = true;
                        this.spawnParticles(b.x, b.y, b.z, '#ffd93d', 5);
                        break;
                    }
                }
            }
            
            if (hit || b.life <= 0 || b.y < 0 || b.y > 5) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    // ============================================================
    // PARTİKÜLLER
    // ============================================================
    spawnParticles(x, y, z, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 0.1,
                vy: Math.random() * 0.1,
                vz: (Math.random() - 0.5) * 0.1,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 0.05 + Math.random() * 0.1,
                color: color
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * this.deltaTime;
            p.y += p.vy * this.deltaTime;
            p.z += p.vz * this.deltaTime;
            p.vy -= 0.002 * this.deltaTime;
            p.life -= p.decay * this.deltaTime;
            
            if (p.life <= 0 || p.y < 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // ============================================================
    // HASAR SİSTEMİ
    // ============================================================
    takeDamage(amount) {
        this.health -= amount;
        this.playSound('damage');
        
        if (this.health <= 0) {
            this.health = 0;
            this.gameOver();
        }
        
        this.updateHUD();
    }
    
    // ============================================================
    // RENDER (3D RASTERIZER)
    // ============================================================
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Arka plan (gökyüzü)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0a0a2e');
        skyGrad.addColorStop(0.5, '#1a1a4e');
        skyGrad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
        
        // Yıldızlar (sabit)
        this.renderStars(ctx);
        
        // Zemin
        this.renderGround(ctx);
        
        // 3D nesneleri render et
        this.render3D(ctx);
        
        // Silah render
        this.renderWeapon(ctx);
        
        // HUD
        this.renderHUD(ctx);
    }
    
    renderMenu() {
        // Menü arka planı zaten HTML ile
    }
    
    renderStars(ctx) {
        const seed = 12345;
        for (let i = 0; i < 100; i++) {
            const x = ((i * 137.508) % this.canvas.width);
            const y = ((i * 269.361) % (this.canvas.height * 0.7));
            const size = ((i * 73) % 3) + 1;
            const alpha = 0.3 + ((i * 43) % 7) / 10;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * (0.5 + Math.sin(this.time + i) * 0.5)})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderGround(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Grid zemin (3D perspektif)
        ctx.save();
        ctx.fillStyle = 'rgba(20, 20, 40, 0.3)';
        ctx.fillRect(0, h * 0.5, w, h * 0.5);
        
        // Grid çizgileri (perspektif)
        const centerX = w / 2;
        const horizon = h * 0.5;
        const spacing = 30;
        
        for (let i = 0; i < 30; i++) {
            const dist = i * 0.5;
            const scale = 1 / (1 + dist * 0.03);
            const y = horizon + (h - horizon) * (1 - scale);
            const width = w * scale;
            
            if (i % 2 === 0) {
                ctx.strokeStyle = `rgba(100, 100, 200, ${0.05 + scale * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(centerX - width/2, y);
                ctx.lineTo(centerX + width/2, y);
                ctx.stroke();
            }
        }
        
        // Dikey çizgiler
        for (let i = -10; i <= 10; i++) {
            const x = centerX + i * 50;
            ctx.strokeStyle = `rgba(100, 100, 200, 0.05)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, horizon);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // ============================================================
    // 3D RASTERIZER
    // ============================================================
    render3D(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const p = this.player;
        
        // Tüm 3D nesneleri topla
        const objects = [];
        
        // Duvarlar
        for (const wall of this.walls) {
            const height = wall.height || 2;
            const color = wall.color || '#2a2a5a';
            objects.push({
                type: 'box',
                x: wall.x,
                z: wall.z,
                w: wall.w,
                d: wall.d,
                h: height,
                color: color,
                y: height / 2
            });
        }
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            const color = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
            objects.push({
                type: 'enemy',
                x: enemy.x,
                z: enemy.z,
                w: enemy.size * 1.2,
                d: enemy.size * 1.2,
                h: enemy.size * 2,
                color: color,
                y: enemy.size,
                enemy: enemy
            });
        }
        
        // Mermiler
        for (const bullet of this.bullets) {
            objects.push({
                type: 'bullet',
                x: bullet.x,
                z: bullet.z,
                w: 0.1,
                d: 0.1,
                h: 0.1,
                color: '#ffd93d',
                y: bullet.y
            });
        }
        
        // Partiküller
        for (const part of this.particles) {
            objects.push({
                type: 'particle',
                x: part.x,
                z: part.z,
                w: part.size,
                d: part.size,
                h: part.size,
                color: part.color,
                y: part.y,
                alpha: part.life
            });
        }
        
        // Nesneleri perspektif projeksiyon ile render et
        const fov = this.fov * Math.PI / 180;
        const halfFov = fov / 2;
        const aspect = w / h;
        
        // Nesneleri uzaklığa göre sırala (arkadan öne)
        objects.sort((a, b) => {
            const distA = this.getDistance(a.x, a.z);
            const distB = this.getDistance(b.x, b.z);
            return distB - distA;
        });
        
        for (const obj of objects) {
            // Nesneyi kamera koordinatlarına çevir
            const dx = obj.x - p.x;
            const dz = obj.z - p.z;
            
            // Rotasyonu uygula
            const rotX = this.player.rotX;
            const rotY = this.player.rotY;
            
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            
            // Yatay rotasyon
            const rx = dx * cosX - dz * sinX;
            const rz = dx * sinX + dz * cosX;
            
            // Dikey rotasyon
            const dy = obj.y - p.y - p.height;
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            
            const ry = dy * cosY - rz * sinY;
            const rz2 = dy * sinY + rz * cosY;
            
            // Frustum culling
            if (rz2 < 0.1) continue;
            
            // Perspektif projeksiyon
            const scale = 1 / rz2;
            const screenX = w / 2 + (rx * scale * w) / (2 * Math.tan(halfFov));
            const screenY = h / 2 - (ry * scale * w) / (2 * Math.tan(halfFov) * aspect);
            
            // Nesne boyutu
            const objScale = scale * w / (2 * Math.tan(halfFov));
            const sizeW = obj.w * objScale;
            const sizeH = obj.h * objScale;
            
            // Görünürlük kontrolü
            if (screenX < -50 || screenX > w + 50) continue;
            if (screenY < -50 || screenY > h + 50) continue;
            if (sizeW < 0.1) continue;
            
            // Render
            ctx.save();
            
            if (obj.type === 'enemy') {
                // Düşman
                const alpha = Math.min(1, 1 / (1 + rz2 * 0.02));
                const brightness = Math.max(0.3, 1 - rz2 * 0.02);
                
                // Gölge
                ctx.fillStyle = `rgba(0,0,0,${0.2 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(screenX, screenY + sizeH * 0.5, sizeW * 0.6, sizeW * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Gövde
                const grad = ctx.createRadialGradient(
                    screenX - sizeW * 0.2, screenY - sizeH * 0.2, 0,
                    screenX, screenY, sizeW
                );
                const col = obj.color;
                grad.addColorStop(0, this.lightenColor(col, 30));
                grad.addColorStop(1, col);
                ctx.fillStyle = grad;
                ctx.globalAlpha = alpha * (obj.enemy.hitFlash > 0 ? 0.8 : 1);
                
                // Yuvarlak düşman
                ctx.beginPath();
                ctx.arc(screenX, screenY - sizeH * 0.1, sizeW * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // Gözler
                if (obj.enemy.state !== 'idle') {
                    ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
                    const eyeAngle = Math.atan2(
                        this.player.x - obj.x,
                        this.player.z - obj.z
                    ) - this.player.rotX;
                    
                    const eyeOffX = Math.sin(eyeAngle) * sizeW * 0.15;
                    const eyeOffZ = Math.cos(eyeAngle) * sizeW * 0.15;
                    
                    ctx.beginPath();
                    ctx.arc(screenX - sizeW * 0.15 + eyeOffX, screenY - sizeH * 0.1 - eyeOffZ * 0.3, sizeW * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(screenX + sizeW * 0.15 + eyeOffX, screenY - sizeH * 0.1 - eyeOffZ * 0.3, sizeW * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = `rgba(200,0,0,${0.9 * alpha})`;
                    ctx.beginPath();
                    ctx.arc(screenX - sizeW * 0.1 + eyeOffX * 1.5, screenY - sizeH * 0.1 - eyeOffZ * 0.3, sizeW * 0.05, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(screenX + sizeW * 0.2 + eyeOffX * 1.5, screenY - sizeH * 0.1 - eyeOffZ * 0.3, sizeW * 0.05, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Sağlık barı
                const healthPercent = obj.enemy.health / obj.enemy.maxHealth;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(screenX - sizeW * 0.5, screenY - sizeH * 0.7, sizeW, 4);
                ctx.fillStyle = healthPercent > 0.5 ? '#6bcb77' : '#ff6b6b';
                ctx.fillRect(screenX - sizeW * 0.5, screenY - sizeH * 0.7, sizeW * healthPercent, 4);
                
            } else if (obj.type === 'box') {
                // 3D Kutu
                const alpha = Math.min(1, 1 / (1 + rz2 * 0.02));
                const brightness = Math.max(0.3, 1 - rz2 * 0.02);
                
                // Gölge
                ctx.fillStyle = `rgba(0,0,0,${0.15 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(screenX, screenY + sizeH * 0.5, sizeW * 0.7, sizeW * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Üst yüz
                const topY = screenY - sizeH * 0.4;
                ctx.fillStyle = this.lightenColor(obj.color, 40);
                ctx.globalAlpha = alpha;
                ctx.fillRect(screenX - sizeW * 0.4, topY, sizeW * 0.8, sizeH * 0.3);
                
                // Ön yüz
                ctx.fillStyle = obj.color;
                ctx.fillRect(screenX - sizeW * 0.4, topY + sizeH * 0.3, sizeW * 0.8, sizeH * 0.5);
                
                // Kenarlık
                ctx.strokeStyle = `rgba(255,255,255,${0.05 * alpha})`;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(screenX - sizeW * 0.4, topY, sizeW * 0.8, sizeH * 0.8);
                
            } else if (obj.type === 'bullet') {
                // Mermi
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffd93d';
                ctx.shadowColor = '#ffd93d';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(screenX, screenY, sizeW * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
            } else if (obj.type === 'particle') {
                // Partikül
                ctx.globalAlpha = obj.alpha;
                ctx.fillStyle = obj.color;
                ctx.shadowColor = obj.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(0.5, sizeW), 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            ctx.restore();
        }
    }
    
    // ============================================================
    // SİLAH RENDER
    // ============================================================
    renderWeapon(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const weapon = this.weapons[this.currentWeapon];
        
        // Silah pozisyonu
        const gunX = w - 200;
        const gunY = h - 150;
        const scale = 1.5;
        
        // Silah gövdesi
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        
        // Ana gövde
        const grad = ctx.createLinearGradient(gunX, gunY, gunX + 60, gunY + 80);
        grad.addColorStop(0, '#4a4a6a');
        grad.addColorStop(0.5, '#2a2a4a');
        grad.addColorStop(1, '#1a1a2a');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(gunX, gunY, 100, 60, 8);
        ctx.fill();
        
        // Namlu
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(gunX + 90, gunY + 10, 40, 12);
        ctx.fillRect(gunX + 90, gunY + 38, 40, 12);
        
        // Namlu ağzı
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(gunX + 120, gunY + 8, 15, 44);
        
        // Kabza
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.roundRect(gunX + 10, gunY + 50, 25, 40, 4);
        ctx.fill();
        
        // Tetik
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(gunX + 30, gunY + 50, 5, 15);
        
        // Nişangah
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(gunX + 80, gunY, 5, 8);
        ctx.fillRect(gunX + 80, gunY + 52, 5, 8);
        
        // Mermi sayacı (silah üzerinde)
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(gunX + 20, gunY + 15, 50, 20);
        ctx.fillStyle = '#00ff88';
        ctx.font = '12px monospace';
        ctx.fillText(`${this.ammo}`, gunX + 30, gunY + 31);
        
        if (this.isReloading) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '10px monospace';
            ctx.fillText('YENİDEN DOLDUR...', gunX + 10, gunY + 48);
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    // ============================================================
    // HUD RENDER
    // ============================================================
    renderHUD(ctx) {
        // Ek bilgiler
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Silah ismi
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'right';
        const weapon = this.weapons[this.currentWeapon];
        ctx.fillText(weapon.name.toUpperCase(), w - 20, h - 180);
        
        // Can barı (ek olarak)
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(20, h - 40, 150, 12);
        const healthColor = healthPercent > 0.6 ? '#6bcb77' : healthPercent > 0.3 ? '#ffd93d' : '#ff6b6b';
        ctx.fillStyle = healthColor;
        ctx.fillRect(20, h - 40, 150 * healthPercent, 12);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`❤️ ${Math.round(this.health)}`, 25, h - 31);
    }
    
    // ============================================================
    // YARDIMCI FONKSİYONLAR
    // ============================================================
    getDistance(x, z) {
        const dx = x - this.player.x;
        const dz = z - this.player.z;
        return Math.sqrt(dx*dx + dz*dz);
    }
    
    lightenColor(color, amount) {
        // Basit renk açma
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1,2), 16);
            const g = parseInt(color.slice(2,3), 16);
            const b = parseInt(color.slice(3,4), 16);
            return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`;
        }
        return color;
    }
    
    // ============================================================
    // HUD GÜNCELLEME
    // ============================================================
    updateHUD() {
        document.getElementById('healthDisplay').textContent = Math.round(this.health);
        document.getElementById('healthFill').style.width = `${(this.health / this.maxHealth) * 100}%`;
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('waveDisplay').textContent = this.wave;
        document.getElementById('ammoDisplay').textContent = `${this.ammo}/${this.weapons[this.currentWeapon].maxAmmo}`;
        document.querySelector('.kill-feed span').textContent = `💀 ${this.kills}`;
    }
    
    updateHighScore() {
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
    
    // ============================================================
    // UI OLAYLARI
    // ============================================================
    setupUI() {
        // Ana menü
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
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
        
        document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.sensitivity;
        });
        
        document.getElementById('crosshairSelect').addEventListener('change', (e) => {
            this.crosshairType = e.target.value;
            this.updateCrosshair();
        });
        
        // Nasıl oynanır
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
            this.restartGame();
        });
        
        document.getElementById('pauseMainMenuBtn').addEventListener('click', () => {
            document.getElementById('pauseMenu').classList.remove('active');
            this.goToMenu();
        });
        
        // Oyun bitti
        document.getElementById('gameOverRestartBtn').addEventListener('click', () => {
            document.getElementById('gameOver').classList.remove('active');
            this.restartGame();
        });
        
        document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
            document.getElementById('gameOver').classList.remove('active');
            this.goToMenu();
        });
    }
    
    updateCrosshair() {
        const ch = document.getElementById('crosshair');
        ch.className = 'crosshair';
        if (this.crosshairType !== 'cross') {
            ch.classList.add(this.crosshairType);
        }
        ch.textContent = this.crosshairType === 'cross' ? '+' :
                        this.crosshairType === 'dot' ? '●' :
                        this.crosshairType === 'circle' ? '○' : '◎';
    }
    
    // ============================================================
    // OYUN DURUMU DEĞİŞTİRİCİLER
    // ============================================================
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.kills = 0;
        this.health = this.maxHealth;
        this.wave = 1;
        this.ammo = this.weapons.rifle.maxAmmo;
        this.isReloading = false;
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.enemySpawnTimer = 0;
        this.maxEnemies = 8;
        
        this.player.x = 0;
        this.player.z = 0;
        this.player.y = 0;
        this.player.rotX = 0;
        this.player.rotY = 0;
        
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('settingsMenu').classList.remove('active');
        document.getElementById('howToPlayMenu').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('gameOver').classList.remove('active');
        document.getElementById('pauseMenu').classList.remove('active');
        
        // Crosshair'ı göster
        this.updateCrosshair();
        document.getElementById('crosshair').style.display = 'block';
        
        // Pointer lock
        this.canvas.requestPointerLock();
        
        // İlk düşmanları spawn et
        for (let i = 0; i < 3; i++) {
            this.spawnEnemy();
        }
        
        this.updateHUD();
    }
    
    restartGame() {
        this.startGame();
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseMenu').classList.add('active');
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseMenu').classList.remove('active');
            this.canvas.requestPointerLock();
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        this.playSound('gameover');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mymar_highscore', this.highScore.toString());
            this.updateHighScore();
        }
        
        document.getElementById('gameOverScore').textContent = this.score;
        document.getElementById('gameOverKills').textContent = this.kills;
        document.getElementById('gameOverWave').textContent = this.wave;
        document.getElementById('gameOver').classList.add('active');
        
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    goToMenu() {
        this.state = 'menu';
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('mainMenu').classList.add('active');
        document.getElementById('crosshair').style.display = 'none';
        
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
}

// ============================================================
// roundRect POLYFILL (Canvas)
// ============================================================
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w/2) r = w/2;
        if (r > h/2) r = h/2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        return this;
    };
}

// ============================================================
// OYUNU BAŞLAT
// ============================================================
const game = new Game();

// Hata yakalama
window.addEventListener('error', (e) => {
    console.error('Oyun hatası:', e.message);
});

/**
 * MYMAR - 3D FPS Oyunu (Krunker.io Tarzı)
 * Tamamen 3D görünümlü, gerçek 3D model yok
 * Mobil uyumlu, sunucu simülasyonlu
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
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Oyun durumu
        this.state = 'menu';
        this.score = 0;
        this.kills = 0;
        this.deaths = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 0;
        this.wave = 1;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.isReloading = false;
        this.reloadTime = 0;
        this.shootCooldown = 0;
        this.isRunning = false;
        this.isAiming = false;
        
        // Oyuncu (3D alanda)
        this.player = {
            x: 0,
            y: 0,
            z: 0,
            rotX: 0,
            rotY: 0,
            height: 1.7,
            speed: 0.06,
            runSpeed: 0.1,
            jumpVel: 0,
            onGround: true
        };
        
        // Silahlar
        this.weapons = {
            pistol: { name: 'Tabanca', damage: 25, ammo: 12, maxAmmo: 12, fireRate: 200, reloadTime: 1000, spread: 0.03, icon: '🔫' },
            rifle: { name: 'Fırtına Tüfeği', damage: 35, ammo: 30, maxAmmo: 30, fireRate: 100, reloadTime: 1500, spread: 0.05, icon: '🔫' },
            shotgun: { name: 'Kasırga Pompalı', damage: 45, ammo: 8, maxAmmo: 8, fireRate: 400, reloadTime: 2000, spread: 0.15, icon: '🔫' }
        };
        this.currentWeapon = 'rifle';
        this.weaponIndex = 0;
        this.weaponList = ['pistol', 'rifle', 'shotgun'];
        
        // Oyun nesneleri
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.pickups = [];
        this.walls = [];
        this.players = []; // Diğer oyuncular (multiplayer simülasyonu)
        
        // Render ayarları
        this.fov = 90;
        this.near = 0.1;
        this.far = 100;
        
        // Giriş
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false, rightDown: false };
        this.isPointerLocked = false;
        this.touchControls = { left: false, right: false, jump: false, shoot: false };
        
        // Ayarlar
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sensitivity = 10;
        this.crosshairType = 'cross';
        this.fov = 90;
        this.highScore = parseInt(localStorage.getItem('mymar_highscore')) || 0;
        
        // Zaman
        this.lastTime = 0;
        this.deltaTime = 0;
        this.time = 0;
        this.enemySpawnTimer = 0;
        this.maxEnemies = 8;
        this.notifications = [];
        
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
        this.setupTouch();
        this.setupUI();
        this.initAudio();
        this.updateHighScore();
        this.generateWorld();
        this.loadSettings();
        
        // Minimap
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        console.log('MYMAR FPS v2.0 başlatıldı!');
        this.showNotification('🎮 MYMAR\'a Hoş Geldiniz!');
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
            
            const now = this.audioContext.currentTime;
            
            switch(type) {
                case 'shoot':
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                case 'reload':
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(400, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                case 'hit':
                    osc.frequency.setValueAtTime(1000, now);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                case 'kill':
                    osc.frequency.setValueAtTime(1200, now);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                case 'damage':
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                case 'pickup':
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.setValueAtTime(1200, now + 0.1);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
            }
        } catch(e) {}
    }
    
    // ============================================================
    // DÜNYA OLUŞTURMA
    // ============================================================
    generateWorld() {
        // Arena duvarları
        const wallHeight = 2;
        this.walls = [
            { x: -15, z: -15, w: 30, d: 0.5, h: wallHeight },
            { x: -15, z: 15, w: 30, d: 0.5, h: wallHeight },
            { x: -15, z: -15, w: 0.5, d: 30, h: wallHeight },
            { x: 15, z: -15, w: 0.5, d: 30, h: wallHeight },
        ];
        
        // Engeller
        const obstacles = [
            [-5, -4, 1.5, 1.5, 1.2],
            [3, -6, 2, 1, 0.8],
            [-3, 7, 1.5, 2, 1.5],
            [8, 2, 1, 1, 1],
            [-8, -2, 2, 1.5, 0.6],
            [2, 4, 1, 2, 1.3],
            [-6, 6, 1.5, 1.5, 0.9],
            [7, -5, 1, 1, 1.2],
            [0, 0, 2, 2, 1.5],
            [4, -2, 1.5, 1, 0.7],
            [-4, 2, 1, 1.5, 1.1]
        ];
        
        for (const [x, z, w, d, h] of obstacles) {
            this.walls.push({
                x: x, z: z, w: w, d: d, h: h,
                color: `hsl(${Math.random() * 60 + 200}, 30%, ${20 + Math.random() * 25}%)`
            });
        }
        
        // Power-up'lar
        this.pickups = [
            { x: -4, z: 3, type: 'health', value: 25, icon: '❤️' },
            { x: 5, z: -3, type: 'armor', value: 30, icon: '🛡️' },
            { x: -2, z: -5, type: 'ammo', value: 15, icon: '🔫' },
            { x: 6, z: 4, type: 'health', value: 25, icon: '❤️' },
            { x: -6, z: -3, type: 'armor', value: 30, icon: '🛡️' },
        ];
    }
    
    // ============================================================
    // DÜŞMAN OLUŞTURMA
    // ============================================================
    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 6 + Math.random() * 10;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        if (Math.abs(x) < 3 && Math.abs(z) < 3) return;
        
        const health = 30 + this.wave * 5;
        this.enemies.push({
            x, z,
            health: health,
            maxHealth: health,
            speed: 0.02 + this.wave * 0.002,
            size: 0.5,
            attackCooldown: 0,
            attackRange: 1.8,
            damage: 10 + this.wave * 2,
            state: 'idle',
            stateTimer: 0,
            color: `hsl(${Math.random() * 40 + 350}, 70%, 50%)`,
            eyeAngle: 0,
            hitFlash: 0,
            type: ['normal', 'fast', 'tank'][Math.floor(Math.random() * 3)]
        });
    }
    
    // ============================================================
    // KLAVYE & MOUSE
    // ============================================================
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if (key === 'r' && this.state === 'playing') {
                this.startReload();
            }
            if (key >= '1' && key <= '3' && this.state === 'playing') {
                const idx = parseInt(key) - 1;
                if (idx < this.weaponList.length) {
                    this.switchWeapon(idx);
                }
            }
            if (key === 'shift') {
                this.isRunning = true;
            }
            if (e.key === 'Escape') {
                if (this.state === 'playing') {
                    this.togglePause();
                } else if (this.state === 'paused') {
                    this.togglePause();
                }
            }
            if (key === ' ' || key === 'space') {
                if (this.state === 'playing' && this.player.onGround) {
                    this.player.jumpVel = 0.15;
                    this.player.onGround = false;
                    this.playSound('jump');
                }
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            if (key === 'shift') {
                this.isRunning = false;
            }
        });
    }
    
    setupMouse() {
        this.canvas.addEventListener('click', () => {
            if (this.state === 'playing' && !document.pointerLockElement) {
                this.canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || this.state !== 'playing') return;
            
            const sens = this.sensitivity / 50;
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
                this.isAiming = true;
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.down = false;
            if (e.button === 2) this.isAiming = false;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // ============================================================
    // MOBİL DOKUNMATİK
    // ============================================================
    setupTouch() {
        const canvas = this.canvas;
        let touchId = null;
        
        // Mobil kontroller için butonlar oluştur
        const controls = document.createElement('div');
        controls.id = 'touchControls';
        controls.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            display: none;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 150;
            pointer-events: none;
        `;
        
        const leftControl = document.createElement('div');
        leftControl.id = 'touchLeft';
        leftControl.style.cssText = `
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.2);
            pointer-events: auto;
            touch-action: none;
        `;
        
        const rightControl = document.createElement('div');
        rightControl.id = 'touchRight';
        rightControl.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: auto;
        `;
        
        const shootBtn = document.createElement('button');
        shootBtn.id = 'touchShoot';
        shootBtn.textContent = '🔫';
        shootBtn.style.cssText = `
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: rgba(255, 107, 107, 0.3);
            border: 2px solid rgba(255, 107, 107, 0.5);
            color: white;
            font-size: 30px;
            pointer-events: auto;
            touch-action: none;
            cursor: pointer;
        `;
        
        const jumpBtn = document.createElement('button');
        jumpBtn.id = 'touchJump';
        jumpBtn.textContent = '⬆';
        jumpBtn.style.cssText = `
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(77, 150, 255, 0.3);
            border: 2px solid rgba(77, 150, 255, 0.5);
            color: white;
            font-size: 24px;
            pointer-events: auto;
            touch-action: none;
            cursor: pointer;
        `;
        
        rightControl.appendChild(shootBtn);
        rightControl.appendChild(jumpBtn);
        controls.appendChild(leftControl);
        controls.appendChild(rightControl);
        document.body.appendChild(controls);
        
        // Mobil kontroller
        let touchX = 0, touchY = 0;
        let touchActive = false;
        
        leftControl.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchX = touch.clientX;
            touchY = touch.clientY;
            touchActive = true;
        });
        
        leftControl.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - touchX;
            const dy = touch.clientY - touchY;
            
            if (Math.abs(dx) > 20) {
                this.touchControls.left = dx < -20;
                this.touchControls.right = dx > 20;
            }
            if (Math.abs(dy) > 20) {
                this.player.rotY += dy * 0.005;
                this.player.rotY = Math.max(-1.2, Math.min(1.2, this.player.rotY));
            }
            
            touchX = touch.clientX;
            touchY = touch.clientY;
        });
        
        leftControl.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
            this.touchControls.right = false;
            touchActive = false;
        });
        
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.shoot = true;
            if (this.state === 'playing' && !this.isReloading) {
                this.shoot();
            }
        });
        
        shootBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.shoot = false;
        });
        
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.jump = true;
            if (this.state === 'playing' && this.player.onGround) {
                this.player.jumpVel = 0.15;
                this.player.onGround = false;
                this.playSound('jump');
            }
        });
        
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.jump = false;
        });
        
        // Mobil cihaz kontrolü
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            controls.style.display = 'flex';
        }
        
        // Pencere boyutu değişince
        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                controls.style.display = 'flex';
            } else {
                controls.style.display = 'none';
            }
        });
    }
    
    // ============================================================
    // SİLAH SİSTEMİ
    // ============================================================
    switchWeapon(index) {
        if (index === this.weaponIndex || this.isReloading) return;
        this.weaponIndex = index;
        this.currentWeapon = this.weaponList[index];
        const weapon = this.weapons[this.currentWeapon];
        this.ammo = weapon.maxAmmo;
        this.updateHUD();
        this.showNotification(`🔫 ${weapon.name}`);
    }
    
    startReload() {
        if (this.isReloading) return;
        const weapon = this.weapons[this.currentWeapon];
        if (this.ammo >= weapon.maxAmmo) return;
        
        this.isReloading = true;
        this.reloadTime = weapon.reloadTime;
        this.playSound('reload');
        this.showNotification('🔄 Yeniden dolduruluyor...');
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
        
        const spread = this.isAiming ? weapon.spread * 0.3 : weapon.spread;
        const count = this.currentWeapon === 'shotgun' ? 8 : 1;
        
        for (let i = 0; i < count; i++) {
            const angleX = (Math.random() - 0.5) * spread;
            const angleY = (Math.random() - 0.5) * spread;
            
            this.bullets.push({
                x: this.player.x,
                y: this.player.height - 0.2,
                z: this.player.z,
                dx: Math.sin(this.player.rotX + angleX) * Math.cos(this.player.rotY + angleY),
                dy: -Math.sin(this.player.rotY + angleY),
                dz: Math.cos(this.player.rotX + angleX) * Math.cos(this.player.rotY + angleY),
                life: 2,
                damage: weapon.damage,
                speed: 0.8
            });
        }
        
        this.spawnParticles(
            this.player.x + Math.sin(this.player.rotX) * 0.5,
            this.player.height - 0.2,
            this.player.z + Math.cos(this.player.rotX) * 0.5,
            '#ffd93d', 3
        );
        
        if (this.ammo <= 0) {
            setTimeout(() => this.startReload(), 300);
        }
        
        this.updateHUD();
    }
    
    // ============================================================
    // OYUN DÖNGÜSÜ
    // ============================================================
    gameLoop(timestamp) {
        if (this.lastTime === 0) this.lastTime = timestamp;
        this.deltaTime = Math.min((timestamp - this.lastTime) / 16.667, 3);
        this.lastTime = timestamp;
        this.time += this.deltaTime * 0.001;
        
        if (this.state === 'playing') {
            this.update();
            this.render();
            this.renderMinimap();
        } else {
            this.render();
        }
        
        requestAnimationFrame(this.gameLoop);
    }
    
    // ============================================================
    // GÜNCELLEME
    // ============================================================
    update() {
        // Soğuma
        if (this.shootCooldown > 0) this.shootCooldown -= this.deltaTime;
        if (this.reloadTime > 0 && this.isReloading) {
            this.reloadTime -= this.deltaTime;
            if (this.reloadTime <= 0) {
                const weapon = this.weapons[this.currentWeapon];
                this.ammo = weapon.maxAmmo;
                this.isReloading = false;
                this.updateHUD();
                this.showNotification('✅ Yeniden dolduruldu!');
            }
        }
        
        this.updatePlayer();
        this.updateEnemies();
        this.updateBullets();
        this.updateParticles();
        this.updatePickups();
        this.updateNotifications();
        
        // Düşman spawn
        this.enemySpawnTimer += this.deltaTime;
        if (this.enemySpawnTimer > 2000 / (1 + this.wave * 0.1)) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }
        
        this.updateHUD();
    }
    
    // ============================================================
    // OYUNCU HAREKETİ
    // ============================================================
    updatePlayer() {
        const p = this.player;
        const speed = (this.isRunning ? p.runSpeed : p.speed) * this.deltaTime;
        
        let dx = 0, dz = 0;
        
        // Klavye
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
        
        // Mobil
        if (this.touchControls.left) {
            dx -= Math.cos(p.rotX);
            dz += Math.sin(p.rotX);
        }
        if (this.touchControls.right) {
            dx += Math.cos(p.rotX);
            dz -= Math.sin(p.rotX);
        }
        
        const len = Math.sqrt(dx*dx + dz*dz);
        if (len > 0) {
            dx /= len;
            dz /= len;
            p.x += dx * speed;
            p.z += dz * speed;
        }
        
        // Yerçekimi
        p.jumpVel -= 0.006 * this.deltaTime;
        p.y += p.jumpVel * this.deltaTime;
        
        if (p.y <= 0) {
            p.y = 0;
            p.onGround = true;
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
            
            if (enemy.hitFlash > 0) enemy.hitFlash -= this.deltaTime * 0.05;
            
            const dx = this.player.x - enemy.x;
            const dz = this.player.z - enemy.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            enemy.stateTimer += this.deltaTime;
            
            if (dist < enemy.attackRange) {
                enemy.state = 'attack';
                if (enemy.attackCooldown <= 0) {
                    this.takeDamage(enemy.damage);
                    enemy.attackCooldown = 1000;
                    this.playSound('damage');
                    this.spawnParticles(enemy.x, 0.5, enemy.z, '#ff6b6b', 10);
                }
            } else if (dist < 12) {
                enemy.state = 'chase';
                const angle = Math.atan2(dx, dz);
                const speed = enemy.speed * this.deltaTime;
                enemy.x += Math.sin(angle) * speed;
                enemy.z += Math.cos(angle) * speed;
                enemy.eyeAngle = angle;
            } else {
                enemy.state = 'idle';
                if (enemy.stateTimer > 2000) {
                    enemy.stateTimer = 0;
                    enemy.eyeAngle = Math.random() * Math.PI * 2;
                }
                const speed = enemy.speed * 0.3 * this.deltaTime;
                enemy.x += Math.sin(enemy.eyeAngle) * speed;
                enemy.z += Math.cos(enemy.eyeAngle) * speed;
            }
            
            if (enemy.attackCooldown > 0) enemy.attackCooldown -= this.deltaTime;
            
            enemy.x = Math.max(-14, Math.min(14, enemy.x));
            enemy.z = Math.max(-14, Math.min(14, enemy.z));
            
            if (enemy.health <= 0) {
                this.kills++;
                this.score += 10 + this.wave * 2;
                this.playSound('kill');
                this.spawnParticles(enemy.x, 0.5, enemy.z, enemy.color, 25);
                this.enemies.splice(i, 1);
                this.updateHUD();
                this.showNotification(`💀 Düşman öldürüldü! (+${10 + this.wave * 2} puan)`);
                
                if (this.kills % 5 === 0) {
                    this.wave++;
                    this.maxEnemies = Math.min(8 + this.wave, 20);
                    this.showNotification(`🌊 Dalga ${this.wave}!`);
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
    // POWER-UP'LAR
    // ============================================================
    updatePickups() {
        const p = this.player;
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const pickup = this.pickups[i];
            if (pickup.collected) continue;
            
            const dx = p.x - pickup.x;
            const dz = p.z - pickup.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            
            if (dist < 1.2) {
                pickup.collected = true;
                this.playSound('pickup');
                
                switch(pickup.type) {
                    case 'health':
                        this.health = Math.min(this.maxHealth, this.health + pickup.value);
                        this.showNotification(`❤️ +${pickup.value} Can`);
                        break;
                    case 'armor':
                        this.armor = Math.min(100, this.armor + pickup.value);
                        this.showNotification(`🛡️ +${pickup.value} Zırh`);
                        break;
                    case 'ammo':
                        const weapon = this.weapons[this.currentWeapon];
                        this.ammo = Math.min(weapon.maxAmmo, this.ammo + pickup.value);
                        this.showNotification(`🔫 +${pickup.value} Mermi`);
                        break;
                }
                
                this.spawnParticles(pickup.x, 0.5, pickup.z, '#ffd93d', 15);
                this.updateHUD();
            }
        }
    }
    
    // ============================================================
    // BİLDİRİMLER
    // ============================================================
    showNotification(text) {
        this.notifications.push({ text, time: 3 });
        if (this.notifications.length > 5) {
            this.notifications.shift();
        }
        this.updateNotifications();
    }
    
    updateNotifications() {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        this.notifications = this.notifications.filter(n => n.time > 0);
        this.notifications.forEach(n => n.time -= this.deltaTime * 0.001);
        
        container.innerHTML = this.notifications.map(n => 
            `<div class="notification">${n.text}</div>`
        ).join('');
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
        // Zırh hasarı azaltır
        if (this.armor > 0) {
            const armorDmg = Math.min(this.armor, amount * 0.5);
            this.armor -= armorDmg;
            amount -= armorDmg;
        }
        
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
        
        // Arka plan
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0a0a2e');
        skyGrad.addColorStop(0.5, '#1a1a4e');
        skyGrad.addColorStop(1, '#0a0a0f');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
        
        this.renderStars(ctx);
        this.renderGround(ctx);
        this.render3D(ctx);
        this.renderWeapon(ctx);
    }
    
    renderStars(ctx) {
        for (let i = 0; i < 120; i++) {
            const x = ((i * 137.508 + 50) % this.canvas.width);
            const y = ((i * 269.361 + 30) % (this.canvas.height * 0.7));
            const size = ((i * 73) % 3) + 1;
            const alpha = 0.3 + ((i * 43) % 7) / 10 * (0.5 + Math.sin(this.time + i) * 0.5);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderGround(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const horizon = h * 0.5;
        
        ctx.fillStyle = 'rgba(20, 20, 40, 0.4)';
        ctx.fillRect(0, horizon, w, h - horizon);
        
        // Grid
        for (let i = 0; i < 40; i++) {
            const dist = i * 0.4;
            const scale = 1 / (1 + dist * 0.025);
            const y = horizon + (h - horizon) * (1 - scale);
            const width = w * scale;
            
            if (i % 2 === 0) {
                ctx.strokeStyle = `rgba(100, 100, 200, ${0.03 + scale * 0.08})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(centerX - width/2, y);
                ctx.lineTo(centerX + width/2, y);
                ctx.stroke();
            }
        }
        
        for (let i = -12; i <= 12; i++) {
            const x = centerX + i * 40;
            ctx.strokeStyle = `rgba(100, 100, 200, 0.03)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, horizon);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
    }
    
    // ============================================================
    // 3D RASTERIZER (Devam)
    // ============================================================
    render3D(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const p = this.player;
        
        const objects = [];
        
        // Duvarlar
        for (const wall of this.walls) {
            const height = wall.h || 2;
            const color = wall.color || '#2a2a5a';
            objects.push({
                type: 'box',
                x: wall.x, z: wall.z,
                w: wall.w, d: wall.d,
                h: height, y: height / 2,
                color: color
            });
        }
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            const color = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
            objects.push({
                type: 'enemy',
                x: enemy.x, z: enemy.z,
                w: enemy.size * 1.2, d: enemy.size * 1.2,
                h: enemy.size * 2, y: enemy.size,
                color: color,
                enemy: enemy
            });
        }
        
        // Power-up'lar
        for (const pickup of this.pickups) {
            if (pickup.collected) continue;
            const bobY = Math.sin(this.time * 2 + pickup.x) * 0.2;
            objects.push({
                type: 'pickup',
                x: pickup.x, z: pickup.z,
                w: 0.4, d: 0.4,
                h: 0.4, y: 0.6 + bobY,
                color: '#ffd93d',
                icon: pickup.icon,
                pickup: pickup
            });
        }
        
        // Mermiler
        for (const bullet of this.bullets) {
            objects.push({
                type: 'bullet',
                x: bullet.x, z: bullet.z,
                w: 0.1, d: 0.1,
                h: 0.1, y: bullet.y,
                color: '#ffd93d'
            });
        }
        
        // Partiküller
        for (const part of this.particles) {
            objects.push({
                type: 'particle',
                x: part.x, z: part.z,
                w: part.size, d: part.size,
                h: part.size, y: part.y,
                color: part.color,
                alpha: part.life
            });
        }
        
        // Sırala
        objects.sort((a, b) => {
            const distA = this.getDistance(a.x, a.z);
            const distB = this.getDistance(b.x, b.z);
            return distB - distA;
        });
        
        const fov = this.fov * Math.PI / 180;
        const halfFov = fov / 2;
        const aspect = w / h;
        
        for (const obj of objects) {
            const dx = obj.x - p.x;
            const dz = obj.z - p.z;
            
            const cosX = Math.cos(p.rotX);
            const sinX = Math.sin(p.rotX);
            
            const rx = dx * cosX - dz * sinX;
            const rz = dx * sinX + dz * cosX;
            
            const dy = obj.y - p.y - p.height;
            const cosY = Math.cos(p.rotY);
            const sinY = Math.sin(p.rotY);
            
            const ry = dy * cosY - rz * sinY;
            const rz2 = dy * sinY + rz * cosY;
            
            if (rz2 < 0.1) continue;
            
            const scale = 1 / rz2;
            const screenX = w / 2 + (rx * scale * w) / (2 * Math.tan(halfFov));
            const screenY = h / 2 - (ry * scale * w) / (2 * Math.tan(halfFov) * aspect);
            
            const objScale = scale * w / (2 * Math.tan(halfFov));
            const sizeW = obj.w * objScale;
            const sizeH = obj.h * objScale;
            
            if (screenX < -50 || screenX > w + 50) continue;
            if (screenY < -50 || screenY > h + 50) continue;
            if (sizeW < 0.1) continue;
            
            ctx.save();
            
            if (obj.type === 'enemy') {
                this.renderEnemy(ctx, obj, screenX, screenY, sizeW, sizeH, rz2);
            } else if (obj.type === 'box') {
                this.renderBox(ctx, obj, screenX, screenY, sizeW, sizeH, rz2);
            } else if (obj.type === 'pickup') {
                this.renderPickup(ctx, obj, screenX, screenY, sizeW, rz2);
            } else if (obj.type === 'bullet') {
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffd93d';
                ctx.shadowColor = '#ffd93d';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(screenX, screenY, sizeW * 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (obj.type === 'particle') {
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
    
    renderEnemy(ctx, obj, sx, sy, sw, sh, dist) {
        const alpha = Math.min(1, 1 / (1 + dist * 0.02));
        const brightness = Math.max(0.3, 1 - dist * 0.02);
        
        // Gölge
        ctx.fillStyle = `rgba(0,0,0,${0.2 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy + sh * 0.5, sw * 0.6, sw * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Gövde
        const grad = ctx.createRadialGradient(
            sx - sw * 0.2, sy - sh * 0.2, 0,
            sx, sy, sw
        );
        const col = obj.color;
        grad.addColorStop(0, this.lightenColor(col, 30));
        grad.addColorStop(1, col);
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha * (obj.enemy.hitFlash > 0 ? 0.8 : 1);
        
        ctx.beginPath();
        ctx.arc(sx, sy - sh * 0.1, sw * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Gözler
        if (obj.enemy.state !== 'idle') {
            ctx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
            const eyeAngle = Math.atan2(
                this.player.x - obj.x,
                this.player.z - obj.z
            ) - this.player.rotX;
            
            const eyeOffX = Math.sin(eyeAngle) * sw * 0.15;
            const eyeOffZ = Math.cos(eyeAngle) * sw * 0.15;
            
            ctx.beginPath();
            ctx.arc(sx - sw * 0.15 + eyeOffX, sy - sh * 0.1 - eyeOffZ * 0.3, sw * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx + sw * 0.15 + eyeOffX, sy - sh * 0.1 - eyeOffZ * 0.3, sw * 0.12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = `rgba(200,0,0,${0.9 * alpha})`;
            ctx.beginPath();
            ctx.arc(sx - sw * 0.1 + eyeOffX * 1.5, sy - sh * 0.1 - eyeOffZ * 0.3, sw * 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(sx + sw * 0.2 + eyeOffX * 1.5, sy - sh * 0.1 - eyeOffZ * 0.3, sw * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Sağlık barı
        const healthPercent = obj.enemy.health / obj.enemy.maxHealth;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(sx - sw * 0.5, sy - sh * 0.7, sw, 3);
        ctx.fillStyle = healthPercent > 0.5 ? '#6bcb77' : '#ff6b6b';
        ctx.fillRect(sx - sw * 0.5, sy - sh * 0.7, sw * healthPercent, 3);
    }
    
    renderBox(ctx, obj, sx, sy, sw, sh, dist) {
        const alpha = Math.min(1, 1 / (1 + dist * 0.02));
        
        ctx.fillStyle = `rgba(0,0,0,${0.15 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(sx, sy + sh * 0.5, sw * 0.7, sw * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const topY = sy - sh * 0.4;
        ctx.fillStyle = this.lightenColor(obj.color, 40);
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx - sw * 0.4, topY, sw * 0.8, sh * 0.3);
        
        ctx.fillStyle = obj.color;
        ctx.fillRect(sx - sw * 0.4, topY + sh * 0.3, sw * 0.8, sh * 0.5);
        
        ctx.strokeStyle = `rgba(255,255,255,${0.05 * alpha})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx - sw * 0.4, topY, sw * 0.8, sh * 0.8);
    }
    
    renderPickup(ctx, obj, sx, sy, sw, dist) {
        const alpha = Math.min(1, 1 / (1 + dist * 0.02));
        const glow = 0.5 + Math.sin(this.time * 3 + obj.x) * 0.5;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffd93d';
        ctx.shadowColor = '#ffd93d';
        ctx.shadowBlur = 20 + glow * 10;
        ctx.font = `${sw * 3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.icon, sx, sy);
        ctx.shadowBlur = 0;
    }
    
    // ============================================================
    // SİLAH RENDER (3D Görünümlü)
    // ============================================================
    renderWeapon(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const weapon = this.weapons[this.currentWeapon];
        
        const gunX = w - 180;
        const gunY = h - 140;
        
        // Amaçlama efekti
        const aimOffset = this.isAiming ? 40 : 0;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        
        // Silah gövdesi (3D görünümlü)
        const grad = ctx.createLinearGradient(gunX, gunY - aimOffset, gunX + 60, gunY + 80 - aimOffset);
        grad.addColorStop(0, '#4a4a6a');
        grad.addColorStop(0.3, '#3a3a5a');
        grad.addColorStop(0.7, '#2a2a4a');
        grad.addColorStop(1, '#1a1a2a');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(gunX, gunY - aimOffset, 100, 60, 8);
        ctx.fill();
        
        // Namlu (3D görünümlü)
        const barrelGrad = ctx.createLinearGradient(gunX + 90, gunY - aimOffset + 10, gunX + 130, gunY - aimOffset + 40);
        barrelGrad.addColorStop(0, '#3a3a5a');
        barrelGrad.addColorStop(0.5, '#4a4a6a');
        barrelGrad.addColorStop(1, '#2a2a4a');
        ctx.fillStyle = barrelGrad;
        ctx.fillRect(gunX + 90, gunY - aimOffset + 10, 40, 12);
        ctx.fillRect(gunX + 90, gunY - aimOffset + 38, 40, 12);
        
        // Namlu ağzı
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(gunX + 120, gunY - aimOffset + 8, 15, 44);
        
        // Kabza
        const gripGrad = ctx.createLinearGradient(gunX + 10, gunY - aimOffset + 50, gunX + 35, gunY - aimOffset + 90);
        gripGrad.addColorStop(0, '#2a2a2a');
        gripGrad.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gripGrad;
        ctx.beginPath();
        ctx.roundRect(gunX + 10, gunY - aimOffset + 50, 25, 40, 4);
        ctx.fill();
        
        // Tetik
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(gunX + 30, gunY - aimOffset + 50, 5, 15);
        
        // Nişangah
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(gunX + 80, gunY - aimOffset, 5, 8);
        ctx.fillRect(gunX + 80, gunY - aimOffset + 52, 5, 8);
        
        // Mermi sayacı (silah üzerinde)
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(gunX + 20, gunY - aimOffset + 15, 50, 20);
        ctx.fillStyle = this.isReloading ? '#ff6b6b' : '#00ff88';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(this.isReloading ? '...' : `${this.ammo}`, gunX + 30, gunY - aimOffset + 31);
        
        if (this.isReloading) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '9px Rajdhani, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('YENİDEN DOLDUR', gunX + 50, gunY - aimOffset + 48);
        }
        
        ctx.restore();
        
        // Silah ismi
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(weapon.name.toUpperCase(), w - 20, h - 60);
    }
    
    // ============================================================
    // MINIMAP
    // ============================================================
    renderMinimap() {
        const ctx = this.minimapCtx;
        const size = 120;
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, size, size);
        
        const scale = size / 30;
        const cx = size / 2;
        const cy = size / 2;
        
        // Duvarlar
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (const wall of this.walls) {
            const x = cx + wall.x * scale;
            const y = cy + wall.z * scale;
            ctx.fillRect(x - wall.w/2 * scale, y - wall.d/2 * scale, wall.w * scale, wall.d * scale);
        }
        
        // Düşmanlar
        for (const enemy of this.enemies) {
            const x = cx + enemy.x * scale;
            const y = cy + enemy.z * scale;
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Power-up'lar
        for (const pickup of this.pickups) {
            if (pickup.collected) continue;
            const x = cx + pickup.x * scale;
            const y = cy + pickup.z * scale;
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Oyuncu
        const px = cx + this.player.x * scale;
        const py = cy + this.player.z * scale;
        ctx.fillStyle = '#6bcb77';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Oyuncu yönü
        ctx.strokeStyle = '#6bcb77';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
            px + Math.sin(this.player.rotX) * 8,
            py + Math.cos(this.player.rotX) * 8
        );
        ctx.stroke();
        
        // Sınır çizgisi
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
    }
    
    // ============================================================
    // HUD GÜNCELLEME
    // ============================================================
    updateHUD() {
        document.getElementById('healthDisplay').textContent = Math.round(this.health);
        document.getElementById('healthFill').style.width = `${(this.health / this.maxHealth) * 100}%`;
        document.getElementById('armorDisplay').textContent = Math.round(this.armor);
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('killDisplay').textContent = this.kills;
        document.getElementById('ammoDisplay').textContent = `${this.ammo}/${this.weapons[this.currentWeapon].maxAmmo}`;
        document.getElementById('weaponNameDisplay').textContent = this.weapons[this.currentWeapon].name;
        document.querySelector('.weapon-damage').textContent = `⚔️ ${this.weapons[this.currentWeapon].damage}`;
    }
    
    updateHighScore() {
        document.getElementById('highScoreDisplay').textContent = this.highScore;
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
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1,3), 16);
            const g = parseInt(color.slice(3,5), 16);
            const b = parseInt(color.slice(5,7), 16);
            return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`;
        }
        return color;
    }
    
    loadSettings() {
        const saved = localStorage.getItem('mymar_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.sensitivity = settings.sensitivity || 10;
                this.crosshairType = settings.crosshair || 'cross';
                this.fov = settings.fov || 90;
                this.soundEnabled = settings.sound !== false;
                this.musicEnabled = settings.music !== false;
                
                document.getElementById('sensitivitySlider').value = this.sensitivity;
                document.getElementById('sensitivityValue').textContent = this.sensitivity;
                document.getElementById('fovSlider').value = this.fov;
                document.getElementById('fovValue').textContent = this.fov;
                document.getElementById('soundToggle').checked = this.soundEnabled;
                document.getElementById('musicToggle').checked = this.musicEnabled;
                
                this.updateCrosshair();
            } catch(e) {}
        }
    }
    
    saveSettings() {
        const settings = {
            sensitivity: this.sensitivity,
            crosshair: this.crosshairType,
            fov: this.fov,
            sound: this.soundEnabled,
            music: this.musicEnabled
        };
        localStorage.setItem('mymar_settings', JSON.stringify(settings));
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
    // UI OLAYLARI
    // ============================================================
    setupUI() {
        // Ana menü
        document.getElementById('playBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('quickPlayBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('settingsMenuBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('settingsMenu').classList.add('active');
        });
        
        document.getElementById('howToPlayMenuBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('howToPlayMenu').classList.add('active');
        });
        
        document.getElementById('shopBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('shopMenu').classList.add('active');
        });
        
        document.getElementById('loadoutBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('loadoutMenu').classList.add('active');
        });
        
        document.getElementById('statsBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.remove('active');
            document.getElementById('statsMenu').classList.add('active');
        });
        
        // Geri butonları
        document.getElementById('settingsBackBtn').addEventListener('click', () => {
            document.getElementById('settingsMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
            document.getElementById('howToPlayMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('shopBackBtn').addEventListener('click', () => {
            document.getElementById('shopMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('loadoutBackBtn').addEventListener('click', () => {
            document.getElementById('loadoutMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('statsBackBtn').addEventListener('click', () => {
            document.getElementById('statsMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        // Ayarlar
        document.getElementById('settingsSaveBtn').addEventListener('click', () => {
            this.saveSettings();
            this.showNotification('✅ Ayarlar kaydedildi!');
            document.getElementById('settingsMenu').classList.remove('active');
            document.getElementById('mainMenu').classList.add('active');
        });
        
        document.getElementById('sensitivitySlider').addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.sensitivity;
        });
        
        document.getElementById('fovSlider').addEventListener('input', (e) => {
            this.fov = parseInt(e.target.value);
            document.getElementById('fovValue').textContent = this.fov;
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        
        document.getElementById('musicToggle').addEventListener('change', (e) => {
            this.musicEnabled = e.target.checked;
        });
        
        document.querySelectorAll('.crosshair-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.crosshair-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.crosshairType = btn.dataset.type;
                this.updateCrosshair();
            });
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
        
        // Loadout presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showNotification(`✅ ${btn.textContent.trim()} ekipmanı yüklendi!`);
            });
        });
        
        // Mağaza satın alma
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNotification('🛒 Satın alındı!');
                btn.textContent = '✓ Satın Alındı';
                btn.className = 'shop-btn owned-btn';
            });
        });
    }
    
    // ============================================================
    // OYUN DURUMU DEĞİŞTİRİCİLER
    // ============================================================
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.kills = 0;
        this.deaths = 0;
        this.health = this.maxHealth;
        this.armor = 0;
        this.wave = 1;
        this.ammo = this.weapons.rifle.maxAmmo;
        this.isReloading = false;
        this.enemies = [];
        this.particles = [];
        this.bullets = [];
        this.pickups.forEach(p => p.collected = false);
        this.enemySpawnTimer = 0;
        this.maxEnemies = 8;
        this.notifications = [];
        
        this.player.x = 0;
        this.player.z = 0;
        this.player.y = 0;
        this.player.rotX = 0;
        this.player.rotY = 0;
        
        document.querySelectorAll('.menu-container').forEach(m => m.classList.remove('active'));
        document.getElementById('gameScreen').classList.add('active');
        document.getElementById('gameOver').classList.remove('active');
        document.getElementById('pauseMenu').classList.remove('active');
        document.getElementById('crosshair').style.display = 'block';
        
        this.canvas.requestPointerLock();
        
        for (let i = 0; i < 4; i++) {
            this.spawnEnemy();
        }
        
        this.updateHUD();
        this.showNotification('🎯 Oyun başladı! Düşmanları avla!');
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
        this.deaths++;
        this.playSound('gameover');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mymar_highscore', this.highScore.toString());
            this.updateHighScore();
        }
        
        document.getElementById('gameOverScore').textContent = this.score;
        document.getElementById('gameOverKills').textContent = this.kills;
        
        // Rütbe sistemi
        let rank = 'Acemi';
        if (this.score > 100) rank = 'Çaylak';
        if (this.score > 250) rank = 'Savaşçı';
        if (this.score > 500) rank = 'Uzman';
        if (this.score > 1000) rank = 'Efsane';
        if (this.score > 2000) rank = 'Efsanevi';
        document.getElementById('gameOverRank').textContent = rank;
        
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
// POLYFILL
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

window.addEventListener('error', (e) => {
    console.error('Oyun hatası:', e.message);
});

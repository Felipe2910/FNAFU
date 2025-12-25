// ===========================
// FNAF 1 - VERSIÓN ORGANIZADA Y PULIDA
// ===========================

// ===========================
// 1. CONFIGURACIÓN GLOBAL
// ===========================

const CONFIG = {
	HOUR_DURATION: 90,
	TOTAL_HOURS: 6,

	BASE_POWER_DRAIN: {
		1: 1 / 9.6,
		2: 1 / 8.0,
		3: 1 / 7.2,
		4: 1 / 6.4,
		5: 1 / 6.4,
		6: 1 / 6.4,
	},

	POWER_MULTIPLIERS: {
		0: 1.0,
		1: 1.6,
		2: 2.8,
		3: 4.6,
		4: 8.0,
	},

	AI_INTERVALS: {
		bonnie: 4.97,
		chica: 4.98,
		freddy: 3.02,
		foxy: 5.01,
	},

	AI_LEVELS: {
		freddy: [0, 0, 1, 1, 3, 4],
		bonnie: [0, 3, 0, 2, 5, 10],
		chica: [0, 1, 5, 4, 7, 12],
		foxy: [0, 1, 2, 6, 5, 16],
	},

	FOXY_CHECK_INTERVAL: 12,
	FOXY_DOOR_DELAY: 1500,
	FOXY_BASE_DAMAGE: 5,

	ATTACK_BASE_TIME: 15,
	ATTACK_AI_MULTIPLIER: 0.5,

	WIN_DELAY: 5000,
	GAMEOVER_DELAY: 3000,
	POWEROUT_MIN_DELAY: 10000,
	POWEROUT_MAX_DELAY: 20000,
	JUMPSCARE_DURATION: 2000,

	MONITOR_LOCK_DELAY: 600,
};

const ASSETS = {
	sounds: {
		menu: "assets/sounds/menu.mp3",
		ambient: "assets/sounds/abandoned_night_loop.mp3",
		chime: "assets/sounds/chimes.mp3",
		door: "assets/sounds/door_toggle.mp3",
		light: "assets/sounds/lights.mp3",
		cam_open: "assets/sounds/monitor_up.mp3",
		cam_change: "assets/sounds/camera_switch.mp3",
		powerout: "assets/sounds/powerdown.mp3",
		knock: "assets/sounds/knock.mp3",
		foxy_run: "assets/sounds/glitch.mp3",
		jumpscare: "assets/sounds/jumpscare.mp3",
		windowscare: "assets/sounds/windowscare.mp3",
		toreador_march: "assets/sounds/toreador_march.mp3",
		static: "assets/sounds/static.mp3",
		error: "assets/sounds/error.mp3", // Agregar este sonido
	},
	images: {
		office: {
			base: "assets/images/office_base.jpg",
			lights: {
				left: "assets/images/office_light_left.jpg",
				right: "assets/images/office_light_right.jpg",
			},
			animatronics: {
				bonnie: "assets/images/office_bonnie.jpg",
				chica: "assets/images/office_chica.jpg",
				freddy: "assets/images/office_freddy.jpg",
			},
		},
	},
};

const CAMERAS = {
	"1A": { name: "Show Stage", button: { x: 175, y: 30, w: 50, h: 30 } },
	"1B": { name: "Dining Area", button: { x: 105, y: 85, w: 50, h: 30 } },
	"1C": { name: "Pirate Cove", button: { x: 30, y: 165, w: 50, h: 30 } },
	3: { name: "Supply Closet", button: { x: 60, y: 250, w: 50, h: 30 } },
	"2A": { name: "West Hall", button: { x: 140, y: 260, w: 50, h: 30 } },
	"2B": { name: "W. Hall Corner", button: { x: 140, y: 330, w: 50, h: 30 } },
	"4A": { name: "East Hall", button: { x: 240, y: 260, w: 50, h: 30 } },
	"4B": { name: "E. Hall Corner", button: { x: 240, y: 330, w: 50, h: 30 } },
	5: { name: "Backstage", button: { x: 30, y: 85, w: 50, h: 30 } },
	7: { name: "Restrooms", button: { x: 320, y: 115, w: 50, h: 30 } },
	6: { name: "Kitchen", button: { x: 330, y: 230, w: 50, h: 30 } },
};

const MAP_LAYOUT = [
	{ x: 100, y: 0, w: 100, h: 30 },
	{ x: 50, y: 30, w: 200, h: 130 },
	{ x: 0, y: 30, w: 40, h: 70 },
	{ x: 15, y: 110, w: 35, h: 45 },
	{ x: 45, y: 190, w: 35, h: 70 },
	{ x: 260, y: 50, w: 30, h: 110 },
	{ x: 300, y: 80, w: 30, h: 30 },
	{ x: 300, y: 130, w: 30, h: 30 },
	{ x: 230, y: 170, w: 75, h: 65 },
	{ x: 90, y: 170, w: 35, h: 130 },
	{ x: 185, y: 170, w: 35, h: 130 },
	{ x: 135, y: 240, w: 40, h: 60, label: ["YOU", "■"] },
];

const PATHS = {
	bonnie: ["1A", "1B", "5", "2A", "2B", "left-door"],
	chica: ["1A", "1B", "7", "6", "4A", "4B", "right-door"],
	freddy: ["1A", "1B", "7", "4B", "right-door"],
	foxy: { stages: [0, 1, 2, 3], run: ["1C", "2A", "left-door"] },
};

// ===========================
// 2. SISTEMAS CORE
// ===========================

class GameClock {
	constructor() {
		this.hour = 0;
		this.elapsed = 0;
	}

	update(dt) {
		this.elapsed += dt;
		const newHour = Math.floor(this.elapsed / CONFIG.HOUR_DURATION);

		if (newHour > this.hour && newHour <= CONFIG.TOTAL_HOURS) {
			this.hour = newHour;
			return true; // Hora cambió
		}
		return false;
	}

	isComplete() {
		return this.hour >= CONFIG.TOTAL_HOURS;
	}

	getDisplay() {
		return `${this.hour === 0 ? 12 : this.hour} AM`;
	}

	reset() {
		this.hour = 0;
		this.elapsed = 0;
	}
}

class PowerSystem {
	constructor(night) {
		this.power = 100;
		this.baseDrain = CONFIG.BASE_POWER_DRAIN[night] || CONFIG.BASE_POWER_DRAIN[6];
	}

	update(dt, usage) {
		const mult = CONFIG.POWER_MULTIPLIERS[Math.min(usage, 4)];
		this.power = Math.max(0, this.power - this.baseDrain * mult * dt);
		return Math.floor(this.power);
	}

	drain(amt) {
		this.power = Math.max(0, this.power - amt);
	}

	isEmpty() {
		return this.power <= 0;
	}

	reset() {
		this.power = 100;
	}
}

// ===========================
// 3. ANIMATRÓNICOS
// ===========================

class Animatronic {
	constructor(name, path) {
		this.name = name;
		this.path = path;
		this.location = "1A";
		this.pathIndex = 0;
		this.aiLevel = 0;
		this.moveTimer = 0;
		this.atDoor = null;
		this.attackTimer = 0;
		this.watched = false;
	}

	setAI(level) {
		this.aiLevel = Math.max(0, Math.min(20, level));
	}

	update(dt, game) {
		if (this.aiLevel === 0) return;

		this.moveTimer += dt;
		const interval = CONFIG.AI_INTERVALS[this.name];

		if (this.moveTimer >= interval) {
			this.moveTimer = 0;
			if (Math.random() * 20 <= this.aiLevel) {
				this.move();
			}
		}

		if (this.atDoor) {
			this.updateAttack(dt, game);
		}
	}

	move() {
		if (this.pathIndex >= this.path.length - 1) return;

		this.pathIndex++;
		this.location = this.path[this.pathIndex];

		if (this.location.includes("door")) {
			this.atDoor = this.location.split("-")[0];
		}
	}

	updateAttack(dt, game) {
		const door = game.doors[this.atDoor];

		if (door.closed) {
			this.attackTimer = 0;
			return;
		}

		this.attackTimer += dt;
		const threshold = CONFIG.ATTACK_BASE_TIME - this.aiLevel * CONFIG.ATTACK_AI_MULTIPLIER;

		if (this.attackTimer >= threshold) {
			game.jumpscare(this.name);
		}
	}

	reset() {
		this.location = "1A";
		this.pathIndex = 0;
		this.atDoor = null;
		this.attackTimer = 0;
		this.watched = false;
		this.moveTimer = 0;
	}
}

class Foxy extends Animatronic {
	constructor() {
		super("foxy", PATHS.foxy.run);
		this.location = "1C";
		this.stage = 0;
		this.checkTimer = 0;
		this.hasRun = false;
	}

	update(dt, game) {
		if (this.aiLevel === 0) return;

		this.checkTimer += dt;

		if (this.checkTimer >= CONFIG.FOXY_CHECK_INTERVAL) {
			this.checkTimer = 0;

			if (!this.watched && this.stage < 3) {
				if (Math.random() * 20 <= this.aiLevel) {
					this.stage++;
				}
			}
			this.watched = false;
		}

		if (this.stage === 3 && !this.hasRun) {
			this.run(game);
		}
	}

	run(game) {
		this.location = "left-door";
		this.atDoor = "left";
		this.hasRun = true;
		game.audio.play("foxy_run");

		setTimeout(() => {
			if (game.doors.left.closed) {
				const damage = CONFIG.FOXY_BASE_DAMAGE + this.aiLevel * 0.5;
				game.power.drain(damage);
				game.audio.play("knock");
				this.reset();
			} else {
				game.jumpscare("foxy");
			}
		}, CONFIG.FOXY_DOOR_DELAY);
	}

	reset() {
		super.reset();
		this.location = "1C";
		this.stage = 0;
		this.hasRun = false;
		this.checkTimer = 0;
	}
}

class Freddy extends Animatronic {
	constructor() {
		super("freddy", PATHS.freddy);
	}

	move() {
		// Freddy solo se mueve si NO lo están mirando
		if (this.watched) {
			this.watched = false;
			return;
		}
		super.move();
	}
}

// ===========================
// 4. GESTOR PRINCIPAL
// ===========================

class Game {
	constructor(audio) {
		this.audio = audio;
		this.state = "menu";
		this.night = 1;
		this.clock = new GameClock();
		this.power = null;
		this.animatronics = {};
		this.assets = null;

		this.cameraOpen = false;
		this.selectedCam = "1A";
		this.doors = {
			left: { closed: false, light: false },
			right: { closed: false, light: false },
		};

		this.monitorHover = false;
		this.monitorLocked = false;
		this.lookOffset = 0;
	}

	async init() {
		this.assets = {
			images: await this.loadImages(ASSETS.images),
		};
	}

	async loadImages(tree, target = {}) {
		for (const key in tree) {
			const value = tree[key];

			if (typeof value === "string") {
				const img = new Image();
				img.src = value;
				await img.decode();
				target[key] = img;
			} else if (Array.isArray(value)) {
				target[key] = [];
				for (const src of value) {
					const img = new Image();
					img.src = src;
					await img.decode();
					target[key].push(img);
				}
			} else {
				target[key] = {};
				await this.loadImages(value, target[key]);
			}
		}
		return target;
	}

	start(night, custom = null) {
		this.night = night;
		this.state = "playing";

		this.clock.reset();
		this.power = new PowerSystem(night);

		this.animatronics = {
			freddy: new Freddy(),
			bonnie: new Animatronic("bonnie", PATHS.bonnie),
			chica: new Animatronic("chica", PATHS.chica),
			foxy: new Foxy(),
		};

		if (custom) {
			Object.keys(custom).forEach((n) => {
				if (this.animatronics[n]) {
					this.animatronics[n].setAI(custom[n]);
				}
			});
		} else {
			Object.keys(this.animatronics).forEach((n) => {
				const lvl = CONFIG.AI_LEVELS[n]?.[night - 1] || 0;
				this.animatronics[n].setAI(lvl);
			});
		}

		this.resetUI();
		this.audio.playLoop("ambient");

		console.log(`Night ${night} started`);
	}

	resetUI() {
		this.cameraOpen = false;
		this.selectedCam = "1A";
		this.doors.left = { closed: false, light: false };
		this.doors.right = { closed: false, light: false };
		this.monitorHover = false;
		this.monitorLocked = false;
		this.lookOffset = 0;
	}

	update(dt) {
		if (this.state !== "playing") return;

		// Actualizar reloj
		if (this.clock.update(dt)) {
			this.audio.play("chime");
			console.log(`Hour ${this.clock.hour} reached`);
		}

		// Verificar victoria
		if (this.clock.isComplete()) {
			this.win();
			return;
		}

		// Actualizar energía
		const usage = this.getUsage();
		this.power.update(dt, usage);

		// Verificar game over por energía
		if (this.power.isEmpty()) {
			this.powerOut();
			return;
		}

		// Actualizar animatrónicos
		this.updateAnimatronics(dt);
	}

	updateAnimatronics(dt) {
		Object.values(this.animatronics).forEach((a) => {
			// Marcar si está siendo observado
			if (this.cameraOpen && this.selectedCam === a.location) {
				a.watched = true;
			}
			a.update(dt, this);
		});
	}

	getUsage() {
		let count = 0;
		if (this.doors.left.closed) count++;
		if (this.doors.right.closed) count++;
		if (this.doors.left.light) count++;
		if (this.doors.right.light) count++;
		if (this.cameraOpen) count++;
		return count;
	}

	// Controles
	toggleDoor(side) {
		if (this.power.isEmpty()) {
			this.audio.play("error");
			return;
		}

		this.doors[side].closed = !this.doors[side].closed;
		this.audio.play("door");
	}

	setLight(side, on) {
		if (this.power.isEmpty()) {
			this.audio.play("error");
			return;
		}

		const door = this.doors[side];
		if (!door || door.light === on) return;

		door.light = on;
		on ? this.audio.playLoop("light") : this.audio.stopLoop("light");
	}

	handleMonitorHover(isHovering) {
		// Inicializar estado
		if (this.monitorHover === undefined) {
			this.monitorHover = false;
			this.monitorLocked = false;
		}

		// Mouse ENTRA a la zona
		if (isHovering && !this.monitorHover && !this.monitorLocked) {
			this.toggleCamera();
			this.monitorLocked = true;
		}

		// Mouse SALE de la zona
		if (!isHovering && this.monitorHover) {
			setTimeout(() => {
				this.monitorLocked = false;
			}, CONFIG.MONITOR_LOCK_DELAY);
		}

		this.monitorHover = isHovering;
	}

	toggleCamera() {
		if (this.power.isEmpty()) {
			this.audio.play("error");
			return;
		}

		this.cameraOpen = !this.cameraOpen;
		this.audio.play("cam_open");
	}

	changeCam(id) {
		if (!this.cameraOpen || !CAMERAS[id]) return;

		this.selectedCam = id;
		this.audio.play("cam_change");
	}

	// Estados del juego
	jumpscare(animatronicName) {
		if (this.state !== "playing") return;

		this.state = "jumpscare";
		this.audio.stopAll();
		this.audio.play("jumpscare");

		console.log(`Jumpscare by ${animatronicName}`);

		setTimeout(() => {
			this.gameOver();
		}, CONFIG.JUMPSCARE_DURATION);
	}

	powerOut() {
		if (this.state !== "playing") return;

		this.state = "powerout";
		this.audio.stopAll();
		this.audio.play("powerout");

		console.log("Power out!");

		setTimeout(() => {
			const delay =
				CONFIG.POWEROUT_MIN_DELAY +
				Math.random() * (CONFIG.POWEROUT_MAX_DELAY - CONFIG.POWEROUT_MIN_DELAY);

			setTimeout(() => {
				this.jumpscare("freddy");
			}, delay);
		}, 1000);
	}

	win() {
		if (this.state !== "playing") return;

		this.state = "won";
		this.audio.stopAll();
		this.audio.play("chime");

		console.log(`Night ${this.night} complete!`);

		setTimeout(() => {
			this.night++;
			localStorage.setItem("fnaf_night", this.night);

			// Reiniciar para siguiente noche o volver al menú
			this.exitToMenu();
		}, CONFIG.WIN_DELAY);
	}

	gameOver() {
		if (this.state === "gameover") return;

		this.state = "gameover";
		this.audio.stopAll();
		this.audio.play("static");

		console.log("Game Over!");

		setTimeout(() => {
			this.exitToMenu();
		}, CONFIG.GAMEOVER_DELAY);
	}

	exitToMenu() {
		this.audio.stopAll();
		this.state = "menu";
		changeScreen("mainMenu");
	}
}

// ===========================
// 5. AUDIO MANAGER
// ===========================

class AudioManager {
	constructor(assets) {
		this.assets = assets;
		this.sounds = {};
		this.loops = {};
	}

	loadAll() {
		for (const [name, src] of Object.entries(this.assets)) {
			const audio = new Audio(src);
			audio.preload = "auto";

			if (name === "ambient" || name === "light" || name === "toreador_march") {
				audio.loop = true;
				audio.volume = name === "ambient" ? 0.4 : 0.5;
				this.loops[name] = audio;
			} else {
				audio.volume = 0.7;
				this.sounds[name] = audio;
			}
		}
	}

	play(name) {
		const audio = this.sounds[name];
		if (!audio) {
			console.warn(`Sound not found: ${name}`);
			return;
		}

		audio.currentTime = 0;
		audio.play().catch((err) => console.warn(`Error playing ${name}:`, err));
	}

	playLoop(name) {
		const audio = this.loops[name];
		if (!audio || !audio.paused) return;

		audio.play().catch((err) => console.warn(`Error playing loop ${name}:`, err));
	}

	stop(name) {
		const audio = this.sounds[name] || this.loops[name];
		if (!audio) return;

		audio.pause();
		audio.currentTime = 0;
	}

	stopLoop(name) {
		const audio = this.loops[name];
		if (!audio) return;

		audio.pause();
	}

	stopAll() {
		[...Object.values(this.sounds), ...Object.values(this.loops)].forEach((a) => {
			a.pause();
			a.currentTime = 0;
		});
	}
}

// ===========================
// 6. RENDERIZADOR
// ===========================

class Renderer {
	constructor(canvas, assets) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.assets = assets;

		this.resize();
		window.addEventListener("resize", () => this.resize());
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	render(game) {
		const { ctx, canvas } = this;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		switch (game.state) {
			case "playing":
				if (game.cameraOpen) {
					this.renderCameras(game);
				} else {
					this.renderOffice(game);
				}
				this.renderHUD(game);
				break;

			case "jumpscare":
				this.renderJumpscare();
				break;

			case "powerout":
				this.renderPowerOut();
				break;

			case "won":
				this.renderWin(game);
				break;

			case "gameover":
				this.renderGameOver();
				break;
		}
	}

	renderOffice(game) {
		const { ctx, canvas } = this;
		let img = this.assets.images.office.base;

		if (game.doors.left.light) {
			img = this.assets.images.office.lights.left;
		} else if (game.doors.right.light) {
			img = this.assets.images.office.lights.right;
		} else {
			// Ver animatrónicos en la oficina
			for (const a of Object.values(game.animatronics)) {
				if (a.location === "left-door" && a.name === "bonnie") {
					img = this.assets.images.office.animatronics.bonnie;
					break;
				} else if (a.location === "right-door" && a.name === "chica") {
					img = this.assets.images.office.animatronics.chica;
					break;
				}
			}
		}

		// Fondo de oficina
		this.drawOfficeBackground(ctx, canvas, img, game.lookOffset);

		// Botón de monitor
		this.drawMonitorButton(ctx, canvas);
	}

	drawOfficeBackground(ctx, canvas, img, lookOffset = 0) {
		if (!(img instanceof HTMLImageElement)) {
			// Fallback si no hay imagen
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			return;
		}

		const viewRatio = canvas.width / canvas.height;
		const viewWidth = img.height * viewRatio;
		const maxOffset = img.width - viewWidth;
		const centerX = maxOffset / 2;
		const sx = Math.max(0, Math.min(maxOffset, centerX + lookOffset * (maxOffset / 2)));

		ctx.drawImage(img, sx, 0, viewWidth, img.height, 0, 0, canvas.width, canvas.height);
	}

	drawMonitorButton(ctx, canvas) {
		const bw = 200,
			bh = 40;
		const bx = canvas.width / 2 - bw / 2;
		const by = canvas.height - 60;

		this.drawHighlightRect(ctx, bx, by, bw, bh, "#222");
	}

	renderCameras(game) {
		const { ctx, canvas } = this;

		ctx.fillStyle = "#001100";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = "#0f0";
		ctx.lineWidth = 3;
		ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

		ctx.fillStyle = "#0f0";
		ctx.font = "24px monospace";
		ctx.fillText(`CAM ${game.selectedCam} - ${CAMERAS[game.selectedCam].name}`, 70, 90);

		// Mostrar animatrónicos presentes
		const present = Object.values(game.animatronics)
			.filter((a) => a.location === game.selectedCam)
			.map((a) => a.name);

		if (present.length > 0) {
			ctx.fillStyle = "#f00";
			ctx.font = "20px monospace";
			ctx.textAlign = "center";
			ctx.fillText(`[${present.join(", ")}]`, canvas.width / 2, canvas.height / 2);
			ctx.textAlign = "left";
		}

		// Foxy stages especiales
		if (game.selectedCam === "1C") {
			const foxy = game.animatronics.foxy;
			ctx.fillStyle = "#ff0";
			ctx.font = "16px monospace";
			ctx.textAlign = "center";
			ctx.fillText(`Stage: ${foxy.stage}/3`, canvas.width / 2, canvas.height / 2 + 40);
			ctx.textAlign = "left";
		}

		// Mapa y botones
		const mapX = canvas.width - 400;
		const mapY = canvas.height - 400;

		this.renderCameraMap(ctx, mapX, mapY);
		this.renderCameraButtons(ctx, game.selectedCam, mapX-50, mapY-50);
		this.drawMonitorButton(ctx, canvas);
	}

	renderCameraMap(ctx, offsetX, offsetY) {
		ctx.save();
		ctx.translate(offsetX, offsetY);

		for (const rect of MAP_LAYOUT) {
			this.drawStrokeRect(ctx, rect.x, rect.y, rect.w, rect.h);

			if (rect.label) {
				this.drawMultilineText(ctx, rect.label, rect.x + rect.w / 2, rect.y + rect.h / 2);
			}
		}

		ctx.restore();
	}

	renderCameraButtons(ctx, currentCam, offsetX, offsetY) {
		ctx.save();
		ctx.translate(offsetX, offsetY);

		for (const id in CAMERAS) {
			const cam = CAMERAS[id];
			const b = cam.button;
			const isSelected = id === currentCam;

			if (isSelected) {
				this.drawHighlightRect(ctx, b.x, b.y, b.w, b.h, "#7a0");
				this.drawText(ctx, `CAM ${id}`, b.x + b.w / 2, b.y + b.h / 2, { color: "#000" });
			} else {
				this.drawHighlightRect(ctx, b.x, b.y, b.w, b.h, "#444");
				this.drawText(ctx, `CAM ${id}`, b.x + b.w / 2, b.y + b.h / 2);
			}
		}

		ctx.restore();
	}

	// Helpers de dibujo
	drawStrokeRect(ctx, x, y, w, h, color = "#fff", lineWidth = 2) {
		ctx.save();
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.strokeRect(x, y, w, h);
		ctx.restore();
	}

	drawRect(ctx, x, y, w, h, color = "#fff", alpha = 1) {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
		ctx.restore();
	}

	drawHighlightRect(ctx, x, y, w, h, bgColor = "#fff") {
		this.drawRect(ctx, x, y, w, h, bgColor);
		this.drawStrokeRect(ctx, x, y, w, h, "#fff", 3);
	}

	drawText(ctx, text, x, y, options = {}) {
		const {
			color = "#fff",
			font = "12px monospace",
			align = "center",
			baseline = "middle",
			alpha = 1,
		} = options;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.font = font;
		ctx.textAlign = align;
		ctx.textBaseline = baseline;
		ctx.fillText(text, x, y);
		ctx.restore();
	}

	drawMultilineText(ctx, lines, x, y, options = {}) {
		if (!Array.isArray(lines)) return;

		const { lineHeight = 12 } = options;
		const totalHeight = (lines.length - 1) * lineHeight;
		const startY = y - totalHeight / 2;

		lines.forEach((line, i) => {
			this.drawText(ctx, line, x, startY + i * lineHeight, options);
		});
	}

	renderHUD(game) {
		const { ctx } = this;
		this.drawText(ctx, `Time: ${game.clock.getDisplay()}`, (canvas.width - 180), 70, { align: "left", font: "20px monospace" });
		this.drawText(ctx, `Night ${game.night}`, (canvas.width - 180), 95, { align: "left", font: "20px monospace" });
		this.drawText(ctx, `Power: ${game.power.power.toFixed(0)}%`, 70, (canvas.height - 90), { align: "left", font: "20px monospace" });
		this.drawText(ctx, `Usage:`, 70, (canvas.height - 70), { align: "left", font: "20px monospace" });

		// Barras de uso
		const usage = Math.max(0, Math.min(5, game.getUsage()));
		const usageColors = ["#0f0", "#0f0", "#ff0", "#f00", "#f00"];
		for (let i = 0; i < usage; i++) {
			this.drawRect(ctx, 140 + i * 20, (canvas.height - 80), 18, 20, usageColors[i]);
		}
	}

	renderJumpscare() {
		const { ctx, canvas } = this;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#f00";
		ctx.font = "72px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("JUMPSCARE!", canvas.width / 2, canvas.height / 2);

		// Reset
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
	}

	renderPowerOut() {
		const { ctx, canvas } = this;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#333";
		ctx.font = "24px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Power Out...", canvas.width / 2, canvas.height / 2);

		// Reset
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
	}

	renderWin(game) {
		const { ctx, canvas } = this;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#0f0";
		ctx.font = "48px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("6 AM", canvas.width / 2, canvas.height / 2);
		ctx.fillText(`Night ${game.night} Complete!`, canvas.width / 2, canvas.height / 2 + 60);

		// Reset
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
	}

	renderGameOver() {
		const { ctx, canvas } = this;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "#f00";
		ctx.font = "64px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

		// Reset
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
	}
}

// ===========================
// 7. CONTROLADOR DE INPUT
// ===========================

class Input {
	constructor(canvas, game) {
		this.canvas = canvas;
		this.game = game;
		this.mouse = { x: 0, y: 0 };

		this.setupListeners();
	}

	setupListeners() {
		this.canvas.addEventListener("mousemove", (e) => this.onMove(e));
		this.canvas.addEventListener("click", (e) => this.onClick(e));
		document.addEventListener("keydown", (e) => this.onKeyDown(e));
		document.addEventListener("keyup", (e) => this.onKeyUp(e));
	}

	onMove(e) {
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		this.mouse.x = (e.clientX - rect.left) * scaleX;
		this.mouse.y = (e.clientY - rect.top) * scaleY;

		// Detectar hover sobre botón de monitor
		const hovering = this.isHoveringMonitor();
		this.game.handleMonitorHover(hovering);

		// Actualizar cursor
		this.updateCursor();
	}

	isHoveringMonitor() {
		const { x, y } = this.mouse;
		const { width: w, height: h } = this.canvas;

		const bx = w / 2 - 100;
		const by = h - 60;

		return x > bx && x < bx + 200 && y > by && y < by + 40;
	}

	updateCursor() {
		if (this.game.state !== "playing") {
			this.canvas.style.cursor = "default";
			return;
		}

		const isInteractive =
			this.isHoveringMonitor() || this.isHoveringDoor() || this.isHoveringCameraButton();

		this.canvas.style.cursor = isInteractive ? "pointer" : "default";
	}

	isHoveringDoor() {
		const { x, y } = this.mouse;
		const { width: w, height: h } = this.canvas;

		const leftDoor = x < 120 && y > h / 2 - 100 && y < h / 2 + 100;
		const rightDoor = x > w - 120 && y > h / 2 - 100 && y < h / 2 + 100;

		return leftDoor || rightDoor;
	}

	isHoveringCameraButton() {
		if (!this.game.cameraOpen) return false;

		const { x, y } = this.mouse;
		const { width: w, height: h } = this.canvas;

		for (const id in CAMERAS) {
			const b = CAMERAS[id].button;
			const bx = w - 450 + b.x;
			const by = h - 450 + b.y;

			if (x > bx && x < bx + b.w && y > by && y < by + b.h) {
				return true;
			}
		}

		return false;
	}

	onClick(e) {
		if (this.game.state !== "playing") return;

		const { x, y } = this.mouse;
		const { width: w, height: h } = this.canvas;

		// Puertas (solo en oficina)
		if (!this.game.cameraOpen) {
			// Puerta izquierda
			if (x < 120 && y > h / 2 - 100 && y < h / 2 + 100) {
				this.game.toggleDoor("left");
				return;
			}

			// Puerta derecha
			if (x > w - 120 && y > h / 2 - 100 && y < h / 2 + 100) {
				this.game.toggleDoor("right");
				return;
			}
		}

		// Botones de cámaras (solo cuando están abiertas)
		if (this.game.cameraOpen) {
			for (const id in CAMERAS) {
				const b = CAMERAS[id].button;
				const bx = w - 450 + b.x;
				const by = h - 450 + b.y;

				if (x > bx && x < bx + b.w && y > by && y < by + b.h) {
					this.game.changeCam(id);
					return;
				}
			}
		}
	}

	onKeyDown(e) {
		if (this.game.state !== "playing") return;
		if (e.repeat) return;

		const k = e.key.toLowerCase();

		// Controles generales
		if (k === " ") {
			e.preventDefault();
			this.game.toggleCamera();
		}

		if (k === "a") this.game.toggleDoor("left");
		if (k === "d") this.game.toggleDoor("right");

		// Luces: PRESIONAR = ENCENDER
		if (k === "q") this.game.setLight("left", true);
		if (k === "e") this.game.setLight("right", true);

		// Navegación de cámaras
		if (this.game.cameraOpen) {
			if (k === "arrowleft") this.cycleCam(-1);
			if (k === "arrowright") this.cycleCam(1);
		}

		// Escape
		if (k === "escape") {
			this.game.exitToMenu();
		}
	}

	onKeyUp(e) {
		if (this.game.state !== "playing") return;

		const k = e.key.toLowerCase();

		// Luces: SOLTAR = APAGAR
		if (k === "q") this.game.setLight("left", false);
		if (k === "e") this.game.setLight("right", false);
	}

	cycleCam(dir) {
		const cams = Object.keys(CAMERAS);
		const idx = cams.indexOf(this.game.selectedCam);
		const next = (idx + dir + cams.length) % cams.length;
		this.game.changeCam(cams[next]);
	}
}

// ===========================
// 8. INICIALIZACIÓN Y LOOP PRINCIPAL
// ===========================

const audio = new AudioManager(ASSETS.sounds);
audio.loadAll();

const game = new Game(audio);
const canvas = document.getElementById("game-canvas");
let renderer = null;
const input = new Input(canvas, game);

let lastTime = 0;
let running = false;

function gameLoop(timestamp) {
	if (!running) return;

	const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
	lastTime = timestamp;

	game.update(dt);

	if (renderer) {
		renderer.render(game);
	}

	requestAnimationFrame(gameLoop);
}

// ===========================
// 9. INTEGRACIÓN CON MENÚ HTML
// ===========================

async function playGame(night = 1, customLevels = null) {
	changeScreen("gameplay");

	// Inicializar assets si es primera vez
	if (!game.assets) {
		await game.init();
	}

	// Crear renderer si no existe
	if (!renderer) {
		renderer = new Renderer(canvas, game.assets);
	}

	game.start(night, customLevels);
	running = true;
	lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

// Sistema de pantallas
const screens = {
	disclaimer: document.getElementById("screen-disclaimer"),
	mainMenu: document.getElementById("screen-main-menu"),
	custom: document.getElementById("screen-custom-night"),
	gameplay: document.getElementById("screen-gameplay"),
	credits: document.getElementById("screen-credits"),
};

let currentScreen = "disclaimer";

function changeScreen(target) {
	if (currentScreen === target) return;

	screens[currentScreen]?.classList.remove("active");
	currentScreen = target;
	screens[currentScreen]?.classList.add("active");

	running = target === "gameplay";

	// Detener audio del menú si sales de él
	if (target !== "mainMenu" && target !== "custom") {
		audio.stopAll();
	}
}

// Event listeners del menú
screens.disclaimer?.addEventListener("click", () => {
	changeScreen("mainMenu");
	audio.playLoop("menu");
});

document.getElementById("new")?.addEventListener("click", () => {
	localStorage.removeItem("fnaf_night");
	playGame(1);
});

document.getElementById("continue")?.addEventListener("click", () => {
	const savedNight = parseInt(localStorage.getItem("fnaf_night")) || 2;
	playGame(Math.min(savedNight, 6));
});

document.getElementById("6th-night")?.addEventListener("click", () => {
	playGame(6);
});

document.getElementById("custom")?.addEventListener("click", () => {
	changeScreen("custom");
});

document.getElementById("back-to-main-menu")?.addEventListener("click", () => {
	changeScreen("mainMenu");
});

document.getElementById("start-custom-night")?.addEventListener("click", () => {
	// Leer valores de los sliders de custom night
	const customLevels = {
		freddy: parseInt(document.querySelector("#custom-menu li:nth-child(2) span")?.textContent) || 0,
		bonnie: parseInt(document.querySelector("#custom-menu li:nth-child(3) span")?.textContent) || 0,
		chica: parseInt(document.querySelector("#custom-menu li:nth-child(4) span")?.textContent) || 0,
		foxy: parseInt(document.querySelector("#custom-menu li:nth-child(5) span")?.textContent) || 0,
	};

	playGame(7, customLevels);
});

// Configurar custom night sliders
const MIN_AI = 0;
const MAX_AI = 20;

document.querySelectorAll("#custom-menu li").forEach((li, index) => {
	// Saltar el primer elemento (Start Night) y el último (Back)
	if (index === 0 || index === 6) return;

	const buttons = li.querySelectorAll("button");
	const label = li.querySelector("p");
	const valueSpan = li.querySelector("span");

	if (!label || !valueSpan || buttons.length !== 2) return;

	const minus = buttons[0];
	const plus = buttons[1];

	let currentValue = parseInt(valueSpan.textContent) || 0;

	minus.addEventListener("click", () => {
		currentValue = Math.max(MIN_AI, currentValue - 1);
		valueSpan.textContent = currentValue;
	});

	plus.addEventListener("click", () => {
		currentValue = Math.min(MAX_AI, currentValue + 1);
		valueSpan.textContent = currentValue;
	});
});

// Log de inicio
console.log("FNAF Game initialized");
console.log("Controls:");
console.log("  SPACE - Toggle cameras");
console.log("  A/D - Left/Right doors");
console.log("  Q/E - Left/Right lights (hold)");
console.log("  Arrow Keys - Navigate cameras");
console.log("  ESC - Exit to menu");

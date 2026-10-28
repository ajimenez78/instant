import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const mount = document.querySelector("#game");
const overlay = document.querySelector("#overlay");
const startButton = document.querySelector("#startButton");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#777768");
scene.fog = new THREE.Fog("#777768", 17, 48);

const camera = new THREE.PerspectiveCamera(73, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.68, 8);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight("#e4d8b8", "#30332b", 2.1));
const sun = new THREE.DirectionalLight("#ffe0a6", 3.2);
sun.position.set(-7, 12, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -17;
sun.shadow.camera.right = 17;
sun.shadow.camera.top = 17;
sun.shadow.camera.bottom = -17;
scene.add(sun);

const mats = {
  floor: new THREE.MeshStandardMaterial({ color: "#777461", roughness: 1 }),
  wall: new THREE.MeshStandardMaterial({ color: "#65675c", roughness: .95 }),
  wallLight: new THREE.MeshStandardMaterial({ color: "#898776", roughness: .9 }),
  dark: new THREE.MeshStandardMaterial({ color: "#35392f", roughness: .72 }),
  accent: new THREE.MeshStandardMaterial({ color: "#c5d85d", roughness: .62 }),
  rust: new THREE.MeshStandardMaterial({ color: "#a45f43", roughness: .75 }),
  bot: new THREE.MeshStandardMaterial({ color: "#e7754e", roughness: .48, metalness: .18 }),
  botDark: new THREE.MeshStandardMaterial({ color: "#34372f", roughness: .55, metalness: .25 }),
  botArmor: new THREE.MeshStandardMaterial({ color: "#55584d", roughness: .42, metalness: .62 }),
  botRed: new THREE.MeshStandardMaterial({ color: "#9e382e", roughness: .4, metalness: .35 }),
  botGlow: new THREE.MeshStandardMaterial({ color: "#ff603d", emissive: "#f02e12", emissiveIntensity: 3 }),
  eye: new THREE.MeshStandardMaterial({ color: "#ffc46a", emissive: "#e05b1b", emissiveIntensity: 2.8 }),
};

const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), mats.floor);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(34, 34, "#99947a", "#99947a");
grid.position.y = .012;
grid.material.transparent = true;
grid.material.opacity = .22;
scene.add(grid);

function box(x, y, z, w, h, d, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

box(0, 2, -17, 34, 4, .7, mats.wall);
box(0, 2, 17, 34, 4, .7, mats.wall);
box(-17, 2, 0, .7, 4, 34, mats.wall);
box(17, 2, 0, .7, 4, 34, mats.wall);
for (let x = -14; x <= 14; x += 4) {
  box(x, .12, -16.57, 2.4, .12, .04, x % 8 === 0 ? mats.accent : mats.rust, false);
  box(x, .12, 16.57, 2.4, .12, .04, x % 8 === 0 ? mats.accent : mats.rust, false);
}
for (const x of [-14, 14]) {
  for (const z of [-14, 14]) {
    box(x, 2.6, z, 1.5, 5.2, 1.5, mats.dark);
    box(x, 5.27, z, 1.85, .16, 1.85, mats.accent);
  }
}
const blocks = [
  [-6, -4, 3.3, 1.3, 1.3], [5, -5, 3.8, 1.4, 1.5],
  [-8, 4, 2.8, 2, 1.25], [7, 5, 3.1, 1.5, 1.5],
  [0, -9, 2, 1, 1], [-1, 9, 2.1, 1, 1],
];
for (const [x, z, w, h, d] of blocks) {
  box(x, h / 2, z, w, h, d, mats.dark);
  box(x, h + .025, z, w + .08, .05, d + .08, mats.rust, false);
  box(x, h / 2, z, .07, h + .02, d + .02, mats.accent, false);
}
for (let i = 0; i < 10; i++) {
  const x = (i % 5 - 2) * 5.6;
  const z = i < 5 ? -16.59 : 16.59;
  box(x, 2.2, z, .1, .14, .04, mats.accent, false);
  box(x, 2.2, z < 0 ? -16.565 : 16.565, .05, 2.4, .035, mats.rust, false);
}

const bot = new THREE.Group();
function botPart(geometry, material, x, y, z, castShadow = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  bot.add(mesh);
  return mesh;
}
const botBody = new THREE.Mesh(new THREE.BoxGeometry(.83, 1.02, .55), mats.bot);
botBody.position.y = 1.08; botBody.castShadow = true; botBody.receiveShadow = true; bot.add(botBody);
const chest = new THREE.Mesh(new THREE.BoxGeometry(.62, .25, .59), mats.botDark);
chest.position.set(0, 1.17, -.02); chest.castShadow = true; bot.add(chest);
const head = new THREE.Mesh(new THREE.BoxGeometry(.66, .52, .56), mats.botDark);
head.position.y = 1.91; head.castShadow = true; bot.add(head);
botPart(new THREE.BoxGeometry(.52, .16, .08), mats.botRed, 0, 2.01, .31);
const eyeBar = botPart(new THREE.BoxGeometry(.43, .065, .035), mats.eye, 0, 2.01, .36);
botPart(new THREE.BoxGeometry(.075, .1, .035), mats.botArmor, 0, 1.86, .32);
botPart(new THREE.BoxGeometry(.29, .1, .05), mats.botArmor, 0, 2.22, .02);
botPart(new THREE.BoxGeometry(.16, .28, .17), mats.botRed, 0, 2.36, -.03);
for (const side of [-1, 1]) {
  botPart(new THREE.BoxGeometry(.14, .3, .18), mats.botArmor, side * .38, 1.94, -.02);
  botPart(new THREE.BoxGeometry(.11, .13, .12), mats.botGlow, side * .39, 2.11, .04);
  botPart(new THREE.BoxGeometry(.35, .58, .48), mats.botArmor, side * .59, 1.38, .03);
  botPart(new THREE.BoxGeometry(.25, .11, .5), mats.botRed, side * .59, 1.55, .02);
  botPart(new THREE.BoxGeometry(.32, .38, .43), mats.bot, side * .65, .93, .02);
  botPart(new THREE.BoxGeometry(.37, .22, .42), mats.botArmor, side * .23, .49, .015);
  botPart(new THREE.BoxGeometry(.33, .13, .055), mats.botRed, side * .23, .49, .24);
  botPart(new THREE.BoxGeometry(.36, .12, .53), mats.botArmor, side * .23, .16, .015);
}
botPart(new THREE.BoxGeometry(.5, .45, .35), mats.botDark, 0, 1.55, -.4);
botPart(new THREE.BoxGeometry(.36, .26, .12), mats.botRed, 0, 1.58, -.6);
botPart(new THREE.BoxGeometry(.17, .11, .04), mats.botGlow, 0, 1.58, -.67);
botPart(new THREE.BoxGeometry(.2, .15, .16), mats.botArmor, 0, 1.09, .32);
botPart(new THREE.BoxGeometry(.1, .08, .045), mats.botGlow, 0, 1.09, .41);
for (const side of [-1, 1]) {
  botPart(new THREE.BoxGeometry(.13, .35, .16), mats.botRed, side * .35, 1.12, .3);
}
const rifle = new THREE.Group();
rifle.position.set(.72, 1.22, .22);
rifle.rotation.x = -.06;
bot.add(rifle);
const rifleParts = [
  [new THREE.BoxGeometry(.23, .21, .66), mats.botArmor, 0, 0, .04],
  [new THREE.BoxGeometry(.19, .13, .39), mats.botRed, 0, .12, .02],
  [new THREE.BoxGeometry(.13, .13, .38), mats.botDark, 0, -.16, -.01],
  [new THREE.BoxGeometry(.1, .1, .27), mats.botArmor, 0, -.3, -.24],
  [new THREE.BoxGeometry(.105, .12, .42), mats.botDark, 0, .01, .53],
  [new THREE.BoxGeometry(.13, .13, .12), mats.botGlow, 0, .02, .77],
  [new THREE.BoxGeometry(.12, .08, .14), mats.accent, 0, .15, .04],
  [new THREE.BoxGeometry(.055, .05, .34), mats.botGlow, 0, .115, .29],
];
for (const [geometry, material, x, y, z] of rifleParts) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  part.castShadow = true;
  rifle.add(part);
}
botPart(new THREE.BoxGeometry(.24, .12, .2), mats.botArmor, .55, 1.04, .2);
botPart(new THREE.BoxGeometry(.12, .4, .12), mats.botRed, -.3, 2.42, -.14);
botPart(new THREE.BoxGeometry(.18, .07, .16), mats.botArmor, -.3, 2.62, -.14);
const shoulderGeo = new THREE.BoxGeometry(.31, .48, .4);
for (const side of [-1, 1]) {
  const shoulder = new THREE.Mesh(shoulderGeo, mats.bot);
  shoulder.position.set(side * .56, 1.32, -.01); shoulder.castShadow = true; bot.add(shoulder);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(.3, .64, .37), mats.botDark);
  leg.position.set(side * .23, .36, 0); leg.castShadow = true; bot.add(leg);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(.39, .16, .52), mats.dark);
  foot.position.set(side * .23, .08, -.06); foot.castShadow = true; bot.add(foot);
}
bot.position.set(0, 0, -8);
scene.add(bot);
bot.userData.health = 100;
bot.userData.alive = true;

const keys = new Set();
const raycaster = new THREE.Raycaster();
const shootable = [botBody, chest, head, eyeBar, ...bot.children.filter((part) => part.geometry?.type === "BoxGeometry")];
const magazineSize = 12;
const reloadDuration = 1.15;
let active = false;
let health = 100;
let ammo = magazineSize;
let score = 0;
let elapsed = 0;
let fireCooldown = 0;
let reloadTimer = 0;
let enemyCooldown = .72;
let threatHudTimer = 0;
let toastTimeout;
const clock = new THREE.Clock();
const playerPos = camera.position;
const arenaLimit = 15.1;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function setPlayerHealth(value) {
  health = clamp(value, 0, 100);
  document.querySelector("#playerHealth").textContent = String(health).padStart(3, "0");
  const meter = document.querySelector("#playerMeter");
  meter.style.width = `${health}%`;
  meter.style.background = health <= 30 ? "#f17d57" : "";
  document.querySelector(".health-value").style.color = health <= 30 ? "#f17d57" : "";
}
function updateBotHealth() {
  const value = Math.max(0, bot.userData.health);
  document.querySelector("#botHealth").textContent = String(value).padStart(3, "0");
  document.querySelector("#botMeter").style.width = `${value}%`;
}
function updateAmmo() {
  document.querySelector("#ammoCount").textContent = String(ammo).padStart(2, "0");
  document.querySelector("#ammoPanel").classList.toggle("reloading", reloadTimer > 0);
  document.querySelector("#ammoHint").textContent = reloadTimer > 0 ? "RELOADING..." : "SPACE FIRE  ·  R RELOAD";
  document.querySelector("#crosshair").classList.toggle("empty", ammo === 0);
}
function startReload() {
  if (!active || ammo === magazineSize || reloadTimer > 0) return;
  reloadTimer = reloadDuration;
  updateAmmo();
  showToast("RELOADING");
}
function updateThreatHud() {
  const distance = Math.hypot(playerPos.x - bot.position.x, playerPos.z - bot.position.z);
  document.querySelector("#botRange").textContent = `${Math.round(distance).toString().padStart(2, "0")} M`;
  document.querySelector("#botStatus").textContent = distance < 5 ? "ENGAGING" : distance > 10 ? "CLOSING" : "HUNTING";
}
updateThreatHud();
function flashDamage() {
  const flash = document.querySelector("#damageFlash");
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 650);
}
function finish(won) {
  active = false;
  keys.clear();
  document.querySelector("#modalEyebrow").textContent = won ? "TARGET NEUTRALIZED &nbsp; / &nbsp; MATCH COMPLETE" : "VITALS DEPLETED &nbsp; / &nbsp; MATCH COMPLETE";
  document.querySelector("#modalTitle").innerHTML = won ? "NICE<br /><span>WORK.</span>" : "GAME<br /><span>OVER.</span>";
  document.querySelector("#modalIntro").textContent = won
    ? `The arena is yours. You took down the bot in ${document.querySelector("#timer").textContent}. Ready for another round?`
    : "The training bot got the better of you this time. Reset, get moving, and take another shot.";
  startButton.textContent = "PLAY AGAIN  ↗";
  overlay.classList.remove("hidden");
}
function resetGame() {
  health = 100;
  score = 0;
  elapsed = 0;
  ammo = magazineSize;
  fireCooldown = 0;
  reloadTimer = 0;
  enemyCooldown = .72;
  threatHudTimer = 0;
  camera.position.set(0, 1.68, 8);
  camera.rotation.set(0, 0, 0);
  bot.position.set(0, 0, -8);
  bot.rotation.set(0, 0, 0);
  bot.userData.health = 100;
  bot.userData.alive = true;
  bot.visible = true;
  document.querySelector("#score").textContent = "00";
  document.querySelector("#timer").textContent = "00:00";
  updateAmmo();
  updateThreatHud();
  document.querySelector("#modalEyebrow").textContent = "ONE ON ONE &nbsp; / &nbsp; ARENA COMBAT";
  document.querySelector("#modalTitle").innerHTML = "LAST<br /><span>LIGHT.</span>";
  document.querySelector("#modalIntro").textContent = "One arena. One opponent. No second chances. Take down the training bot before it takes you out.";
  startButton.textContent = "ENTER THE ARENA  ↗";
  setPlayerHealth(100);
  updateBotHealth();
}

function shoot() {
  if (!active || fireCooldown > 0 || reloadTimer > 0) return;
  if (ammo === 0) {
    startReload();
    return;
  }
  fireCooldown = .24;
  ammo -= 1;
  updateAmmo();
  const crosshair = document.querySelector("#crosshair");
  crosshair.classList.add("firing");
  setTimeout(() => crosshair.classList.remove("firing"), 90);
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(shootable, false);
  if (hits.length && bot.userData.alive) {
    crosshair.classList.add("hit");
    setTimeout(() => crosshair.classList.remove("hit"), 150);
    bot.userData.health = Math.max(0, bot.userData.health - 25);
    updateBotHealth();
    showToast("TARGET HIT");
    if (bot.userData.health === 0) {
      bot.userData.alive = false;
      bot.visible = false;
      score = 1;
      document.querySelector("#score").textContent = "01";
      setTimeout(() => finish(true), 500);
    }
  }
  if (ammo === 0 && bot.userData.alive) startReload();
}

function moveBot(dt) {
  if (!bot.userData.alive) return;
  const dx = playerPos.x - bot.position.x;
  const dz = playerPos.z - bot.position.z;
  const distance = Math.hypot(dx, dz);
  bot.rotation.y = Math.atan2(dx, dz);
  if (distance > 4.3) {
    const speed = distance > 9 ? 2.15 : 1.3;
    const nx = bot.position.x + (dx / distance) * speed * dt;
    const nz = bot.position.z + (dz / distance) * speed * dt;
    const blocked = blocks.some(([x, z, w, , d]) => Math.abs(nx - x) < w / 2 + .65 && Math.abs(nz - z) < d / 2 + .65);
    if (!blocked) {
      bot.position.x = clamp(nx, -arenaLimit, arenaLimit);
      bot.position.z = clamp(nz, -arenaLimit, arenaLimit);
    } else {
      bot.position.x = clamp(bot.position.x + Math.sign(-dz) * speed * dt, -arenaLimit, arenaLimit);
    }
  }
  bot.position.y = Math.abs(Math.sin(elapsed * 4)) * .045;
  enemyCooldown -= dt;
  if (enemyCooldown <= 0 && distance < 13) {
    enemyCooldown = .65 + Math.random() * .35;
    const angleToBot = Math.atan2(dx, dz);
    const angleDifference = Math.abs(THREE.MathUtils.euclideanModulo(camera.rotation.y - angleToBot + Math.PI, Math.PI * 2) - Math.PI);
    const clearShot = !blocks.some(([x, z, w, , d]) =>
      Math.abs((x - bot.position.x) * dz - (z - bot.position.z) * dx) / Math.max(distance, .01) < Math.max(w, d) * .55 &&
      Math.hypot(x - bot.position.x, z - bot.position.z) < distance - .8
    );
    if (angleDifference < 1.05 && clearShot) {
      setPlayerHealth(health - (9 + Math.floor(Math.random() * 6)));
      flashDamage();
      if (health === 0) finish(false);
    }
  }
}

function update(dt) {
  if (!active) return;
  elapsed += dt;
  fireCooldown = Math.max(0, fireCooldown - dt);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = Math.floor(elapsed % 60).toString().padStart(2, "0");
  document.querySelector("#timer").textContent = `${minutes}:${seconds}`;
  if (reloadTimer > 0) {
    reloadTimer = Math.max(0, reloadTimer - dt);
    if (reloadTimer === 0) {
      ammo = magazineSize;
      updateAmmo();
      showToast("MAGAZINE READY");
    }
  }
  threatHudTimer -= dt;
  if (threatHudTimer <= 0) {
    threatHudTimer = .15;
    updateThreatHud();
  }
  if (keys.has("ArrowLeft")) camera.rotation.y += 1.8 * dt;
  if (keys.has("ArrowRight")) camera.rotation.y -= 1.8 * dt;
  const direction = new THREE.Vector3();
  if (keys.has("ArrowUp")) direction.z -= 1;
  if (keys.has("ArrowDown")) direction.z += 1;
  if (direction.lengthSq()) {
    direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
    const nx = clamp(playerPos.x + direction.x * 4.2 * dt, -arenaLimit, arenaLimit);
    const nz = clamp(playerPos.z + direction.z * 4.2 * dt, -arenaLimit, arenaLimit);
    const blocked = blocks.some(([x, z, w, , d]) => Math.abs(nx - x) < w / 2 + .48 && Math.abs(nz - z) < d / 2 + .48);
    if (!blocked) {
      playerPos.x = nx;
      playerPos.z = nz;
    }
  }
  if (keys.has("Space")) shoot();
  moveBot(dt);
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .05);
  update(dt);
  renderer.render(scene, camera);
}
animate();

startButton.addEventListener("click", () => {
  resetGame();
  active = true;
  overlay.classList.add("hidden");
});
window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (event.code === "Space") keys.add("Space");
  else if (event.code === "KeyR" && !event.repeat) startReload();
  else if (event.key.startsWith("Arrow")) keys.add(event.key);
});
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") keys.delete("Space");
  else keys.delete(event.key);
});
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});

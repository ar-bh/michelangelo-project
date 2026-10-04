import "./style.css";
import "@fontsource/cinzel/latin-600.css";
import "@fontsource/cinzel/latin-700.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-600.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { works } from "./content.js";

const tabsEl = document.querySelector("#tabs");
const viewerEl = document.querySelector("#viewer");
const hintEl = document.querySelector("#hint");
const statusEl = document.querySelector("#status");
const kickerEl = document.querySelector("#kicker");
const headingEl = document.querySelector("#heading");
const pointsEl = document.querySelector("#points");
const resetEl = document.querySelector("#reset");
const spotBlockEl = document.querySelector("#spot-block");
const spotsEl = document.querySelector("#spots");
const creditEl = document.querySelector("#credit");

const placing = new URLSearchParams(location.search).has("place");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
viewerEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = !reduceMotion;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.7;

scene.add(new THREE.AmbientLight(0xfff6ea, 0.38));
scene.add(new THREE.HemisphereLight(0xfff8ee, 0x3a3128, 0.55));

const key = new THREE.DirectionalLight(0xfff4e4, 2.5);
key.position.set(-4, 7, 5);
scene.add(key);

const fill = new THREE.DirectionalLight(0xd5deea, 0.75);
fill.position.set(6, 2, 3);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xf0d2a4, 0.95);
rim.position.set(1, 4, -6);
scene.add(rim);

const marble = new THREE.MeshStandardMaterial({
  color: 0xd9d3c6,
  roughness: 0.72,
  metalness: 0,
  flatShading: true,
});

if (placing) {
  scene.add(new THREE.AxesHelper(1.25));
  window.__sample = (clientX, clientY) => {
    setPointer({ clientX, clientY });
    const hits = modelRoot ? raycaster.intersectObject(modelRoot, true) : [];
    if (!hits.length) return null;
    const point = hits[0].point;
    return [Number(point.x.toFixed(3)), Number(point.y.toFixed(3)), Number(point.z.toFixed(3))];
  };
  window.__pins = () => {
    const rect = renderer.domElement.getBoundingClientRect();
    return pins.map((pin) => {
      const projected = pin.position.clone().project(camera);
      return {
        id: pin.userData.id,
        x: Math.round((projected.x * 0.5 + 0.5) * rect.width + rect.left),
        y: Math.round((-projected.y * 0.5 + 0.5) * rect.height + rect.top),
        pos: pin.position.toArray().map((value) => Number(value.toFixed(3))),
      };
    });
  };
}

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
loader.setDRACOLoader(draco);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const pinTextures = {
  idle: new Map(),
  active: new Map(),
};

let activeWork = works[0];
let selectedId = null;
let hoveredId = null;
let modelRoot = null;
let modelRadius = 1;
let pins = [];
let loadToken = 0;
let cameraTween = null;
let pointerDown = null;

buildTabs();
bindUi();
loadWork(activeWork);
requestAnimationFrame(tick);

function buildTabs() {
  works.forEach((work, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab";
    button.id = `tab-${work.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "panel");
    button.setAttribute("aria-selected", index === 0 ? "true" : "false");
    button.tabIndex = index === 0 ? 0 : -1;
    button.textContent = work.tab;
    button.addEventListener("click", () => selectWork(work.id));
    tabsEl.appendChild(button);
  });
}

function bindUi() {
  resetEl.addEventListener("click", () => selectHotspot(null));

  tabsEl.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = works.findIndex((work) => work.id === activeWork.id);
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % works.length
        : (current - 1 + works.length) % works.length;
    selectWork(works[next].id);
    document.querySelector(`#tab-${works[next].id}`).focus();
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.closest(".tabs")) return;
    if (event.key === "Escape") {
      selectHotspot(null);
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      cycleHotspot(event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    const number = Number(event.key);
    if (number >= 1 && number <= activeWork.hotspots.length) {
      selectHotspot(activeWork.hotspots[number - 1].id);
    }
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
    cameraTween = null;
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (moved > 5) return;
    onCanvasClick(event);
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    const pin = pinUnderPointer(event);
    hoveredId = pin ? pin.userData.id : null;
    renderer.domElement.style.cursor = pin ? "pointer" : "";
    renderHint();
  });

  const observer = new ResizeObserver(() => resize());
  observer.observe(viewerEl);
  resize();
}

function selectWork(id) {
  if (id === activeWork.id && modelRoot) return;
  activeWork = works.find((work) => work.id === id);
  selectedId = null;
  hoveredId = null;
  document.querySelectorAll(".tab").forEach((tab) => {
    const on = tab.id === `tab-${id}`;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
  });
  document.title = `${activeWork.title} — Michelangelo`;
  loadWork(activeWork);
}

function selectHotspot(id) {
  selectedId = id;
  const hotspot = activeWork.hotspots.find((item) => item.id === id) || null;
  renderPanel();
  refreshPinTextures();
  if (!modelRoot) return;
  if (!hotspot) {
    tweenCamera(homeView(), reduceMotion ? 0 : 900);
    return;
  }
  const pin = pins.find((item) => item.userData.id === id);
  const target = hotspot.lookAt
    ? new THREE.Vector3(...hotspot.lookAt)
    : pin
      ? pin.position.clone()
      : new THREE.Vector3(...hotspot.position);
  const distance = modelRadius * hotspot.zoom;
  const position = new THREE.Vector3()
    .setFromSpherical(new THREE.Spherical(distance, hotspot.phi, hotspot.theta))
    .add(target);
  tweenCamera({ position, target }, reduceMotion ? 0 : 1100);
}

function cycleHotspot(step) {
  const items = activeWork.hotspots;
  if (!items.length) return;
  const current = items.findIndex((item) => item.id === selectedId);
  const next = current === -1 ? (step > 0 ? 0 : items.length - 1) : (current + step + items.length) % items.length;
  selectHotspot(items[next].id);
}

async function loadWork(work) {
  const token = ++loadToken;
  setStatus("Loading the statue…");
  renderPanel();
  clearModel();

  try {
    const gltf = await loader.loadAsync(work.model);
    if (token !== loadToken) return;
    gltf.scene.traverse((child) => {
      if (child.isMesh) child.material = marble;
    });
    const root = normalize(gltf.scene, work.rotation);
    scene.add(root);
    modelRoot = root;
    const sphere = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
    modelRadius = sphere.radius;
    controls.minDistance = modelRadius * 0.28;
    controls.maxDistance = modelRadius * 6;
    camera.near = Math.max(modelRadius / 200, 0.001);
    camera.far = modelRadius * 40;
    camera.updateProjectionMatrix();
    buildPins(root, work.hotspots);
    tweenCamera(homeView(), 0);
    setStatus("");
    renderPanel();
  } catch (error) {
    if (token !== loadToken) return;
    console.error(error);
    setStatus("The model could not be loaded.");
  }
}

function normalize(inner, rotation) {
  inner.rotation.set(rotation[0], rotation[1], rotation[2]);
  const holder = new THREE.Group();
  holder.add(inner);
  holder.updateMatrixWorld(true);
  const measured = new THREE.Box3().setFromObject(holder);
  const size = measured.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  holder.scale.setScalar(2 / longest);
  holder.updateMatrixWorld(true);
  const centered = new THREE.Box3().setFromObject(holder);
  holder.position.sub(centered.getCenter(new THREE.Vector3()));
  holder.updateMatrixWorld(true);
  return holder;
}

function clearModel() {
  pins.forEach((pin) => scene.remove(pin));
  pins = [];
  if (!modelRoot) return;
  scene.remove(modelRoot);
  modelRoot.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
  modelRoot = null;
}

function buildPins(root, hotspots) {
  hotspots.forEach((hotspot, index) => {
    const guess = new THREE.Vector3(...hotspot.position);
    const placed = placeOnSurface(root, guess);
    if (placed.point.distanceTo(guess) > 0.08) placed.point.copy(guess);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: pinTexture(index + 1, false),
        transparent: true,
        depthWrite: false,
        depthTest: true,
      }),
    );
    sprite.position.copy(placed.point);
    sprite.userData.id = hotspot.id;
    sprite.userData.normal = placed.normal;
    sprite.userData.index = index + 1;
    sprite.center.set(0.5, 0.5);
    scene.add(sprite);
    pins.push(sprite);
  });
}

function placeOnSurface(root, guess) {
  const outward = guess.clone();
  if (outward.lengthSq() < 1e-8) outward.set(0, 0, 1);
  outward.normalize();
  const inward = outward.clone().negate();
  const rays = [
    new THREE.Raycaster(guess.clone().add(outward.clone().multiplyScalar(1.6)), inward.clone()),
    new THREE.Raycaster(guess.clone(), outward.clone()),
  ];
  let best = null;
  for (const ray of rays) {
    for (const hit of ray.intersectObject(root, true)) {
      const dist = hit.point.distanceTo(guess);
      if (!best || dist < best.dist) best = { hit, dist };
    }
  }
  if (!best) return { point: guess.clone(), normal: outward };
  const normal = best.hit.face.normal.clone().transformDirection(root.matrixWorld).normalize();
  return {
    point: best.hit.point.clone().add(normal.clone().multiplyScalar(0.045)),
    normal,
  };
}

function pinTexture(number, active) {
  const cache = active ? pinTextures.active : pinTextures.idle;
  if (!cache.has(number)) {
    const texture = new THREE.CanvasTexture(drawPin(number, active));
    texture.colorSpace = THREE.SRGBColorSpace;
    cache.set(number, texture);
  }
  return cache.get(number);
}

function drawPin(number, active) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 128, 128);
  ctx.beginPath();
  ctx.arc(64, 64, 46, 0, Math.PI * 2);
  ctx.fillStyle = active ? "#e4c98a" : "rgba(16, 14, 12, 0.88)";
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#e4c98a";
  ctx.stroke();
  ctx.fillStyle = active ? "#1a140c" : "#f4efe6";
  ctx.font = "700 62px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number), 64, 68);
  return canvas;
}

function refreshPinTextures() {
  pins.forEach((pin) => {
    const active = pin.userData.id === selectedId;
    pin.material.map = pinTexture(pin.userData.index, active);
    pin.material.opacity = !selectedId || active ? 1 : 0.45;
    pin.material.needsUpdate = true;
  });
}

function homeView() {
  const distance = fitDistance(modelRadius);
  const { theta, phi } = activeWork.home;
  const position = new THREE.Vector3()
    .setFromSpherical(new THREE.Spherical(distance, phi, theta))
    .add(new THREE.Vector3(0, 0, 0));
  return { position, target: new THREE.Vector3(0, modelRadius * 0.04, 0) };
}

function fitDistance(radius) {
  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.5));
  return (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 0.92;
}

function tweenCamera(view, duration) {
  if (duration <= 0) {
    camera.position.copy(view.position);
    controls.target.copy(view.target);
    controls.update();
    cameraTween = null;
    return;
  }
  cameraTween = {
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPos: view.position.clone(),
    toTarget: view.target.clone(),
    start: performance.now(),
    duration,
  };
}

function renderPanel() {
  const hotspot = activeWork.hotspots.find((item) => item.id === selectedId) || null;
  kickerEl.textContent = hotspot
    ? hotspot.label
    : `${activeWork.kicker} · ${activeWork.years}`;
  headingEl.textContent = hotspot ? hotspot.title : activeWork.heading;
  pointsEl.replaceChildren();
  const bullets = hotspot ? hotspot.bullets : activeWork.bullets;
  bullets.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    pointsEl.appendChild(item);
  });
  resetEl.hidden = !hotspot;
  creditEl.textContent = activeWork.credit;

  spotsEl.replaceChildren();
  spotBlockEl.hidden = activeWork.hotspots.length === 0;
  activeWork.hotspots.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "spot";
    if (item.id === selectedId) button.classList.add("is-active");
    button.setAttribute("aria-pressed", item.id === selectedId ? "true" : "false");

    const badge = document.createElement("span");
    badge.className = "spot-index";
    badge.textContent = String(index + 1);

    const label = document.createElement("span");
    label.textContent = item.label;

    button.append(badge, label);
    button.addEventListener("click", () => selectHotspot(item.id));
    spotsEl.appendChild(button);
  });
  renderHint();
}

function renderHint() {
  if (placing && hintEl.dataset.point) {
    hintEl.textContent = hintEl.dataset.point;
    return;
  }
  const hovered = activeWork.hotspots.find((item) => item.id === hoveredId);
  if (hovered && hovered.id !== selectedId) {
    hintEl.textContent = `${hovered.label} · click to look closer`;
    return;
  }
  if (selectedId) {
    hintEl.textContent = "Drag to look around this detail";
    return;
  }
  hintEl.textContent = activeWork.hotspots.length
    ? "Drag to turn · Scroll to zoom · Click a gold number"
    : "Drag to turn · Scroll to zoom";
}

function setStatus(message) {
  statusEl.hidden = !message;
  statusEl.textContent = message;
}

function resize() {
  const width = viewerEl.clientWidth || 1;
  const height = viewerEl.clientHeight || 1;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function onCanvasClick(event) {
  setPointer(event);
  if (!placing) {
    const pinHits = raycaster.intersectObjects(pins, false);
    if (pinHits.length) selectHotspot(pinHits[0].object.userData.id);
    return;
  }
  if (!modelRoot) return;
  const hits = raycaster.intersectObject(modelRoot, true);
  if (!hits.length) return;
  const point = hits[0].point;
  const text = `point ${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(3)}`;
  hintEl.dataset.point = text;
  hintEl.textContent = text;
  console.log(text);
}

function pinUnderPointer(event) {
  if (!pins.length) return null;
  setPointer(event);
  const hits = raycaster.intersectObjects(pins, false);
  return hits[0]?.object ?? null;
}

function setPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

function tick(now) {
  if (cameraTween) {
    const t = Math.min(1, (now - cameraTween.start) / cameraTween.duration);
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, eased);
    controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
    if (t >= 1) cameraTween = null;
  }
  controls.update();
  updatePins(now);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function updatePins(now) {
  const height = viewerEl.clientHeight || 1;
  pins.forEach((pin) => {
    const distance = camera.position.distanceTo(pin.position);
    const worldHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance;
    const pixels = pin.userData.id === selectedId ? 42 : 32;
    const pulse =
      pin.userData.id === selectedId && !reduceMotion ? 1 + Math.sin(now / 260) * 0.05 : 1;
    const size = worldHeight * ((pixels * pulse) / height);
    pin.scale.set(size, size, 1);
    const selected = pin.userData.id === selectedId;
    pin.material.depthTest = !selected;
    pin.renderOrder = selected ? 2 : 1;
    pin.visible = true;
  });
}

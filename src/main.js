import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { params } from './params.js';
import { createUI } from './ui.js';

const canvas = document.getElementById('scene');
const viewport = document.getElementById('viewport');
const backendLabel = document.getElementById('backend');
const fpsLabel = document.getElementById('fps');

// --- Renderer -------------------------------------------------------------
// WebGPURenderer uses WebGPU when the browser supports it and falls back to
// WebGL 2 otherwise, so the same code runs everywhere.
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
await renderer.init();
backendLabel.textContent = renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL 2 (fallback)';

// --- Scene ----------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color();

const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
const CAMERA_HOME = new THREE.Vector3(3.5, 2.5, 4.5);
const TARGET_HOME = new THREE.Vector3(0, 0.8, 0);
camera.position.copy(CAMERA_HOME);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(TARGET_HOME);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.02; // stay above the ground
controls.minDistance = 0.3;
controls.maxDistance = 60;

// --- Lights ---------------------------------------------------------------
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff4e0, 1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 60;
sun.shadow.camera.left = sun.shadow.camera.bottom = -8;
sun.shadow.camera.right = sun.shadow.camera.top = 8;
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

// --- Ground and helpers ---------------------------------------------------
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(20, 64).rotateX(-Math.PI / 2),
  new THREE.MeshStandardMaterial({ roughness: 1 }),
);
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(20, 20, 0xffffff, 0xffffff);
grid.material.transparent = true;
grid.material.opacity = 0.12;
grid.position.y = 0.002;
scene.add(grid);

const axes = new THREE.AxesHelper(1);
axes.position.y = 0.004;
scene.add(axes);

// --- Placeholder plant ----------------------------------------------------
// A plain stem standing in for the real plant system. Unit-sized geometry,
// scaled from params so the sliders have something to drive.
const stem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 1, 1, 12).translate(0, 0.5, 0),
  new THREE.MeshStandardMaterial({ roughness: 0.8 }),
);
stem.castShadow = true;
stem.receiveShadow = true;
scene.add(stem);

// --- Params -> scene ------------------------------------------------------
function applyParams() {
  const { plant, environment: env, view } = params;

  stem.scale.set(plant.thickness, plant.height, plant.thickness);
  stem.material.color.set(plant.color);

  const az = THREE.MathUtils.degToRad(env.sunAzimuth);
  const el = THREE.MathUtils.degToRad(env.sunElevation);
  sun.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(25);
  sun.intensity = env.sunIntensity;
  sun.castShadow = view.shadows;

  hemi.intensity = env.ambientIntensity;
  hemi.color.set(env.skyColor);
  hemi.groundColor.set(env.groundColor);
  scene.background.set(env.skyColor);
  ground.material.color.set(env.groundColor);

  grid.visible = view.grid;
  axes.visible = view.axes;
  controls.autoRotate = view.autoRotate;
}

// --- Simulation -----------------------------------------------------------
// `time` is simulation time in seconds; it only advances while running and
// is scaled by the speed slider. The plant system will hook in here.
const sim = { time: 0 };

function resetSimulation() {
  sim.time = 0;
}

function stepSimulation(dt) {
  sim.time += dt;
}

// --- UI -------------------------------------------------------------------
createUI(params, {
  container: document.getElementById('controls'),
  onChange: applyParams,
  actions: {
    reset: resetSimulation,
    resetCamera() {
      camera.position.copy(CAMERA_HOME);
      controls.target.copy(TARGET_HOME);
    },
  },
});
applyParams();

// --- Resize ---------------------------------------------------------------
function resize() {
  const { clientWidth: w, clientHeight: h } = viewport;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
resize();

// --- Loop -----------------------------------------------------------------
const clock = new THREE.Clock();
let frames = 0;
let fpsTimer = 0;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);

  if (params.simulation.running) stepSimulation(dt * params.simulation.speed);

  controls.update();
  renderer.render(scene, camera);

  frames++;
  fpsTimer += dt;
  if (fpsTimer >= 0.5) {
    fpsLabel.textContent = `${Math.round(frames / fpsTimer)} fps · t=${sim.time.toFixed(1)}s`;
    frames = 0;
    fpsTimer = 0;
  }
});

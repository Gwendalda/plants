import GUI from 'three/addons/libs/lil-gui.module.min.js';

// Builds the control panel inside the sidebar.
// `onChange(path)` fires whenever a value changes; `actions` holds buttons.
export function createUI(params, { container, onChange, actions }) {
  const gui = new GUI({ container, title: 'Parameters' });
  gui.onChange(({ property }) => onChange(property));

  const sim = gui.addFolder('Simulation');
  sim.add(params.simulation, 'running').name('Running');
  sim.add(params.simulation, 'speed', 0, 10, 0.1).name('Speed');
  sim.add(params.simulation, 'seed', 1, 9999, 1).name('Seed');
  sim.add(actions, 'reset').name('Reset simulation');

  const plant = gui.addFolder('Plant');
  plant.add(params.plant, 'height', 0.1, 5, 0.01).name('Height');
  plant.add(params.plant, 'thickness', 0.01, 0.3, 0.005).name('Thickness');
  plant.addColor(params.plant, 'color').name('Color');

  const env = gui.addFolder('Environment');
  env.add(params.environment, 'sunAzimuth', 0, 360, 1).name('Sun azimuth');
  env.add(params.environment, 'sunElevation', 0, 90, 1).name('Sun elevation');
  env.add(params.environment, 'sunIntensity', 0, 10, 0.1).name('Sun intensity');
  env.add(params.environment, 'ambientIntensity', 0, 3, 0.05).name('Ambient');
  env.addColor(params.environment, 'skyColor').name('Sky');
  env.addColor(params.environment, 'groundColor').name('Ground');

  const view = gui.addFolder('View');
  view.add(params.view, 'grid').name('Grid');
  view.add(params.view, 'axes').name('Axes');
  view.add(params.view, 'shadows').name('Shadows');
  view.add(params.view, 'autoRotate').name('Auto-rotate');
  view.add(actions, 'resetCamera').name('Reset camera');

  return gui;
}

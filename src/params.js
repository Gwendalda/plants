// Single source of truth for every tweakable value.
// The UI (src/ui.js) edits this object; the scene and, later, the plant
// simulation read from it. Add new values here, then expose them in ui.js.
export const params = {
  simulation: {
    running: true,
    speed: 1,
    seed: 1,
  },
  plant: {
    // Placeholders for the plant system.
    height: 1.5,
    thickness: 0.06,
    color: '#5a8f4a',
  },
  environment: {
    sunAzimuth: 135, // degrees, around the vertical axis
    sunElevation: 50, // degrees above the horizon
    sunIntensity: 3,
    ambientIntensity: 0.6,
    skyColor: '#a9c9e6',
    groundColor: '#4a4034',
  },
  view: {
    grid: true,
    axes: false,
    shadows: true,
    autoRotate: false,
  },
};

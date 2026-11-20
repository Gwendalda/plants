# Plants

A GPU plant simulation in the browser, built with [three.js](https://threejs.org/).

Rendering uses three.js's `WebGPURenderer`, which runs on WebGPU where available and falls back to WebGL 2.

## Run

```sh
npm install
npm run dev
```

Then open the URL Vite prints. `npm run build` produces a static site in `dist/`.

## Layout

- `src/params.js` — every tweakable value, in one object
- `src/ui.js` — the sidebar controls (lil-gui) bound to those values
- `src/main.js` — renderer, scene, lights, camera, and the simulation loop

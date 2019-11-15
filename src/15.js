global.THREE = require("three");
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");

const settings = {
  animate: true,
  context: "webgl"
};

const vertexShader = glslify(/* glsl */`
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`)

const fragmentShader = glslify(/* glsl */`
  #pragma glslify: snoise2 = require('glsl-noise/simplex/2d')

  uniform sampler2D texture1;
  uniform float u_time;

  varying vec2 vUv;

  void main() {
    float offx = vUv.x + sin(vUv.y + u_time * .1);
    float offy = vUv.y - u_time * 0.1 - cos(u_time * .001) * .01;

    float n = snoise2(vec2(offx, offy) * u_time * .001);

    gl_FragColor = texture2D(texture1, vUv / n);
  }
`)


const sketch = ({ context, width, height }) => {
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 20);

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a material, a geometry and a mesh
  let texture = new THREE.TextureLoader().load("assets/14/pickle-cat.png")
  let material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      texture1: {
        type: "t",
        value: texture
      },
      u_time: { value: 0 }
    }
  });
  let geometry = new THREE.PlaneBufferGeometry( 1.75, 1, 1)
  let mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

  renderer.render(scene, camera);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);

      // Threejs Fit plane to screen
      // source: https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f
      let dist = camera.position.z - mesh.position.z;
      let height = 1
      camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI);
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({time}) {
      mesh.material.uniforms.u_time.value = Math.sin(time) * 2.5

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

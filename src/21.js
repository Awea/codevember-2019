// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");

const settings = {
  animate: true,
  context: "webgl"
};

const vertexShader = glslify(/* glsl */`
  #pragma glslify: pnoise = require('glsl-noise/periodic/3d')

  uniform float time;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    // get a 3d noise using the position, low frequency
    float b = 5.0 * pnoise( (0.25 * time) * position, vec3( 100.0 ) );

    float displacement = - 0.5 * b;

    // move the position along the normal and transform it
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  }
`)

const fragmentShader = glslify(/* glsl */`
  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4( vec3( vUv, 0. ), 1. );
  }
`)

const sketch = ({ context, width, height }) => {
  // Create a renderer
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 5);

  // Setup camera controller
  global.controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  let group = new THREE.Group()
  let geometry = new THREE.BoxBufferGeometry( .25, 1, .25 );

  // let material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: {
        type: "f",
        value: 0.0
      }
    }
  })

  for (var x = 0; x < 100; x++) {
    let cube = new THREE.Mesh( geometry, material );
    cube.rotation.x = .5
    group.add(cube);
  }
  group.rotation.y = 1.5
  scene.add(group)

  // Draw axes helpers
  // let axesHelper = new THREE.AxesHelper( 50 );
  // scene.add( axesHelper );

  renderer.render( scene, camera );

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time, deltaTime }) {
      material.uniforms.time.value += 0.15

      group.children.forEach((child, i) => {
        child.rotation.x += 0.001 * (i / 5)
      })

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

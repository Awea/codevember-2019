// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");
const { lerp } = require('canvas-sketch-util/math');

const settings = {
  animate: true,
  context: "webgl"
};

const vertexShader = glslify(/* glsl */`
  uniform float time;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    float b = sin( time + position.y);

    vec3 newPosition = position + normal * b;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`)

const fragmentShader = glslify(/* glsl */`
  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4( vUv, .5, .5 );
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
  // let geometry = new THREE.SphereBufferGeometry( .5, 1, 1 );
  let geometry = new THREE.PlaneBufferGeometry( .125, 2, 20, 20, 20);

  // let material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: .0 }
    },
    // wireframe: true
  })

  for (var x = -10; x < 200; x++) {
    let plane = new THREE.Mesh( geometry, material );
    plane.position.y = 20 * Math.sin(x)
    group.add(plane);
  }
  group.rotation.y = -.75
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
      // material.uniforms.time.value = lerp(Math.cos(time * .5), 0, 10)
      material.uniforms.time.value += .01

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

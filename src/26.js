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
  #pragma glslify: pnoise = require('glsl-noise/periodic/3d')

  uniform float time;
  varying vec2 vUv;
  varying float noise;

  float turbulence( vec3 p ) {
    float w = 100.0;
    float t = -.5;

    for (float f = 1.0 ; f <= 10.0 ; f++ ){
      float power = pow( 2.0, f );
      t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
    }

    return t;

  }

  void main() {
    vUv = uv;

    noise = 20.0 *  -.10 * turbulence( .5 * normal );

    float b = 1.5 * pnoise( time * position, vec3( 100.0 ) );

    vec3 newPosition = position + normal * b;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`)

const fragmentShader = glslify(/* glsl */`
  varying vec2 vUv;
  varying float noise;

  void main() {
    gl_FragColor = vec4( vUv, noise, .5 );
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
  camera.position.set(0, 0, 2);

  // Setup camera controller
  global.controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  let group = new THREE.Group()
  // let geometry = new THREE.SphereBufferGeometry( .5, 1, 1 );
  let geometry = new THREE.PlaneBufferGeometry( 1, 1, 15, 15, 15);

  // let material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: .0 }
    },
    wireframe: true
  })

  let plane = new THREE.Mesh( geometry, material );
  group.add(plane);
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
      material.uniforms.time.value = lerp(Math.cos(time * .75), 0, 10)

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

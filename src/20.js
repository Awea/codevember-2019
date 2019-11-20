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

    // get a turbulent 3d noise using the normal, normal to high freq
    noise = 10.0 *  -.10 * turbulence( .5 * normal + time );
    // get a 3d noise using the position, low frequency
    float b = 5.0 * pnoise( (0.05 + time) * position, vec3( 100.0 ) );
    // compose both noises
    float displacement = - 10. * b;

    // move the position along the normal and transform it
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`)

const fragmentShader = glslify(/* glsl */`
  varying vec2 vUv;
  varying float noise;

  void main() {
    // compose the colour using the UV coordinate
    // and modulate it with the noise like ambient occlusion
    vec3 color = vec3( vUv * ( 1. - 2. * noise ), 0.0 );
    // gl_FragColor = vec4( color.rgb, 1.0 );
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
  camera.position.set(0, 0, 70);

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

  for (var x = 0; x < 20; x++) {
    for (var z = 0; z < 20; z++) {
      let cube = new THREE.Mesh( geometry, material );
      cube.position.x = x - 10
      cube.position.z = z - 10
      group.add( cube );
    }
  }
  group.rotation.x = .5
  group.rotation.y = .5
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
      material.uniforms.time.value += 0.05

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

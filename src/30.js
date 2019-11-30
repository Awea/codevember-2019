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
  camera.position.set(0, 0, 20);

  // Setup camera controller
  global.controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  let group = new THREE.Group()
  // let geometry = new THREE.SphereBufferGeometry( .5, 1, 1 );
  let geometry = new THREE.ConeBufferGeometry( 2, 2, 4);

  // let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: .0 }
    },
    wireframe: true
  })

  for (var theta = 0; theta < Math.PI * 2; theta+=0.1) {
    let mesh = new THREE.Mesh( geometry, material );
    mesh.position.x = 5 * Math.cos(theta)
    mesh.position.y = 5 * Math.sin(theta)
    mesh.position.z = 5 * Math.cos(theta)

    group.add(mesh);
  }
  group.rotation.y = 0.75
  scene.add(group)

  var bulb = new THREE.SphereBufferGeometry( 1, 16, 16 );
  var pointLight = new THREE.PointLight(0xffffff, .5);
  pointLight.add( new THREE.Mesh( bulb, material))
  scene.add(pointLight)

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
      material.uniforms.time.value += 0.01

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

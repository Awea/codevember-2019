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
  uniform float rotation;
  varying vec3 vUv;

  void main() {
    vUv = position;

    vec3 newPosition = position;
    newPosition.x += rotation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`)

const fragmentShader = glslify(/* glsl */`
  varying vec3 vUv;

  void main() {
    gl_FragColor = vec4( vUv, .5 );
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
  let geometry = new THREE.PlaneBufferGeometry( 1, 1, 1, 10, 10);

  // let material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      rotation: { value: .0 }
    },
    wireframe: true
  })

  for (var x = 0; x < 100; x++) {
    let plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = .05 + .05 * x
    plane.rotation.y = .05 + .05 * x
    plane.rotation.z = .05 + .05 * x
    group.add(plane);
  }
  // group.rotation.y = 1.5
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
      material.uniforms.rotation.value = Math.sin(time) * .25

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

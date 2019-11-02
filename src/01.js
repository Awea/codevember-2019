// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { rangeFloor } = require('canvas-sketch-util/random');

const settings = {
  animate: true,
  context: "webgl"
};

const sketch = ({ context, width, height }) => {
  // Create a renderer
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#ea7317", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 50);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  let controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a material
  let material = new THREE.MeshPhongMaterial( { color: 0x000 } );

  let shapes = [...Array(5)].map((_x, i) => {
    // Setup a geometry
    let geometry = new THREE.BoxBufferGeometry(4, 4, 4)

    // Setup a mesh with geometry + material
    let shape = new THREE.Mesh( geometry, material );

    shape.position.set(3 + i * 4, 3 + i * 4, 0)

    scene.add( shape );

    return shape
  });

  renderer.render( scene, camera );

  // Add light
  let light = new THREE.DirectionalLight(0xffffff);
  light.position.set( 1, 1, 1 ).normalize();
  scene.add(light)

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
      shapes.forEach((shape) => {
        shape.rotation.y = time * (rangeFloor(10, 50) * Math.PI / 180)
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

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { lerp } = require('canvas-sketch-util/math');

const settings = {
  animate: true,
  context: "webgl"
};

const sketch = ({ context, width, height }) => {
  // Create a renderer
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  let controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a material
  let material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

  // Setup a geometry
  let geometry = new THREE.BoxBufferGeometry(4, 4, 4)

  // Setup a mesh with geometry + material
  let shape = new THREE.Mesh( geometry, material );
  shape.rotation.y = .5
  shape.rotation.x = .5

  scene.add( shape );

  renderer.render( scene, camera );

  // Add light
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 20)
  spotLight.target = shape
  scene.add(spotLight)

  var anotherLight = new THREE.SpotLight(0xfff400, .4);
  anotherLight.position.set(0, 0, 20)
  anotherLight.target = shape
  scene.add(anotherLight)

  const radiusLightCourse = 20

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
      let t = Math.cos(time * .75 );
      let radianS = lerp(0, 360, t) * Math.PI / 180;
      let radianT = lerp(0, 360, t) * Math.PI / 180;

      // Move light following circular courses
      let z = radiusLightCourse * Math.cos(radianS);
      let x = radiusLightCourse * Math.sin(radianS) * Math.cos(radianT);
      let y = radiusLightCourse * Math.sin(radianS) * Math.sin(radianT);

      spotLight.position.set(x, y, z);

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

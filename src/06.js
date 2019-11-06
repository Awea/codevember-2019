// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const  { hexColorLinterp } = require("hex-color-linterp");

const { BloomEffect, EffectComposer, EffectPass, RenderPass } = require("postprocessing");

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

  // Create a composer
  let composer = new EffectComposer(renderer);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 80);
  camera.lookAt(new THREE.Vector3());

  // Setup an effect
  let effectPass = new EffectPass(camera, new BloomEffect());
  effectPass.renderToScreen = true;

  // Setup camera controller
  let controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  // Add pass to scene
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(effectPass);

  // Setup a material
  let material = new THREE.MeshPhongMaterial( { color: 0xffffff } );

  // Setup a geometry
  let geometry = new THREE.SphereGeometry( 3, 32, 32 )
  let shape = new THREE.Mesh( geometry, material );
  shape.position.set(10, 10, 10)

  let shape2 = new THREE.Mesh( geometry, material );
  shape2.position.set(-10, -10, -10)

  let group = new THREE.Group()
  group.add(shape)
  group.add(shape2)
  scene.add(group)

  renderer.render( scene, camera );

  // Add light
  var bulb = new THREE.SphereBufferGeometry( 5, 32, 32 );
  var pointLight = new THREE.PointLight(0xffffff, .5);
  var bulbMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } )
  pointLight.add( new THREE.Mesh( bulb, bulbMaterial))
  scene.add(pointLight)

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
      let t = Math.cos(time) + .1;
      group.rotation.y = time * (50 * Math.PI / 180)
      group.rotation.x = time * (50 * Math.PI / 180)

      controls.update();
      composer.render(deltaTime)
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

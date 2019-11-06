// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const { lerp } = require('canvas-sketch-util/math');

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
  let geometry = new THREE.SphereGeometry( 5, 32, 32 )

  // Setup a mesh with geometry + material
  let shape = new THREE.Mesh( geometry, material );
  scene.add( shape );

  renderer.render( scene, camera );

  // Add light
  var bulb = new THREE.SphereBufferGeometry( 1, 16, 16 );
  var pointLight = new THREE.PointLight(0xffffff, .5);
  pointLight.add( new THREE.Mesh( bulb, new THREE.MeshBasicMaterial( { color: 0xffffff } )))
  scene.add(pointLight)

  var pointLight2 = new THREE.PointLight(0xa83290, .5);
  pointLight2.add( new THREE.Mesh( bulb, new THREE.MeshBasicMaterial( { color: 0xa83290 } )))
  scene.add(pointLight2)

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
      // Move pointLight following circular courses
      let t = Math.cos(time * .25) * 2.5;
      let radianS = lerp(0, 360, t) * Math.PI / 180;
      let radianT = lerp(0, 360, t) * Math.PI / 180;
      pointLight.position.z = radiusLightCourse * Math.cos(radianS);
      pointLight.position.x = radiusLightCourse * Math.sin(radianS) * Math.cos(radianT);
      pointLight.position.y = radiusLightCourse * Math.sin(radianS) * Math.sin(radianT);

      let t2 = Math.sin(time * .25) * 2.5;
      let radianS2 = lerp(0, 360, t2) * Math.PI / 180;
      let radianT2 = lerp(0, 360, t2) * Math.PI / 180;
      pointLight2.position.z = (radiusLightCourse - 5) * Math.cos(radianS2);
      pointLight2.position.x = (radiusLightCourse - 5) * Math.sin(radianS2) * Math.cos(radianT2);
      pointLight2.position.y = (radiusLightCourse - 5) * Math.sin(radianS2) * Math.sin(radianT2);

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

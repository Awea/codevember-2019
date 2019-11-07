// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 50);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  global.controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a group
  let group = new THREE.Group()

  // Setup a mesh
  let material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
  let geometry = new THREE.BoxBufferGeometry(12, 4, 16)
  let shape = new THREE.Mesh( geometry, material );
  shape.receiveShadow = true
  group.add(shape);

  geometry = new THREE.BoxBufferGeometry(7, 12, 1)
  shape = new THREE.Mesh( geometry, material );
  shape.position.set(-2.5, 8, 7.5)
  shape.castShadow = true
  group.add(shape);

  geometry = new THREE.BoxBufferGeometry(5, 12, 1)
  shape = new THREE.Mesh( geometry, material );
  shape.position.set(3.5, 8, 0)
  shape.castShadow = true
  group.add(shape);

  geometry = new THREE.BoxBufferGeometry(7, 12, 1)
  shape = new THREE.Mesh( geometry, material );
  shape.position.set(-2.5, 8, -7.5)
  shape.castShadow = true
  group.add(shape);

  group.rotation.x = .5
  group.rotation.y = 1

  scene.add(group);

  // var axesHelper = new THREE.AxesHelper( 50 );
  // scene.add( axesHelper );

  renderer.render( scene, camera );

  // Add light
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, 20)
  spotLight.target = shape
  scene.add(spotLight)

  // Add light
  var bulb = new THREE.SphereBufferGeometry(10, 32, 32 );
  var pointLight = new THREE.PointLight(0xffffff, 1);
  var bulbMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } )
  pointLight.add( new THREE.Mesh( bulb, bulbMaterial))
  pointLight.position.set(0, 20, -50)
  pointLight.castShadow = true
  group.add(pointLight)

  pointLight.shadow.mapSize.width = 512 * 4;  // default is 512
  pointLight.shadow.mapSize.height = 512 * 4; // default is 512
  pointLight.shadow.camera.near = 0.5;       // default
  pointLight.shadow.camera.far = 500      // default

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
      pointLight.position.y = 20 * Math.sin(time) * (Math.PI * 2);
      pointLight.position.z = 20 * Math.cos(time) * (Math.PI * 2);

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

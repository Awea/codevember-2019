global.THREE = require("three");
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");
const  { hexColorLinterp } = require("hex-color-linterp");

const settings = {
  animate: true,
  context: "webgl"
};

const vertexShader = glslify(/* glsl */`
  varying vec3 vUv;

  void main() {
    vUv = position;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`)

const fragmentShader = glslify(/* glsl */`
  uniform vec3 colorA;
  uniform vec3 colorB;
  varying vec3 vUv;

  void main() {
    gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  }
`)


const sketch = ({ context, width, height }) => {
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 80);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  let controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  // See x, y, z axes for easier debugging
  // var axesHelper = new THREE.AxesHelper( 100 );
  // scene.add(axesHelper);

  // Colors palette
  let palette = hexColorLinterp(1, 'ACB6E5', '74ebd5')

  // Setup a material, a geometry and a mesh
  let material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
      colorA: {type: 'vec3', value: new THREE.Color(0xACB6E5)}
    }
  });
  let geometry = new THREE.SphereGeometry( 5, 32, 32 )
  let mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

  renderer.render(scene, camera);

  // Add light
  var pointLight = new THREE.PointLight(0xffffff, .5);
  pointLight.target = mesh
  scene.add(pointLight)

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
    render({ time }) {
      let t = Math.cos(time) + .1;

      let colorB = new THREE.Color("#" + hexColorLinterp(t, "ACB6E5", "74ebd5"));
      mesh.material.uniforms.colorB.value = colorB;

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

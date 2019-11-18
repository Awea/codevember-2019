// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glslify = require("glslify");
const { onSphere } = require('canvas-sketch-util/random')

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
  uniform vec2 u_res;

  varying vec3 vUv;

  void main() {
    vec2 st = gl_FragCoord.xy/(u_res.xy * vec2(1.5));
    st.x *= u_res.x/u_res.y;
    vec3 color = vec3(0.0);
    float d = 0.0;

    // Remap the space to -1. to 1.
    st = st *2.-1.;

    // Number of sides of your shape
    int N = 6;

    // Angle and radius from the current pixel
    float a = atan(st.x,st.y)+PI;
    float r = TWO_PI/float(N);

    // Shaping function that modulate the distance
    d = cos(floor(.5+a/r)*r-a)*length(st);

    color = vec3(1.0-smoothstep(.4,.41,d));

    gl_FragColor = vec4(color, 1.0);
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
  camera.position.set(0, 0, 50);

  // Setup camera controller
  global.controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  let scene = new THREE.Scene();

  const MAX_POINTS = 500;

  // geometry
  let geometry = new THREE.BufferGeometry();

  // attributes
  let positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
  geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

  // draw range
  let drawCount = 2; // draw the first 2 points, only
  geometry.setDrawRange( 0, drawCount );

  // material
  // let material = new THREE.LineBasicMaterial( { color: 0xffffff } );
  let material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      u_res:  { value: new THREE.Vector2(1, 1) }
    },
    defines: {
      TWO_PI: Math.PI * 2,
      PI: Math.PI
    }
  });

  // line
  let line = new THREE.Line( geometry,  material );
  scene.add( line );

  let geometryPositions = line.geometry.attributes.position.array;

  // There is 3 coordinates per point so we need to update index 3 time per iteration
  let index = 0;
  for ( let i = 0, l = MAX_POINTS; i < l; i ++ ){
    let [x, y, z] = onSphere(15)

    geometryPositions[index ++] = x
    geometryPositions[index ++] = y
    geometryPositions[index ++] = z
  }

  let increaseDrawInterval = setInterval(() => {
    if (drawCount < MAX_POINTS){
      drawCount += 1
    } else {
      clearInterval(increaseDrawInterval)
    }
  }, 50)

  // Draw axes helpers
  // let axesHelper = new THREE.AxesHelper( 50 );
  // scene.add( axesHelper );

  renderer.render( scene, camera );

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      line.material.uniforms.u_res.value.set(viewportWidth, viewportHeight);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      line.geometry.setDrawRange( 0, drawCount );
      line.geometry.attributes.position.needsUpdate = true;

      line.rotation.y += 0.01

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

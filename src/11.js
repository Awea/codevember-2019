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
  varying vec3 v_uv;

  void main() {
    v_uv = position;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`)

const fragmentShader = glslify(/* glsl */`
  #pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

  varying vec3 v_uv;

  uniform vec2 u_res;
  uniform float u_time;

  float circle(in vec2 _st, in float _radius, in float blurriness){
    vec2 dist = _st;
    return 1.-smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
  }

  void main() {
    // We manage the device ratio by passing PR constant
    vec2 res = u_res * PR;
    vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
    // tip: use the following formula to keep the good ratio of your coordinates
    st.y *= u_res.y / u_res.x;

    vec2 circlePos = st;
    float c = circle(circlePos, 0.3, 0.3) * 2.5;

    float offx = v_uv.x + sin(v_uv.y + u_time * .1);
    float offy = v_uv.y - u_time * 0.1 - cos(u_time * .001) * .01;

    float n = snoise3(vec3(offx, offy, u_time * .1) * 4.) - 1.;

    vec4 colorA = vec4(0.0,0.0,0.0, 1);
    vec4 colorB = vec4(0.149,0.50,0.912, .5);

    float finalMask = smoothstep(0.4, 0.5, n + c);
    vec4 finalImage = mix(colorA, colorB, finalMask);

    gl_FragColor = finalImage;
  }
`)


const sketch = ({ context, width, height }) => {
  let renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setClearColor("#000000", 1);

  // Setup a camera
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
  camera.position.set(0, 0, 20);
  camera.lookAt(new THREE.Vector3());

  // Setup your scene
  let scene = new THREE.Scene();

  // Setup a material, a geometry and a mesh
  let material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      u_mouse: { value: new THREE.Vector2(0, 0)},
      u_time: { value: 0 },
      u_res:  { value: new THREE.Vector2(1, 1) }
    },
    defines: {
      PR: window.devicePixelRatio.toFixed(1)
    }
  });
  let geometry = new THREE.PlaneBufferGeometry( 20, 16, 16 )
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
      mesh.material.uniforms.u_res.value.set(viewportWidth, viewportHeight);

      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render() {
      mesh.material.uniforms.u_time.value += 0.01

      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

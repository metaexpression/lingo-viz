import {Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, PointLight, Raycaster, Vector2} from 'three'
import {OrbitControls} from 'three-examples/controls/OrbitControls';
import {FontLoader} from 'three-examples/loaders/FontLoader';

export const ctx = {}

const createScene = () => {
  let h = document.body.getBoundingClientRect().height
  let w = document.body.getBoundingClientRect().width

  let scene = new Scene()
  let renderer = new WebGLRenderer({antialias: true, alpha: true})
  let camera = new PerspectiveCamera( 45, w / h, 0.1, 100 );

  camera.position.set(5, 6, 2)
  camera.rotation.x = -0.3

  scene.add(camera)
  renderer.setSize(w, h)
  document.body.appendChild(renderer.domElement)

  ctx.scene = scene
  ctx.camera = camera
  ctx.renderer = renderer
  ctx.w = w; ctx.h = h;
}

const addControls = () => {
  let controls = new OrbitControls(ctx.camera, ctx.renderer.domElement);
  controls.minDistance = 4;
  controls.maxDistance = 18;
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;

  controls.minPolarAngle = 1
  controls.maxPolarAngle = 1
  controls.update();

  ctx.controls = controls
}

const addLights = () => {
  let pointLight = new PointLight(0xffffff);
  pointLight.position.set(1,1,2);
  ctx.camera.add(pointLight);

  let ambientLight = new AmbientLight(0x404040, 8); // soft white light
  ctx.scene.add(ambientLight);
}

const addRaycaster = () => {
  ctx.raycaster = new Raycaster()
  ctx.pointer = new Vector2(5, 5)
}

// for resizing, when I get to it
function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = - frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = - frustumSize / 2;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

const addFont = () => {
  let loader = new FontLoader();
	loader.load( 'resources/Inter_Regular.json',  (font) => {
		ctx.font = font
	});
}

export const setupScene = () => {
  createScene()
  addControls()
  addLights()
  addRaycaster()
  addFont()
}

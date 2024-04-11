import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera;

const load = (url) => new Promise((resolve, reject) => {
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async () => {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
  scene.add(directionalLight);
  const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
  scene.add( helper );

  const geometry = new THREE.PlaneGeometry( 1, 1 );
  const texture = new THREE.TextureLoader().load('./assets/rocks.jpg' ); 
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 50, 50 );
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const plane = new THREE.Mesh( geometry, material );
  plane.rotateX(-Math.PI / 2);
  plane.scale.set(100, 100, 100);
  //scene.add( plane );

  const gridHelper = new THREE.GridHelper( 10, 10 );
  scene.add( gridHelper );

  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );

  const porsche = await load('./assets/porsche/scene.gltf');
  scene.add(porsche);

  console.log('made a scene', porsche);
};

let speed = [0, 0, 0];
window.loop = (dt, input) => {
  renderer.render( scene, camera );
};


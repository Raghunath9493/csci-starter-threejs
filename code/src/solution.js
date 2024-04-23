import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, Soccer_ball;
let keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false, q: false, e: false };
const ballMoveSpeed = 0.5; // Speed of ball movement
const ballRotationSpeed = 0.1; // Speed of ball rotation
const ballPosition = new THREE.Vector3(0, 3, 0);

const getRandomColor = () => {
    return Math.floor(Math.random() * 0xffffff);
};

const loadModel = (url) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => {
            console.error("Error loading model:", error);
            reject(error);
        }
    );
});


// Function to add toys to the scene with random colors
const addToys = () => {
    const toyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const numToys = 100;
    for (let i = 0; i < numToys; i++) {
        const toyMaterial = new THREE.MeshBasicMaterial({ color: getRandomColor() }); // Random color for each toy
        const toy = new THREE.Mesh(toyGeometry, toyMaterial);
        const posX = Math.random() * 100 - 50;
        const posY = 0.5;
        const posZ = Math.random() * 100 - 50;
        toy.position.set(posX, posY, posZ);
        scene.add(toy); // Add toy to the scene
    }
};


const updateBallPosition = () => {
    const moveVector = new THREE.Vector3(0, 0, 0);

    if (keysPressed.ArrowUp || keysPressed.w) {
        moveVector.z -= ballMoveSpeed;
        Soccer_ball.rotation.x -= ballRotationSpeed; // Rotate around X-axis
    }
    if (keysPressed.ArrowDown || keysPressed.s) {
        moveVector.z += ballMoveSpeed;
        Soccer_ball.rotation.x += ballRotationSpeed; // Rotate in the opposite direction
    }
    if (keysPressed.ArrowLeft || keysPressed.a) {
        moveVector.x -= ballMoveSpeed;
        Soccer_ball.rotation.z -= ballRotationSpeed; // Rotate around Z-axis
    }
    if (keysPressed.ArrowRight || keysPressed.d) {
        moveVector.x += ballMoveSpeed;
        Soccer_ball.rotation.z += ballRotationSpeed; // Rotate in the opposite direction
    }

    // Diagonal movement and rotations
    if (keysPressed.q) {
        moveVector.z -= ballMoveSpeed;
        moveVector.x -= ballMoveSpeed;
        Soccer_ball.rotation.x -= ballRotationSpeed;
        Soccer_ball.rotation.z -= ballRotationSpeed;
    }
    if (keysPressed.e) {
        moveVector.z -= ballMoveSpeed;
        moveVector.x += ballMoveSpeed;
        Soccer_ball.rotation.x -= ballRotationSpeed;
        Soccer_ball.rotation.z += ballRotationSpeed;
    }

    Soccer_ball.position.add(moveVector); // Update the position based on the movement vector
};
// const updateBallPosition = () => {
//     const moveVector = new THREE.Vector3(0, 0, 0);
//     const forward = new THREE.Vector3(0, 0, 0); // Forward direction relative to screen
//     const right = new THREE.Vector3(1, 0, 0); // Right direction relative to screen

//     if (keysPressed.ArrowUp || keysPressed.w) {
//         moveVector.z -= ballMoveSpeed; // Move forward
//     }
//     if (keysPressed.ArrowDown || keysPressed.s) {
//         moveVector.z += ballMoveSpeed; // Move backward
//     }
//     if (keysPressed.ArrowLeft || keysPressed.a) {
//         moveVector.x -= ballMoveSpeed; // Move left
//     }
//     if (keysPressed.ArrowRight || keysPressed.d) {
//         moveVector.x += ballMoveSpeed; // Move right
//     }

//     // Diagonal movement with 'q' and 'e'
//     if (keysPressed.q) {
//         moveVector.z -= ballMoveSpeed; // Move forward
//         moveVector.x -= ballMoveSpeed; // Move left (diagonal left)
//     }
//     if (keysPressed.e) {
//         moveVector.z -= ballMoveSpeed; // Move forward
//         moveVector.x += ballMoveSpeed; // Move right (diagonal right)
//     }

//     Soccer_ball.position.add(moveVector);
// };

const init = async() => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 1000);
    camera.position.set(30, 30, 30);

    try {
        Soccer_ball = await loadModel('./assets/Soccer_ball/scene.gltf');
        if (Soccer_ball) {
            Soccer_ball.scale.set(10, 10, 10);
            Soccer_ball.position.copy(ballPosition);
            Soccer_ball.visible = true;
            scene.add(Soccer_ball);
            camera.lookAt(Soccer_ball.position);
        } else {
            console.error("Soccer_ball not loaded correctly");
        }
    } catch (error) {
        console.error("Failed to load Soccer_ball:", error);
    }

    addToys();

    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('./assets/Grass.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(100, 100);

    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    // Adjust the angle by modifying the rotation values
    plane.rotateZ(Math.PI / 4); // Example rotation to create a slanted angle (tilted to the right)

    scene.add(plane);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    scene.add(directionalLight);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });

    const renderLoop = () => {
        updateBallPosition();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    };

    renderLoop();
};

// Start the game
init();
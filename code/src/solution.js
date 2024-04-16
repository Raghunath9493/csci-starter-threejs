import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, worn_baseball_ball;

// // Define variables to track camera movement
// let cameraPosition = new THREE.Vector3(0, 5, 10); // Initial camera position
// let cameraRotation = new THREE.Vector3(0, 0, 0); // Initial camera rotation

// Define variables for ball movement
let ballPosition = new THREE.Vector3(0, 1, 0); // Initial ball position
const ballMoveSpeed = 0.9; // Speed of ball movement
const ballRotationSpeed = 0.5; // Speed of ball rotation

// Define the camera position
const cameraPosition = new THREE.Vector3(20, 25, 25); // Adjust the values as needed

// Define the camera's target (where it's looki ng at)
const cameraTarget = ballPosition.clone(); // Assuming ballPosition is defined elsewhere

// Define the camera rotation
const cameraRotation = new THREE.Euler(); // Initialize with default values (0, 0, 0)


// Define variables to control camera movement speed and rotation speed
const cameraMoveSpeed = 0.3;
const cameraRotationSpeed = 0.01;



const load = (url) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
});

window.init = async() => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position the camera at the top right
    camera.position.copy(cameraPosition);
    camera.position.set(0, 0, 0);

    // Set the camera's target to focus on the ball
    camera.lookAt(ballPosition);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    scene.add(directionalLight);
    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(helper);

    const texture = new THREE.TextureLoader().load('./assets/Grass.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
    });
    const geometry = new THREE.PlaneGeometry(1000, 1000); // Adjust the size as needed
    const floor = new THREE.Mesh(geometry, material);
    floor.rotateX(-Math.PI / 2);
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // const gridHelper = new THREE.GridHelper(10, 10);
    // scene.add(gridHelper);

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    // Load the Ball model
    worn_baseball_ball = await load('./assets/worn_baseball_ball/scene.gltf');
    scene.add(worn_baseball_ball);

    // Set the initial position of the ball
    worn_baseball_ball.position.copy(ballPosition);

    // Set the camera position and rotation to be inside the room
    camera.position.set(0, 5, 0); // Adjust the position to be inside the room
    camera.rotation.set(0, Math.PI, 0); // Adjust the rotation to face the interior of the room
};


// Add event listeners for mouse and keyboard inputs
document.addEventListener('keydown', handleKeyDown);
// document.addEventListener('mousemove', handleMouseMove);

// Function to rotate the ball left
function rotateBallLeft() {
    if (worn_baseball_ball) {
        worn_baseball_ball.rotation.y += ballRotationSpeed;
    }
}

// Function to rotate the ball right
function rotateBallRight() {
    if (worn_baseball_ball) {
        worn_baseball_ball.rotation.y -= ballRotationSpeed;
    }
}

// Function to move the ball forward
function moveBallForward() {
    ballPosition.add(new THREE.Vector3(0, 0, -ballMoveSpeed));
}

// Function to move the ball backward
function moveBallBackward() {
    ballPosition.add(new THREE.Vector3(0, 0, ballMoveSpeed));
}

// Function to move the ball left
function moveBallLeft() {
    ballPosition.add(new THREE.Vector3(-ballMoveSpeed, 0, 0));
}

// Function to move the ball right
function moveBallRight() {
    ballPosition.add(new THREE.Vector3(ballMoveSpeed, 0, 0));
}
// Function to handle keyboard input
function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    switch (key) {
        case 'w': // Move ball forward
        case 'arrowup':
            moveBallForward();
            break;
        case 's': // Move ball backward
        case 'arrowdown':
            moveBallBackward();
            break;
        case 'a': // Move ball left
        case 'arrowleft':
            moveBallLeft();
            break;
        case 'd': // Move ball right
        case 'arrowright':
            moveBallRight();
            break;
        case 'q': // Rotate ball left
            rotateBallLeft();
            break;
        case 'e': // Rotate ball right
            rotateBallRight();
            break;
            // Add more cases for additional controls as needed
    }
}

// Function to update ball position and rotation
function updateBallPosition() {
    // Check if worn_baseball_ball is defined
    if (worn_baseball_ball) {
        // Calculate the direction of movement based on the change in ball position
        const movementDirection = ballPosition.clone().sub(worn_baseball_ball.position).normalize();

        // Calculate the angle between the current rotation and the movement direction
        const angle = Math.atan2(movementDirection.x, movementDirection.z);

        // Set the rotation of the ball to match the movement direction
        worn_baseball_ball.rotation.y = angle;

        // Update ball position
        worn_baseball_ball.position.copy(ballPosition);
    }
}



// Call updateBallPosition() in your render loop
window.loop = (dt, input) => {
    // Update ball position
    updateBallPosition();
    // Function to handle mouse movement
    function handleMouseMove(event) {
        // Update camera rotation based on mouse movement
        cameraRotation.y -= event.movementX * cameraRotationSpeed;
        cameraRotation.x -= event.movementY * cameraRotationSpeed;
    }

    // Function to move the camera forward
    function moveCameraForward() {
        cameraPosition.add(new THREE.Vector3(0, 0, -cameraMoveSpeed).applyEuler(cameraRotation));
    }

    // Function to move the camera backward
    function moveCameraBackward() {
        cameraPosition.add(new THREE.Vector3(0, 0, cameraMoveSpeed).applyEuler(cameraRotation));
    }

    // Function to rotate the camera left
    function rotateCameraLeft() {
        cameraRotation.y -= cameraRotationSpeed;
    }

    // Function to rotate the camera right
    function rotateCameraRight() {
        cameraRotation.y += cameraRotationSpeed;
    }

    // Function to rotate the camera up
    function rotateCameraUp() {
        cameraRotation.x -= cameraRotationSpeed;
    }

    // Function to rotate the camera down
    function rotateCameraDown() {
        cameraRotation.x += cameraRotationSpeed;
    }

    // Function to update camera position and rotation
    function updateCamera() {
        // Calculate the direction vector from the ball to the camera
        const direction = new THREE.Vector3(0, 0, 1); // Assuming camera is initially positioned behind the ball
        direction.applyEuler(cameraRotation); // Apply the camera's rotation

        // Set the camera position to be behind and above the ball
        const distance = 15; // Distance from the ball
        const height = 30; // Height above the ball
        const cameraOffset = direction.clone().multiplyScalar(distance).add(ballPosition).setY(ballPosition.y + height);

        // Update the camera position
        camera.position.copy(cameraOffset);

        // Point the camera towards the ball
        camera.lookAt(ballPosition);
    }


    // Call updateBallPosition() in your render loop
    window.loop = (dt, input) => {
        // Update ball position
        updateBallPosition();

        // Update camera position and rotation
        updateCamera();

        // Render the scene
        renderer.render(scene, camera);
    }

};
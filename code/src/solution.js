import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, Soccer_ball;
let arrowHelper; // Declare arrowHelper globally if not already done
let acceleration = new THREE.Vector3(0, 0, 0); // Initialize acceleration vector
const keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false, q: false, e: false };
// const acceleration = 0.02; // Acceleration of the ball
const ballDeceleration = 0.08; // Deceleration of the ball when not pressing any keys
let velocity = new THREE.Vector3(0, 0, 0); // Initial velocity of the ball
const ballMoveSpeed = 0.5; // Speed of ball movement
const ballRotationSpeed = 0.1; // Speed of ball rotation
const ballPosition = new THREE.Vector3(0, 3, 0);
const cameraOffset = new THREE.Vector3(0, 15, 10); // Offset to maintain camera position relative to the ball
let toys = []; // To keep track of the toys in the scene
let timerElement; // To display the timer
let toyCountElement; // To display the toy count
let gameOverElement; // To display the game over title
let timerSeconds = 60; // 60-second timer
let timerInterval; // For updating the timer
let gameEnded = false; // Game state to check if the game has ended
let backgroundMusicSource; // Declare this globally or in a broader scope
// Declare audioContext globally
const audioContext = new(window.AudioContext || window.webkitAudioContext)();
// Start background music function
const playBackgroundMusic = async(url) => {
    try {
        const musicBuffer = await loadSound(url);
        if (musicBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = musicBuffer;
            source.loop = true;
            source.connect(audioContext.destination);
            source.start(0);
            backgroundMusicSource = source;
        }
    } catch (error) {
        console.error("Failed to play background music:", error);
    }
};
// Function to load sound files
const loadSound = async(url) => {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Failed to load sound:", error);
        return null;
    }
};
// Function to stop background music
const stopBackgroundMusic = () => {
    if (backgroundMusicSource) {
        backgroundMusicSource.stop();
        backgroundMusicSource = null;
    }
};
// Define floor boundaries
const floorBounds = {
    minX: -500, // Left boundary
    maxX: 500, // Right boundary
    minZ: -500, // Back boundary
    maxZ: 500 // Front boundary
};
const getRandomColor = () => Math.floor(Math.random() * 0xffffff);
// Function to find the nearest toy and get the direction towards it
const getDirectionToNearestToy = () => {
        let nearestToy = null;
        let minDistance = Infinity;
        let direction = new THREE.Vector3();
        toys.forEach(toy => {
            let distance = toy.position.distanceTo(Soccer_ball.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestToy = toy;
                direction.subVectors(toy.position, Soccer_ball.position).normalize();
            }
        });
        return { nearestToy, direction };
    }
    // Function to update or create an arrow pointing to the nearest toy
const updateDirectionToToy = () => {
    const { nearestToy, direction } = getDirectionToNearestToy();
    if (nearestToy) {
        if (arrowHelper) {
            arrowHelper.setDirection(direction);
            arrowHelper.position.copy(Soccer_ball.position);
        } else {
            arrowHelper = new THREE.ArrowHelper(direction, Soccer_ball.position, 10, 0xffff00);
            scene.add(arrowHelper);
        }
    } else {
        if (arrowHelper) {
            scene.remove(arrowHelper);
            arrowHelper = null;
        }
    }
};
// Main render loop
const renderLoop = () => {
    if (!gameEnded) {
        updateBallPosition();
        checkCollision();
        updateDirectionToToy(); // Ensure this is being called
    }
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
};
const loadModel = (url) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, (error) => {
        console.error("Error loading model:", error);
        reject(error);
    });
});

// Function to add toys to the scene with random colors
const addToys = () => {
    const toyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const numToys = 100; // Total number of toys
    for (let i = 0; i < numToys; i++) {
        const toyMaterial = new THREE.MeshBasicMaterial({ color: getRandomColor() });
        const posX = Math.random() * (floorBounds.maxX - floorBounds.minX - 2) + floorBounds.minX + 1;
        const posZ = Math.random() * (floorBounds.maxZ - floorBounds.minZ - 2) + floorBounds.minZ + 1;
        const posY = 0.5; // Assuming toys rest at ground level
        const toy = new THREE.Mesh(toyGeometry, toyMaterial);
        toy.position.set(posX, posY, posZ);
        scene.add(toy);
        toys.push(toy);
    }
};

const updateToyCountDisplay = () => {
    if (toyCountElement) {
        toyCountElement.textContent = `Toys Left: ${toys.length}`; // Display the number of toys left
    }
};
// Function to maintain a consistent camera distance
const updateCameraPosition = () => {
    const targetPosition = Soccer_ball.position.clone(); // Position of the ball
    const desiredCameraPosition = targetPosition.add(cameraOffset); // Desired camera position with offset
    camera.position.lerp(desiredCameraPosition, 0.1); // Smoothly interpolate to the desired position
    camera.lookAt(Soccer_ball.position); // Ensure the camera looks at the ball
};
const maxSpeed = 0.4; // Maximum speed of the ball
// Update ball position
const updateBallPosition = () => {
    // Reset acceleration at the beginning of each frame
    acceleration.set(0, 0, 0);
    let moveVector = new THREE.Vector3(0, 0, 0);
    if (keysPressed.ArrowUp || keysPressed.w) {
        acceleration.z -= ballMoveSpeed;
        Soccer_ball.rotation.x -= ballRotationSpeed; // Rotate around X-axis
    }
    if (keysPressed.ArrowDown || keysPressed.s) {
        acceleration.z += ballMoveSpeed;
        Soccer_ball.rotation.x += ballRotationSpeed; // Rotate in the opposite direction
    }
    if (keysPressed.ArrowLeft || keysPressed.a) {
        acceleration.x -= ballMoveSpeed;
        Soccer_ball.rotation.z -= ballRotationSpeed; // Rotate around Z-axis
    }
    if (keysPressed.ArrowRight || keysPressed.d) {
        acceleration.x += ballMoveSpeed;
        Soccer_ball.rotation.z += ballRotationSpeed; // Rotate in the opposite direction
    }
    // Apply the acceleration to velocity
    velocity.add(acceleration);
    // Apply deceleration
    velocity.multiplyScalar(1 - ballDeceleration);
    // Limit the velocity to the maximum speed
    velocity.clampLength(0, maxSpeed);
    // Update the position using the velocity vector
    Soccer_ball.position.add(velocity);
    // Calculate potential new position
    let newPos = new THREE.Vector3().addVectors(Soccer_ball.position, velocity);
    // Enforce boundaries
    newPos.x = THREE.MathUtils.clamp(newPos.x, floorBounds.minX, floorBounds.maxX);
    newPos.z = THREE.MathUtils.clamp(newPos.z, floorBounds.minZ, floorBounds.maxZ);
    // Update the ball's position
    Soccer_ball.position.copy(newPos);
    // Check boundaries and adjust the position and velocity if needed
    if (newPos.x < floorBounds.minX || newPos.x === floorBounds.minX) {
        velocity.x = 0; // Stop horizontal movement
    }
    if (newPos.z < floorBounds.minZ || newPos.z === floorBounds.minZ) {
        velocity.z = 0; // Stop forward/backward movement
    }
    // Boundary collision checks
    if (Soccer_ball.position.x < floorBounds.minX || Soccer_ball.position.x > floorBounds.maxX ||
        Soccer_ball.position.z < floorBounds.minZ || Soccer_ball.position.z > floorBounds.maxZ) {
        Soccer_ball.position.sub(velocity); // Revert last move if out of bounds
        velocity.set(0, 0, 0);
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
    // Calculate the new position
    const newPosition = Soccer_ball.position.clone().add(moveVector);
    // Check collision with the plane (grass field)
    if (newPosition.x < floorBounds.minX || newPosition.x > floorBounds.maxX ||
        newPosition.z < floorBounds.minZ || newPosition.z > floorBounds.maxZ) {
        // Ball is trying to move out of bounds, reset its position
        newPosition.copy(Soccer_ball.position);
        velocity.set(0, 0, 0);
    }
    // Update the ball's position
    Soccer_ball.position.copy(newPosition);
    updateCameraPosition();
};
// After a toy is collected and removed
const checkCollision = () => {
    const ballBox = new THREE.Box3().setFromObject(Soccer_ball);
    for (let i = toys.length - 1; i >= 0; i--) {
        const toyBox = new THREE.Box3().setFromObject(toys[i]);
        if (ballBox.intersectsBox(toyBox)) { // If collision occurs
            const toyColor = toys[i].material.color.getHex(); // Get toy's color
            Soccer_ball.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(toyColor); // Change ball's color
                }
            });
            scene.remove(toys[i]); // Remove toy from scene
            toys.splice(i, 1); // Remove from toys array
            updateToyCountDisplay();
        }
    }
    if (toys.length === 0) {
        gameEnded = true;
        showGameOver();
    }
};

// Function to update the timer
const updateTimerDisplay = () => {
    if (timerElement) {
        timerElement.textContent = `Time: ${timerSeconds}`; // Display remaining time
    }
};

// Function to show the game over title
const showGameOver = () => {
    clearInterval(timerInterval);
    gameEnded = true; // Set the game ended flag
    stopBackgroundMusic(); // Stop the background music
    if (!gameOverElement) {
        gameOverElement = document.createElement("div");
        gameOverElement.style.position = "absolute";
        gameOverElement.style.top = "50%";
        gameOverElement.style.left = "50%";
        gameOverElement.style.transform = "translate(-50%, -50%)";
        gameOverElement.style.fontSize = "48px";
        gameOverElement.style.color = "white";
        gameOverElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        gameOverElement.style.padding = "20px";
        gameOverElement.textContent = "Game Over!";
        document.body.appendChild(gameOverElement);
    }
};
const startTimer = () => {
    timerSeconds = 100;
    timerInterval = setInterval(() => {
        if (!gameEnded) {
            timerSeconds--;
            updateTimerDisplay();

            if (timerSeconds <= 0) {
                showGameOver(); // End the game if time runs out
            }
        }
    }, 1000); // Update every second
};

const init = async() => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.domElement.style.position = 'relative'; // Ensure correct positioning
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.5, 1000);
    try {
        Soccer_ball = await loadModel('./assets/Soccer_ball/scene.gltf');
        if (Soccer_ball) {
            Soccer_ball.scale.set(4, 4, 4);
            Soccer_ball.position.copy(ballPosition);
            Soccer_ball.visible = true;
            Soccer_ball.material = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Ensure there's a material that can change color
            scene.add(Soccer_ball);

        }
    } catch (error) {
        console.error("Failed to load Soccer_ball:", error);
    }
    startTimer(); // Start the game timer
    addToys();

    // Create a text element for the timer and toy count
    timerElement = document.createElement('div');
    timerElement.style.position = 'absolute';
    timerElement.style.top = '10px';
    timerElement.style.right = '10px';
    timerElement.style.fontSize = '24px';
    timerElement.style.color = 'white';
    document.body.appendChild(timerElement);

    toyCountElement = document.createElement('div');
    toyCountElement.style.position = 'absolute';
    toyCountElement.style.top = '10px';
    toyCountElement.style.right = '100px';
    toyCountElement.style.fontSize = '24px';
    toyCountElement.style.color = 'white';
    document.body.appendChild(toyCountElement);

    // Initialize the toy count display
    updateToyCountDisplay();
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('./assets/Grass.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(100, 100);

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    // Adjust the angle by modifying the rotation values
    // plane.rotateZ(Math.PI / 4); // Example rotation to create a slanted angle (tilted to the right)
    scene.add(plane);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    scene.add(directionalLight);
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    // Handle key presses and releases
    window.addEventListener('keydown', (e) => {
        if (!gameEnded) keysPressed[e.key] = true; // Check if the game is over
    });
    window.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });
    // Check if audioContext is in suspended state (this typically happens in browsers like Chrome)
    if (audioContext.state === 'suspended') {
        // Add an event listener to the document that resumes the audioContext when the user interacts with the page
        document.addEventListener('click', function() {
            audioContext.resume().then(() => {
                console.log('Playback resumed successfully');
            });
        }, {
            once: true // Use the listener once
        });
    }

    // Function to start playing background music when user interacts
    const startBackgroundMusic = async() => {
        try {
            await playBackgroundMusic('./assets/Audio/Crazy_Frog.mp3');
            // console.log("Background music started.");
        } catch (error) {
            console.error("Error starting background music:", error);
        }
    };
    const setupScene = () => {
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('./assets/Grass.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(100, 100);
        const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotateX(-Math.PI / 2);
        scene.add(plane);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        scene.add(directionalLight);
    };

    const setupEventListeners = () => {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        document.body.addEventListener('keydown', (e) => {
            if (!gameEnded) keysPressed[e.key] = true;
        });
        document.body.addEventListener('keyup', (e) => {
            keysPressed[e.key] = false;
        });
    };
    setupScene();
    // Initial call to start music with interaction
    document.body.addEventListener('click', startBackgroundMusic, { once: true });
    // Main render loop
    const renderLoop = () => {
        if (!gameEnded) {
            updateBallPosition();
            checkCollision();
            updateDirectionToToy();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    };
    setupEventListeners();
    renderLoop(); // Start the game loop
};


// Start the game
init().then(() => {;
    renderLoop(); // Start the game loop
});
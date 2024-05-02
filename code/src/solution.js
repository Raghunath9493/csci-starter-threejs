import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer, scene, camera, Soccer_ball;
let arrowHelper; // Declare arrowHelper globally if not already done
let acceleration = new THREE.Vector3(0, 0, 0); // Initialize acceleration vector
const keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, s: false, a: false, d: false, q: false, e: false, space: false };
const accelerationAmount = 0.02; // Amount by which the ball's speed will increase per frame
const decelerationFactor = 0.98; // Factor by which the velocity decreases per frameconst ballDeceleration = 0.08; // Deceleration of the ball when not pressing any keys
let velocity = new THREE.Vector3(0, 0, 0); // Initial velocity of the ball
const ballMoveSpeed = 0.5; // Speed of ball movement
const ballRotationSpeed = 0.1; // Speed of ball rotation
const ballRadius = 3; // This is the assumed radius based on your scaling factor
const ballPosition = new THREE.Vector3(0, ballRadius, 0); // Position it at one radius above the grass
const cameraOffset = new THREE.Vector3(0, 15, 10); // Offset to maintain camera position relative to the ball
let toys = []; // To keep track of the toys in the scene
let timerElement; // To display the timer
let toyCountElement; // To display the toy count
let gameOverElement; // To display the game over title
let timerSeconds = 300; // 150-second timer
let timerInterval; // For updating the timer
let gameEnded = false; // Game state to check if the game has ended
let backgroundMusicSource; // Declare this globally or in a broader scope
const gravity = 0.05; // Gravity effect to pull the ball down
let jumpStrength = 1.5; // Initial strength of the jump
let arrowDistanceElement; // Declare arrowDistanceElement globally

document.addEventListener('DOMContentLoaded', function() {
    createStartButton();
});

// Declare audioContext globally
const audioContext = new(window.AudioContext || window.webkitAudioContext)();
// Start background music function

// Function to initialize or resume the AudioContext safely after user interaction
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new(window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully!");
        }).catch(error => {
            console.error("Error resuming AudioContext:", error);
        });
    }
}
// Function to play background music
const playBackgroundMusic = async(url) => {
    if (!audioContext) return; // Check if AudioContext is initialized
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

// Load the Arrow GLTF model for the arrow
// Function to load the Arrow model and add it to the scene
// Function to load the Arrow GLTF model for the arrow
async function loadArrowModel() {
    const loader = new GLTFLoader();
    try {
        const arrowModel = await new Promise((resolve, reject) => {
            loader.load('./assets/Arrow/scene.gltf', (gltf) => { // Ensure path is correct
                resolve(gltf.scene);
            }, undefined, (error) => {
                console.error("Error loading arrow model:", error);
                reject(error);
            });
        });

        // If there's an existing arrowHelper, remove it first
        if (arrowHelper) {
            scene.remove(arrowHelper);
        }

        // Assuming the arrow model's correct mesh or adjustment might be needed based on actual model structure
        arrowModel.scale.set(10, 10, 10); // Scale as necessary
        arrowModel.position.copy(Soccer_ball.position); // Position it based on your game logic

        arrowHelper = arrowModel; // Update the global arrowHelper reference
        scene.add(arrowHelper); // Add the new arrow model to the scene
    } catch (error) {
        console.error("Failed to load arrow model:", error);
    }
}

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

// Create start button and its event handler
function createStartButton() {
    const button = document.createElement("button");
    button.textContent = "Start Game";
    document.body.appendChild(button);
    button.addEventListener("click", function() {
        initializeAudioContext(); // Initialize or resume AudioContext on user interaction
        startGame();
    });
}

async function startGame() {
    await init();
    playBackgroundMusic('./assets/Audio/Crazy_Frog.mp3');
    renderLoop();
    document.querySelector("button").style.display = "none"; // Assume there's only one button
}

document.addEventListener('DOMContentLoaded', createStartButton);
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


// // Function to load GLTF model
// Function to load a GLTF model from a URL
async function loadModel(url) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) => {
            resolve(gltf.scene);
        }, undefined, (error) => {
            console.error("Error loading model:", error);
            reject(error);
        });
    });
}


// // Function to load the GLTF model for the arrow
// const loadArrowModel = async() => {
//     try {
//         const loader = new GLTFLoader();
//         const arrowModel = await new Promise((resolve, reject) => {
//             loader.load('./assets/Arrow', (gltf) => {
//                 resolve(gltf.scene);
//             }, undefined, (error) => {
//                 console.error("Error loading model:", error);
//                 reject(error);
//             });
//         });
//         const arrowMesh = arrowModel.children[0];
//         arrowHelper = new THREE.ArrowHelper(arrowMesh.getWorldDirection(new THREE.Vector3()), Soccer_ball.position, 10, 0xffff00);
//         scene.add(arrowHelper);
//     } catch (error) {
//         console.error("Failed to load arrow model:", error);
//     }
// };

// Function to update or create an arrow pointing to the nearest toy
const updateDirectionToToy = () => {
    const { nearestToy, direction } = getDirectionToNearestToy();
    if (nearestToy) {
        if (arrowHelper) {
            // Update existing ArrowHelper
            arrowHelper.setDirection(direction);
            arrowHelper.position.copy(Soccer_ball.position);
        } else {
            // Create a new ArrowHelper if none exists
            arrowHelper = new THREE.ArrowHelper(direction, Soccer_ball.position, 10, 0xffff00);
            scene.add(arrowHelper);
        }
    } else {
        // Handle case where no toys are available
        if (arrowHelper) {
            scene.remove(arrowHelper);
            arrowHelper = null;
        }
    }

    // Optionally, handle arrow distance display update or removal
    updateArrowDistanceDisplay(nearestToy, direction);
};

const updateArrowDistanceDisplay = (nearestToy, direction) => {
    if (nearestToy) {
        if (!arrowDistanceElement) {
            // Create arrowDistanceElement if it does not exist
            arrowDistanceElement = document.createElement('div');
            arrowDistanceElement.style.position = 'absolute';
            arrowDistanceElement.style.color = 'white';
            arrowDistanceElement.style.fontSize = '18px';
            arrowDistanceElement.style.left = '10px';
            arrowDistanceElement.style.top = '10px';
            document.body.appendChild(arrowDistanceElement);
        }
        // Update text content
        const distance = Soccer_ball.position.distanceTo(nearestToy.position).toFixed(2);
        arrowDistanceElement.textContent = `Distance to nearest toy: ${distance} meters`;
    } else {
        if (arrowDistanceElement) {
            document.body.removeChild(arrowDistanceElement);
            arrowDistanceElement = null;
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

// Function to add toys to the scene with random colors
const addToys = () => {
    const toyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const numToys = 5; // Total number of toys
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

// Function to update the toy count display
const updateToyCountDisplay = () => {
    if (toyCountElement) {
        toyCountElement.textContent = `Toys Left: ${toys.length}`;
        if (toys.length === 0) {
            showCongratulations(); // Check here also to handle any edge cases
        }
    }
};
// Function to maintain a consistent camera distance
const updateCameraPosition = () => {
    const targetPosition = Soccer_ball.position.clone(); // Position of the ball
    const desiredCameraPosition = targetPosition.add(cameraOffset); // Desired camera position with offset
    camera.position.lerp(desiredCameraPosition, 0.1); // Smoothly interpolate to the desired position
    camera.lookAt(Soccer_ball.position); // Ensure the camera looks at the ball
};
const maxSpeed = 0.35; // Maximum speed of the ball
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
    // Limit the velocity to the maximum speed
    velocity.clampLength(0, maxSpeed);
    // Apply deceleration
    velocity.multiplyScalar(decelerationFactor);

    // Clamp the velocity to ensure it doesn't exceed maxSpeed
    if (velocity.length() > maxSpeed) {
        velocity.normalize().multiplyScalar(maxSpeed);
    }
    // Update the position using the velocity vector
    Soccer_ball.position.add(velocity);
    // Enforce boundary conditions
    if (Soccer_ball.position.x <= floorBounds.minX || Soccer_ball.position.x >= floorBounds.maxX) {
        velocity.x = 0;
        Soccer_ball.position.x = THREE.MathUtils.clamp(Soccer_ball.position.x, floorBounds.minX, floorBounds.maxX);
    }
    if (Soccer_ball.position.z <= floorBounds.minZ || Soccer_ball.position.z >= floorBounds.maxZ) {
        velocity.z = 0;
        Soccer_ball.position.z = THREE.MathUtils.clamp(Soccer_ball.position.z, floorBounds.minZ, floorBounds.maxZ);
    }
    // Calculate potential new position
    let newPos = new THREE.Vector3().addVectors(Soccer_ball.position, velocity);
    // Enforce boundaries
    newPos.x = THREE.MathUtils.clamp(newPos.x, floorBounds.minX, floorBounds.maxX);
    newPos.z = THREE.MathUtils.clamp(newPos.z, floorBounds.minZ, floorBounds.maxZ);
    // Update the ball's position
    Soccer_ball.position.copy(newPos);

    // Boundary checks to keep the ball within the field
    Soccer_ball.position.clamp(new THREE.Vector3(floorBounds.minX, 0, floorBounds.minZ), new THREE.Vector3(floorBounds.maxX, 0, floorBounds.maxZ));

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

    // Vertical movement logic
    if (keysPressed.space && Soccer_ball.position.y <= ballRadius + 0.1) { // Allow jump only if the ball is close to or on the ground
        velocity.y += jumpStrength; // Apply jump strength to velocity
    }

    // Apply gravity if the ball is above the ground
    if (Soccer_ball.position.y > ballRadius) {
        velocity.y -= gravity;
    } else {
        Soccer_ball.position.y = ballRadius; // Ensure ball does not go below the grass
        velocity.y = 0; // Reset vertical velocity when touching the ground
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

const showCongratulations = () => {
    if (!gameOverElement) {
        gameOverElement = document.createElement("div");
        gameOverElement.style.position = "absolute";
        gameOverElement.style.top = "0";
        gameOverElement.style.left = "0";
        gameOverElement.style.width = "100%";
        gameOverElement.style.height = "100%";
        gameOverElement.style.display = "flex";
        gameOverElement.style.justifyContent = "center";
        gameOverElement.style.alignItems = "center";
        gameOverElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        document.body.appendChild(gameOverElement);

        const winImage = new Image();
        winImage.src = './assets/cup.gif'; // Update path to your downloaded image
        winImage.style.width = "50%";
        winImage.style.height = "auto";
        winImage.style.borderRadius = "100px";
        gameOverElement.appendChild(winImage);
    }
    stopBackgroundMusic();
    gameEnded = true;
}

const checkCollision = () => {
    const ballBox = new THREE.Box3().setFromObject(Soccer_ball);
    for (let i = toys.length - 1; i >= 0; i--) {
        const toyBox = new THREE.Box3().setFromObject(toys[i]);
        if (ballBox.intersectsBox(toyBox)) {
            const toyColor = toys[i].material.color.getHex(); // Get toy's color
            Soccer_ball.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(toyColor); // Change ball's color
                }
            });

            // Call explodeToy() function when collision occurs
            explodeToy(toys[i]);

            scene.remove(toys[i]); // Remove toy from scene
            toys.splice(i, 1); // Remove from toys array
            timerSeconds += 1; // Increment timer by one second for each toy collected
            updateToyCountDisplay();
            updateTimerDisplay(); // Update the UI for the timer
        }
    }
    if (toys.length === 0) {
        gameEnded = true;
        showGameOver();
    }
};

// Function to create explosion animation for a toy
const explodeToy = (toy) => {
    const explosionPieces = []; // Array to hold the toy pieces

    // Create smaller pieces from the toy geometry
    const toyGeometry = toy.geometry;
    const toyMaterial = toy.material.clone(); // Clone toy's material
    const pieceCount = 10; // Number of pieces

    for (let i = 0; i < pieceCount; i++) {
        // Create a new mesh for each piece
        const piece = new THREE.Mesh(toyGeometry, toyMaterial);

        // Randomize rotation
        piece.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

        // Randomize scale
        const scale = Math.random() * 0.5 + 0.5; // Scale between 0.5 and 1
        piece.scale.set(scale, scale, scale);

        // Add piece to the scene
        scene.add(piece);
        explosionPieces.push(piece);
    }

    // Move pieces away from the original toy's position
    const explosionForce = 5;
    explosionPieces.forEach((piece) => {
        const direction = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize();
        piece.position.copy(toy.position).addScaledVector(direction, explosionForce);
    });

    // Remove the original toy from the scene
    scene.remove(toy);

    // Remove exploded pieces after a delay
    setTimeout(() => {
        explosionPieces.forEach((piece) => {
            scene.remove(piece);
        });
    }, 100); // Adjust the delay (in milliseconds) as needed
};

// Function to update the timer display to show minutes and seconds
const updateTimerDisplay = () => {
    if (timerElement) {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`; // Format seconds with leading zero
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


// Function to start and manage the timer
const startTimer = () => {
    timerSeconds = 180; // Starting time in seconds
    timerInterval = setInterval(() => {
        if (timerSeconds > 0 && !gameEnded) {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                showGameOver(); // End the game if time runs out
            }
        } else {
            clearInterval(timerInterval); // Stop the timer if the game ends
            if (gameEnded) {
                showGameOver();
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
    toyCountElement.style.right = '170px';
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
    // scene.add(wireframeSphere);
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
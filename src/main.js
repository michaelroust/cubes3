import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d";
import Stats from 'stats.js'; // Import stats.js (if using npm)

const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: MS, 2: memory
document.body.appendChild(stats.dom); // Append the stats panel to the DOM

// Create the physics world
const gravity = new RAPIER.Vector3(0, -9.81, 0);
const world = new RAPIER.World(gravity);

// Create a scene in Three.js
const scene = new THREE.Scene();

// Adjust the camera position to zoom out and see the ground
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30); // Move camera higher up and further back to see the ground
camera.lookAt(0, 0, 0); // Ensure the camera looks at the center of the scene

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// Add a gray ground plane to the scene
const groundGeometry = new THREE.PlaneGeometry(200, 200); // Large plane
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 }); // Use ShadowMaterial for ground to receive shadows
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the plane to be flat on the ground
ground.position.y = -1; // Position the ground just below the cubes
ground.receiveShadow = true; // Make the ground receive shadows
scene.add(ground);

// Add a static collider for the ground to Rapier
const groundDesc = RAPIER.ColliderDesc.cuboid(100, 1, 100); // A large static cuboid collider
world.createCollider(groundDesc, RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0)); // Set position and make it static

// Set the camera position
camera.position.z = 30;

// Cube spawner setup
const cubes = []; // Array to keep track of all cubes and their physics bodies
const spawnInterval = 25; // Time between each spawn in milliseconds (same speed, 5x cubes)
let spawnCubes = true; // Flag to toggle cube spawning

// Create a div to show the cube count in the top right corner
const cubeCountDiv = document.createElement('div');
cubeCountDiv.style.position = 'absolute';
cubeCountDiv.style.top = '10px';
cubeCountDiv.style.right = '10px';
cubeCountDiv.style.color = 'white';
cubeCountDiv.style.fontSize = '20px';
document.body.appendChild(cubeCountDiv);

// Function to create and spawn a single cube
function spawnCube() {
  // Create the Three.js cube geometry and material
  const geometry = new THREE.BoxGeometry(1, 1, 1); // Smaller cube size (1x1x1)
  const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }); // Use MeshStandardMaterial for shadows
  const cube = new THREE.Mesh(geometry, material);
  
  // Set initial position (spawn it within the smaller X, Z range and 2x higher Y range)
  cube.position.set(Math.random() * 20 - 10, Math.random() * 20 + 10, Math.random() * 20 - 10); // X and Z range [-10, 10], Y range [10, 30]
  
  // Enable the cube to cast shadows
  cube.castShadow = true;
  cube.receiveShadow = true;
  
  // Add the cube to the Three.js scene
  scene.add(cube);

  // Create the rigid body for the cube in Rapier
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(cube.position.x, cube.position.y, cube.position.z);
  const body = world.createRigidBody(bodyDesc);
  const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5); // Smaller size for collider to match the new cube size
  world.createCollider(colliderDesc, body);

  // Store the cube and its associated physics body
  cubes.push({ cube, body });

  // Update the cube count display
  cubeCountDiv.textContent = `Cube Count: ${cubes.length}`;
}

// Function to spawn multiple cubes at once
function spawnMultipleCubes(count = 5) {
  for (let i = 0; i < count; i++) {
    spawnCube(); // Spawn 1 cube at a time
  }
}

// Spawn cubes at regular intervals only if `spawnCubes` is true
let spawnIntervalId = null;
function startSpawning() {
  if (!spawnIntervalId) {
    spawnIntervalId = setInterval(() => {
      if (spawnCubes) {
        spawnMultipleCubes(); // Spawn 5 cubes at each interval
      }
    }, spawnInterval);
  }
}

// Stop spawning cubes
function stopSpawning() {
  if (spawnIntervalId) {
    clearInterval(spawnIntervalId);
    spawnIntervalId = null;
  }
}

// Toggle spawn state when button is clicked
const toggleButton = document.createElement('button');
toggleButton.innerHTML = 'Stop Spawning';
toggleButton.style.position = 'absolute';
toggleButton.style.top = '50px';
toggleButton.style.right = '10px';
toggleButton.style.fontSize = '20px';
document.body.appendChild(toggleButton);

// Button click event
toggleButton.addEventListener('click', () => {
  spawnCubes = !spawnCubes; // Toggle spawnCubes flag

  if (spawnCubes) {
    toggleButton.innerHTML = 'Stop Spawning';
    startSpawning(); // Start spawning cubes
  } else {
    toggleButton.innerHTML = 'Start Spawning';
    stopSpawning(); // Stop spawning cubes
  }
});

// Add ambient light to the scene (provides soft, non-directional light)
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Color: 0x404040 (gray), Intensity: 1
scene.add(ambientLight);

// Add a directional light (for shadows)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10); // Position the light above and at an angle
light.castShadow = true; // Enable shadow casting for the light
scene.add(light);

// Update and render loop
function animate() {
  stats.begin(); // Begin measuring

  // Step the physics world
  world.step();

  // Update the position and rotation of each cube based on its physics body
  cubes.forEach(({ cube, body }) => {
    const position = body.translation();
    const rotation = body.rotation();

    // Update the Three.js mesh position to match the physics body
    cube.position.set(position.x, position.y, position.z);

    // Update the Three.js mesh rotation to match the physics body
    // Convert the Rapier quaternion to a Three.js quaternion
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    cube.rotation.setFromQuaternion(quat);
  });

  // Render the scene
  renderer.render(scene, camera);

  stats.end(); // End measuring and display results

  // Request next animation frame
  requestAnimationFrame(animate);
}

startSpawning(); // Start spawning cubes on load
animate();

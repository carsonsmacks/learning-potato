// Basic setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Controls
const controls = new THREE.PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
    controls.lock();
});

// Maze walls (simplified maze)
const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const walls = [];
for (let z = 0; z < mazeLayout.length; z++) {
    for (let x = 0; x < mazeLayout[z].length; x++) {
        if (mazeLayout[z][x] === 1) {
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x - mazeLayout[0].length/2, 1, z - mazeLayout.length/2);
            scene.add(wall);
            walls.push(wall);
        }
    }
}

// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Coins
const coinGeometry = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
const coins = [];

for (let i = 0; i < 5; i++) {
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    
    // Find a random position that's not a wall
    let x, z;
    do {
        x = Math.floor(Math.random() * (mazeLayout[0].length - 2)) + 1;
        z = Math.floor(Math.random() * (mazeLayout.length - 2)) + 1;
    } while (mazeLayout[z][x] === 1);
    
    coin.position.set(
        x - mazeLayout[0].length/2,
        1,
        z - mazeLayout.length/2
    );
    
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);
    coins.push(coin);
}

// Game state
let collectedCoins = 0;
const coinDisplay = document.getElementById('coins');
const messageDisplay = document.getElementById('message');

// Collision detection
function checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(controls.getObject());
    
    // Check wall collisions
    for (const wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (playerBox.intersectsBox(wallBox)) {
            // Simple collision response - move player back
            controls.moveRight(-0.1);
            controls.moveForward(-0.1);
        }
    }
    
    // Check coin collisions
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const distance = controls.getObject().position.distanceTo(coin.position);
        
        if (distance < 0.5) {
            scene.remove(coin);
            coins.splice(i, 1);
            collectedCoins++;
            coinDisplay.textContent = collectedCoins;
            
            if (collectedCoins === 5) {
                messageDisplay.textContent = "You collected all coins! You win!";
            }
        }
    }
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        checkCollisions();
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

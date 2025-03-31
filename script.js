import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Set up the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Set up the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add orbit controls to navigate the scene
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add a ground plane instead of a grid
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.receiveShadow = true;
scene.add(ground);

// Instantiate the GLTF loader
const loader = new GLTFLoader();

// Optional: Show loading progress
const loadingElement = document.createElement('div');
loadingElement.style.position = 'absolute';
loadingElement.style.top = '50%';
loadingElement.style.left = '50%';
loadingElement.style.transform = 'translate(-50%, -50%)';
loadingElement.style.color = 'white';
loadingElement.style.fontSize = '24px';
loadingElement.style.fontFamily = 'Arial, sans-serif';
loadingElement.style.background = 'rgba(0,0,0,0.7)';
loadingElement.style.padding = '20px';
loadingElement.style.borderRadius = '5px';
loadingElement.textContent = 'Loading: 0%';
document.body.appendChild(loadingElement);

// Load the Bugatti model
loader.load(
    'skull.glb',
    function(gltf) {
        const model = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Enable shadows
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = true;
            }
        });
        
        // Add the model to the scene
        scene.add(model);
        
        // Remove loading element
        document.body.removeChild(loadingElement);
    },
    function(xhr) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        loadingElement.textContent = `Loading: ${Math.round(percentComplete)}%`;
        console.log(`${Math.round(percentComplete)}% loaded`);
    },
    function(error) {
        console.error('An error happened', error);
        loadingElement.textContent = 'Error loading model';
    }
);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

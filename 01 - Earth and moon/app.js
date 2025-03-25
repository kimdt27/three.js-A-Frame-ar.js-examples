import * as THREE from '../libs/js/three.module.js';

        import { OrbitControls } from '../libs/js/OrbitControls.js';
        import { ARButton } from '../libs/js/ARButton.js';


        class App {
            constructor() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(0, 1.6, 5);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.xr.enabled = true;
                document.body.appendChild(this.renderer.domElement);
        
                // controller
                this.controller = this.renderer.xr.getController(0);
                this.controller.addEventListener('select', this.onSelect.bind(this));
                this.scene.add(this.controller);
        
                // Textures
                const textureLoader = new THREE.TextureLoader();
                const earthTexture = textureLoader.load('img/earth.jpg');
                const moonTexture = textureLoader.load('img/moon.jpg');

                // Earth
                const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
                const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
                const earth = new THREE.Mesh(earthGeometry, earthMaterial);
                this.scene.add(earth);
        
                // Moon
                const moonGeometry = new THREE.SphereGeometry(0.27, 16, 16);
                const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                const moonOrbitDistance = 3;
                moon.position.set(moonOrbitDistance, 0, 0);
                earth.add(moon); 
        
                const light = new THREE.DirectionalLight(0xffffff, 1);
                light.position.set(5, 5, 5);
                this.scene.add(light);
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
                this.scene.add(ambientLight);

                // orbit controls
                const controls = new OrbitControls(this.camera, this.renderer.domElement);
        
                // Resize the renderer when the window is resized
                window.addEventListener('resize', () => {
                    this.renderer.setSize(window.innerWidth, window.innerHeight);
                    this.camera.aspect = window.innerWidth / window.innerHeight;
                    this.camera.updateProjectionMatrix();
                });
        
                // Start the animation
                this.animate(earth, moon, moonOrbitDistance, controls);
                this.setupXR();
            }
        
            onSelect() {     
                if (!this.renderer || !this.scene) {
                    return;
                }
        
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
                const mesh = new THREE.Mesh(geometry, material);
        
                // Place obj
                mesh.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
                mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
        
                this.scene.add(mesh);
            }
        
            setupXR() {
                this.renderer.xr.enabled = true;
                document.body.appendChild(ARButton.createButton(this.renderer));
            }
        
            animate(earth, moon, moonOrbitDistance, controls) {
                this.renderer.setAnimationLoop(() => {
                    earth.rotation.y += 0.005;
                    const time = performance.now() * 0.001;
                    moon.position.x = moonOrbitDistance * Math.cos(0.02 * time);
                    moon.position.z = moonOrbitDistance * Math.sin(0.02 * time);
                    controls.update();
                    this.renderer.render(this.scene, this.camera);
                });
            }
        }
        
        export { App };
        
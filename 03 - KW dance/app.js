import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { LoadingBar } from '../libs/LoadingBar.js';
import { Stats } from '../libs/stats.module.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.set( 0, 1.6, 3 );
        this.camera.lookAt( 0, 0, 0 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );

        //add a plane for KW to stand on
        const geometry = new THREE.PlaneGeometry( 10, 10 );
        const material = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.DoubleSide} );

        const plane = new THREE.Mesh( geometry, material );
        plane.rotateX(1.57079633); //rotate 90 deg in radians
        this.scene.add( plane );
		
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 1, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
        
        this.loadingBar = new LoadingBar();
        this.initScene();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
  
    initScene(){
        this.loadGLTF( 'kw' );
    }
    
    set action(name){
		if (this.actionName == name) return;
		
		const clip = this.animations[name];
		
        if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
            
			this.actionName = name;
			if (this.curAction) this.curAction.crossFadeTo(action, 0.5);
            
            action.enabled = true;
			action.play();
            
            this.curAction = action;
		}
	}
    
    addButtonEvents(){
        const self = this;
        
        function onClick(){
            self.action = this.innerHTML;    
        }
        
        for(let i=1; i<=5; i++){
            const btn = document.getElementById(`btn${i}`);
            btn.addEventListener( 'click', onClick );
        }    
    }
    
    loadGLTF(filename){
        const loader = new GLTFLoader( );
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        dracoLoader.setDecoderConfig({ type: 'js' });

        loader.setDRACOLoader( dracoLoader );
        
        const self = this;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			`${filename}.glb`,
			// called when the resource is loaded
			function ( gltf ) {
                self.animations = {};
                
                gltf.animations.forEach( (anim)=>{
                    self.animations[anim.name] = anim;
                })
                
                self.addButtonEvents();
                
                self.kw = gltf.scene.children[0];
                
                self.mixer = new THREE.AnimationMixer( self.kw )
                
                self.scene.add( self.kw );
                
                self.loadingBar.visible = false;
                
                const scale = 0.01;
				self.kw.scale.set(scale, scale, scale); 
                self.action = "idle";
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
                
                gltf.scene.traverse((node) => {
                    console.log('Node:', node.name);
                });
        
                this.scene.add(gltf.scene);
                this.mixer = new THREE.AnimationMixer(gltf.scene);
        
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });
        
                this.playAnimation('Idle');
			},
			// called while loading is progressing
			function ( xhr ) {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}  
        );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        const dt = this.clock.getDelta();
        this.stats.update();
        this.mixer.update( dt )
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };
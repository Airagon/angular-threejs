import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-simple-scene',
  templateUrl: './simple-scene.component.html',
  styleUrls: ['./simple-scene.component.scss']
})
export class SimpleSceneComponent implements OnInit, AfterViewInit {

  private textureSources:string[] = [
    '/assets/images/captainamerica.jpg',
    '/assets/images/flash.jpg',
    '/assets/images/harleyqueen.jpg',
    '/assets/images/robin.jpg',
    '/assets/images/spiderman-ironman.jpg',
    '/assets/images/superman-batman.jpg',
    '/assets/images/thor.jpg',
  ]

  private textureIterator:any;

  // Animation properties
  public playAnimation: boolean = false;
  public rotationSpeedX: number = 0.01;
  public rotationSpeedY: number = 0.01;

  // Stage properties
  public cameraZ: number = 400;
  public fieldOfView: number = 1;
  public nearClippingPlane: number = 1;
  public farClippingPlane: number = 1000;

  // Helper properties (private properties)
  private camera!: THREE.PerspectiveCamera;

  private get canvas() : any {
    return document.getElementById('canvas');
  }


  // Plane to insert the image
  private geometryPlane: THREE.PlaneGeometry;
  private materialPlane: THREE.MeshBasicMaterial;
  private textureLoader: THREE.TextureLoader;
  private imagePlane: THREE.Mesh;
  public materialColour: string;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  // Raycaster
  private raycaster:THREE.Raycaster;
  private pointer!: THREE.Vector2;

  // Scene objects that can interact with the raycaster
  private objects: any = [ ];

  constructor() {
    // Init image plane

    // Create a texture loader so we can load our image file
    this.textureLoader = new THREE.TextureLoader();
    this.materialColour = "#ffffff"

    this.textureIterator = this.textureSources.values();

    var texture = this.textureLoader.load(
      this.textureIterator.next().value,
      (texture) => {
        texture.needsUpdate = true;
        let aspectRatio = texture.image.height / texture.image.width;
        this.imagePlane.scale.set(3, 3 * aspectRatio, 3)
      }
    );

    // Load an image file into a custom material
    this.materialPlane = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
    });

    // create a plane geometry for the image with a width of 10
    // and a height that preserves the image's aspect ratio
    this.geometryPlane = new THREE.PlaneGeometry(1, 1);

    // combine our image geometry and material into a mesh
    this.imagePlane = new THREE.Mesh(this.geometryPlane, this.materialPlane);

    // set the position of the image mesh in the x,y,z dimensions
    this.imagePlane.position.set(1,0,20)

    // Init raycaster
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.objects.push(this.imagePlane)
  }

  ngOnInit(): void {
    document.addEventListener('mousedown', (event) => this.onMouseDown(event));
    window.addEventListener('resize', () => this.onWindowResize());

    // let colorPicker = document.querySelector("#colorPicker") as any;
    // colorPicker.addEventListener("input", (event:any) => this.updateMaterial(event), false);
  }

  ngAfterViewInit():void {
    this.createScene();
    this.startRenderingLoop();
  }

  private createScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#202020");
    this.scene.add(this.imagePlane)

    // Camera
    let aspectRatio = this.getAspectRatio();

    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
  }

  updateImagePlane(event:any, property:any, axis:any){
    if(property === 'position'){
      if(axis === 'x') this.imagePlane.position.x = event.value;
      else if(axis === 'y') this.imagePlane.position.y = event.value;
      else if(axis === 'z') this.imagePlane.position.z = event.value;
    }

    if(property === 'rotation'){
      if(axis === 'x') this.imagePlane.rotation.x = event.value;
      else if(axis === 'y') this.imagePlane.rotation.y = event.value;
      else if(axis === 'z') this.imagePlane.rotation.z = event.value;
    }

    if(property === 'scale'){
      if(axis === 'x') this.imagePlane.scale.x = event.value;
      else if(axis === 'y') this.imagePlane.scale.y = event.value;
      else if(axis === 'z') this.imagePlane.scale.z = event.value;
    }

    if(property === 'rotation_speed'){
      if(axis === 'x') this.rotationSpeedX = event.value;
      else if(axis === 'y') this.rotationSpeedY = event.value;
    }
  }

  public updateMaterial(event:any){
    this.materialColour = event.target.value;
    this.imagePlane.material = new THREE.MeshBasicMaterial({color: this.materialColour});
  }

  private getAspectRatio(){
    return window.innerWidth / window.innerHeight;
  }

  private animateCube() {
    if(this.playAnimation){
      this.imagePlane.rotation.x += this.rotationSpeedX;
      this.imagePlane.rotation.y += this.rotationSpeedY;
    }
  }

  private startRenderingLoop(){
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    let component: SimpleSceneComponent = this;

    (function render(){
      requestAnimationFrame(render);
      component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  private onMouseDown(event:any){
    event.preventDefault();

    this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // sets the pointer/ray with an orgin and direction
    this.raycaster.setFromCamera(this.pointer, this.camera)

    //checks object array for any intersecting objects
    const intersects = this.raycaster.intersectObjects(this.objects);

    if(intersects.length > 0){

      var nextTexture = this.textureIterator.next().value;

      if(!nextTexture){
        this.textureIterator = this.textureSources.values();
        nextTexture = this.textureIterator.next().value;
      }

      var texture = this.textureLoader.load(
        nextTexture,
        (texture) => {
          let aspectRatio = texture.image.height / texture.image.width;
          (intersects[0].object as THREE.Mesh).scale.set(3, 3 * aspectRatio, 3);
          ((intersects[0].object as THREE.Mesh).material as THREE.MeshBasicMaterial).map = texture;
          texture.needsUpdate = true;
        }
      );
    }
  }

  private onWindowResize(){
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

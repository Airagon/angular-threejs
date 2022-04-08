import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-simple-scene',
  templateUrl: './simple-scene.component.html',
  styleUrls: ['./simple-scene.component.scss']
})
export class SimpleSceneComponent implements OnInit, AfterViewInit {

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

  // Cube (box geometry)
  private geometry: THREE.BoxGeometry;
  private material: THREE.MeshBasicMaterial;
  public cube: THREE.Mesh;
  public cubeColour: string;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;

  // Raycaster
  private raycaster:THREE.Raycaster;
  private pointer!: THREE.Vector2;

  // Scene objects that can interact with the raycaster
  private objects: any = [ ];

  constructor() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.cubeColour = "#4287f5"
    this.material = new THREE.MeshBasicMaterial({color: this.cubeColour});
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.x = 1;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.objects.push(this.cube)
  }

  ngOnInit(): void {
    document.addEventListener('mousedown', (event) => this.onMouseDown(event));
    window.addEventListener('resize', () => this.onWindowResize());

    let colorPicker = document.querySelector("#colorPicker") as any;
    colorPicker.addEventListener("input", (event:any) => this.updateMaterial(event), false);
  }

  ngAfterViewInit():void {
    this.createScene();
    this.startRenderingLoop();
  }

  private createScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#202020");
    this.scene.add(this.cube);

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

  updateCube(event:any, property:any, axis:any){
    if(property === 'position'){
      if(axis === 'x') this.cube.position.x = event.value;
      else if(axis === 'y') this.cube.position.y = event.value;
      else if(axis === 'z') this.cube.position.z = event.value;
    }

    if(property === 'rotation'){
      if(axis === 'x') this.cube.rotation.x = event.value;
      else if(axis === 'y') this.cube.rotation.y = event.value;
      else if(axis === 'z') this.cube.rotation.z = event.value;
    }

    if(property === 'scale'){
      if(axis === 'x') this.cube.scale.x = event.value;
      else if(axis === 'y') this.cube.scale.y = event.value;
      else if(axis === 'z') this.cube.scale.z = event.value;
    }

    if(property === 'rotation_speed'){
      if(axis === 'x') this.rotationSpeedX = event.value;
      else if(axis === 'y') this.rotationSpeedY = event.value;
    }
  }

  public updateMaterial(event:any){
    this.cubeColour = event.target.value;
    this.cube.material = new THREE.MeshBasicMaterial({color: this.cubeColour});
  }

  private getAspectRatio(){
    return window.innerWidth / window.innerHeight;
  }

  private animateCube() {
    if(this.playAnimation){
      this.cube.rotation.x += this.rotationSpeedX;
      this.cube.rotation.y += this.rotationSpeedY;
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

    // if the array is more than zero, get the first (intersects[0]) intersected object
    // and change the object material color to a random color
    if(intersects.length > 0){
      this.cubeColour = `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;
      this.cubeColour = (this.cubeColour.length != 7) ? this.cubeColour + '0' : this.cubeColour;
      (intersects[0].object as THREE.Mesh).material = new THREE.MeshBasicMaterial({color: this.cubeColour});
    }
  }

  private onWindowResize(){
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

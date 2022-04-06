import { Component, OnInit, AfterViewInit } from '@angular/core';

// Import everything (*) three.js has to offer. (Bad practice in general, but from the
// purposes of this project this will save time from importing manualy every time we need something.)
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

  constructor() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.cubeColour = "#4287f5"
    this.material = new THREE.MeshBasicMaterial({color: this.cubeColour});
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.position.x = 1;
  }

  ngOnInit(): void {}

  ngAfterViewInit():void {
    this.createScene();
    this.startRenderingLoop();

    window.addEventListener( 'resize', ()=>{
      this.camera.aspect = this.getAspectRatio();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private createScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
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

  updateMaterial(){
    console.log("sad")
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


}

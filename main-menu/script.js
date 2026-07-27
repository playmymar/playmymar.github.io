// ======================================
// MYMAR
// SCRIPT.JS
// PART 1
// ======================================

const container = document.getElementById("threeContainer");

// Scene

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x7cb7ff);

scene.fog = new THREE.Fog(
0x7cb7ff,
35,
220
);

// Camera

const camera = new THREE.PerspectiveCamera(

65,

window.innerWidth/window.innerHeight,

0.1,

1000

);

camera.position.set(

0,

2,

8

);

// Renderer

const renderer = new THREE.WebGLRenderer({

antialias:true,

alpha:true

});

renderer.setPixelRatio(

window.devicePixelRatio

);

renderer.setSize(

container.clientWidth,

container.clientHeight

);

renderer.shadowMap.enabled=true;

renderer.shadowMap.type=

THREE.PCFSoftShadowMap;

container.appendChild(

renderer.domElement

);

// Ambient

const ambientLight=

new THREE.AmbientLight(

0xffffff,

1.6

);

scene.add(

ambientLight

);

// Sun

const sun=

new THREE.DirectionalLight(

0xffffff,

2

);

sun.position.set(

12,

20,

12

);

sun.castShadow=true;

scene.add(

sun

);

// Ground

const groundGeometry=

new THREE.PlaneGeometry(

250,

250

);

const groundMaterial=

new THREE.MeshStandardMaterial({

color:0x404040,

roughness:.9,

metalness:0

});

const ground=

new THREE.Mesh(

groundGeometry,

groundMaterial

);

ground.rotation.x=

-Math.PI/2;

ground.receiveShadow=true;

scene.add(

ground

);

// Grid

const grid=

new THREE.GridHelper(

250,

250,

0x666666,

0x333333

);

scene.add(

grid

);

// Clock

const clock=

new THREE.Clock();

// Resize

window.addEventListener(

"resize",

()=>{

camera.aspect=

container.clientWidth/

container.clientHeight;

camera.updateProjectionMatrix();

renderer.setSize(

container.clientWidth,

container.clientHeight

);

}

);

// Animation Loop

function animate(){

requestAnimationFrame(

animate

);

renderer.render(

scene,

camera

);

}

animate();

console.log(

"MYMAR ENGINE STARTED"

);

// ======================================
// CHARACTER
// PART 2
// ======================================

const player = new THREE.Group();

scene.add(player);

// Body

const body = new THREE.Mesh(

new THREE.BoxGeometry(1.1,1.8,.6),

new THREE.MeshStandardMaterial({

color:0x2f6cff,

roughness:.45

})

);

body.position.y=2;

body.castShadow=true;

player.add(body);

// Head

const head = new THREE.Mesh(

new THREE.SphereGeometry(.45,32,32),

new THREE.MeshStandardMaterial({

color:0xffd5b0

})

);

head.position.y=3.35;

head.castShadow=true;

player.add(head);

// Left Arm

const leftArm=new THREE.Mesh(

new THREE.BoxGeometry(.28,1.3,.28),

new THREE.MeshStandardMaterial({

color:0x2f6cff

})

);

leftArm.position.set(-.72,2.2,0);

player.add(leftArm);

// Right Arm

const rightArm=leftArm.clone();

rightArm.position.x=.72;

player.add(rightArm);

// Left Leg

const leftLeg=new THREE.Mesh(

new THREE.BoxGeometry(.34,1.4,.34),

new THREE.MeshStandardMaterial({

color:0x222222

})

);

leftLeg.position.set(-.28,.7,0);

player.add(leftLeg);

// Right Leg

const rightLeg=leftLeg.clone();

rightLeg.position.x=.28;

player.add(rightLeg);

player.position.y=.1;

// Rotation

let targetRotation=0;

let currentRotation=0;

let dragging=false;

let lastX=0;

renderer.domElement.addEventListener("pointerdown",(e)=>{

dragging=true;

lastX=e.clientX;

});

window.addEventListener("pointerup",()=>{

dragging=false;

});

window.addEventListener("pointermove",(e)=>{

if(!dragging)return;

const delta=e.clientX-lastX;

targetRotation+=delta*0.01;

lastX=e.clientX;

});

// Breathing

function updateCharacter(){

currentRotation+=

(targetRotation-currentRotation)*0.12;

player.rotation.y=currentRotation;

player.position.y=

Math.sin(clock.getElapsedTime()*2)*0.05;

}

const oldAnimate=animate;

animate=function(){

requestAnimationFrame(animate);

updateCharacter();

renderer.render(scene,camera);

};

animate();

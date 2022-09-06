import "./style.css";
import {
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  DirectionalLight,
  // BoxGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Mesh,
  // MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import * as dat from "dat.gui";
import gsap from "gsap";

// graphical user interface for changing variables in js
// const gui = new dat.GUI();

let mouse: any = {
  x: undefined,
  y: undefined,
};

const plane = {
  width: 400,
  height: 400,
  widthSegments: 50,
  heightSegments: 50,
};

let frame = 0;

const colors: number[] = [];
const starVertices: number[] = [];

const raycaster = new Raycaster();
const scene = new Scene();
const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(0, 0, 40);
camera.lookAt(0, 0, 0);

// Render
const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

// const controls = new OrbitControls(camera, renderer.domElement);

// Box
// const boxGeometry = new BoxGeometry(1, 1, 1);
// const material = new MeshBasicMaterial({ color: 0x00ff00 });
// const mesh = new Mesh(boxGeometry, material);
// scene.add(mesh);

// Plane
const planeGeometry = new PlaneGeometry(
  plane.width,
  plane.height,
  plane.widthSegments,
  plane.heightSegments
);
const planeMaterial = new MeshPhongMaterial({
  // color: 0xff0000,
  side: DoubleSide,
  flatShading: true,
  vertexColors: true,
});
let planeMesh: any = new Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

// light above plane
const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);

const backLight = new DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const starGeometry = new BufferGeometry();
const starMaterial = new PointsMaterial({ color: 0xffffff });
const stars = new Points(starGeometry, starMaterial);
scene.add(stars);

const render = () => renderer.render(scene, camera);
render();

// vertice position randomization
const addEffect = () => {
  const { array }: any = planeMesh.geometry.attributes.position;
  const randomValues = [];

  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;

      colors.push(0, 0.19, 0.4);
    }
    randomValues.push(Math.random() - 0.5);
  }
  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;
};
addEffect();

planeMesh.geometry.setAttribute(
  "color",
  new BufferAttribute(new Float32Array(colors), 3)
);

const setColors = (a: number, b: number, c: number, color: any) => {
  color.setX(a, 0.1);
  color.setY(a, 0.5);
  color.setZ(a, 1);

  color.setX(b, 0.1);
  color.setY(b, 0.5);
  color.setZ(b, 1);

  color.setX(c, 0.1);
  color.setY(c, 0.5);
  color.setZ(c, 1);

  color.needsUpdate = true;
};

// changes plane with dat.gui
// const generateDynamicPlane = () => {
//   planeMesh.geometry.dispose();
//   planeMesh.geometry = new PlaneGeometry(
//     plane.width,
//     plane.height,
//     plane.widthSegments,
//     plane.heightSegments
//   );

//   planeMesh.geometry.setAttribute(
//     "color",
//     new BufferAttribute(new Float32Array(colors), 3)
//   );

//   addEffect();

//   render();
// };

const setMovement = () => {
  frame += 0.01;
  const { array, originalPosition, randomValues }: any =
    planeMesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    // x position
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003;

    // y position
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.003;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;
};

const setRaycaster = () => {
  raycaster.setFromCamera(mouse, camera);

  const intersects: any = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { a, b, c } = intersects[0].face;
    const { color } = intersects[0].object.geometry.attributes;
    setColors(a, b, c, color);

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        color.setX(a, hoverColor.r);
        color.setY(a, hoverColor.g);
        color.setZ(a, hoverColor.b);

        color.setX(b, hoverColor.r);
        color.setY(b, hoverColor.g);
        color.setZ(b, hoverColor.b);

        color.setX(c, hoverColor.r);
        color.setY(c, hoverColor.g);
        color.setZ(c, hoverColor.b);

        color.needsUpdate = true;
      },
    });
  }
};

const setStarField = () => {
  for (let i = 0; i < 2000; i++) {
    const x = (Math.random() - 0.5) * 1000;
    const y = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(starVertices, 3)
  );
};
setStarField();

// coordinates helper
// const axesHelper = new AxesHelper(250);
// scene.add(axesHelper);

const navigate = () => {
  // window.open("https://google.com", "_blank")
  const tl = gsap.timeline();
  gsap.to("#container", { opacity: 0 });

  tl.to(camera.position, {
    z: 25,
    ease: "power3.inOut",
    duration: 2,
  })
    .to(camera.rotation, {
      x: Math.PI / 2,
      ease: "power3.inOut",
      duration: 2,
    })
    .to(camera.position, {
      y: 600,
      ease: "power3.inOut",
      duration: 1.5,
      onComplete: () => {document.location.href ="https://google.com"}
    });
};

const animate = () => {
  requestAnimationFrame(animate);
  setMovement();
  setRaycaster();

  // controls.update();
  stars.rotation.x += 0.0003;
  render();
};
animate();

// controls
// gui.add(plane, "width", 1, 500).onChange(generateDynamicPlane);
// gui.add(plane, "height", 1, 500).onChange(generateDynamicPlane);
// gui.add(plane, "widthSegments", 1, 100).onChange(generateDynamicPlane);
// gui.add(plane, "heightSegments", 1, 100).onChange(generateDynamicPlane);

const createElement = (el: string) => document.createElement(el);

// page
const app = document.querySelector<HTMLDivElement>("#app")!;

const content = createElement("div");
content.id = "container";
content.className = "pos-absolute text-white container-center";

const nameTag = createElement("h1");
nameTag.id = "nameTag";
nameTag.className = "f-s-14 f-title opacity-0 translate-y-30";
nameTag.innerText = "Christopher Lis";

const description = createElement("p");
description.id = "description";
description.className = "f-italic f-s-30 m-t-0 opacity-0 translate-y-30";
description.innerText =
  "ONE WITH AN EVERLASTING DESIRE FOR THE UNKNOWN & UNTOLD";

const button = createElement("button");
button.id = "button";
button.className = "f-s-14 f-title b-container opacity-0 translate-y-30";
button.innerText = "View more";
button.addEventListener("click", navigate);

content.appendChild(nameTag);
content.appendChild(description);
content.appendChild(button);

app.appendChild(content);

// animation
gsap.to("#nameTag", { opacity: 1, duration: 2, y: 0, ease: "expo" });
gsap.to("#description", {
  opacity: 1,
  duration: 2,
  delay: 0.3,
  y: 0,
  ease: "expo",
});
gsap.to("#button", { opacity: 1, duration: 2, delay: 0.6, y: 0, ease: "expo" });

// hover effect
addEventListener("mousemove", (event) => {
  const newX = (event.clientX / innerWidth) * 2 - 1;
  const newY = -(event.clientY / innerHeight) * 2 + 1;
  mouse = { x: newX, y: newY };
});

// responsiveness
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// render
app.appendChild(renderer.domElement);

import * as THREE from "three";
import frag from "./shader.frag?raw";
import vert from "./shader.vert?raw";

let camera, scene, renderer, material;
let isDragging = false;
let startMouse = new THREE.Vector2();
let startPan = new THREE.Vector2();
let pan = new THREE.Vector2();
let scroll = 10.0; // Start at 10

init();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);

    material = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
            u_time: { value: 0.0 },
            u_pan: { value: new THREE.Vector2(0.0, 0.0) },
            u_scroll: { value: scroll }, // Add scroll uniform
            u_resolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize);

    renderer.domElement.addEventListener("mousedown", (e) => {
        isDragging = true;
        startMouse.set(e.clientX, e.clientY);
        startPan.copy(pan);
    });

    renderer.domElement.addEventListener("mouseup", () => {
        isDragging = false;
    });

    renderer.domElement.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const dx = -(e.clientX - startMouse.x) / window.innerWidth;
            const dy = (e.clientY - startMouse.y) / window.innerHeight;
            pan.x = startPan.x + dx;
            pan.y = startPan.y + dy;
            material.uniforms.u_pan.value.copy(pan);
        }
    });

    // Add scroll event
    renderer.domElement.addEventListener("wheel", (e) => {
        // e.deltaY is positive for scroll down, negative for scroll up
        if (e.deltaY < 0) {
            scroll += 0.1;
        } else if (e.deltaY > 0) {
            scroll -= 0.1;
        }
        console.log(scroll);
        material.uniforms.u_scroll.value = scroll;
    });

    animate();
}

function onWindowResize() {
    material.uniforms.u_resolution.value.set(
        window.innerWidth,
        window.innerHeight,
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);
    material.uniforms.u_time.value = time * 0.001;
    renderer.render(scene, camera);
}

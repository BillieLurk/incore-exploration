import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;

let curves = [];

init();
animate();

function init() {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffaee);
    scene.fog = new THREE.Fog(new THREE.Color(0xfffaee), 0, 8);

    // camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(0, 0, 10);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);

    document.body.appendChild(renderer.domElement);

    // resize
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const shape = new THREE.Group();

    const curvCount = 100;

    const points1 = [
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-3, 2, 4),
        new THREE.Vector3(-1, -1, 3),
        new THREE.Vector3(2, 1, 4),
        new THREE.Vector3(4, 0, 0),
    ];

    const points2 = [
        new THREE.Vector3(-4, -2, 1),
        new THREE.Vector3(-2, 0, 2),
        new THREE.Vector3(0, 2, 3),
        new THREE.Vector3(2, -1, 4),
        new THREE.Vector3(5, 1, 0),
    ];

    let pointsArray = [points1];

    for (let i = 1; i < curvCount - 1; i++) {
        let deltaPoints = [];
        for (let o = 0; o < points1.length; o++) {
            const delta = points2[o].clone().sub(points1[o]);
            const dist = delta.divideScalar(curvCount - 1).multiplyScalar(i);
            const normalized = dist.add(points1[o]);
            deltaPoints.push(normalized);
        }
        pointsArray.push(deltaPoints);
        console.log(deltaPoints);
    }

    pointsArray.push(points2);

    for (let points of pointsArray) {
        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(100);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
            curvePoints,
        );
        const curveMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        shape.add(curveObject);
        curves.push({
            curveObject,
            points,
        });
    }
    scene.add(shape);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    for (let { curveObject, points } of curves) {
        // apply a wavy animation to intermediate control points
        for (let i = 1; i < points.length - 1; i++) {
            points[i].y += Math.sin(time + i) * 0.001;
        }
        // rebuild curve and geometry
        const newCurve = new THREE.CatmullRomCurve3(points);
        const newPoints = newCurve.getPoints(100);
        curveObject.geometry.setFromPoints(newPoints);
        curveObject.geometry.attributes.position.needsUpdate = true;
    }

    controls.update();
    renderer.render(scene, camera);
}

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";

let scene, camera, renderer, controls;
let waveOffset = 0;
let curves = [];

let edgeCurves = [];

let normalVectors = [];

let direction = new THREE.Vector3(0, 0, 0).normalize();

let seed = THREE.MathUtils.randInt(0, 10000000);
console.log("the seed is", seed);

const curvCount = 150;

let seededRandom = seedrandom(seed);

let noise2D = createNoise2D(seededRandom);

const clock = new THREE.Clock();

function generatePointsArray(xStart, xEnd, numPoints, curvCount, progress = 0) {
    // Generate initial two curves
    const twoCurves = [];
    for (let o = 0; o < 2; o++) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const x = THREE.MathUtils.lerp(xStart, xEnd, i / (numPoints - 1));
            const y = noise2D(x * 0.5, 10 * o + progress) * 3;
            const z = noise2D(x * 0.5, 100 * o + progress) * 3;
            points.push(new THREE.Vector3(x, y, z));
        }
        twoCurves.push(points);
    }

    const points1 = twoCurves[0];
    const points2 = twoCurves[1];
    const pointsArray = [points1];

    // Generate interpolated curves
    for (let i = 1; i < curvCount - 1; i++) {
        const deltaPoints = [];
        for (let o = 0; o < points1.length; o++) {
            const delta = points2[o].clone().sub(points1[o]);
            const dist = delta.divideScalar(curvCount - 1);
            const normalized = dist.multiplyScalar(i).add(points1[o]);
            deltaPoints.push(normalized);
        }
        pointsArray.push(deltaPoints);
    }

    pointsArray.push(points2);
    return pointsArray;
}

init();
animate();

function init() {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(new THREE.Color(0xffffff), 0, 12);
    // camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(0, 0, 4);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const shape = new THREE.Group();

    const pointsArray = generatePointsArray(-5, 4, 5, curvCount);

    pointsArray.forEach((points, index) => {
        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(1000);

        // store first curve’s 1000 points
        if (index === 0) {
            edgeCurves.push(curvePoints.map((p) => p.clone()));
        }

        // store last curve’s 1000 points
        if (index === pointsArray.length - 1) {
            edgeCurves.push(curvePoints.map((p) => p.clone()));
        }

        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
            curvePoints,
        );
        const curveMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
        });
        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        shape.add(curveObject);

        curves.push({
            curveObject,
            points,
            basePoints: points.map((p) => p.clone()),
        });
    });

    const from = new THREE.Vector3(1, 0, 0); // x-axis
    const to = direction.clone().normalize();

    const quaternion = new THREE.Quaternion().setFromUnitVectors(from, to);

    // Rotate all points in all curves
    for (let c = 0; c < edgeCurves.length; c++) {
        for (let i = 0; i < edgeCurves[c].length; i++) {
            edgeCurves[c][i].applyQuaternion(quaternion);
        }
    }

    shape.quaternion.copy(quaternion);

    const verticalVectors = calcVerticalVector(edgeCurves);
    const horizontalVectors = calcHorizontalVector(edgeCurves);
    normalVectors = calcNormalVector(verticalVectors, horizontalVectors);

    // Visualize normal vectors on the first edge curve points
    // const verticalVectorsGroup = visualizeVectors(
    //     edgeCurves[0],
    //     edgeCurves[1],
    //     verticalVectors,
    //     horizontalVectors,
    //     normalVectors,
    //     0.5,
    //     0xff0000,
    // );
    // scene.add(verticalVectorsGroup);

    scene.add(shape);
}

function calcVerticalVector(edgeCurves) {
    let dirVectors = [];
    for (let i = 0; i < edgeCurves[0].length; i++) {
        const dir = edgeCurves[0][i].clone().sub(edgeCurves[1][i]);
        dirVectors.push(dir);
    }
    return dirVectors;
}

function calcHorizontalVector(edgeCurves) {
    const dirVectors = [];

    for (let i = 1; i < edgeCurves[0].length; i++) {
        const prev0 = edgeCurves[0][i - 1];
        const curr0 = edgeCurves[0][i];
        const prev1 = edgeCurves[1][i - 1];
        const curr1 = edgeCurves[1][i];

        const dir1 = prev0.clone().sub(curr0).normalize();
        const dir2 = prev1.clone().sub(curr1).normalize();

        const avgDir = dir1.add(dir2).normalize();
        dirVectors.push(avgDir);
    }

    if (dirVectors.length > 0) {
        dirVectors.push(dirVectors[dirVectors.length - 1].clone());
    }

    return dirVectors;
}

function calcNormalVector(vertical, horizontal) {
    let dirVectors = [];
    for (let i = 0; i < vertical.length; i++) {
        const dir = vertical[i].clone().cross(horizontal[i]);
        dirVectors.push(dir);
    }
    return dirVectors;
}

function visualizeVectors(
    firstPoints,
    secoundPoints,
    verticalVectors,
    horizontalVectors,
    normalVectors,
    length = 0.5,
    color = 0xff0000,
    step = 10,
) {
    const group = new THREE.Group();

    for (let i = 0; i < firstPoints.length; i += step) {
        const origin = firstPoints[i]
            .clone()
            .add(secoundPoints[i])
            .multiplyScalar(0.5);

        const dir = verticalVectors[i].clone().normalize();

        const arrow = new THREE.ArrowHelper(dir, origin, length, 0x0000ff);
        group.add(arrow);

        //horizontal
        const originHorizontal = firstPoints[i]
            .clone()
            .add(secoundPoints[i])
            .multiplyScalar(0.5);
        const dirHorizontal = horizontalVectors[i].clone().normalize();

        const arrowHorizontal = new THREE.ArrowHelper(
            dirHorizontal,
            originHorizontal,
            length,
            0x00ff00,
        );
        group.add(arrowHorizontal);

        //normal

        const arrowNormal = new THREE.ArrowHelper(
            normalVectors[i],
            originHorizontal,
            length,
            0xff0000,
        );
        group.add(arrowNormal);
    }

    return group;
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        waveOffset += 0.1;
    } else if (e.key === "ArrowDown") {
        waveOffset -= 0.1;
    }
});

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime(); // in seconds
    const progress = elapsedTime * 0.01; // adjust speed to taste

    // regenerate pointsArray for current time
    const updatedPointsArray = generatePointsArray(
        -5,
        4,
        5,
        curvCount,
        progress,
    );

    updatedPointsArray.forEach((points, index) => {
        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(1000);

        // update the existing curve object’s geometry
        if (curves[index]) {
            curves[index].curveObject.geometry.setFromPoints(curvePoints);
            curves[index].curveObject.geometry.attributes.position.needsUpdate =
                true;

            // also update its `points` so you keep things in sync
            curves[index].points = points;
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

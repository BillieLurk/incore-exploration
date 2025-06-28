import p5 from "p5";

new p5((p) => {
    let cols, rows;
    let scale = 20;
    let w = 800;
    let h = 800;

    let flying = 0;
    let terrain = [];

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

        cols = Math.floor(w / scale);
        rows = Math.floor(h / scale);

        // initialize terrain array
        for (let x = 0; x < cols; x++) {
            terrain[x] = [];
        }
    };

    p.draw = () => {
        p.background(135, 206, 235);
        p.stroke(0);
        p.noFill();

        p.orbitControl();
        p.rotateX(p.PI / 3);
        p.translate(-w / 2, -h / 2);

        flying -= 0.02;

        let yoff = flying;
        for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
                terrain[x][y] = p.map(p.noise(xoff, yoff), 0, 1, -100, 100);
                xoff += 0.2;
            }
            yoff += 0.2;
        }

        for (let y = 0; y < rows - 1; y++) {
            p.beginShape(p.TRIANGLE_STRIP);
            for (let x = 0; x < cols; x++) {
                p.vertex(x * scale, y * scale, terrain[x][y]);
                p.vertex(x * scale, (y + 1) * scale, terrain[x][y + 1]);
            }
            p.endShape();
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
});

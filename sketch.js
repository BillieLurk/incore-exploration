import p5 from "p5";
import Drop from "./drop";

let drops = [];

/** @param {p5} p */
new p5((p) => {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
        p.background(220);
        for (let drop of drops) {
            drop.show(p);
            drop.update(drop, p);
        }
    };

    p.mousePressed = () => {
        let drop = new Drop(p.mouseX, p.mouseY, 50, p);

        for (let other of drops) {
            other.marble(drop, p);
        }

        drops.push(drop);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
});

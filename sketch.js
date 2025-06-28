import p5 from "p5";

new p5((p) => {
    let particles = [];
    const zoff = 42; // static z for static field
    const scale = 0.004; // noise scale
    const eps = 0.1; // partial difference step

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.background(0, 0, 0);

        for (let i = 0; i < 3000; i++) {
            particles.push(new Particle(p));
        }
    };

    p.draw = () => {
        for (let particle of particles) {
            particle.follow();
            particle.update();
            particle.edges();
            particle.show();
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    class Particle {
        constructor(p) {
            this.p = p;
            this.pos = p.createVector(p.random(p.width), p.random(p.height));
            this.vel = p.createVector(0, 0);
            this.acc = p.createVector(0, 0);
            this.maxspeed = 2;
            this.prevPos = this.pos.copy();
            this.hue = p.random(360);
        }

        follow() {
            let x = this.pos.x * scale;
            let y = this.pos.y * scale;

            // approximate partial derivatives
            let n1 = p.noise(x, y + eps, zoff);
            let n2 = p.noise(x, y - eps, zoff);
            let dy = (n1 - n2) / (2 * eps);

            n1 = p.noise(x + eps, y, zoff);
            n2 = p.noise(x - eps, y, zoff);
            let dx = (n1 - n2) / (2 * eps);

            // compute curl
            let curl = p.createVector(dy, -dx);
            curl.setMag(0.2);

            this.applyForce(curl);
        }

        applyForce(force) {
            this.acc.add(force);
        }

        update() {
            this.vel.add(this.acc);
            this.vel.limit(this.maxspeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
        }

        show() {
            this.p.stroke(this.hue, 80, 80, 15);
            this.p.strokeWeight(1.5);
            this.p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
            this.updatePrev();
        }

        updatePrev() {
            this.prevPos.x = this.pos.x;
            this.prevPos.y = this.pos.y;
        }

        edges() {
            if (this.pos.x > this.p.width) {
                this.pos.x = 0;
                this.updatePrev();
            }
            if (this.pos.x < 0) {
                this.pos.x = this.p.width;
                this.updatePrev();
            }
            if (this.pos.y > this.p.height) {
                this.pos.y = 0;
                this.updatePrev();
            }
            if (this.pos.y < 0) {
                this.pos.y = this.p.height;
                this.updatePrev();
            }
        }
    }
});

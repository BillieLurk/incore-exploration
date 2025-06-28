const CIRCLE_RES = 100;

export default class Drop {
    /**
     * @typedef {import("p5")} p5
     * @param {number} x
     * @param {number} y
     * @param {number} r
     * @param {p5} p
     */
    constructor(x, y, r, p) {
        this.x = x;
        this.y = y;
        this.r = r;

        this.size = 4.1;

        this.isGrowing = true;

        const color1 = p.color(0, 41, 35);
        const color2 = p.color(255, 255, 238);

        this.color = Math.random() > 0.5 ? color1 : color2;
        this.center = p.createVector(x, y);

        this.verts = [];

        for (let i = 0; i < CIRCLE_RES; i++) {
            let angle = p.map(i, 0, CIRCLE_RES, 0, p.TWO_PI);
            let v = p.createVector(p.cos(angle), p.sin(angle));
            v.mult(this.size);
            v.add(this.x, this.y);
            this.verts[i] = v;
        }
    }

    /** @param {p5} p5 */
    marble(other, p5) {
        for (let v of this.verts) {
            let c = other.center;
            let r = other.size;
            let p = v.copy();

            p.sub(c);

            let m = p.mag();
            let root = p5.sqrt(1 + (r * r) / (m * m));
            p.mult(root);
            p.add(c);
            v.set(p);
        }
    }

    update(drops, p5) {
        const easing = 0.05;
        let dx = this.r - this.size;
        this.size += dx * easing;

        // recalculate verts based on current size
        for (let i = 0; i < this.verts.length; i++) {
            let angle = p5.map(i, 0, this.verts.length, 0, p5.TWO_PI);
            let v = p5.createVector(p5.cos(angle), p5.sin(angle));
            v.mult(this.size);
            v.add(this.x, this.y);

            // apply marble to this vertex with respect to other drops
            for (let other of drops) {
                if (other === this) continue;

                let c = other.center;
                let r = other.size;

                let p = v.copy().sub(c);
                let m = p.mag();
                if (m > 0) {
                    let root = p5.sqrt(1 + (r * r) / (m * m));
                    p.mult(root);
                    p.add(c);
                    v.set(p);
                }
            }

            this.verts[i] = v;
        }

        if (this.size > this.r * 0.95) {
            this.isGrowing = false;
        }
    }

    /** @param {p5} p */
    show(p) {
        p.fill(this.color);
        p.noStroke();
        p.beginShape();
        for (let v of this.verts) {
            p.vertex(v.x, v.y);
        }
        p.endShape(p.CLOSE);
    }
}

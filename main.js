let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";
canvas.style.background = "#a2a2a2";

class Board {
    dots = [];
    selectedDot = null;
    addDot = (arc) => {
        this.dots.push(arc);
    };
    findDot = (x, y) => {
        for (let key in this.dots) {
            // console.log(this.dots[key].isSelected(x, y));
            if (this.dots[key].isSelected(x, y)) {
                let ret;
                if (this.selectedDot && this.selectedDot.isSelected(x, y)) {
                    ret = this.selectedDot;
                } else {
                    ret = this.dots[key];
                }
                this.selectedDot = ret;
                return ret;
            }
            this.selectedDot = null;
        }
    };
    redraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.dots.forEach((dot) => {
            dot.draw();
        });
    };


}

class Arc {
    constructor(x, y, width) {
        this.width = width;
        this.coords = {
            x: x,
            y: y
        };
        this.trees = {

            th: {
                coords: [[x, y], [x + width / 2, y - width / 2], [x + width, y]]
            },
            bot: {
                coords: [[x, y + width], [x + width / 2, y + width + width / 2], [x + width, y + width]]
            },
            left: {
                coords: [[x, y], [x - width / 2, y + width / 2], [x, y + width]]
            },
            right: {
                coords: [[x + width, y], [x + width + width / 2, y + width / 2], [x + width, y + width]]
            }
        };
        this.draw();

    };


    isDrawed = false;
    draw = () => {
        ctx.beginPath();
        // ctx.fillStyle = "white";

        for (let key in this.trees) {
            ctx.moveTo(...this.trees[key].coords[0]);
            ctx.lineTo(...this.trees[key].coords[1]);
            ctx.lineTo(...this.trees[key].coords[2]);

        }
        ctx.arc(this.coords.x, this.coords.y, this.radius, 0, 360 * Math.PI / 180);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        /*let x=this.coords.x,
            y=this.coords.y;

        ctx.moveTo(x, y);
        ctx.lineTo(x+this.width/2, y-this.width/2);
        ctx.lineTo(x+this.width, y);

        ctx.moveTo(x, y);
        ctx.lineTo(x-this.width/2, y+this.width/2);
        ctx.lineTo(x, y+this.width);

        x=this.coords.x+this.width;
        y=this.coords.y+this.width;


        ctx.moveTo(x, y);
        ctx.lineTo(x-this.width/2, y+this.width/2);
        ctx.lineTo(x-this.width, y);

        ctx.moveTo(x, y);
        ctx.lineTo(x+this.width/2, y-this.width/2);
        ctx.lineTo(x, y-this.width);
        */
        ctx.fill();
        ctx.closePath();

        this.isDrawed = true;
    };
    isSelected = (x, y) => {


        /*
        Математическая часть - векторное и псевдоскалярное произведения.
Реализация - считаются произведения (1, 2, 3 - вершины треугольника, 0 - точка):
(x1 - x0) * (y2 - y1) - (x2 - x1) * (y1 - y0)
(x2 - x0) * (y3 - y2) - (x3 - x2) * (y2 - y0)
(x3 - x0) * (y1 - y3) - (x1 - x3) * (y3 - y0)
Если они одинакового знака, то точка внутри треугольника, если что-то из этого - ноль, то точка лежит на стороне, иначе точка вне треугольника.
         */


        for (let key in this.trees){
            let th = this.trees[key].coords;
            let obj = [
                (th[0][0] - x) * (th[1][1] - th[0][1]) - (th[1][0] - th[0][0]) * (th[0][1] - y),
                (th[1][0] - x) * (th[2][1] - th[1][1]) - (th[2][0] - th[1][0]) * (th[1][1] - y),
                (th[2][0] - x) * (th[0][1] - th[2][1]) - (th[0][0] - th[2][0]) * (th[2][1] - y)
            ];
            console.log(!Math.sign(obj[0]) , !Math.sign(obj[1]) , !Math.sign(obj[2]));
            console.log((!Math.sign(obj[0]) && !Math.sign(obj[1]) && !Math.sign(obj[2])) == false );

            if (!Math.sign(obj[0]) && !Math.sign(obj[1]) && !Math.sign(obj[2])){
                console.log(!Math.sign(obj[0]), !Math.sign(obj[1]) ,!Math.sign(obj[2]))
                console.log(!Math.sign(obj[0]) == !Math.sign(obj[1]) == !Math.sign(obj[2]))
                console.log(obj);
                console.log(key);
                return key;
            }
        };
        return false;




        //     if (this.isDrawed &&
        //         x >= this.coords.x - this.radius
        //         && x <= this.coords.x + this.radius
        //         && y >= this.coords.y - this.radius
        //         && y <= this.coords.y + this.radius) return true;
        // return false;
    };
    move = (x, y) => {
        if (this.isSelected(x, y)) {
            this.coords.x = x;
            this.coords.y = y;
            board.redraw();
        }
        return this;
    };
    buttons = {
        draw: () => {
            let x = this.coords.x,
                y = this.coords.y;
            ctx.fillRect(x - this.radius * 2, y - this.radius / 2, this.radius, this.radius);
            ctx.fillRect(x + this.radius, y - this.radius / 2, this.radius, this.radius);

        }
    };
};

canvas.addEventListener("mousedown", function (e) {
    isMouseDown = true;//board.findDot(x,y) ? true : false;
});
canvas.addEventListener("mouseup", function () {
    isMouseDown = false;
    if (board.selectedDot) board.selectedDot.buttons.draw();
});
canvas.addEventListener("mousemove", function (e) {
    let x = e.clientX,
        y = e.clientY;
    if (isMouseDown) {

        let dot = board.findDot(x, y);
        if (dot) dot.move(x, y);

    }


});
// ctx.fillStyle = "green";
let offset = 60;
// ctx.arc(600, 200, 20, 0, 90*Math.PI/180, false);
// ctx.fill();

// ctx.beginPath();
// let context = ctx;
// context.beginPath();
// context.moveTo(40, 90);
// context.arc(40, 90, 50, 1.25*Math.PI, 1.75*Math.PI, false);
// context.closePath();
// context.stroke();
//
// context.beginPath();
// context.moveTo(150, 90);
// context.arc(150, 90, 50, 1.75*Math.PI, 0.25*Math.PI, false);
// context.closePath();
// context.stroke();
//
// context.beginPath();
// context.moveTo(240, 90);
// context.arc(240, 90, 50, 0.25*Math.PI,  0.75*Math.PI, false);
// context.closePath();
// context.stroke();
//
// context.beginPath();
// context.moveTo(380,90);
// context.arc(380, 90, 50, 0.75*Math.PI, 1.25*Math.PI, false);
// context.closePath();
// context.stroke();
// ctx.closePath();


let board = new Board();
board.addDot(new Arc(100, 100, 40));
// board.addDot(new Arc(200, 200, 30));
// board.addDot(new Arc(400, 400, 30));


board.addDot(new Arc(500, 100, 40));
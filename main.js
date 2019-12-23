let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";
canvas.style.background = "#a2a2a2";

class Board{
    dots = [];
    addDot = (arc)=>{
        this.dots.push(arc);
    }
    findDot = (x,y)=>{
        for (let key in this.dots){
            if (this.dots[key].isSelected(x,y) ){
                let ret
                if (this.selectedDot && this.selectedDot.isSelected(x,y)){
                     ret =  this.selectedDot;
                }else{
                     ret = this.dots[key];
                }
                this.selectedDot = ret;
                return ret;
            }
            this.selectedDot = null;
        }
    };
    redraw = () =>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.dots.forEach( (dot) =>{
            dot.draw();
        });
    };
    selectedDot = null;

}
class Arc  {
    constructor(x,y,radius) {
        this.radius =  radius;
        this.coords =  {
            x: x,
            y: x
        };
        this.draw();
    };

    isDrawed =  false;
    draw =  () => {
        ctx.beginPath();
        ctx.fillStyle = "white";

        ctx.arc(this.coords.x, this.coords.y, this.radius, 0, 360 * Math.PI / 180);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();

        this.isDrawed = true;
    };
    isSelected =  (x, y) => {
        if (this.isDrawed &&
            x >= this.coords.x - this.radius
            && x <= this.coords.x + this.radius
            && y >= this.coords.y - this.radius
            && y <= this.coords.y + this.radius) return true;
        return false;
    };
    move =  (x, y) => {
        if (this.isSelected(x, y)) {
            this.coords.x = x;
            this.coords.y = y;
            board.redraw();
        }
        return this;
    }
    buttons = {
        draw:()=>{
            let x = this.coords.x,
                y = this.coords.y;
            ctx.fillRect(x-this.radius*2,y-this.radius/2, this.radius, this.radius);
            ctx.fillRect(x+this.radius,y-this.radius/2, this.radius, this.radius);

        }
    }
};

canvas.addEventListener("mousedown", function (e) {


    isMouseDown = true;//board.findDot(x,y) ? true : false;
});
canvas.addEventListener("mouseup", function () {
    isMouseDown = false;
    if (board.selectedDot) board.selectedDot.buttons.draw();
});
canvas.addEventListener("mousemove", function (e) {
    if (isMouseDown) {
        let x = e.clientX,
            y = e.clientY;
      let dot = board.findDot(x,y);
      if (dot) dot.move(x,y);

    }

});
let board = new Board();
board.addDot(new Arc(100,100,30));
board.addDot(new Arc(200,200,30));
board.addDot(new Arc(400,400,30));


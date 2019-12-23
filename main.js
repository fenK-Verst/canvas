let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";
canvas.style.background = "#a2a2a2";
class board{

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
            clearAll();
            // this.draw();

        }
        return this;
    }
};

canvas.addEventListener("mousedown", function () {
    isMouseDown = true;
});
canvas.addEventListener("mouseup", function () {
    isMouseDown = false;
});
canvas.addEventListener("mousemove", function (e) {
    if (isMouseDown) {
        let x = e.clientX,
            y = e.clientY;
        for (let key in objects){
            objects[key].move(x,y);
        }
    }

});
let objects = [];
objects.push(new Arc(100,100,20));
objects.push(new Arc(200,200,20));



// clearthis(this.coords.x, this.coords.y, this.radius);
function clearAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach( (value) =>{
        value.draw();
    })
}

let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false,
    isMouseMoved = false,
    bgColor = "#a2a2a2";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";

canvas.style.background = bgColor;

ctx.fillStyle = "white";

class Board {
    figures = [];
    lastSelectedFigure;
    isSelectedFigure = false;
    addFigure = (figure) => {
        this.figures.push(figure);
    };
    findFigure = (x, y) => {
        for (let key in this.figures) {
            if (this.figures[key].isSelected(x, y)) {
                this.lastSelectedFigure = this.figures[key];
                return this.figures[key];
            }

        }
    };
    redraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.isSelectedFigure = false;

        this.figures.forEach((figure) => {
            figure.draw();
            figure.sections.isDrawed = false;
        });
    };


}

class Figure {
    sections = {};

    constructor(x, y, width) {
        this.width = width;
        this.coords = {
            x: x,
            y: y
        };
        ["left", "right", "top", "bot"].forEach(((value, index,) => {
            this.sections[value] = new FigureElem(this, value);
        }));

        this.isDrawed = false;
        this.draw();
        Object.defineProperty(this.sections, "isDrawed", {
            enumerable: false,
            writable: true
        });

    };


    draw = () => {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);
        ctx.stroke();
        ctx.fill();

        ctx.closePath();
        this.isDrawed = true;
    };
    drawSections = () => {

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        for (let key in this.sections) {
            this.sections[key].draw();
        }
        this.sections.isDrawed = true;

        ctx.fill();
        ctx.stroke();
        ctx.closePath();

    };

    getSelectedSection = (x, y) => {
        let result = false;
        /*
        Математическая часть - векторное и псевдоскалярное произведения.
Реализация - считаются произведения (1, 2, 3 - вершины треугольника, 0 - точка):
(x1 - x0) * (y2 - y1) - (x2 - x1) * (y1 - y0)
(x2 - x0) * (y3 - y2) - (x3 - x2) * (y2 - y0)
(x3 - x0) * (y1 - y3) - (x1 - x3) * (y3 - y0)
Если они одинакового знака, то точка внутри треугольника, если что-то из этого - ноль, то точка лежит на стороне, иначе точка вне треугольника.
         */

        for (let key in this.sections) {
            let th = this.sections[key].coords;

            let a = (th[0].x - x) * (th[1].y - th[0].y) - (th[1].x - th[0].x) * (th[0].y - y),
                b = (th[1].x - x) * (th[2].y - th[1].y) - (th[2].x - th[1].x) * (th[1].y - y),
                c = (th[2].x - x) * (th[0].y - th[2].y) - (th[0].x - th[2].x) * (th[2].y - y);
            //console.log((!Math.sign(obj[0]) && !Math.sign(obj[1]) && !Math.sign(obj[2])) == false);
            a = Math.sign(a);
            b = Math.sign(b);
            c = Math.sign(c);

            if (a == b && a == b && a == c) {
                result = key;
            }
        }
        return result;

    };
    isSelected = (x, y) => {
        return (x >= this.coords.x && x <= this.coords.x + this.width && y >= this.coords.y && y <= this.coords.y + this.width);

    };
    move = (x, y) => {
        // if (this.getSelected(x, y)) {
        this.coords.x = x;
        this.coords.y = y;
        for (let key in this.sections) {
            this.sections[key].recount();
        }
        board.redraw();
        // }
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
}

class FigureElem {
    constructor(parent, type) {
        this.type = type;
        this.parent = parent;
        this.isDrawed = false;
        this.recount();

    };

    recount = () => {
        let x = this.parent.coords.x,
            y = this.parent.coords.y,
            width = this.parent.width;

        switch (this.type) {
            case "top":
                this.coords = [
                    {
                        x: x,
                        y: y
                    },
                    {
                        x: x + width / 2,
                        y: y - width / 2
                    },
                    {
                        x: x + width,
                        y: y
                    }
                ];
                break;
            case  "bot":
                this.coords = [
                    {
                        x: x,
                        y: y + width
                    },
                    {
                        x: x + width / 2,
                        y: y + width + width / 2
                    },
                    {
                        x: x + width,
                        y: y + width
                    }
                ];
                break;
            case  "left":
                this.coords = [
                    {
                        x: x,
                        y: y
                    },
                    {
                        x: x - width / 2,
                        y: y + width / 2
                    },
                    {
                        x: x,
                        y: y + width
                    }
                ];
                break;
            case  "right":
                this.coords = [
                    {
                        x: x + width,
                        y: y
                    },
                    {
                        x: x + width + width / 2,
                        y: y + width / 2
                    },
                    {
                        x: x + width,
                        y: y + width
                    }
                ];
                break;
            default:
                throw "Invalid type";
        }
    };
    draw = () => {

        ctx.moveTo(this.coords[0].x, this.coords[0].y);
        ctx.lineTo(this.coords[1].x, this.coords[1].y);
        ctx.lineTo(this.coords[2].x, this.coords[2].y);

    };
    drawColored = () =>{
        ctx.beginPath();
        ctx.fillStyle = "green";
        this.draw();
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle=bgColor;
    };

}

canvas.addEventListener("mousedown", function (e) {
    isMouseDown = true;
});
canvas.addEventListener("mouseup", function () {
    isMouseDown = false;
    if (isMouseMoved) {
        console.log("moved");
    }
    isMouseMoved = false;
    // if (board.selectedDot) board.selectedDot.buttons.draw();
});

canvas.addEventListener("mousemove", function (e) {
    let x = e.clientX,
        y = e.clientY;

    if (isMouseDown) {
        let figure = board.findFigure(x, y);
        if (figure) {
            figure.move(x - figure.width / 2, y - figure.width / 2);
            isMouseMoved = true;
        }
    }else if (board.isSelectedFigure && board.lastSelectedFigure){
        let key = board.lastSelectedFigure.getSelectedSection(x,y);
        board.lastSelectedFigure.drawSections();
        if (key){
            board.lastSelectedFigure.sections[key].drawColored();
        }
    }

});
canvas.addEventListener("dblclick", function (e) {
    let x = e.clientX,
        y = e.clientY;



    let figure = board.findFigure(x, y);
    board.redraw();
    if (figure && !figure.sections.isDrawed) {
        board.isSelectedFigure = true;
        figure.drawSections();
    }
});
document.addEventListener("keydown", function (e) {
    if (e.code == "Delete" && board.isSelectedFigure) {
        board.figures.splice(board.figures.indexOf(board.lastSelectedFigure), 1);
        board.redraw();
    }
});

let board = new Board();
board.addFigure(new Figure(100, 100, 40));
board.addFigure(new Figure(400, 100, 40));


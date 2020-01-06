let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false,
    isMouseMoved = false,
    bgColor = "#a2a2a2",
    width = 40;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";

canvas.style.background = bgColor;

ctx.fillStyle = "white";

class Board {
    figures = [];
    lastSelectedFigure;
    isSelectedFigure = false;
    movedPart;

    addFigure = (figure) => {

        this.figures.push(figure);

    };

    findFigure = (x, y) => {
        let value = false;
        this.figures.forEach(figure => {
            if (figure.isSelected(x, y)) value = figure;
        });

        return value;
    };
    redraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();

        this.isSelectedFigure = false;

        this.figures.forEach((figure) => {
            figure.draw();
            for (let key in figure.sections) {
                if (figure.sections[key]) {
                    figure.sections[key].recount();

                }
            }
            figure.drawRelations();
            figure.sections.isDrawed = false;
        });

        ctx.fill();
        ctx.closePath();
    };
    moveSelectedFigureSection = (x, y) => {
        let figure = this.lastSelectedFigure,
            key = this.movedPart == "section" ? figure.lastSelectedSection : figure.getSection(x, y);
        console.log(this.movedPart);
        if (key) {
            figure.lastSelectedSection = key;
            this.redraw();
            this.isSelectedFigure = true;
            switch (key) {
                case "top":
                    x -= width / 2;
                    break;
                case "bot":
                    y -= width;
                    x -= width / 2;
                    break;
                case "left":
                    y -= width / 2;
                    break;
                case "right":
                    y -= width / 2;
                    x -= width;
                    break;
            }

            figure.sections[key].recount(x, y);
            figure.drawSections();
            // figure.sections[key].drawColored();

        }
    }

}


class Figure {
    sections = {};
    relations = {};
    lastSelectedSection;

    constructor(x, y, width) {
        this.width = width;
        this.coords = {
            x: x,
            y: y
        };

        ["left", "right", "top", "bot"].forEach(value => {
            this.sections[value] = new FigureElem(this, value);
            this.relations[value] = null;
        });

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
        ctx.closePath();
        this.isDrawed = true;
    };
    drawSections = () => {

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        for (let key in this.sections) {
            let section = this.sections[key];
            section.draw();
        }

        this.sections.isDrawed = true;

        ctx.fill();
        ctx.stroke();
        ctx.closePath();

    };
    drawRelations = () => {
        ctx.beginPath();

        for (let key in this.relations) {

            if (this.relations[key]) {
                let start = {},
                    end = {},
                    figureA = this,
                    figureB = this.relations[key];

                switch (this.sections[key].type) {
                    case "top":
                        start.x = figureA.sections["top"].coords[1].x;
                        start.y = figureA.sections["top"].coords[0].y;
                        end.x = figureB.sections["bot"].coords[1].x;
                        end.y = figureB.sections["bot"].coords[0].y;
                        break;
                    case "bot":
                        start.x = figureA.sections["bot"].coords[1].x;
                        start.y = figureA.sections["bot"].coords[0].y;
                        end.x = figureB.sections["top"].coords[1].x;
                        end.y = figureB.sections["top"].coords[0].y;
                        break;
                    case "left":
                        start.x = figureA.sections["left"].coords[0].x;
                        start.y = figureA.sections["left"].coords[1].y;
                        end.x = figureB.sections["right"].coords[0].x;
                        end.y = figureB.sections["right"].coords[1].y;
                        break;
                    case "right":
                        start.x = figureA.sections["right"].coords[0].x;
                        start.y = figureA.sections["right"].coords[1].y;
                        end.x = figureB.sections["left"].coords[0].x;
                        end.y = figureB.sections["left"].coords[1].y;
                        break;

                }
                // this.relations[key] = start;
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
            }
        }
        ctx.stroke();

        ctx.closePath();
    };
    removeRelations = () => {
        for (let key in this.relations) {
            if (this.relations[key]) {
                let deleteKey;
                switch (key) {
                    case "top":
                        deleteKey = "bot";
                        break;
                    case "bot":
                        deleteKey = "top";
                        break;
                    case "left":
                        deleteKey = "right";
                        break;
                    case "right":
                        deleteKey = "left";
                        break;

                }
                this.relations[key].relations[deleteKey] = null;
            }
            this.relations[key] = null;

        }
    };
    getSection = (x, y) => {
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

    };

}

class FigureElem {

    constructor(parent, type) {
        this.type = type;
        this.parent = parent;
        this.isDrawed = false;
        this.recount();

    };

    recount = (x = this.parent.coords.x, y = this.parent.coords.y) => {

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
    drawColored = () => {
        ctx.beginPath();
        ctx.fillStyle = "green";
        this.draw();
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = bgColor;
    };


}

canvas.addEventListener("mousedown", function (e) {
    isMouseDown = true;

});
canvas.addEventListener("mouseup", function (e) {
    let x = e.clientX,
        y = e.clientY;
    isMouseDown = false;
    if (board.movedPart == "section") {

        board.figures.forEach(figure => {
            if (figure.getSection(x, y)) {
                // board.lastSelectedFigure.relations[figure.getSection(x, y)] = figure;
                // figure.relations[figure.getSection(x, y)] = board.lastSelectedFigure;
                console.log(board.lastSelectedFigure.relations, board.lastSelectedFigure.lastSelectedSection, figure);
                board.lastSelectedFigure.relations[board.lastSelectedFigure.lastSelectedSection] = figure;
            }
        });
        board.redraw();
    }

    board.movedPart = null;
    if (isMouseMoved) {
        console.log("moved");
    }
    isMouseMoved = false;
    // if (board.selectedDot) board.selectedDot.buttons.draw();
});

canvas.addEventListener("mousemove", function (e) {
    let x = e.clientX,
        y = e.clientY,
        figure;
    if (isMouseDown) {

        if (isMouseMoved) {
            figure = board.lastSelectedFigure;
        } else {
            figure = board.findFigure(x, y);

        }

        if (figure && board.movedPart != "section") {
            board.lastSelectedFigure = figure;
            figure.move(x - figure.width / 2, y - figure.width / 2);
            board.movedPart = "figure";
            isMouseMoved = true;

        } else if (board.isSelectedFigure && board.lastSelectedFigure) {
            // board.lastSelectedFigure.lastSelectedSection.move(x,y);
            board.moveSelectedFigureSection(x, y);
            board.movedPart = "section";


        } else {
            board.movedPart = null;
        }


    } else if (board.isSelectedFigure && board.lastSelectedFigure) {
        let key = board.lastSelectedFigure.getSection(x, y);
        board.lastSelectedFigure.drawSections();
        if (key) {
            board.lastSelectedFigure.sections[key].drawColored();
        }
    }

});
canvas.addEventListener("click", function (e) {
    let x = e.clientX,
        y = e.clientY;
    if (board.isSelectedFigure && board.lastSelectedFigure && board.lastSelectedFigure.getSection(x, y)) {
        let selectedFigure = board.lastSelectedFigure,
            relationFigureKey,
            key = selectedFigure.getSection(x, y),
            figureCoords = {
                x, y
            };

        if (selectedFigure.relations[key] == null) {
            switch (key) {
                case "top":
                    figureCoords.x = selectedFigure.coords.x;
                    figureCoords.y = selectedFigure.coords.y - width * 3;
                    relationFigureKey = "bot";
                    break;
                case "left":
                    figureCoords.x = selectedFigure.coords.x - width * 3;
                    figureCoords.y = selectedFigure.coords.y;
                    relationFigureKey = "right";
                    break;
                case "right":
                    figureCoords.x = selectedFigure.coords.x + width * 3;
                    figureCoords.y = selectedFigure.coords.y;
                    relationFigureKey = "left";
                    break;
                case "bot":
                    figureCoords.x = selectedFigure.coords.x;
                    figureCoords.y = selectedFigure.coords.y + width * 3;
                    relationFigureKey = "top";
                    break;

            }
            if (figureCoords.x > 0 && figureCoords.y > 0) {
                let figure = new Figure(figureCoords.x, figureCoords.y, width);
                board.addFigure(figure);

                selectedFigure.relations[key] = figure;
                figure.relations[relationFigureKey] = selectedFigure;

                figure.drawRelations();
                board.redraw();
                board.lastSelectedFigure = figure;
                board.isSelectedFigure = true;
                figure.drawSections();

            }
        }
    }

});
canvas.addEventListener("dblclick", function (e) {
    let x = e.clientX,
        y = e.clientY;

    let figure = board.findFigure(x, y);

    if (figure && !figure.sections.isDrawed) {
        board.redraw();
        board.isSelectedFigure = true;
        figure.drawSections();
        board.lastSelectedFigure = figure;
        board.isSelectedFigure = true;
    } else {
        board.redraw();
    }

});
document.addEventListener("keydown", function (e) {
    if (e.keyCode === 46 && board.isSelectedFigure) {
        let figure = board.lastSelectedFigure;
        figure.removeRelations();
        board.figures.splice(board.figures.indexOf(figure), 1);
        board.redraw();
    }
});

let board = new Board();
board.addFigure(new Figure(canvas.width / 2 - width, canvas.height / 2 - width, width));
// board.addFigure(new Figure(400, 100, width));



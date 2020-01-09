$(document).on("ready", function () {
let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    isMouseDown = false,
    isMouseMoved = false,
    bgColor = "#a2a2a2",
    width = 40,
    mouse = {};
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.display = "block";

canvas.style.background = bgColor;

ctx.fillStyle = "white";

class Board {
    figures = [];
    relations = [];
    lastSelectedFigure;
    movedPart;
    mode = "edit";
    isSelectedFigure = false;
    isDrawed = true;

    constructor() {
        this.load();
        if (!this.figures.length) {
            this.addFigure(new Figure(canvas.width / 2 - width, canvas.height / 2 - width, width));
        }
    }
    addFigure = (figure, select = false) => {
        this.figures.push(figure);
        if (select) {
            this.selectFigure(figure);
        }
        this.save();
    };
    deleteFigure = (figure = board.lastSelectedFigure) => {
        this.removeRelations(figure);
        this.figures.splice(this.figures.indexOf(figure), 1);
        this.redraw();
        this.save();
    };
    findFigure = (x, y) => {
        let value = false;
        this.figures.forEach(figure => {
            if (figure.isSelected(x, y)) value = figure;
        });

        return value;
    };
    selectFigure = (figure) => {
        this.redraw();
        this.drawRelations();
        this.lastSelectedFigure = figure;
        this.isSelectedFigure = true;
        figure.draw.sections();
        figure.draw.buttons();
    };
    clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.isDrawed = false;
    };
    redraw = () => {
        this.clear();
        ctx.beginPath();

        this.isSelectedFigure = false;
        this.figures.forEach((figure) => {

            for (let key in figure.sections) {
                if (figure.sections[key]) {
                    figure.sections[key].recount();

                }
            }
            figure.draw.figure();
            // figure.drawRelations();
            figure.sections.isDrawed = false;
        });
        this.drawRelations();
        this.isDrawed = true;
        ctx.fill();
        ctx.closePath();
    };
    moveSelectedFigureSection = (x, y) => {
        let figure = this.lastSelectedFigure,
            key = this.movedPart == "section" ? figure.lastSelectedSection : figure.getSection(x, y);
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
            figure.draw.sections();
            this.figures.forEach(figure => {
                figure.draw.sections();
            })
        }
    };
    drawRelations = () => {
        ctx.beginPath();
        this.relations.forEach(relation => {
            let figure,
                coords = [];

            relation.forEach((value, i) => {
                figure = value.figure;
                coords[i] = {};
                switch (value.section) {
                    case "top":
                        coords[i].x = figure.sections["top"].coords[1].x;
                        coords[i].y = figure.sections["top"].coords[0].y;
                        break;
                    case "bot":
                        coords[i].x = figure.sections["bot"].coords[1].x;
                        coords[i].y = figure.sections["bot"].coords[0].y;
                        break;
                    case "left":
                        coords[i].x = figure.sections["left"].coords[0].x;
                        coords[i].y = figure.sections["left"].coords[1].y;
                        break;
                    case "right":
                        coords[i].x = figure.sections["right"].coords[0].x;
                        coords[i].y = figure.sections["right"].coords[1].y;
                        break;

                }
            });
            ctx.moveTo(coords[0].x, coords[0].y);
            ctx.lineTo(coords[1].x, coords[1].y);
        });
        ctx.stroke();

        ctx.closePath();
    };
    removeRelations = (figure) => {
        this.relations = this.relations.filter((relation, index) => {
            if (relation[0].figure == figure || relation[1].figure == figure) {
                relation[0].figure.relations[relation[0].section] = null;
                relation[1].figure.relations[relation[1].section] = null;
            } else {
                return relation;
            }


        });
    };
    isCanDraw = (x, y) => {
        let result = x > 0 && y > 0 && x < canvas.width - width && y < canvas.height - width;
        this.figures.forEach(figure => {
            if (figure.isSelected(x, y)) result = false;
        });

        return result;
    };
    save = () => {
        let figures = [], relations = [];
        this.figures.forEach((figure, i) => {
            let obj = {
                coords: figure.coords,
                relations: figure.relations,
                title: figure.title,
                text: figure.text,
            };
            figures[i] = obj;

        });
        this.relations.forEach((relation, i) => {
            let obj = [
                {
                    figure: this.figures.indexOf(relation[0].figure),
                    section: relation[0].section
                },
                {
                    figure: this.figures.indexOf(relation[1].figure),
                    section: relation[1].section
                }
            ];
            relations.push(obj);
        });
        window.localStorage.board = JSON.stringify({figures, relations});
        return [figures, relations];
    };
    load = () => {
        let load = JSON.parse(window.localStorage.board);
        if (load) {
            this.figures = [];
            this.relations = [];
            this.lastSelectedFigure = null;
            load.figures.forEach(figure => {
                let newFigure = new Figure(figure.coords.x, figure.coords.y, width);
                newFigure.text = figure.text;
                newFigure.title = figure.title;
                newFigure.relations = figure.relations;
                this.figures.push(newFigure);
            });
            load.relations.forEach(relation => {
                let obj = [
                    {
                        figure: this.figures[relation[0].figure],
                        section: relation[0].section
                    },
                    {
                        figure: this.figures[relation[1].figure],
                        section: relation[1].section
                    }
                ];
                this.relations.push(obj);

            });
            this.redraw();
            return true;
        } else {
            return false;

        }
    };
    getFigureRelations = (figure) =>{
        let result = [];
        this.relations.forEach(relation =>{
                if  (relation[0].figure == figure) result.push(relation[1].figure);
                if  (relation[1].figure == figure) result.push(relation[0].figure);
        });
        return result;
    }

}

class Figure {
    sections = {};
    relations = {};
    buttons = {};
    coords = {};
    title = '';
    text = '';
    width = 0;
    lastSelectedSection;

    constructor(x, y, width) {
        this.width = width;
        this.coords = {
            x: x,
            y: y
        };
        ["left", "right", "top", "bot"].forEach(value => {
            this.sections[value] = new Section(this, value);
            this.relations[value] = null;
        });
        ["edit", "delete"].forEach(value => {
            this.buttons[value] = new Button(this, value);
        });
        this.isDrawed = false;
        this.draw.figure();
        Object.defineProperty(this.sections, "isDrawed", {
            enumerable: false,
            writable: true
        });

    };

    draw = {
        figure: () => {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);

            ctx.stroke();
            ctx.closePath();
            this.isDrawed = true;
        },
        sections: () => {

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

        },
        buttons: () => {
            for (let key in this.buttons) {
                this.buttons[key].draw();
            }
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
    getButton = (x, y) => {
        for (let key in this.buttons) {
            let button = this.buttons[key];
            if (button.isSelected(x, y)) {
                return button;
            }
        }
        return false;
    };
    isSelected = (x, y) => {
        return (x >= this.coords.x && x <= this.coords.x + this.width && y >= this.coords.y && y <= this.coords.y + this.width);

    };
    move = (x, y) => {
        this.coords.x = x;
        this.coords.y = y;
        for (let key in this.sections) {
            this.sections[key].recount();
        }
        board.redraw();
    };
}

class Section {
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
    drawColored = (color = "green") => {
        ctx.beginPath();
        ctx.fillStyle = color;
        this.draw();
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = bgColor;
    };
}

class Button {
    coords = {};
    type = '';
    parent = Figure;
    width = 0;

    constructor(parent, type) {
        this.parent = parent;
        this.type = type;
        this.width = parent.width / 3;
        this.recount();
    };

    draw = () => {
        this.recount();
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.type[0], this.coords.x + this.width / 2, this.coords.y + this.width - 5, width * 2);
        ctx.closePath();
    };
    recount = () => {
        switch (this.type) {
            case "edit":
                this.coords.x = this.parent.coords.x + this.parent.width;
                this.coords.y = this.parent.coords.y + this.parent.width;
                break;
            case "delete":
                this.coords.x = this.parent.coords.x - this.width;
                this.coords.y = this.parent.coords.y + this.parent.width;
                break;
            default:
                throw "Invalid type";
        }
    };
    click = () => {
        switch (this.type) {
            case "edit":
                let $edit = $("#edit"),
                    $title = $('#title'),
                    $text = $('#text'),
                    parent = this.parent;

                // if ($edit.data("init")) {
                //     $title.froalaEditor('destroy');
                //     $text.froalaEditor('destroy');
                //     $edit.data("init", 0);
                //     board.redraw();
                $title.html(parent.title);
                $text.html(parent.text);

                $title.froalaEditor();
                $text.froalaEditor();

                $title.on(`froalaEditor.contentChanged`, function (e) {
                    parent.title = $(this).find('.fr-view').html();
                    board.save();
                });
                $text.on(`froalaEditor.contentChanged`, function (e) {
                    parent.text = $(this).find('.fr-view').html();
                    board.save();
                });
                // $edit.data("init", 1);
                // $edit.data("id", board.figures.indexOf(this.parent));
                $edit.show();
                $(`#closebtn`).click(() => {
                    $title.froalaEditor('destroy');
                    $text.froalaEditor('destroy');
                    $edit.hide();
                    board.redraw();
                });


                // }
                // } else {
                board.clear();


                break;
            case "delete":
                board.deleteFigure(this.parent);
                break;
            default:
                throw "Invalid type";
        }
    };
    isSelected = (x, y) => {
        return (x >= this.coords.x && x <= this.coords.x + this.width && y >= this.coords.y && y <= this.coords.y + this.width);
    }
}

let board = new Board();
$("#change").click(() => {
    board.mode = board.mode == "edit" ? "view" : "edit";
    let popup = $("#popup");
    switch (board.mode) {
        case "edit":
            popup.hide();
            board.redraw();
            break;
        case "view":
            let figure;
            board.figures.forEach(value=>{
                for (key in value.relations){
                    if(value.relations[key]){
                        figure = value;
                        return;

                    }
                }
            });
            if (!board.figures.length){
                throw "Empty board"
            }else{
                figure = board.figures[0];
            }
            popupInit(figure);

            function popupInit(figure){
                popup.html("");
                let text = $(`<div class="text"/>`);
                text.html(figure.text);

                let relations = board.getFigureRelations(figure),
                    buttons = $(`<div class="buttons"/>`);
                relations.forEach((figure, i) =>{

                    let button = $("<button />"),
                        index = board.figures.indexOf(figure);
                    button.html(+i+1 + '.' + figure.title);
                    button.data("figure", index);
                    button.click(function(){
                        popupInit(board.figures[index]);
                    });
                    buttons.append(button);

                });

                popup.append(text);
                popup.append(buttons);

            }
            board.clear();
            console.log($("#edit").find("#closebtn"));
            $("#edit").find("#closebtn").trigger("click");
            popup.css("display", "flex");
            break;
        default:
            throw "Invalid mode";

    }
});

// board.addFigure(new Figure(400, 100, width));

canvas.addEventListener("mousedown", function (e) {
    isMouseDown = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener("mouseup", function (e) {
    let x = e.clientX,
        y = e.clientY;
    isMouseDown = false;
    if (board.movedPart === "section") {

        board.figures.forEach(figure => {
            if (figure.getSection(x, y) && figure != board.lastSelectedFigure) {
                let relation = [
                    {
                        figure: figure,
                        section: figure.getSection(x, y)

                    },
                    {
                        figure: board.lastSelectedFigure,
                        section: board.lastSelectedFigure.lastSelectedSection
                    }
                ];
                board.lastSelectedFigure.relations[board.lastSelectedFigure.lastSelectedSection] = true;//figure;
                figure.relations[figure.getSection(x, y)] = true;//board.lastSelectedFigure;
                board.relations.push(relation);
            }
        });
        board.redraw();
    }

    board.movedPart = null;
    if (isMouseMoved) {
        console.log("moved");
    }
    isMouseMoved = false;
    board.save();
    // if (board.selectedDot) board.selectedDot.buttons.draw();
});
canvas.addEventListener("mousemove", function (e) {
    let x = e.pageX,
        y = e.pageY,
        figure;
    if (board.isDrawed) {
        if (isMouseDown) {
            if (e.altKey){
                let offset = {
                    x:x-mouse.x,
                    y:y-mouse.y
                };
                // ctx.translate(offset.x,offset.y);
                board.figures.forEach(figure =>{
                   figure.coords.x+= offset.x;
                   figure.coords.y+= offset.y;
                   for (let key in figure.sections){
                       figure.sections[key].recount();
                   }
                });
                mouse.x = x;
                mouse.y = y;
                board.redraw();

            }else {
                figure = isMouseMoved ? board.lastSelectedFigure : board.findFigure(x, y);

                if (figure && board.movedPart != "section") {
                    board.lastSelectedFigure = figure;
                    figure.move(x - figure.width / 2, y - figure.width / 2);
                    board.movedPart = "figure";
                    isMouseMoved = true;

                } else if (board.isSelectedFigure && board.lastSelectedFigure && e.shiftKey) {
                    // board.lastSelectedFigure.lastSelectedSection.move(x,y);
                    board.moveSelectedFigureSection(x, y);
                    board.movedPart = "section";

                } else {
                    board.movedPart = null;
                }
            }

        } else if (board.isSelectedFigure && board.lastSelectedFigure) {
            let section = board.lastSelectedFigure.getSection(x, y);
            board.lastSelectedFigure.draw.sections();
            if (section) {
                board.lastSelectedFigure.sections[section].drawColored();
            }
        }
    }
});
canvas.addEventListener("click", function (e) {
    let x = e.clientX,
        y = e.clientY;
    if (board.isDrawed) {
        if (board.isSelectedFigure && board.lastSelectedFigure) {
            let selectedFigure = board.lastSelectedFigure;
            if (selectedFigure.getSection(x, y)) {
                let relationFigureKey,
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
                    if (board.isCanDraw(figureCoords.x, figureCoords.y)) {
                        let figure = new Figure(figureCoords.x, figureCoords.y, width);

                        selectedFigure.relations[key] = true;//figure;
                        figure.relations[relationFigureKey] = true;//selectedFigure;
                        board.relations.push([
                            {
                                figure: figure,
                                section: relationFigureKey
                            },
                            {
                                figure: selectedFigure,
                                section: key
                            }

                        ]);
                        board.addFigure(figure, true);

                    }

                }
            } else if (selectedFigure.getButton(x, y)) {
                selectedFigure.getButton(x, y).click();
            }
        }
    }

});
canvas.addEventListener("dblclick", function (e) {
    let x = e.clientX,
        y = e.clientY;
    if (board.isDrawed) {
        let figure = board.findFigure(x, y);
        if (figure && !figure.sections.isDrawed) {
            board.selectFigure(figure);
        } else {
            board.redraw();
        }
    }
});
document.addEventListener("keydown", function (e) {
    if (e.keyCode === 46 && board.isSelectedFigure && board.isDrawed) {
        board.deleteFigure();
    }
});
});

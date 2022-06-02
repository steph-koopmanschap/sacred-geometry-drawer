/*
// NAME: Sacred Geometry Drawer
// CONTRIBUTORS: Steph Koopmanschap
// VERSION: 1.0
*/

//GLOBALS 
//Globals start with a capital letter

//GLOBAL CONSTANTS AND VARIABLES

//Screen Settings
var ScreenWidth = 800;
var ScreenHeight = 600;
var MainScreen;
var Canvas2D;
//Debugging mode for verbose logging
var DebugMode = false;
//Global list of groups (root group)
var GlobGroupList = [];
//Max number of shape groups to prevent CPU freeze
var MaxTotalShapes = 2000;

class Vector {
    constructor(x, y, sourceX=0, sourceY=0) {
        this.x = x;
        this.y = y;
        this.sourceX = sourceX;
        this.sourceY = sourceY;
    }
    getLength() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }
    //returns a new vector thats half the length of the vector (preserves direction)
    getHalf() {
        return new Vector(this.x / 2, this.y / 2);
    }
    Normalize() {
        return new Vector(this.x / this.getLength(), this.y / this.getLength());
    }
    //Subtract 2 vectors
    sub(vector2) {
        return new Vector(this.x - vector2.x, this.y - vector2.y);
    }
    //Add 2 vectors
    add(vector2) {
        return new Vector(this.x + vector2.x, this.y + vector2.y);
    }
    dotProduct(vector2) {
        return (this.x * vector2.x) + (this.y * vector2.y);
    }
    //remove the negative signs of the vector properties
    static abs(vector) {
        return new Vector(Math.abs(vector.x), Math.abs(vector.y));
    }
    //Unit Vectors
    //x-axis
    static RIGHT() {return new Vector(1, 0);}
    static LEFT() {return new Vector(-1, 0);}
    //y-axis
    static UP() {return new Vector(0, -1);}
    static DOWN() {return new Vector(0, 1);}
    //diagonals
    static UP_RIGHT() {return new Vector(1, -1);}
    static UP_LEFT() {return new Vector(-1, -1);}
    static DOWN_RIGHT() {return new Vector(1, 1);}
    static DOWN_LEFT() {return new Vector(-1, 1);}
    static NumberOfDirections() {return 8;}
}

//PointsAB is an array that contains 2 Vectos for point A and point B
class Line {
    constructor(pointsAB, color) {
        this.pointsAB = pointsAB;
        this.color = color;
    }
    //Returns the length of the line
    getLength() {
        let difference = Vector.abs(pointsAB[0].sub(pointsAB[1])); 
        return difference.getLength();
    }
    //Move the entire line by offset
    //NOTE: After a line is moved the line needs to be redrawn with erase() and draw()
    //Use Set autoredraw to true to automatically redraw the shape after its points have been moved
    move(offsetX, offsetY, autoRedraw=false) {
        if (autoRedraw) {this.erase();}
        this.pointsAB.forEach((point) => {
            point.x += offsetX;
            point.y += offsetY;
        });
        if (autoRedraw) {this.draw();}
    }
    //Move a point in the line, identified by its pointIndex. PointIndex can only be 0 or 1 for lines.
    //NOTE: After a point is moved the line needs to be redrawn with erase() and draw()
    movePoint(pointIndex, offsetX, offsetY, autoRedraw=false) {
        //error checking
        if (pointIndex > this.pointsAB.length) {
            console.log("This point does not exist in this line. Lines only have 2 points");
            return 1;
        }
        else {
            if (autoRedraw) {this.erase();}
            this.pointsAB[pointIndex].x += offsetX;
            this.pointsAB[pointIndex].y += offsetY;
            //this.length = this.calculateCenter(this.points);
            if (autoRedraw) {this.draw();}
        }
    }
    //automatically recolors shape 
    recolor(color) {
        this.erase();
        this.color = color;
        this.draw();
    }
    //draw the shape
    draw() {
        Canvas2D.strokeStyle = this.color;
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.pointsAB[0].x, this.pointsAB[0].y);
        Canvas2D.lineTo(this.pointsAB[1].x, this.pointsAB[1].y);
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
    //Erase the shape, by redrawing the shape as black (background color)
    erase() {
        Canvas2D.strokeStyle = "black";
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.pointsAB[0].x, this.pointsAB[0].y);
        Canvas2D.lineTo(this.pointsAB[1].x, this.pointsAB[1].y);
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
}

//Constructor argument is an array of vectors, signifying each point of the outline shape
//A central point can be manually given to give the shape a custom center
class Shape {
    constructor(points=[], color="white", centralPoint=new Vector(0, 0)) {
        this.ID = randIntRange(1, MaxTotalShapes);
        this.points = points;
        this.color = color;
        //If no custom centralpoint is given, calculate the center 
        if (centralPoint.x === 0 && centralPoint.y === 0) {
            this.center = this.calculateCenter(points);
        } else {
            //Assign custom point
            this.center = centralPoint;
        }
    }
    //Calculate the center (Centroid) of the shape
    calculateCenter(points) {
        let xCenter = 0;
        let yCenter = 0;
        console.log(points);
        console.log(points[0]);
        console.log(points[0].x);
        //Add all points together then divide by number of points
        /*
        for (let i = 0; i < this.points.length; i++) {
            xCenter += points[i].x;
            xCenter += points[i].y;
        }
        */
        
        this.points.forEach((point) => {
            xCenter += point.x;
            yCenter += point.y;
        });
        
        xCenter = xCenter / points.length;
        yCenter = yCenter / points.length;
        
        return new Vector(parseInt(xCenter), parseInt(yCenter));
    }
    //Move the entire shape by offset
    //NOTE: After a shape is moved the shape needs to be redrawn with erase() and draw()
    //Use Set autoredraw to true to automatically redraw the shape after its points have been moved
    move(offsetX, offsetY, autoRedraw=false) {
        if (autoRedraw) {this.erase();}
        this.points.forEach((point) => {
            point.x += offsetX;
            point.y += offsetY;
        });
        if (autoRedraw) {this.draw();}
    }
    //Rotate the entire shape by angle
    //NOTE: After a shape is moved the shape needs to be redrawn with erase() and draw()
    rotate(angle, autoRedraw=false) {
        angle = degreeToRadian(angle);
        if (autoRedraw) {this.erase();}
        this.points.forEach((point) => {
            let rotationPointX = point.x - this.center.x;
            let rotationPointY = point.y - this.center.y;
            //Apply rotation matrix
            let rotatedPointX = (rotationPointX * Math.cos(angle)) - (rotationPointY * Math.sin(angle));
            let rotatedPointY = (rotationPointX * Math.sin(angle)) + (rotationPointY * Math.cos(angle));

            point.x = rotatedPointX + this.center.x;
            point.y = rotatedPointY + this.center.y;
        });
        if (autoRedraw) {this.draw();}
    }
    //Move a specific point in the shape, identified by its pointIndex
    //NOTE: After a point is moved the shape needs to be redrawn with erase() and draw()
    movePoint(pointIndex, offsetX, offsetY, autoRedraw=false) {
        //error checking
        if (pointIndex > this.points.length) {
            console.log("This point does not exist in this shape");
            return 1;
        }
        else {
            if (autoRedraw) {this.erase();}
            this.points[pointIndex].x += offsetX;
            this.points[pointIndex].y += offsetY;
            //this.center = this.calculateCenter(this.points);
            if (autoRedraw) {this.draw();}
        }
    }
    //Merge 2 shapes together
    //The new shape is the combined outlines of the 2 shapes
    merge(shape2) {
        //Check if shape1 is inside shape2
        //Remove all points of shape1 that are inside shape2
        //Check if shape2 is inside shape1
        //Remove all points of shape2 that are inside shape1
        //Add points shape 1 and shape 2
        //return new shape
    }
    //automatically recolors shape 
    recolor(color) {
        this.erase();
        this.color = color;
        this.draw();
    }
    //draw the shape
    draw() {
        Canvas2D.strokeStyle = this.color;
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            Canvas2D.lineTo(this.points[i].x, this.points[i].y);
        }
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
    //Erase the shape, by redrawing the shape as black (background color)
    erase() {
        Canvas2D.strokeStyle = "black";
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            Canvas2D.lineTo(this.points[i].x, this.points[i].y);
        }
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
}

//position is a Vector()
class CircleShape {
    constructor(position, radius, color="white", degrees=360, centralPoint=new Vector(0, 0)) {
        this.ID = randIntRange(1, MaxTotalShapes);
        this.position = position;
        this.color = color;
        this.radius = radius;
        this.degrees = degrees;
         //If no custom centralpoint is given, the center of the circle is always its x,y(position)
         if (centralPoint.x === 0 && centralPoint.y === 0) {
            this.center = this.position;
        } else {
            //Assign custom point
            this.center = centralPoint;
        }
    }
    //Move the entire shape by offset
    //NOTE: After a shape is moved the shape needs to be redrawn with erase() and draw()
    //Use Set autoredraw to true to automatically redraw the shape after its points have been moved
    move(offsetX, offsetY, autoRedraw=false) {
        if (autoRedraw) {this.erase();}
            this.position.x += offsetX;
            this.position.y += offsetY;
        if (autoRedraw) {this.draw();}
    }
    //automatically recolors shape 
    recolor(color) {
            this.erase();
            this.color = color;
            this.draw();
        }
    //draw the shape
    draw() {
        Canvas2D.strokeStyle = this.color;
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.position.x, this.position.y);
        Canvas2D.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
    //Erase the shape, by redrawing the shape as black (background color)
    erase() {
        Canvas2D.strokeStyle = "black";
        Canvas2D.beginPath();
        Canvas2D.moveTo(this.position.x, this.position.y);
        Canvas2D.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        Canvas2D.closePath();
        Canvas2D.stroke();
    }
}

//A group(list of shapes) of shapes
//Constructor argument is an array of shapes 
class ShapeGroup {
    constructor(shapes = [], color="white", centralPoint=new Vector(0, 0)) {
        this.ID = randIntRange(1, MaxTotalShapes);
        this.shapes = shapes;
        this.color = color;
        //If no custom centralpoint is given, calculate the center 
        if (centralPoint.x === 0 && centralPoint.y === 0) {
            this.center = this.calculateCenter();
        } else {
            //Assign custom point
            this.center = centralPoint;
        }
    }
    //Tries to calculate the 'average' point from every center point of every shape in the group
    calculateCenter() {
        let xCenter = 0;
        let yCenter = 0;
        //Add all points together then divide by number of points
        this.shapes.forEach((shape) => {
            xCenter += shape.center.x;
            yCenter += shape.center.y;
        });
        xCenter = xCenter / this.shapes.length;
        yCenter = yCenter / this.shapes.length;
        
        return new Vector(xCenter, yCenter);
    }
    //move an entire group of shapes
    //If a shapeID is given it will only move that specific shape
    move(offsetX, offsetY, autoRedraw=false, shapeID=null) {
        if (shapeID === null) {
            this.shapes.forEach((shape) => {
                shape.move(offsetX, offsetY, autoRedraw);
            });
        } else {
            this.shapes.forEach((shape) => {
                if (shape.ID === shapeID) {
                    shape.move(offsetX, offsetY, autoRedraw);
                }
            });
        }
    }
    //Rotate every shape in a group
    //Note this rotates every shape in the group around its own center. 
    //It does not rotate the group around its group center
    //If a shapeID is given it will only rotate that specific shape
    rotate(angle, autoRedraw=false, shapeID=null)
    {
        angle = degreeToRadian(angle);
        if (shapeID === null) {
            this.shapes.forEach((shape) => {
                shape.rotate(angle, autoRedraw);
            });
        } else {
            this.shapes.forEach((shape) => {
                if (shape.ID === shapeID) {
                    shape.rotate(angle, autoRedraw);
                }
            });
        }
    }
    //Rotate an entire group around its group center
    rotateGroup(angle, autoRedraw=false) {
        angle = degreeToRadian(angle);
        if (autoRedraw) {this.erase();}
        this.shapes.forEach((shape) => {
            shape.points.forEach((point) => {
                let rotationPointX = point.x - this.center.x;
                let rotationPointY = point.y - this.center.y;
                //Apply rotation matrix
                let rotatedPointX = (rotationPointX * Math.cos(angle)) - (rotationPointY * Math.sin(angle));
                let rotatedPointY = (rotationPointX * Math.sin(angle)) + (rotationPointY * Math.cos(angle));

                point.x = rotatedPointX + this.center.x;
                point.y = rotatedPointY + this.center.y;
            })
        });
        if (autoRedraw) {this.draw();}
    }
    //Remove a shape from the group by its unique id
    //To add a shape to the group use ShapeGroup.shapes.append(shape);
    //Removing a shape does not erase the shape. To erase the shape too set willErase to true
    removeShape(shapeID, willErase=false) {
        this.shapes.forEach((shape) => {
            if (shape.ID === shapeID) {
                if (willErase === true) {
                    shape.erase();
                }
                this.shapes.splice(this.shapes.indexOf(shape), 1);
            }   
        });
    }
    //Combine 2 groups into a new group
    combine(group2) {
        this.shapes.append(group2.shapes);
    }
    //automatically recolors all shapes
    //if a shapeID is given it will recolor only that specific shape
    recolor(color, shapeID=null) {
        if (shapeID === null) {
            this.shapes.forEach((shape) => {
                shape.recolor(color);
            });
        } else {
            this.shapes.forEach((shape) => {
                if (shape.ID === shapeID) {
                    shape.recolor(color);
                }
            });
        }
    }
    //draw every shape in the group 
    //If a shapeID is given it will only draw that specific shape
    draw(shapeID=null) {
        if (shapeID === null) {
            this.shapes.forEach((shape) => {
                shape.draw();
            });
        } else {
            this.shapes.forEach((shape) => {
                if(shape.ID === shapeID) {
                    shape.draw();
                }
            });
        }
    }
    //erase every shape in the group 
    //If a shapeID is given it will only erase that specific shape
    erase(shapeID=null) {
        if (shapeID === null) {
            this.shapes.forEach((shape) => {
                shape.erase();
            });
        } else {
            this.shapes.forEach((shape) => {
                if(shape.ID === shapeID) {
                    shape.erase();
                }
            });
        }
    }
}

//Convert degrees to radians
function degreeToRadian(degrees) {
    return degrees * (Math.PI/180);
} 

//Remove an shape from the global group list by its unique id
//To add a group simply use GlobShapeList.append(group);
function removeGroup(groupID) {
    GlobShapeList.forEach((group) => {
        if (group.ID === groupID) {
            GlobShapeList.splice(GlobShapeList.indexOf(group), 1);
        }   
    });
}

//returns a random integer between min and max
function randIntRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//SHAPES

//Returns rectangle shape
//Rectangle starts at upper left corner and then goes clockwise to each point
//if center = true then x,y will be the center of the rectangle, however x,y wont become a point
function rectangle(x, y, width, height, center=false) {
    let upperLeft;
    let upperRight;
    let bottomRight;
    let bottomLeft;
    if(center === false) {
        upperLeft = new Vector(x, y);
        upperRight = new Vector(x + width, y);
        bottomRight = new Vector(x + width, y + height);
        bottomLeft = new Vector(x, y + height);
    } else {
        let halfX = width/2;
        let halfY = height/2;  
        upperLeft = new Vector(x - halfX, y - halfY);
        upperRight = new Vector(x + halfX, y - halfY);
        bottomRight = new Vector(x + halfX, y + halfY);
        bottomLeft = new Vector(x - halfX, y + halfY);
    }
    return new Shape([upperLeft, upperRight, bottomRight, bottomLeft]);
}

//Right triangle starts at upper left corner and then goes clockwise to each point
function rightTriangle(x, y, width, height, center=false) {
    let upperLeft;
    let bottomRight;
    let bottomLeft;
    if (center === false) {
        upperLeft = new Vector(x, y);
        bottomRight = new Vector(x + width, y + height);
        bottomLeft = new Vector(x, y + height);
    } else {
        upperLeft = new Vector(x - (0.33 * width), y - (0.66 * height));
        bottomRight = new Vector(x + (0.66 * width), y + (0.33 * height));
        bottomLeft = new Vector(upperLeft.x, upperLeft.y + height);
    }

    return new Shape([upperLeft, bottomRight, bottomLeft]);
}

//Equal triangle starts at top corner and then goes clockwise to each point
//if center is true then x,y will become the centroid of the triangle and the points calculated from that
function equalTriangle(x, y, height, center=false, color="white", centralPoint=new Vector(0, 0)) {
    let side = height / Math.sin(60);
    let top;
    let bottomRight;
    let bottomLeft;
    if (center === false) {
        top = new Vector(x, y);
        bottomRight = new Vector(x + (side/2), y + height);
    } else {
        top = new Vector(x, y - (0.66 * height));
        bottomRight = new Vector(x + (side/2), y + (0.33 * height));
        
    }
    bottomLeft = new Vector(bottomRight.x - side, bottomRight.y);

    return new Shape([top, bottomRight, bottomLeft], color, centralPoint);
}

function pentagon(x, y, size) {

}

function octagon(x, y, size) {
    upperLeft = 0;
    let octa = new Shape();
}

function interlacedSquare(x, y, size, center=true) {
    let rect1 = rectangle(x, y, size, size, center);
    let rect2 = rectangle(x, y, size, size, center);
    rect2.rotate(45);

    return new ShapeGroup([rect1,  rect2]);
}

function doubleSquare(x, y, size, center=true) {
    let rect1 = rectangle(x, y, size, size, center);
    let rect2 = rectangle(x, y, size, size, center);
    rect2.move(size/2, 0);

    return new ShapeGroup([rect1,  rect2]);
}

function hourglass(x, y, size) {
    let top = equalTriangle(x, y, size, false, "white", new Vector(x, y));
    let btm = equalTriangle(x, y, size, false, "white", new Vector(x, y));
    top.rotate(180);

    return new ShapeGroup([top, btm]);
}

function pentagram(x, y, size, center=true) {

}

function hexagram(x, y, size, center=true) {
    let up = equalTriangle(x, y, size, center);
    let down = equalTriangle(x, y, size, center);
    down.rotate(180);

    return new ShapeGroup([up,  down]);
}

function hexagon(x, y, size, center=true) {
    let hexgram = hexagram(x, y, size, center);

    console.log("whole shape");
    console.log(hexgram);
    console.log("first shape");
    console.log(hexgram.shapes[0]);
    console.log("first points");
    console.log(hexgram.shapes[0].points);
    console.log("first point");
    console.log(hexgram.shapes[0].points[0]);
    console.log("hi");

    let points = [hexgram.shapes[0].points[0], 
                  hexgram.shapes[1].points[3],
                  hexgram.shapes[0].points[2],
                  hexgram.shapes[1].points[0],
                  hexgram.shapes[0].points[3],
                  hexgram.shapes[1].points[2]];

    console.log("points: ");
    console.log(points);

    /*
    let hexgon = new Shape([hexgram.shapes[0].points[0], 
        hexgram.shapes[1].points[3],
        hexgram.shapes[0].points[2],
        hexgram.shapes[1].points[0],
        hexgram.shapes[0].points[3],
        hexgram.shapes[1].points[2]]);
        */

    let hexgon2 = new Shape(points);

    console.log(hexgon2);

    return new Shape(points);

        /*
   return new Shape([hexgram.shapes[0].points[0], 
                     hexgram.shapes[1].points[3],
                     hexgram.shapes[0].points[2],
                     hexgram.shapes[1].points[0],
                     hexgram.shapes[0].points[3],
                     hexgram.shapes[1].points[2]]);
                     */
    
    
}

function clearCanvas() {
    Canvas2D.fillStyle = "black";
    Canvas2D.clearRect(0, 0, ScreenWidth, ScreenHeight);
}

// Put all your custom shape drawings here
function draw() {
    let myTriangle = equalTriangle(150, 120, 45);
    myTriangle.draw();
    let mySquare = rectangle(80, 80, 40, 50);
    mySquare.draw();
    let myRightTriangle = rightTriangle(20, 20, 20, 35);
    myRightTriangle.draw();
    
    mySquareRotated = rectangle(80, 80, 40, 50);
    mySquareRotated.rotate(45);
    mySquareRotated.draw();
    
    myRightTriangle.rotate(45, true);
    
    
    myTriangle.erase();
    mySquare.erase();
    myRightTriangle.erase();
    mySquareRotated.erase();
    
    
    let myGroup = new ShapeGroup([myTriangle, mySquare, myRightTriangle]);
    myGroup.move(100, 100);
    myGroup.rotate(45);
    myGroup.rotateGroup(270);
    myGroup.draw();
    
    let interSquare = interlacedSquare(200, 200, 30);
    interSquare.draw();
    
    let hexy = hexagram(300, 300, 30);
    hexy.draw();
    
    let squarely = doubleSquare(500, 500, 20);
    squarely.draw();

    let hourly = hourglass(250, 250, 20);
    hourly.draw();
    
    //let hexa = hexagon(600, 600, 20);
    //hexa.draw();
    //myGroup.draw();
    //myGroup.erase();
    //myGroup.move(100, 100);
    //myGroup.draw();
}

//Initialize and start program
function init() {
    //create the screen
    MainScreen = document.createElement("canvas");
    MainScreen.width = ScreenWidth;
    MainScreen.height = ScreenHeight;
    MainScreen.style.margin = "10px";
    MainScreen.style.border = "4px solid orange";
    MainScreen.style.backgroundColor = "black";
    Canvas2D = MainScreen.getContext("2d");
    document.body.insertBefore(MainScreen, document.body.childNodes[3]);
}

init();
draw();


function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function changeBrightness(factor, sprite) {
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor;
    imgData.data[i + 1] = imgData.data[i + 1] * factor;
    imgData.data[i + 2] = imgData.data[i + 2] * factor;
  }
  context.putImageData(imgData, 0, 0);

  var spriteOutput = new Image();
  spriteOutput.src = virtCanvas.toDataURL();
  virtCanvas.remove();
  return spriteOutput;
}

function displayVictoryMess() {
  draggable && draggable.destroy();
  toggleVisibility("Message-Container");
}

function toggleVisibility(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

class Maze {
  constructor(Width, Height) {
    var mazeMap;
    var width = parseInt(Width);
    var height = parseInt(Height);
    var startCoord, endCoord;
    var dirs = ["n", "s", "e", "w"];
    var modDir = {
      n: {
        y: -1,
        x: 0,
        o: "s"
      },
      s: {
        y: 1,
        x: 0,
        o: "n"
      },
      e: {
        y: 0,
        x: 1,
        o: "w"
      },
      w: {
        y: 0,
        x: -1,
        o: "e"
      }
    };

    this.map = function () {
      return mazeMap;
    };
    this.startCoord = function () {
      return startCoord;
    };
    this.endCoord = function () {
      return endCoord;
    };

    function genMap() {
      mazeMap = new Array(height);
      for (let y = 0; y < height; y++) {
        mazeMap[y] = new Array(width);
        for (let x = 0; x < width; ++x) {
          mazeMap[y][x] = {
            n: false,
            s: false,
            e: false,
            w: false,
            visited: false,
            priorPos: null
          };
        }
      }
    }


    function isCorner(x, y) {
      // Checks if the position is in one of the four corners
      if ([0, 1].includes(x) && [0, 1].includes(y))
        return { isTrue: true, position: "top-left" };
      if ([0, 1].includes(x) && [height - 1, height - 2].includes(y))
        return { isTrue: true, position: "bottom-left" };
      if ([width - 1, width - 2].includes(x) && [0, 1].includes(y))
        return { isTrue: true, position: "top-right" };
      if ([width - 1, width - 2].includes(x) && [height - 1, height - 2].includes(y))
        return { isTrue: true, position: "bottom-right" };

      return { isTrue: false, position: "none" }
    }

    function getRandomMarginPosition(margins = ["top", "bottom", "left", "right"]) {
      const margin = margins[Math.floor(Math.random() * margins.length)];
      let x, y;
      switch (margin) {
        case 'top':
          x = Math.floor(Math.random() * width);
          y = 0;
          break;
        case 'bottom':
          x = Math.floor(Math.random() * width);
          y = height - 1;
          break;
        case 'left':
          x = 0;
          y = Math.floor(Math.random() * height);
          break;
        case 'right':
          x = width - 1;
          y = Math.floor(Math.random() * height);
          break;
      }
      return { coord: [x, y], margin };
    }

    function defineStartEnd(opositeCorners = true) {
      // Randomly generate start position from margin
      if (opositeCorners) {
        switch (rand(4)) {
          case 0:
            startCoord = {
              x: 0,
              y: 0
            };
            endCoord = {
              x: height - 1,
              y: width - 1
            };
            break;
          case 1:
            startCoord = {
              x: 0,
              y: width - 1
            };
            endCoord = {
              x: height - 1,
              y: 0
            };
            break;
          case 2:
            startCoord = {
              x: height - 1,
              y: 0
            };
            endCoord = {
              x: 0,
              y: width - 1
            };
            break;
          case 3:
            startCoord = {
              x: height - 1,
              y: width - 1
            };
            endCoord = {
              x: 0,
              y: 0
            };
            break;
        }
      } else {
        let start = getRandomMarginPosition();
        let [startX, startY] = start.coord
        let endX, endY;

        let isCornerCheck = isCorner(startX, startY);
        //console.log(isCornerCheck);

        let availableMargins = null;
        if (isCornerCheck.isTrue) {
          switch (isCornerCheck.position) {
            case 'top-left':
              availableMargins = ["bottom", "right"]
              break;
            case 'bottom-left':
              availableMargins = ["top", "right"]
              break;
            case 'top-right':
              availableMargins = ["bottom", "left"]
              break;
            case 'bottom-right':
              availableMargins = ["top", "left"]
              break;
          }
        } else {
          availableMargins = ["top", "bottom", "left", "right"].filter(m => m !== start.margin);
        }

        [endX, endY] = getRandomMarginPosition(availableMargins).coord;

        startCoord = {
          x: startX,
          y: startY
        }

        endCoord = {
          x: endX,
          y: endY
        }
      }

    }

    function defineMaze() {
      var isComp = false;
      var move = false;
      var cellsVisited = 1;
      var numLoops = 0;
      var maxLoops = 0;
      var pos = {
        x: 0,
        y: 0
      };
      var numCells = width * height;
      while (!isComp) {
        move = false;
        mazeMap[pos.x][pos.y].visited = true;
        //console.log(numLoops);

        if (numLoops >= maxLoops) {
          shuffle(dirs);
          maxLoops = Math.round(rand(height / 8));
          numLoops = 0;
        }
        numLoops++;
        for (let index = 0; index < dirs.length; index++) {
          var direction = dirs[index];
          var nx = pos.x + modDir[direction].x;
          var ny = pos.y + modDir[direction].y;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            //Check if the tile is already visited
            if (!mazeMap[nx][ny].visited) {
              //Carve through walls from this tile to next
              mazeMap[pos.x][pos.y][direction] = true;
              mazeMap[nx][ny][modDir[direction].o] = true;

              //Set Currentcell as next cells Prior visited
              mazeMap[nx][ny].priorPos = pos;
              //Update Cell position to newly visited location
              pos = {
                x: nx,
                y: ny
              };
              cellsVisited++;
              //Recursively call this method on the next tile
              move = true;
              break;
            }
          }
        }

        if (!move) {
          //  If it failed to find a direction,
          //  move the current position back to the prior cell and Recall the method.
          pos = mazeMap[pos.x][pos.y].priorPos;
        }
        if (numCells == cellsVisited) {
          isComp = true;
        }
      }
    }


    var unique = 0;
    var count = 0;

    function arraysEqual3D(arr1, arr2) {
      // Check if both arrays have the same number of layers
      if (arr1.length !== arr2.length) {
        return false;
      }

      // Check each layer
      for (let i = 0; i < arr1.length; i++) {
        const layer1 = arr1[i];
        const layer2 = arr2[i];

        // Check if layers have the same number of rows
        if (layer1.length !== layer2.length) {
          return false;
        }

        // Check each row in the layer
        for (let j = 0; j < layer1.length; j++) {

          const row1 = layer1[j];
          const row2 = layer2[j];

          const keys1 = Object.keys(row1);
          const keys2 = Object.keys(row2);
          
          // Check if rows have the same number of columns
          if (keys1.length !== keys2.length) {
            return false;
          }
          
          // Check each element in the row
          
          for (let k = 0; k < keys1.length; k++) {
            
            if(keys1[k] === 'priorPos' || keys1[k] === 'visited') continue;

            if (row1[keys1[k]] !== row2[keys1[k]]) {
              
              return false;
            }
          }
        }
      }

      // If all checks pass, the arrays are equal
      return true;
    }

    
    // var prevMaps = []
    // while (count < 1000) {
    //   genMap()
    //   defineMaze()
    //   var foundUnique = true;
    //   if (prevMaps.length === 0) {
    //     prevMaps.push(mazeMap)
    //     mazeMap = null
    //   } else {
    //     for (var map of prevMaps) {
    //       if (arraysEqual3D(map, mazeMap)){
    //         count++
    //         foundUnique = false
    //         break
    //       }
    //     }
    //     if(foundUnique){
    //       count=0
    //       unique++
    //     }

    //     var prevMap = mazeMap

    //     prevMaps.push(prevMap)

    //     mazeMap = null
    //   }
    // }
    // console.log(count);
    // console.log(unique);

    genMap();
    defineStartEnd();
    defineMaze();
  }
}

class DrawMaze {
  constructor(Maze, ctx, cellsize, endSprite, lineWidth) {
    var map = Maze.map();
    var cellSize = cellsize;
    ctx.lineWidth = lineWidth;

    this.redrawMaze = function (size) {
      cellSize = size;
      ctx.lineWidth = lineWidth;
      drawMap();
      drawEndSprite();
    };

    function drawCell(xCord, yCord, cell) {
      var x = xCord * cellSize;
      var y = yCord * cellSize;

      if (cell.n == false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (cell.s === false) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.e === false) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.w === false) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }

    function drawMap() {
      for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map[x].length; y++) {
          drawCell(x, y, map[x][y]);
        }
      }
    }


    function drawEndSprite() {
      var offsetLeft = cellSize / 50;
      var offsetRight = cellSize / 25;
      var coord = Maze.endCoord();
      ctx.drawImage(
        endSprite,
        2,
        2,
        endSprite.width,
        endSprite.height,
        coord.x * cellSize + offsetLeft,
        coord.y * cellSize + offsetLeft,
        cellSize - offsetRight,
        cellSize - offsetRight
      );
    }

    function clear() {
      var canvasSize = cellSize * map.length;
      ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    clear();
    drawMap();
    drawEndSprite();
  }
}

class Player {
  constructor(maze, p, _cellsize, onComplete, sprite, cellCount) {

    var pCtx = p.getContext("2d");
    var drawSprite;
    var moves = 0;
    var map = maze.map();
    var cellCoords = {
      x: maze.startCoord().x,
      y: maze.startCoord().y
    };
    var cellSize = _cellsize;
    var playerSize = cellSize / 2

    //console.log(cellSize);

    this.redrawPlayer = function (_cellsize) {
      cellSize = _cellsize;
      playerSize = cellSize / 2
      drawSprite();
    };

    //console.log(p);


    function setInitialPosition() {

      var offset = (cellSize - playerSize) / 2;
      playerCanvas.width = playerSize
      playerCanvas.height = playerSize
      playerCanvas.style.left = `${cellCoords.x * cellSize + offset}px`
      playerCanvas.style.top = `${cellCoords.y * cellSize + offset}px`
    }

    function drawSprite() {
      setInitialPosition()
      pCtx.drawImage(
        sprite,
        -25,
        5,
        sprite.width,
        sprite.height,
        0,
        0,
        cellSize / 2,
        cellSize / 2
      );
    }

    var isTransition = null


    

    this.check = function (x, y) {
      if (cellCoords.x === maze.endCoord().x && cellCoords.y === maze.endCoord().y) {
        onComplete();
      }

      var currentCell = map[cellCoords.x][cellCoords.y];
      var yLimitBottom = (cellCoords.y + 1) * cellSize;
      var yLimitTop = cellCoords.y * cellSize;
      var xLimitLeft = cellCoords.x * cellSize;
      var xLimitRight = (cellCoords.x + 1) * cellSize

      playerSize = Math.floor(playerSize)
      var vx = x + playerSize
      var vy = y + playerSize

      if ((!currentCell.s || isTransition == "left" || isTransition == "right") && vy > yLimitBottom) {
        y = yLimitBottom - playerSize
      }
      if ((!currentCell.n || isTransition == "left" || isTransition == "right") && y < yLimitTop) {
        y = yLimitTop

      }
      if ((!currentCell.w || isTransition == "up" || isTransition == "down") && x < xLimitLeft) {
        x = xLimitLeft

      }
      if ((!currentCell.e || isTransition == "up" || isTransition == "down") && vx > xLimitRight) {
        x = xLimitRight - playerSize
      }


      if (x < xLimitLeft && currentCell.w) {
        isTransition = "left"
        if (vx < xLimitLeft) {
          cellCoords.x = cellCoords.x - 1
          isTransition = null
        }
      } else if (isTransition == "left") {
        isTransition = null
      }


      if (vx > xLimitRight && currentCell.e) {
        isTransition = "right"
        if (x > xLimitRight) {
          cellCoords.x = cellCoords.x + 1
          isTransition = null
        }
      } else if (isTransition == "right") {
        isTransition = null
      }


      if (y < yLimitTop && currentCell.n) {
        isTransition = "up"
        if (vy < yLimitTop) {
          cellCoords.y = cellCoords.y - 1
          isTransition = null
        }
      } else if (isTransition == "up") {
        isTransition = null
      }
      if (vy > yLimitBottom && currentCell.s) {
        isTransition = "down"
        if (y > yLimitBottom) {
          cellCoords.y = cellCoords.y + 1
          isTransition = null
        }
      } else if (isTransition == "down") {
        isTransition = null
      }
      return { x, y }
    }
    drawSprite(maze.startCoord());

  }
}

var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var playerCanvas = document.getElementById("playerCanvas")
var playerCtx = playerCanvas.getContext("2d");
var container = document.getElementById("mazeContainer");
var sprite;
var draggable;
var finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;
var defaultSize = 350;
// sprite.src = 'media/sprite.png';

window.onload = function () {

  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();

  if (viewHeight < viewWidth && viewHeight < defaultSize) {
    mazeCanvas.width = viewHeight - viewHeight / 100;
    mazeCanvas.height = viewHeight - viewHeight / 100;
  } else if (viewHeight < defaultSize) {
    mazeCanvas.width = viewWidth - viewWidth / 100;
    mazeCanvas.height = viewWidth - viewWidth / 100;
  } else {
    mazeCanvas.width = defaultSize;
    mazeCanvas.height = defaultSize;
  }

  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
    if (completeOne === true && completeTwo === true) {
      //console.log("Runs");
      setTimeout(function () {
        makeMaze();
      }, 500);
    }
  };
  sprite = new Image();
  sprite.src =
    "./key.png" +
    "?" +
    new Date().getTime();
  sprite.setAttribute("crossOrigin", " ");
  sprite.onload = function () {
    sprite = changeBrightness(1.2, sprite);
    completeOne = true;
    //console.log(completeOne);
    isComplete();
  };

  finishSprite = new Image();
  finishSprite.src = "./home.png" +
    "?" +
    new Date().getTime();
  finishSprite.setAttribute("crossOrigin", " ");
  finishSprite.onload = function () {
    finishSprite = changeBrightness(1.1, finishSprite);
    completeTwo = true;
    //console.log(completeTwo);
    isComplete();
  };

};

window.onresize = function () {

  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();

  if (viewHeight < viewWidth && viewHeight < defaultSize) {
    mazeCanvas.width = viewHeight - viewHeight / 100;
    mazeCanvas.height = viewHeight - viewHeight / 100;
  } else if (viewHeight < defaultSize) {
    mazeCanvas.width = viewWidth - viewWidth / 100;
    mazeCanvas.height = viewWidth - viewWidth / 100;
  }
  cellSize = mazeCanvas.width / difficulty;
  playerCanvas.width = cellSize / 2;
  playerCanvas.height = cellSize / 2;
  if (player != null) {
    draw.redrawMaze(cellSize);
    player.redrawPlayer(cellSize);
  }
};

function makeMaze() {
  if (player != undefined) {
    player = null;
  }
  var e = document.getElementById("diffSelect");
  difficulty = e.options[e.selectedIndex].value;
  cellSize = mazeCanvas.width / difficulty;


  maze = new Maze(difficulty, difficulty);
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite, cellSize / 30);
  draggable && draggable.destroy()
  player = new Player(maze, playerCanvas, cellSize, displayVictoryMess, sprite, difficulty);
  draggable = new Draggable(playerCanvas, {
    limit: player.check,
    setCursor: true,
    smoothDrag: true
  });
  if (container.style.opacity < "100") {
    container.style.opacity = "100";
  }
}



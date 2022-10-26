var board = [];
var mines = [];

const MINES = 102;
const FLAGS = MINES;
const ROWS = 16; //16
const COLUMNS = 30; //30

const GAMEBOARD = document.querySelector(".board");
const GAME_TILE_SIZE = 35;
const GAME_TILE_PADDING = 1;
const FLAG_COUNTER = document.querySelector(".flag_counter");

const UNCHECKED_COLOR = "darkgray";
const CHECKED_COLOR = "white";
const FLAG_URL = "images/flags_banner_icon.png";
const BOMB_URL = "images/bombomb_background.png";

var flagsUsed = 0;
var totalChecks = 0;
var stopwatch;

class Tile {
    constructor(x, y, mine=Boolean) {
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.number = 0;
        this.flagged = false;
        this.clicked = false;
        this.ui = null;
        this.uiNumber = null;
    }
}

class Stopwatch {
    static timer = false;
    static minutes = 0;
    static seconds = 0;
    static TIMER = document.querySelector(".timer_counter");

    stopwatch() {
        if(Stopwatch.timer) {
            Stopwatch.seconds++;

            if(Stopwatch.seconds == 60) {
                Stopwatch.seconds = 0;
                Stopwatch.minutes++;
            }

            if (Stopwatch.seconds < 10 && Stopwatch.minutes < 10) {
                Stopwatch.TIMER.innerHTML = `0${Stopwatch.minutes} : 0${Stopwatch.seconds}`;
            } else if (Stopwatch.minutes < 10) {
                Stopwatch.TIMER.innerHTML = `0${Stopwatch.minutes} : ${Stopwatch.seconds}`;
            } else if (Stopwatch.seconds < 10) {
                Stopwatch.TIMER.innerHTML = `${Stopwatch.minutes} : 0${Stopwatch.seconds}`;
            } else {
                Stopwatch.TIMER.innerHTML = `${Stopwatch.minutes} : ${Stopwatch.seconds}`;
            }
        }
        
    }

    reset() {
        Stopwatch.minutes = 0;
        Stopwatch.seconds = 0;
        return;
    }

    toggle(lever) {
        if(lever) {
            Stopwatch.timer = setInterval(this.stopwatch, 1000);
            Stopwatch.timer = true;
            return;
        }

        Stopwatch.timer = false;
        return;
    }
}

window.onload = main();

window.onclick = e => {
    if(e.target.tile != null && !e.target.tile.flagged && !e.target.tile.clicked) {
        if(totalChecks==0) {
            // no death on first click AND retry until there is an opening
            while (e.target.tile.number != 0 || e.target.tile.mine) {
                setMines();
            }
            revealTile(e.target.tile);
            totalChecks++;
        } else if(e.target.tile.mine) {
            revealMines();
            gameOver();
        } else {
            totalChecks++;
            revealTile(e.target.tile);
        }

        let pass = true;
        board.forEach(tile => {
            if (!tile.mine && !tile.clicked) {
                pass = false;
                return;
            }
        });
        if (pass) winnerwinnerchickendinner();
    }
}

window.oncontextmenu = e => {
    if(e.target.tile != null && !e.target.tile.clicked) {
        if(e.target.tile.flagged) {
            e.target.tile.flagged = false;
            e.target.style.backgroundColor = UNCHECKED_COLOR;
            e.target.style.backgroundImage = "none";
            flagsUsed--;
            FLAG_COUNTER.innerHTML = FLAGS - flagsUsed;
            return;
        } else if (flagsUsed < FLAGS) {
            e.target.tile.flagged = true;
            revealTile(e.target.tile);
            flagsUsed++;
            FLAG_COUNTER.innerHTML = FLAGS - flagsUsed;
            return;
        }

        if(flagsUsed == FLAGS) {
            let pass = true;
            mines.forEach(mine => {
                if(!mine.flagged) {
                    pass = false;
                }
            });
    
            if(pass) winnerwinnerchickendinner();
        }
        
        console.log("You don't have any flags left!");
    }

    
}

function main() {
    GAMEBOARD.style.width = ((GAME_TILE_SIZE+GAME_TILE_PADDING) *COLUMNS)-1 + "px";
    GAMEBOARD.style.setProperty('grid-template-columns', 'repeat(' + COLUMNS + ', ' + GAME_TILE_SIZE + "px");
    FLAG_COUNTER.innerHTML = FLAGS - flagsUsed;

    if(stopwatch == null) {
        stopwatch = new Stopwatch();
        stopwatch.toggle(true);
    }
    

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLUMNS; j++) {
            let tile = new Tile(i,j,false);
            board.push(tile);
            
            let square = document.createElement("div");
            square.classList.add("tile");
            square.tile = tile;
            tile.ui = square;

            let number = document.createElement("div");
            number.classList.add("number");
            number.style.display = "none";
            tile.uiNumber =  number;

            square.appendChild(number);
            GAMEBOARD.appendChild(square);
        }
    }
    setMines();
}

function setMines(){
    // ability to reset mines
    mines.forEach(tile => {
        tile.mine = false;
    });
    mines = [];
    //

    let minesRemaining = MINES;
    while (minesRemaining > 0) {
        spotToCheck = Math.floor(Math.random() * (ROWS*COLUMNS));
        if(board[spotToCheck].mine == false && !board[spotToCheck].clicked) {
            board[spotToCheck].mine = true;
            board[spotToCheck].number = -1;
            mines.push(board[spotToCheck]);
            minesRemaining -= 1;
        }
    }

    // assign numbers 
    numberAssignment();
}

function findTileAtCoords(x,y) {
    let tileFound = null;
    board.forEach(tile => {
        if(tile.x == x && tile.y == y) {
            tileFound = tile;
        }
    });
    return tileFound;
}

function checkProximity(tile) {
    let numberOfMines = 0;
    let startingX = tile.x-1
    let startingY = tile.y-1

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if(findTileAtCoords(startingX+x, startingY+y) != null) {
                if(findTileAtCoords(startingX+x, startingY+y).mine) {
                    numberOfMines++;
                }
            }
        }
    }

    return numberOfMines;
}

function numberAssignment() {
    board.forEach(tile => {
        tile.number = checkProximity(tile);
    });
}

function gameOver() {
    stopwatch.toggle(false);
    console.log("You lost");
}

function winnerwinnerchickendinner() {
    stopwatch.toggle(false);
    console.log("You won!")
}

function sniff(tile) {
    let startingX = tile.x-1
    let startingY = tile.y-1

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let currentTile = findTileAtCoords(startingX+x, startingY+y);
            if(currentTile != null && !currentTile.clicked) {
                if(currentTile.number == 0) {
                    revealTile(currentTile);
                    sniff(currentTile);
                } if (currentTile.number < 5 && !currentTile.mine && checkForEmptySpaces(currentTile) >= 1) {
                    revealTile(currentTile);
                }
            }
        }
    }
}


function checkForEmptySpaces(tile) {
    let touchingEmptySpaces = 0;
    let startingX = tile.x-1
    let startingY = tile.y-1

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if(findTileAtCoords(startingX+x, startingY+y) != null) {
                if(findTileAtCoords(startingX+x, startingY+y).number == 0) {
                    touchingEmptySpaces++;
                }
            }
        }
    }

    return touchingEmptySpaces;
}

function revealTile(tile) {
    if (tile.flagged) {
        tile.ui.style.backgroundImage = "url("+ FLAG_URL +")";
        return;
    } else if(tile.mine) {
        tile.ui.style.backgroundImage = "url("+ BOMB_URL +")";
        return;
    }

    tile.clicked = true;
    tile.ui.style.backgroundColor = CHECKED_COLOR;
    if(tile.number != 0) {
        tile.uiNumber.innerHTML = tile.number;
        tile.uiNumber.style.display = "block";
    } else {
        sniff(tile);
    }
}

function revealMines() {
    mines.forEach(mine => {
        revealTile(mine);
    });
}
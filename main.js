var board = [];
var mines = [];

const MINES = 99;
const FLAGS = MINES;
const ROWS = 16; //16
const COLUMNS = 30; //30

const GAMEBOARD = document.querySelector(".board");
const GAME_TILE_SIZE = 35;
const GAME_TILE_PADDING = 1;

const UNCHECKED_COLOR = "darkgray";
const CHECKED_COLOR = "white";
const FLAG_URL = "images/flag_icon.png";
const BOMB_URL = "images/bomb_icon.png";

var flagsUsed = 0;

class Tile {
    constructor(x, y, mine=Boolean) {
        this.x = x;
        this.y = y;
        this.mine = mine;
        this.number = 0;
        this.flagged = false;
        this.clicked = false;
    }
}

window.onload = main();

window.onclick = e => {
    if(e.target.tile != null && !e.target.tile.flagged) {
        if(e.target.tile.mine) {
            e.target.style.backgroundImage = "url("+ BOMB_URL +")";
            gameOver();
        } else {
            e.target.style.backgroundColor = CHECKED_COLOR;
            e.target.tile.clicked = true;
            e.target.firstChild.innerHTML = e.target.tile.number;
            e.target.firstChild.style.display = "block";
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
    if(e.target.tile != null) {
        if(e.target.tile.flagged) {
            e.target.tile.flagged = false;
            e.target.style.backgroundColor = UNCHECKED_COLOR;
            e.target.style.backgroundImage = "none";
            flagsUsed--;
            return;
        } else if (flagsUsed < FLAGS) {
            e.target.tile.flagged = true;
            e.target.style.backgroundImage = "url("+ FLAG_URL +")";
            flagsUsed++;
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

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLUMNS; j++) {
            let tile = new Tile(i,j,false);
            board.push(tile);
            
            let square = document.createElement("div");
            square.classList.add("tile");
            square.tile = tile;

            let number = document.createElement("div");
            number.classList.add("number");
            number.innerHTML = "0";
            number.style.display = "none";

            square.appendChild(number);
            GAMEBOARD.appendChild(square);
        }
    }
    setMines();
    numberAssignment();
}

function setMines(){
    let minesRemaining = MINES;
    while (minesRemaining > 0) {
        spotToCheck = Math.floor(Math.random() * (ROWS*COLUMNS));
        if(board[spotToCheck].mine == false) {
            board[spotToCheck].mine = true;
            mines.push(board[spotToCheck]);
            minesRemaining -= 1;
        }
    }
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
        // console.log(tile);
    });
}

function gameOver() {
    console.log("You lost");
}

function winnerwinnerchickendinner() {
    console.log("You won!")
}
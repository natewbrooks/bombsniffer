var board = [];
var mines = [];

var ROWS = 20;
var MINES = 60;
var COLUMNS = 24;
var FLAGS = MINES;

const GAMEBOARD = document.querySelector(".board");
const GAME_TILE_SIZE = 35;
const GAME_TILE_PADDING = 1;

const FLAG_COUNTER = document.querySelector(".flag_counter");
const START_MENU = document.querySelector(".start_menu");
const RESULTS_MENU = document.querySelector(".results_menu");
const BODY = document.querySelector(".body");
const RESULTS_MENU_TEXT = document.getElementById("results_menu_text");
const INPUT_ROWS = document.getElementById("inputX");
const INPUT_BOMB = document.getElementById("inputBomb");
const INPUT_COLUMNS = document.getElementById("inputY");

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
    static interval;
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
        Stopwatch.TIMER.innerHTML = "00 : 00";
        return;
    }

    toggle(lever) {
        if(lever) {
            Stopwatch.interval = setInterval(this.stopwatch, 1000);
            Stopwatch.timer = true;
            return;
        }

        Stopwatch.interval = null;
        Stopwatch.timer = false;
        return;
    }
}

window.onload = main();

window.onclick = e => {
    switch (e.target.id) {
        case "start_button":
            checkForError();
            return;
        case "easy_button":
            INPUT_ROWS.value = 10
            INPUT_BOMB.value = 10
            INPUT_COLUMNS.value = 10
            return;
        case "medium_button":
            INPUT_ROWS.value = 16
            INPUT_BOMB.value = 40
            INPUT_COLUMNS.value = 16            
            return;
        case "hard_button":
            INPUT_ROWS.value = 16
            INPUT_BOMB.value = 99
            INPUT_COLUMNS.value = 30
            return;
        default:
            break;
    }

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
            gameOver(false);
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
        if (pass) gameOver(true);
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
    
            if(pass) gameOver(true);
        }
        
        console.log("You don't have any flags left!");
    }

    
}

function main() {
    GAMEBOARD.style.width = ((GAME_TILE_SIZE+GAME_TILE_PADDING) *COLUMNS)-1 + "px";
    GAMEBOARD.style.setProperty('grid-template-columns', 'repeat(' + COLUMNS + ', ' + GAME_TILE_SIZE + "px");
    RESULTS_MENU.style.display = "none";
    // GAMEBOARD.style.display = "none";
    // FLAG_COUNTER.innerHTML = FLAGS - flagsUsed;

    if(stopwatch == null) {
        stopwatch = new Stopwatch();
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

function gameOver(winner) {
    stopwatch.toggle(false);

    if(winner) {
        RESULTS_MENU.innerHTML = "WINNER";
        RESULTS_MENU.style.display = "block";
        START_MENU.style.display = "block";
        BODY.style.backgroundImage = "url(images/smile_background.png)"
    } else {
        RESULTS_MENU_TEXT.innerHTML = "LOSER";
        RESULTS_MENU.style.display = "block";
        START_MENU.style.display = "block";
        BODY.style.backgroundImage = "url(images/explosion_background2.png)"
    }
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

function checkForError() {
    console.log(INPUT_ROWS.value);
    if(INPUT_BOMB.value > (INPUT_ROWS.value * INPUT_COLUMNS.value)) {
        alert("You need to have less bombs than tiles.")
    } else {
        newGame();
    }
}

function newGame() {
    ROWS = INPUT_ROWS.value;
    MINES = INPUT_BOMB.value;
    COLUMNS = INPUT_COLUMNS.value;

    BODY.style.backgroundImage = "url(images/bombomb_background.png)"
    START_MENU.style.display = "none";
    FLAGS = MINES;
    FLAG_COUNTER.innerHTML = MINES;
    stopwatch.reset();
    stopwatch.toggle(true);

    // delete visual tiles too
    board.forEach(tile => {
        tile.ui.remove();
    });
    board = [];

    main();
}
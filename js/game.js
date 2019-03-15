const bombsNumber = 10;
const initRows = 15;
const initCols = 10;

const panelBombs = document.querySelector('.panel .bombs h2');
const panelHead = document.querySelector('.panel .head');
const panelTimer = document.querySelector('.panel .timer h2');
const resultDiv = document.querySelector('.result');
const resultH2 = document.querySelector('.result h2');
const resizeRows = document.querySelector('.resize #rows');
const resizeCols = document.querySelector('.resize #cols');
const resizeBombs = document.querySelector('.resize #bombs');
const resizeBtn = document.querySelector('.resize button');

const headNormal = '<i class="far fa-2x fa-smile"></i>'
const headFlush = '<i class="far fa-2x fa-flushed"></i>'
const headWinner = '<i class="far fa-2x fa-grin-stars"></i>'
const headLooser = '<i class="far fa-2x fa-dizzy"></i>'

let timerFlag = true;
let timerCount = 0;
let timerInterval;

const neighbourColor = (number) => {
    switch(number) {
        case 1: return 'blue'; break;
        case 2: return 'green'; break;
        case 3: return 'red'; break;
        case 4: return 'navy'; break;
        case 5: return 'darkred'; break;
        case 6: return 'forestgreen'; break;
        case 7: return 'blueviolet'; break;
        case 8: return 'black'; break;
        default: break;
    }
}

const winner = () => {
    clearInterval(timerInterval);
    panelBombs.textContent = 0;
    panelHead.innerHTML = headWinner;
//    alert('winner');
    resultDiv.classList.add('winner');
    resultH2.textContent = 'winner';
}

const looser = () => {
    clearInterval(timerInterval);
    panelHead.innerHTML = headLooser;
//    alert('looser');
    resultDiv.classList.add('looser');
    resultH2.textContent = 'looser';
}

const startTimer = () => {
    if (timerFlag) {
        panelTimer.textContent = timerCount;
        timerInterval = setInterval(function() {
            panelTimer.textContent = ++timerCount;
        }, 1000);
        timerFlag = false;
    }
}

const resizeBoard = () => {
    
    const cols = parseInt(resizeCols.value, 10);
    const rows = parseInt(resizeRows.value, 10);
    const bombs = parseInt(resizeBombs.value, 10);
    
    // check if values are number type
    if (cols === '' || rows === '' || bombs === '') {
        alert('Fill all inputs');
        return;
    }
    // check if values are not <0 or >50 or cols*rows>1000
    if ((cols > 50 || cols < 0) || (rows > 50 || rows < 0) || (cols * rows > 1000) || (bombs < 0) || (bombs > cols * rows)) {
        alert('Passed values are incorrect (max rows = 50, max colums = 50, max fields = 1000)');
        return;
    }
    
    game.resetGame(cols, rows, bombs);
}



class Field {
    constructor() {
        this.hasBomb = false;
        this.neighboursCount = 0;
        this.visible = false;
        this.marked = false;
    }
}

class Map {
    constructor(cols = initCols, rows = initRows, bombs = bombsNumber) {
//        console.log(cols, rows, bombs);
        this.cols = cols;
        this.rows = rows;
        this.bombs = bombs;
        this.fieldMap = this.generateMap();
    }
    generateMap() {
        // create an empty map array
        const map = [];
        
        // create empty fields
        for (let i = 0; i < this.cols; i++) {
            const row = [];
            for (let j = 0; j < this.rows; j++) {
                const field = new Field();
                row.push(field);
            }
            map.push(row);
        }
        
        // create bombs
        for (let i = 0; i < this.bombs; i++) {
            const bombRow = Math.floor(Math.random() * this.rows);
            const bombCol = Math.floor(Math.random() * this.cols);
            
            if (map[bombCol][bombRow].hasBomb) {
                i--;
            }
            else {
                map[bombCol][bombRow].hasBomb = true;
            }            
        }
        
        //count neighbours
        for (let col = 0; col < this.cols; col++) {
            const row = [];
            for (let row = 0; row < this.rows; row++) {
                const field = map[col][row];
                this.countNeighbours(map, col, row);
            }
        }
        
        return map;
    }
    countNeighbours(map, col, row) {
        const appCoords = [ [ -1, -1 ] , [ 0, -1 ] , [ 1, -1 ] , [ -1, 0 ] , [ 1, 0 ] , [ -1, 1 ] , [ 0, 1 ] , [ 1, 1 ] ];
        
        appCoords.forEach(coords => {
            if ((col + coords[0] >= 0 && col + coords[0] < map.length) && (row + coords[1] >= 0 && row + coords[1] < map[0].length)) {
                if(map[col + coords[0]][row + coords[1]].hasBomb) {
                    map[col][row].neighboursCount++;
                }
            }
        })
    }
}

class Game {
    constructor(cols = initCols, rows = initRows, bombs = bombsNumber) {
        this.map = new Map(cols, rows);
        this.visibleCounter = cols * rows;
        this.bombsTotal = bombs;
        this.bombsLeft = bombs;
        this.gameEnd = false;
        
        this.renderMap(this.map);
    }
    renderMap(map) {
        const divBoard = document.querySelector('.board');
        
        for (let i = 0; i < this.map.rows; i++) {
            const divRow = document.createElement('div');
            divRow.classList.add('row');
            
            for (let j = 0; j < this.map.cols; j++) { 
                const divField = document.createElement('div');
                divField.classList.add('field');
                divField.dataset.row = i;
                divField.dataset.col = j;
                divField.addEventListener('click', this.revealField.bind(this));
                divField.addEventListener('click', startTimer);
                divField.addEventListener('contextmenu', this.markField.bind(this), i, j);
                divField.addEventListener('mousedown', function() {
                        if (!game.gameEnd) {
                            panelHead.innerHTML = headFlush;
                        }
                    });
                divField.addEventListener('mouseup', function() {
                        if (!game.gameEnd) {
                            panelHead.innerHTML = headNormal;
                        }
                    });
                
                //dev display
//                if(this.map.fieldMap[j][i].neighboursCount) {
//                    divField.textContent = this.map.fieldMap[j][i].neighboursCount;
//                }
//                if(this.map.fieldMap[j][i].hasBomb) {
//                    divField.innerHTML = '<i class="fas fa-bomb fa-xs"></i>';
//                    divField.classList.add('bomb');
//                }
                
                
                divRow.appendChild(divField);
            }
            divBoard.appendChild(divRow);
        }
        
        panelBombs.textContent = this.bombsLeft;
        panelHead.innerHTML = headNormal;
        panelTimer.textContent = 0;
    }
    revealField() {
        // if game was ended don't do anything
        if (!this.gameEnd) {
            // make sure target is a field, not an <i> tag
            let target = event.target;
            if (!event.target.classList.contains('field')){
                target = event.target.parentElement;
            } 

            const col = parseInt(target.dataset.col, 10);
            const row = parseInt(target.dataset.row, 10);
            const fieldDiv = document.querySelector(`[data-col="${col}"][data-row="${row}"]`);

            // no point in revealing visible field
            // don't reveal field marked as flag
            if (!this.map.fieldMap[col][row].visible && !fieldDiv.classList.contains('flag')) {
                const hasBomb = this.map.fieldMap[col][row].hasBomb;
                const neighboursCount = this.map.fieldMap[col][row].neighboursCount;

                fieldDiv.innerHTML = '';

                if (hasBomb) {
                    this.showBombs();
                    this.gameEnd = true;
                    setTimeout(looser, 10);
                }
                else {
                    if (neighboursCount) {
                        target.textContent = neighboursCount;
                        target.classList.add('visible');
                        this.map.fieldMap[col][row].visible = true;
                        target.style.color = neighbourColor(neighboursCount);
                    }
                    else {
                        // if field is empty and not neighbour of bomb, then reveal surrounding fields
                        this.lookAround(col, row);
                    }
                    this.visibleCounter = this.map.cols * this.map.rows - this.countVisible();
                    if (this.visibleCounter <= this.bombsTotal) {
                        this.gameEnd = true;
                        setTimeout(winner, 10);
                    }
                    panelBombs.textContent = this.bombsLeft;
                }
            }
        }
    }
    lookAround(col, row) {
        const field = document.querySelector(`[data-col="${col}"][data-row="${row}"]`);
        // check if field is already being checked, not to cause memory leak (infinite lookAround recursion)
        if (!field.classList.contains('checking')) {
            field.classList.add('checking');
            // if field is already visible, there no point in checking it again
            if (!this.map.fieldMap[col][row].visible) {
                // set of directions to make looking around possible
                const appCoords = [ [ -1, -1 ] , [ 0, -1 ] , [ 1, -1 ] , [ -1, 0 ] , [ 1, 0 ] , [ -1, 1 ] , [ 0, 1 ] , [ 1, 1 ] ];
                
                field.classList.add('visible');
                this.map.fieldMap[col][row].visible = true;
                
                appCoords.forEach(coords => {
                    //check if coordinates are not outside of the board
                    if ((col + coords[0] >= 0 && col + coords[0] < this.map.fieldMap.length) && (row + coords[1] >= 0 && row + coords[1] < this.map.fieldMap[0].length)) {
                        const hasBomb = this.map.fieldMap[col + coords[0]][row + coords[1]].hasBomb;
                        const neighboursCount = this.map.fieldMap[col + coords[0]][row + coords[1]].neighboursCount;
                        if(!hasBomb) {
                            const fieldDiv = document.querySelector(`[data-col="${col + coords[0]}"][data-row="${row + coords[1]}"]`);
                            // dont reveal fields marked as flag
                            if (!fieldDiv.classList.contains('flag')) {
                                if(neighboursCount) {
                                    // if near-bomb field is encounter then just show it
                                    fieldDiv.textContent = neighboursCount;
                                    fieldDiv.classList.add('visible');
                                    this.map.fieldMap[col + coords[0]][row + coords[1]].visible = true;
                                    fieldDiv.style.color = neighbourColor(neighboursCount);
                                } else {
                                    // if field is empty, use recursion to look around
                                    fieldDiv.textContent = '';
                                    fieldDiv.classList.remove('flag');
                                    fieldDiv.classList.remove('question');
                                    this.lookAround(col + coords[0], row + coords[1]);
                                }
                            }

                        }
                    }
                });
            }
        }
        field.classList.remove('checking');
        
    }
    showBombs() {
        for (let i = 0; i < this.map.rows; i++) {
            for (let j = 0; j < this.map.cols; j++) {
                if(this.map.fieldMap[j][i].hasBomb) {
                    const fieldDiv = document.querySelector(`[data-col="${j}"][data-row="${i}"]`);
                    fieldDiv.innerHTML = '<i class="fas fa-bomb fa-xs"></i>';
                    fieldDiv.classList.add('bomb');
                    fieldDiv.classList.add('visible');
                    fieldDiv.classList.remove('flag');
                    fieldDiv.classList.remove('question');
                    this.map.fieldMap[j][i].visible = true;
                }
            }
        }
    }
    markField() {        
        // prevent displaying context menu
        event.preventDefault();
        
        // if game was ended don't do anything
        if (!this.gameEnd) {

            // make sure target is a field, not an <i> tag
            let target = event.target;
            if (!event.target.classList.contains('field')){
                target = event.target.parentElement;
            }        

            const col = parseInt(target.dataset.col, 10);
            const row = parseInt(target.dataset.row, 10);
            const field = this.map.fieldMap[col][row];

            // don't mark visible fields
            if (!field.visible) {
                const fieldDiv = document.querySelector(`[data-col="${col}"][data-row="${row}"]`);

                if(!field.marked) { // not marked
                    field.marked = 'flag';
                    fieldDiv.classList.add('flag');
                    fieldDiv.innerHTML = '<i class="fas fa-flag fa-xs"></i>';
                    panelBombs.textContent = --this.bombsLeft;
                } else if(field.marked == 'flag') {
                    field.marked = 'question';
                    fieldDiv.classList.remove('flag');
                    fieldDiv.classList.add('question');
                    fieldDiv.innerHTML = '<i class="fas fa-question fa-xs"></i>';
                    panelBombs.textContent = ++this.bombsLeft;
                } else {
                    field.marked = false;
                    fieldDiv.classList.remove('question');
                    fieldDiv.innerHTML = '';
                }
            }
        }
    }
    countVisible() {
        let visibles = 0;
        for (let i = 0; i < this.map.rows; i++) {
            for (let j = 0; j < this.map.cols; j++) {
                if(this.map.fieldMap[j][i].visible) {
                    visibles++;
                }
            }
        }
        return visibles;
    }
    resetGame(cols, rows, bombs) {        
        document.querySelector('.board').innerHTML = '';
        this.map = new Map(cols, rows, bombs);
        this.visibleCounter = cols * rows;
        this.bombsLeft = bombs;
        this.bombsTotal = bombs;
        this.gameEnd = false;
        
        this.renderMap(this.map);
        
        timerFlag = true;
        timerCount = 0;
        clearInterval(timerInterval);
        resultDiv.classList.remove('winner');
        resultDiv.classList.remove('looser');
        resultH2.textContent = '';
    }
}

let game = new Game();

panelHead.addEventListener('click', function() { game.resetGame(game.map.cols, game.map.rows, game.map.bombs) });
resizeBtn.addEventListener('click', resizeBoard);
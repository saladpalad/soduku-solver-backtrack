const sudokuBoard = document.querySelector('#sudoku')
const solveButton = document.querySelector('#solve')
const feedback = document.querySelector('#solution')

const squares = 81
let submissionArray = []

var exampleBoard = [
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, 2, null, null, null]
  ];

//create the 9x9 grid board
for(let i = 0; i < squares; i++){
    const inputElement = document.createElement('input')
    inputElement.setAttribute('type', 'number')
    inputElement.setAttribute('min', 1)
    inputElement.setAttribute('max', 9)

    const currBoxStartCol = Math.floor( (i % 9) / 3) * 3;
    const currBoxStartRow = Math.floor(Math.floor(i / 9) / 3) * 3;
    
    const currBoxNumber = (currBoxStartCol / 3) + currBoxStartRow;
     
    if (currBoxNumber % 2 == 0) {
         inputElement.classList.add('in-even-box');
    }

    sudokuBoard.appendChild(inputElement)
}

//append together the values in the board
function joinValues(){
    const inputs = document.querySelectorAll('input');

    // Create a 2D array with 9 rows and 9 columns, filled with the default value "b"
    for (let i = 0; i < 9; i++) {
        const rowArray = [];
        for (let j = 0; j < 9; j++) {
            rowArray.push(null);
        }
        submissionArray.push(rowArray);
    }

    // Iterate through the input elements and update the corresponding positions in the submissionArray
    inputs.forEach((input, index) => {
        if (input.value) {
            // Calculate the row and column index based on the input index
            const rowIndex = Math.floor(index / 9);
            const colIndex = index % 9;
            submissionArray[rowIndex][colIndex] = parseInt(input.value);
        }
    });
}

function solutionDisplay(solution){
    const inputs = document.querySelectorAll('input');
    if (solution) {
        inputs.forEach((input, i) => {
            // Calculate the row and column index based on the input index
            const rowIndex = Math.floor(i / 9);
            const colIndex = i % 9;
            input.value = solution[rowIndex][colIndex];
        });
        feedback.innerHTML = 'Here is the solution!';
    } else {
        feedback.innerHTML = 'Unsolvable puzzle :(';
    }
}

function solve(){
    joinValues()
    let solution = getSolution(submissionArray)
    solutionDisplay(solution)
}


document.getElementById('solve').addEventListener('click', function () {
    solve()
});

function resetBoard() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = null; // Clear the value of each input element
    });
    feedback.innerHTML = ''; // Clear any previous feedback messages
}

document.getElementById('reset').addEventListener('click', function () {
    submissionArray = []
    resetBoard();
});

/*
Backtracking Search Algorithm Implementation
*/

function getSolution(board){
    if(solved(board)){
        return board
    } else {
        const possibilities = nextBoards(board) //generate new possible boards
        const validBoards = isValid(possibilities) //check if the boards are valid
        return searchForSol(validBoards) //call backtracking search algo on the remaining boards
    }
}

function searchForSol(boards){
    //check if there are still valid boards
    if (boards.length == 0){
        return false
    } else {
        //backtracking search for solution
        var first = boards.shift() //removes & returns the first element of the boards array
        const tryPath = getSolution(first)
        if(tryPath != false){
            //return the path if we manage to solve a board
            return tryPath
        } else {
           //when we hit a deadend in one of our possibility sub-trees, we should shift to next board on the same level of the tree
           return searchForSol(boards)
        }
    }
}

function solved(board){
    //the board is solved when all the values in the grid are filled
    for(var i = 0; i < 9; i++){
        for(var j = 0; j < 9; j++){
            if(board[i][j] == null){
                return false
            }
        }
    }
    return true
}

function nextBoards(board){
    var res = []
    //find the first empty square to fill in numbers 1-9
    const firstEmpty = findEmptySquare(board) //returns coord (y,x)
    if(firstEmpty != undefined){
        const y = firstEmpty[0]
        const x = firstEmpty[1]
        for(var i = 1; i <= 9; i++){
            //create new boards that have the filled in value
            var newBoard = [...board]
            var row = [...newBoard[y]]
            row[x] = i
            newBoard[y] = row
            res.push(newBoard)

        }
    }
    return res
}

function findEmptySquare(board){
    //find the first square that is null
    for(var i = 0; i < 9; i++){
        for(var j = 0; j < 9; j++){
            if(board[i][j] == null){
                return [i, j]
            }
        }
    }
}

function isValid(boards){
    return boards.filter((b) => validBoard(b)) //func drops invalid boards out
}

function validBoard(board){
    //check for dupe numbers
    return isValidRow(board) && isValidCol(board) && isValidBox(board) && isValidGrid(board)
}

function isValidRow(board){
    for(var i = 0; i < 9; i++){
        var cur = []
        for(var j = 0; j < 9; j++){
            if(cur.includes(board[i][j])){
                return false
            } else if (board[i][j] != null){
                cur.push(board[i][j])
            }
        }
    }
    return true
}

function isValidCol(board){
    for(var i = 0; i < 9; i++){
        var cur = []
        for(var j = 0; j < 9; j++){
            if(cur.includes(board[j][i])){
                return false
            } else if (board[j][i] != null){
                cur.push(board[j][i])
            }
        }
    }
    return true
}

function isValidBox(board){
    const boxCoords = [[0, 0], [0, 1], [0, 2],
                            [1, 0], [1, 1], [1, 2],
                            [2, 0], [2, 1], [2, 2]]
    //adjust the boxCoords so we can traverse through each box grid
    for(var y = 0; y < 9; y += 3){
        for(var x = 0; x < 9; x += 3){
            var cur = []
            for (var i = 0; i < 9; i++){
                var coordinates = [...boxCoords[i]]
                coordinates[0] += y
                coordinates[1] += x
                if(cur.includes(board[coordinates[0]][coordinates[1]])){
                    return false
                } else if (board[coordinates[0]][coordinates[1]] != null){
                    cur.push(board[coordinates[0]][coordinates[1]])
                }
            }
        }
    }
    return true
}

function isValidGrid(grid) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const num = grid[i][j];
            if (num !== null && (num < 1 || num > 9)) {
                return false;
            }
        }
    }
    return true;
}

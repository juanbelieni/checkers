const canvas = document.querySelector('#board');
let board = [];
const colorsBoard = ['#FEF0CF', '#2E2311'];
const colorsPNG = { 1: 'white', 2: 'black' };
let turn = 1;

function createBoard() {
  let color = 1;

  for (let i = 0; i < 64; i++) {
    const spot = document.createElement('div');
    const { x, y } = getPos(i);
    if (x !== 0) color = (color + 1) % 2;

    spot.style.backgroundColor = colorsBoard[color];
    spot.className = 'spot';
    spot.i = i;
    spot.onclick = () => findMoves(i);
    canvas.appendChild(spot);

    board.push({
      color,
      occupied: 0,
      spot,
      pos: { x, y },
    });
  }
}

function getPos(i) {
  const x = i % 8;
  const y = (i - x) / 8;
  return { x, y };
}

function getIndex(x, y) {
  return y * 8 + x;
}

function changeTurn() {
  turn = turn === 1 ? 2 : 1;
}

function setupGame() {
  board = board.map((board, i) => {
    const { y } = board.pos;
    if (board.color === 0) {
      if (y < 3) {
        return { ...board, occupied: 1 };
      } else if (y > 4) {
        return { ...board, occupied: 2 };
      }
    }
    return board;
  });
}

function draw() {
  board.forEach(({ occupied, spot }) => {
    if (occupied !== 0) {
      spot.innerHTML = `<img src="${colorsPNG[occupied]}.png"/>`;
    } else {
      spot.innerHTML = '';
    }
  });

  const score = getScore();
  document.querySelector("#score").innerHTML = `Brancas ${score[1]} x ${score[2]} Pretas`
}

function movePiece(from, to) {
  board[to].occupied = board[from].occupied;
  board[from].occupied = 0;
  changeTurn();
  draw();
}

function jumpPiece(from, piece, to) {
  board[to].occupied = board[from].occupied;
  board[from].occupied = 0;
  board[piece].occupied = 0;
  changeTurn();
  draw();
}

function showTransparentPiece(i, other_i) {
  const color = colorsPNG[board[i].occupied];
  board[
    other_i
  ].spot.innerHTML = `<img src="${color}.png" class="transparent" onclick="movePiece(${i}, ${other_i})"/>`;
}

function showRedPiece(i, piece_i, other_i) {
  const color = colorsPNG[board[i].occupied];
  board[
    other_i
  ].spot.innerHTML = `<img src="${color}.png" class="transparent" onclick="jumpPiece(${i}, ${piece_i}, ${other_i})"/>`;
  board[piece_i].spot.children[0].className = 'red';
}

function findDiagonals(x, y) {
  let d = [null, null, null, null];
  if (x - 1 >= 0 && y - 1 >= 0) {
    d[0] = { x: x - 1, y: y - 1 };
  }
  if (x + 1 <= 7 && y - 1 >= 0) {
    d[1] = { x: x + 1, y: y - 1 };
  }
  if (x + 1 <= 7 && y + 1 <= 7) {
    d[2] = { x: x + 1, y: y + 1 };
  }
  if (x - 1 >= 0 && y + 1 <= 7) {
    d[3] = { x: x - 1, y: y + 1 };
  }

  return d;
}

function isAhead(piece, y1, y2) {
  return piece == 2 ? y2 < y1 : y1 < y2;
}

function findMoves(i) {
  const {
    occupied,
    pos: { x, y },
  } = board[i];
  const moves = [];

  document.querySelectorAll('.transparent').forEach(el => el.remove());
  document.querySelectorAll('.red').forEach(el => (el.className = ''));

  if (occupied === turn) {
    findDiagonals(x, y).forEach((d, j) => {
      if (!d) return;
      const di = getIndex(d.x, d.y);

      if (isAhead(turn, y, d.y) && board[di].occupied === 0) {
        showTransparentPiece(i, di);
        moves.push(board[di]);
      } else if (board[di].occupied !== turn && board[di].occupied !== 0) {
        const d_2 = findDiagonals(d.x, d.y)[j];
        if (!d_2) return;

        const d_2i = getIndex(d_2.x, d_2.y);
        if (board[d_2i].occupied === 0) {
          showRedPiece(i, di, d_2i);
          moves.push(board[d_2i]);
        }
      }
    });
  }

  console.log(moves);
  return moves;
}

function getScore() {
  const score = { 1: 12, 2: 12 };

  board.forEach(spot => {
    if (spot.occupied !== 0) score[spot.occupied] -= 1;
  });

  return score;
}

createBoard();
setupGame();
draw();

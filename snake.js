var grid = 16;
const PEAR_SIZE = 2;
const BULLET_SPEED = grid;
const BULLET_INTERVAL = 10;
const BULLET_SIZE = grid;

var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

var count = 0;
var score = 4;
var bulletCount = 0;

var snake = {
  x: 160,
  y: 160,

  // snake velocity. moves one grid length every frame in either the x or y direction
  dx: grid,
  dy: 0,

  // keep track of all grids the snake body occupies
  cells: [],

  // length of the snake. grows when eating an apple
  maxCells: 4
};
var apple = {
  x: 320,
  y: 320
};
var pear = { x: 160, y: 80 };
var bullets = [];

// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function resetGame() {
  score = snake.cells.length;

  snake.x = 160;
  snake.y = 160;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid;
  snake.dy = 0;

  apple.x = getRandomInt(0, 25) * grid;
  apple.y = getRandomInt(0, 25) * grid;
}

// game loop
function loop() {
  requestAnimationFrame(loop);

  // slow game loop to 30 fps instead of 60 (60/30 = 2)
  if (++count < 2) {
    return;
  }

  count = 0;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "30px Arial";
  context.fillText(`${snake.maxCells}`, 45, 56);

  // move snake by it's velocity
  snake.x += snake.dx;
  snake.y += snake.dy;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  } else if (snake.x >= canvas.width) {
    snake.x = 0;
  }

  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  } else if (snake.y >= canvas.height) {
    snake.y = 0;
  }

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({ x: snake.x, y: snake.y });

  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // draw apple
  context.fillStyle = "red";
  context.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // move pear randomly
  const randomP = getRandomInt(1, 100);
  if (randomP > 80 && randomP <= 85) {
    pear.x += grid;
  } else if (randomP > 85 && randomP <= 90) {
    pear.y += grid;
  } else if (randomP > 90 && randomP <= 95) {
    pear.x -= grid;
  } else if (randomP > 95) {
    pear.y -= grid;
  }

  bulletCount += 1;
  if (bulletCount === BULLET_INTERVAL) {
    let dx = 0;
    let dy = 0;
    if (getRandomInt(0, 2) === 0) {
      dx = getRandomInt(0, 2) === 0 ? BULLET_SPEED : -BULLET_SPEED;
    } else {
      dy = getRandomInt(0, 2) === 0 ? BULLET_SPEED : -BULLET_SPEED;
    }
    // create bullet
    const bullet = { x: pear.x, y: pear.y, dx, dy };
    bullets.push(bullet);
    bulletCount = 0;
  }

  // move bullets

  bullets = bullets.filter(bullet => {
    // move bullet by it's velocity
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
    if (
      bullet.x < 0 ||
      bullet.x >= canvas.width ||
      bullet.y < 0 ||
      bullet.y >= canvas.height
    ) {
      return false;
    }
    return true;
  });

  // wrap snake position horizontally on edge of screen
  if (pear.x < 0) {
    pear.x = canvas.width - grid;
  } else if (pear.x >= canvas.width) {
    pear.x = 0;
  }
  // wrap snake position horizontally on edge of screen
  if (pear.y < 0) {
    pear.y = canvas.height - grid;
  } else if (pear.y >= canvas.height) {
    pear.y = 0;
  }
  // draw pear
  context.fillStyle = "yellow";
  context.fillRect(pear.x, pear.y, PEAR_SIZE * grid - 1, PEAR_SIZE * grid - 1);

  // draw bullets
  for (const bullet of bullets) {
    context.fillStyle = "yellow";
    context.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE);
  }
  // draw snake one cell at a time
  context.fillStyle = "green";
  snake.cells.forEach(function(cell, index) {
    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
    context.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;

      // canvas is 400x400 which is 25x25 grids
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }

    // check collision with all cells after this one (modified bubble sort)
    for (var i = index + 1; i < snake.cells.length; i++) {
      // snake occupies same space as a body part or hits pear. disply score and reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        resetGame();
      }
    }

    for (const bullet of bullets) {
      if (cell.x === bullet.x && cell.y === bullet.y) {
        snake.maxCells--;
        snake.cells.pop();
      }
    }
  });

  const head = snake.cells[0];
  if (
    head.x >= pear.x &&
    head.x <= pear.x + PEAR_SIZE * grid &&
    head.y >= pear.y &&
    head.y <= pear.y + PEAR_SIZE * grid
  ) {
    resetGame();
  }
}

// listen to keyboard events to move the snake
document.addEventListener("keydown", function(e) {
  // prevent snake from backtracking on itself by checking that it's
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)

  // left arrow key
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  // up arrow key
  else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  // right arrow key
  else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }
  // down arrow key
  else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

// start the game
requestAnimationFrame(loop);

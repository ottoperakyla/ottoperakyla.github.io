/* global $ Bacon modules copyGrid */
class gameOfLife {
  getBoard() {
    const size = 400
    const board = []
    for (var i = 0; i < size; i++) {
      board[i] = []
      for (var j = 0; j < size; j++) {
        board[i][j] = Math.round(Math.random())
      }
    }
    return board
  }

  getGrid(canvas, context, board) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j]) {
          context.fillRect(i, j, 1, 1)
        }
      }
    }
  }

  evolveGrid(grid) {
    const aliveNeighbours = (i, j) => {
      const getValue = (row, col, i, j) => {
        if (row < 0 || col < 0 || row > grid.length - 1 || col > grid.length - 1 || row === i && col === j) return 0
        return grid[row][col]
      }
      let alive = 0
      for (var row = i - 1; row <= i + 1; row++) {
        for (var col = j - 1; col <= j + 1; col++) {
          alive += getValue(row, col, i, j)
        }
      }
      return alive
    }
    const newGrid = copyGrid(grid)
    let gridLen = grid.length
    for (var i = 0; i < gridLen; i++) {
      for (var j = 0; j < gridLen; j++) {
        const aliveCount = aliveNeighbours(i, j)
        if (grid[i][j] === 0 && aliveCount === 3) {
          newGrid[i][j] = 1
        } else if (grid[i][j] === 1 && aliveCount !== 2 && aliveCount !== 3) {
          newGrid[i][j] = 0 
        }
      }
    }
    return newGrid
  }

  getMarkup() {
    return `
    <div>
      <canvas id="canvas"></canvas>
      <div>
      <button class="reset">Reset</button>
      <button class="start">Play</button>
      <button class="pause">Pause</button>
      </div>
    </div>`
  }

  init() {
    const $root = $('#root')
    const $game = $(this.getMarkup())
    const $reset = $game.find('.reset')
    const $pause = $game.find('.pause')
    const $start = $game.find('.start')
    const pauseClicks = $pause.asEventStream('click')
    const resetClicks = $reset.asEventStream('click')
    const gridRenderBus = new Bacon.Bus()
    const gameSpeed = 100
    let canvas = $game.find('#canvas').get(0)
    let context = canvas.getContext('2d')
    let currentGrid = this.getBoard()
    let gameInterval
    
    canvas.width = canvas.height = 400
    context.fillStyle = 'black'
      
    $reset
      .asEventStream('click')
      .startWith(true)
      .onValue(() => gridRenderBus.push(this.getBoard()))
      
    $start
      .asEventStream('click')
      .onValue(() => {
        clearInterval(gameInterval)
        gameInterval = setInterval(() => {
          gridRenderBus.push(this.evolveGrid(currentGrid))
        }, gameSpeed)
        $start.attr('disabled', true)
      })

    gridRenderBus
      .onValue(grid => {
        currentGrid = grid
        this.getGrid(canvas, context, grid)
      })

    pauseClicks.merge(resetClicks)
      .onValue(() => {
        clearInterval(gameInterval)
        $start.attr('disabled', false)
      })

    $root.html($game)
    return $game
  }
}

modules.gameOfLife = new gameOfLife()

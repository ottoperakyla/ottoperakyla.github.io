class MemoryGame {
  rand(min, max) {
    return Math.floor(Math.random() * max) + min
  } 

  getRandomColor() {
    const colors = [this.rand(0, 255),this.rand(0, 255),this.rand(0, 255)]
    const randomColor = `rgb(${colors.join(',')})`
    return randomColor
  }

  shuffle(board) {
    // TODO: does not work
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board.length; j++) {
        const temp = board[i][j]
        board[i][j] = board[this.rand(0, board.length)][this.rand(0, board.length-1)]
      }
    }
    return board
  }

  getBoard() {
    const size = 5
    const board = []
    for (var i = 0; i < size; i++) {
      board[i] = []
      for (var j = 0; j < size / 2; j+=2) {
        const randomColor = this.getRandomColor()
        board[i][j] = board[i][j+1] = randomColor
      }
    }
    return this.shuffle(board)
  }

  getMarkup(board) {
    let rows = ''
    for (var i = 0; i < board.length; i++) {
      rows += '<tr>'
      for (var j = 0; j < board[i].length; j++) {
        rows += '<td></td>'
      }
      rows += '</tr>'
    }
    return `<div><table>${rows}</table><div class="status"></div><button class="reset">Reset</button></div>`
  }

  checkWin(board) {
  }

  showWinner(winner) {
    $('.status').text(`Winner is ${winner}!`)
  }

  injectStyles() {
    const styles = `
    #game {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 100%;
      width: 100%;
      text-align: center;
    }
    td {
      border: 1px solid black;
      width: 30px;
      height: 30px;
      text-align: center; 
    }
    td:hover {
      border-color:hotpink;
      cursor: pointer;
    }`
    $('head').append(`<style>${styles}</style>`)
  }

  constructor() {
    this.init = this.init.bind(this)
  }

  init(settings) {
    this.injectStyles()
    const board = this.getBoard(settings)
    const $game = $(this.getMarkup(board))
    let gameover = false
    console.log(board)
    $game
      .find('.reset')    
      .asEventStream('click')
      .onValue(this.init)

    $game
      .find('td')
      .asEventStream('click')
      .map(({currentTarget}) => ([$(currentTarget).parent().index(), $(currentTarget).index()]))
      .filter(xy => (!gameover && !board[xy[0]][xy[1]].length))
      .onValue(xy => {
        
      })
      
    $('#root').html($game)
    return $game
  }
}

modules.memoryGame = new MemoryGame()

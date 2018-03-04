class ticTacToe {
  getBoard() {
    const size = 3
    const board = []
    for (var i = 0; i < size; i++) {
      board.push(new Array(size).fill([]))
    }
    return board
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
    const isChar = x => ['X','O'].includes(x)

    for (var row = 0; row < board.length; row++) {
      if (isChar(board[row][0]) && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
        return board[row][0]
      }
    }
    for (var col = 0; col < board.length; col++) {
      if (isChar(board[0][col]) && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
        return board[0][col]
      }
    }
    if (isChar(board[0][0]) && board[0][0] === board[1][1] && board[1][1] === board[2][2] ||
        isChar(board[2][0]) && board[2][0] === board[1][1] && board[1][1] === board[0][2]) {
      return isChar(board[0][0]) ? board[0][0] : board[2][0]
    }
    return false
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
      background: hotpink;
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
    const setTurn = turn => $game.find('.status').text(`${turn} turn`)
    let gameover = false
    let turn = Math.random() < 0.5 ? 'X' : 'O'
    
    setTurn(turn)

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
        board[xy[0]][xy[1]] = turn
        $game.find('tr').eq(xy[0]).find('td').eq(xy[1]).text(turn)
        turn = turn === 'X' ? 'O' : 'X'
        setTurn(turn)
        const winner = this.checkWin(board)
        
        if (winner) {
          gameover = true
          this.showWinner(winner)
        }
      })
      
    $('#root').html($game)
    return $game
  }
}

modules.ticTacToe = new ticTacToe()

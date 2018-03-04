class connectFour {
  getBoard() {
    const board = []
    for (var i = 0; i < 6; i++) {
      board.push(new Array(7).fill([]))
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

  checkWin(b) {
    // TODO: draw detection
    for (var y = 0; y < 6; y++) {
      for (var x = 0; x < 7; x++) {
        if (!b[y][x].length) continue;
        if (y < 3) {
          if (b[y][x] == b[y+1][x] && b[y+1][x] == b[y+2][x] && b[y+2][x] == b[y+3][x]) {
            return {path: [[y,x],[y+1,x],[y+2,x],[y+3,x]], winner: b[y][x]};
          }
        }
        if (x < 4) {
          if (b[y][x] == b[y][x+1] && b[y][x+1] == b[y][x+2] && b[y][x+2] == b[y][x+3]) {
            return {path: [[y,x],[y,x+1],[y,x+2],[y,x+3]],winner: b[y][x]};
          }
        }
        if (y < 3 && x < 4) {
          if (b[y][x] == b[y+1][x+1] && b[y+1][x+1] == b[y+2][x+2] && b[y+2][x+2] == b[y+3][x+3]) {
            return {path: [[y,x],[y+1,x+1],[y+2,x+2],[y+3,x+3]],winner:b[y][x]};
          }
        }
        if (y < 3 && x >= 3) {
          if (b[y][x] == b[y+1][x-1] && b[y+1][x-1] == b[y+2][x-2] && b[y+2][x-2] == b[y+3][x-3]) {
            return {path: [[y,x],[y+1,x-1],[y+2,x-2],[y+3,x-3]],winner:b[y][x]};
          }
        }
      }
    }
    return false;
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
    td.active {
      background: hotpink;
      cursor: pointer;
    }
    td.win {
      background: green;
    }
    `
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
      .asEventStream('mouseover')
      .map('.currentTarget')
      .map(target => $(target).index())
      .skipDuplicates()
      .onValue(idx => {
        $('td').removeClass('active')
        $(`td:nth-child(${idx + 1})`).toggleClass('active', !gameover)
      })

    $game
      .find('td')
      .asEventStream('click')
      .map(({currentTarget}) => $(currentTarget).index())
      .filter(col => (!gameover && !board[0][col].length))
      .onValue(col => {
        // TODO: move to a function
        for (var row = board.length - 1; row >= 0; row--) {
          if (!board[row][col].length) {
            board[row][col] = turn
            $game.find('tr').eq(row).find('td').eq(col).text(turn)
            turn = turn === 'X' ? 'O' : 'X'
            setTurn(turn)
            break
          }
        }

        const winner = this.checkWin(board)
        
        if (winner) {
          gameover = true
          winner.path.forEach(xy => 
            $game.find('tr').eq(xy[0]).find('td').eq(xy[1]).addClass('win')
          )
          this.showWinner(winner.winner)
        }
      })
      
    $('#root').html($game)
    return $game
  }
}

modules.connectFour = new connectFour()

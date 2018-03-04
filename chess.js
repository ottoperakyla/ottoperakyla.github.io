class Chess {
  getBoard() {
    const board = [
      [['r'],['n'],['l'],['q'],['k'],['l'],['n'],['r']],
      [['p'],['p'],['p'],['p'],['p'],['p'],['p'],['p']],
      [[],[],[],[],[],[],[],[]],
      [[],[],[],[],[],[],[],[]],
      [[],[],[],[],[],[],[],[]],
      [['P'],[],[],[],[],[],[],['p']],
      [['P'],['P'],['P'],['P'],['P'],['P'],['P'],['P']],
      [['R'],['N'],['L'],['Q'],['K'],['L'],['N'],['R']],
    ]
    return board
  }

  getMarkup(board) {
    let rows = ''
    for (var i = 0; i < board.length; i++) {
      rows += '<tr>'
      for (var j = 0; j < board[i].length; j++) {
        rows += `<td>${board[i][j]}</td>`
      }
      rows += '</tr>'
    }
    return `<div><table>${rows}</table><div class="status"></div><button class="reset">Reset</button></div>`
  }

  checkWin(board) {
    // TODO: rewrite to chess win condition
    const isChar = x => ['B','W'].includes(x)

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
      width: 60px;
      height: 60px;
      text-align: center; 
    }
    td:hover,
    td.active {
      background: hotpink;
      cursor: pointer;
    }
    table {
      font-family: 'ChessMedium'; 
      font-weight: normal; 
      font-style: normal; 
      font-size: 30px;
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
    let turn = 'W'
    const regex = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/
    }
    
    setTurn(turn)

    $game
      .find('.reset')    
      .asEventStream('click')
      .onValue(this.init)

    const showMoveset = ({c, y, x}) => {
      // TODO: check for possible blocking pieces
      const makeActive = (x, y) => {
        const $target = $game.find('tr').eq(y).find('td').eq(x)
        
        if ( $target.length && 
              (turn === 'W' && !regex.uppercase.test($target.text())) ||
              turn === 'B' && !regex.lowercase.test($target.text())) {
          $target.addClass('active can-move')
        }
      }
      let dir = 1
      const charMap = {
        PAWN: 'p',
        HORSE: 'n'
      }
      if (regex.uppercase.test(c)) dir = -1
      switch (c.toLowerCase()) {
        case charMap.PAWN:
          // if first move for pawn, it can move two tiles
          if (y === 1 || y === 6) {
            makeActive(x, y+(2*dir))
          }
          makeActive(x, y+(1*dir))
          break
        case charMap.HORSE:
          makeActive(x - 1, y+(2*dir))
          makeActive(x + 1, y+(2*dir))
          break
        default:
         return false
      }
    }

    const getTile = ({currentTarget}) => ({
      $e: $(currentTarget),
      c: $(currentTarget).text(), 
      y: $(currentTarget).parent().index(), 
      x: $(currentTarget).index()
    })

    const validPiece = ({c}) => c !== ''

    $game
      .find('td:not(.can-move)')
      .asEventStream('click')
      .map(getTile)
      .filter(validPiece)
      .onValue(({$e, c, y, x}) => {
        $game.find('td').removeClass('active')
        $e.addClass('active')
        showMoveset({c, y, x})
      })

    $game
      .find('td')
      .asEventStream('click')
      .filter(({currentTarget}) => $(currentTarget).hasClass('can-move'))
      .map(getTile)
      .onValue(() => {
        // TODO
        // 1. move piece in array
        // 2. re render array
      })
      
    $('#root').html($game)
    return $game
  }
}

modules.chess = new Chess()

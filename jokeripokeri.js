/* global $ Deck prop modules Bacon getHandBuyout */
class JokeriPokeri {
  injectStyles() {
    const styles = `
     img {
       float: none;
     }
     .hand {
       display: flex;
       margin: 1rem 0;
     }
     .card {
       margin-right: 1rem;
       transition: all .1s ease-in-out;
     }
     .card:hover {
       cursor: pointer;
       box-shadow: 5px 5px 5px #ccc;
     }
     .card.active {
       cursor: pointer; 
       transform: translateY(-10px);
     }
    `
    return `<style scoped>${styles}</style>`
  }

  render({
    handPlayer,
    bankMoney
  }) {
    const template = `
    <div class="container">
      ${this.injectStyles()}
      <div class="board">
        <div>Player</div>
        <div class="hand-player">${handPlayer.render()}</div>
      </div>

      <div class="winner">Game running...</div>
      <div>Score: <span class="hand-score">${handPlayer.getPokerHand()}</span></div>

      <div class="actions">
        <button class="stand">Stand</button>
        <button class="change-cards">Change cards</button>
        <button class="new-hand">New hand</button>
      </div>

      <div class="bank">
        <div>Bank: <span class="bank-money">${bankMoney}</span></div>
        <div class="win"></div>
      </div>
    </div>
    `
    return template
  }

  init() {
    const $root = $('#root')
    const initGame = (({bankMoney = 1000} = {}) => {
      const deck = new Deck()
      const handPlayer = deck.drawHand(5)
      const $game = $(this.render({handPlayer, bankMoney}))
      const $changeCards = $game.find('.change-cards') 
      const $cards = $game.find('.card')
      const $stand = $game.find('.stand') 
      const $handPlayer = $game.find('.hand-player')
      const $handScore = $game.find('.hand-score')
      const $newHand = $game.find('.new-hand').toggleEnabled(false)
      const $bankMoney = $game.find('.bank-money')
      const $win = $game.find('.win')
      const betSize = 20
      const standClicks = $stand.asEventStream('click').map(false)
      const changeClicks = $changeCards.asEventStream('click').map(true)

      $cards
        .asEventStream('click')
        .map(prop('currentTarget'))
        .startWith(false)
        .onValue(cardEl => {
          $(cardEl).toggleClass('active')
          const cardsSelected = Bacon.constant($('.card.active').length > 0)
          cardsSelected.assign($changeCards, 'toggleEnabled')
        })
      
      standClicks
        .merge(changeClicks)
        .take(1)
        .onValue((isChange) => {
          const $selectedCards = $('.card.active')
          $changeCards.toggleEnabled(false)
          $stand.toggleEnabled(false)
          $newHand.toggleEnabled(true)
          if (isChange && $selectedCards.length) {
            const newCards = deck.drawHand($selectedCards.length)
            handPlayer.addCards(newCards.getCards())
            handPlayer.removeCards($selectedCards)
            $selectedCards.remove() 
            $handPlayer.html(handPlayer.render())
          }
          const hand = handPlayer.getPokerHand()
          const handValue = getHandBuyout(hand, betSize)
          const bankValue = parseInt($bankMoney.text())
          let newBank
          if (handValue > 0) {
            $win.text(`You win ${handValue}!`)
            newBank = bankValue + handValue
          } else {
            newBank = bankValue - betSize
          }
          $bankMoney.text(newBank)
          $handScore.html(hand)
        })

      $newHand
        .asEventStream('click')
        .onValue(() => {
          const bankMoney = parseInt($bankMoney.text())
          const {$game} = initGame({bankMoney})
          $root.html($game)
        })

      return {$game}
    })

    const {$game} = initGame()
    $root.html($game)
    return $game
  }
}

modules.jokeripokeri = new JokeriPokeri()

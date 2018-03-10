/* global $ Deck prop modules Bacon */
class JokeriPokeri {
  constructor() {
    this.init = this.init.bind(this)
  }

  injectStyles() {
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
     }
     .card.active {
       transform: translateY(-10px);
     }
    `
    $('head').append(`<style>${styles}</style>`)
  }

  render({
    handPlayer,
    betSize,
    bankMoney
  }) {
    const template = `
    <div class="container">
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
    </div>
    `
    return template
  }

  init() {
    this.injectStyles()

    const $root = $('#root')
    const initGame = (({betSize = 20, bankMoney = 1000} = {}) => {
      const deck = new Deck()
      const handPlayer = deck.drawHand(5)
      const $game = $(this.render({
        handPlayer,
        betSize,
        bankMoney
      }))

      const $changeCards = $game.find('.change-cards') 
      const $cards = $game.find('.card')
      const $stand = $game.find('.stand') 
      const $handPlayer = $game.find('.hand-player')
      const $handScore = $game.find('.hand-score')
      const $newHand = $game.find('.new-hand').toggleEnabled(false)

      $cards
        .asEventStream('click')
        .map(prop('currentTarget'))
        .startWith(false)
        .onValue(cardEl => {
          $(cardEl).toggleClass('active')
          const cardsSelected = Bacon.constant($('.card.active').length > 0)
          cardsSelected.assign($('.change-cards'), 'toggleEnabled')
        })

      $changeCards
        .asEventStream('click')
        .take(1)
        .onValue(() => {
          const $selectedCards = $('.card.active')
          const newCards = deck.drawHand($selectedCards.length)
          handPlayer.addCards(newCards.getCards())
          handPlayer.removeCards($selectedCards)
          $selectedCards.remove()
          $changeCards.toggleEnabled(false)
          $stand.toggleEnabled(false)
          $newHand.toggleEnabled(true)
          $handPlayer.html(handPlayer.render())
          $handScore.html(handPlayer.getPokerHand())
        })

      $newHand
        .asEventStream('click')
        .onValue(() => {
          const {$game} = initGame()
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

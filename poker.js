const BLACKJACK = 21
    
class Deck {
  constructor({mode = 'poker', suites = ['clubs','diamonds','hearts','spades']} = {}) {
    this.cards = []

    const valueFn = {
      blackjack: j => j < 14 ? Math.min(10, j) : 11,
      poker: j => j
    }
    
    for (var i = 0; i < suites.length;i++) {
      for (var j = 2; j < 15; j++) {
        this.cards.push({
          suite: suites[i],
          value: valueFn[mode](j),
          image: this.getCardImage(suites[i], j)
        })
      }
    }
  }

  getCardImage(suite, value) {
    let path = `img/$value_of_${suite}.png`
    switch (value) {
    case 11: return path.replace('$value', 'jack')
    case 12: return path.replace('$value', 'queen')
    case 13: return path.replace('$value', 'king')
    case 14: return path.replace('$value', 'ace')
    default: return path.replace('$value', value)
    }
  }

  drawRandomCard() {
    return this.cards.splice(random(0, this.cards.length), 1)[0]
  }

  drawHand(n = 2) {
    const randomHand = []
    while(n--) randomHand.push(this.drawRandomCard())
    return new Hand(randomHand)
  }

}

class Hand {
  constructor(cards) {
    this.cards = cards
  }

  getCards() {
    return this.cards
  }

  removeCards($domCards) {
    $domCards.each((idx, el) => {
      const $el = $(el)
      const removeSuite = $el.data('suite')
      const removeValue = $el.data('value')
      this.cards.forEach(card => {
        if (card.suite === removeSuite && card.value === removeValue) {
          this.cards.splice(this.cards.indexOf(card), 1)
        }
      })  
    })
  }

  setCards(cards) {
    this.cards = cards
  }

  addCards(newCards) {
    this.setCards(this.cards.concat(newCards))
  }

  getScore() {
    return this.cards.reduce((acc, card) => {
      let value = card.value
      // if ace and using 11 would go over blackjack, then use 1
      if (value === 11 && acc + value > BLACKJACK) {
        value = 1
      }
      return acc += value
    }, 0)
  }

  getPokerHand() {
    console.log(this.cards)
    return getPokerHand(this.cards)
  }

  reveal() {
    this.cards.forEach(card => {
      if (card.hasOwnProperty('realImage')) {
        card.image = card.realImage
      }
    })
  }

  render(isDealer) {
    let out = ''
    this.cards.forEach((card, idx) => {
      // hide dealer second card
      if (isDealer && idx === 1) {
        card.realImage = card.image
        card.image = 'img/red_joker.png'
      }
      out += `
        <div data-suite="${card.suite}" data-value="${card.value}" class="card">
          <img src="${card.image}" alt="" />
        </div>`
    })
    return `<div class="hand">${out}</div>`
  }
}

class Blackjack {
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
    `
    $('head').append(`<style>${styles}</style>`)
  }

  render({
    handDealer,
    handPlayer,
    betSize,
    bankMoney
  }) {
    const template = `
    <div class="container">
      <div class="board">
        <div>Dealer</div>
        <div class="hand-dealer">${handDealer.render(true)}</div>
        <div>Player</div>
        <div class="hand-player">${handPlayer.render()}</div>
      </div>

      <div class="winner">Game running...</div>
      <div>Score: <span class="hand-score">${handPlayer.getScore()}</span></div>

      <div class="actions">
        <button class="hit">Hit</button>
        <button class="stand">Stand</button>
        <button class="new-hand">New hand</button>
      </div>
    </div>
    `
    return template
  }

  init() {
    this.injectStyles()

    const deck = new Deck({mode:'blackjack'})
    const handPlayer = deck.drawHand()
    const handDealer = deck.drawHand()
    const $game = $(this.render({
      handDealer,
      handPlayer,
      betSize: 50,
      bankMoney: 100
    }))

    const $betSize = $game.find('.bet-size')
    const BET_SIZE = 5
    
    const PLAYER = 'PLAYER'
    const DEALER = 'DEALER'
    
    const STATUS_BEAT = 'better hand'
    const STATUS_BLACKJACK = 'blackjack'
    const STATUS_BUST = 'went bust'
    
    const winnerBus = new Bacon.Bus()

    // TODO: this pushes to the bus but nothing happens
    if (handPlayer.getScore() === BLACKJACK) {
      winnerBus.push(PLAYER)
    }

    $game
      .find('.new-hand')
      .asEventStream('click')
      .onValue(() => {
        this.init()
      })
    
    $game
      .find('.bet button')
      .asEventStream('click')
      .map(({currentTarget}) => $(currentTarget))
      .onValue($button => {
        const dir = $button.hasClass('minus') ? -1 : 1
        const currentMoney = parseInt($game.find('.bank-money').text())
        const newBet = Math.min(currentMoney, Math.max(0, parseInt($betSize.text()) + BET_SIZE * dir))
        
        $betSize.text(newBet)
      })

    const drawAndScore = (hand, deck) => {
      const oldHand = hand.getCards()
      const newCard = deck.drawRandomCard()
      hand.setCards(oldHand.concat(newCard))
      const score = hand.getScore()

      return score
    }
    
    $game
      .find('.hit')
      .asEventStream('click')
      .onValue(() => {
        const score = drawAndScore(handPlayer, deck)

        $('.hand-score').text(score)
        $('.hand-player').html(handPlayer.render())

        if (score === BLACKJACK) {  
          winnerBus.push({winner: PLAYER, status: STATUS_BLACKJACK})
        }
        else if (score > BLACKJACK) {
          winnerBus.push({winner: DEALER, status: `player ${STATUS_BUST}`})
        }
      })

    $game
      .find('.stand')
      .asEventStream('click')
      .onValue(() => {
        $game.find('.hit').prop('disabled', true)
        handDealer.reveal()
        $('.hand-dealer').html(handDealer.render())
        const scoreDealer = handDealer.getScore()

        if (scoreDealer === BLACKJACK) {
          winnerBus.push({winner: DEALER, status: STATUS_BLACKJACK})
        } else {
          // The dealer then reveals the hidden card and must hit until the cards total 17 or more points.
          while (handDealer.getScore() < 17) {
            drawAndScore(handDealer, deck)
            $('.hand-dealer').html(handDealer.render())
          }

          const scorePlayer = handPlayer.getScore()
          const scoreDealer = handDealer.getScore()

          if (scorePlayer <= BLACKJACK && scorePlayer > scoreDealer) {
            //TODO: move to a function
            const status = scorePlayer === BLACKJACK ?
              STATUS_BLACKJACK :
              STATUS_BEAT
            winnerBus.push({winner: PLAYER, status})
          } else if (scoreDealer > BLACKJACK && scorePlayer <= BLACKJACK) {
            winnerBus.push({winner: PLAYER, status: `dealer ${STATUS_BUST}`})  
          } else {
            const status = scoreDealer === BLACKJACK ?
              STATUS_BLACKJACK :
              STATUS_BEAT
            winnerBus.push({winner: DEALER, status})
          }
        }
      })

    winnerBus
      .onValue(winner => {
        $game.find('.winner').text(`${winner.winner} wins (${winner.status})!`)
        $game.find('button:not(.new-hand)').prop('disabled', true)
      })

    $('#root').html($game)
    return $game
  }
}

modules.blackjack = new Blackjack()

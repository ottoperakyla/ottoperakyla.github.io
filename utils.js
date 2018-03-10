window.random = (min, max) => Math.floor(Math.random() * max) + min

const handSortAsc = (a, b) => a.value - b.value
const compStraight = (a, b) => a.value + 1 === b.value
const compFlush = (a, b) => a.suite === b.suite
const compareArray = (ary, comparator) => {
  let prev = ary[0]
  for (let i = 1; i < ary.length; i++) {
    if (!comparator(prev, ary[i])) {
      return false
    }
    prev = ary[i]
  }
  return true
}
const straight = hand => compareArray(hand.sort(handSortAsc), compStraight)
const flush = hand => compareArray(hand, compFlush)
const straightFlush = hand => straight(hand) && flush(hand)
const prop = p => a => a[p]
const distinct = vals => {
  const _distinct = []
  for (let val of vals) {
    if (_distinct.indexOf(val) === -1) {
      _distinct.push(val)
    }
  }
  return _distinct
}

const charMap = str => str.split(',').reduce((acc, char) => {
  acc[char] = acc[char] + 1 || 1
  return acc
}, {})

const handValues = hand => hand.map(prop('value'))
const distinctHandValues = hand => distinct(handValues(hand))

const pairCount = hand => hand.length - distinctHandValues(hand).length
const pair = hand => pairCount(hand) >= 1
const twoPair = hand => pairCount(hand) === 2

const handOccurances = hand => charMap(handValues(hand).join(','))
const maxOccuranceInHand = hand => {
  const chars = handOccurances(hand)
  return Math.max.apply(null, Object.values(chars))
}

const threeKind = hand => maxOccuranceInHand(hand) === 3
const fourKind = hand => maxOccuranceInHand(hand) === 4
const fullHouse = hand => {
  const vals = Object.values(handOccurances(hand))
  return vals[0] === 3 && vals[1] === 2
}
const royalFlush = hand => straightFlush(hand) && hand[0].value === 10

const hands = [royalFlush, straightFlush, fourKind, fullHouse, flush, straight, threeKind, twoPair, pair]

// https://en.wikipedia.org/wiki/Poker_probability#Frequency_of_5-card_poker_hands
const handOdds = {
  royalFlush: 649739,
  straightFlush: 72192,
  fourKind: 4164,
  fullHouse: 693,
  flush: 508,
  straight: 254,
  threeKind: 46.3,
  twoPair: 20,
  onePair: 1.37
}
const getPokerHand = hand => {
  for (let fn of hands) {
    if (fn(hand)) return fn.name
  }
  return false
}

const getHandBuyout = (handId, betSize) => {
  if (!handOdds[handId]) return 0
  return handOdds[handId] * betSize
}

// tests
let hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'hearts'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'clubs'}
]
let hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'hearts'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 7, suite: 'clubs'}
]
let hand3 = [
  {suite: "hearts", value: 14, image: "img/ace_of_hearts.png"},
  {suite: "spades", value: 11, image: "img/jack_of_spades.png"},
  {suite: "hearts", value: 8, image: "img/8_of_hearts.png"},
  {suite: "hearts", value: 7, image: "img/7_of_hearts.png"},
  {suite: "clubs", value: 3, image: "img/3_of_clubs.png"}
]
let hand4 = [
  {value: 6, suite: 'clubs'},
  {value: 5, suite: 'hearts'},
  {value: 4, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 2, suite: 'clubs'}
]

console.assert(straight(hand1) === true, 'straight #1')
console.assert(straight(hand2) === false, 'straight #2')
console.assert(straight(hand3) === false, 'straight #3')
console.assert(straight(hand4) === true, 'straight #4')


hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'clubs'}
]
hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'hearts'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 7, suite: 'clubs'}
]

console.assert(flush(hand1) === true, 'flush #1')
console.assert(flush(hand2) === false, 'flush #2')

hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'clubs'}
]
hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'hearts'}
]
hand3 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 7, suite: 'clubs'}
]

console.assert(straightFlush(hand1) === true, 'straightFlush #1')
console.assert(straightFlush(hand2) === false, 'straightFlush #2')
console.assert(straightFlush(hand2) === false, 'straightFlush #2')

hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 7, suite: 'hearts'}
]

console.assert(pair(hand1) === true, 'pair #1')
console.assert(pair(hand2) === false, 'pair #2')


hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 6, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 7, suite: 'hearts'}
]

console.assert(twoPair(hand1) === true)
console.assert(twoPair(hand2) === false)


hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 6, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 7, suite: 'hearts'}
]
hand3 = [
  {suite: "diamonds", value: 4, image: "img/4_of_diamonds.png"},
  {suite: "clubs", value: 10, image: "img/queen_of_clubs.png"},
  {suite: "diamonds", value: 11, image: "img/ace_of_diamonds.png"},
  {suite: "diamonds", value: 8, image: "img/8_of_diamonds.png"},
  {suite: "hearts", value: 4, image: "img/4_of_hearts.png"}
]

console.assert(threeKind(hand1) === true, 'threekind #1')
console.assert(threeKind(hand2) === false, 'threekind #2')
console.assert(threeKind(hand3) === false, 'threekind #3')


hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 6, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 5, suite: 'hearts'}
]

hand3 = [
  {value: 14, suite: 'clubs'},
  {value: 8, suite: 'clubs'},
  {value: 6, suite: 'clubs'},
  {value: 13, suite: 'clubs'},
  {value: 11, suite: 'hearts'}
]

console.assert(fourKind(hand1) === true, 'fourKind #1')
console.assert(fourKind(hand2) === false, 'fourKind #2')
console.assert(fourKind(hand2) === false, 'fourKind #3')


hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 3, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 8, suite: 'clubs'},
  {value: 5, suite: 'hearts'}
]

console.assert(fullHouse(hand1) === true, 'fullHouse #1')
console.assert(fullHouse(hand2) === false, 'fullHouse #2')

hand1 = [
  {value: 10, suite: 'clubs'},
  {value: 11, suite: 'clubs'},
  {value: 12, suite: 'clubs'},
  {value: 13, suite: 'clubs'},
  {value: 14, suite: 'clubs'}
]

hand2 = [
  {value: 10, suite: 'clubs'},
  {value: 11, suite: 'clubs'},
  {value: 12, suite: 'clubs'},
  {value: 13, suite: 'clubs'},
  {value: 14, suite: 'hearts'}
]

hand3 = [
  {value: 10, suite: 'clubs'},
  {value: 11, suite: 'clubs'},
  {value: 12, suite: 'clubs'},
  {value: 13, suite: 'clubs'},
  {value: 9, suite: 'clubs'}
]

console.assert(royalFlush(hand1) === true, 'royalFlush #1')
console.assert(royalFlush(hand2) === false, 'royalFlush #2')
console.assert(royalFlush(hand3) === false, 'royalFlush #3')

hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 3, suite: 'hearts'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 2, suite: 'clubs'},
  {value: 8, suite: 'clubs'},
  {value: 5, suite: 'hearts'}
]

hand3 = [
  {value: 2, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 8, suite: 'clubs'},
  {value: 9, suite: 'hearts'}
]

console.assert(getPokerHand(hand1) === 'fullHouse', 'getPokerHand #1')
console.assert(getPokerHand(hand2) === 'threeKind', 'getPokerHand #2')
console.assert(getPokerHand(hand3) === false, 'getPokerHand #3')

hand1 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 6, suite: 'clubs'}
]

hand2 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'clubs'},
  {value: 5, suite: 'clubs'},
  {value: 8, suite: 'clubs'}
]

hand3 = [
  {value: 2, suite: 'clubs'},
  {value: 3, suite: 'clubs'},
  {value: 4, suite: 'diamonds'},
  {value: 5, suite: 'clubs'},
  {value: 8, suite: 'clubs'}
]

console.assert(getHandBuyout(getPokerHand(hand1), 20) === handOdds.straightFlush*20, 'getHandBuyout #1')
console.assert(getHandBuyout(getPokerHand(hand2), 20) === handOdds.flush*20, 'getHandBuyout #2')
console.assert(getHandBuyout(getPokerHand(hand3), 20) === 0, 'getHandBuyout #3')

jQuery.fn.extend({
  toggleEnabled: function(bool){
    this.attr('disabled',!bool)
    return this
  }
})
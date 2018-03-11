/* global $ prop identity isLive */
const $window = $(window)
const $stuffSelect = $('select')
const validTemplate = hash => $(`.template.${hash}`).length
const getHash = () => location.hash.slice(1)
const showTemplate = hash => {
  $('.template').hide()
  $(`.${hash}`).show()
}
const gamesFilter = isLive ? prop('live') : identity
const games = [
  {id: 'jokeripokeri', name: 'Jokeripokeri', live: true},
  {id: 'gameOfLife', name: 'Game of life', live: false, selected: true},
  {id: 'blackjack', name: 'Blackjack', live: true},
  {id: 'memoryGame', name: 'Memory game', live: false},
  {id: 'chess', name: 'Chess', live: false},
  {id: 'connectFour', name: 'Connect Four', live: true},
  {id: 'ticTacToe', name: 'Tic tac toe', live: false},
]
const defaultGame = games.find(prop('selected'))

games
  .filter(gamesFilter)
  .forEach(game => $stuffSelect.append(`<option ${game.selected ? 'selected':''} value="${game.id}">${game.name}</option>"`))

$window
  .asEventStream('load hashchange')
  .map(getHash)
  .filter(validTemplate)
  .onValue(showTemplate)

$stuffSelect
  .asEventStream('change')
  .map(({currentTarget}) => currentTarget.value)
  .startWith(defaultGame.id)
  .onValue(module => {
    modules[module].init()
  })
  
window.modules = {}

const $window = $(window)
const $stuffSelect = $('select')

const validTemplate = hash => $(`.template.${hash}`).length
const getHash = () => location.hash.slice(1)
const showTemplate = hash => {
  $('.template').hide()
  $(`.${hash}`).show()
}

$window
  .asEventStream('load hashchange')
  .map(getHash)
  .filter(validTemplate)
  .onValue(showTemplate)

$stuffSelect
  .asEventStream('change')
  .map(({currentTarget}) => currentTarget.value)
  .startWith('jokeripokeri')
  .onValue(module => {
    modules[module].init()
  })
  
window.modules = {}

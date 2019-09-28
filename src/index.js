const $app = document.getElementById('app')
const $observe = document.getElementById('observe')
//const API = 'https://rickandmortyapi.com/api/character/'
const API = 'https://us-central1-escuelajs-api.cloudfunctions.net/characters'
var obj_storage = {}


function renderItem(output) {
  let newItem = document.createElement('section')
  newItem.classList.add('Items')
  newItem.innerHTML = output
  $app.appendChild(newItem)
}

function existeNextFetch() {
  let hay_next_fetch = Object.keys(localStorage).find(key => {
    return key === "next_fetch"
  })

  if (hay_next_fetch === "next_fetch") {
    return true
  } else {
    return false
  }
}

function existeLocalKey(local_key) {
  let hay_next_fetch = Object.keys(localStorage).find(key => {
    return key === local_key
  })

  if (hay_next_fetch === local_key) {
    return true
  } else {
    return false
  }
}


const getData = async api => {

  let response = await fetch(api)

  
  if (response.status === 200) {
    response = await response.json()
    let next_page = response.info.next


    if (existeNextFetch()) {
    
      let current_page = localStorage.getItem("next_fetch")
      if (current_page != next_page) {
        localStorage.setItem("next_fetch", next_page)
      } 
    } else {
      localStorage.setItem("next_fetch", next_page)
    }


    const characters = response.results
    if (!existeLocalKey("first_page_chars")) {
       localStorage.setItem("first_page_chars", JSON.stringify(characters))
    } 

    let output = characters.map(character => {
      return `
      <article class="Card">
        <img src="${character.image}" />
        <h2>${character.name}<span>${character.species}</span></h2>
      </article>
    `
    }).join('')
    renderItem(output)

  } else {
    response = {
      "load_error": "No se pudo obtener la lista de personajes, intenta más tarde"
    }

    let output = `
      <div class="load_error"> ${response.load_error} </div>
    `
    renderItem(output)
  }

}

const loadData = () => {

  if (existeNextFetch()) {
    
    let next_fetch = localStorage.getItem("next_fetch")
    if (next_fetch === "" || next_fetch === undefined) {
      if (!existeLocalKey("not_more_rendered")) {

        let output = `
          <div class="no_more_pages"> No hay más personajes por cargar </div>
        `
        renderItem(output)
        localStorage.setItem("not_more_rendered", true)
        obj_storage.instanciaIntersectionObserver.unobserve($observe)
        let io_del = delete obj_storage.instanciaIntersectionObserver
        console.log("IntersectionObserver object Deleted!: ", io_del)
      }
    } else {
      getData(next_fetch)
    }

  } else {
    getData(API)
  }

}


const onLoad = function () {

  obj_storage.instanciaIntersectionObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      console.log("Es visible")
      loadData()
    } else {
      console.log("No se ves")
    }
  }, {
      rootMargin: '0px 0px 100% 0px',
    })

  
  if (existeLocalKey("first_page_chars")) {
    const characters = JSON.parse(localStorage.getItem("first_page_chars"))


    
    let output = characters.map(character => {
      return `
    <article class="Card">
      <img src="${character.image}" />
      <h2>${character.name}<span>${character.species}</span></h2>
    </article>
  `
    }).join('')
    renderItem(output)
    localStorage.removeItem("first_page_chars")
    localStorage.removeItem("next_fetch")
    localStorage.removeItem("not_more_rendered")

  }

  obj_storage.instanciaIntersectionObserver.observe($observe)
  console.log("Observer Listening")
}

onLoad()
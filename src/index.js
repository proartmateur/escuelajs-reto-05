const $app = document.getElementById('app');
const $observe = document.getElementById('observe');
//const API = 'https://rickandmortyapi.com/api/character/';
const API = 'https://us-central1-escuelajs-api.cloudfunctions.net/characters';



function renderItem(output){
  let newItem = document.createElement('section');
  newItem.classList.add('Items');
  newItem.innerHTML = output;
  $app.appendChild(newItem);
}

function existeNextFetch(){
  let hay_next_fetch = Object.keys(localStorage).find( key => {
    return key === "next_fetch"
  })

  if (hay_next_fetch === "next_fetch") {
      return true
  } else {
    return false
  }
}

const getData = async api => {

  let response = await fetch(api)

  console.log("Respuesta:", response)
  if(response.status === 200){
      response = await response.json()
      let next_page = response.info.next       
        
      if (existeNextFetch()) {
        console.log("Existe Next Fetch")
        let current_page = localStorage.getItem("next_fetch")
        if (current_page != next_page) {
          localStorage.setItem("next_fetch", next_page)
        } else {
          console.log("Son iguales las páginas")
        }
      } else {
        localStorage.setItem("next_fetch", next_page)
      }
      

      const characters = response.results;
      let output = characters.map(character => {
        return `
      <article class="Card">
        <img src="${character.image}" />
        <h2>${character.name}<span>${character.species}</span></h2>
      </article>
    `
      }).join('');
      renderItem(output)

  }else{
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

  if ( existeNextFetch() ) {
    console.log("Existe Next Fetch, Loading new data....")
    let next_fetch = localStorage.getItem("next_fetch")
    if(next_fetch === "" || next_fetch === undefined){
      let output = `
        <div class="no_more_pages"> No hay más personajes por cargar </div>
      `
      renderItem(output)
    }else{
      getData(next_fetch);
    }
    
  }else{
    getData(API);
  }

}

const intersectionObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    console.log("Es visible")
    loadData();
  } else {
    console.log("No se ves")
  } 
}, {
  rootMargin: '0px 0px 100% 0px',
});

intersectionObserver.observe($observe);
const searchBtn = document.querySelector('#search_manga');
const input = document.querySelector('.search-field');

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const value = input.value;
  console.log('click')
});

const search = async () => {
  const url = new URL("https://query.wikidata.org/sparql");
  const query = "PREFIX bd: <http://www.bigdata.com/rdf#>\
                  PREFIX wikibase: <http://wikiba.se/ontology#>\
                  PREFIX wd: <http://www.wikidata.org/entity/>\
                  PREFIX wdt: <http://www.wikidata.org/prop/direct/>\
                  select ?objectLabel ?objectDescription ?logo ?genreLabel ?tomes ?episodes \
                  where {\
                  ?object wdt:P31 wd:Q21198342 .\
                  OPTIONAL{\
                  ?object wdt:P154 ?logo;\
                  }\
                  ?object wdt:P136 ?genre.\
                    ?object wdt:P2635 ?tomes.\
                    OPTIONAL{\
                      ?object wdt:P1113 ?episodes.\
                      }\
                  SERVICE wikibase:label {\
                  bd:serviceParam wikibase:language \"en,fr\" .\
                  }\
                  }\
                  ORDER BY ?objectLabel\
                  LIMIT 30"
  const params = {
    queryLN: 'SPARQL',
    query: query
  }
  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/sparql-results+json"
      }
    });
    const responseData = await response.json();
    responseData.results.bindings.forEach(manga => {
      createCard(manga);
    })

    console.log(responseData);
  } catch (e) {
    console.error(e);
  }
}

const results = document.querySelector('.results');

const createCard = (data) => {

  const container = document.createElement('div');
  container.classList.add('card');

  if (data.objectLabel) {
    const title = document.createElement('div');
    title.classList.add('card-title');
    title.innerText = data.objectLabel.value;
    container.appendChild(title);
  }

  if (data.logo) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.classList.add('card-logo');
    img.src = data.logo.value;
    div.appendChild(img);
    container.appendChild(div);
  }

  if (data.genreLabel) {
    const genre = document.createElement('p');
    genre.classList.add('card-genre');
    genre.innerText = data.genreLabel.value;
    container.appendChild(genre);
  }

  if (data.tomes) {
    const tomes = document.createElement('p');
    tomes.classList.add('card-tomes');
    tomes.innerText = `${data.tomes.value} tomes`;
    container.appendChild(tomes)
  }

  if (data.episodes) {
    const episodes = document.createElement('p');
    episodes.classList.add('card-episodes');
    episodes.innerText = `${data.episodes.value} episodes`;
    container.appendChild(episodes);
  }

  results.appendChild(container);
}

search();



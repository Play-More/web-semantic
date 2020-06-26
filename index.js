const searchBtn = document.querySelector('#search_manga');
const input = document.querySelector('.search-field');
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

  return container;
}

searchBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const text = input.value;
  if (text === "") {
    getAll();
    return;
  }
  const responseData = await search(text);
  results.innerHTML = "";
  if (responseData.results.bindings.length === 0) {
    const error = document.createElement('p');
    error.style.color = 'white';
    error.innerText = 'No results found for this search';
    results.appendChild(error);
    return;
  }
  const card = createCard(responseData.results.bindings[0]);
  results.appendChild(card);



});

const search = async (text) => {
  const url = new URL("https://query.wikidata.org/sparql");
  const query = `SELECT DISTINCT ?objectLabel ?objectDescription (sample(?logos) as ?logo) (GROUP_CONCAT(DISTINCT ?genreLabels ; separator=", ") as ?genreLabel) (MAX(?tome) as ?tomes ) (MAX(?episode) as ?episodes) (GROUP_CONCAT(DISTINCT ?charLabel ; separator=", ") as ?char)
                  WHERE{
                    ?object wdt:P31/wdt:P279* wd:Q8274 ;
                          rdfs:label ?objectLabel ;
                          schema:description ?objectDescription;
                          wdt:P136 ?genre;
                    OPTIONAL{
                      ?object wdt:P2635 ?tome.
                      }
                    OPTIONAL{
                      ?object wdt:P154 ?logos.
                      }
                     OPTIONAL{
                      ?object wdt:P1113 ?episode.
                      }
                    OPTIONAL{
                      ?object wdt:P674 ?characters;
                              }
                    FILTER(CONTAINS(LCASE(?objectLabel), "${text}"))
                    FILTER (LANG(?objectLabel)="en")
                    FILTER (LANG(?objectDescription)="en")
                    SERVICE wikibase:label {
                      bd:serviceParam wikibase:language "en,fr" .
                      ?genre rdfs:label ?genreLabels .
                      ?characters rdfs:label ?charLabel .
                  }
                  }
                  group by ?objectLabel ?objectDescription
                  order by ?objectLabel
                  limit 10`
  const params = {
    queryLN: 'SPARQL',
    query: query
  }
  url.search = new URLSearchParams(params).toString();
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/sparql-results+json"
      }
    });
    const responseData = await response.json();
    return responseData;
  } catch (e) {
    console.error(e);
  }
}

const getAll = async () => {
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
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/sparql-results+json"
      }
    });
    const responseData = await response.json();
    responseData.results.bindings.forEach(manga => {
      const card = createCard(manga);
      results.appendChild(card);
    })
  } catch (e) {
    console.error(e);
  }
}


const getManga = (name) => {
  fetch("https://sandbox.bordercloud.com/sparql", {
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded",
      "authorization": "Basic RVNHSS1XRUItMjAyMDpFU0dJLVdFQi0yMDIwLWhlVXE5Zg=="
    },
    "mode": "no-cors",
    "body": {
      "query": `SELECT ?q
                WHERE
                {
                GRAPH <https://www.esgi.fr/2019/ESGI5/IW1/projet7>
                {?s ?p ?q. 
                {
                SELECT ?s
                WHERE
                {
                    ?s ?p ?q.
                    FILTER(CONTAINS(LCase(?q), "${name}" || ))
                }
                }
                }
                }`
    }
  })
    .then(response => {
      return response.json()
    })
    .then(data => console.log(data))
    .catch(err => {
      console.error(err);
    });
}

const saveSearch = (text) => {
  fetch("https://sandbox.bordercloud.com/sparql", {
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded",
      "authorization": "Basic RVNHSS1XRUItMjAyMDpFU0dJLVdFQi0yMDIwLWhlVXE5Zg=="
    },
    "body": {
      "query": `SELECT ?q
                WHERE
                {
                GRAPH <https://www.esgi.fr/2019/ESGI5/IW1/projet7>
                {?s ?p ?q. 
                {
                SELECT ?s
                WHERE
                {
                    ?s ?p ?q.
                    FILTER(CONTAINS(LCase(?q), "${text}"))
                }
                }
                }
                }`
    }
  })
    .then(response => {
      return response.json()
    })
    .then(data => console.log(data))
    .catch(err => {
      console.error(err);
    });
}


getAll();

getManga('bleach');



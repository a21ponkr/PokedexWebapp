const searchInput = document.getElementById("search-input");
const pokemonInfo = document.getElementById("pokemon-info");

function displayPokemon(data) {
    pokemonInfo.innerHTML = `
      <div class="pokemon-card">
        <div class="pokemon-image">
          <img src="${data.sprites.front_default}" alt="${data.name}" />
        </div>
        <div class="pokemon-details">
          <h2>${data.name} (Level ${data.level})</h2>
          <p><strong>Type:</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
          <p><strong>Height:</strong> ${data.height / 10}m</p>
          <p><strong>Weight:</strong> ${data.weight / 10}kg</p>
        </div>
      </div>
    `;
    
    // Check if the Pokemon has a type and display the "View all" button
    if (data.types.length > 0) {
        const type = data.types[0].type.name;
        const viewAllButton = document.createElement('button');
        viewAllButton.textContent = `View all ${type} Pokemon`;
        viewAllButton.addEventListener('click', () => {
            fetch(`https://pokeapi.co/api/v2/type/${type}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Pokemon not found");
                }
                return response.json();
            })
            .then((data) => {
                displayPokemonGrid(data.pokemon);
            })
            .catch((error) => {
                console.log(error);
                pokemonInfo.innerHTML = "Pokemon not found";
            });
        });
        pokemonInfo.appendChild(viewAllButton);
      }
      
      // Add a button to view the evolution chain
      const evolutionButton = document.createElement('button');
      evolutionButton.textContent = "View evolution chain";
      evolutionButton.addEventListener('click', () => {
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}/`)
          .then((response) => {
              if (!response.ok) {
                  throw new Error("Pokemon not found");
              }
              return response.json();
          })
          .then((speciesData) => {
              const evolutionChainUrl = speciesData.evolution_chain.url;
              fetch(evolutionChainUrl)
              .then((response) => {
                  if (!response.ok) {
                      throw new Error("Evolution chain not found");
                  }
                  return response.json();
              })
              .then((evolutionData) => {
                  displayEvolutionChain(evolutionData.chain);
              })
              .catch((error) => {
                  console.log(error);
                  pokemonInfo.innerHTML = "Evolution chain not found";
              });
          })
          .catch((error) => {
              console.log(error);
              pokemonInfo.innerHTML = "Pokemon not found";
          });
      });
      pokemonInfo.appendChild(evolutionButton);
}

function getEvolutionLevel(chain) {
    const evolutionList = [];
    let level = 1;
    
    const getEvolution = (chain, level) => {
      const evolutionDetails = {
        name: chain.species.name,
        level: level
      };
      evolutionList.push(evolutionDetails);
      if (chain.evolves_to.length > 0) {
        level++;
        chain.evolves_to.forEach((evolution) => {
          getEvolution(evolution, level);
        });
      }
    };
    
    getEvolution(chain, level);
    return evolutionList;
  }

  
  function displayEvolutionChain(chain) {
  const evolutionList = getEvolutionLevel(chain);
  pokemonInfo.innerHTML = `
    <div class="evolution-chain">
      <h2>Evolution Chain</h2>
      ${evolutionList.map((evolution) => `
        <div class="evolution-details">
          <p><strong>Name:</strong> ${evolution.name}</p>
          <p><strong>Level:</strong> ${evolution.level}</p>
        </div>
      `).join('')}
    </div>
  `;
}

  

  

  function searchPokemon(event) {
    event.preventDefault();
    const pokemonName = searchInput.value.toLowerCase() || Math.floor(Math.random() * 898) + 1;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Pokemon not found");
        }
        return response.json();
      })
      .then(data => {
        displayPokemon(data);
      })
      .catch(error => {
        console.log(error);
        pokemonInfo.innerHTML = "Pokemon not found";
      });
  }
  
  window.addEventListener('load', () => {
    searchInput.value = '';
    searchPokemon(new Event('submit'));
  });
  
  function displayPokemonGrid(pokemonList) {
    const pokemonGrid = document.createElement('ul');
    pokemonGrid.classList.add('pokemon-grid');
    
    pokemonList.forEach(pokemon => {
      const pokemonCard = document.createElement('li');
      pokemonCard.classList.add('pokemon-card');
    
      const pokemonImage = document.createElement('img');
      pokemonImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon.url.split('/')[6]}.png`;
      pokemonImage.alt = pokemon.pokemon.name;
    
      const pokemonName = document.createElement('h2');
      pokemonName.textContent = pokemon.pokemon.name;
    
      const detailsButton = document.createElement('button');
      detailsButton.classList.add('btn');
      detailsButton.dataset.id = pokemon.pokemon.url.split('/')[6];
      detailsButton.textContent = 'Details';
    
      pokemonCard.appendChild(pokemonImage);
      pokemonCard.appendChild(pokemonName);
      pokemonCard.appendChild(detailsButton);
    
      pokemonGrid.appendChild(pokemonCard);
    
      detailsButton.addEventListener('click', () => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${detailsButton.dataset.id}`)
          .then(response => response.json())
          .then(data => {
            displayPokemon(data);
          })
          .catch(error => {
            console.log(error);
            pokemonInfo.innerHTML = "Pokemon not found";
          });
      });
    });
    
    pokemonInfo.innerHTML = '';
    pokemonInfo.appendChild(pokemonGrid);
  }
  
  
  

  function fetchPokemonList(page) {
    const limit = 12;
    const offset = (page - 1) * limit;
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const sortedPokemon = data.results.sort((a, b) => {
          const aNum = parseInt(a.url.split('/')[6]);
          const bNum = parseInt(b.url.split('/')[6]);
          return aNum - bNum;
        });
        
        displayPokemonGrid(sortedPokemon);
      })
      .catch((error) => {
        console.log(error);
        pokemonInfo.innerHTML = "Unable to fetch Pokemon list";
      });
  }
  
    
    const form = document.querySelector('form');
    const typeInput = document.getElementById('type-input');
    
    form.addEventListener('submit', searchPokemon);
    typeInput.addEventListener('change', () => {
    searchInput.value = '';
    searchPokemon(new Event('submit'));
    });
    
    fetchPokemonList('https://pokeapi.co/api/v2/pokemon?limit=12');
    window.scrollTo(0, 0);
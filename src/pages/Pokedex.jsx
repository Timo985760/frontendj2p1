import { useEffect, useState } from 'react';
import PokemonCard from '../components/PokemonCard';
import './Pokedex.css';

function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const limit = 24;

  const POKEMON_TYPES = [
    'all', 'normal', 'fire', 'water', 'grass', 'electric',
    'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!isMounted) return;

        const detailedList = await Promise.all(
          data.results.map(async (p) => {
            try {
              const res = await fetch(p.url);
              const details = await res.json();
              return {
                id: details.id,
                name: details.name,
                image: details.sprites?.front_default,
                types: details.types.map((t) => t.type.name)
              };
            } catch {
              const parts = p.url.split('/').filter(Boolean);
              const id = parts[parts.length - 1];
              return {
                id: Number(id),
                name: p.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: []
              };
            }
          })
        );

        if (isMounted) {
          if (offset === 0) {
            setPokemons(detailedList);
          } else {
            setPokemons((prev) => [...prev, ...detailedList]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching pokemons:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [offset]);

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const filteredPokemons = pokemons.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      selectedType === 'all' || (p.types && p.types.includes(selectedType));
    return matchesSearch && matchesType;
  });

  return (
    <div className="pokedex-page-container">
      <div className="pokedex-header">
        <div>
          <h1 className="page-heading">Pokédex</h1>
          <p className="page-subheading">
            Selecteer kandidaten voor je corporate teams of bekijk hun individuele prestatiedossier.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Zoek Pokémon op naam (bijv. pikachu)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-select-wrap">
          <label htmlFor="type-filter">Type Filter:</label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-dropdown"
          >
            {POKEMON_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredPokemons.length === 0 && !loading ? (
        <div className="empty-results">
          <h3>Geen Pokémon gevonden</h3>
          <p>Probeer een andere zoekterm of wis het filter.</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {filteredPokemons.map((pokemon) => (
            <PokemonCard
              key={pokemon.id || pokemon.name}
              id={pokemon.id}
              name={pokemon.name}
              image={pokemon.image}
              types={pokemon.types}
            />
          ))}
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Pokémon data ophalen van PokéAPI...</p>
        </div>
      )}

      {!loading && (
        <div className="load-more-wrap">
          <button type="button" onClick={handleLoadMore} className="btn-load-more">
            LOAD MORE POKÉMON
          </button>
        </div>
      )}
    </div>
  );
}

export default Pokedex;

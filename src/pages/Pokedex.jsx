import { useEffect, useState } from 'react';
import PokemonCard from '../components/PokemonCard';
import { useTeams } from '../context/TeamContext';
import './Pokedex.css';

function Pokedex() {
  const { getPokemonNickname } = useTeams();
  const [allPokemonRefs, setAllPokemonRefs] = useState([]);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(36);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const maxGen7Limit = 809;

  const POKEMON_TYPES = [
    'all', 'normal', 'fire', 'water', 'grass', 'electric',
    'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${maxGen7Limit}&offset=0`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setAllPokemonRefs(data.results || []);
      })
      .catch((err) => {
        console.error('Error fetching pokemon list:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (allPokemonRefs.length === 0) return;
    let isMounted = true;

    const query = search.trim().toLowerCase();
    const matchingRefs = query
      ? allPokemonRefs.filter((p) => {
          const nick = getPokemonNickname ? getPokemonNickname(p.name) : '';
          return (
            p.name.toLowerCase().includes(query) ||
            nick.toLowerCase().includes(query)
          );
        })
      : allPokemonRefs;

    const sliceToLoad =
      selectedType === 'all'
        ? matchingRefs.slice(0, visibleCount)
        : matchingRefs.slice(0, Math.min(matchingRefs.length, 151));

    setLoading(true);
    Promise.all(
      sliceToLoad.map(async (p) => {
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
          return null;
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      setPokemons(results.filter(Boolean));
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [allPokemonRefs, visibleCount, search, selectedType]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(maxGen7Limit, prev + 36));
  };

  const filteredPokemons = pokemons.filter((p) => {
    const matchesType =
      selectedType === 'all' || (p.types && p.types.includes(selectedType));
    return matchesType;
  });

  return (
    <div className="pokedex-page-container">
      <div className="pokedex-header">
        <div>
          <h1 className="page-heading">Pokédex</h1>
          <p className="page-subheading">
            Bekijk alle Pokémon, filter op type of voeg ze toe aan je team.
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

      {!loading && visibleCount < maxGen7Limit && !search && selectedType === 'all' && (
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

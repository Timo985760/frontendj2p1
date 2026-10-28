import { useEffect, useState } from 'react';
import { useTeams } from '../context/TeamContext';
import PokemonCard from '../components/PokemonCard';
import { Link } from 'react-router-dom';
import './Favorites.css';

function Favorites() {
  const { favorites } = useTeams();
  const [favoriteDetails, setFavoriteDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadFavorites() {
      if (favorites.length === 0) {
        if (isMounted) {
          setFavoriteDetails([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          favorites.map(async (name) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = await res.json();
            return {
              id: data.id,
              name: data.name,
              image: data.sprites?.front_default,
              types: data.types.map((t) => t.type.name)
            };
          })
        );
        if (isMounted) {
          setFavoriteDetails(results);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fout bij ophalen favorieten:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      isMounted = false;
    };
  }, [favorites]);

  const filteredFavorites = favoriteDetails.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="favorites-page-container">
      <div className="favorites-header">
        <div>
          <h1 className="page-heading">Favoriete Pokémon Pool</h1>
          <p className="page-subheading">
            Geselecteerde top-kandidaten om razendsnel bedrijfs-teams mee samen te stellen.
          </p>
        </div>
        <div className="fav-counter-badge">
          ★ {favorites.length} Opgeslagen
        </div>
      </div>

      <div className="favorites-search-bar">
        <input
          type="text"
          placeholder="Filter in favorieten..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Favorieten ophalen...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="no-favorites-box">
          <div className="star-empty-icon">★</div>
          <h3>Nog geen favorieten bewaard</h3>
          <p>Klik in de Pokédex op de ster bij een Pokémon om deze aan je favorieten toe te voegen.</p>
          <Link to="/pokedex" className="btn-explore">
            Verken de Pokédex
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="no-favorites-box">
          <h3>Geen resultaten gevonden voor "{search}"</h3>
        </div>
      ) : (
        <div className="pokemon-grid">
          {filteredFavorites.map((p) => (
            <PokemonCard
              key={p.name}
              id={p.id}
              name={p.name}
              image={p.image}
              types={p.types}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;

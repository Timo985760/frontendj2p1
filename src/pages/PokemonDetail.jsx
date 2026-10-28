import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTeams } from '../context/TeamContext';
import './PokemonDetail.css';

function PokemonDetail() {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [speciesInfo, setSpeciesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { teams, addPokemonToTeam, toggleFavorite, isFavorite, getPokemonNickname } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!res.ok) throw new Error('Pokémon niet gevonden');
        const data = await res.json();
        setPokemon(data);

        try {
          const speciesRes = await fetch(data.species.url);
          if (speciesRes.ok) {
            const speciesData = await speciesRes.json();
            setSpeciesInfo(speciesData);
          }
        } catch {
          setSpeciesInfo(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="loading-spinner"></div>
        <p>loading....</p>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="detail-error-container">
        <h2>Pokémon niet gevonden</h2>
        <p>Er kon geen dossier worden opgevraagd voor "{name}".</p>
        <Link to="/pokedex" className="btn-back">← Terug naar Pokédex</Link>
      </div>
    );
  }

  const isFav = isFavorite(pokemon.name);
  const nickname = getPokemonNickname ? getPokemonNickname(pokemon.name) : '';

  const descriptionEntry = speciesInfo?.flavor_text_entries?.find(
    (entry) => entry.language.name === 'en'
  );
  const description = descriptionEntry
    ? descriptionEntry.flavor_text.replace(/[\n\f\r]/g, ' ')
    : '';

  const genusEntry = speciesInfo?.genera?.find(
    (g) => g.language.name === 'en'
  );
  const category = genusEntry ? genusEntry.genus : '';
  const generation = speciesInfo?.generation?.name
    ? speciesInfo.generation.name.replace('generation-', 'Gen ').toUpperCase()
    : '';

  const handleAddToTeam = () => {
    const targetTeamId = selectedTeamId || (teams[0] && teams[0].id);
    if (!targetTeamId) {
      alert('Maak eerst een team aan via de Teams-pagina!');
      return;
    }
    addPokemonToTeam(targetTeamId, {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites?.front_default,
      types: pokemon.types.map(t => t.type.name)
    });
    setMessage('Succesvol toegevoegd aan team!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="detail-page-container">
      <div className="detail-breadcrumbs">
        <Link to="/pokedex">Pokédex</Link>
        <span>/</span>
        <span className="current">{pokemon.name}</span>
      </div>

      <div className="detail corporate-dossier">
        <div className="dossier-header">
          <div className="dossier-badge">POKÉDEX #{pokemon.id}</div>
          <div className="header-actions">
            <button
              type="button"
              className={`fav-button-large ${isFav ? 'active' : ''}`}
              onClick={() => toggleFavorite(pokemon.name)}
            >
              {isFav ? '★ Favoriet' : '☆ Toevoegen aan Favorieten'}
            </button>
          </div>
        </div>

        <div className="dossier-grid">
          <div className="dossier-visual">
            <div className="sprite-showcase">
              <img
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="main-artwork"
              />
            </div>
            <h2 className="pokemon-title">
              {nickname ? `${nickname} (${pokemon.name})` : pokemon.name}
            </h2>
            {category && <p className="pokemon-species-type">{category}</p>}
            <div className="type-pill-row">
              {pokemon.types.map((t) => (
                <span key={t.type.name} className={`type-badge type-${t.type.name}`}>
                  {t.type.name}
                </span>
              ))}
            </div>

            <div className="assign-team-box">
              <label>Voeg toe aan team:</label>
              <div className="assign-controls">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.members.length}/6)
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleAddToTeam} className="btn-assign">
                  Toevoegen
                </button>
              </div>
              {message && <div className="success-banner">{message}</div>}
            </div>
          </div>

          <div className="dossier-stats">
            {description && (
              <>
                <h3 className="section-title">Pokédex Beschrijving</h3>
                <p className="pokemon-description">{description}</p>
              </>
            )}

            <h3 className="section-title">Pokémon Info</h3>
            <div className="specs-table">
              <div className="spec-row">
                <span className="spec-name">Lengte (Height)</span>
                <span className="spec-val">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Gewicht (Weight)</span>
                <span className="spec-val">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Basis XP</span>
                <span className="spec-val">{pokemon.base_experience || 'N/A'} XP</span>
              </div>
              <div className="spec-row">
                <span className="spec-name">Generatie</span>
                <span className="spec-val">{generation || `#${pokemon.id}`}</span>
              </div>
            </div>

            <h3 className="section-title">Abilities</h3>
            <div className="abilities-list">
              {pokemon.abilities.map((a) => (
                <span key={a.ability.name} className="ability-tag">
                  {a.ability.name.replace('-', ' ')}
                  {a.is_hidden && <small> (hidden)</small>}
                </span>
              ))}
            </div>

            <h3 className="section-title">Base Stats</h3>
            <div className="stats-bars">
              {pokemon.stats.map((s) => {
                const percentage = Math.min(100, Math.round((s.base_stat / 200) * 100));
                return (
                  <div key={s.stat.name} className="stat-metric">
                    <div className="metric-header">
                      <span className="metric-name">{s.stat.name.replace('-', ' ')}</span>
                      <span className="metric-value">{s.base_stat}</span>
                    </div>
                    <div className="metric-bar-bg">
                      <div
                        className="metric-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetail;

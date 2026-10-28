import { Link } from 'react-router-dom';
import { useTeams } from '../context/TeamContext';
import { useState } from 'react';
import './PokemonCard.css';

function PokemonCard({ name, image, types = [], id }) {
  const { teams, addPokemonToTeam, toggleFavorite, isFavorite } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const isFav = isFavorite(name);

  const handleAddToTeam = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      if (teams.length > 0) {
        addPokemonToTeam(teams[0].id, { id, name, image, types });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      } else {
        alert('Maak eerst een team aan op de Teams-pagina!');
      }
      return;
    }
    addPokemonToTeam(selectedTeamId, { id, name, image, types });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="card pokemon-card">
      <button
        type="button"
        className={`fav-btn ${isFav ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(name);
        }}
        title={isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
      >
        ★
      </button>

      <Link to={`/pokemon/${name}`} className="card-link">
        <div className="card-image-wrap">
          <img
            src={image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id || 1}.png`}
            alt={name}
            className="pokemon-sprite"
            loading="lazy"
          />
        </div>
        <h3 className="pokemon-name">{name}</h3>
      </Link>

      {types && types.length > 0 && (
        <div className="type-tags">
          {types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))}
        </div>
      )}

      <div className="card-actions">
        {teams.length > 1 && (
          <select
            className="team-select"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
          >
            <option value="">Kies team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.members.length}/6)
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={handleAddToTeam}
          className={`btn-add-team ${justAdded ? 'added' : ''}`}
        >
          {justAdded ? 'Toegevoegd!' : '+ Add to Team'}
        </button>
      </div>
    </div>
  );
}

export default PokemonCard;

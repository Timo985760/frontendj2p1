import { Link } from 'react-router-dom';
import './TeamSlot.css';

function TeamSlot({ member, slotIndex, onRemove }) {
  if (!member) {
    return (
      <div className="team-slot empty">
        <div className="empty-indicator">
          <span className="plus-sign">+</span>
          <span className="empty-text">SLOT {slotIndex + 1} (EMPTY)</span>
          <span className="empty-hint">Voeg toe vanuit Pokédex</span>
        </div>
      </div>
    );
  }

  return (
    <div className="team-slot filled">
      <button
        type="button"
        className="btn-slot-remove"
        onClick={() => onRemove(member.name)}
        title="Verwijder uit team"
      >
        ✕
      </button>

      <Link to={`/pokemon/${member.name}`} className="slot-link">
        <div className="slot-image-wrap">
          <img
            src={member.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.id || 1}.png`}
            alt={member.name}
            className="slot-sprite"
          />
        </div>
        <div className="slot-info">
          <span className="slot-number">#{slotIndex + 1}</span>
          <h4 className="slot-name">{member.name}</h4>
          {member.types && member.types.length > 0 && (
            <div className="slot-types">
              {member.types.map((t) => (
                <span key={t} className={`type-badge type-${t}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default TeamSlot;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './TeamSlot.css';

function TeamSlot({ member, slotIndex, onRemove, onRename }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [previousNickname, setPreviousNickname] = useState('');

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

  const startEditing = () => {
    const current = member.nickname || '';
    setPreviousNickname(current);
    setNicknameInput(current);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNicknameInput(val);
    if (onRename) {
      onRename(member.name, val, slotIndex);
    }
  };

  const handleSaveNickname = (e) => {
    e.preventDefault();
    if (onRename) {
      onRename(member.name, nicknameInput, slotIndex);
    }
    setIsEditing(false);
  };

  const handleCancelNickname = () => {
    if (onRename) {
      onRename(member.name, previousNickname, slotIndex);
    }
    setIsEditing(false);
  };

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

      <div className="slot-content">
        <Link to={`/pokemon/${member.name}`} className="slot-image-wrap">
          <img
            src={member.image}
            alt={member.name}
            className="slot-sprite"
          />
        </Link>

        <div className="slot-info">
          <span className="slot-number">#{slotIndex + 1}</span>

          {isEditing ? (
            <form onSubmit={handleSaveNickname} className="slot-rename-form">
              <input
                type="text"
                className="slot-rename-input"
                placeholder={member.name}
                value={nicknameInput}
                onChange={handleInputChange}
                autoFocus
              />
              <div className="slot-rename-actions">
                <button type="submit" className="btn-rename-save">
                  Opslaan
                </button>
                <button
                  type="button"
                  className="btn-rename-cancel"
                  onClick={handleCancelNickname}
                >
                  Annuleer
                </button>
              </div>
            </form>
          ) : (
            <div className="slot-name-row">
              <Link to={`/pokemon/${member.name}`} className="slot-name-link">
                <h4 className="slot-name">{member.nickname || member.name}</h4>
                {member.nickname && (
                  <span className="slot-species">({member.name})</span>
                )}
              </Link>
              <button
                type="button"
                className="btn-slot-rename"
                onClick={startEditing}
              >
                {member.nickname ? 'Wijzig naam' : 'Geef naam'}
              </button>
            </div>
          )}

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
      </div>
    </div>
  );
}

export default TeamSlot;

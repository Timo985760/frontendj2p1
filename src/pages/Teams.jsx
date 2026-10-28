import { useState } from 'react';
import { useTeams } from '../context/TeamContext';
import TeamSlot from '../components/TeamSlot';
import { Link } from 'react-router-dom';
import './Teams.css';

function Teams() {
  const { teams, addTeam, deleteTeam, removePokemonFromTeam, renamePokemonInTeam } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [newTeamName, setNewTeamName] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    addTeam(newTeamName);
    setNewTeamName('');
    setShowNewModal(false);
  };

  const currentTeamTypes = activeTeam
    ? Array.from(
        new Set(
          activeTeam.members.flatMap((m) => m.types || [])
        )
      )
    : [];

  return (
    <div className="teams-page-container">
      <div className="teams-layout">
        <aside className="teams-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Actieve Teams</h2>
            <button
              type="button"
              className="btn-new-team"
              onClick={() => setShowNewModal(true)}
            >
              + NEW TEAM
            </button>
          </div>

          <div className="team-list">
            {teams.length === 0 ? (
              <div className="empty-teams-message">Geen teams aangemaakt.</div>
            ) : (
              teams.map((team) => {
                const isSelected = activeTeam && activeTeam.id === team.id;
                return (
                  <div
                    key={team.id}
                    className={`team-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <div className="team-item-header">
                      <span className="team-item-name">{team.name}</span>
                      <span className="team-member-counter">
                        {team.members.length}/6
                      </span>
                    </div>
                    <div className="team-item-rating">
                      {'★'.repeat(Math.min(5, team.members.length))}
                      {'☆'.repeat(Math.max(0, 5 - team.members.length))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="team-detail-pane">
          {activeTeam ? (
            <>
              <div className="team-pane-header">
                <div className="team-title-wrap">
                  <h1 className="active-team-name">{activeTeam.name}</h1>
                  <span className="team-status-badge">
                    {activeTeam.members.length === 6 ? 'VOLLEDIG TEAM (6/6)' : `BEZETTING: ${activeTeam.members.length}/6`}
                  </span>
                </div>

                <div className="team-actions">
                  <button
                    type="button"
                    className="btn-delete-team"
                    onClick={() => {
                      if (confirm(`Weet je zeker dat je "${activeTeam.name}" wilt verwijderen?`)) {
                        deleteTeam(activeTeam.id);
                      }
                    }}
                  >
                    DELETE TEAM
                  </button>
                </div>
              </div>

              <div className="slots-grid">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TeamSlot
                    key={`${activeTeam.id}-${index}`}
                    slotIndex={index}
                    member={activeTeam.members[index]}
                    onRemove={(pokemonName) =>
                      removePokemonFromTeam(activeTeam.id, pokemonName)
                    }
                    onRename={(pokemonName, nickname, slotIdx) =>
                      renamePokemonInTeam(activeTeam.id, pokemonName, nickname, slotIdx)
                    }
                  />
                ))}
              </div>

              <div className="coverage-section">
                <h3 className="coverage-title">Team Type Dekking & Synergie:</h3>
                {currentTeamTypes.length === 0 ? (
                  <p className="no-types-hint">
                    Voeg Pokémon toe vanuit de <Link to="/pokedex">Pokédex</Link> om typesynergie te berekenen.
                  </p>
                ) : (
                  <div className="coverage-tags">
                    {currentTeamTypes.map((type) => (
                      <span key={type} className={`type-badge type-${type} large-badge`}>
                        {type.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-team-selected">
              <h3>Geen team geselecteerd</h3>
              <p>Maak een nieuw team aan via de knop "+ NEW TEAM" aan de linkerkant.</p>
            </div>
          )}
        </main>
      </div>

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Nieuw Bedrijfsteam Aanmaken</h3>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Teamnaam (bijv. Delta Squad of Sales Pokémons):</label>
                <input
                  type="text"
                  placeholder="Voer naam in..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewModal(false)}
                >
                  Annuleren
                </button>
                <button type="submit" className="btn-confirm">
                  Aanmaken
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;

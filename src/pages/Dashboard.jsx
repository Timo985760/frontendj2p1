import { useTeams } from '../context/TeamContext';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const { teams, favorites } = useTeams();

  const totalTeams = teams.length;
  const totalDeployedPokemon = teams.reduce((acc, t) => acc + t.members.length, 0);
  const maxCapacity = totalTeams * 6;
  const utilizationPercentage = maxCapacity > 0
    ? Math.round((totalDeployedPokemon / maxCapacity) * 100)
    : 0;

  const typeCounts = {};
  teams.forEach((t) => {
    t.members.forEach((m) => {
      (m.types || []).forEach((type) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });
  });

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="dashboard-banner">
        <div>
          <h1 className="dashboard-title">PokéCorp Executive Dashboard</h1>
          <p className="dashboard-subtitle">
            Overzicht van actieve personeelsteams, bezettingsgraad en synergie.
          </p>
        </div>
        <div className="quick-actions">
          <Link to="/teams" className="btn-dash-primary">+ Team Beheren</Link>
          <Link to="/pokedex" className="btn-dash-secondary">Personeel Werven (Pokédex)</Link>
        </div>
      </div>

      <div className="stat-cards-grid">
        <StatCard
          label="Actieve Teams"
          value={totalTeams}
          subtext="Bedrijfsteams geconfigureerd"
          trend="+1 deze week"
        />
        <StatCard
          label="Inzetbaar Personeel"
          value={totalDeployedPokemon}
          subtext="Pokémon geplaatst in teams"
          trend="Actief inzetbaar"
        />
        <StatCard
          label="Talent Pool (Favorieten)"
          value={favorites.length}
          subtext="Kandidaten op shortlist"
        />
        <StatCard
          label="Bezetting (Roster Utilization)"
          value={`${utilizationPercentage}%`}
          subtext={`${totalDeployedPokemon} van ${maxCapacity || 0} slots bezet`}
        />
      </div>

      <div className="dashboard-main-grid">
        <section className="dash-card teams-overview-card">
          <div className="card-header-clean">
            <h2 className="card-title">Team Roster Status</h2>
            <Link to="/teams" className="card-link-small">Alles bekijken →</Link>
          </div>

          <div className="teams-roster-list">
            {teams.length === 0 ? (
              <p className="empty-text">Geen actieve teams gevonden. Maak er een aan!</p>
            ) : (
              teams.map((team) => (
                <div key={team.id} className="team-roster-row">
                  <div className="team-info-group">
                    <span className="roster-team-name">{team.name}</span>
                    <span className="roster-team-count">{team.members.length} / 6 medewerkers</span>
                  </div>

                  <div className="slot-dots">
                    {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                      const member = team.members[slotIdx];
                      return (
                        <span
                          key={slotIdx}
                          className={`slot-dot ${member ? 'filled' : 'empty'}`}
                          title={member ? `${member.nickname ? `${member.nickname} (${member.name})` : member.name} (${member.types?.join(', ')})` : `Slot ${slotIdx + 1}: Leeg`}
                        ></span>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dash-card type-coverage-card">
          <div className="card-header-clean">
            <h2 className="card-title">Type Coverage Bar Chart</h2>
            <span className="coverage-sublabel">Synergie over alle teams</span>
          </div>

          <div className="chart-container">
            {topTypes.length === 0 ? (
              <p className="empty-text">Plaats Pokémon in je teams om het type-dekkingsdiagram te zien.</p>
            ) : (
              topTypes.map(([type, count]) => {
                const percentage = Math.round((count / Math.max(1, totalDeployedPokemon)) * 100);
                return (
                  <div key={type} className="bar-row">
                    <div className="bar-label-group">
                      <span className={`type-badge type-${type} mini-badge`}>{type}</span>
                      <span className="bar-count">{count}x ({percentage}%)</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className={`bar-fill type-${type}`}
                        style={{ width: `${Math.min(100, percentage * 1.5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

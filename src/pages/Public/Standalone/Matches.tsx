import React from 'react';
import { useParams } from 'react-router-dom';


const MatchesPerCourt: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);


  if (loading) return <div>Loading matches...</div>;

  return (
    <div className="matches-per-court">
      <h1>Matches for Court {courtId}</h1>
      {matches.length > 0 ? (
        <ul>
          {matches.map((match: any) => (
            <li key={match.id}>
              <div className="match-card">
                <h2>{match.name}</h2>
                <p>Date: {match.date}</p>
                <p>Status: {match.status}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches found for this court.</p>
      )}
    </div>
  );
};

export default MatchesPerCourt;
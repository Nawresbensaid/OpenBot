// src/components/levels/LevelsPage.jsx
import { useNavigate } from "react-router-dom";
import { LEVELS } from '../../data/levels';
import LevelCard from './LevelCard'; // ← import LevelCard

function LevelsPage() {
    const navigate = useNavigate(); // ← initialize navigate

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Fredoka One'", color: '#6cbefd', textAlign: 'center' }}>
                🗺️ Choisir un level
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                {LEVELS.map(level => (
                    <LevelCard
                        key={level.id}
                        level={level}
                        isActive={false}
                        onSelect={(l) => navigate(`/playground?level=${l.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}

export default LevelsPage; // ← add default export
"use client";
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { adminScoreGoal } from '@/lib/contract';
import { getAdminWallet } from '@/lib/particle';

export default function AdminPage() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState('');
  const [matchTime, setMatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ england: 0, argentina: 0 });
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [actionType, setActionType] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [englandLineup, setEnglandLineup] = useState([
    { id: 1, name: 'Harry Kane', position: 'FW', number: 9, points: 0 },
    { id: 2, name: 'Bukayo Saka', position: 'FW', number: 7, points: 0 },
    { id: 3, name: 'Phil Foden', position: 'MF', number: 11, points: 0 },
    { id: 4, name: 'Declan Rice', position: 'MF', number: 4, points: 0 },
    { id: 5, name: 'Jude Bellingham', position: 'MF', number: 22, points: 0 },
    { id: 6, name: 'Luke Shaw', position: 'DF', number: 3, points: 0 },
    { id: 7, name: 'John Stones', position: 'DF', number: 5, points: 0 },
    { id: 8, name: 'Kyle Walker', position: 'DF', number: 2, points: 0 },
    { id: 9, name: 'Jordan Pickford', position: 'GK', number: 1, points: 0 },
  ]);

  const [argentinaLineup, setArgentinaLineup] = useState([
    { id: 10, name: 'Lionel Messi', position: 'FW', number: 10, points: 0 },
    { id: 11, name: 'Lautaro Martínez', position: 'FW', number: 22, points: 0 },
    { id: 12, name: 'Julián Álvarez', position: 'FW', number: 9, points: 0 },
    { id: 13, name: 'Rodrigo De Paul', position: 'MF', number: 7, points: 0 },
    { id: 14, name: 'Enzo Fernández', position: 'MF', number: 24, points: 0 },
    { id: 15, name: 'Nicolás Tagliafico', position: 'DF', number: 3, points: 0 },
    { id: 16, name: 'Cristian Romero', position: 'DF', number: 13, points: 0 },
    { id: 17, name: 'Nahuel Molina', position: 'DF', number: 26, points: 0 },
    { id: 18, name: 'Emiliano Martínez', position: 'GK', number: 23, points: 0 },
  ]);

  const actionTypes = [
    { value: 'goal', label: '⚽ Goal', points: 10 },
    { value: 'assist', label: '🎯 Assist', points: 7 },
    { value: 'yellow', label: '🟨 Yellow Card', points: -2 },
    { value: 'red', label: '🟥 Red Card', points: -5 },
    { value: 'save', label: '🧤 Save', points: 3 },
    { value: 'shot', label: '🎯 Shot on Target', points: 2 },
  ];

  // Clock progression at 5x speed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && matchTime < 90) {
      interval = setInterval(() => {
        setMatchTime(prev => Math.min(prev + 1, 90));
      }, 300);
    } else if (matchTime >= 90) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, matchTime]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const resetMatch = () => {
    setMatchTime(0);
    setIsPlaying(false);
    setScore({ england: 0, argentina: 0 });
    setEvents([]);
    setEnglandLineup(prev => prev.map(p => ({ ...p, points: 0 })));
    setArgentinaLineup(prev => prev.map(p => ({ ...p, points: 0 })));
  };

  const updatePlayerPoints = (playerId: number, team: string, delta: number) => {
    if (team === 'england') {
      setEnglandLineup(prev => 
        prev.map(p => p.id === playerId ? { ...p, points: Math.max(0, p.points + delta) } : p)
      );
    } else {
      setArgentinaLineup(prev => 
        prev.map(p => p.id === playerId ? { ...p, points: Math.max(0, p.points + delta) } : p)
      );
    }
  };

  const applyAction = async () => {
    if (!selectedPlayer || !actionType) return;

    const action = actionTypes.find(a => a.value === actionType);
    if (!action) return;

    const player = [...englandLineup, ...argentinaLineup].find(p => p.id === selectedPlayer);
    if (!player) return;

    const team = englandLineup.find(p => p.id === selectedPlayer) ? 'england' : 'argentina';

    // Update points
    updatePlayerPoints(selectedPlayer, team, action.points);

    // Update score and submit to blockchain if goal
    if (actionType === 'goal') {
      setScore(prev => ({
        ...prev,
        [team]: prev[team] + 1
      }));

      // Submit goal to blockchain
      setIsSubmitting(true);
      try {
        const wallet = getAdminWallet();
        const teamName = team === 'england' ? 'England' : 'Argentina';
        const txHash = await adminScoreGoal(wallet, teamName as 'England' | 'Argentina');
        console.log(`⚽ Goal submitted to blockchain: ${txHash}`);
      } catch (error) {
        console.error('Failed to submit goal to blockchain:', error);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Add event
    setEvents(prev => [{
      time: matchTime,
      player: player.name,
      team,
      action: action.label,
      points: action.points
    }, ...prev].slice(0, 10));

    setSelectedPlayer(null);
    setActionType('');
  };

  const PlayerCard = ({ player, team, isSelected }: any) => (
    <div 
      onClick={() => setSelectedPlayer(player.id)}
      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-sm">{player.name}</div>
          <div className="text-xs text-gray-500">{player.position} #{player.number}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); updatePlayerPoints(player.id, team, -1); }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minus size={12} />
          </button>
          <span className="font-bold text-lg px-2">{player.points}</span>
          <button
            onClick={(e) => { e.stopPropagation(); updatePlayerPoints(player.id, team, 1); }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  if (!ok) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-sm w-full space-y-3 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
          <input 
            value={pw} 
            onChange={(e) => setPw(e.target.value)} 
            placeholder="Password" 
            type="password"
            className="border px-3 py-2 rounded w-full" 
            onKeyPress={(e) => e.key === 'Enter' && setOk(pw === 'hack2025')}
          />
          <button 
            className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800" 
            onClick={() => setOk(pw === 'hack2025')}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-4">
            OmniTip: England vs Argentina - Admin Control
          </h1>
          
          {/* Score */}
          <div className="text-center text-5xl font-bold mb-4">
            <span className="text-blue-600">England {score.england}</span>
            <span className="mx-4">-</span>
            <span className="text-sky-400">{score.argentina} Argentina</span>
          </div>

          {/* Match Clock */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button onClick={togglePlay} className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="text-4xl font-bold">
              {matchTime}&apos;
            </div>
            <button onClick={resetMatch} className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              <RotateCcw size={24} />
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Running at 5x speed • {isPlaying ? 'Match in progress' : matchTime >= 90 ? 'Match ended' : 'Match paused'}
          </div>
        </div>

        {/* Action Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Action Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Selected Player</label>
              <input 
                type="text" 
                value={selectedPlayer ? [...englandLineup, ...argentinaLineup].find(p => p.id === selectedPlayer)?.name : ''}
                readOnly
                placeholder="Click a player card below"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Action Type</label>
              <select 
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select action...</option>
                {actionTypes.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label} ({action.points > 0 ? '+' : ''}{action.points} pts)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyAction}
                disabled={!selectedPlayer || !actionType || isSubmitting}
                className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Submitting...' : 'Apply Action'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* England Lineup */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-600">England Lineup</h2>
            <div className="space-y-2">
              {englandLineup.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  team="england"
                  isSelected={selectedPlayer === player.id}
                />
              ))}
            </div>
          </div>

          {/* Events Feed */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Live Events</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No events yet</div>
              ) : (
                events.map((event, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4" style={{
                    borderLeftColor: event.team === 'england' ? '#2563eb' : '#38bdf8'
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">{event.player}</div>
                        <div className="text-xs text-gray-600">{event.action}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{event.time}&apos;</div>
                        <div className={`text-sm font-bold ${event.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {event.points > 0 ? '+' : ''}{event.points}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Argentina Lineup */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-sky-400">Argentina Lineup</h2>
            <div className="space-y-2">
              {argentinaLineup.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  team="argentina"
                  isSelected={selectedPlayer === player.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Users, Play, Trophy, RotateCcw, Plus, Trash2 } from "lucide-react";

const App = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: "Mark", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 2, name: "Charles", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 3, name: "Mau", skill: 2, timesPlayed: 0, recentOpponents: [] },
    { id: 4, name: "Kevin", skill: 1, timesPlayed: 0, recentOpponents: [] },
    { id: 5, name: "Faith", skill: 1, timesPlayed: 0, recentOpponents: [] },
    { id: 6, name: "Matthew", skill: 2, timesPlayed: 0, recentOpponents: [] },
    { id: 7, name: "Aaron", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 8, name: "Camille", skill: 2, timesPlayed: 0, recentOpponents: [] },
    { id: 9, name: "Sugar", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 10, name: "Raizza", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 11, name: "Danika", skill: 1, timesPlayed: 0, recentOpponents: [] },
    { id: 12, name: "Carla", skill: 2, timesPlayed: 0, recentOpponents: [] },
    { id: 13, name: "Allen", skill: 3, timesPlayed: 0, recentOpponents: [] },
    { id: 14, name: "Corinne", skill: 3, timesPlayed: 0, recentOpponents: [] },
  ]);

  const [matches, setMatches] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: "", skill: 5 });
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Calculate weight for fair distribution (inverse of times played)
  const calculateWeight = (timesPlayed) => {
    return 1 / (timesPlayed + 1);
  };

  // Check if two players can be matched
  const canMatch = (player1, player2) => {
    // Don't match player with themselves
    if (player1.id === player2.id) return false;

    // Check skill level compatibility (within 2 levels)
    const skillDiff = Math.abs(player1.skill - player2.skill);
    if (skillDiff > 2) return false;

    // Check if they've played recently (last 2 opponents)
    if (
      player1.recentOpponents.includes(player2.id) ||
      player2.recentOpponents.includes(player1.id)
    )
      return false;

    return true;
  };

  // Weighted random selection
  const weightedRandomSelect = (availablePlayers) => {
    const totalWeight = availablePlayers.reduce(
      (sum, player) => sum + calculateWeight(player.timesPlayed),
      0
    );

    let random = Math.random() * totalWeight;

    for (let player of availablePlayers) {
      random -= calculateWeight(player.timesPlayed);
      if (random <= 0) return player;
    }

    return availablePlayers[availablePlayers.length - 1];
  };

  // Generate a fair match
  const generateMatch = () => {
    const availablePlayers = players.filter((p) => p.name.trim() !== "");

    if (availablePlayers.length < 2) {
      alert("Need at least 2 players to generate a match!");
      return;
    }

    // Select first player using weighted random
    const player1 = weightedRandomSelect(availablePlayers);

    // Find compatible opponents for player1
    const compatibleOpponents = availablePlayers.filter((p) =>
      canMatch(player1, p)
    );

    if (compatibleOpponents.length === 0) {
      alert("No compatible opponents found! Try resetting recent opponents.");
      return;
    }

    // Select second player from compatible opponents using weighted random
    const player2 = weightedRandomSelect(compatibleOpponents);

    // Create match
    const newMatch = {
      id: matches.length + 1,
      player1: player1.name,
      player2: player2.name,
      skillDiff: Math.abs(player1.skill - player2.skill),
      timestamp: new Date().toLocaleTimeString(),
      completed: false,
    };

    setMatches([...matches, newMatch]);
  };

  // Complete a match and update player stats
  const completeMatch = (matchId, winner) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    // Update players' times played and recent opponents
    const updatedPlayers = players.map((player) => {
      if (player.name === match.player1) {
        return {
          ...player,
          timesPlayed: player.timesPlayed + 1,
          recentOpponents: [
            ...player.recentOpponents.filter(
              (id) => players.find((p) => p.id === id)?.name !== match.player2
            ),
            players.find((p) => p.name === match.player2)?.id,
          ].slice(-2), // Keep only last 2 opponents
        };
      }
      if (player.name === match.player2) {
        return {
          ...player,
          timesPlayed: player.timesPlayed + 1,
          recentOpponents: [
            ...player.recentOpponents.filter(
              (id) => players.find((p) => p.id === id)?.name !== match.player1
            ),
            players.find((p) => p.name === match.player1)?.id,
          ].slice(-2), // Keep only last 2 opponents
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);

    // Mark match as completed
    const updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, completed: true, winner } : m
    );
    setMatches(updatedMatches);
  };

  // Add new player
  const addPlayer = () => {
    if (!newPlayer.name.trim()) return;

    const player = {
      id: players.length + 1,
      name: newPlayer.name,
      skill: parseInt(newPlayer.skill),
      timesPlayed: 0,
      recentOpponents: [],
    };

    setPlayers([...players, player]);
    setNewPlayer({ name: "", skill: 5 });
    setShowAddPlayer(false);
  };

  // Remove player
  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  // Reset all recent opponents
  const resetRecentOpponents = () => {
    const updatedPlayers = players.map((player) => ({
      ...player,
      recentOpponents: [],
    }));
    setPlayers(updatedPlayers);
  };

  // Clear all matches
  const clearMatches = () => {
    setMatches([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-500" />
            Badminton Match Maker
          </h1>
          <p className="text-gray-600">
            Fair matches based on skill level and play frequency
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={generateMatch}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Play size={20} />
              Generate Match
            </button>

            <button
              onClick={() => setShowAddPlayer(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Player
            </button>

            <button
              onClick={resetRecentOpponents}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={20} />
              Reset Recent Opponents
            </button>

            <button
              onClick={clearMatches}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={20} />
              Clear Matches
            </button>
          </div>
        </div>

        {/* Add Player Modal */}
        {showAddPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Player</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, name: e.target.value })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter player name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Skill Level (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPlayer.skill}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, skill: e.target.value })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addPlayer}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex-1"
                  >
                    Add Player
                  </button>
                  <button
                    onClick={() => setShowAddPlayer(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Players List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="text-blue-500" />
              Players ({players.length})
            </h2>
            <div className="space-y-3">
              {players.map((player) => {
                const weight = calculateWeight(player.timesPlayed);
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Skill: {player.skill}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          Played: {player.timesPlayed}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Selection Weight: {(weight * 100).toFixed(1)}%
                      </div>
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matches */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Generated Matches ({matches.length})
            </h2>
            <div className="space-y-3">
              {matches
                .slice(-10)
                .reverse()
                .map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border-2 ${
                      match.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {match.player1} vs {match.player2}
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.timestamp}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Skill Difference: {match.skillDiff}
                    </div>

                    {!match.completed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeMatch(match.id, match.player1)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          {match.player1} Won
                        </button>
                        <button
                          onClick={() => completeMatch(match.id, match.player2)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          {match.player2} Won
                        </button>
                      </div>
                    )}

                    {match.completed && (
                      <div className="text-sm text-green-600 font-medium">
                        Winner: {match.winner}
                      </div>
                    )}
                  </div>
                ))}

              {matches.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No matches generated yet. Click "Generate Match" to start!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {players.reduce((sum, p) => sum + p.timesPlayed, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Games Played</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {matches.filter((m) => m.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completed Matches</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {players.length > 0
                  ? (
                      players.reduce((sum, p) => sum + p.timesPlayed, 0) /
                      players.length
                    ).toFixed(1)
                  : "0"}
              </div>
              <div className="text-sm text-gray-600">
                Average Games per Player
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

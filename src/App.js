import React, { useState } from "react";
import { Users, Play, Trophy, RotateCcw, Plus, Trash2 } from "lucide-react";

const App = () => {
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "Mark",
      skill: 5,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 2,
      name: "Charles",
      skill: 6,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 3,
      name: "Mau",
      skill: 2,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 4,
      name: "Kelvin",
      skill: 4,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 5,
      name: "JM",
      skill: 7,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 6,
      name: "Hanzel",
      skill: 6,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 7,
      name: "Corinne",
      skill: 4,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 8,
      name: "Riana",
      skill: 6,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 9,
      name: "Aaron",
      skill: 5,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 10,
      name: "Korby",
      skill: 5,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 11,
      name: "Faith",
      skill: 1,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
    {
      id: 12,
      name: "Jershy",
      skill: 4,
      timesPlayed: 0,
      recentTeammates: [],
      recentOpponents: [],
    },
  ]);

  const [matches, setMatches] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: "", skill: 5 });
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Calculate weight for fair distribution (inverse of times played)
  const calculateWeight = (timesPlayed, minTimesPlayed) => {
    // The player(s) with minTimesPlayed get weight 1 (100%)
    // Others get weight halved for each extra game played beyond minTimesPlayed
    return Math.pow(0.5, timesPlayed - minTimesPlayed);
  };

  // Calculate team skill average
  const getTeamSkill = (player1, player2) => {
    return (player1.skill + player2.skill) / 2;
  };

  // Check if two players can be teammates
  const canBeTeammates = (player1, player2) => {
    // Don't team with themselves
    if (player1.id === player2.id) return false;

    // Check if they've been teammates recently (last 2 teammates)
    if (
      player1.recentTeammates.includes(player2.id) ||
      player2.recentTeammates.includes(player1.id)
    )
      return false;

    return true;
  };

  // Check if two teams can play against each other
  const canTeamsPlay = (team1, team2) => {
    // Check skill level compatibility (team averages within 1.5 levels)
    const team1Skill = getTeamSkill(team1.player1, team1.player2);
    const team2Skill = getTeamSkill(team2.player1, team2.player2);
    const skillDiff = Math.abs(team1Skill - team2Skill);
    if (skillDiff >= 2) return false;

    // Check if any player has played against any player from the other team recently
    const team1Players = [team1.player1, team1.player2];
    const team2Players = [team2.player1, team2.player2];

    for (let p1 of team1Players) {
      for (let p2 of team2Players) {
        if (
          p1.recentOpponents.includes(p2.id) ||
          p2.recentOpponents.includes(p1.id)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const getPlayersCurrentlyPlaying = () => {
    const ongoingMatches = matches.filter((m) => !m.completed);
    const playingPlayerNames = new Set();

    ongoingMatches.forEach((match) => {
      playingPlayerNames.add(match.team1.player1);
      playingPlayerNames.add(match.team1.player2);
      playingPlayerNames.add(match.team2.player1);
      playingPlayerNames.add(match.team2.player2);
    });

    const playingPlayerIds = players
      .filter((p) => playingPlayerNames.has(p.name))
      .map((p) => p.id);

    return new Set(playingPlayerIds);
  };

  // Generate all possible teams
  const generatePossibleTeams = (availablePlayers) => {
    const teams = [];
    const minTimesPlayed = Math.min(
      ...availablePlayers.map((p) => p.timesPlayed)
    );

    for (let i = 0; i < availablePlayers.length; i++) {
      for (let j = i + 1; j < availablePlayers.length; j++) {
        const player1 = availablePlayers[i];
        const player2 = availablePlayers[j];

        if (Math.abs(player1.timesPlayed - player2.timesPlayed) > 2) continue;

        if (canBeTeammates(player1, player2)) {
          const weight1 = calculateWeight(player1.timesPlayed, minTimesPlayed);
          const weight2 = calculateWeight(player2.timesPlayed, minTimesPlayed);

          teams.push({
            player1,
            player2,
            skill: getTeamSkill(player1, player2),
            weight: weight1 + weight2,
          });
        }
      }
    }
    return teams;
  };

  // Generate a fair 2v2 match
  const generateMatch = () => {
    const playingPlayerIds = getPlayersCurrentlyPlaying();

    const maxTimesPlayed = Math.max(...players.map((p) => p.timesPlayed));

    let availablePlayers;

    if (maxTimesPlayed === 0) {
      // All players have 0 timesPlayed, so do NOT exclude any player
      availablePlayers = players
        .filter((p) => p.name.trim() !== "" && !playingPlayerIds.has(p.id))
        .sort((a, b) => a.timesPlayed - b.timesPlayed);
    } else {
      // Exclude all players who have max times played
      availablePlayers = players
        .filter(
          (p) =>
            p.name.trim() !== "" &&
            !playingPlayerIds.has(p.id) &&
            p.timesPlayed < maxTimesPlayed
        )
        .sort((a, b) => a.timesPlayed - b.timesPlayed);

      // If fewer than 4 players after exclusion, fall back to including all available players
      if (availablePlayers.length < 4) {
        availablePlayers = players
          .filter((p) => p.name.trim() !== "" && !playingPlayerIds.has(p.id))
          .sort((a, b) => a.timesPlayed - b.timesPlayed);
      }
    }

    if (availablePlayers.length < 4) {
      alert("Need at least 4 available players to generate a 2v2 match!");
      return;
    }

    const minTimesPlayed = Math.min(
      ...availablePlayers.map((p) => p.timesPlayed)
    );
    const mustIncludePlayers = availablePlayers.filter(
      (p) => p.timesPlayed === minTimesPlayed
    );

    const possibleTeams = generatePossibleTeams(availablePlayers);

    if (possibleTeams.length < 2) {
      alert(
        "Not enough valid team combinations! Try resetting recent teammates/opponents."
      );
      return;
    }

    let team1 = null;
    let team2 = null;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts && (!team1 || !team2)) {
      const filteredTeamsForTeam1 = possibleTeams.filter((team) =>
        mustIncludePlayers.some(
          (p) => p.id === team.player1.id || p.id === team.player2.id
        )
      );

      if (filteredTeamsForTeam1.length === 0) {
        alert(
          "Cannot find teams including players with least times played. Try resetting recent teammates/opponents."
        );
        return;
      }

      const totalWeight = filteredTeamsForTeam1.reduce(
        (sum, team) => sum + team.weight,
        0
      );

      let random = Math.random() * totalWeight;
      for (let team of filteredTeamsForTeam1) {
        random -= team.weight;
        if (random <= 0) {
          team1 = team;
          break;
        }
      }

      const compatibleTeams = possibleTeams.filter((team) => {
        const team1PlayerIds = [team1.player1.id, team1.player2.id];
        const team2PlayerIds = [team.player1.id, team.player2.id];
        const hasSharedPlayers = team1PlayerIds.some((id) =>
          team2PlayerIds.includes(id)
        );

        return !hasSharedPlayers && canTeamsPlay(team1, team);
      });

      if (compatibleTeams.length > 0) {
        const team2Index = Math.floor(Math.random() * compatibleTeams.length);
        team2 = compatibleTeams[team2Index];
        break;
      }

      attempts++;
    }

    if (!team1 || !team2) {
      alert(
        "Could not find compatible teams! Try resetting recent teammates/opponents."
      );
      return;
    }

    const newMatch = {
      id: matches.length + 1,
      team1: {
        player1: team1.player1.name,
        player2: team1.player2.name,
        skill: team1.skill,
      },
      team2: {
        player1: team2.player1.name,
        player2: team2.player2.name,
        skill: team2.skill,
      },
      skillDiff: Math.abs(team1.skill - team2.skill),
      timestamp: new Date().toLocaleTimeString(),
      completed: false,
    };

    setMatches([...matches, newMatch]);
  };

  // Complete a match and update player stats
  const completeMatch = (matchId, winningTeam) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const allMatchPlayers = [
      match.team1.player1,
      match.team1.player2,
      match.team2.player1,
      match.team2.player2,
    ];

    // Update players' times played, recent teammates, and recent opponents
    const updatedPlayers = players.map((player) => {
      if (allMatchPlayers.includes(player.name)) {
        let newRecentTeammates = [...player.recentTeammates];
        let newRecentOpponents = [...player.recentOpponents];

        // Update teammates
        if (match.team1.player1 === player.name) {
          const teammateId = players.find(
            (p) => p.name === match.team1.player2
          )?.id;
          if (teammateId) {
            newRecentTeammates = [
              ...newRecentTeammates.filter((id) => id !== teammateId),
              teammateId,
            ].slice(-2);
          }
          // Update opponents
          const opponent1Id = players.find(
            (p) => p.name === match.team2.player1
          )?.id;
          const opponent2Id = players.find(
            (p) => p.name === match.team2.player2
          )?.id;
          if (opponent1Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent1Id),
              opponent1Id,
            ];
          if (opponent2Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent2Id),
              opponent2Id,
            ];
        } else if (match.team1.player2 === player.name) {
          const teammateId = players.find(
            (p) => p.name === match.team1.player1
          )?.id;
          if (teammateId) {
            newRecentTeammates = [
              ...newRecentTeammates.filter((id) => id !== teammateId),
              teammateId,
            ].slice(-2);
          }
          // Update opponents
          const opponent1Id = players.find(
            (p) => p.name === match.team2.player1
          )?.id;
          const opponent2Id = players.find(
            (p) => p.name === match.team2.player2
          )?.id;
          if (opponent1Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent1Id),
              opponent1Id,
            ];
          if (opponent2Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent2Id),
              opponent2Id,
            ];
        } else if (match.team2.player1 === player.name) {
          const teammateId = players.find(
            (p) => p.name === match.team2.player2
          )?.id;
          if (teammateId) {
            newRecentTeammates = [
              ...newRecentTeammates.filter((id) => id !== teammateId),
              teammateId,
            ].slice(-2);
          }
          // Update opponents
          const opponent1Id = players.find(
            (p) => p.name === match.team1.player1
          )?.id;
          const opponent2Id = players.find(
            (p) => p.name === match.team1.player2
          )?.id;
          if (opponent1Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent1Id),
              opponent1Id,
            ];
          if (opponent2Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent2Id),
              opponent2Id,
            ];
        } else if (match.team2.player2 === player.name) {
          const teammateId = players.find(
            (p) => p.name === match.team2.player1
          )?.id;
          if (teammateId) {
            newRecentTeammates = [
              ...newRecentTeammates.filter((id) => id !== teammateId),
              teammateId,
            ].slice(-2);
          }
          // Update opponents
          const opponent1Id = players.find(
            (p) => p.name === match.team1.player1
          )?.id;
          const opponent2Id = players.find(
            (p) => p.name === match.team1.player2
          )?.id;
          if (opponent1Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent1Id),
              opponent1Id,
            ];
          if (opponent2Id)
            newRecentOpponents = [
              ...newRecentOpponents.filter((id) => id !== opponent2Id),
              opponent2Id,
            ];
        }

        return {
          ...player,
          timesPlayed: player.timesPlayed + 1,
          recentTeammates: newRecentTeammates.slice(-2),
          recentOpponents: newRecentOpponents.slice(-3), // Keep last 3 opponents
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);

    // Mark match as completed
    const updatedMatches = matches.map((m) =>
      m.id === matchId ? { ...m, completed: true, winner: winningTeam } : m
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
      recentTeammates: [],
      recentOpponents: [],
    };

    setPlayers([...players, player]);
    setNewPlayer({ name: "", skill: 5 });
    setShowAddPlayer(false);
  };

  // Reset all recent teammates and opponents
  const resetRecentOpponents = () => {
    const updatedPlayers = players.map((player) => ({
      ...player,
      recentTeammates: [],
      recentOpponents: [],
    }));
    setPlayers(updatedPlayers);
  };

  // Remove player
  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  // Clear all matches
  const clearMatches = () => {
    setMatches([]);
  };

  const updateTimesPlayed = (id, newTimesPlayed) => {
    const updatedPlayers = players.map((player) => {
      if (player.id === id) {
        return {
          ...player,
          timesPlayed: Math.max(0, parseInt(newTimesPlayed) || 0), // Ensures non-negative integer
        };
      }
      return player;
    });
    setPlayers(updatedPlayers);
  };

  const updateSkill = (id, newSkill) => {
    const updatedPlayers = players.map((player) => {
      if (player.id === id) {
        let skillNum = parseInt(newSkill);
        if (isNaN(skillNum)) skillNum = player.skill;
        skillNum = Math.min(Math.max(skillNum, 1), 8); // Clamp between 1 to 8
        return {
          ...player,
          skill: skillNum,
        };
      }
      return player;
    });
    setPlayers(updatedPlayers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Trophy className="text-yellow-500" />
            2v2 Badminton Match Maker
          </h1>
          <p className="text-gray-600">
            Fair team matches based on skill level and play frequency
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
              Generate 2v2 Match
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
              Reset Recent History
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
                    Skill Level (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
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
                const minTimesPlayed = Math.min(
                  ...players.map((p) => p.timesPlayed)
                );
                const weight = calculateWeight(
                  player.timesPlayed,
                  minTimesPlayed
                );
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{player.name}</span>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={player.skill}
                          onChange={(e) =>
                            updateSkill(player.id, e.target.value)
                          }
                          className="w-16 p-1 text-center bg-blue-50 border border-blue-300 rounded text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />

                        <label className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                          Played:
                          <button
                            onClick={() =>
                              updateTimesPlayed(
                                player.id,
                                player.timesPlayed - 1
                              )
                            }
                            className="bg-green-300 hover:bg-green-400 text-green-900 px-1 rounded select-none"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="w-16 bg-green-50 border border-green-300 rounded px-1 text-center text-green-800 focus:outline-none focus:ring-1 focus:ring-green-400"
                            value={player.timesPlayed}
                            onChange={(e) =>
                              updateTimesPlayed(player.id, e.target.value)
                            }
                          />
                          <button
                            onClick={() =>
                              updateTimesPlayed(
                                player.id,
                                player.timesPlayed + 1
                              )
                            }
                            className="bg-green-300 hover:bg-green-400 text-green-900 px-1 rounded select-none"
                          >
                            +
                          </button>
                        </label>
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
                      <div className="font-medium text-sm">
                        <div className="mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Team 1 (Avg: {match.team1.skill.toFixed(1)})
                          </span>
                          <span className="ml-2">
                            {match.team1.player1} & {match.team1.player2}
                          </span>
                        </div>
                        <div className="text-center text-gray-500 text-xs">
                          VS
                        </div>
                        <div className="mt-1">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            Team 2 (Avg: {match.team2.skill.toFixed(1)})
                          </span>
                          <span className="ml-2">
                            {match.team2.player1} & {match.team2.player2}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {match.timestamp}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Team Difference: {match.skillDiff.toFixed(1)}
                    </div>

                    {!match.completed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeMatch(match.id, "team1")}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Team 1 Won
                        </button>
                        <button
                          onClick={() => completeMatch(match.id, "team2")}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Team 2 Won
                        </button>
                      </div>
                    )}

                    {match.completed && (
                      <div className="text-sm text-green-600 font-medium">
                        Winner: {match.winner === "team1" ? "Team 1" : "Team 2"}
                      </div>
                    )}
                  </div>
                ))}

              {matches.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No matches generated yet. Click "Generate 2v2 Match" to start!
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

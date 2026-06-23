class BracketGenerator {
  static generate(teams, type) {
    switch (type) {
      case 'single_elimination':
        return this.singleElimination(teams);
      case 'double_elimination':
        return this.doubleElimination(teams);
      case 'round_robin':
        return this.roundRobin(teams);
      case 'swiss':
        return this.swissSystem(teams);
      case 'group_stage':
        return this.groupStage(teams);
      default:
        return this.singleElimination(teams);
    }
  }

  static singleElimination(teams) {
    const numTeams = teams.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const bracketSize = Math.pow(2, numRounds);
    const byes = bracketSize - numTeams;

    const matches = [];
    const seeded = [...teams].sort((a, b) => (a.seed || 0) - (b.seed || 0));

    let roundMatches = [];
    let idx = 0;
    for (let i = 0; i < bracketSize / 2; i++) {
      const t1 = seeded[idx] || null;
      const t2 = seeded[bracketSize - 1 - idx] || null;
      roundMatches.push({ team1: t1, team2: t2 });
      idx++;
    }

    const round1 = roundMatches.map((m, i) => ({
      round: 1,
      bracketPosition: `R1-M${i + 1}`,
      team1: m.team1 ? m.team1._id : null,
      team2: m.team2 ? m.team2._id : null,
      status: m.team1 && m.team2 ? 'scheduled' : 'walkover'
    }));
    matches.push(...round1);

    for (let r = 1; r < numRounds; r++) {
      const numMatches = Math.pow(2, numRounds - r - 1);
      for (let i = 0; i < numMatches; i++) {
        const prevMatchIdx1 = (r - 1) * Math.pow(2, numRounds - r) + i * 2;
        const prevMatchIdx2 = prevMatchIdx1 + 1;
        const match = {
          round: r + 1,
          bracketPosition: `R${r + 1}-M${i + 1}`,
          team1: null,
          team2: null,
          nextMatchId: null,
          status: 'scheduled'
        };
        match.nextMatchId = `R${r + 1}-M${i + 1}`;
        if (matches[prevMatchIdx1]) matches[prevMatchIdx1].nextMatchId = match.nextMatchId;
        if (matches[prevMatchIdx2]) matches[prevMatchIdx2].nextMatchId = match.nextMatchId;
        matches.push(match);
      }
    }

    return { matches, rounds: numRounds, bracketSize };
  }

  static doubleElimination(teams) {
    const numTeams = teams.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const bracketSize = Math.pow(2, numRounds);
    const winners = this.singleElimination(teams);

    const losers = [];
    const numLoserRounds = numRounds;
    for (let r = 0; r < numLoserRounds; r++) {
      const numLoserMatches = Math.pow(2, numRounds - r - 1);
      for (let i = 0; i < numLoserMatches; i++) {
        losers.push({
          round: r + 1,
          bracketPosition: `L-R${r + 1}-M${i + 1}`,
          team1: null,
          team2: null,
          status: 'scheduled',
          isLoserBracket: true
        });
      }
    }

    const grandFinal = {
      round: numRounds + 1,
      bracketPosition: 'GF',
      team1: null,
      team2: null,
      status: 'scheduled',
      isGrandFinal: true
    };

    return {
      matches: [...winners.matches, ...losers, grandFinal],
      rounds: numRounds + 1,
      bracketSize
    };
  }

  static roundRobin(teams) {
    const matches = [];
    const n = teams.length;
    const ids = teams.map(t => t._id);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        matches.push({
          round: 1,
          bracketPosition: `RR-${i + 1}-${j + 1}`,
          team1: ids[i],
          team2: ids[j],
          status: 'scheduled'
        });
      }
    }

    const matchesPerRound = Math.floor(n / 2);
    const totalRounds = n - 1;
    const scheduled = [];
    for (let r = 0; r < totalRounds; r++) {
      for (let m = 0; m < matchesPerRound; m++) {
        const idx = r * matchesPerRound + m;
        if (idx < matches.length) {
          scheduled.push({ ...matches[idx], round: r + 1 });
        }
      }
    }

    return { matches: scheduled.length ? scheduled : matches, rounds: totalRounds, bracketSize: n };
  }

  static swissSystem(teams) {
    const numRounds = Math.ceil(Math.log2(teams.length)) + 1;
    const pairs = [];
    const sorted = [...teams].sort((a, b) => (b.points || 0) - (a.points || 0));
    const ids = sorted.map(t => t._id);

    for (let i = 0; i < ids.length; i += 2) {
      if (i + 1 < ids.length) {
        pairs.push({
          round: 1,
          bracketPosition: `SW-R1-M${(i / 2) + 1}`,
          team1: ids[i],
          team2: ids[i + 1],
          status: 'scheduled'
        });
      }
    }

    return {
      matches: pairs,
      rounds: numRounds,
      bracketSize: teams.length,
      isSwiss: true
    };
  }

  static groupStage(teams) {
    const numGroups = Math.min(4, Math.floor(teams.length / 2));
    const teamsPerGroup = Math.ceil(teams.length / numGroups);
    const groups = [];

    const shuffled = [...teams].sort((a, b) => (a.seed || 0) - (b.seed || 0));

    for (let g = 0; g < numGroups; g++) {
      const groupTeams = shuffled.slice(g * teamsPerGroup, (g + 1) * teamsPerGroup);
      const groupMatches = this.roundRobin(groupTeams);
      groups.push({
        name: String.fromCharCode(65 + g),
        teams: groupTeams.map(t => t._id),
        matches: groupMatches.matches.map(m => ({
          ...m,
          bracketPosition: `G${String.fromCharCode(65 + g)}-${m.bracketPosition}`
        }))
      });
    }

    const allMatches = groups.flatMap(g => g.matches);

    const knockoutSize = Math.pow(2, Math.ceil(Math.log2(numGroups * 2)));
    const knockoutTeams = [];
    groups.forEach(g => {
      knockoutTeams.push(...g.teams.slice(0, 2));
    });
    const knockout = this.singleElimination(
      knockoutTeams.map(id => ({ _id: id, seed: 0 }))
    );

    return {
      matches: [...allMatches, ...knockout.matches],
      rounds: Math.max(...groups.map(g => g.matches.length > 0 ? Math.max(...g.matches.map(m => m.round)) : 0)) + (knockout.rounds || 0),
      bracketSize: teams.length,
      groups
    };
  }
}

module.exports = BracketGenerator;

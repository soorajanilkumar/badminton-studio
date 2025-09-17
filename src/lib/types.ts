export interface Player {
  id: string;
  name: string;
  skillLevel: number;
}

export interface Team {
  id: string;
  name: string;
  players: [Player, Player];
  combinedSkill: number;
}

export interface MatchAssignment {
  [key: string]: {
    teamA: string | null; // team id
    teamB: string | null; // team id
  };
}

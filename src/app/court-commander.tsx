"use client";

import { useState, useMemo, useCallback, startTransition } from "react";
import { suggestTeamAssignments } from "@/ai/flows/team-assignment-suggestions";
import { useToast } from "@/hooks/use-toast";
import type { Player, Team, MatchAssignment } from "@/lib/types";
import { ConfigPanel } from "@/components/config-panel";
import { MatchSchedule } from "@/components/match-schedule";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { BrainCircuit } from "lucide-react";

interface ConfigData {
  numCourts: number;
  numGames: number;
  players: Omit<Player, "id">[];
}

export default function CourtCommander() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [assignments, setAssignments] = useState<MatchAssignment>({});
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const { toast } = useToast();

  const players = useMemo(
    () =>
      config?.players.map((p, i) => ({ ...p, id: `player-${i}` })) ?? [],
    [config?.players]
  );

  const teams: Team[] = useMemo(() => {
    if (players.length < 2) return [];
    const combos: Team[] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const playerA = players[i];
        const playerB = players[j];
        // Sort by name to ensure consistent ID
        const sortedPlayers = [playerA, playerB].sort((a, b) => a.name.localeCompare(b.name));
        combos.push({
          id: `${sortedPlayers[0].name}_${sortedPlayers[1].name}`,
          name: `${sortedPlayers[0].name} & ${sortedPlayers[1].name}`,
          players: [playerA, playerB],
          combinedSkill: playerA.skillLevel + playerB.skillLevel,
        });
      }
    }
    return combos;
  }, [players]);

  const teamsMap = useMemo(() => new Map(teams.map(t => [t.id, t])), [teams]);

  const handleConfigSubmit = useCallback((values: ConfigData) => {
    startTransition(() => {
      setConfig(values);
      // Initialize assignments
      const initialAssignments: MatchAssignment = {};
      for (let g = 0; g < values.numGames; g++) {
        for (let c = 0; c < values.numCourts; c++) {
          initialAssignments[`game-${g}_court-${c}`] = {
            teamA: null,
            teamB: null,
          };
        }
      }
      setAssignments(initialAssignments);
      setShowSchedule(true);
    });
  }, []);

  const handleAssignmentChange = useCallback(
    (
      gameIndex: number,
      courtIndex: number,
      teamSlot: "teamA" | "teamB",
      teamId: string
    ) => {
      setAssignments((prev) => {
        const newAssignments = { ...prev };
        const matchKey = `game-${gameIndex}_court-${courtIndex}`;
        newAssignments[matchKey] = {
          ...newAssignments[matchKey],
          [teamSlot]: teamId,
        };
        return newAssignments;
      });
    },
    []
  );

  const formatAssignmentsForAI = () => {
    const aiAssignments: Record<string, string[] | null> = {};
    if (!config) return aiAssignments;

    for (let g = 0; g < config.numGames; g++) {
      for (let c = 0; c < config.numCourts; c++) {
        const matchKey = `game-${g}_court-${c}`;
        const aiKey = `court${c + 1}_game${g + 1}`;
        const assignment = assignments[matchKey];
        
        if (assignment && assignment.teamA && assignment.teamB) {
            const teamAName = teamsMap.get(assignment.teamA)?.name;
            const teamBName = teamsMap.get(assignment.teamB)?.name;
            if(teamAName && teamBName) {
                aiAssignments[aiKey] = [teamAName, teamBName];
            } else {
                 aiAssignments[aiKey] = null;
            }
        } else {
          aiAssignments[aiKey] = null;
        }
      }
    }
    return aiAssignments;
  };
  
  const handleGetSuggestions = async () => {
    if (!config) return;
    setIsGettingSuggestions(true);
    
    try {
      const result = await suggestTeamAssignments({
        numCourts: config.numCourts,
        numGames: config.numGames,
        players: config.players,
        assignedTeams: formatAssignmentsForAI(),
      });
      
      setSuggestions(result.suggestions);

    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get suggestions from AI.",
      });
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  const handleReset = () => {
    setShowSchedule(false);
    setConfig(null);
    setAssignments({});
  };

  return (
    <>
      <div className="transition-opacity duration-500">
        {!showSchedule ? (
          <ConfigPanel onSubmit={handleConfigSubmit} />
        ) : (
          config && (
            <MatchSchedule
              numCourts={config.numCourts}
              numGames={config.numGames}
              players={players}
              teams={teams}
              assignments={assignments}
              onAssignmentChange={handleAssignmentChange}
              onGetSuggestions={handleGetSuggestions}
              onReset={handleReset}
              isGettingSuggestions={isGettingSuggestions}
            />
          )
        )}
      </div>

      <AlertDialog open={!!suggestions} onOpenChange={() => setSuggestions(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-primary"/>
                AI Team Suggestions
            </AlertDialogTitle>
            <AlertDialogDescription>
              Here are some suggestions to create more balanced matches. You can apply these manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-4 bg-secondary/50 rounded-md">
            <pre className="whitespace-pre-wrap font-body text-sm text-foreground">
                {suggestions}
            </pre>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuggestions(null)}>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

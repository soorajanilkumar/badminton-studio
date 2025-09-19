"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, Swords, Star, Printer } from "lucide-react";
import type { Player, Team, MatchAssignment } from "@/lib/types";
import { useMemo } from "react";

interface MatchScheduleProps {
  numCourts: number;
  numGames: number;
  players: Player[];
  teams: Team[];
  assignments: MatchAssignment;
  onAssignmentChange: (
    gameIndex: number,
    courtIndex: number,
    teamSlot: "teamA" | "teamB",
    teamId: string | null
  ) => void;
  onGetSuggestions: () => void;
  onBackToSetup: () => void;
  isGettingSuggestions: boolean;
}

export function MatchSchedule({
  numCourts,
  numGames,
  players,
  teams,
  assignments,
  onAssignmentChange,
  onGetSuggestions,
  onBackToSetup,
  isGettingSuggestions,
}: MatchScheduleProps) {
  const courts = Array.from({ length: numCourts }, (_, i) => i);
  const games = Array.from({ length: numGames }, (_, i) => i);
  const teamsMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.combinedSkill - a.combinedSkill);
  }, [teams]);

  const allUsedTeamIds = useMemo(() => {
    const usedIds = new Set<string>();
    Object.values(assignments).forEach(match => {
        if (match.teamA) usedIds.add(match.teamA);
        if (match.teamB) usedIds.add(match.teamB);
    });
    return usedIds;
  }, [assignments]);

  const handlePrint = () => {
    const printableData = {
      assignments,
      teams,
      numGames,
      numCourts
    };
    localStorage.setItem('printableSchedule', JSON.stringify(printableData));
    window.open('/print', '_blank');
  };

  const renderTeamSelect = (
    gameIndex: number,
    courtIndex: number,
    teamSlot: "teamA" | "teamB"
  ) => {
    const matchKey = `game-${gameIndex}_court-${courtIndex}`;
    const currentAssignment = assignments[matchKey];
    const currentValue = currentAssignment?.[teamSlot];
    
    const assignedPlayerIdsInGame = new Set<string>();
    
    // Check for assigned players within the same game slot
    for (let c = 0; c < numCourts; c++) {
        const key = `game-${gameIndex}_court-${c}`;
        const match = assignments[key];
        if (match) {
            if (match.teamA) {
                const teamA = teamsMap.get(match.teamA);
                if (teamA) teamA.players.forEach(p => assignedPlayerIdsInGame.add(p.id));
            }
            if (match.teamB) {
                const teamB = teamsMap.get(match.teamB);
                if (teamB) teamB.players.forEach(p => assignedPlayerIdsInGame.add(p.id));
            }
        }
    }
    
    // If a team is currently selected in this slot, its players should not be considered "assigned" for its own dropdown.
    const currentTeam = currentValue ? teamsMap.get(currentValue) : null;
    if (currentTeam) {
        currentTeam.players.forEach(p => assignedPlayerIdsInGame.delete(p.id));
    }

    return (
      <Select
        value={currentValue ?? ""}
        onValueChange={(value) =>
          onAssignmentChange(gameIndex, courtIndex, teamSlot, value === "none" ? null : value)
        }
      >
        <SelectTrigger className="w-full min-w-[200px]">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
           <SelectItem value="none">
                <span className="text-muted-foreground">-- None --</span>
            </SelectItem>
          {sortedTeams.map((team) => {
            const hasAssignedPlayer = team.players.some(p => assignedPlayerIdsInGame.has(p.id));
            const isTeamUsedInSchedule = allUsedTeamIds.has(team.id) && team.id !== currentValue;
            const isTeamDisabled = hasAssignedPlayer || isTeamUsedInSchedule;

            return (
              <SelectItem
                key={team.id}
                value={team.id}
                disabled={isTeamDisabled}
              >
                <div className="flex justify-between w-full">
                  <span>{team.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    {team.combinedSkill}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Swords className="text-primary" />
            Match Schedule
          </CardTitle>
          <CardDescription>
            Assign teams to games and courts. Each team can only play once.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackToSetup}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Setup
          </Button>
          <Button onClick={onGetSuggestions} disabled={isGettingSuggestions}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isGettingSuggestions ? 'Optimizing...' : 'Get Suggestions'}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Tabs defaultValue="game-0" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {games.map((gameIndex) => (
                <TabsTrigger key={`game-tab-${gameIndex}`} value={`game-${gameIndex}`}>
                  Game {gameIndex + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {games.map((gameIndex) => (
              <TabsContent key={`game-content-${gameIndex}`} value={`game-${gameIndex}`}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Court</TableHead>
                        <TableHead>Team A</TableHead>
                        <TableHead>Team B</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courts.map((courtIndex) => (
                        <TableRow key={`court-row-${gameIndex}-${courtIndex}`}>
                          <TableCell className="font-medium">
                            {courtIndex + 1}
                          </TableCell>
                          <TableCell>
                            {renderTeamSelect(gameIndex, courtIndex, "teamA")}
                          </TableCell>
                          <TableCell>
                            {renderTeamSelect(gameIndex, courtIndex, "teamB")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

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
import { ArrowLeft, BrainCircuit, Users, Swords, Star } from "lucide-react";
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
  onReset: () => void;
  isGettingSuggestions: boolean;
}

export function MatchSchedule({
  numCourts,
  numGames,
  teams,
  assignments,
  onAssignmentChange,
  onGetSuggestions,
  onReset,
  isGettingSuggestions,
}: MatchScheduleProps) {
  const courts = Array.from({ length: numCourts }, (_, i) => i);
  const games = Array.from({ length: numGames }, (_, i) => i);
  const teamsMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);


  const allAssignedTeamIds = new Set(
    Object.values(assignments).flatMap((a) => [a.teamA, a.teamB].filter(Boolean))
  );

  const renderTeamSelect = (
    gameIndex: number,
    courtIndex: number,
    teamSlot: "teamA" | "teamB"
  ) => {
    const matchKey = `game-${gameIndex}_court-${courtIndex}`;
    const currentAssignment = assignments[matchKey];
    const currentValue = currentAssignment?.[teamSlot];
    const otherTeamSlot = teamSlot === "teamA" ? "teamB" : "teamA";
    const otherTeamId = currentAssignment?.[otherTeamSlot];
    const otherTeam = otherTeamId ? teamsMap.get(otherTeamId) : null;
    const otherTeamPlayerIds = otherTeam ? new Set(otherTeam.players.map(p => p.id)) : new Set();


    const availableTeams = teams.filter(team => {
        if (team.id === otherTeamId) return false;
        if(otherTeamPlayerIds.size > 0){
            return !team.players.some(p => otherTeamPlayerIds.has(p.id))
        }
        return true;
    });

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
          {availableTeams.map((team) => {
            const isUsedElsewhere =
              allAssignedTeamIds.has(team.id) && team.id !== currentValue;

            return (
              <SelectItem
                key={team.id}
                value={team.id}
                disabled={team.id === otherTeamId}
                className={isUsedElsewhere ? "text-muted-foreground/70" : ""}
              >
                <div className="flex justify-between w-full">
                  <span>{team.name} {isUsedElsewhere ? " (Used)" : ""}</span>
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
            Assign teams to games and courts. Used teams are greyed out but can be re-selected.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Setup
          </Button>
          <Button onClick={onGetSuggestions} disabled={isGettingSuggestions}>
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isGettingSuggestions ? 'Optimizing...' : 'Get Suggestions'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

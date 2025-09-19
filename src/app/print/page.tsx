"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shuttlecock } from "@/components/icons";
import type { Player, Team, MatchAssignment } from "@/lib/types";

interface StoredSchedule {
  assignments: MatchAssignment;
  teams: Team[];
  numGames: number;
  numCourts: number;
}

export default function PrintPage() {
  const [schedule, setSchedule] = useState<StoredSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem("printableSchedule");
    if (storedData) {
      setSchedule(JSON.parse(storedData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">Loading schedule...</div>;
  }

  if (!schedule) {
    return <div className="p-8">No schedule data found. Please generate a schedule first.</div>;
  }

  const { assignments, teams, numGames, numCourts } = schedule;
  const games = Array.from({ length: numGames }, (_, i) => i);
  const courts = Array.from({ length: numCourts }, (_, i) => i);
  const teamsMap = new Map(teams.map((t) => [t.id, t]));


  return (
    <div className="p-4 md:p-8">
       <header className="flex flex-col items-center justify-center text-center mb-8">
            <div className="flex items-center justify-center gap-4">
              <Shuttlecock className="w-12 h-12 md:w-16 md:h-16 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-foreground">
                Court Commander
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              Match Schedule
            </p>
      </header>
      <div className="space-y-8">
        {games.map((gameIndex) => (
          <div key={`print-game-${gameIndex}`}>
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Game {gameIndex + 1}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] font-bold text-base">Court</TableHead>
                  <TableHead className="font-bold text-base">Team A</TableHead>
                  <TableHead className="font-bold text-base">vs.</TableHead>
                  <TableHead className="font-bold text-base">Team B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courts.map((courtIndex) => {
                  const matchKey = `game-${gameIndex}_court-${courtIndex}`;
                  const match = assignments[matchKey];
                  const teamA = match?.teamA ? teamsMap.get(match.teamA) : null;
                  const teamB = match?.teamB ? teamsMap.get(match.teamB) : null;
                  return (
                    <TableRow key={`print-court-row-${gameIndex}-${courtIndex}`}>
                      <TableCell className="font-medium text-lg">{courtIndex + 1}</TableCell>
                      <TableCell className="text-base">{teamA?.name ?? 'Not Assigned'}</TableCell>
                      <TableCell className="text-muted-foreground">vs.</TableCell>
                      <TableCell className="text-base">{teamB?.name ?? 'Not Assigned'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
       <footer className="text-center p-4 mt-8 text-muted-foreground text-sm">
        <p>Built for the love of the game.</p>
      </footer>
    </div>
  );
}

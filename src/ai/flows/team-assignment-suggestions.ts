'use server';

/**
 * @fileOverview An AI agent for suggesting team assignments to balance matches.
 *
 * - suggestTeamAssignments - A function that suggests team assignments based on current match state.
 * - SuggestTeamAssignmentsInput - The input type for the suggestTeamAssignments function.
 * - SuggestTeamAssignmentsOutput - The return type for the suggestTeamAssignments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTeamAssignmentsInputSchema = z.object({
  numCourts: z.number().describe('The number of courts available.'),
  numGames: z.number().describe('The total number of games to be played.'),
  players: z.array(
    z.object({
      name: z.string().describe('The name of the player.'),
      skillLevel: z.number().min(1).max(5).describe('The skill level of the player (1-5).'),
    })
  ).describe('The list of players and their skill levels.'),
  assignedTeams: z.record(z.string(), z.array(z.string()).nullable()).describe('A map of court+game to assigned team combination names, e.g. {"court1_game1": ["Team A", "Team B"] }'),
});
export type SuggestTeamAssignmentsInput = z.infer<typeof SuggestTeamAssignmentsInputSchema>;


const SuggestTeamAssignmentsOutputSchema = z.object({
    suggestions: z.string().describe('The suggestions for team assignments to balance the matches.'),
});
export type SuggestTeamAssignmentsOutput = z.infer<typeof SuggestTeamAssignmentsOutputSchema>;

export async function suggestTeamAssignments(input: SuggestTeamAssignmentsInput): Promise<SuggestTeamAssignmentsOutput> {
    return suggestTeamAssignmentsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestTeamAssignmentsPrompt',
    input: {schema: SuggestTeamAssignmentsInputSchema},
    output: {schema: SuggestTeamAssignmentsOutputSchema},
    prompt: `You are a badminton club manager. Your goal is to create balanced and fair doubles matches.
Analyze the provided players, their skill levels, and the current match assignments.
Based on this information, provide suggestions to improve the balance of the games.
Consider player skill levels, who has played with whom, and try to ensure everyone gets to play a variety of opponents and partners.

RULES:
- A player cannot play in two courts in the same game slot.
- A team cannot be assigned to more than one match in the same game slot.

Number of Courts: {{{numCourts}}}
Total Games per Court: {{{numGames}}}

Players and Skill Levels (1=Beginner, 5=Advanced):
{{#each players}}
- {{name}}: Skill {{skillLevel}}
{{/each}}

Current Assignments:
{{#each assignedTeams}}
- {{@key}}: {{#if this}}{{join this ", "}}{{else}}Not assigned{{/if}}
{{/each}}

Provide your suggestions as a single block of text. For example, "For Game 1 on Court 1, consider swapping Player A with Player C on Court 2 to balance the skill levels."
`,
});

const suggestTeamAssignmentsFlow = ai.defineFlow(
    {
        name: 'suggestTeamAssignmentsFlow',
        inputSchema: SuggestTeamAssignmentsInputSchema,
        outputSchema: SuggestTeamAssignmentsOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);

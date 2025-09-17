# **App Name**: Court Commander

## Core Features:

- Player Input: Collect number of players, names and skill levels (1-5).
- Court & Game Configuration: Set up number of available courts and total number of games.
- Combination Generator: In the background calculate all possible unique combinations of 2-player teams.
- Skill Level Aggregator: Aggregate the skill level for each player combo in the background, as a guide.
- Match Assignment: Select a match, and assign one of the 2-player combinations to the match from the available team options.
- Availability Tracker: Show the status of a team combination, whether 'available' (never used), 'used' (already used) or 'unavailable' (already assigned in the present state).
- Team Optimizer Tool: Use LLM reasoning as a tool to give hints about suggested team assignments that tend toward more even-handed matches overall, after teams have been assigned for the first time in each set.

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2), reflecting the energy and dynamism of badminton.
- Background color: Light gray (#F0F2F5), for a clean and unobtrusive backdrop.
- Accent color: Energetic orange (#FF8C00), used to highlight interactive elements and important information.
- Body and headline font: 'PT Sans' for a modern, readable, and friendly user experience.
- Use clear and intuitive icons for player stats and match details.
- The app's layout should be intuitive, making it easy to assign teams and track availability. Court and match displays should be clear, and drag-and-drop interaction considered.
- Provide simple and smooth animations upon team assignments and match completions.
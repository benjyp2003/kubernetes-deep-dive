export type DifficultyMode = 'guided' | 'investigation' | 'exam';

export interface LabClue {
  id: string;
  text: string;
  discoveredBy: string; // command that reveals this clue
}

export interface LabCommand {
  command: string;
  output: string;
  revealsClues?: string[]; // clue ids
}

export interface LabScenario {
  id: string;
  title: string;
  category: 'pod' | 'networking' | 'storage' | 'config' | 'deployment' | 'security';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  problemDescription: string;
  environmentContext: string;
  rootCause: string;
  fix: string;
  explanation: string;
  preventionTip: string;
  relatedPage: string;
  clues: LabClue[];
  commands: LabCommand[];
  hints: string[];
  rootCauseOptions: string[];
  correctRootCauseIndex: number;
}

export interface LabScore {
  total: number;
  correctDiagnosis: boolean;
  commandsUsed: number;
  relevantCommands: number;
  hintsUsed: number;
  timeSeconds: number;
}

export interface Character {
  name: string;
  description:string;
}

export interface DialogueEntry {
  id: string;
  speaker?: string; // Optional: If not provided, it's a caption
  dialogue: string;
}

export interface StoryPanel {
  id: string;
  scene: string;
  expression: string;
  dialogues: DialogueEntry[];
}

export interface GeneratedPanel extends StoryPanel {
  imageUrl: string;
}

export type AppView = 'character' | 'storyboard' | 'comic';

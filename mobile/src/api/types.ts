export type LocationMarker = {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  challengeId: string;
};

export type Story = {
  id: string;
  title: string;
  description: string;
};

export type Fragment = {
  id: string;
  storyId: string;
  title: string;
  text: string;
  order: number;
};

export type Collection = {
  fragments: CollectionFragment[];
  stories: CollectionStory[];
  collected: number;
  total: number;
  progress: number;
};

export type CollectionFragment = Fragment & {
  collected: boolean;
  text: string | null;
};

export type Completion = {
  title: string;
  text: string;
  reward: string;
};

export type CollectionStory = Story & {
  collected: number;
  total: number;
  progress: number;
  completed: boolean;
  completion: Completion | null;
};

export type StoryProgress = {
  story: Story;
  collected: number;
  total: number;
  progress: number;
  completed: boolean;
  completion: Completion | null;
};

export type Challenge = {
  id: string;
  locationId: string;
  prompt: string;
  hint: string;
};

export type SolveResult = {
  correct: boolean;
  alreadyCollected?: boolean;
  message: string;
  fragment?: Fragment;
  storyCompleted: boolean;
  completion: Completion | null;
};

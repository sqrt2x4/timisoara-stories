import type { Challenge, Collection, LocationMarker, SolveResult, Story, StoryProgress } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("The API is unavailable. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(`The API request failed (${response.status}).`);
  }
  return (await response.json()) as T;
}

export async function getLocations(): Promise<LocationMarker[]> {
  const data = await request<{ locations: LocationMarker[] }>("/locations");
  return data.locations;
}

export async function getStories(): Promise<Story[]> {
  const data = await request<{ stories: Story[] }>("/stories");
  return data.stories;
}

export async function getStoryProgress(storyId: string): Promise<StoryProgress> {
  return request<StoryProgress>(`/stories/${storyId}/progress`);
}

export async function getCollection(): Promise<Collection> {
  return request<Collection>("/collection");
}

export async function getChallenge(challengeId: string): Promise<Challenge> {
  return request<Challenge>(`/challenges/${challengeId}`);
}

export async function solveChallenge(challengeId: string, answer: string): Promise<SolveResult> {
  return request<SolveResult>(`/challenges/${challengeId}/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer }),
  });
}

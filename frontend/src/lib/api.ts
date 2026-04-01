const BASE_URL = "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    throw new ApiError(body, res.status);
  }
  return res.json() as Promise<T>;
}

async function requestBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "Unknown error");
    throw new ApiError(body, res.status);
  }
  return res.blob();
}

// ---- Types matching backend story.json ----

export interface TextOverlayData {
  type: "caption" | "speech" | "sfx";
  text: string;
  x: number;
  y: number;
  color?: string;
}

export interface Panel {
  description: string;
  dialogue: string;
  sfx: string;
  text_overlays: TextOverlayData[];
}

export interface PageData {
  page_number: number;
  scene_description: string;
  layout: string;
  panels: Panel[];
}

export interface Chapter {
  number: number;
  title: string;
  start_page: number;
  end_page: number;
}

export interface Story {
  title: string;
  chapters: Chapter[];
  pages: PageData[];
}

// ---- Types for backend responses ----

export interface PageMeta {
  page: number;
  panels: Record<string, { prompt: string; path: string; provider: string }>;
  status: string;
  layout?: string;
  composited_path?: string;
  final_path?: string;
  overlays?: TextOverlayData[];
}

export interface PageInfo {
  meta: PageMeta;
  images: Record<string, string>;
}

export interface StatusCounts {
  pending: number;
  panels_done: number;
  composited: number;
  text_added: number;
  total: number;
}

export interface GenerateResult {
  url: string;
  saved_path: string;
}

export interface CompositeResult {
  page_path: string;
}

export interface TextResult {
  text_page_path: string;
}

export interface Settings {
  higgsfield_api_key: string;
  vertex_api_key: string;
  provider: string;
  character_anchor: string;
  page_width: number;
  page_height: number;
  gutter_size: number;
  [key: string]: unknown;
}

// ---- API functions ----

export async function fetchStory(): Promise<Story> {
  return request<Story>("/api/story");
}

export async function saveStory(story: Story): Promise<{ status: string }> {
  return request<{ status: string }>("/api/story", {
    method: "POST",
    body: JSON.stringify(story),
  });
}

export async function fetchPage(pageNum: number): Promise<PageInfo> {
  return request<PageInfo>(`/api/page/${pageNum}`);
}

export async function fetchStatus(): Promise<StatusCounts> {
  return request<StatusCounts>("/api/status");
}

export async function generatePanel(
  page: number,
  panel: number,
  prompt: string,
  provider: string
): Promise<GenerateResult> {
  return request<GenerateResult>("/api/generate-panel", {
    method: "POST",
    body: JSON.stringify({ page, panel, prompt, provider }),
  });
}

export async function compositePage(
  page: number,
  layout: string
): Promise<CompositeResult> {
  return request<CompositeResult>("/api/composite-page", {
    method: "POST",
    body: JSON.stringify({ page, layout }),
  });
}

export async function addText(
  page: number,
  overlays: TextOverlayData[]
): Promise<TextResult> {
  return request<TextResult>("/api/add-text", {
    method: "POST",
    body: JSON.stringify({ page, overlays }),
  });
}

export async function fetchSettings(): Promise<Settings> {
  return request<Settings>("/api/settings");
}

export async function saveSettings(settings: Settings): Promise<{ status: string }> {
  return request<{ status: string }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function exportChapter(chapter: number): Promise<Blob> {
  return requestBlob(`/api/export/ch${chapter}`);
}

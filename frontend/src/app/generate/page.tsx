"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchStory,
  fetchPage,
  generatePanel,
  compositePage,
  addText,
  fetchSettings,
  type Story,
  type PageData,
  type PageInfo,
  type Settings,
  type TextOverlayData,
} from "@/lib/api";

const DATA_BASE = "http://localhost:8000/data";

type GenState = {
  active: boolean;
  step: "panels" | "composite" | "text" | null;
  currentPanel: number;
  totalPanels: number;
};

function statusColor(s: string) {
  switch (s) {
    case "panels_done":
      return "bg-blue-500/20 text-blue-400";
    case "composited":
      return "bg-green-500/20 text-green-400";
    case "text_added":
      return "bg-purple-500/20 text-purple-400";
    case "generating":
      return "bg-yellow-500/20 text-yellow-400 animate-pulse";
    default:
      return "bg-white/10 text-white/50";
  }
}

function statusLabel(s: string) {
  switch (s) {
    case "panels_done":
      return "Generated";
    case "composited":
      return "Composited";
    case "text_added":
      return "Complete";
    case "generating":
      return "Generating";
    default:
      return "Draft";
  }
}

export default function GeneratorPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pageMetas, setPageMetas] = useState<Record<number, PageInfo>>({});
  const [genStates, setGenStates] = useState<Record<number, GenState>>({});
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStory = useCallback(async () => {
    try {
      const data = await fetchStory();
      setStory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  const loadPageMeta = useCallback(async (pageNum: number) => {
    try {
      const info = await fetchPage(pageNum);
      setPageMetas((prev) => ({ ...prev, [pageNum]: info }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadStory();
    fetchSettings()
      .then(setSettings)
      .catch(() => {});
  }, [loadStory]);

  // Load page metas when story loads
  useEffect(() => {
    if (story) {
      story.pages.forEach((p) => loadPageMeta(p.page_number));
    }
  }, [story, loadPageMeta]);

  // Poll while generating
  const anyActive = Object.values(genStates).some((s) => s.active);
  useEffect(() => {
    if (anyActive) {
      pollRef.current = setInterval(() => {
        story?.pages.forEach((p) => loadPageMeta(p.page_number));
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [anyActive, story, loadPageMeta]);

  const getPageStatus = (pageNum: number): string => {
    const gen = genStates[pageNum];
    if (gen?.active) return "generating";
    return pageMetas[pageNum]?.meta.status ?? "pending";
  };

  const handleGeneratePanels = async (page: PageData) => {
    const pn = page.page_number;
    const provider = settings?.provider ?? "higgsfield";
    setGenStates((prev) => ({
      ...prev,
      [pn]: { active: true, step: "panels", currentPanel: 0, totalPanels: page.panels.length },
    }));
    try {
      for (let i = 0; i < page.panels.length; i++) {
        setGenStates((prev) => ({
          ...prev,
          [pn]: { ...prev[pn], currentPanel: i + 1 },
        }));
        await generatePanel(pn, i + 1, page.panels[i].description, provider);
      }
      await loadPageMeta(pn);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenStates((prev) => ({
        ...prev,
        [pn]: { ...prev[pn], active: false, step: null },
      }));
    }
  };

  const handleComposite = async (page: PageData) => {
    const pn = page.page_number;
    setGenStates((prev) => ({
      ...prev,
      [pn]: { active: true, step: "composite", currentPanel: 0, totalPanels: 0 },
    }));
    try {
      await compositePage(pn, page.layout);
      await loadPageMeta(pn);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compositing failed");
    } finally {
      setGenStates((prev) => ({
        ...prev,
        [pn]: { ...prev[pn], active: false, step: null },
      }));
    }
  };

  const handleAddText = async (page: PageData) => {
    const pn = page.page_number;
    setGenStates((prev) => ({
      ...prev,
      [pn]: { active: true, step: "text", currentPanel: 0, totalPanels: 0 },
    }));
    try {
      const overlays: TextOverlayData[] = page.panels.flatMap(
        (panel) => panel.text_overlays
      );
      await addText(pn, overlays);
      await loadPageMeta(pn);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Text overlay failed");
    } finally {
      setGenStates((prev) => ({
        ...prev,
        [pn]: { ...prev[pn], active: false, step: null },
      }));
    }
  };

  const handleGenerateAll = async () => {
    if (!story) return;
    for (const page of story.pages) {
      const status = getPageStatus(page.page_number);
      if (status === "pending") {
        await handleGeneratePanels(page);
      }
    }
  };

  if (!story) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Count statuses
  const counts = { pending: 0, panels_done: 0, composited: 0, text_added: 0 };
  for (const p of story.pages) {
    const s = getPageStatus(p.page_number);
    if (s in counts) counts[s as keyof typeof counts]++;
    else counts.pending++;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Generator</h1>
        <button
          onClick={handleGenerateAll}
          disabled={anyActive}
          className={`bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-5 py-2.5 text-sm font-medium transition ${
            anyActive ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Generate All
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-300 ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Status summary */}
      <div className="flex gap-4 flex-wrap">
        {(
          [
            ["Draft", counts.pending, "bg-white/40"],
            ["Generated", counts.panels_done, "bg-blue-400"],
            ["Composited", counts.composited, "bg-green-400"],
            ["Complete", counts.text_added, "bg-purple-400"],
          ] as const
        ).map(([label, count, dotColor]) => (
          <div
            key={label}
            className="bg-[#12121e] rounded-lg px-4 py-2 border border-white/[0.08] flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-white/60 text-sm">{label}</span>
            <span className="text-white font-semibold text-sm">{count}</span>
          </div>
        ))}
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
        {story.pages.map((page) => {
          const pn = page.page_number;
          const status = getPageStatus(pn);
          const gen = genStates[pn];
          const isActive = gen?.active ?? false;
          const meta = pageMetas[pn];
          const panelCount = Object.keys(meta?.meta.panels ?? {}).length;
          const isPanelsDone = status === "panels_done" || status === "composited" || status === "text_added";
          const isComposited = status === "composited" || status === "text_added";

          return (
            <div
              key={pn}
              className="bg-[#12121e] rounded-xl p-5 border border-white/[0.08] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">
                    Page {pn}
                  </span>
                  <span className="text-white/30 text-xs">
                    Layout {page.layout} &middot; {page.panels.length} panels
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(status)}`}
                >
                  {statusLabel(status)}
                </span>
              </div>

              {/* Panel thumbnails */}
              <div className="flex gap-2 flex-wrap">
                {page.panels.map((_, idx) => {
                  const panelPath = meta?.images[`panel_${idx + 1}`];
                  return (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-md overflow-hidden border border-white/[0.08] bg-white/5 flex-shrink-0"
                    >
                      {panelPath ? (
                        <img
                          src={`${DATA_BASE}/${panelPath}`}
                          alt={`Panel ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress */}
              {isActive && gen && (
                <div className="text-xs text-white/50">
                  {gen.step === "panels" && (
                    <span>
                      Generating panel {gen.currentPanel}/{gen.totalPanels}...
                    </span>
                  )}
                  {gen.step === "composite" && <span>Compositing page...</span>}
                  {gen.step === "text" && <span>Adding text overlays...</span>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleGeneratePanels(page)}
                  disabled={isActive}
                  className={`bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isActive && gen?.step === "panels"
                    ? `${gen.currentPanel}/${gen.totalPanels}`
                    : "Generate"}
                </button>
                <button
                  onClick={() => handleComposite(page)}
                  disabled={isActive || !isPanelsDone}
                  className={`bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive || !isPanelsDone
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Composite
                </button>
                <button
                  onClick={() => handleAddText(page)}
                  disabled={isActive || !isComposited}
                  className={`bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive || !isComposited
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Add Text
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

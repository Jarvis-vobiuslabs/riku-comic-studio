"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchStory,
  saveStory,
  type Story,
  type PageData,
  type Panel,
  type TextOverlayData,
} from "@/lib/api";

const MAX_PANELS = 5;

const LAYOUTS = [
  { value: "A", label: "A — 2 panels (top/bottom)" },
  { value: "B", label: "B — 3 panels (top + 2 bottom)" },
  { value: "C", label: "C — 4 panels (2x2 grid)" },
  { value: "D", label: "D — 5 panels (top + 3 mid + bottom)" },
  { value: "E", label: "E — Splash (full page)" },
];

function emptyPanel(): Panel {
  return { description: "", dialogue: "", sfx: "", text_overlays: [] };
}

function emptyPage(pageNumber: number): PageData {
  return {
    page_number: pageNumber,
    scene_description: "",
    layout: "C",
    panels: [emptyPanel()],
  };
}

const inputClass =
  "bg-[#080810] border border-white/[0.08] rounded-lg p-3 text-white w-full focus:outline-none focus:border-[#e63946]/50 transition placeholder:text-white/25";

export default function StoryEditorPage() {
  const [story, setStory] = useState<Story>({
    title: "",
    chapters: [],
    pages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchStory()
      .then((data) => {
        setStory(data);
        if (data.pages.length > 0) {
          setExpandedPages(new Set([0]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const togglePage = useCallback((idx: number) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const updatePage = useCallback(
    (idx: number, updates: Partial<PageData>) => {
      setStory((s) => {
        const pages = [...s.pages];
        pages[idx] = { ...pages[idx], ...updates };
        return { ...s, pages };
      });
    },
    []
  );

  const updatePanel = useCallback(
    (pageIdx: number, panelIdx: number, updates: Partial<Panel>) => {
      setStory((s) => {
        const pages = [...s.pages];
        const panels = [...pages[pageIdx].panels];
        panels[panelIdx] = { ...panels[panelIdx], ...updates };
        pages[pageIdx] = { ...pages[pageIdx], panels };
        return { ...s, pages };
      });
    },
    []
  );

  const addPanel = useCallback((pageIdx: number) => {
    setStory((s) => {
      const pages = [...s.pages];
      if (pages[pageIdx].panels.length >= MAX_PANELS) return s;
      pages[pageIdx] = {
        ...pages[pageIdx],
        panels: [...pages[pageIdx].panels, emptyPanel()],
      };
      return { ...s, pages };
    });
  }, []);

  const removePanel = useCallback((pageIdx: number, panelIdx: number) => {
    setStory((s) => {
      const pages = [...s.pages];
      const panels = pages[pageIdx].panels.filter((_, i) => i !== panelIdx);
      if (panels.length === 0) return s;
      pages[pageIdx] = { ...pages[pageIdx], panels };
      return { ...s, pages };
    });
  }, []);

  const addPage = useCallback(() => {
    setStory((s) => {
      const nextNum =
        s.pages.length > 0
          ? Math.max(...s.pages.map((p) => p.page_number)) + 1
          : 1;
      return { ...s, pages: [...s.pages, emptyPage(nextNum)] };
    });
  }, []);

  const removePage = useCallback((idx: number) => {
    setStory((s) => ({
      ...s,
      pages: s.pages.filter((_, i) => i !== idx),
    }));
  }, []);

  const addOverlay = useCallback((pageIdx: number, panelIdx: number) => {
    setStory((s) => {
      const pages = [...s.pages];
      const panels = [...pages[pageIdx].panels];
      const overlays: TextOverlayData[] = [
        ...panels[panelIdx].text_overlays,
        { type: "caption", text: "", x: 50, y: 50 },
      ];
      panels[panelIdx] = { ...panels[panelIdx], text_overlays: overlays };
      pages[pageIdx] = { ...pages[pageIdx], panels };
      return { ...s, pages };
    });
  }, []);

  const updateOverlay = useCallback(
    (
      pageIdx: number,
      panelIdx: number,
      overlayIdx: number,
      updates: Partial<TextOverlayData>
    ) => {
      setStory((s) => {
        const pages = [...s.pages];
        const panels = [...pages[pageIdx].panels];
        const overlays = [...panels[panelIdx].text_overlays];
        overlays[overlayIdx] = { ...overlays[overlayIdx], ...updates };
        panels[panelIdx] = { ...panels[panelIdx], text_overlays: overlays };
        pages[pageIdx] = { ...pages[pageIdx], panels };
        return { ...s, pages };
      });
    },
    []
  );

  const removeOverlay = useCallback(
    (pageIdx: number, panelIdx: number, overlayIdx: number) => {
      setStory((s) => {
        const pages = [...s.pages];
        const panels = [...pages[pageIdx].panels];
        const overlays = panels[panelIdx].text_overlays.filter(
          (_, i) => i !== overlayIdx
        );
        panels[panelIdx] = { ...panels[panelIdx], text_overlays: overlays };
        pages[pageIdx] = { ...pages[pageIdx], panels };
        return { ...s, pages };
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await saveStory(story);
      setSaveMsg("Saved successfully");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [story]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Story Editor</h1>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span
              className={`text-sm ${saveMsg.includes("success") ? "text-emerald-400" : "text-[#e63946]"}`}
            >
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#e63946] hover:bg-[#ff4d5a] disabled:opacity-50 rounded-lg px-6 py-3 font-semibold transition flex items-center gap-2"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Story Title */}
      <div className="mb-8">
        <label className="block text-sm text-white/60 mb-2">Story Title</label>
        <input
          type="text"
          value={story.title}
          onChange={(e) => setStory((s) => ({ ...s, title: e.target.value }))}
          placeholder="Enter your story title..."
          className={inputClass}
        />
      </div>

      {/* Pages */}
      <div className="flex flex-col gap-6">
        {story.pages.map((page, pageIdx) => {
          const isExpanded = expandedPages.has(pageIdx);

          return (
            <div
              key={pageIdx}
              className="bg-[#12121e] rounded-xl border border-white/[0.08] border-l-4 border-l-[#e63946] overflow-hidden"
            >
              {/* Page header */}
              <button
                onClick={() => togglePage(pageIdx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">
                    Page {page.page_number}
                  </span>
                  <span className="text-sm text-white/40">
                    {page.panels.length} panel
                    {page.panels.length !== 1 ? "s" : ""} &middot; Layout{" "}
                    {page.layout}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(pageIdx);
                    }}
                    className="text-xs text-[#e63946] hover:text-[#ff4d5a] transition px-2 py-1"
                  >
                    Remove
                  </button>
                  <svg
                    className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Page body */}
              {isExpanded && (
                <div className="px-5 pb-5 flex flex-col gap-5">
                  {/* Scene Description */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Scene Description
                    </label>
                    <textarea
                      value={page.scene_description}
                      onChange={(e) =>
                        updatePage(pageIdx, {
                          scene_description: e.target.value,
                        })
                      }
                      placeholder="Describe the overall scene..."
                      rows={3}
                      className={inputClass + " resize-y"}
                    />
                  </div>

                  {/* Layout */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">
                      Layout
                    </label>
                    <select
                      value={page.layout}
                      onChange={(e) =>
                        updatePage(pageIdx, { layout: e.target.value })
                      }
                      className={inputClass + " cursor-pointer"}
                    >
                      {LAYOUTS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Panels */}
                  <div>
                    <p className="text-sm text-white/60 mb-3">Panels</p>
                    <div className="flex flex-col gap-4">
                      {page.panels.map((panel, panelIdx) => (
                        <div
                          key={panelIdx}
                          className="bg-[#080810] rounded-lg p-4 border border-white/[0.08]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-white/80">
                              Panel {panelIdx + 1}
                            </p>
                            {page.panels.length > 1 && (
                              <button
                                onClick={() => removePanel(pageIdx, panelIdx)}
                                className="text-xs text-[#e63946] hover:text-[#ff4d5a] transition"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {/* Description */}
                          <div className="mb-3">
                            <label className="block text-xs text-white/40 mb-1">
                              Description / Prompt
                            </label>
                            <textarea
                              value={panel.description}
                              onChange={(e) =>
                                updatePanel(pageIdx, panelIdx, {
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Describe this panel..."
                              className={inputClass + " resize-y text-sm"}
                            />
                          </div>

                          {/* Dialogue */}
                          <div className="mb-3">
                            <label className="block text-xs text-white/40 mb-1">
                              Dialogue
                            </label>
                            <input
                              type="text"
                              value={panel.dialogue}
                              onChange={(e) =>
                                updatePanel(pageIdx, panelIdx, {
                                  dialogue: e.target.value,
                                })
                              }
                              placeholder="Character dialogue..."
                              className={inputClass + " text-sm"}
                            />
                          </div>

                          {/* SFX */}
                          <div className="mb-3">
                            <label className="block text-xs text-white/40 mb-1">
                              SFX
                            </label>
                            <input
                              type="text"
                              value={panel.sfx}
                              onChange={(e) =>
                                updatePanel(pageIdx, panelIdx, {
                                  sfx: e.target.value,
                                })
                              }
                              placeholder="Sound effects..."
                              className={inputClass + " text-sm"}
                            />
                          </div>

                          {/* Text Overlays */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs text-white/40">
                                Text Overlays
                              </label>
                              <button
                                onClick={() => addOverlay(pageIdx, panelIdx)}
                                className="text-xs text-[#e63946] hover:text-[#ff4d5a] transition"
                              >
                                + Add Overlay
                              </button>
                            </div>
                            {panel.text_overlays.length === 0 ? (
                              <p className="text-xs text-white/20">
                                No overlays. Add captions, speech bubbles, or
                                SFX text.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {panel.text_overlays.map((ov, ovIdx) => (
                                  <div
                                    key={ovIdx}
                                    className="flex gap-2 items-start"
                                  >
                                    <select
                                      value={ov.type}
                                      onChange={(e) =>
                                        updateOverlay(
                                          pageIdx,
                                          panelIdx,
                                          ovIdx,
                                          {
                                            type: e.target.value as
                                              | "caption"
                                              | "speech"
                                              | "sfx",
                                          }
                                        )
                                      }
                                      className="bg-[#080810] border border-white/[0.08] rounded p-1.5 text-xs text-white"
                                    >
                                      <option value="caption">Caption</option>
                                      <option value="speech">Speech</option>
                                      <option value="sfx">SFX</option>
                                    </select>
                                    <input
                                      value={ov.text}
                                      onChange={(e) =>
                                        updateOverlay(
                                          pageIdx,
                                          panelIdx,
                                          ovIdx,
                                          { text: e.target.value }
                                        )
                                      }
                                      placeholder="Text..."
                                      className="flex-1 bg-[#080810] border border-white/[0.08] rounded p-1.5 text-xs text-white"
                                    />
                                    <input
                                      type="number"
                                      value={ov.x}
                                      onChange={(e) =>
                                        updateOverlay(
                                          pageIdx,
                                          panelIdx,
                                          ovIdx,
                                          { x: Number(e.target.value) }
                                        )
                                      }
                                      className="w-16 bg-[#080810] border border-white/[0.08] rounded p-1.5 text-xs text-white"
                                      placeholder="X"
                                    />
                                    <input
                                      type="number"
                                      value={ov.y}
                                      onChange={(e) =>
                                        updateOverlay(
                                          pageIdx,
                                          panelIdx,
                                          ovIdx,
                                          { y: Number(e.target.value) }
                                        )
                                      }
                                      className="w-16 bg-[#080810] border border-white/[0.08] rounded p-1.5 text-xs text-white"
                                      placeholder="Y"
                                    />
                                    <button
                                      onClick={() =>
                                        removeOverlay(
                                          pageIdx,
                                          panelIdx,
                                          ovIdx
                                        )
                                      }
                                      className="text-xs text-[#e63946] hover:text-[#ff4d5a] px-1"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {page.panels.length < MAX_PANELS && (
                      <button
                        onClick={() => addPanel(pageIdx)}
                        className="mt-4 text-sm text-[#e63946] hover:text-[#ff4d5a] transition font-medium"
                      >
                        + Add Panel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Page */}
      <button
        onClick={addPage}
        className="mt-6 w-full bg-[#12121e] hover:bg-white/[0.06] border border-dashed border-white/[0.15] rounded-xl py-4 text-white/50 hover:text-white/80 font-semibold transition"
      >
        + Add New Page
      </button>

      {/* Bottom save */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#e63946] hover:bg-[#ff4d5a] disabled:opacity-50 rounded-lg px-6 py-3 font-semibold transition"
        >
          {saving ? "Saving..." : "Save Story"}
        </button>
      </div>
    </div>
  );
}

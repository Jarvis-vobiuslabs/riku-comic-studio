"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchStory,
  fetchPage,
  exportChapter,
  type Story,
  type PageInfo,
} from "@/lib/api";

const DATA_BASE = "http://localhost:8000/data";

type ViewMode = "panels" | "page" | "text";

export default function ViewerPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("page");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");

  const pages = story?.pages ?? [];
  const totalPages = pages.length;
  const currentPage = pages[currentIdx] ?? null;

  const loadPageInfo = useCallback(async (pageNum: number) => {
    try {
      const info = await fetchPage(pageNum);
      setPageInfo(info);
    } catch {
      setPageInfo(null);
    }
  }, []);

  useEffect(() => {
    fetchStory()
      .then(setStory)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      );
  }, []);

  useEffect(() => {
    if (currentPage) {
      loadPageInfo(currentPage.page_number);
    }
  }, [currentPage, loadPageInfo]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < totalPages) setCurrentIdx(idx);
    },
    [totalPages]
  );
  const goPrev = useCallback(() => goTo(currentIdx - 1), [currentIdx, goTo]);
  const goNext = useCallback(() => goTo(currentIdx + 1), [currentIdx, goTo]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Which chapter is current page in?
  const currentChapter =
    story?.chapters.find(
      (ch) =>
        currentPage &&
        currentPage.page_number >= ch.start_page &&
        currentPage.page_number <= ch.end_page
    )?.number ?? 1;

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportChapter(currentChapter);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ch${currentChapter}_export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const num = parseInt(pageInput, 10);
      if (!isNaN(num)) {
        const idx = pages.findIndex((p) => p.page_number === num);
        if (idx >= 0) goTo(idx);
      }
      setPageInput("");
    }
  };

  const handleClickNav = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 2) goPrev();
    else goNext();
  };

  const pageDir = currentPage
    ? `pages/page_${String(currentPage.page_number).padStart(3, "0")}`
    : null;

  const renderContent = () => {
    if (!currentPage || !pageDir) {
      return (
        <div className="text-white/30 text-lg">No page data available</div>
      );
    }

    if (viewMode === "panels") {
      const panelImages = Object.entries(pageInfo?.images ?? {}).filter(
        ([k]) => k.startsWith("panel_")
      );
      if (panelImages.length === 0) {
        return (
          <div className="text-white/30 text-lg">
            No panel images generated yet
          </div>
        );
      }
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto p-4">
          {panelImages.map(([key, path]) => (
            <div
              key={key}
              className="rounded-lg overflow-hidden border border-white/[0.08] bg-[#12121e]"
            >
              <img
                src={`${DATA_BASE}/${path}`}
                alt={key}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      );
    }

    const imagePath =
      viewMode === "text"
        ? pageInfo?.images["final"]
        : pageInfo?.images["composited"];

    if (!imagePath) {
      return (
        <div className="text-white/30 text-lg">
          {viewMode === "text"
            ? "No text overlay image available"
            : "No composited page available"}
        </div>
      );
    }

    return (
      <img
        src={`${DATA_BASE}/${imagePath}`}
        alt={`Page ${currentPage.page_number}`}
        className="max-h-[calc(100vh-120px)] max-w-full object-contain rounded-lg"
      />
    );
  };

  if (!story) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#080810]/90 backdrop-blur border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Comic Viewer</h1>
          <span className="text-sm text-white/40">
            Page {currentPage?.page_number ?? "-"} ({currentIdx + 1} of{" "}
            {totalPages})
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode */}
          <div className="flex rounded-lg overflow-hidden border border-white/[0.12]">
            {(["panels", "page", "text"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-[#e63946] text-white"
                    : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {mode === "panels"
                  ? "Panels"
                  : mode === "page"
                    ? "Page"
                    : "Text"}
              </button>
            ))}
          </div>

          {/* Chapter jumps */}
          <div className="flex gap-1">
            {story.chapters.map((ch) => {
              const idx = pages.findIndex(
                (p) => p.page_number === ch.start_page
              );
              return (
                <button
                  key={ch.number}
                  onClick={() => idx >= 0 && goTo(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentChapter === ch.number
                      ? "bg-[#e63946]/20 text-[#e63946]"
                      : "text-white/60 hover:text-white bg-white/5 hover:bg-white/10"
                  }`}
                >
                  Ch.{ch.number}
                </button>
              );
            })}
          </div>

          {/* Page input */}
          <input
            type="number"
            min={1}
            placeholder="#"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handlePageInput}
            className="w-14 px-2 py-1.5 text-xs text-white bg-white/5 border border-white/[0.12] rounded-lg text-center focus:outline-none focus:border-[#e63946] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-4 py-1.5 text-xs font-medium transition ${
              exporting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {exporting ? "Exporting..." : "Export Chapter"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-red-400 text-sm flex justify-between flex-shrink-0">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-300 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#060610]">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-24 flex items-center justify-center rounded-lg transition-all ${
            currentIdx === 0
              ? "opacity-0 pointer-events-none"
              : "opacity-0 hover:opacity-100 bg-white/5 text-white/30 hover:bg-white/15 hover:text-white"
          }`}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onClick={handleClickNav}
        >
          {renderContent()}
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          disabled={currentIdx >= totalPages - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-24 flex items-center justify-center rounded-lg transition-all ${
            currentIdx >= totalPages - 1
              ? "opacity-0 pointer-events-none"
              : "opacity-0 hover:opacity-100 bg-white/5 text-white/30 hover:bg-white/15 hover:text-white"
          }`}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchStory,
  fetchStatus,
  type Story,
  type StatusCounts,
} from "@/lib/api";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08]">
      <p className="text-sm text-white/60 mb-2">{label}</p>
      <p className="text-4xl font-bold text-[#e63946]">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [story, setStory] = useState<Story | null>(null);
  const [status, setStatus] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStory().catch(() => null),
      fetchStatus().catch(() => null),
    ])
      .then(([s, st]) => {
        if (s) setStory(s);
        if (st) setStatus(st);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pagesWritten = story?.pages.length ?? 0;
  const totalPanels = story?.pages.reduce((a, p) => a + p.panels.length, 0) ?? 0;
  const panelsGenerated = status?.panels_done ?? 0;
  const pagesCompleted = (status?.composited ?? 0) + (status?.text_added ?? 0);

  const recentPages = (story?.pages ?? []).slice(-5).reverse();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard label="Pages Written" value={pagesWritten} />
        <StatCard label="Total Panels" value={totalPanels} />
        <StatCard label="Pages Completed" value={pagesCompleted} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Link
          href="/story"
          className="bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-6 py-3 font-semibold transition text-center"
        >
          New Page
        </Link>
        <Link
          href="/generate"
          className="bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-6 py-3 font-semibold transition text-center"
        >
          Generate All Pending
        </Link>
        <Link
          href="/viewer"
          className="bg-[#e63946] hover:bg-[#ff4d5a] rounded-lg px-6 py-3 font-semibold transition text-center"
        >
          Preview Chapter
        </Link>
      </div>

      {/* Pipeline Status */}
      {status && (
        <div className="bg-[#12121e] rounded-xl p-5 border border-white/[0.08] mb-10 flex items-center gap-6 text-sm flex-wrap">
          <span className="text-white/60">
            Pending: <span className="text-white font-semibold">{status.pending}</span>
          </span>
          <span className="text-white/60">
            Panels Done: <span className="text-blue-400 font-semibold">{status.panels_done}</span>
          </span>
          <span className="text-white/60">
            Composited: <span className="text-emerald-400 font-semibold">{status.composited}</span>
          </span>
          <span className="text-white/60">
            Text Added: <span className="text-purple-400 font-semibold">{status.text_added}</span>
          </span>
        </div>
      )}

      {/* Recent Pages */}
      <h2 className="text-xl font-semibold mb-4">Recent Pages</h2>
      {recentPages.length === 0 ? (
        <div className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08] text-white/40 text-center">
          No pages yet. Head to the Story Editor to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {recentPages.map((page) => (
            <div
              key={page.page_number}
              className="bg-[#12121e] rounded-xl p-5 border border-white/[0.08] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-white/5 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/20 text-xs font-bold">
                  {page.page_number}
                </div>
                <div>
                  <p className="font-semibold">Page {page.page_number}</p>
                  <p className="text-sm text-white/40 mt-0.5 line-clamp-1 max-w-md">
                    {page.scene_description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">
                  {page.panels.length} panel{page.panels.length !== 1 ? "s" : ""} &middot; Layout {page.layout}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

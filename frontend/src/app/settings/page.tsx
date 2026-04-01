"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSettings, saveSettings, type Settings } from "@/lib/api";

const CHARACTER_ANCHOR =
  "anime manga illustration, Japanese teenage girl named Riku, long flowing crimson red hair, sharp golden amber eyes, curvy athletic figure, dark navy sailor school uniform seifuku, fitted short skirt, slightly unbuttoned collar showing collarbone, white collar with red ribbon, wielding a silver katana with red tassel, Demon Slayer art style, ultra detailed, vibrant colors";

const DEFAULT_SETTINGS: Settings = {
  higgsfield_api_key: "",
  vertex_api_key: "",
  provider: "higgsfield",
  character_anchor: CHARACTER_ANCHOR,
  page_width: 1200,
  page_height: 1800,
  gutter_size: 10,
};

type Toast = { visible: boolean; message: string; type: "success" | "error" };

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHiggsKey, setShowHiggsKey] = useState(false);
  const [showVertexKey, setShowVertexKey] = useState(false);
  const [toast, setToast] = useState<Toast>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3000);
  }, []);

  useEffect(() => {
    fetchSettings()
      .then((data) => setForm({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => showToast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(form);
      showToast("Settings saved successfully", "success");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const aspectRatio = (form.page_width as number) / (form.page_height as number);
  const previewH = 120;
  const previewW = Math.round(previewH * aspectRatio);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full bg-[#080810] border border-white/[0.08] rounded-lg p-3 text-white focus:outline-none focus:border-[#e63946]/50";

  return (
    <div>
      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#e63946] hover:bg-[#ff4d5a] disabled:opacity-50 rounded-lg px-6 py-3 font-semibold transition"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* API Keys */}
        <section className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-6">API Keys</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Higgsfield API Key
              </label>
              <div className="relative">
                <input
                  type={showHiggsKey ? "text" : "password"}
                  value={form.higgsfield_api_key}
                  onChange={(e) => update("higgsfield_api_key", e.target.value)}
                  placeholder="Enter your Higgsfield API key"
                  className={inputClass + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowHiggsKey(!showHiggsKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs"
                >
                  {showHiggsKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Google Vertex AI Key
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-white/[0.06] text-white/40 border border-white/[0.08]">
                  Coming Soon
                </span>
              </label>
              <div className="relative">
                <input
                  type={showVertexKey ? "text" : "password"}
                  value={form.vertex_api_key}
                  onChange={(e) => update("vertex_api_key", e.target.value)}
                  placeholder="Enter your Vertex AI key"
                  className={inputClass + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowVertexKey(!showVertexKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-xs"
                >
                  {showVertexKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Image Provider */}
        <section className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-6">Image Provider</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => update("provider", "higgsfield")}
              className={`text-left p-4 rounded-lg border transition ${
                form.provider === "higgsfield"
                  ? "border-[#e63946] bg-[#e63946]/10"
                  : "border-white/[0.08] bg-[#080810] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    form.provider === "higgsfield"
                      ? "border-[#e63946]"
                      : "border-white/30"
                  }`}
                >
                  {form.provider === "higgsfield" && (
                    <div className="w-2 h-2 rounded-full bg-[#e63946]" />
                  )}
                </div>
                <span className="font-medium">Higgsfield</span>
              </div>
              <p className="text-sm text-white/40 ml-7">
                Manga-style image generation with nano-banana-pro model.
              </p>
            </button>

            <div className="text-left p-4 rounded-lg border border-white/[0.08] bg-[#080810] opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                <span className="font-medium text-white/50">Vertex AI</span>
                <span className="px-2 py-0.5 rounded text-xs bg-white/[0.06] text-white/40 border border-white/[0.08]">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-white/30 ml-7">
                Google Vertex AI image generation.
              </p>
            </div>
          </div>
        </section>

        {/* Character Anchor */}
        <section className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold">Character Anchor Prompt</h2>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs text-white/40">
              Read-only
            </span>
          </div>
          <textarea
            readOnly
            value={form.character_anchor}
            className={inputClass + " min-h-[140px] resize-none cursor-default"}
            rows={5}
          />
          <p className="text-xs text-white/30 mt-3">
            This prompt is prepended to every panel generation to maintain
            character consistency.
          </p>
        </section>

        {/* Page Dimensions */}
        <section className="bg-[#12121e] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-6">Page Dimensions</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={form.page_width as number}
                  onChange={(e) =>
                    update("page_width", Number(e.target.value) || 0)
                  }
                  min={100}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={form.page_height as number}
                  onChange={(e) =>
                    update("page_height", Number(e.target.value) || 0)
                  }
                  min={100}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Gutter Size (px)
                </label>
                <input
                  type="number"
                  value={form.gutter_size as number}
                  onChange={(e) =>
                    update("gutter_size", Number(e.target.value) || 0)
                  }
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center sm:min-w-[160px]">
              <p className="text-sm font-medium text-white/60 mb-3">Preview</p>
              <div
                className="border-2 border-dashed border-white/20 rounded-md bg-white/[0.02] flex items-center justify-center"
                style={{
                  width: `${Math.max(previewW, 40)}px`,
                  height: `${previewH}px`,
                }}
              >
                <span className="text-xs text-white/30 font-mono">
                  {form.page_width as number}x{form.page_height as number}
                </span>
              </div>
              <p className="text-xs text-white/30 mt-2 font-mono">
                {aspectRatio.toFixed(2)}:1
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

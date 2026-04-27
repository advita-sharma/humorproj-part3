"use client";

import { useState } from "react";
import Image from "next/image";
import { FlaskConical, Loader2, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageRecord {
  id: string;
  url: string;
  image_description: string | null;
}

interface Caption {
  id: string;
  content: string;
  humor_flavor_id: number | null;
}

interface TestRunnerProps {
  images: ImageRecord[];
  flavorId: number;
  flavorSlug: string;
}

export function TestRunner({ images, flavorId, flavorSlug }: TestRunnerProps) {
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setCaptions([]);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated. Please refresh and try again.");
        return;
      }

      const res = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-captions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageId: selectedImage.id, humorFlavorId: flavorId }),
        }
      );

      if (!res.ok) {
        let message = `Request failed with status ${res.status}.`;
        try {
          const body = await res.json();
          if (typeof body?.message === "string") message = body.message;
        } catch {
          // non-JSON body — keep default message
        }
        setError(message);
        return;
      }

      const data: Caption[] = await res.json();
      // Filter to show captions for this specific flavor first, then others
      const flavorCaptions = data.filter((c) => c.humor_flavor_id === flavorId);
      const otherCaptions = data.filter((c) => c.humor_flavor_id !== flavorId);
      setCaptions([...flavorCaptions, ...otherCaptions]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Image selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          Select a Test Image
        </h2>

        {images.length === 0 ? (
          <p className="text-[var(--muted)] text-sm">No public images available.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--card-border)] p-3 bg-[var(--card)]">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setSelectedImage(img);
                  setCaptions([]);
                  setError(null);
                  setSuccess(false);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImage?.id === img.id
                    ? "border-[var(--accent)] scale-95"
                    : "border-transparent hover:border-[var(--card-border)]"
                }`}
                title={img.image_description ?? img.id}
              >
                <Image
                  src={img.url}
                  alt={img.image_description ?? "Test image"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected image preview */}
      {selectedImage && (
        <div className="flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
            <Image
              src={selectedImage.url}
              alt="Selected"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              Selected Image
            </p>
            <p className="text-[var(--foreground)] text-sm font-mono text-xs truncate">
              {selectedImage.id}
            </p>
            {selectedImage.image_description ? (
              <p className="text-[var(--muted)] text-xs mt-1 line-clamp-3">
                {selectedImage.image_description}
              </p>
            ) : (
              <p className="text-amber-500 text-xs mt-1">
                This image has no description — captions cannot be generated without one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!selectedImage || !selectedImage.image_description || loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FlaskConical size={16} />
        )}
        {loading ? "Generating…" : "Generate Captions"}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {success && captions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              {captions.length} caption{captions.length !== 1 ? "s" : ""} generated
            </h2>
          </div>

          <div className="space-y-2">
            {captions.map((caption, i) => (
              <div
                key={caption.id ?? i}
                className={`rounded-xl border p-4 ${
                  caption.humor_flavor_id === flavorId
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                    : "border-[var(--card-border)] bg-[var(--card)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[var(--foreground)] text-sm leading-relaxed">
                    {caption.content}
                  </p>
                  {caption.humor_flavor_id === flavorId && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-medium">
                      {flavorSlug}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {success && captions.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
          <p className="text-[var(--muted)] text-sm">
            No captions were generated. Check the humor flavor mix configuration.
          </p>
        </div>
      )}
    </div>
  );
}

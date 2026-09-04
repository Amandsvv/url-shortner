"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type CreateUrlResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    shortCode: string;
    originalUrl: string;
    ownerId: string | null;
    active: boolean;
    expiresAt: string;
  };
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setShortUrl("");

    if (!url.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await apiFetch<CreateUrlResponse>(
          "/api/v1/urls",
          {
            method: "POST",
            body: JSON.stringify({
              originalUrl: url.trim(),
            }),
          },
        );

      setShortUrl(
        `${process.env.NEXT_PUBLIC_APP_URL}/${response.data.shortCode}`,
      );

      setUrl("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-page)]">
      {/* Navbar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-dark)] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            shortest
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
              className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white/10"
            >
              Log in
            </a>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
              className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-black transition hover:bg-[var(--color-accent-hover)]"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center px-6 pb-24 pt-20">
        <div className="w-full max-w-5xl">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-[#ececea] px-4 py-2 text-xs tracking-wide text-[var(--color-muted)]">
              Quick. Clean. Shareable.
            </div>

            <h1 className="mt-7 text-5xl font-medium tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Create{" "}
              <span className="rounded-lg bg-[var(--color-accent)] px-2">
                Shortest URLs
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              The easiest and smartest link shortener to
              instantly track, customize, and share your URLs
              with style.
            </p>
          </div>

          {/* URL form */}
          <div className="mx-auto mt-16 max-w-4xl">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 rounded-full bg-white p-2 shadow-sm ring-1 ring-black/5 sm:flex-row">
                <input
                  type="url"
                  required
                  value={url}
                  disabled={loading}
                  onChange={(event) =>
                    setUrl(event.target.value)
                  }
                  placeholder="Enter long link here..."
                  className="min-w-0 flex-1 rounded-full bg-transparent px-5 py-4 text-sm outline-none placeholder:text-[#a7a7a2] disabled:opacity-50"
                />

                <div className="hidden items-center border-l border-[var(--color-border)] pl-4 pr-2 text-xs text-[var(--color-muted)] sm:flex">
                  Select short type
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[var(--color-accent)] px-7 py-4 text-sm font-medium text-black transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Shortening..." : "Shorten URL ↗"}
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] text-[var(--color-muted)]">
                By clicking &quot;Shorten URL&quot;, you agree to our
                Terms of Use and Privacy Policy.
              </p>
            </form>

            {error && (
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {shortUrl && (
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  Your shortened URL
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm font-medium underline underline-offset-4"
                  >
                    {shortUrl}
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(shortUrl)
                    }
                    className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs transition hover:bg-black hover:text-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-24 text-center text-xs text-[var(--color-muted)]">
            ↓
          </div>
        </div>
      </section>
    </main>
  );
}
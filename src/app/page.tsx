"use client";

import * as React from "react";
import LabChat from "@/components/lab-chat";
import Settings, { createDefaultResources, type ResourceConfig } from "@/components/settings";

type Page = "chat" | "settings";

export default function Home() {
  const [activePage, setActivePage] = React.useState<Page>("chat");
  const [resources, setResources] = React.useState<ResourceConfig>(createDefaultResources);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-neutral-200 bg-white px-3 py-6">
        <div className="mb-8 px-3">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">
            Throughput
          </p>
          <p className="font-display text-lg font-semibold text-ink">
            Architect
          </p>
        </div>

        <nav className="grid gap-1">
          <button
            onClick={() => setActivePage("chat")}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${activePage === "chat"
                ? "bg-terracotta/10 text-terracotta"
                : "text-neutral-600 hover:bg-neutral-100"
              }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Lab Chat
          </button>
          <button
            onClick={() => setActivePage("settings")}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${activePage === "settings"
                ? "bg-terracotta/10 text-terracotta"
                : "text-neutral-600 hover:bg-neutral-100"
              }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </button>
        </nav>

        <div className="mt-auto px-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            {resources.stackers.filter((s) => s.active).length * 13} plates ready
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-ink">
              {activePage === "chat" ? "Lab Chat" : "Resource Settings"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {activePage === "chat"
                ? "Upload CSV workflows and optimize plate scheduling"
                : "Configure stackers and robot arm availability"}
            </p>
          </header>

          {activePage === "chat" ? (
            <LabChat resources={resources} />
          ) : (
            <Settings resources={resources} onResourcesChange={setResources} />
          )}
        </div>
      </main>
    </div>
  );
}

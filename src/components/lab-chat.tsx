"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimelineView, formatDuration } from "@/components/timeline-view";
import { calculateOptimalPipelining } from "@/lib/simulation";
import type {
    LabWorkflowTask,
    ParsedWorkflow,
    SimulationResult
} from "@/lib/types";
import type { ResourceConfig } from "@/components/settings";

const STAGGER_STEP_SEC = 10;

interface ChatMessage {
    id: string;
    role: "user" | "system" | "bot";
    content: string;
    type: "text" | "result" | "upload";
    simResults?: SimulationResult;
    summary?: string;
    tasks?: LabWorkflowTask[];
    fileName?: string;
}

interface LabChatProps {
    resources: ResourceConfig;
}

export default function LabChat({ resources }: LabChatProps) {
    const [messages, setMessages] = React.useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "system",
            content: "Ready to optimize. Upload your CSV file or paste workflow data below.",
            type: "text"
        }
    ]);
    const [inputText, setInputText] = React.useState("");
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const plateCount = resources.stackers
        .filter((s) => s.active)
        .reduce((sum, s) => sum + s.plates, 0);

    const addMessage = (msg: Omit<ChatMessage, "id">) => {
        const newMsg = { ...msg, id: `msg-${Date.now()}-${Math.random()}` };
        setMessages((prev) => [...prev, newMsg]);
        return newMsg.id;
    };

    const processCSV = async (csvContent: string, fileName?: string) => {
        if (!csvContent.trim() || isProcessing) return;

        if (!resources.robot.active) {
            addMessage({
                role: "system",
                content: "⚠️ Robot arm is offline. Enable it in Settings to run simulations.",
                type: "text"
            });
            return;
        }

        setIsProcessing(true);

        // User upload/paste message
        if (fileName) {
            addMessage({
                role: "user",
                content: `Uploaded: ${fileName}`,
                type: "upload",
                fileName
            });
        } else {
            const snippet = csvContent.slice(0, 60) + (csvContent.length > 60 ? "..." : "");
            addMessage({
                role: "user",
                content: snippet,
                type: "text"
            });
        }

        // Parsing message
        addMessage({
            role: "system",
            content: `Parsing ${plateCount}-plate workflow...`,
            type: "text"
        });

        try {
            const parseResponse = await fetch("/api/parse-workflow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ csv: csvContent })
            });
            const parseData: ParsedWorkflow | { error: string } = await parseResponse.json();

            if (!parseResponse.ok || "error" in parseData) {
                const errorMsg = "error" in parseData ? parseData.error : "Unable to parse CSV";
                addMessage({
                    role: "system",
                    content: `❌ Parse error: ${errorMsg}`,
                    type: "text"
                });
                setIsProcessing(false);
                return;
            }

            // Simulating message - exact wording as requested
            addMessage({
                role: "system",
                content: "Simulating different scenarios...",
                type: "text"
            });

            // Small delay to show the message
            await new Promise((resolve) => setTimeout(resolve, 500));

            const simResult = calculateOptimalPipelining(parseData.manifest.tasks, {
                plates: plateCount,
                staggerStepSec: STAGGER_STEP_SEC
            });

            // Fetch summary
            let summaryText = "";
            try {
                const explainResponse = await fetch("/api/explain", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tasks: parseData.manifest.tasks,
                        staggerSec: simResult.staggerSec,
                        sequentialMakespanSec: simResult.sequentialMakespanSec,
                        pipelinedMakespanSec: simResult.pipelinedMakespanSec
                    })
                });
                const explainData = await explainResponse.json();
                if (explainData.summary) {
                    summaryText = explainData.summary;
                }
            } catch {
                // Summary is optional
            }

            // Result message
            addMessage({
                role: "bot",
                content: "Optimization complete",
                type: "result",
                simResults: simResult,
                summary: summaryText,
                tasks: parseData.manifest.tasks
            });

            setInputText("");
        } catch (error) {
            addMessage({
                role: "system",
                content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                type: "text"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            processCSV(content, file.name);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith(".csv")) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleSubmit = () => {
        processCSV(inputText);
    };

    const calculateGain = (sim: SimulationResult) => {
        if (sim.sequentialMakespanSec === 0) return 0;
        return Math.round(
            ((sim.sequentialMakespanSec - sim.pipelinedMakespanSec) /
                sim.sequentialMakespanSec) *
            100
        );
    };

    return (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] flex-col">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4">
                <div className="grid gap-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.type === "result" && msg.simResults ? (
                                <Card className="w-full max-w-lg border-[#E5E5E5] bg-[#F9F9F9]">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-lg font-bold text-terracotta">
                                                Throughput Gain: {calculateGain(msg.simResults)}%
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                {formatDuration(msg.simResults.pipelinedMakespanSec)}
                                            </span>
                                        </div>
                                        <TimelineView simulation={msg.simResults} compact />
                                        {msg.summary && (
                                            <p className="mt-3 text-sm text-neutral-600">{msg.summary}</p>
                                        )}
                                        {msg.simResults.collisions.length > 0 && (
                                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                                ⚠️ {msg.simResults.collisions.length} collision(s) detected
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : msg.type === "upload" ? (
                                <div className="flex items-center gap-2 rounded-2xl bg-terracotta px-4 py-2 text-sm text-white">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {msg.content}
                                </div>
                            ) : (
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                            ? "bg-terracotta text-white"
                                            : msg.role === "system"
                                                ? "bg-neutral-100 text-neutral-600"
                                                : "bg-neutral-800 text-white"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Dropzone & Input area */}
            <div className="mt-4 grid gap-3">
                {/* File Dropzone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${isDragOver
                            ? "border-terracotta bg-terracotta/5"
                            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                        disabled={isProcessing}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-neutral-600">
                            <span className="font-medium text-terracotta">Click to upload</span> or drag CSV file here
                        </p>
                        <p className="text-xs text-neutral-400">
                            Required columns: Task Name, Task Type, Resource Used, Start Time, End Time
                        </p>
                    </div>
                </div>

                {/* Text input fallback */}
                <div className="grid gap-2">
                    <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Or paste your CSV workflow here..."
                        className="min-h-[80px] resize-none text-sm"
                        disabled={isProcessing}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                            {plateCount} plates configured •{" "}
                            {resources.robot.active ? "Robot online" : "Robot offline"}
                            {!resources.incubator.active && " • Incubator in maintenance"}
                        </span>
                        <Button
                            onClick={handleSubmit}
                            disabled={isProcessing || !inputText.trim()}
                            className="px-6"
                        >
                            {isProcessing ? "Processing..." : "Run Optimization"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

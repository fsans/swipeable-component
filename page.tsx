"use client";

import * as React from "react";
import { Trash2, Archive, Flag, RotateCcw, Mail, Star, X } from "lucide-react";
import { SwipeableItem, type SwipeAction } from "@/components/ui/swipeable-item";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
}

const INITIAL_EMAILS: Email[] = [
  { id: 1, sender: "Sarah Chen", subject: "Re: Q4 Design Review", preview: "Looks great! I think we should also add…", time: "10:24 AM", read: false, starred: true },
  { id: 2, sender: "Anthropic", subject: "Welcome to Claude Pro", preview: "Thanks for upgrading. Here's what's new…", time: "9:15 AM", read: true, starred: false },
  { id: 3, sender: "James Rivera", subject: "Flight Confirmation", preview: "Your booking for Barcelona → Madrid is…", time: "Yesterday", read: false, starred: false },
  { id: 4, sender: "GitHub", subject: "Pull request #42 updated", preview: "miguelbernal pushed new commits to…", time: "Yesterday", read: true, starred: false },
  { id: 5, sender: "Notion", subject: "Weekly digest", preview: "Here's a summary of activity across your…", time: "Mon", read: true, starred: true },
  { id: 6, sender: "Lena Marcos", subject: "Dinner tonight?", preview: "Hey! Still on for 8pm at that new place?", time: "Mon", read: false, starred: false },
  { id: 7, sender: "Stripe", subject: "Payment received", preview: "A payment of €240.00 was received for…", time: "Sun", read: true, starred: false },
  { id: 8, sender: "Tom Akers", subject: "Project kickoff", preview: "Let's schedule a sync this week to align…", time: "Sun", read: true, starred: false },
];

// ---------------------------------------------------------------------------
// Toast (lightweight – swap for your own toast provider if you have one)
// ---------------------------------------------------------------------------
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white"
      style={{ background: "rgba(24,24,27,.92)", backdropFilter: "blur(12px)", animation: "toastSlide .22s cubic-bezier(.4,0,.2,1)" }}
    >
      <Mail size={14} />
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo page
// ---------------------------------------------------------------------------
export default function SwipeableMailDemo() {
  const [emails, setEmails] = React.useState<Email[]>(INITIAL_EMAILS);
  const [toast, setToast] = React.useState<string | null>(null);
  // simple undo stack – stores the removed email + its former index
  const undoRef = React.useRef<{ email: Email; index: number } | null>(null);

  // -- action factories ------------------------------------------------
  // We build the action arrays *inside* the map so each row closes over its own email.
  const makeTrailing = (email: Email): SwipeAction[] => [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 size={18} />,
      color: "bg-red-500",
      onAction: () => {
        const idx = emails.findIndex((e) => e.id === email.id);
        undoRef.current = { email, index: idx };
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        setToast("Deleted");
      },
    },
    {
      id: "cancel",
      label: "Cancel",
      icon: <RotateCcw size={18} />,
      color: "bg-gray-500",
      onAction: () => {
        // programmatic snap-back is handled by the component itself;
        // this button simply does nothing extra – the row resets on its own
        // because the action band disappears when offset returns to 0.
        // If you need an explicit reset ref, expose an imperative handle later.
      },
    },
  ];

  const makeLeading = (email: Email): SwipeAction[] => [
    {
      id: "archive",
      label: "Archive",
      icon: <Archive size={18} />,
      color: "bg-blue-500",
      onAction: () => {
        const idx = emails.findIndex((e) => e.id === email.id);
        undoRef.current = { email, index: idx };
        setEmails((prev) => prev.filter((e) => e.id !== email.id));
        setToast("Archived");
      },
    },
    {
      id: "flag",
      label: "Flag",
      icon: <Flag size={18} />,
      color: "bg-amber-500",
      onAction: () => {
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, starred: !e.starred } : e))
        );
        setToast(email.starred ? "Unflagged" : "Flagged");
      },
    },
  ];

  const handleUndo = () => {
    if (!undoRef.current) return;
    const { email, index } = undoRef.current;
    setEmails((prev) => {
      const next = [...prev];
      next.splice(index, 0, email);
      return next;
    });
    undoRef.current = null;
    setToast("Undone");
  };

  // -- render ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <style>{`
        @keyframes toastSlide {
          from { opacity:0; transform: translateX(-50%) translateY(10px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inbox</h1>
          <div className="flex items-center gap-3">
            {emails.filter((e) => !e.read).length > 0 && (
              <span className="text-xs font-semibold text-white bg-blue-500 rounded-full px-2 py-0.5">
                {emails.filter((e) => !e.read).length}
              </span>
            )}
            {undoRef.current && (
              <button onClick={handleUndo} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                <RotateCcw size={11} /> Undo
              </button>
            )}
          </div>
        </div>

        {/* hint */}
        <p className="text-center text-xs text-gray-400 mb-3">
          ← swipe left to delete &nbsp;·&nbsp; swipe right to archive / flag →
        </p>

        {/* list */}
        <div className="rounded-2xl overflow-hidden shadow-sm bg-white">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Mail size={40} className="opacity-30 mb-3" />
              <p className="text-sm font-medium">All clear</p>
              <p className="text-xs mt-1">Press <strong>Undo</strong> to restore a message</p>
            </div>
          ) : (
            emails.map((email) => (
              <SwipeableItem
                key={email.id}
                variant="default"
                size="md"
                trailingActions={makeTrailing(email)}
                leadingActions={makeLeading(email)}
              >
                {/* ── row content (your own markup) ── */}
                <div className="flex items-center w-full px-4">
                  {/* unread indicator */}
                  <div className="w-2.5 mr-3 flex justify-center">
                    {!email.read && <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-0.5" />}
                  </div>

                  {/* text block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-sm", email.read ? "text-gray-500" : "font-semibold text-gray-900")}>
                        {email.sender}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">{email.time}</span>
                    </div>
                    <p className={cn("truncate text-sm", email.read ? "text-gray-400" : "font-medium text-gray-700")}>
                      {email.subject}
                    </p>
                    <p className="truncate text-xs text-gray-400 mt-0.5">{email.preview}</p>
                  </div>

                  {/* star */}
                  <Star size={16} className={cn("ml-3 shrink-0", email.starred ? "text-amber-400 fill-amber-400" : "text-gray-300")} />
                </div>
              </SwipeableItem>
            ))
          )}
        </div>
      </div>

      {/* toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

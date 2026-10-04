"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PremiumTextareaProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxWords?: number;
  rows?: number;
  className?: string;
  inputClassName?: string;
};

const COMMON_EMOJIS = [
  // Construction, buildings & real estate
  "🏗️",
  "🧱",
  "🏘️",
  "🏙️",
  "🌆",
  "🌇",
  "🌃",
  "🏠",
  "🏡",
  "🏢",
  "🏣",
  "🏤",
  "🏥",
  "🏦",
  "🏨",
  "🏩",
  "🏪",
  "🏫",
  "🏬",
  "🏭",
  "🏯",
  "🏰",
  "💒",
  "🗼",
  "🗽",
  "⛪",
  "🕌",
  "🛕",
  "🕍",
  "⛩️",
  "🕋",
  "⛺",
  "🏕️",
  "🏞️",
  "🏔️",
  "🗻",
  "🌋",
  "🏝️",
  "🏜️",
  "🏟️",
  "🏛️",
  "🏗️",
  "🧱",
  "🪵",
  "🪨",
  "🪟",
  "🚪",
  "🪞",
  "🛏️",
  "🛋️",
  "🪑",
  "🚽",
  "🚿",
  "🛁",
  "🧼",
  "🔑",
  "🗝️",
  "🔐",
  "🔒",
  "🔓",
  "🪧",
  "📍",
  "📌",
  "🗺️",
  "🧭",
  // Tools, equipment & vehicles
  "🛠️",
  "🔧",
  "🔨",
  "⚒️",
  "🪛",
  "🪚",
  "🪓",
  "⛏️",
  "🔩",
  "⚙️",
  "🧰",
  "🧲",
  "🪜",
  "🪣",
  "🧴",
  "🧹",
  "🪠",
  "🪤",
  "🧯",
  "🦺",
  "👷",
  "👷‍♂️",
  "👷‍♀️",
  "👨‍🔧",
  "👩‍🔧",
  "🚚",
  "🚛",
  "🚜",
  "🏗️",
  "🚔",
  "🚗",
  "🚙",
  "🚐",
  "🛻",
  "🏎️",
  "🛵",
  "🚲",
  "🛴",
  "🚁",
  "✈️",
  "🛩️",
  "🚢",
  "⚓",
  "🚧",
  "🚦",
  "🚥",
  "🛑",
  "⚠️",
  "⛔",
  "🚫",
  // Design, art & drafting
  "🎨",
  "🖌️",
  "🖍️",
  "🖊️",
  "🖋️",
  "✏️",
  "✒️",
  "📝",
  "📐",
  "📏",
  "🧮",
  "📌",
  "📎",
  "🖇️",
  "📋",
  "📁",
  "📂",
  "🗂️",
  "🗃️",
  "🗄️",
  "📊",
  "📈",
  "📉",
  "🗒️",
  "🗓️",
  "📅",
  "📆",
  "⏰",
  "⏱️",
  "⏲️",
  "🕐",
  "🖼️",
  "🎭",
  "🧵",
  "🧶",
  "🪡",
  "✂️",
  "🔗",
  "🧿",
  "💎",
  "💍",
  "👑",
  "💡",
  "🔦",
  "🕯️",
  "🪔",
  "☀️",
  "🌙",
  "⭐",
  "🌟",
  "✨",
  "💫",
  "🌈",
  "🪴",
  "🌱",
  "🌲",
  "🌳",
  "🌴",
  "🌵",
  "🌾",
  "🌿",
  "☘️",
  "🍀",
  "🍃",
  "🍂",
  "🍁",
  "🌸",
  "🌺",
  "🌻",
  "🌹",
  "🌷",
  "🌼",
  "💐",
  "💧",
  "🌊",
  "🔥",
  "⚡",
  "💥",
  // Business & communication
  "💼",
  "💰",
  "💵",
  "💴",
  "💶",
  "💷",
  "💳",
  "🧾",
  "📦",
  "📫",
  "📬",
  "📭",
  "📮",
  "✉️",
  "📧",
  "📨",
  "📩",
  "📤",
  "📥",
  "📞",
  "📱",
  "☎️",
  "📠",
  "💻",
  "🖥️",
  "🖨️",
  "⌨️",
  "🖱️",
  "💾",
  "💿",
  "📡",
  "🛰️",
  "✅",
  "☑️",
  "✔️",
  "❌",
  "❎",
  "❗",
  "❓",
  "‼️",
  "⁉️",
  "💯",
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "🎖️",
  "🏅",
  "🎯",
  "🚀",
  "🎉",
  "🎊",
  "🎈",
  "🎁",
  // Common reactions
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😜",
  "😝",
  "😛",
  "🤑",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "🤐",
  "🤨",
  "😐",
  "😑",
  "😶",
  "😏",
  "😒",
  "🙄",
  "😬",
  "😮",
  "😯",
  "😲",
  "😳",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "👍",
  "👎",
  "👏",
  "🙌",
  "🤝",
  "🙏",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "👌",
  "🤌",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "✋",
  "🤚",
  "🖐",
  "🖖",
  "👋",
  "🤙",
  "💪",
  "🦾",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "💔",
  "❣️",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
];

/** Deduplicate while preserving order (some symbols repeat across groups). */
const PICKER_EMOJIS = Array.from(new Set(COMMON_EMOJIS));

function countWords(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function trimToMaxWords(input: string, maxWords: number): string {
  const tokens = input.trim().split(/\s+/);
  if (tokens.length <= maxWords) return input;
  return tokens.slice(0, maxWords).join(" ");
}

export function PremiumTextarea({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  maxWords = 1000,
  rows = 5,
  className = "",
  inputClassName = "",
}: PremiumTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const wordCount = useMemo(() => countWords(value), [value]);

  const updateValue = (next: string) => {
    const limited = trimToMaxWords(next, maxWords);
    onChange(limited);
  };

  const insertAtCursor = (chunk: string) => {
    const el = ref.current;
    if (!el) {
      updateValue(`${value}${chunk}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${chunk}${value.slice(end)}`;
    updateValue(next);
    requestAnimationFrame(() => {
      const pos = start + chunk.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const pickEmoji = (emoji: string) => {
    insertAtCursor(emoji);
    setPickerOpen(false);
  };

  useEffect(() => {
    if (!pickerOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pickerOpen]);

  return (
    <div ref={rootRef} className={`premium-textarea ${className}`.trim()}>
      <div className="premium-textarea__box">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => updateValue(e.target.value)}
          className={`premium-textarea__input ${inputClassName}`.trim()}
          placeholder={placeholder}
        />
      </div>
      <div className="premium-textarea__toolbar">
        <div className="premium-textarea__emoji-wrap">
          <button
            type="button"
            className="premium-textarea__icon premium-textarea__icon--emoji"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Open emoji picker"
            aria-expanded={pickerOpen}
            aria-haspopup="dialog"
            title="Pick emoji"
          >
            🙂
          </button>
          {pickerOpen && (
            <div
              className="premium-textarea__picker"
              role="dialog"
              aria-label="Emoji picker"
            >
              <div className="premium-textarea__picker-grid">
                {PICKER_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="premium-textarea__picker-btn"
                    onClick={() => pickEmoji(emoji)}
                    title={emoji}
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <span
          className={`premium-textarea__count ${wordCount >= maxWords ? "is-limit" : ""}`}
        >
          {wordCount}/{maxWords} words
        </span>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];

  let i = 0;
  while (i < text.length) {
    const codeStart = text.indexOf('`', i);
    const boldStart = text.indexOf('**', i);

    const next =
      codeStart === -1
        ? boldStart
        : boldStart === -1
          ? codeStart
          : Math.min(codeStart, boldStart);

    if (next === -1) {
      parts.push(text.slice(i));
      break;
    }

    if (next > i) parts.push(text.slice(i, next));

    if (next === codeStart) {
      const end = text.indexOf('`', codeStart + 1);
      if (end === -1) {
        parts.push(text.slice(codeStart));
        break;
      }
      const inner = text.slice(codeStart + 1, end);
      parts.push(
        <code key={`c-${codeStart}`} className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">
          {inner}
        </code>,
      );
      i = end + 1;
      continue;
    }

    if (next === boldStart) {
      const end = text.indexOf('**', boldStart + 2);
      if (end === -1) {
        parts.push(text.slice(boldStart));
        break;
      }
      const inner = text.slice(boldStart + 2, end);
      parts.push(
        <strong key={`b-${boldStart}`} className="font-semibold">
          {inner}
        </strong>,
      );
      i = end + 2;
      continue;
    }
  }

  return parts;
}

export function renderSimpleMarkdown(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  const blocks: ReactNode[] = [];
  let currentList: ReactNode[] | null = null;

  function flushList() {
    if (!currentList) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1">
        {currentList.map((n, idx) => (
          <li key={idx}>{n}</li>
        ))}
      </ul>,
    );
    currentList = null;
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      blocks.push(<div key={`sp-${idx}`} className="h-2" />);
      return;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      const item = renderInline(listMatch[1]);
      currentList = currentList || [];
      currentList.push(<span key={`li-${idx}`}>{item}</span>);
      return;
    }

    flushList();

    const h3 = /^###\s+(.+)$/.exec(trimmed);
    if (h3) {
      blocks.push(
        <h3 key={`h3-${idx}`} className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
          {renderInline(h3[1])}
        </h3>,
      );
      return;
    }

    const h2 = /^##\s+(.+)$/.exec(trimmed);
    if (h2) {
      blocks.push(
        <h2 key={`h2-${idx}`} className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-2">
          {renderInline(h2[1])}
        </h2>,
      );
      return;
    }

    const h1 = /^#\s+(.+)$/.exec(trimmed);
    if (h1) {
      blocks.push(
        <h1 key={`h1-${idx}`} className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-2">
          {renderInline(h1[1])}
        </h1>,
      );
      return;
    }

    blocks.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
}

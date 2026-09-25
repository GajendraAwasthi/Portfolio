'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { TerminalCommand } from '@/types/portfolio';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: TerminalCommand[];
  resumeUrl: string;
}

interface TerminalLog {
  id: string;
  type: 'input' | 'output';
  text: string;
}

export default function TerminalModal({
  isOpen,
  onClose,
  commands,
  resumeUrl,
}: TerminalModalProps) {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: '1', type: 'output', text: '┌─ Gajendra\'s Portfolio Interactive Terminal ─┐' },
    { id: '2', type: 'output', text: 'Welcome to Interactive CLI Mode!' },
    { id: '3', type: 'output', text: 'Type "help" for available commands.\n' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    const newLogs: TerminalLog[] = [
      ...logs,
      { id: Date.now().toString(), type: 'input', text: `$ ${inputVal}` },
    ];

    if (cmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    }

    if (cmd === 'download') {
      const link = document.createElement('a');
      link.href = resumeUrl || '/src/CV_GajendraAwasthi.pdf';
      link.download = 'CV_GajendraAwasthi.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        text: '⬇️ Initiating CV download...',
      });
      setLogs(newLogs);
      setInputVal('');
      return;
    }

    const matched = commands.find(
      (c) => c.is_active && c.command.toLowerCase() === cmd
    );

    if (matched) {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        text: matched.output,
      });
    } else {
      newLogs.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        text: `✗ Command not found: "${cmd}". Type "help" to see available commands.`,
      });
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="terminal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="terminal-window" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot dot-red" />
            <span className="terminal-dot dot-yellow" />
            <span className="terminal-dot dot-green" />
          </div>
          <span>~/gajendra@portfolio $ interactive-shell</span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            aria-label="Close terminal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                color: log.type === 'input' ? '#60a5fa' : '#22c55e',
                marginBottom: '0.4rem',
              }}
            >
              {log.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="terminal-footer">
          <span className="terminal-prompt-label">$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            placeholder="Type 'help' for commands..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleCommand}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

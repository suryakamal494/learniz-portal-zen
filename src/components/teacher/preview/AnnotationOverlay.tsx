import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  MousePointer2,
  Hand,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tool = 'pen' | 'marker' | 'eraser';

interface Stroke {
  tool: Tool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

const COLORS = ['#111827', '#ef4444', '#2563eb', '#16a34a', '#f59e0b'];

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any preview content (iframe, video, image, slide) and overlays a
 * pen/marker/eraser annotation canvas with a Draw <-> Interact toggle so the
 * teacher can write on top while still clicking through into simulations.
 */
export function AnnotationOverlay({ children, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [interact, setInteract] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);

  const widthFor = (t: Tool) => (t === 'marker' ? 18 : t === 'eraser' ? 26 : 2.5);

  const redraw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);

    const all = currentRef.current ? [...strokes, currentRef.current] : strokes;
    for (const s of all) {
      if (s.points.length === 0) continue;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (s.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = s.tool === 'marker' ? 0.35 : 1;
      }
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes]);

  // Keep the canvas sized to the wrapper at the right DPR.
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      const w = wrapRef.current;
      if (!c || !w) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = w.getBoundingClientRect();
      c.width = Math.max(1, Math.floor(rect.width * dpr));
      c.height = Math.max(1, Math.floor(rect.height * dpr));
      c.style.width = `${rect.width}px`;
      c.style.height = `${rect.height}px`;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Space toggles Draw <-> Interact (ignore when user is typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      e.preventDefault();
      setInteract((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (interact) return;
    e.preventDefault();
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = true;
    currentRef.current = {
      tool,
      color,
      width: widthFor(tool),
      points: [getPos(e)],
    };
    redraw();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentRef.current) return;
    currentRef.current.points.push(getPos(e));
    redraw();
  };

  const onUp = () => {
    if (!drawingRef.current || !currentRef.current) return;
    const s = currentRef.current;
    currentRef.current = null;
    drawingRef.current = false;
    setStrokes((prev) => [...prev, s]);
  };

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clear = () => setStrokes([]);

  const ToolBtn = ({
    active,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      title={title}
      className={cn(
        'h-9 px-2.5',
        active && 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
      )}
    >
      {children}
    </Button>
  );

  return (
    <div ref={wrapRef} className={cn('relative w-full h-full overflow-hidden bg-black', className)}>
      {/* Content layer */}
      <div className="absolute inset-0">{children}</div>

      {/* Annotation layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0"
        style={{
          pointerEvents: interact ? 'none' : 'auto',
          touchAction: 'none',
          cursor: interact ? 'default' : 'crosshair',
        }}
      />

      {/* Mode chip */}
      <div
        className={cn(
          'absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-xs font-medium shadow border backdrop-blur',
          interact
            ? 'bg-amber-50/95 border-amber-200 text-amber-800'
            : 'bg-blue-50/95 border-blue-200 text-blue-800',
        )}
      >
        {interact ? 'Interact mode — click through to content' : 'Draw mode — annotate freely'}
        <span className="ml-2 text-[10px] text-gray-500">(Space to toggle)</span>
      </div>

      {/* Floating toolbar */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 flex flex-wrap items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur shadow-lg border border-gray-200 px-2 py-1.5">
        <ToolBtn
          active={!interact && tool === 'pen'}
          onClick={() => {
            setInteract(false);
            setTool('pen');
          }}
          title="Pen"
        >
          <Pencil className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={!interact && tool === 'marker'}
          onClick={() => {
            setInteract(false);
            setTool('marker');
          }}
          title="Highlighter / Marker"
        >
          <Highlighter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn
          active={!interact && tool === 'eraser'}
          onClick={() => {
            setInteract(false);
            setTool('eraser');
          }}
          title="Eraser"
        >
          <Eraser className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              if (tool === 'eraser') setTool('pen');
              setInteract(false);
            }}
            title={c}
            aria-label={`Color ${c}`}
            className={cn(
              'h-6 w-6 rounded-full border-2 transition-transform',
              color === c && tool !== 'eraser'
                ? 'border-gray-900 scale-110'
                : 'border-white shadow-sm hover:scale-105',
            )}
            style={{ background: c }}
          />
        ))}

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <ToolBtn onClick={undo} title="Undo last stroke">
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={clear} title="Clear all">
          <Trash2 className="h-4 w-4" />
        </ToolBtn>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <ToolBtn
          active={interact}
          onClick={() => setInteract((v) => !v)}
          title="Toggle Draw / Interact (Space)"
        >
          {interact ? (
            <>
              <Hand className="h-4 w-4 mr-1" /> Interact
            </>
          ) : (
            <>
              <MousePointer2 className="h-4 w-4 mr-1" /> Draw
            </>
          )}
        </ToolBtn>
      </div>
    </div>
  );
}

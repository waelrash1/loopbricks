import { useCallback, useEffect, useRef, useState } from "react";
import type { Model } from "@/data/molecules";
import {
  DT,
  type History,
  type Vars,
  freshHistory,
  freshState,
  initParams,
  pushHistory,
  stepOnce,
} from "@/sim/engine";

// previous: the last run before a reset, kept so the chart can draw it dashed for comparison
export type FrameCtx = { model: Model; state: Vars; rates: Vars; history: History; t: number; previous: History | null };
export type FrameCb = (ctx: FrameCtx) => void;

// Animation runs imperatively through refs + subscribers so we never re-render React at 60fps.
export function useSimulation(model: Model) {
  const [params, setParams] = useState<Vars>(() => initParams(model));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [stopTime, setStopTime] = useState(0); // 0 = run continuously

  const modelRef = useRef(model);
  modelRef.current = model;
  const stateRef = useRef<Vars>(freshState(model));
  const paramsRef = useRef<Vars>(params);
  const histRef = useRef<History>(freshHistory(model));
  const prevRef = useRef<History | null>(null);
  const tRef = useRef(0);
  const runningRef = useRef(false);
  const speedRef = useRef(6);
  const stopRef = useRef(0);
  const subs = useRef<Set<FrameCb>>(new Set());

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    stopRef.current = stopTime;
  }, [stopTime]);

  const frameCtx = useCallback(
    (rates?: Vars): FrameCtx => ({
      model: modelRef.current,
      state: stateRef.current,
      rates: rates ?? modelRef.current.rates(stateRef.current, paramsRef.current),
      history: histRef.current,
      t: tRef.current,
      previous: prevRef.current,
    }),
    []
  );
  const emit = useCallback(
    (rates?: Vars) => {
      const ctx = frameCtx(rates);
      subs.current.forEach((fn) => fn(ctx));
    },
    [frameCtx]
  );

  // a new listener gets the current frame straight away, so it can draw a run that has already stopped
  const subscribe = useCallback(
    (fn: FrameCb) => {
      subs.current.add(fn);
      // children subscribe before the model-change reset below has run; only send a frame that matches the model
      if (modelRef.current.stocks.every((st) => st.id in stateRef.current)) fn(frameCtx());
      return () => subs.current.delete(fn);
    },
    [frameCtx]
  );

  // reset everything when the model changes (and on mount → first paint)
  useEffect(() => {
    stateRef.current = freshState(model);
    paramsRef.current = initParams(model);
    histRef.current = freshHistory(model);
    prevRef.current = null; // a different model's run is not comparable
    tRef.current = 0;
    pushHistory(histRef.current, model, stateRef.current, 0);
    setParams(paramsRef.current);
    setRunning(false);
    emit();
  }, [model, emit]);

  // redraw on param change even while paused (pipe widths depend on params)
  useEffect(() => {
    if (!runningRef.current) emit();
  }, [params, emit]);

  // single rAF loop for the component's lifetime
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (runningRef.current) {
        let rates: Vars | undefined;
        const m = modelRef.current;
        for (let i = 0; i < speedRef.current; i++) {
          const r = stepOnce(m, stateRef.current, paramsRef.current, DT);
          stateRef.current = r.state;
          rates = r.rates;
          tRef.current += DT;
        }
        pushHistory(histRef.current, m, stateRef.current, tRef.current);
        emit(rates);
        if (stopRef.current > 0 && tRef.current >= stopRef.current) setRunning(false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [emit]);

  const applyParams = useCallback(
    (obj: Vars) => {
      paramsRef.current = { ...paramsRef.current, ...obj }; // so a reset() straight after starts from these settings
      setParams((prev) => ({ ...prev, ...obj }));
      // before the run starts, starting values that depend on the settings follow them (e.g. a supply line that starts full)
      const m = modelRef.current;
      if (m.initFrom && tRef.current === 0 && !runningRef.current) {
        stateRef.current = freshState(m, paramsRef.current);
        histRef.current = freshHistory(m);
        pushHistory(histRef.current, m, stateRef.current, 0);
        emit();
      }
    },
    [emit]
  );
  const setParam = useCallback((id: string, v: number) => applyParams({ [id]: v }), [applyParams]);
  const pulse = useCallback(() => {
    const m = modelRef.current;
    const id = m.stocks[0].id;
    stateRef.current = { ...stateRef.current, [id]: stateRef.current[id] + m.stocks[0].scale * 0.5 };
    pushHistory(histRef.current, m, stateRef.current, tRef.current);
    emit();
  }, [emit]);
  const toggle = useCallback(() => setRunning((r) => !r), []);
  const play = useCallback(() => setRunning(true), []);
  const step = useCallback(() => {
    const m = modelRef.current;
    const r = stepOnce(m, stateRef.current, paramsRef.current, DT);
    stateRef.current = r.state;
    tRef.current += DT;
    pushHistory(histRef.current, m, stateRef.current, tRef.current);
    emit(r.rates);
  }, [emit]);
  const reset = useCallback(() => {
    const m = modelRef.current;
    if (histRef.current.times.length > 2) prevRef.current = histRef.current;
    stateRef.current = freshState(m, paramsRef.current);
    histRef.current = freshHistory(m);
    tRef.current = 0;
    pushHistory(histRef.current, m, stateRef.current, 0);
    setRunning(false);
    emit();
  }, [emit]);

  const clearPrevious = useCallback(() => {
    prevRef.current = null;
    emit();
  }, [emit]);

  return { clearPrevious, params, setParam, applyParams, pulse, running, toggle, play, reset, step, speed, setSpeed, stopTime, setStopTime, subscribe };
}

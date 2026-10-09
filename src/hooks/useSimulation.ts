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

export type FrameCtx = { model: Model; state: Vars; rates: Vars; history: History; t: number };
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

  const subscribe = useCallback((fn: FrameCb) => {
    subs.current.add(fn);
    return () => subs.current.delete(fn);
  }, []);

  // reset everything when the model changes (and on mount → first paint)
  useEffect(() => {
    stateRef.current = freshState(model);
    paramsRef.current = initParams(model);
    histRef.current = freshHistory(model);
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

  const setParam = useCallback((id: string, v: number) => {
    setParams((prev) => ({ ...prev, [id]: v }));
  }, []);
  const applyParams = useCallback((obj: Vars) => setParams((prev) => ({ ...prev, ...obj })), []);
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
    stateRef.current = freshState(m);
    histRef.current = freshHistory(m);
    tRef.current = 0;
    pushHistory(histRef.current, m, stateRef.current, 0);
    setRunning(false);
    emit();
  }, [emit]);

  return { params, setParam, applyParams, pulse, running, toggle, play, reset, step, speed, setSpeed, stopTime, setStopTime, subscribe };
}

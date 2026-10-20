import type { Step } from "@/data/learn/types";
import { STEPS_A } from "@/data/learn/steps-a";
import { STEPS_B } from "@/data/learn/steps-b";
import { STEPS_C } from "@/data/learn/steps-c";

export const STEPS: Record<string, Step[]> = { ...STEPS_A, ...STEPS_B, ...STEPS_C };

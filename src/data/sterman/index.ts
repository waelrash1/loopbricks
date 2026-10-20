// Registry of the study guide: every chapter of Business Dynamics in book order, written or not.
import type { StudyChapter } from "@/data/sterman/types";
import { CHAPTER as ch01 } from "@/data/sterman/ch01";
import { CHAPTER as ch02 } from "@/data/sterman/ch02";
import { CHAPTER as ch03 } from "@/data/sterman/ch03";
import { CHAPTER as ch04 } from "@/data/sterman/ch04";
import { CHAPTER as ch05 } from "@/data/sterman/ch05";
import { CHAPTER as ch06 } from "@/data/sterman/ch06";
import { CHAPTER as ch07 } from "@/data/sterman/ch07";
import { CHAPTER as ch08 } from "@/data/sterman/ch08";
import { CHAPTER as ch09 } from "@/data/sterman/ch09";
import { CHAPTER as ch10 } from "@/data/sterman/ch10";
import { CHAPTER as ch11 } from "@/data/sterman/ch11";
import { CHAPTER as ch12 } from "@/data/sterman/ch12";
import { CHAPTER as ch13 } from "@/data/sterman/ch13";
import { CHAPTER as ch14 } from "@/data/sterman/ch14";
import { CHAPTER as ch15 } from "@/data/sterman/ch15";
import { CHAPTER as ch16 } from "@/data/sterman/ch16";
import { CHAPTER as ch17 } from "@/data/sterman/ch17";
import { CHAPTER as ch18 } from "@/data/sterman/ch18";
import { CHAPTER as ch19 } from "@/data/sterman/ch19";
import { CHAPTER as ch20 } from "@/data/sterman/ch20";
import { CHAPTER as ch21 } from "@/data/sterman/ch21";
import { CHAPTER as ch22 } from "@/data/sterman/ch22";
import { CHAPTER as appA } from "@/data/sterman/appA";
import { CHAPTER as appB } from "@/data/sterman/appB";

export type TocEntry = { id: string; number: string; title: string; part: string; chapter: StudyChapter | null };
export const BOOK_TOC: TocEntry[] = [
  { id: "ch01", number: "1", title: "Learning in and about complex systems", part: "Part I Perspective and process", chapter: ch01 },
  { id: "ch02", number: "2", title: "System dynamics in action", part: "Part I Perspective and process", chapter: ch02 },
  { id: "ch03", number: "3", title: "The modeling process", part: "Part I Perspective and process", chapter: ch03 },
  { id: "ch04", number: "4", title: "Structure and behavior of dynamic systems", part: "Part I Perspective and process", chapter: ch04 },
  { id: "ch05", number: "5", title: "Causal loop diagrams", part: "Part II Tools for systems thinking", chapter: ch05 },
  { id: "ch06", number: "6", title: "Stocks and flows", part: "Part II Tools for systems thinking", chapter: ch06 },
  { id: "ch07", number: "7", title: "Dynamics of stocks and flows", part: "Part II Tools for systems thinking", chapter: ch07 },
  { id: "ch08", number: "8", title: "Closing the loop: dynamics of simple structures", part: "Part III The dynamics of growth", chapter: ch08 },
  { id: "ch09", number: "9", title: "S-shaped growth: epidemics, innovation diffusion, and the growth of new products", part: "Part III The dynamics of growth", chapter: ch09 },
  { id: "ch10", number: "10", title: "Path dependence and positive feedback", part: "Part III The dynamics of growth", chapter: ch10 },
  { id: "ch11", number: "11", title: "Delays", part: "Part IV Tools for modeling dynamic systems", chapter: ch11 },
  { id: "ch12", number: "12", title: "Coflows and aging chains", part: "Part IV Tools for modeling dynamic systems", chapter: ch12 },
  { id: "ch13", number: "13", title: "Modeling decision making", part: "Part IV Tools for modeling dynamic systems", chapter: ch13 },
  { id: "ch14", number: "14", title: "Formulating nonlinear relationships", part: "Part IV Tools for modeling dynamic systems", chapter: ch14 },
  { id: "ch15", number: "15", title: "Modeling human behavior: bounded rationality or rational expectations?", part: "Part IV Tools for modeling dynamic systems", chapter: ch15 },
  { id: "ch16", number: "16", title: "Forecasts and fudge factors: modeling expectation formation", part: "Part IV Tools for modeling dynamic systems", chapter: ch16 },
  { id: "ch17", number: "17", title: "Supply chains and the origin of oscillations", part: "Part V Instability and oscillation", chapter: ch17 },
  { id: "ch18", number: "18", title: "The manufacturing supply chain", part: "Part V Instability and oscillation", chapter: ch18 },
  { id: "ch19", number: "19", title: "The labor supply chain and the origin of business cycles", part: "Part V Instability and oscillation", chapter: ch19 },
  { id: "ch20", number: "20", title: "The invisible hand sometimes shakes: commodity cycles", part: "Part V Instability and oscillation", chapter: ch20 },
  { id: "ch21", number: "21", title: "Truth and beauty: validation and model testing", part: "Part VI Model testing", chapter: ch21 },
  { id: "ch22", number: "22", title: "Challenges for the future", part: "Part VII Commencement", chapter: ch22 },
  { id: "appA", number: "A", title: "Numerical integration", part: "Appendices", chapter: appA },
  { id: "appB", number: "B", title: "Noise", part: "Appendices", chapter: appB },
];
export const chapterById = (id?: string) => BOOK_TOC.find((c) => c.id === id);
export const BOOK_REF = "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill.";

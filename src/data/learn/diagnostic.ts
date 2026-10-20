// The before-and-after test: twelve questions on well-documented misconceptions about dynamic systems.
// Each item is our own, modelled on the kinds of task used in the studies listed in DIAGNOSTIC_SOURCES.
import type { DiagQuestion } from "@/data/learn/types";

export const DIAGNOSTIC: DiagQuestion[] = [
  {
    skill: "stock-flow",
    q: "A shop counts people coming in and going out each minute. For minutes 1 to 10, 20 people enter and 12 leave every minute. For minutes 11 to 20, 8 people enter and 12 leave every minute. When were the most people in the shop?",
    options: [
      "During minute 1, when the most people were entering",
      "At the end of minute 10",
      "At the end of minute 20",
      "It cannot be known without the number inside at the start",
    ],
    answer: 1,
    why: "The number inside rises whenever inflow exceeds outflow (net flow +8 per minute) and falls whenever it is below (net flow −4 per minute). So it peaks at the moment the net flow turns negative, at the end of minute 10. The starting number shifts the whole path up or down but does not move the peak.",
  },
  {
    skill: "correlation heuristic",
    q: "Over a month, the water flowing into a reservoir rises steadily from 50 to 100 million litres per day. Water is released at a constant 120 million litres per day. What does the amount of water in the reservoir do during the month?",
    options: [
      "It rises steadily, following the inflow",
      "It stays roughly constant",
      "It falls all month, though more slowly toward the end",
      "It falls at first and then rises",
    ],
    answer: 2,
    why: "Release always exceeds inflow, so net flow is negative all month (from −70 to −20 million litres per day) and the stock keeps falling. The rising inflow only slows the decline. Assuming the stock follows the shape of its inflow is the correlation heuristic.",
  },
  {
    skill: "equilibrium",
    q: "A town's population has been exactly 50,000 for ten years. Which statement must be true?",
    options: [
      "Births plus people moving in have equalled deaths plus people moving out",
      "No one has been born, died or moved in that time",
      "Births have been zero and deaths have been zero",
      "The town has reached its maximum possible size",
    ],
    answer: 0,
    why: "A constant stock means total inflow equals total outflow, not that the flows have stopped. A town of 50,000 can have hundreds of births and deaths a year and still be in equilibrium. Nothing about a constant level says it is at a limit.",
  },
  {
    skill: "stock-flow",
    q: "Suppose people add 10 units of carbon dioxide to the air each year and natural processes remove 5 units a year, so the amount in the air is rising. If yearly emissions were frozen at 10 units from now on, what would happen to the amount in the air?",
    options: [
      "It would stop rising straight away",
      "It would start to fall",
      "It would level off once emissions had been frozen for a few years",
      "It would keep rising, because more is still added than removed",
    ],
    answer: 3,
    why: "The amount in the air is a stock. Freezing emissions keeps inflow at 10 while outflow is about 5, so the stock still grows by about 5 units a year. To stop it rising, emissions must fall to roughly the removal rate. Many adults expect stable emissions to mean a stable concentration, which violates mass balance.",
  },
  {
    skill: "exponential growth",
    q: "A city's water use grows by 7% every year. Today it uses 40% of the supply capacity. If growth continues at the same rate, about how long until use reaches capacity?",
    options: ["About 13 years", "About 21 years", "About 30 years", "About 60 years"],
    answer: 0,
    why: "At 7% a year the doubling time is about 70 / 7 = 10 years, so use reaches 80% in 10 years and 100% after about 13. Treating growth as a fixed 2.8 points a year (7% of today's 40) gives about 21 years, which is the linear mistake.",
  },
  {
    skill: "exponential growth",
    q: "A sheet of paper is 0.1 millimetres thick. If it could be folded in half 30 times, doubling the thickness each time, roughly how thick would the stack be?",
    options: ["About 3 millimetres", "About 3 metres", "About 100 metres", "More than 100 kilometres"],
    answer: 3,
    why: "Thirty doublings multiply the thickness by about one billion (2 to the power 30 is 1,073,741,824). So 0.1 mm becomes about 107,000,000 mm, or more than 100 km. People routinely underestimate repeated doubling by many orders of magnitude.",
  },
  {
    skill: "linear extrapolation",
    q: "Weekly cases of a new infection were 100, 200, 400 and 800 in weeks 1 to 4. If nothing changes in how it spreads, which is the best estimate for week 7?",
    options: ["About 1,500", "About 2,000", "About 6,400", "About 12,800"],
    answer: 2,
    why: "Cases double each week, so weeks 5, 6 and 7 bring 1,600, 3,200 and 6,400. Adding the average weekly rise (about 230) gives about 1,500, and adding the latest rise (400) gives 2,000; both are straight-line extrapolations of an exponential process.",
  },
  {
    skill: "supply line",
    q: "You keep a store's stock at 100 units. Customers buy 20 units a week and orders take 3 weeks to arrive. Last week stock was 80, so you ordered 40 (20 to replace sales and 20 to close the gap). Those units have not arrived and stock is still 80 this week, with sales still 20. How many should you order now?",
    options: ["40, to close the gap again", "20, since last week's extra 20 is already on its way", "0, until last week's order arrives", "60, because the gap has persisted"],
    answer: 1,
    why: "The 20-unit gap is already covered by last week's extra order sitting in the supply line. Ordering another 20 for the same gap double-counts it and, repeated each week, overfills the stock and starts an oscillation. Ignoring the supply line is the main cause of the bullwhip effect.",
  },
  {
    skill: "delays",
    q: "In a hotel shower, the water temperature takes about 5 seconds to respond to the tap. A guest turns the tap a little each second in proportion to how cold or hot the water feels right now. The temperature keeps swinging between too hot and too cold. What best explains the swings?",
    options: [
      "The water heater is faulty",
      "The guest is not turning the tap far enough",
      "Random changes in the building's water pressure",
      "The guest keeps correcting a gap that earlier adjustments have already fixed but not yet delivered",
    ],
    answer: 3,
    why: "A balancing loop with a delay oscillates when the decision maker reacts only to the current gap. Adjustments pile up in the pipe before their effect is felt, so the guest overshoots in both directions. Waiting, or accounting for what is already on its way, damps the swings.",
  },
  {
    skill: "delays",
    q: "A health system raises its intake of student nurses from 200 to 300 a year and keeps it there. Training takes exactly 3 years and nobody drops out. What happens to the number of nurses graduating each year?",
    options: [
      "It rises to 300 straight away",
      "It rises a little each year, reaching 300 after about 10 years",
      "It stays at 200 for 3 years and then rises to 300",
      "It rises to 300 and then falls back to 200",
    ],
    answer: 2,
    why: "Training is a pipeline delay: every student spends exactly 3 years in it, so graduations simply repeat the intake 3 years later. The extra 100 students a year sit in the training stock first. Expecting an immediate response ignores the stock that every delay contains.",
  },
  {
    skill: "feedback",
    q: "A city widens a congested main road. Travel times improve for about a year, then return to roughly where they were. Which explanation reflects feedback thinking?",
    options: [
      "Faster trips drew more people to drive more often until congestion again limited traffic",
      "The construction work was poor and the road surface deteriorated",
      "A run of bad weather slowed traffic in the second year",
      "Drivers forgot the road had been widened",
    ],
    answer: 0,
    why: "Shorter travel times make driving more attractive, so traffic grows until congestion restores travel times: a balancing loop that offsets the policy. The other answers explain the outcome by one-off outside events, which is event-oriented rather than feedback thinking.",
  },
  {
    skill: "worse before better",
    q: "A factory moves 10% of its workers' time from production to fixing the root causes of defects and breakdowns. Assuming the programme works, what is the most likely path of output over the next year?",
    options: [
      "Output rises at once and keeps rising",
      "Output dips at first, then recovers and rises above its old level",
      "Output stays the same, because the gains and losses cancel",
      "Output falls and stays lower, since less time goes into production",
    ],
    answer: 1,
    why: "Time spent on improvement cuts output immediately, while the benefit of fewer defects arrives only after a delay. So output gets worse before it gets better. Managers who judge the programme by the early dip often cancel it and fall back into firefighting.",
  },
];

export const DIAGNOSTIC_SOURCES: string[] = [
  "Booth Sweeney, L., & Sterman, J. D. (2000). Bathtub dynamics: Initial results of a systems thinking inventory. System Dynamics Review, 16(4), 249–286.",
  "Cronin, M. A., Gonzalez, C., & Sterman, J. D. (2009). Why don't well-educated adults understand accumulation? A challenge to researchers, educators, and citizens. Organizational Behavior and Human Decision Processes, 108(1), 116–130.",
  "Sterman, J. D., & Booth Sweeney, L. (2007). Understanding public complacency about climate change: Adults' mental models of climate change violate conservation of matter. Climatic Change, 80(3–4), 213–238.",
  "Sterman, J. D. (1989). Modeling managerial behavior: Misperceptions of feedback in a dynamic decision making experiment. Management Science, 35(3), 321–339.",
  "Diehl, E., & Sterman, J. D. (1995). Effects of feedback complexity on dynamic decision making. Organizational Behavior and Human Decision Processes, 62(2), 198–215.",
  "Wagenaar, W. A., & Sagaria, S. D. (1975). Misperception of exponential growth. Perception & Psychophysics, 18(6), 416–422.",
  "Wagenaar, W. A., & Timmers, H. (1979). The pond-and-duckweed problem: Three experiments on the misperception of exponential growth. Acta Psychologica, 43(3), 239–251.",
  "Forrester, J. W. (1971). Counterintuitive behavior of social systems. Technology Review, 73(3), 52–68.",
  "Repenning, N. P., & Sterman, J. D. (2001). Nobody ever gets credit for fixing problems that never happened: Creating and sustaining process improvement. California Management Review, 43(4), 64–88.",
  "Richmond, B. (1993). Systems thinking: Critical thinking skills for the 1990s and beyond. System Dynamics Review, 9(2), 113–133.",
  "Sterman, J. D. (2000). Business dynamics: Systems thinking and modeling for a complex world. Boston: Irwin/McGraw-Hill.",
];

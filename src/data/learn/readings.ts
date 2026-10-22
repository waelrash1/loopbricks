// Reading lists for the course: core and further reading for each module, each with a line on why it is worth
// the time, and seminar questions for postgraduate discussion. Every journal article below was matched to its
// Crossref record by DOI (Oct 2026); books are cited by edition. Keys that also appear in METHOD_REFS resolve there.
import { METHOD_REFS, type MethodRef } from "@/data/methods";

export const LEARN_REFS: Record<string, MethodRef> = {
  // books
  sterman2000: { short: "Sterman 2000", text: "Sterman JD (2000). Business Dynamics: Systems Thinking and Modeling for a Complex World. Irwin/McGraw-Hill, Boston." },
  forrester1961: { short: "Forrester 1961", text: "Forrester JW (1961). Industrial Dynamics. MIT Press, Cambridge MA." },
  senge1990: { short: "Senge 1990", text: "Senge PM (1990). The Fifth Discipline: The Art and Practice of the Learning Organization. Doubleday/Currency, New York." },
  meadows2008: { short: "Meadows 2008", text: "Meadows DH (2008). Thinking in Systems: A Primer. Wright D, ed. Chelsea Green, White River Junction VT." },
  richardsonPugh1981: { short: "Richardson and Pugh 1981", text: "Richardson GP, Pugh AL III (1981). Introduction to System Dynamics Modeling with DYNAMO. MIT Press, Cambridge MA." },
  richardson1991: { short: "Richardson 1991", text: "Richardson GP (1991). Feedback Thought in Social Science and Systems Theory. University of Pennsylvania Press, Philadelphia." },
  vennix1996: { short: "Vennix 1996", text: "Vennix JAM (1996). Group Model Building: Facilitating Team Learning Using System Dynamics. Wiley, Chichester." },
  morecroft2015: { short: "Morecroft 2015", text: "Morecroft JDW (2015). Strategic Modelling and Business Dynamics: A Feedback Systems Approach, 2nd ed. Wiley, Chichester.", doi: "10.1002/9781119176831" },
  ford2010: { short: "Ford 2010", text: "Ford A (2010). Modeling the Environment, 2nd ed. Island Press, Washington DC." },
  kimAnderson1998: { short: "Kim and Anderson 1998", text: "Kim DH, Anderson V (1998). Systems Archetype Basics: From Story to Structure. Pegasus Communications, Waltham MA." },
  hovmand2014: { short: "Hovmand 2014", text: "Hovmand PS (2014). Community Based System Dynamics. Springer, New York.", doi: "10.1007/978-1-4614-8763-0" },
  duggan2016: { short: "Duggan 2016", text: "Duggan J (2016). System Dynamics Modeling with R. Lecture Notes in Social Networks. Springer, Cham.", doi: "10.1007/978-3-319-34043-2" },
  ostrom1990: { short: "Ostrom 1990", text: "Ostrom E (1990). Governing the Commons: The Evolution of Institutions for Collective Action. Cambridge University Press.", doi: "10.1017/CBO9780511807763" },
  abdelhamidMadnick1991: { short: "Abdel-Hamid and Madnick 1991", text: "Abdel-Hamid T, Madnick SE (1991). Software Project Dynamics: An Integrated Approach. Prentice Hall, Englewood Cliffs NJ." },
  brooks1975: { short: "Brooks 1975", text: "Brooks FP (1975). The Mythical Man-Month: Essays on Software Engineering. Addison-Wesley, Reading MA." },

  // learning, misperception and accumulation
  sterman1994: { short: "Sterman 1994", text: "Sterman JD (1994). Learning in and about complex systems. System Dynamics Review 10(2-3):291-330.", doi: "10.1002/sdr.4260100214" },
  sterman2001: { short: "Sterman 2001", text: "Sterman JD (2001). System dynamics modeling: tools for learning in a complex world. California Management Review 43(4):8-25.", doi: "10.2307/41166098" },
  sterman1989obhdp: { short: "Sterman 1989b", text: "Sterman JD (1989). Misperceptions of feedback in dynamic decision making. Organizational Behavior and Human Decision Processes 43(3):301-335.", doi: "10.1016/0749-5978(89)90041-1" },
  forrester1971: { short: "Forrester 1971", text: "Forrester JW (1971). Counterintuitive behavior of social systems. Theory and Decision 2(2):109-140.", doi: "10.1007/BF00148991" },
  boothSweeney2000: { short: "Booth Sweeney and Sterman 2000", text: "Booth Sweeney L, Sterman JD (2000). Bathtub dynamics: initial results of a systems thinking inventory. System Dynamics Review 16(4):249-286.", doi: "10.1002/sdr.198" },
  cronin2009: { short: "Cronin, Gonzalez and Sterman 2009", text: "Cronin MA, Gonzalez C, Sterman JD (2009). Why don't well-educated adults understand accumulation? A challenge to researchers, educators, and citizens. Organizational Behavior and Human Decision Processes 108(1):116-130.", doi: "10.1016/j.obhdp.2008.03.003" },
  stermanBoothSweeney2007: { short: "Sterman and Booth Sweeney 2007", text: "Sterman JD, Booth Sweeney L (2007). Understanding public complacency about climate change: adults' mental models of climate change violate conservation of matter. Climatic Change 80(3-4):213-238.", doi: "10.1007/s10584-006-9107-5" },
  sterman2008: { short: "Sterman 2008", text: "Sterman JD (2008). Risk communication on climate: mental models and mass balance. Science 322(5901):532-533.", doi: "10.1126/science.1162574" },
  sterman2006: { short: "Sterman 2006", text: "Sterman JD (2006). Learning from evidence in a complex world. American Journal of Public Health 96(3):505-514.", doi: "10.2105/AJPH.2005.066043" },
  moxnes1998: { short: "Moxnes 1998", text: "Moxnes E (1998). Not only the tragedy of the commons: misperceptions of bioeconomics. Management Science 44(9):1234-1248.", doi: "10.1287/mnsc.44.9.1234" },

  // diagrams and loops
  richardson1986: { short: "Richardson 1986", text: "Richardson GP (1986). Problems with causal-loop diagrams. System Dynamics Review 2(2):158-170.", doi: "10.1002/sdr.4260020207" },
  lane2008: { short: "Lane 2008", text: "Lane DC (2008). The emergence and use of diagramming in system dynamics: a critical account. Systems Research and Behavioral Science 25(1):3-23.", doi: "10.1002/sres.826" },
  schaffernicht2010: { short: "Schaffernicht 2010", text: "Schaffernicht M (2010). Causal loop diagrams between structure and behaviour: a critical analysis of the relationship between polarity, behaviour and events. Systems Research and Behavioral Science 27(6):653-666.", doi: "10.1002/sres.1018" },
  fordDN1999: { short: "Ford 1999", text: "Ford DN (1999). A behavioral approach to feedback loop dominance analysis. System Dynamics Review 15(1):3-36.", doi: "10.1002/(SICI)1099-1727(199921)15:1<3::AID-SDR159>3.0.CO;2-P" },
  wolstenholme2003: { short: "Wolstenholme 2003", text: "Wolstenholme EF (2003). Towards the definition and use of a core set of archetypal structures in system dynamics. System Dynamics Review 19(1):7-26.", doi: "10.1002/sdr.259" },

  // the modelling process, qualitative work and groups
  lunaReyes2003: { short: "Luna-Reyes and Andersen 2003", text: "Luna-Reyes LF, Andersen DL (2003). Collecting and analyzing qualitative data for system dynamics: methods and models. System Dynamics Review 19(4):271-296.", doi: "10.1002/sdr.280" },
  vennix1999: { short: "Vennix 1999", text: "Vennix JAM (1999). Group model-building: tackling messy problems. System Dynamics Review 15(4):379-401.", doi: "10.1002/(SICI)1099-1727(199924)15:4<379::AID-SDR179>3.0.CO;2-E" },
  andersen1997: { short: "Andersen and Richardson 1997", text: "Andersen DF, Richardson GP (1997). Scripts for group model building. System Dynamics Review 13(2):107-129.", doi: "10.1002/(SICI)1099-1727(199722)13:2<107::AID-SDR120>3.0.CO;2-7" },
  coyle2000: { short: "Coyle 2000", text: "Coyle G (2000). Qualitative and quantitative modelling in system dynamics: some research questions. System Dynamics Review 16(3):225-244.", doi: "10.1002/1099-1727(200023)16:3<225::AID-SDR195>3.0.CO;2-D" },
  homerOliva2001: { short: "Homer and Oliva 2001", text: "Homer J, Oliva R (2001). Maps and models in system dynamics: a response to Coyle. System Dynamics Review 17(4):347-355.", doi: "10.1002/sdr.224" },
  wolstenholme1999q: { short: "Wolstenholme 1999", text: "Wolstenholme EF (1999). Qualitative vs quantitative modelling: the evolving balance. Journal of the Operational Research Society 50(4):422-428.", doi: "10.1057/palgrave.jors.2600700" },
  forrester1994: { short: "Forrester 1994", text: "Forrester JW (1994). System dynamics, systems thinking, and soft OR. System Dynamics Review 10(2-3):245-256.", doi: "10.1002/sdr.4260100211" },
  lane1999: { short: "Lane 1999", text: "Lane DC (1999). Social theory and system dynamics practice. European Journal of Operational Research 113(3):501-527.", doi: "10.1016/S0377-2217(98)00192-1" },
  ghaffarzadegan2011: { short: "Ghaffarzadegan, Lyneis and Richardson 2011", text: "Ghaffarzadegan N, Lyneis J, Richardson GP (2011). How small system dynamics models can help the public policy process. System Dynamics Review 27(1):22-44.", doi: "10.1002/sdr.442" },

  // decision rules, behaviour and cycles
  morecroft1985: { short: "Morecroft 1985", text: "Morecroft JDW (1985). Rationality in the analysis of behavioral simulation models. Management Science 31(7):900-916.", doi: "10.1287/mnsc.31.7.900" },
  sterman1987bs: { short: "Sterman 1987", text: "Sterman JD (1987). Expectation formation in behavioral simulation models. Behavioral Science 32(3):190-211.", doi: "10.1002/bs.3830320304" },
  lee1997: { short: "Lee, Padmanabhan and Whang 1997", text: "Lee HL, Padmanabhan V, Whang S (1997). Information distortion in a supply chain: the bullwhip effect. Management Science 43(4):546-558.", doi: "10.1287/mnsc.43.4.546" },
  croson2006: { short: "Croson and Donohue 2006", text: "Croson R, Donohue K (2006). Behavioral causes of the bullwhip effect and the observed value of inventory information. Management Science 52(3):323-336.", doi: "10.1287/mnsc.1050.0436" },
  anderson2000: { short: "Anderson, Fine and Parker 2000", text: "Anderson EG, Fine CH, Parker GG (2000). Upstream volatility in the supply chain: the machine tool industry as a case study. Production and Operations Management 9(3):239-261.", doi: "10.1111/j.1937-5956.2000.tb00136.x" },
  paich1993: { short: "Paich and Sterman 1993", text: "Paich M, Sterman JD (1993). Boom, bust, and failures to learn in experimental markets. Management Science 39(12):1439-1458.", doi: "10.1287/mnsc.39.12.1439" },
  sterman1985: { short: "Sterman 1985", text: "Sterman JD (1985). A behavioral model of the economic long wave. Journal of Economic Behavior & Organization 6(1):17-53.", doi: "10.1016/0167-2681(85)90023-X" },
  bass1969: { short: "Bass 1969", text: "Bass FM (1969). A new product growth for model consumer durables. Management Science 15(5):215-227.", doi: "10.1287/mnsc.15.5.215" },
  arthur1989: { short: "Arthur 1989", text: "Arthur WB (1989). Competing technologies, increasing returns, and lock-in by historical events. The Economic Journal 99(394):116-131.", doi: "10.2307/2234208" },
  struben2008: { short: "Struben and Sterman 2008", text: "Struben J, Sterman JD (2008). Transition challenges for alternative fuel vehicle and transportation systems. Environment and Planning B: Planning and Design 35(6):1070-1097.", doi: "10.1068/b33022t" },
  winch2001: { short: "Winch 2001", text: "Winch GW (2001). Management of the 'skills inventory' in times of major change. System Dynamics Review 17(2):151-159.", doi: "10.1002/sdr.208" },

  // organisations, projects and services
  olivaSterman2001: { short: "Oliva and Sterman 2001", text: "Oliva R, Sterman JD (2001). Cutting corners and working overtime: quality erosion in the service industry. Management Science 47(7):894-914.", doi: "10.1287/mnsc.47.7.894.9807" },
  repenningSterman2001: { short: "Repenning and Sterman 2001", text: "Repenning NP, Sterman JD (2001). Nobody ever gets credit for fixing problems that never happened: creating and sustaining process improvement. California Management Review 43(4):64-88.", doi: "10.2307/41166101" },
  cooper1980: { short: "Cooper 1980", text: "Cooper KG (1980). Naval ship production: a claim settled and a framework built. Interfaces 10(6):20-36.", doi: "10.1287/inte.10.6.20" },
  lyneisFord2007: { short: "Lyneis and Ford 2007", text: "Lyneis JM, Ford DN (2007). System dynamics applied to project management: a survey, assessment, and directions for future research. System Dynamics Review 23(2-3):157-189.", doi: "10.1002/sdr.377" },
  homer1985: { short: "Homer 1985", text: "Homer JB (1985). Worker burnout: a dynamic model with implications for prevention and control. System Dynamics Review 1(1):42-62.", doi: "10.1002/sdr.4260010105" },

  // health and environment
  knowler2002: { short: "Knowler et al. 2002", text: "Knowler WC, Barrett-Connor E, Fowler SE, et al. (2002). Reduction in the incidence of type 2 diabetes with lifestyle intervention or metformin. New England Journal of Medicine 346(6):393-403.", doi: "10.1056/NEJMoa012512" },
  fordSterman2003: { short: "Ford and Sterman 2003", text: "Ford DN, Sterman JD (2003). Overcoming the 90% syndrome: iteration management in concurrent development projects. Concurrent Engineering 11(3):177-186.", doi: "10.1177/106329303038031" },
  homerHirsch2006: { short: "Homer and Hirsch 2006", text: "Homer JB, Hirsch GB (2006). System dynamics modeling for public health: background and opportunities. American Journal of Public Health 96(3):452-458.", doi: "10.2105/AJPH.2005.062059" },
  jones2006: { short: "Jones et al. 2006", text: "Jones AP, Homer JB, Murphy DL, Essien JDK, Milstein B, Seville DA (2006). Understanding diabetes population dynamics through simulation modeling and experimentation. American Journal of Public Health 96(3):488-494.", doi: "10.2105/AJPH.2005.063529" },
  lane2000: { short: "Lane, Monefeldt and Rosenhead 2000", text: "Lane DC, Monefeldt C, Rosenhead JV (2000). Looking in the wrong place for healthcare improvements: a system dynamics study of an accident and emergency department. Journal of the Operational Research Society 51(5):518-531.", doi: "10.1057/palgrave.jors.2600892" },
  brailsford2009: { short: "Brailsford et al. 2009", text: "Brailsford SC, Harper PR, Patel B, Pitt M (2009). An analysis of the academic literature on simulation and modelling in health care. Journal of Simulation 3(3):130-140.", doi: "10.1057/jos.2009.10" },
  hardin1968: { short: "Hardin 1968", text: "Hardin G (1968). The tragedy of the commons. Science 162(3859):1243-1248.", doi: "10.1126/science.162.3859.1243" },
  madani2009: { short: "Madani and Mariño 2009", text: "Madani K, Mariño MA (2009). System dynamics analysis for managing Iran's Zayandeh-Rud river basin. Water Resources Management 23(11):2163-2187.", doi: "10.1007/s11269-008-9376-z" },

  // the field
  forrester1987: { short: "Forrester 1987", text: "Forrester JW (1987). Lessons from system dynamics modeling. System Dynamics Review 3(2):136-149.", doi: "10.1002/sdr.4260030205" },
  richardson2011: { short: "Richardson 2011", text: "Richardson GP (2011). Reflections on the foundations of system dynamics. System Dynamics Review 27(3):219-243.", doi: "10.1002/sdr.462" },
  sterman2014: { short: "Sterman 2014", text: "Sterman J (2014). Interactive web-based simulations for strategy and sustainability: the MIT Sloan LearningEdge management flight simulators, Part I. System Dynamics Review 30(1-2):89-121.", doi: "10.1002/sdr.1513" },
  rahmandad2012: { short: "Rahmandad and Sterman 2012", text: "Rahmandad H, Sterman JD (2012). Reporting guidelines for simulation-based research in social sciences. System Dynamics Review 28(4):396-411.", doi: "10.1002/sdr.1481" },
};

/** Look a reference up in the course list, then in the methods pages' list. */
export const refFor = (key: string): MethodRef | undefined => LEARN_REFS[key] ?? METHOD_REFS[key];
export const refUrl = (r: { doi?: string; url?: string }) => (r.doi ? `https://doi.org/${r.doi}` : r.url);

export type Reading = { ref: string; where?: string; why: string };
export type ModuleReadings = { core: Reading[]; further: Reading[]; seminar: string[] };

export const READINGS: Record<string, ModuleReadings> = {
  surprise: {
    core: [
      { ref: "sterman2000", where: "ch. 1", why: "The case for modelling as a way to learn when experiments in the real system are slow, costly or impossible." },
      { ref: "sterman1994", why: "The full argument behind the chapter: the barriers to learning in complex systems, and how simulation lowers them." },
      { ref: "forrester1971", why: "The classic paper on why intuition about social systems points the wrong way. Short, sharp and still argued about." },
    ],
    further: [
      { ref: "sterman2001", why: "A managerial version of the same argument, with business examples." },
      { ref: "sterman1989obhdp", why: "The experiment behind the claim that people ignore feedback and delays even when they are told about them." },
    ],
    seminar: [
      "Forrester (1971) claims social systems are counterintuitive. Choose a policy from your own sector that made things worse. Which feedback defeated it, and what evidence would convince a sceptic that feedback, not bad luck, was the cause?",
      "Sterman (1994) lists barriers to learning in the real world. Which of them could a simulation model remove for your organisation, and which would it leave in place?",
    ],
  },
  "stocks-flows": {
    core: [
      { ref: "sterman2000", where: "ch. 6-7", why: "How to identify stocks and flows, and how to infer one from the other graphically." },
      { ref: "boothSweeney2000", why: "The bathtub tasks themselves, and how often graduate students get them wrong." },
      { ref: "cronin2009", why: "Shows the failure is not about graphs or maths skills: it is a misunderstanding of accumulation." },
    ],
    further: [
      { ref: "stermanBoothSweeney2007", why: "The same error applied to carbon dioxide, with consequences for climate policy." },
      { ref: "sterman2008", why: "A two-page version for a general audience: a model of how to explain a stock to non-specialists." },
    ],
    seminar: [
      "Cronin, Gonzalez and Sterman (2009) found that well-educated adults fail simple accumulation tasks. What does that imply for how you show model results to a board or a ministry?",
      "Name three stocks in your own field that are routinely reported as if they were flows, or the other way round. What decisions does the confusion distort?",
    ],
  },
  loops: {
    core: [
      { ref: "sterman2000", where: "ch. 5", why: "Conventions for drawing causal loop diagrams, and the common mistakes." },
      { ref: "richardson1986", why: "Why link polarity is ambiguous where a link enters a stock, and what to do about it." },
      { ref: "lane2008", why: "A critical history of the diagrams themselves: what they are good for, and where they mislead." },
    ],
    further: [
      { ref: "schaffernicht2010", why: "Takes the polarity question further: what a sign can and cannot tell you about behaviour over time." },
      { ref: "richardson1991", why: "The intellectual history of feedback thinking across the social sciences." },
    ],
    seminar: [
      "Redraw one causal loop diagram from a published paper in your field so that every polarity is unambiguous in Richardson's (1986) sense. What did you have to change, and did the story change with it?",
      "Lane (2008) argues that diagrams can give a false sense of understanding. When would you stop at a causal loop diagram, and when must you simulate?",
    ],
  },
  patterns: {
    core: [
      { ref: "sterman2000", where: "ch. 4", why: "The basic modes of behaviour and the feedback structures that produce them." },
      { ref: "saeed1998", why: "How to define a problem as a reference mode rather than as an event or a single number." },
    ],
    further: [
      { ref: "fordDN1999", why: "A practical method for finding which loop dominates when, by switching loops off and watching the behaviour change." },
      { ref: "meadows2008", why: "The same patterns explained in plain language, with everyday examples." },
    ],
    seminar: [
      "Draw the reference mode for a problem you know well. Is it truly a pattern over time, or an event you have stretched into one? How far back must the graph start to show the cause?",
      "A pattern can be produced by more than one structure. Give two different structures that produce S-shaped growth, and say what data would tell them apart.",
    ],
  },
  "first-order": {
    core: [
      { ref: "sterman2000", where: "ch. 8", why: "Exponential growth, decay and goal seeking, solved analytically and simulated." },
      { ref: "richardsonPugh1981", why: "A slower, very clear treatment of first-order loops for readers new to the mathematics." },
    ],
    further: [{ ref: "fordDN1999", why: "Loop dominance in practice, once more than one loop is at work." }],
    seminar: [
      "The rule of 70 gives doubling times for exponential growth. Find a published growth rate in your field and work out its doubling time. Is the stated rate plausible over a ten-year horizon? What balancing loop will start to bite first?",
    ],
  },
  delays: {
    core: [
      { ref: "sterman2000", where: "ch. 11", why: "Material and information delays, their order, and how perceptions are formed by smoothing." },
      { ref: "sterman1989", why: "The beer game experiment: what delays do to decisions when people ignore the supply line." },
    ],
    further: [
      { ref: "moxnes1998", why: "Delays in a renewable resource: experienced subjects still overshoot, even without a commons problem." },
      { ref: "sterman1987bs", why: "How expectations are formed from delayed, smoothed information." },
    ],
    seminar: [
      "Moxnes (1998) shows that over-exploitation happens even with a single owner. If the tragedy of the commons is not the whole explanation, what is, and what does that imply for regulation?",
      "Estimate the delay between a decision and its first visible effect in a system you know. Is it a material or an information delay, and what order would you give it?",
    ],
  },
  "s-shaped": {
    core: [
      { ref: "sterman2000", where: "ch. 9", why: "Logistic growth, epidemics and the Bass diffusion model in one framework." },
      { ref: "bass1969", why: "The original diffusion model, still the benchmark for forecasting new products." },
    ],
    further: [
      { ref: "struben2008", why: "Diffusion where adoption depends on infrastructure and social exposure, with tipping thresholds." },
      { ref: "homerHirsch2006", why: "S-shaped dynamics in public health and how models have informed policy." },
    ],
    seminar: [
      "The Bass model fits many products after the fact. How well does it forecast before the inflection point, and what would you need to know to do better?",
    ],
  },
  "lock-in": {
    core: [
      { ref: "sterman2000", where: "ch. 10", why: "Path dependence and the reinforcing loops behind it." },
      { ref: "arthur1989", why: "The economics paper that made lock-in a mainstream idea." },
    ],
    further: [{ ref: "struben2008", why: "Lock-in and escape in transport fuels, with a full model." }],
    seminar: [
      "Arthur (1989) shows that small, random early events can decide which technology wins. Where in your field has an inferior option locked in, and what reinforcing loops keep it there?",
    ],
  },
  chains: {
    core: [
      { ref: "sterman2000", where: "ch. 12", why: "Aging chains and coflows: tracking people and products through stages, and what they carry with them." },
      { ref: "winch2001", why: "An aging chain of skills in a workforce going through major change." },
    ],
    further: [{ ref: "homer1985", why: "Burnout as a coflow of energy and workload, a model with direct implications for staffing." }],
    seminar: [
      "Most workforce plans count heads. Sketch an aging chain for a profession you know, with its training delay. Where would a coflow of experience change the conclusions of a head count?",
    ],
  },
  oscillation: {
    core: [
      { ref: "sterman2000", where: "ch. 17-18", why: "The stock management structure and why supply chains oscillate and amplify." },
      { ref: "lee1997", why: "The bullwhip effect named and explained from an operations management perspective." },
      { ref: "croson2006", why: "Laboratory evidence that the bullwhip persists even when its operational causes are removed." },
    ],
    further: [
      { ref: "anderson2000", why: "Amplification in a real industry: machine tools and their customers." },
      { ref: "forrester1961", why: "Where the oscillation work began, with the production-distribution model." },
    ],
    seminar: [
      "Lee, Padmanabhan and Whang (1997) explain the bullwhip with rational causes; Croson and Donohue (2006) show it persists without them. How would you design a study in a real supply chain to separate the two explanations?",
    ],
  },
  archetypes: {
    core: [
      { ref: "senge1990", why: "The book that made the archetypes widely known." },
      { ref: "kimAnderson1998", why: "A workbook for moving from a story to the archetype structure behind it." },
      { ref: "wolstenholme2003", why: "Reduces the archetypes to a small core set of generic structures, with a critique of how they are used." },
    ],
    further: [
      { ref: "repenningSterman2001", why: "Shifting the burden inside real firms: why process improvement efforts collapse." },
      { ref: "meadows2008", why: "The archetypes as 'system traps', with ways out." },
    ],
    seminar: [
      "Wolstenholme (2003) argues that the archetypes can be reduced to a few generic structures. Does that make them more useful in practice, or less? Use one case from your own experience.",
      "An archetype can become a label that stops thinking. When is naming the archetype the end of the analysis, and when is it the start?",
    ],
  },
  process: {
    core: [
      { ref: "sterman2000", where: "ch. 2-3", why: "The modelling process, and projects where it changed real decisions." },
      { ref: "martinezmoyano2013", why: "Best practice at every step of the process, drawn from experienced modellers." },
      { ref: "lunaReyes2003", why: "How to collect and analyse interviews and documents so they can feed a model." },
    ],
    further: [
      { ref: "vennix1999", why: "Group model building with clients who disagree about what the problem is." },
      { ref: "andersen1997", why: "Scripts for running group modelling sessions, step by step." },
      { ref: "coyle2000", why: "The case that qualitative maps can be enough, with research questions for the field." },
      { ref: "homerOliva2001", why: "The reply: why simulation is usually needed to draw reliable conclusions from a map." },
    ],
    seminar: [
      "Coyle (2000) and Homer and Oliva (2001) disagree about whether qualitative maps can stand on their own. Take a side for a project you know, and say what evidence would change your mind.",
      "Write the purpose of a model for your own problem in one sentence. Does it name a decision and a decision maker? If not, rewrite it until it does.",
    ],
  },
  formulation: {
    core: [
      { ref: "sterman2000", where: "ch. 13-14", why: "Formulating decision rules and table functions that behave sensibly at the extremes." },
      { ref: "morecroft1985", why: "Bounded rationality as the basis for decision rules in models." },
    ],
    further: [
      { ref: "forrester1961", why: "The original account of decision rules as policies, built from the information actually available." },
      { ref: "richardsonPugh1981", why: "Worked formulations, with attention to units and extreme conditions." },
    ],
    seminar: [
      "Pick one decision rule in a model you have built or read. What information does the real decision maker actually see, and with what delay? Does the formulation use anything they could not know?",
    ],
  },
  behaviour: {
    core: [
      { ref: "sterman2000", where: "ch. 15-16", why: "Bounded rationality, rational expectations and how to model forecasts." },
      { ref: "morecroft1985", why: "Why locally sensible decisions can produce poor overall performance." },
      { ref: "sterman1987bs", why: "Adaptive expectations and trend extrapolation, tested against data." },
    ],
    further: [{ ref: "sterman1989obhdp", why: "Evidence of how people actually decide in a dynamic task." }],
    seminar: [
      "Morecroft (1985) argues that bounded rationality, not stupidity, explains poor performance. Find a decision in your organisation that is locally rational and globally harmful. What information would change it?",
    ],
  },
  cycles: {
    core: [
      { ref: "sterman2000", where: "ch. 19-20", why: "Business and commodity cycles from inventory, labour and capacity." },
      { ref: "paich1993", why: "Experimental markets: how boom and bust arise, and why people fail to learn from them." },
    ],
    further: [{ ref: "sterman1985", why: "A behavioural model of the long wave in capital investment." }],
    seminar: [
      "Paich and Sterman (1993) find that subjects do not learn to avoid boom and bust, even with repeated trials. What would a market or a regulator need to change to make learning possible?",
    ],
  },
  testing: {
    core: [
      { ref: "sterman2000", where: "ch. 21", why: "The tests that build confidence in a model, and why no model can be validated." },
      { ref: "barlas1996", why: "The formal basis for structure-oriented and behaviour-oriented tests." },
      { ref: "forrester1980", why: "The original list of tests for building confidence." },
    ],
    further: [
      { ref: "sterman2002", why: "A reflective essay on what it means to be a systems scientist when all models are wrong." },
      { ref: "oliva2003", why: "Calibration as a test of structure, not only a way to fit data." },
      { ref: "rahmandad2012", why: "What to report so that others can check and reproduce a simulation study." },
    ],
    seminar: [
      "Barlas (1996) separates structure tests from behaviour tests. Which would you show first to a sceptical client, and why?",
      "Using Rahmandad and Sterman (2012) as a checklist, review a published system dynamics paper in your field. What could you not reproduce from what was reported?",
    ],
  },
  mechanics: {
    core: [
      { ref: "sterman2000", where: "appendices A-B", why: "Numerical integration, choosing the time step, and modelling noise." },
      { ref: "duggan2016", why: "The same mechanics written in code, useful if you simulate outside a modelling package." },
    ],
    further: [{ ref: "richardsonPugh1981", why: "A gentle account of how simulation steps through time." }],
    seminar: ["Halve the time step of a model you have built. If the results change, what does that tell you, and what would you report?"],
  },
  frontier: {
    core: [
      { ref: "richardson2011", why: "The foundations of the field, restated by one of its central figures." },
      { ref: "forrester1987", why: "Forrester's own lessons from three decades of modelling." },
      { ref: "ghaffarzadegan2011", why: "The case for small models in public policy." },
    ],
    further: [
      { ref: "hovmand2014", why: "Modelling with communities rather than for them." },
      { ref: "lane1999", why: "Where system dynamics sits in social theory." },
      { ref: "sterman2014", why: "Simulators as teaching tools: design lessons from two decades of management flight simulators." },
    ],
    seminar: [
      "Ghaffarzadegan, Lyneis and Richardson (2011) argue small models can move policy where large ones cannot. Where is the line between small enough to understand and too small to trust?",
      "Pick one open problem from this module and draft a research question you could answer in a master's dissertation. What data and what model would you need?",
    ],
  },
};

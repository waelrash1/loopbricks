import { lazy } from "react";
import { CurriculumIndex, ModulePage } from "@/components/Learn";

// #/learn/<page>[/<id>]: the curriculum and the practice pages around it. Each page loads on demand.
const Extras = () => import("@/components/LearnExtras");
const ReviewPage = lazy(() => Extras().then((m) => ({ default: m.ReviewPage })));
const DrawIndex = lazy(() => Extras().then((m) => ({ default: m.DrawIndex })));
const DrawPage = lazy(() => Extras().then((m) => ({ default: m.DrawPage })));
const Pages = () => import("@/components/LearnPages");
const GlossaryPage = lazy(() => Pages().then((m) => ({ default: m.GlossaryPage })));
const CheckPage = lazy(() => Pages().then((m) => ({ default: m.CheckPage })));
const TeachPage = lazy(() => Pages().then((m) => ({ default: m.TeachPage })));
const AssignedPage = lazy(() => Pages().then((m) => ({ default: m.AssignedPage })));
const ProgressPage = lazy(() => Pages().then((m) => ({ default: m.ProgressPage })));
const ProjectsIndex = lazy(() => Pages().then((m) => ({ default: m.ProjectsIndex })));
const ProjectPage = lazy(() => Pages().then((m) => ({ default: m.ProjectPage })));
const StudioIndex = lazy(() => import("@/components/Studio").then((m) => ({ default: m.StudioIndex })));
const StudioPage = lazy(() => import("@/components/Studio").then((m) => ({ default: m.StudioPage })));
const ReferencesPage = lazy(() => import("@/components/ReadingList").then((m) => ({ default: m.ReferencesPage })));
const ModelBuilder = lazy(() => import("@/components/Builder").then((m) => ({ default: m.ModelBuilder })));
const GamesIndex = lazy(() => import("@/components/Games").then((m) => ({ default: m.GamesIndex })));
const GamePage = lazy(() => import("@/components/Games").then((m) => ({ default: m.GamePage })));

export default function LearnRoutes({ page, id, go }: { page?: string; id?: string; go: (hash: string) => void }) {
  const index = () => go("/learn");
  const module = (m: string) => go(`/learn/${m}`);
  if (!page) return <CurriculumIndex onModule={module} onOpen={go} />;
  if (page === "review") return <ReviewPage onIndex={index} onModule={module} />;
  if (page === "draw") return id ? <DrawPage key={id} id={id} onIndex={index} onAll={() => go("/learn/draw")} /> : <DrawIndex onDraw={(d) => go(`/learn/draw/${d}`)} onIndex={index} />;
  if (page === "games") return id ? <GamePage key={id} id={id} onIndex={() => go("/learn/games")} onOpen={go} /> : <GamesIndex onGame={(g) => go(`/learn/games/${g}`)} onOpen={go} />;
  if (page === "build") return <ModelBuilder onOpen={go} />;
  if (page === "glossary") return <GlossaryPage go={go} />;
  if (page === "check") return <CheckPage go={go} />;
  if (page === "teach") return <TeachPage go={go} />;
  if (page === "progress") return <ProgressPage go={go} />;
  if (page === "assigned") return <AssignedPage ids={(id ?? "").split("+").filter(Boolean)} go={go} />;
  if (page === "studio") return id ? <StudioPage key={id} id={id} go={go} /> : <StudioIndex go={go} />;
  if (page === "references") return <ReferencesPage go={go} />;
  if (page === "projects") return id ? <ProjectPage key={id} id={id} go={go} /> : <ProjectsIndex go={go} />;
  return <ModulePage key={page} id={page} onModule={module} onIndex={index} onOpen={go} />;
}

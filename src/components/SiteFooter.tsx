import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { BrickMark } from "@/components/TopBar";

// Light by default; System follows the device. The choice is remembered and applied by index.html before the first paint
function ThemePicker() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") ?? "light";
    } catch {
      return "light";
    }
  });
  const pick = (t: string) => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "system") delete root.dataset.theme;
    else root.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* private window: the choice lasts until the page closes */
    }
  };
  return (
    <label className="mt-4 inline-flex items-center gap-2 text-muted-foreground">
      Theme
      <select value={theme} onChange={(e) => pick(e.target.value)} className="h-9 rounded-[7px] border border-input bg-card px-2 text-foreground font-semibold">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

// Who made LoopBricks and how to reach them: on every page.
export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="page pt-10 pb-24 lg:pb-10 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 text-[14px] leading-[1.6]">
        <div className="flex gap-4">
          <BrickMark size={30} />
          <div>
            <p className="heading text-[18px]">Dr Wael Rashwan</p>
            <p className="text-foreground/85">Lecturer in Business Analytics, School of Business, Maynooth University</p>
            <p className="mt-3 font-semibold">LoopBricks is part of the 3S Research Group.</p>
            <ul className="mt-3 space-y-0.5 text-muted-foreground">
              <li>Co-lead, Data Science and Digital Transformation Research Beacon</li>
              <li>Principal investigator, Rinn-AI funded project</li>
              <li>Collaborator, IVI</li>
            </ul>
          </div>
        </div>
        <div>
          <p className="heading text-[15px]">Contact</p>
          <p className="mt-2 flex items-center gap-2">
            <Mail size={15} aria-hidden className="text-muted-foreground shrink-0" />
            <a href="mailto:wael.rashwan@mu.ie" className="tlink font-semibold">
              wael.rashwan@mu.ie
            </a>
          </p>
          <p className="mt-1.5 flex items-start gap-2 text-foreground/85">
            <MapPin size={15} aria-hidden className="text-muted-foreground shrink-0 mt-1" />
            <span>
              TSI Building, School of Business
              <br />
              Maynooth University, Maynooth, Co. Kildare, Ireland
            </span>
          </p>
          <p className="mt-4 text-muted-foreground">
            An independent project: our own engines and models, built from the structures in Jim Hines&rsquo; <i>Molecules of Structure</i>. Not affiliated with or endorsed by Jim Hines, Ventana Systems (Vensim) or isee systems (Stella).
          </p>
          <p className="mt-2 text-muted-foreground">
            <a href="./book/" className="tlink font-semibold">Read the book</a>, <i>System Dynamics with Python</i>. Looking for the earlier version? <a href="./v1/" className="tlink font-semibold">Open LoopBricks 1.0</a>
          </p>
          <ThemePicker />
        </div>
      </div>
    </footer>
  );
}

import { Mail, MapPin } from "lucide-react";
import { BrickMark } from "@/components/TopBar";

// Who made LoopBricks and how to reach them: on every page.
export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 pb-24 lg:pb-10 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-8 text-[14px] leading-[1.6]">
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
            <a href="./book/" className="tlink font-semibold">Read the book</a>, with a Python chapter for every Learn module. Looking for the earlier version, without Python? <a href="./v1/" className="tlink font-semibold">Open LoopBricks 1.0</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

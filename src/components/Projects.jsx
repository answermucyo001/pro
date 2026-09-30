import Section from "./Section.jsx";
import ProjectItem from "./ProjectItem.jsx";
import { projects } from "../data/projects.js";

export default function Projects() {
  return (
    <Section id="projects" title="Projects">
      <ul className="project-list">
        {projects.map((p) => <ProjectItem key={p.title} project={p} />)}
      </ul>
    </Section>
  );
}

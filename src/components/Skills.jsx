import Section from "./Section.jsx";
import TechTag from "./TechTag.jsx";
import SkillConstellation from "./SkillConstellation.jsx";
import { skills } from "../data/skills.js";

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <p>My skills as a constellation: each group is a cluster of things I build with and keep learning.</p>
      <SkillConstellation />
      <dl className="skill-groups">
        {skills.map((g) => (
          <div key={g.group} className="skill-group">
            <dt>{g.group}</dt>
            <dd>
              <ul className="tags">{g.items.map((i) => <TechTag key={i}>{i}</TechTag>)}</ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

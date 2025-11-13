import Image from "next/image";
import React from "react";

// Define an array of skill badges to display
const skillBadges = [
  { label: "Git" },
  { label: "NextJS" },
  { label: "Google Cloud" },
  { label: "TailwindCSS" },
  { label: "Adobe CC" },
  { label: "GenAI" },
  { label: "Figma" },
  { label: "VSCode" },
  { label: "Python" },
  { label: "More..." },
];

const AboutContent = () => (
  <div className="p-6 md:p-8 w-full min-w-[220px] min-h-0 h-full text-primary">
    <div className="flex flex-col items-start gap-6 mb-6">
      <div className="w-32 h-32 relative rounded-full overflow-hidden shadow-lg">
        <Image
          src="/profile-image.png"
          alt="Profilbild von Kevin Tamme"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 text-left">
        <a className="font-medium mb-1">Kevin Tamme.</a>
        <p className="text-muted">Software Developer.</p>
      </div>
      <div className="flex-1 text-left">
        <p className="text-muted">
          We oftentimes get annoyed by enterprise
          bloatware, subscription models for basic features, and apps that seem
          to want my data more than anything else.
          <br />
          <br />
          My philosophy is that powerful tech shouldn&apos;t be expensive, and
          it definitely shouldn&apos;t be built to sell you out.
          <br />
          <br />
          So I build apps and tools that are fast, reliable, and respect your
          privacy - all while being free.
        </p>
      </div>
    </div>
    <div className="mb-6">
      <h4 className="font-medium mb-2">What I work with:</h4>
      <div className="flex flex-wrap gap-2">
        {skillBadges.map((skill) => (
          <span
            key={skill.label}
            className="bg-secondary text-primary px-3 py-1 rounded-full text-sm font-medium"
          >
            {skill.label}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default AboutContent;

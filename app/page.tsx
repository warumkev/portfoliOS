import OS from "@/components/os/OS";
import { loadProjects } from "@/lib/projects";

export default function Home() {
  const projects = loadProjects();
  return <OS projects={projects} />;
}

import { redirect } from "next/navigation";

// Roadmaps are reached from each learning path ("View as roadmap"), so the
// index lives under Paths.
export default function RoadmapsPage() {
  redirect("/paths");
}

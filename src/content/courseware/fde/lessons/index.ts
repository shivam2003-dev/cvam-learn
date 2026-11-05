import type { Lesson } from "@/lib/types";
import { lesson as courseReadiness } from "./course-readiness";
import { lesson as customerDiscovery } from "./customer-discovery";
import { lesson as enterpriseConstraints } from "./enterprise-constraints";
import { lesson as fieldFeedbackLoop } from "./field-feedback-loop";
import { lesson as pilotPhase } from "./pilot-phase";
import { lesson as pocSprint } from "./poc-sprint";
import { lesson as projectHandoff } from "./project-handoff";
import { lesson as scopingSolutionArchitecture } from "./scoping-solution-architecture";
import { lesson as stakeholderCommunication } from "./stakeholder-communication";
import { lesson as weekInTheLife } from "./week-in-the-life";
import { lesson as whoIsAnFde } from "./who-is-an-fde";

export const lessons: Record<string, Lesson> = {
  "course-readiness": courseReadiness,
  "customer-discovery": customerDiscovery,
  "enterprise-constraints": enterpriseConstraints,
  "field-feedback-loop": fieldFeedbackLoop,
  "pilot-phase": pilotPhase,
  "poc-sprint": pocSprint,
  "project-handoff": projectHandoff,
  "scoping-solution-architecture": scopingSolutionArchitecture,
  "stakeholder-communication": stakeholderCommunication,
  "week-in-the-life": weekInTheLife,
  "who-is-an-fde": whoIsAnFde,
};

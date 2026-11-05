import type { Lesson } from "@/lib/types";
import { lesson as aiSystemLandscape } from "./ai-system-landscape";
import { lesson as authBridging } from "./auth-bridging";
import { lesson as choosingAgenticFramework } from "./choosing-agentic-framework";
import { lesson as clientApproach } from "./client-approach";
import { lesson as clientSecurityDeployment } from "./client-security-deployment";
import { lesson as courseReadiness } from "./course-readiness";
import { lesson as customerDiscovery } from "./customer-discovery";
import { lesson as dataContractsSchemaChanges } from "./data-contracts-schema-changes";
import { lesson as dataMovementPatterns } from "./data-movement-patterns";
import { lesson as enterpriseConstraints } from "./enterprise-constraints";
import { lesson as failuresRateLimitsSilentErrors } from "./failures-rate-limits-silent-errors";
import { lesson as fieldFeedbackLoop } from "./field-feedback-loop";
import { lesson as fourInterviewRounds } from "./four-interview-rounds";
import { lesson as harnessGuardrailsObservability } from "./harness-guardrails-observability";
import { lesson as harnessToolsMemoryContext } from "./harness-tools-memory-context";
import { lesson as howDesignRoundsWork } from "./how-design-rounds-work";
import { lesson as howFdeInterviewsWork } from "./how-fde-interviews-work";
import { lesson as llmBasedSystems } from "./llm-based-systems";
import { lesson as multiAgentOrchestration } from "./multi-agent-orchestration";
import { lesson as pilotPhase } from "./pilot-phase";
import { lesson as pocSprint } from "./poc-sprint";
import { lesson as projectHandoff } from "./project-handoff";
import { lesson as runningDesignRound } from "./running-design-round";
import { lesson as scopingSolutionArchitecture } from "./scoping-solution-architecture";
import { lesson as stakeholderCommunication } from "./stakeholder-communication";
import { lesson as weekInTheLife } from "./week-in-the-life";
import { lesson as whoIsAnFde } from "./who-is-an-fde";

export const lessons: Record<string, Lesson> = {
  "ai-system-landscape": aiSystemLandscape,
  "auth-bridging": authBridging,
  "choosing-agentic-framework": choosingAgenticFramework,
  "client-approach": clientApproach,
  "client-security-deployment": clientSecurityDeployment,
  "course-readiness": courseReadiness,
  "customer-discovery": customerDiscovery,
  "data-contracts-schema-changes": dataContractsSchemaChanges,
  "data-movement-patterns": dataMovementPatterns,
  "enterprise-constraints": enterpriseConstraints,
  "failures-rate-limits-silent-errors": failuresRateLimitsSilentErrors,
  "field-feedback-loop": fieldFeedbackLoop,
  "four-interview-rounds": fourInterviewRounds,
  "harness-guardrails-observability": harnessGuardrailsObservability,
  "harness-tools-memory-context": harnessToolsMemoryContext,
  "how-design-rounds-work": howDesignRoundsWork,
  "how-fde-interviews-work": howFdeInterviewsWork,
  "llm-based-systems": llmBasedSystems,
  "multi-agent-orchestration": multiAgentOrchestration,
  "pilot-phase": pilotPhase,
  "poc-sprint": pocSprint,
  "project-handoff": projectHandoff,
  "running-design-round": runningDesignRound,
  "scoping-solution-architecture": scopingSolutionArchitecture,
  "stakeholder-communication": stakeholderCommunication,
  "week-in-the-life": weekInTheLife,
  "who-is-an-fde": whoIsAnFde,
};

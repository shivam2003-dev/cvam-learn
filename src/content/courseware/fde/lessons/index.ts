import type { Lesson } from "@/lib/types";
import { lesson as aiSystemLandscape } from "./ai-system-landscape";
import { lesson as authBridging } from "./auth-bridging";
import { lesson as billingDecompose } from "./billing-decompose";
import { lesson as billingDesign } from "./billing-design";
import { lesson as billingInterview } from "./billing-interview";
import { lesson as capstoneDataIntegration } from "./capstone-data-integration";
import { lesson as capstoneLlmApplication } from "./capstone-llm-application";
import { lesson as choosingAgenticFramework } from "./choosing-agentic-framework";
import { lesson as clientApproach } from "./client-approach";
import { lesson as clientSecurityDeployment } from "./client-security-deployment";
import { lesson as courseReadiness } from "./course-readiness";
import { lesson as csAgentDecompose } from "./cs-agent-decompose";
import { lesson as csAgentDesign } from "./cs-agent-design";
import { lesson as csAgentInterview } from "./cs-agent-interview";
import { lesson as customerDiscovery } from "./customer-discovery";
import { lesson as dataContractsSchemaChanges } from "./data-contracts-schema-changes";
import { lesson as dataMovementPatterns } from "./data-movement-patterns";
import { lesson as deliveryDefending } from "./delivery-defending";
import { lesson as deliveryInterface } from "./delivery-interface";
import { lesson as deliveryLiveExtension } from "./delivery-live-extension";
import { lesson as deliveryMistakes } from "./delivery-mistakes";
import { lesson as deliveryReadme } from "./delivery-readme";
import { lesson as deliveryRolePlay } from "./delivery-role-play";
import { lesson as deliveryTradeoffs } from "./delivery-tradeoffs";
import { lesson as deliveryUserWorkflow } from "./delivery-user-workflow";
import { lesson as deliveryWalkthroughVideo } from "./delivery-walkthrough-video";
import { lesson as enterpriseConstraints } from "./enterprise-constraints";
import { lesson as failuresRateLimitsSilentErrors } from "./failures-rate-limits-silent-errors";
import { lesson as fieldFeedbackLoop } from "./field-feedback-loop";
import { lesson as financialDecompose } from "./financial-decompose";
import { lesson as financialDesign } from "./financial-design";
import { lesson as financialInterview } from "./financial-interview";
import { lesson as financialProject } from "./financial-project";
import { lesson as fourInterviewRounds } from "./four-interview-rounds";
import { lesson as guideAnthropic } from "./guide-anthropic";
import { lesson as guideGoogleCloud } from "./guide-google-cloud";
import { lesson as guideOpenai } from "./guide-openai";
import { lesson as guidePalantir } from "./guide-palantir";
import { lesson as harnessGuardrailsObservability } from "./harness-guardrails-observability";
import { lesson as harnessToolsMemoryContext } from "./harness-tools-memory-context";
import { lesson as healthHubDecompose } from "./health-hub-decompose";
import { lesson as healthHubDesign } from "./health-hub-design";
import { lesson as healthHubInterview } from "./health-hub-interview";
import { lesson as howDesignRoundsWork } from "./how-design-rounds-work";
import { lesson as howFdeInterviewsWork } from "./how-fde-interviews-work";
import { lesson as labImageClassification } from "./lab-image-classification";
import { lesson as llmBasedSystems } from "./llm-based-systems";
import { lesson as multiAgentOrchestration } from "./multi-agent-orchestration";
import { lesson as otcDecompose } from "./otc-decompose";
import { lesson as otcDesign } from "./otc-design";
import { lesson as otcInterview } from "./otc-interview";
import { lesson as pilotPhase } from "./pilot-phase";
import { lesson as pocSprint } from "./poc-sprint";
import { lesson as practiceRoundsRubric } from "./practice-rounds-rubric";
import { lesson as projectHandoff } from "./project-handoff";
import { lesson as runningDesignRound } from "./running-design-round";
import { lesson as scopingSolutionArchitecture } from "./scoping-solution-architecture";
import { lesson as shipmentDecompose } from "./shipment-decompose";
import { lesson as shipmentDesign } from "./shipment-design";
import { lesson as shipmentInterview } from "./shipment-interview";
import { lesson as shipmentProject } from "./shipment-project";
import { lesson as stakeholderCommunication } from "./stakeholder-communication";
import { lesson as takehomeAmbiguity } from "./takehome-ambiguity";
import { lesson as takehomeCodeQuality } from "./takehome-code-quality";
import { lesson as takehomeEvaluatingLlm } from "./takehome-evaluating-llm";
import { lesson as takehomeLlmSolutions } from "./takehome-llm-solutions";
import { lesson as takehomeMessyData } from "./takehome-messy-data";
import { lesson as takehomeMvp } from "./takehome-mvp";
import { lesson as takehomeReadingBrief } from "./takehome-reading-brief";
import { lesson as takehomeScoring } from "./takehome-scoring";
import { lesson as takehomeStack } from "./takehome-stack";
import { lesson as takehomeThirdPartyApis } from "./takehome-third-party-apis";
import { lesson as takehomeTypes } from "./takehome-types";
import { lesson as weekInTheLife } from "./week-in-the-life";
import { lesson as whatsNext } from "./whats-next";
import { lesson as whoIsAnFde } from "./who-is-an-fde";

export const lessons: Record<string, Lesson> = {
  "ai-system-landscape": aiSystemLandscape,
  "auth-bridging": authBridging,
  "billing-decompose": billingDecompose,
  "billing-design": billingDesign,
  "billing-interview": billingInterview,
  "capstone-data-integration": capstoneDataIntegration,
  "capstone-llm-application": capstoneLlmApplication,
  "choosing-agentic-framework": choosingAgenticFramework,
  "client-approach": clientApproach,
  "client-security-deployment": clientSecurityDeployment,
  "course-readiness": courseReadiness,
  "cs-agent-decompose": csAgentDecompose,
  "cs-agent-design": csAgentDesign,
  "cs-agent-interview": csAgentInterview,
  "customer-discovery": customerDiscovery,
  "data-contracts-schema-changes": dataContractsSchemaChanges,
  "data-movement-patterns": dataMovementPatterns,
  "delivery-defending": deliveryDefending,
  "delivery-interface": deliveryInterface,
  "delivery-live-extension": deliveryLiveExtension,
  "delivery-mistakes": deliveryMistakes,
  "delivery-readme": deliveryReadme,
  "delivery-role-play": deliveryRolePlay,
  "delivery-tradeoffs": deliveryTradeoffs,
  "delivery-user-workflow": deliveryUserWorkflow,
  "delivery-walkthrough-video": deliveryWalkthroughVideo,
  "enterprise-constraints": enterpriseConstraints,
  "failures-rate-limits-silent-errors": failuresRateLimitsSilentErrors,
  "field-feedback-loop": fieldFeedbackLoop,
  "financial-decompose": financialDecompose,
  "financial-design": financialDesign,
  "financial-interview": financialInterview,
  "financial-project": financialProject,
  "four-interview-rounds": fourInterviewRounds,
  "guide-anthropic": guideAnthropic,
  "guide-google-cloud": guideGoogleCloud,
  "guide-openai": guideOpenai,
  "guide-palantir": guidePalantir,
  "harness-guardrails-observability": harnessGuardrailsObservability,
  "harness-tools-memory-context": harnessToolsMemoryContext,
  "health-hub-decompose": healthHubDecompose,
  "health-hub-design": healthHubDesign,
  "health-hub-interview": healthHubInterview,
  "how-design-rounds-work": howDesignRoundsWork,
  "how-fde-interviews-work": howFdeInterviewsWork,
  "lab-image-classification": labImageClassification,
  "llm-based-systems": llmBasedSystems,
  "multi-agent-orchestration": multiAgentOrchestration,
  "otc-decompose": otcDecompose,
  "otc-design": otcDesign,
  "otc-interview": otcInterview,
  "pilot-phase": pilotPhase,
  "poc-sprint": pocSprint,
  "practice-rounds-rubric": practiceRoundsRubric,
  "project-handoff": projectHandoff,
  "running-design-round": runningDesignRound,
  "scoping-solution-architecture": scopingSolutionArchitecture,
  "shipment-decompose": shipmentDecompose,
  "shipment-design": shipmentDesign,
  "shipment-interview": shipmentInterview,
  "shipment-project": shipmentProject,
  "stakeholder-communication": stakeholderCommunication,
  "takehome-ambiguity": takehomeAmbiguity,
  "takehome-code-quality": takehomeCodeQuality,
  "takehome-evaluating-llm": takehomeEvaluatingLlm,
  "takehome-llm-solutions": takehomeLlmSolutions,
  "takehome-messy-data": takehomeMessyData,
  "takehome-mvp": takehomeMvp,
  "takehome-reading-brief": takehomeReadingBrief,
  "takehome-scoring": takehomeScoring,
  "takehome-stack": takehomeStack,
  "takehome-third-party-apis": takehomeThirdPartyApis,
  "takehome-types": takehomeTypes,
  "week-in-the-life": weekInTheLife,
  "whats-next": whatsNext,
  "who-is-an-fde": whoIsAnFde,
};

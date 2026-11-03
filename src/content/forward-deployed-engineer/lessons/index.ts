import type { Lesson } from "@/lib/types";
import { lesson as agentArchitectures } from "./agent-architectures";
import { lesson as aiCodingAgents } from "./ai-coding-agents";
import { lesson as aiGovernanceAndPrivacy } from "./ai-governance-and-privacy";
import { lesson as apiDesignAndGraphql } from "./api-design-and-graphql";
import { lesson as backendAndDatabases } from "./backend-and-databases";
import { lesson as buildingEvalPipelines } from "./building-eval-pipelines";
import { lesson as cloudPlatformsAndTerraform } from "./cloud-platforms-and-terraform";
import { lesson as dataModelingAndPipelines } from "./data-modeling-and-pipelines";
import { lesson as day2ProductizedEmbedded } from "./day-2-productized-embedded";
import { lesson as debuggingAgentLogic } from "./debugging-agent-logic";
import { lesson as deltaUatLastMile } from "./delta-uat-last-mile";
import { lesson as dockerAndKubernetes } from "./docker-and-kubernetes";
import { lesson as dsaAndSystemDesign } from "./dsa-and-system-design";
import { lesson as enterpriseWorkflows } from "./enterprise-workflows";
import { lesson as executiveReporting } from "./executive-reporting";
import { lesson as fdeTiersAndPaths } from "./fde-tiers-and-paths";
import { lesson as frontendForFdes } from "./frontend-for-fdes";
import { lesson as gitAndGithub } from "./git-and-github";
import { lesson as inferenceOptimization } from "./inference-optimization";
import { lesson as languagesForFdes } from "./languages-for-fdes";
import { lesson as linuxSkills } from "./linux-skills";
import { lesson as llmPromptContext } from "./llm-prompt-context";
import { lesson as mlopsForFdes } from "./mlops-for-fdes";
import { lesson as modelProvidersAndPromptManagement } from "./model-providers-and-prompt-management";
import { lesson as ragAndVectorDbs } from "./rag-and-vector-dbs";
import { lesson as requirementsGathering } from "./requirements-gathering";
import { lesson as roiAndTimeToValue } from "./roi-and-time-to-value";
import { lesson as scopeSpeedQuality } from "./scope-speed-quality";
import { lesson as scopingAndSequencing } from "./scoping-and-sequencing";
import { lesson as secureApisAndAuth } from "./secure-apis-and-auth";
import { lesson as stakeholdersAndFeedbackLoop } from "./stakeholders-and-feedback-loop";
import { lesson as technicalWriting } from "./technical-writing";
import { lesson as toolsMemoryMcp } from "./tools-memory-mcp";
import { lesson as warehousesSparkAirflow } from "./warehouses-spark-airflow";
import { lesson as whatIsAnFde } from "./what-is-an-fde";
import { lesson as workingWithLegacySystems } from "./working-with-legacy-systems";

export const lessons: Record<string, Lesson> = {
  "agent-architectures": agentArchitectures,
  "ai-coding-agents": aiCodingAgents,
  "ai-governance-and-privacy": aiGovernanceAndPrivacy,
  "api-design-and-graphql": apiDesignAndGraphql,
  "backend-and-databases": backendAndDatabases,
  "building-eval-pipelines": buildingEvalPipelines,
  "cloud-platforms-and-terraform": cloudPlatformsAndTerraform,
  "data-modeling-and-pipelines": dataModelingAndPipelines,
  "day-2-productized-embedded": day2ProductizedEmbedded,
  "debugging-agent-logic": debuggingAgentLogic,
  "delta-uat-last-mile": deltaUatLastMile,
  "docker-and-kubernetes": dockerAndKubernetes,
  "dsa-and-system-design": dsaAndSystemDesign,
  "enterprise-workflows": enterpriseWorkflows,
  "executive-reporting": executiveReporting,
  "fde-tiers-and-paths": fdeTiersAndPaths,
  "frontend-for-fdes": frontendForFdes,
  "git-and-github": gitAndGithub,
  "inference-optimization": inferenceOptimization,
  "languages-for-fdes": languagesForFdes,
  "linux-skills": linuxSkills,
  "llm-prompt-context": llmPromptContext,
  "mlops-for-fdes": mlopsForFdes,
  "model-providers-and-prompt-management": modelProvidersAndPromptManagement,
  "rag-and-vector-dbs": ragAndVectorDbs,
  "requirements-gathering": requirementsGathering,
  "roi-and-time-to-value": roiAndTimeToValue,
  "scope-speed-quality": scopeSpeedQuality,
  "scoping-and-sequencing": scopingAndSequencing,
  "secure-apis-and-auth": secureApisAndAuth,
  "stakeholders-and-feedback-loop": stakeholdersAndFeedbackLoop,
  "technical-writing": technicalWriting,
  "tools-memory-mcp": toolsMemoryMcp,
  "warehouses-spark-airflow": warehousesSparkAirflow,
  "what-is-an-fde": whatIsAnFde,
  "working-with-legacy-systems": workingWithLegacySystems,
};

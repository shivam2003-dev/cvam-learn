import type { Lesson } from "@/lib/types";
import { lesson as aiMlSolutionDesign } from "./ai-ml-solution-design";
import { lesson as aiPlatformWorkflows } from "./ai-platform-workflows";
import { lesson as apiManagementApigee } from "./api-management-apigee";
import { lesson as businessProcessesFinops } from "./business-processes-finops";
import { lesson as businessRequirementsWellarchitected } from "./business-requirements-wellarchitected";
import { lesson as caseStudyTechnique } from "./case-study-technique";
import { lesson as complianceGovernance } from "./compliance-governance";
import { lesson as computeChoices } from "./compute-choices";
import { lesson as computeConfigurationIac } from "./compute-configuration-iac";
import { lesson as dataProcessingAnalytics } from "./data-processing-analytics";
import { lesson as dataProtectionKmsSecrets } from "./data-protection-kms-secrets";
import { lesson as examTechniqueAndReview } from "./exam-technique-and-review";
import { lesson as gcpFoundations } from "./gcp-foundations";
import { lesson as haDrScalability } from "./ha-dr-scalability";
import { lesson as hybridMulticloudConnectivity } from "./hybrid-multicloud-connectivity";
import { lesson as iamResourceHierarchy } from "./iam-resource-hierarchy";
import { lesson as labSecureThreeTier } from "./lab-secure-three-tier";
import { lesson as loadBalancingEdgeSecurity } from "./load-balancing-edge-security";
import { lesson as migrationPlanning } from "./migration-planning";
import { lesson as networkingDesign } from "./networking-design";
import { lesson as observabilityMonitoring } from "./observability-monitoring";
import { lesson as pcaExamOverview } from "./pca-exam-overview";
import { lesson as perimeterControls } from "./perimeter-controls";
import { lesson as prebuiltAiApis } from "./prebuilt-ai-apis";
import { lesson as programmaticAccessTerraform } from "./programmatic-access-terraform";
import { lesson as releaseReliabilitySre } from "./release-reliability-sre";
import { lesson as scenarioRegulatedHybrid } from "./scenario-regulated-hybrid";
import { lesson as scenarioRetailModernization } from "./scenario-retail-modernization";
import { lesson as sdlcCicdTesting } from "./sdlc-cicd-testing";
import { lesson as storageConfigurationLifecycle } from "./storage-configuration-lifecycle";
import { lesson as storageDatabaseChoices } from "./storage-database-choices";
import { lesson as supplyChainAiSecurity } from "./supply-chain-ai-security";
import { lesson as troubleshootingDrTesting } from "./troubleshooting-dr-testing";

export const lessons: Record<string, Lesson> = {
  "ai-ml-solution-design": aiMlSolutionDesign,
  "ai-platform-workflows": aiPlatformWorkflows,
  "api-management-apigee": apiManagementApigee,
  "business-processes-finops": businessProcessesFinops,
  "business-requirements-wellarchitected": businessRequirementsWellarchitected,
  "case-study-technique": caseStudyTechnique,
  "compliance-governance": complianceGovernance,
  "compute-choices": computeChoices,
  "compute-configuration-iac": computeConfigurationIac,
  "data-processing-analytics": dataProcessingAnalytics,
  "data-protection-kms-secrets": dataProtectionKmsSecrets,
  "exam-technique-and-review": examTechniqueAndReview,
  "gcp-foundations": gcpFoundations,
  "ha-dr-scalability": haDrScalability,
  "hybrid-multicloud-connectivity": hybridMulticloudConnectivity,
  "iam-resource-hierarchy": iamResourceHierarchy,
  "lab-secure-three-tier": labSecureThreeTier,
  "load-balancing-edge-security": loadBalancingEdgeSecurity,
  "migration-planning": migrationPlanning,
  "networking-design": networkingDesign,
  "observability-monitoring": observabilityMonitoring,
  "pca-exam-overview": pcaExamOverview,
  "perimeter-controls": perimeterControls,
  "prebuilt-ai-apis": prebuiltAiApis,
  "programmatic-access-terraform": programmaticAccessTerraform,
  "release-reliability-sre": releaseReliabilitySre,
  "scenario-regulated-hybrid": scenarioRegulatedHybrid,
  "scenario-retail-modernization": scenarioRetailModernization,
  "sdlc-cicd-testing": sdlcCicdTesting,
  "storage-configuration-lifecycle": storageConfigurationLifecycle,
  "storage-database-choices": storageDatabaseChoices,
  "supply-chain-ai-security": supplyChainAiSecurity,
  "troubleshooting-dr-testing": troubleshootingDrTesting,
};

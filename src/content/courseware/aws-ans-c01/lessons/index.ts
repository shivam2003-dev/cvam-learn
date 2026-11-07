import type { Lesson } from "@/lib/types";
import { lesson as ansExamOverview } from "./ans-exam-overview";
import { lesson as bgpRoutingPolicy } from "./bgp-routing-policy";
import { lesson as cloudfrontDesign } from "./cloudfront-design";
import { lesson as directConnectDesign } from "./direct-connect-design";
import { lesson as directConnectImplementation } from "./direct-connect-implementation";
import { lesson as dnssecDnsSecurity } from "./dnssec-dns-security";
import { lesson as elbConfigIntegration } from "./elb-config-integration";
import { lesson as elbTypesLayers } from "./elb-types-layers";
import { lesson as encryptionInTransitCertificates } from "./encryption-in-transit-certificates";
import { lesson as examTechniqueAndReview } from "./exam-technique-and-review";
import { lesson as flowLogsTrafficMirroring } from "./flow-logs-traffic-mirroring";
import { lesson as globalAcceleratorEdge } from "./global-accelerator-edge";
import { lesson as hybridDnsResolver } from "./hybrid-dns-resolver";
import { lesson as hybridSdwanRedundancy } from "./hybrid-sdwan-redundancy";
import { lesson as labHubSpokeTransitGateway } from "./lab-hub-spoke-transit-gateway";
import { lesson as maintainingRoutingQuotas } from "./maintaining-routing-quotas";
import { lesson as networkAutomationIac } from "./network-automation-iac";
import { lesson as networkFoundations } from "./network-foundations";
import { lesson as networkMonitoringCloudwatch } from "./network-monitoring-cloudwatch";
import { lesson as outboundInspectionFirewall } from "./outbound-inspection-firewall";
import { lesson as performanceCostOptimization } from "./performance-cost-optimization";
import { lesson as privatelinkEndpoints } from "./privatelink-endpoints";
import { lesson as reachabilityNetworkManager } from "./reachability-network-manager";
import { lesson as route53PublicPrivate } from "./route53-public-private";
import { lesson as route53RoutingHealth } from "./route53-routing-health";
import { lesson as scenarioEnterpriseHybrid } from "./scenario-enterprise-hybrid";
import { lesson as scenarioGlobalApplication } from "./scenario-global-application";
import { lesson as sgNaclFirewallManagerAudit } from "./sg-nacl-firewall-manager-audit";
import { lesson as siteToSiteClientVpn } from "./site-to-site-client-vpn";
import { lesson as threatModelingInboundSecurity } from "./threat-modeling-inbound-security";
import { lesson as transitGatewayArchitectures } from "./transit-gateway-architectures";
import { lesson as troubleshootingPlaybook } from "./troubleshooting-playbook";
import { lesson as vpcDesignAddressing } from "./vpc-design-addressing";
import { lesson as vpcPeeringVsTgw } from "./vpc-peering-vs-tgw";
import { lesson as vpcSharingOrganizations } from "./vpc-sharing-organizations";

export const lessons: Record<string, Lesson> = {
  "ans-exam-overview": ansExamOverview,
  "bgp-routing-policy": bgpRoutingPolicy,
  "cloudfront-design": cloudfrontDesign,
  "direct-connect-design": directConnectDesign,
  "direct-connect-implementation": directConnectImplementation,
  "dnssec-dns-security": dnssecDnsSecurity,
  "elb-config-integration": elbConfigIntegration,
  "elb-types-layers": elbTypesLayers,
  "encryption-in-transit-certificates": encryptionInTransitCertificates,
  "exam-technique-and-review": examTechniqueAndReview,
  "flow-logs-traffic-mirroring": flowLogsTrafficMirroring,
  "global-accelerator-edge": globalAcceleratorEdge,
  "hybrid-dns-resolver": hybridDnsResolver,
  "hybrid-sdwan-redundancy": hybridSdwanRedundancy,
  "lab-hub-spoke-transit-gateway": labHubSpokeTransitGateway,
  "maintaining-routing-quotas": maintainingRoutingQuotas,
  "network-automation-iac": networkAutomationIac,
  "network-foundations": networkFoundations,
  "network-monitoring-cloudwatch": networkMonitoringCloudwatch,
  "outbound-inspection-firewall": outboundInspectionFirewall,
  "performance-cost-optimization": performanceCostOptimization,
  "privatelink-endpoints": privatelinkEndpoints,
  "reachability-network-manager": reachabilityNetworkManager,
  "route53-public-private": route53PublicPrivate,
  "route53-routing-health": route53RoutingHealth,
  "scenario-enterprise-hybrid": scenarioEnterpriseHybrid,
  "scenario-global-application": scenarioGlobalApplication,
  "sg-nacl-firewall-manager-audit": sgNaclFirewallManagerAudit,
  "site-to-site-client-vpn": siteToSiteClientVpn,
  "threat-modeling-inbound-security": threatModelingInboundSecurity,
  "transit-gateway-architectures": transitGatewayArchitectures,
  "troubleshooting-playbook": troubleshootingPlaybook,
  "vpc-design-addressing": vpcDesignAddressing,
  "vpc-peering-vs-tgw": vpcPeeringVsTgw,
  "vpc-sharing-organizations": vpcSharingOrganizations,
};

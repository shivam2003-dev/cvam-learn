import type { Lesson } from "@/lib/types";
import { lesson as attackLifecycle } from "./attack-lifecycle";
import { lesson as authnAuthzMfa } from "./authn-authz-mfa";
import { lesson as backupsAndResilience } from "./backups-and-resilience";
import { lesson as ciaTriad } from "./cia-triad";
import { lesson as cloudModelsAndResponsibility } from "./cloud-models-and-responsibility";
import { lesson as cloudProvidersAndStorage } from "./cloud-providers-and-storage";
import { lesson as commonProtocolsAndPorts } from "./common-protocols-and-ports";
import { lesson as csrfAndSessionSecurity } from "./csrf-and-session-security";
import { lesson as defenseInDepthZeroTrust } from "./defense-in-depth-zero-trust";
import { lesson as detectionMetrics } from "./detection-metrics";
import { lesson as digitalForensics } from "./digital-forensics";
import { lesson as dnsDhcpNat } from "./dns-dhcp-nat";
import { lesson as endpointSecurity } from "./endpoint-security";
import { lesson as firewallsAndSegmentation } from "./firewalls-and-segmentation";
import { lesson as hardwareAndConnections } from "./hardware-and-connections";
import { lesson as hashingAndSalting } from "./hashing-and-salting";
import { lesson as idsIpsHoneypots } from "./ids-ips-honeypots";
import { lesson as incidentResponse } from "./incident-response";
import { lesson as infrastructureAsCodeAndServerless } from "./infrastructure-as-code-and-serverless";
import { lesson as injectionAndXss } from "./injection-and-xss";
import { lesson as ipAddressingSubnetting } from "./ip-addressing-subnetting";
import { lesson as kerberosLdapSso } from "./kerberos-ldap-sso";
import { lesson as linuxForSecurity } from "./linux-for-security";
import { lesson as logsAndSiem } from "./logs-and-siem";
import { lesson as macosBasics } from "./macos-basics";
import { lesson as malwareAnalysisBasics } from "./malware-analysis-basics";
import { lesson as malwareTypes } from "./malware-types";
import { lesson as networkAttacks } from "./network-attacks";
import { lesson as networkDevicesAndTopologies } from "./network-devices-and-topologies";
import { lesson as networkTools } from "./network-tools";
import { lesson as osHardeningAndPatching } from "./os-hardening-and-patching";
import { lesson as osiAndTcpIp } from "./osi-and-tcp-ip";
import { lesson as owaspTop10 } from "./owasp-top-10";
import { lesson as passwordAttacks } from "./password-attacks";
import { lesson as pentestAndReverseEngineering } from "./pentest-and-reverse-engineering";
import { lesson as permissionsAndAccess } from "./permissions-and-access";
import { lesson as practicePlatformsAndCerts } from "./practice-platforms-and-certs";
import { lesson as privilegeEscalation } from "./privilege-escalation";
import { lesson as radiusAndNetworkAccess } from "./radius-and-network-access";
import { lesson as riskAndThreatModeling } from "./risk-and-threat-modeling";
import { lesson as scriptingForSecurity } from "./scripting-for-security";
import { lesson as secureProtocols } from "./secure-protocols";
import { lesson as securityTeamsAndFrameworks } from "./security-teams-and-frameworks";
import { lesson as socialEngineering } from "./social-engineering";
import { lesson as symmetricAsymmetricKeys } from "./symmetric-asymmetric-keys";
import { lesson as threatActors } from "./threat-actors";
import { lesson as threatIntelAndHunting } from "./threat-intel-and-hunting";
import { lesson as tlsAndCertificates } from "./tls-and-certificates";
import { lesson as virtualizationAndLabs } from "./virtualization-and-labs";
import { lesson as vulnerabilityManagement } from "./vulnerability-management";
import { lesson as whatIsCyberSecurity } from "./what-is-cyber-security";
import { lesson as windowsForSecurity } from "./windows-for-security";

export const lessons: Record<string, Lesson> = {
  "attack-lifecycle": attackLifecycle,
  "authn-authz-mfa": authnAuthzMfa,
  "backups-and-resilience": backupsAndResilience,
  "cia-triad": ciaTriad,
  "cloud-models-and-responsibility": cloudModelsAndResponsibility,
  "cloud-providers-and-storage": cloudProvidersAndStorage,
  "common-protocols-and-ports": commonProtocolsAndPorts,
  "csrf-and-session-security": csrfAndSessionSecurity,
  "defense-in-depth-zero-trust": defenseInDepthZeroTrust,
  "detection-metrics": detectionMetrics,
  "digital-forensics": digitalForensics,
  "dns-dhcp-nat": dnsDhcpNat,
  "endpoint-security": endpointSecurity,
  "firewalls-and-segmentation": firewallsAndSegmentation,
  "hardware-and-connections": hardwareAndConnections,
  "hashing-and-salting": hashingAndSalting,
  "ids-ips-honeypots": idsIpsHoneypots,
  "incident-response": incidentResponse,
  "infrastructure-as-code-and-serverless": infrastructureAsCodeAndServerless,
  "injection-and-xss": injectionAndXss,
  "ip-addressing-subnetting": ipAddressingSubnetting,
  "kerberos-ldap-sso": kerberosLdapSso,
  "linux-for-security": linuxForSecurity,
  "logs-and-siem": logsAndSiem,
  "macos-basics": macosBasics,
  "malware-analysis-basics": malwareAnalysisBasics,
  "malware-types": malwareTypes,
  "network-attacks": networkAttacks,
  "network-devices-and-topologies": networkDevicesAndTopologies,
  "network-tools": networkTools,
  "os-hardening-and-patching": osHardeningAndPatching,
  "osi-and-tcp-ip": osiAndTcpIp,
  "owasp-top-10": owaspTop10,
  "password-attacks": passwordAttacks,
  "pentest-and-reverse-engineering": pentestAndReverseEngineering,
  "permissions-and-access": permissionsAndAccess,
  "practice-platforms-and-certs": practicePlatformsAndCerts,
  "privilege-escalation": privilegeEscalation,
  "radius-and-network-access": radiusAndNetworkAccess,
  "risk-and-threat-modeling": riskAndThreatModeling,
  "scripting-for-security": scriptingForSecurity,
  "secure-protocols": secureProtocols,
  "security-teams-and-frameworks": securityTeamsAndFrameworks,
  "social-engineering": socialEngineering,
  "symmetric-asymmetric-keys": symmetricAsymmetricKeys,
  "threat-actors": threatActors,
  "threat-intel-and-hunting": threatIntelAndHunting,
  "tls-and-certificates": tlsAndCertificates,
  "virtualization-and-labs": virtualizationAndLabs,
  "vulnerability-management": vulnerabilityManagement,
  "what-is-cyber-security": whatIsCyberSecurity,
  "windows-for-security": windowsForSecurity,
};

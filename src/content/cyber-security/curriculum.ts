import type { Course } from "@/lib/types";

export const cyberSecurity: Course = {
  slug: "cyber-security",
  title: "Cyber Security",
  tagline:
    "Learn how systems are attacked and defended, from networking basics to incident response and the cloud.",
  description:
    "A defence-first path through the field: IT and networking foundations, the core ideas every security role shares, cryptography and identity, the common attacks and the controls that stop them, monitoring, incident response, and cloud security.",
  level: "Beginner to Intermediate",
  skills: ["Networking", "Linux & Windows", "Cryptography", "Web security", "SOC & SIEM", "Incident response"],
  modules: [
    {
      id: "it-foundations",
      title: "Fundamental IT Skills",
      blurb: "The hardware, software and habits every security role assumes you have.",
      lessons: [
        { slug: "what-is-cyber-security", title: "What Is Cyber Security?", summary: "The goals of the field, the main job roles, and how this path is laid out." },
        { slug: "hardware-and-connections", title: "Hardware and Connection Types", summary: "Components, ports, wireless links and basic troubleshooting." },
        { slug: "practice-platforms-and-certs", title: "Practice Platforms and Certifications", summary: "Where to practise legally, and which certifications map to which roles." },
      ],
    },
    {
      id: "operating-systems",
      title: "Operating Systems",
      blurb: "You can't defend a machine you can't operate.",
      lessons: [
        { slug: "linux-for-security", title: "Linux", summary: "The filesystem, users, services and the commands you will use daily." },
        { slug: "windows-for-security", title: "Windows", summary: "Accounts, the registry, services and Active Directory at a glance." },
        { slug: "macos-basics", title: "macOS", summary: "What differs on macOS: permissions, protections and tooling." },
        { slug: "permissions-and-access", title: "Permissions and Access Control", summary: "Owners, groups, ACLs and least privilege on every OS." },
        { slug: "virtualization-and-labs", title: "Virtual Machines and Home Labs", summary: "Hypervisors, snapshots and a safe place to experiment." },
      ],
    },
    {
      id: "networking",
      title: "Networking Knowledge",
      blurb: "Every attack and every defence travels over a network.",
      lessons: [
        { slug: "osi-and-tcp-ip", title: "The OSI and TCP/IP Models", summary: "Layers, encapsulation and where each security control sits." },
        { slug: "ip-addressing-subnetting", title: "IP Addressing and Subnetting", summary: "Public and private ranges, CIDR, masks and gateways." },
        { slug: "dns-dhcp-nat", title: "DNS, DHCP and NAT", summary: "The services that make a network usable, and how they are abused." },
        { slug: "common-protocols-and-ports", title: "Common Protocols and Ports", summary: "HTTP, SSH, FTP, RDP and the ports you should recognise on sight." },
        { slug: "network-devices-and-topologies", title: "Network Devices and Topologies", summary: "Routers, switches, VLANs, DMZs and network shapes." },
        { slug: "network-tools", title: "Network Troubleshooting and Analysis Tools", summary: "ping, dig, netstat, tcpdump, Wireshark and nmap used responsibly." },
      ],
    },
    {
      id: "core-concepts",
      title: "Core Security Concepts",
      blurb: "The vocabulary and mental models behind every decision.",
      lessons: [
        { slug: "cia-triad", title: "The CIA Triad", summary: "Confidentiality, integrity and availability as a design lens." },
        { slug: "risk-and-threat-modeling", title: "Risk, Threats and Vulnerabilities", summary: "How to reason about what could go wrong and how much it matters." },
        { slug: "defense-in-depth-zero-trust", title: "Defense in Depth and Zero Trust", summary: "Layered controls, segmentation and never trusting by default." },
        { slug: "authn-authz-mfa", title: "Authentication, Authorization and MFA", summary: "Proving who you are, deciding what you may do, and adding factors." },
        { slug: "security-teams-and-frameworks", title: "Teams, Frameworks and Compliance", summary: "Red, blue and purple teams, NIST, ISO, CIS and what auditors do." },
        { slug: "detection-metrics", title: "True and False Positives", summary: "Reading detection results and the cost of each kind of error." },
      ],
    },
    {
      id: "cryptography",
      title: "Cryptography and PKI",
      blurb: "The maths that protects data in transit and at rest.",
      lessons: [
        { slug: "hashing-and-salting", title: "Hashing and Salting", summary: "One-way functions, password storage and integrity checks." },
        { slug: "symmetric-asymmetric-keys", title: "Symmetric and Asymmetric Encryption", summary: "Shared keys, key pairs, key exchange and signatures." },
        { slug: "tls-and-certificates", title: "TLS, Certificates and PKI", summary: "How a secure connection is set up and who vouches for it." },
        { slug: "secure-protocols", title: "Secure Protocol Choices", summary: "SSH, SFTP, IPsec, DNSSEC, S/MIME and what each protects." },
      ],
    },
    {
      id: "identity-infrastructure",
      title: "Identity and Directory Services",
      blurb: "How organisations manage who can do what.",
      lessons: [
        { slug: "kerberos-ldap-sso", title: "Kerberos, LDAP and Single Sign-On", summary: "Directory lookups, ticket-based login and federated identity." },
        { slug: "radius-and-network-access", title: "RADIUS and Network Access Control", summary: "Centralised access for Wi-Fi, VPN and switches." },
      ],
    },
    {
      id: "threats-and-attacks",
      title: "Threats and Attacks",
      blurb: "Learn how attackers think so you can spot and block them.",
      lessons: [
        { slug: "attack-lifecycle", title: "Kill Chain, ATT&CK and Diamond Model", summary: "Models for describing an intrusion from start to finish." },
        { slug: "social-engineering", title: "Social Engineering", summary: "Phishing, vishing, pretexting, tailgating and how to resist them." },
        { slug: "malware-types", title: "Malware and How It Works", summary: "Viruses, worms, ransomware, trojans and their usual behaviour." },
        { slug: "network-attacks", title: "Network Attacks", summary: "Spoofing, MITM, DoS, poisoning and wireless attacks, with defences." },
        { slug: "password-attacks", title: "Password Attacks", summary: "Brute force, spraying, credential stuffing and pass-the-hash." },
        { slug: "privilege-escalation", title: "Privilege Escalation and Persistence", summary: "How a foothold grows, and how to stop it growing." },
        { slug: "threat-actors", title: "Threat Actors and Zero Days", summary: "Who attacks, why, and what known and unknown threats mean." },
      ],
    },
    {
      id: "web-security",
      title: "Web Application Security",
      blurb: "The most exposed surface of most organisations.",
      lessons: [
        { slug: "owasp-top-10", title: "The OWASP Top 10", summary: "The most common web risks and the ideas that prevent them." },
        { slug: "injection-and-xss", title: "Injection and Cross-Site Scripting", summary: "SQL injection and XSS: why they happen and how to fix them." },
        { slug: "csrf-and-session-security", title: "CSRF, Sessions and Access Control", summary: "Cookies, tokens, broken access control and request forgery." },
      ],
    },
    {
      id: "defensive-controls",
      title: "Defensive Controls",
      blurb: "The tools and settings that actually reduce risk.",
      lessons: [
        { slug: "firewalls-and-segmentation", title: "Firewalls and Segmentation", summary: "Packet filters, next-gen firewalls, ACLs and perimeter design." },
        { slug: "ids-ips-honeypots", title: "IDS, IPS and Honeypots", summary: "Detecting and blocking attacks, and learning from decoys." },
        { slug: "endpoint-security", title: "Endpoint Security", summary: "Antivirus, EDR, DLP, host firewalls and sandboxing." },
        { slug: "os-hardening-and-patching", title: "Hardening and Patching", summary: "Reduce attack surface, apply updates, and use baselines." },
        { slug: "backups-and-resilience", title: "Backups and Resilience", summary: "Recovery objectives, the 3-2-1 rule and surviving ransomware." },
        { slug: "vulnerability-management", title: "Vulnerability Management", summary: "Find, rank, fix and verify weaknesses on a schedule." },
      ],
    },
    {
      id: "monitoring-and-ir",
      title: "Monitoring, Forensics and Incident Response",
      blurb: "Detect it, contain it, learn from it.",
      lessons: [
        { slug: "logs-and-siem", title: "Logs, SIEM and SOAR", summary: "Event logs, syslog, NetFlow and how a SOC makes sense of them." },
        { slug: "threat-intel-and-hunting", title: "Threat Intelligence and Hunting", summary: "OSINT, indicators, and proactive searching for intruders." },
        { slug: "incident-response", title: "Incident Response", summary: "Preparation through lessons learned, and who gets involved." },
        { slug: "digital-forensics", title: "Digital Forensics", summary: "Evidence handling, disk and memory images, and timelines." },
        { slug: "malware-analysis-basics", title: "Analysing Suspicious Files and URLs", summary: "Safe triage with sandboxes and reputation services." },
        { slug: "pentest-and-reverse-engineering", title: "Penetration Testing and Reverse Engineering", summary: "Rules of engagement, scope, reporting and what RE is used for." },
      ],
    },
    {
      id: "cloud-security",
      title: "Cloud Security",
      blurb: "The same principles, a different shared-responsibility model.",
      lessons: [
        { slug: "cloud-models-and-responsibility", title: "Cloud Models and Shared Responsibility", summary: "IaaS, PaaS, SaaS, public, private, hybrid and who secures what." },
        { slug: "cloud-providers-and-storage", title: "AWS, Azure, GCP and Cloud Storage", summary: "Identity, networking and storage settings that cause breaches." },
        { slug: "infrastructure-as-code-and-serverless", title: "Infrastructure as Code and Serverless", summary: "Secure automation, scanning templates and function permissions." },
      ],
    },
    {
      id: "scripting",
      title: "Scripting for Security",
      blurb: "Automate the repetitive parts of the job.",
      lessons: [
        { slug: "scripting-for-security", title: "Python, Bash and PowerShell", summary: "Small scripts for parsing logs, checking hashes and automating checks." },
      ],
    },
  ],
};

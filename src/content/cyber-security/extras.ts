import type { Reference } from "@/lib/types";

const book = (title: string, url: string): Reference => ({ type: "book", title, url });
const official = (title: string, url: string): Reference => ({ type: "official", title, url });
const article = (title: string, url: string): Reference => ({ type: "article", title, url });
const course = (title: string, url: string): Reference => ({ type: "course", title, url });

const secEng = book("Security Engineering, Ross Anderson (free online)", "https://www.cl.cam.ac.uk/~rja14/book.html");
const owaspCheats = official("OWASP Cheat Sheet Series", "https://cheatsheetseries.owasp.org/");
const attack = official("MITRE ATT&CK", "https://attack.mitre.org/");
const csf = official("NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework");

export const moduleExtras: Record<string, Reference[]> = {
  "it-foundations": [
    course("Professor Messer free CompTIA courses", "https://www.professormesser.com/"),
    course("TryHackMe", "https://tryhackme.com/"),
    course("OverTheWire wargames", "https://overthewire.org/wargames/"),
    course("picoCTF", "https://picoctf.org/"),
    secEng,
  ],
  "operating-systems": [
    book("The Linux Command Line (free)", "https://linuxcommand.org/tlcl.php"),
    course("Linux Journey", "https://linuxjourney.com/"),
    official("Microsoft Learn: Windows security", "https://learn.microsoft.com/en-us/windows/security/"),
    official("CIS Benchmarks", "https://www.cisecurity.org/cis-benchmarks"),
  ],
  networking: [
    book("High Performance Browser Networking (free)", "https://hpbn.co/"),
    article("Cloudflare Learning Center", "https://www.cloudflare.com/learning/"),
    official("Wireshark documentation", "https://www.wireshark.org/docs/"),
    book("Nmap Network Scanning (free online)", "https://nmap.org/book/"),
    course("Professor Messer Network+ course", "https://www.professormesser.com/network-plus/n10-009/n10-009-video/n10-009-training-course/"),
  ],
  "core-concepts": [
    secEng,
    csf,
    official("NIST SP 800-30: Guide for Conducting Risk Assessments", "https://csrc.nist.gov/pubs/sp/800/30/r1/final"),
    official("NIST SP 800-207: Zero Trust Architecture", "https://csrc.nist.gov/pubs/sp/800/207/final"),
    official("CIS Critical Security Controls", "https://www.cisecurity.org/controls"),
    official("ISO/IEC 27001 overview", "https://www.iso.org/standard/27001"),
  ],
  cryptography: [
    book("Serious Cryptography, Jean-Philippe Aumasson", "https://nostarch.com/seriouscrypto"),
    course("Cryptopals crypto challenges", "https://cryptopals.com/"),
    article("Let's Encrypt: How It Works", "https://letsencrypt.org/how-it-works/"),
    official("OWASP Cryptographic Storage Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html"),
    official("OWASP Password Storage Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"),
  ],
  "identity-infrastructure": [
    official("NIST SP 800-63B: Authentication guidelines", "https://pages.nist.gov/800-63-3/sp800-63b.html"),
    official("Microsoft Learn: Active Directory Domain Services overview", "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview"),
    official("OWASP Authentication Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"),
  ],
  "threats-and-attacks": [
    attack,
    official("CISA: Known Exploited Vulnerabilities Catalog", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"),
    official("CISA: Avoiding social engineering and phishing attacks", "https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks"),
    article("Lockheed Martin Cyber Kill Chain", "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html"),
    book("Practical Malware Analysis, Sikorski & Honig", "https://nostarch.com/malware"),
  ],
  "web-security": [
    official("OWASP Top 10", "https://owasp.org/www-project-top-ten/"),
    course("PortSwigger Web Security Academy (free)", "https://portswigger.net/web-security"),
    owaspCheats,
    official("MDN: Web security", "https://developer.mozilla.org/en-US/docs/Web/Security"),
    official("OWASP Web Security Testing Guide", "https://owasp.org/www-project-web-security-testing-guide/"),
  ],
  "defensive-controls": [
    official("CIS Critical Security Controls", "https://www.cisecurity.org/controls"),
    official("CIS Benchmarks", "https://www.cisecurity.org/cis-benchmarks"),
    official("CVSS specification (FIRST)", "https://www.first.org/cvss/"),
    official("CISA: Stop Ransomware", "https://www.cisa.gov/stopransomware"),
    owaspCheats,
  ],
  "monitoring-and-ir": [
    official("NIST SP 800-61: Computer Security Incident Handling Guide", "https://csrc.nist.gov/pubs/sp/800/61/r2/final"),
    official("NIST SP 800-86: Guide to Integrating Forensic Techniques", "https://csrc.nist.gov/pubs/sp/800/86/final"),
    attack,
    article("Sigma detection rules", "https://github.com/SigmaHQ/sigma"),
    official("Volatility Foundation", "https://www.volatilityfoundation.org/"),
    course("TryHackMe SOC Level 1 path", "https://tryhackme.com/paths"),
  ],
  "cloud-security": [
    official("AWS Shared Responsibility Model", "https://aws.amazon.com/compliance/shared-responsibility-model/"),
    official("Cloud Security Alliance guidance", "https://cloudsecurityalliance.org/research/guidance"),
    official("CIS Benchmarks (cloud providers)", "https://www.cisecurity.org/cis-benchmarks"),
    official("Microsoft Cloud Security Benchmark", "https://learn.microsoft.com/en-us/security/benchmark/azure/overview"),
    official("OWASP Serverless Top 10", "https://owasp.org/www-project-serverless-top-10/"),
  ],
  scripting: [
    book("Automate the Boring Stuff with Python (free)", "https://automatetheboringstuff.com/"),
    official("Python documentation", "https://docs.python.org/3/"),
    official("Microsoft Learn: PowerShell", "https://learn.microsoft.com/en-us/powershell/"),
    official("GNU Bash manual", "https://www.gnu.org/software/bash/manual/"),
  ],
};

export const lessonExtras: Record<string, Reference[]> = {
  "attack-lifecycle": [attack],
  "owasp-top-10": [official("OWASP Top 10", "https://owasp.org/www-project-top-ten/")],
  "incident-response": [official("NIST SP 800-61 Rev. 2", "https://csrc.nist.gov/pubs/sp/800/61/r2/final")],
};

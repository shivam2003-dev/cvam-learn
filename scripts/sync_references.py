#!/usr/bin/env python3
"""Pull reference links for each lesson from roadmap.sh into src/content/<course>/references.json.

Only titles, types and URLs are stored. Run again to refresh: python3 scripts/sync_references.py
"""
import json
import pathlib
import time
import urllib.request

API = "https://roadmap.sh/api/v1-official-roadmap"
ROOT = pathlib.Path(__file__).resolve().parent.parent

LESSONS = {
    "inference-engineering": {
        "inference-vs-training": ["Inference vs. Training", "Introduction"],
        "open-vs-closed-models": ["Open vs Closed Models"],
        "shared-vs-dedicated-inference": ["Shared vs. Dedicated Inf."],
        "the-inference-stack": ["The Inference Stack", "Introduction"],
        "ttft-tps-itl": ["Time to First Token", "Tokens Per Second", "Inter-Token Latency"],
        "latency-vs-throughput": ["Latency vs. Throughput"],
        "percentiles-and-end-to-end": ["Latency Percentiles", "End-to-End Metrics", "Real-Time Factor"],
        "online-offline-async": ["Online vs. Offline Inf.", "Asynchronous Inference"],
        "ai-native-consumer-b2b": ["AI-Native Applications", "Consumer vs. B2B"],
        "reasoning-models": ["Reasoning Models"],
        "model-selection-evaluation": ["Model Selection", "Model Evaluation"],
        "fine-tuning-distillation": ["Fine-Tuning", "Distillation"],
        "encoder-decoder": ["Neural Networks", "Encoder-Decoder Arch."],
        "transformer-blocks": ["Transformer Blocks", "Large Language Models"],
        "attention-mechanism": ["Attention Mechanism"],
        "kv-cache": ["KV Cache"],
        "mixture-of-experts": ["Mixture of Experts (MoE)"],
        "diffusion-models": ["Diffusion Models", "Image & Video Models"],
        "image-generation-architectures": ["Image Generation Arch."],
        "few-step-image-generation": ["Few-Step Image Generation"],
        "video-generation-models": ["Video Generation Models"],
        "ops-byte-ratio": ["Ops:Byte Ratio"],
        "arithmetic-intensity": ["Arithmetic Intensity"],
        "roofline-model": ["Roofline Model", "Bottleneck Analysis"],
        "llm-bottlenecks": ["LLM Bottlenecks", "Prefill & Decode Phases"],
        "image-video-bottlenecks": ["Image & Video Bottlenecks"],
        "flashattention": ["FlashAttention", "Attention Optimization"],
        "pagedattention": ["PagedAttention"],
        "attention-variants": ["Attention Variants"],
        "gpu-compute-memory": ["Compute", "Memory", "GPU Architecture"],
        "instances-interconnects": ["Instances & Interconnects"],
        "sizing-procurement": ["Sizing & Procurement"],
        "nvidia-hopper-blackwell": ["NVIDIA", "Hopper", "Blackwell", "GPU Models"],
        "grace-vera": ["Grace & Vera"],
        "other-accelerators": ["Other Accelerators"],
        "desktop-inference": ["Desktop Inference", "Local & Edge Inference"],
        "mobile-inference": ["Mobile Inference"],
        "kernel-selection-fusion": ["Kernel Selection & Fusion", "CUDA"],
        "writing-custom-kernels": ["Writing Custom Kernels"],
        "pytorch-for-inference": ["PyTorch", "Frameworks & Libraries"],
        "transformers-diffusers": ["Transformers & Diffusers"],
        "safetensors": ["safetensors", "Model Formats & Runtimes"],
        "tensorrt-onnx-runtime": ["TensorRT", "ONNX Runtime"],
        "continuous-batching": ["Continuous Batching"],
        "vllm": ["vLLM", "Inference Engines"],
        "sglang": ["SGLang"],
        "tensorrt-llm": ["TensorRT-LLM"],
        "nvidia-dynamo": ["NVIDIA Dynamo"],
        "performance-benchmarking": ["Performance Benchmarking", "AIPerf", "Locust", "SGLang Genai-bench", "Benchmarking & Profiling"],
        "profiling-performance": ["Profiling Performance"],
        "post-training-quantization": ["Post-Training Quantization", "Quantization"],
        "quantization-aware-training": ["Quantization-Aware Training"],
        "measuring-quality-impact": ["Measuring Quality Impact"],
        "modelopt": ["ModelOpt"],
        "draft-target-decoding": ["Draft-Target Decoding", "Speculative Decoding"],
        "eagle-ngram": ["EAGLE", "N-gram"],
        "structured-outputs": ["Structured Outputs", "Constrained Decoding"],
        "caching-approaches": ["Caching Approaches", "Caching"],
        "kv-cache-storage": ["KV Cache Storage"],
        "cache-aware-routing": ["Cache-Aware Routing"],
        "long-context-handling": ["Long Context Handling"],
        "tensor-parallelism": ["Tensor Parallelism", "Model Parallelism"],
        "pipeline-parallelism": ["Pipeline Parallelism"],
        "expert-parallelism": ["Expert Parallelism"],
        "multi-node-inference": ["Multi-Node Inference"],
        "prefill-decode-disaggregation": ["Disaggregation", "Prefill & Decode Phases"],
        "vision-language-models": ["Vision Language Models"],
        "video-processing-vlms": ["Video Processing for VLMs"],
        "omni-modal-models": ["Omni-Modal Models"],
        "embedding-models": ["Embedding Models", "BERT-style models", "LLM-based models"],
        "embedding-model-inference": ["Embedding Model Inference"],
        "voice-activity-detection": ["Voice Activity Detection", "Speech"],
        "speech-recognition": ["Auto. Speech Recognition"],
        "text-to-speech": ["Text-to-Speech (TTS)"],
        "streaming-tts": ["Streaming TTS"],
        "speech-to-speech": ["Speech-to-Speech Models"],
        "image-generation-inference": ["Image Generation Inference", "Image & Video Generation"],
        "video-generation-inference": ["Video Generation Inference"],
        "dependency-management": ["Dependency Management", "Containerization"],
        "nims": ["NIMs"],
        "cold-starts": ["Cold Starts", "Autoscaling"],
        "request-queueing": ["Request Queueing"],
        "scale-to-zero": ["Scale to Zero"],
        "routing-load-balancing": ["Routing & Load Balancing"],
        "lora-aware-routing": ["LoRA-Aware Routing"],
        "independent-component-scaling": ["Indep. Component Scaling"],
        "gpu-procurement": ["GPU Procurement", "Multi-Cloud"],
        "capacity-management": ["Capacity Management"],
        "geo-aware-load-balancing": ["Geo-Aware Load Balancing"],
        "zero-downtime-deployment": ["Zero-Downtime Deplo.", "Testing & Deployment"],
        "security-compliance": ["Security and Compliance"],
        "cost-estimation": ["Cost Estimation"],
        "observability": ["Observability"],
    },
    "cyber-security": {
        "what-is-cyber-security": ["Cyber Security", "Understand CIA Triad"],
        "hardware-and-connections": ["Fundamental IT Skills", "Computer Hardware Components", "Connection Types and their function", "OS-Independent Troubleshooting", "NFC", "WiFi", "Bluetooth", "Infrared", "Understand Basics of Popular Suites", "iCloud", "Google Suite", "MS Office Suite"],
        "practice-platforms-and-certs": ["HackTheBox", "TryHackMe", "VulnHub", "picoCTF", "pwn.college", "CompTIA A+", "CompTIA Linux+", "CompTIA Network+", "CCNA", "CompTIA Security+", "CEH", "CISA", "CISM", "GSEC", "GPEN", "GWAPT", "GIAC", "OSCP", "CREST", "CISSP"],
        "linux-for-security": ["Linux", "Common Commands", "Navigating using GUI and CLI", "Performing CRUD on Files", "Installing Software and Applications", "Installation and Configuration", "Troubleshooting", "Kali Linux", "ParrotOS"],
        "windows-for-security": ["Windows", "Different Versions and Differences", "Group Policy"],
        "macos-basics": ["MacOS"],
        "permissions-and-access": ["Understand Permissions", "Local Auth", "ACLs", "ACL", "MAC-based", "Authentication vs Authorization"],
        "virtualization-and-labs": ["VMWare", "VirtualBox", "esxi", "proxmox", "Hypervisor", "GuestOS", "HostOS", "VM", "Understand Concept of Isolation", "Sandboxing"],
        "osi-and-tcp-ip": ["Understand the OSI Model", "Basics of Computer Networking", "Networking Knowledge"],
        "ip-addressing-subnetting": ["Basics of Subnetting", "Public vs Private IP Addresses", "CIDR", "subnet mask", "default gateway", "localhost", "loopback", "IP"],
        "dns-dhcp-nat": ["DNS", "DHCP", "NAT", "NTP", "IPAM", "DNS Poisoning", "Sinkholes", "DNSSEC"],
        "common-protocols-and-ports": ["Common Protocols and their Uses", "Common Ports and their Uses", "HTTP / HTTPS", "SSH", "RDP", "FTP", "SFTP", "FTP vs SFTP", "Basics of NAS and SAN"],
        "network-devices-and-topologies": ["Router", "Switch", "VPN", "VLAN", "DMZ", "LAN", "WAN", "MAN", "WLAN", "Star", "Ring", "Mesh", "Bus", "Perimiter vs DMZ vs Segmentation"],
        "network-tools": ["ping", "dig", "nslookup", "ipconfig", "netstat", "arp", "route", "tracert", "tcpdump", "nmap", "wireshark", "Packet Sniffers", "Port Scanners", "Protocol Analyzers", "hping", "curl", "iptables"],
        "cia-triad": ["Understand CIA Triad"],
        "risk-and-threat-modeling": ["Understand the Definition of Risk", "Known vs Unknown", "Stakeholders"],
        "defense-in-depth-zero-trust": ["Understand Concept of Defense in Depth", "Core Concepts of Zero Trust"],
        "authn-authz-mfa": ["Authentication vs Authorization", "MFA & 2FA", "Local Auth"],
        "security-teams-and-frameworks": ["Blue / Red / Purple Teams", "Roles of Compliance and Auditors", "NIST", "ISO", "CIS", "RMF", "CSF", "Compliance", "Management", "HR", "Legal"],
        "detection-metrics": ["False Negative / False Positive", "True Negative / True Positive"],
        "hashing-and-salting": ["Hashing", "Salting", "Obfuscation"],
        "symmetric-asymmetric-keys": ["Private vs Public Keys", "Key Exchange", "Understand Handshakes"],
        "tls-and-certificates": ["SSL and TLS Basics", "SSL / TLS", "SSL vs TLS", "Certificates", "PKI"],
        "secure-protocols": ["IPSEC", "LDAPS", "SRTP", "S/MIME", "SFTP", "DNSSEC"],
        "kerberos-ldap-sso": ["Kerberos", "LDAP", "SSO"],
        "radius-and-network-access": ["RADIUS", "NAC-based", "EAP vs PEAP"],
        "attack-lifecycle": ["Cyber Kill Chain", "Kill Chain", "Diamond Model", "ATT&CK", "Reconnaissance"],
        "social-engineering": ["Social Engineering", "Phishing", "Whaling", "Smishing", "Whishing", "Spam vs Spim", "Shoulder Surfing", "Tailgating", "Dumpster Diving", "Impersonation", "Watering Hole Attack", "Typo Squatting", "Drive by Attack"],
        "malware-types": ["Learn how Malware works and Types", "Antivirus", "Antimalware"],
        "network-attacks": ["DoS vs DDoS", "MITM", "Spoofing", "Evil Twin", "VLAN Hopping", "Deauth Attack", "Rogue Access Point", "Replay Attack", "WPS", "WPA vs WPA2 vs WPA3 vs WEP"],
        "password-attacks": ["Brute Force vs Password Spray", "Pass the Hash"],
        "privilege-escalation": ["Privilege Escalation", "LOLBAS", "GTFOBINS", "WADCOMS"],
        "threat-actors": ["APT", "Zero day", "Zero Day"],
        "owasp-top-10": ["Web Based Attacks and OWASP10", "Directory Traversal"],
        "injection-and-xss": ["SQL Injection", "XSS"],
        "csrf-and-session-security": ["CSRF"],
        "firewalls-and-segmentation": ["Firewall & Nextgen Firewall", "Host Based Firewall", "Port Blocking", "Jump Server"],
        "ids-ips-honeypots": ["Basics of IDS and IPS", "NIDS", "NIPS", "HIPS", "Honeypots"],
        "endpoint-security": ["Endpoint Security", "EDR", "DLP", "Antivirus", "Antimalware"],
        "os-hardening-and-patching": ["Operating System Hardening", "Patching", "Buffer Overflow", "Memory Leak"],
        "backups-and-resilience": ["Understand Backups and Resiliency"],
        "vulnerability-management": ["Basics of Vulnerability Management"],
        "logs-and-siem": ["SIEM", "SOAR", "Event Logs", "syslogs", "netflow", "Packet Captures", "Firewall Logs"],
        "threat-intel-and-hunting": ["Basics of Threat Intel, OSINT", "Basics and Concepts of Threat Hunting", "WHOIS"],
        "incident-response": ["Understand Concept of Runbooks", "Preparation", "Identification", "Containment", "Eradication", "Recovery", "Lessons Learned"],
        "digital-forensics": ["Understand Basics of Forensics", "autopsy", "FTK Imager", "memdump", "winhex", "dd", "cat", "head", "tail", "grep"],
        "malware-analysis-basics": ["VirusTotal", "any.run", "urlscan", "Joe Sandbox", "urlvoid"],
        "pentest-and-reverse-engineering": ["Penetration Testing Rules of Engagement", "Basics of Reverse Engineering", "Understand Common Hacking Tools", "Understand Common Exploit Frameworks"],
        "cloud-models-and-responsibility": ["Understand the Concept of Security in the Cloud", "SaaS", "PaaS", "IaaS", "Understand the differences between cloud and on-premises", "Private", "Public", "Hybrid"],
        "cloud-providers-and-storage": ["AWS", "Azure", "GCP", "S3", "Dropbox", "Box", "OneDrive", "Google Drive", "Understand the basics and general flow of deploying in the cloud"],
        "infrastructure-as-code-and-serverless": ["Understand the concept of Infrastructure as Code", "Understand the Concept of Serverless"],
        "scripting-for-security": ["Python", "Go", "JavaScript", "C++", "Bash", "Power Shell"],
    },
    "mlops": {
        "what-is-mlops": ["What is MLOps?"],
        "mlops-principles": ["MLOps Principles"],
        "mlops-components": ["MLOps Components", "Version Control", "Orchestration", "Experiment Tracking", "Data Lineage", "Model Training & Serving", "Monitoring & Observability"],
        "python-for-mlops": ["Python", "Programming Basics"],
        "bash-for-mlops": ["Bash"],
        "sql-for-mlops": ["SQL"],
        "go-for-mlops": ["Go"],
        "git-basics": ["Git", "Version Control Systems"],
        "github-collaboration": ["GitHub"],
        "dvc": ["DVC"],
        "cicd-for-ml": ["CI/CD"],
        "github-actions": ["GitHub Actions"],
        "gitlab-jenkins": ["GitLab", "Jenkins"],
        "cml": ["CML"],
        "maths-statistics": ["Maths & Statistics"],
        "machine-learning-basics": ["Machine Learning", "ML Fundamentals"],
        "deep-learning-basics": ["Deep Learning"],
        "model-evaluation": ["Model Evaluation"],
        "ml-frameworks": ["Scikit-learn", "TensorFlow", "PyTorch"],
        "mlflow": ["MLFlow"],
        "aws-azure-gcp": ["AWS / Azure / GCP", "Cloud Computing"],
        "cloud-native-ml-services": ["Cloud-native ML Services"],
        "docker-for-ml": ["Docker", "Containerization"],
        "kubernetes-for-ml": ["Kubernetes"],
        "data-pipelines": ["Data Pipelines", "Data Engineering Basics"],
        "data-lakes-warehouses": ["Data Lakes & Warehouses"],
        "data-ingestion-architectures": ["Data Ingestion Arch."],
        "spark": ["Spark"],
        "kafka-flink": ["Kafka", "Flink"],
        "terraform": ["Terraform", "Infrastructure as Code"],
        "ansible": ["Ansible"],
        "airflow": ["Airflow"],
        "kubeflow": ["KubeFlow"],
        "model-monitoring": ["Monitoring & Observability"],
        "prometheus-grafana": ["Prometheus", "Grafana"],
        "tflite-pytorch-mobile": ["PyTorch Mobile", "TFLite", "Edge AI"],
        "jetson": ["Jetson"],
        "lime": ["LIME", "Explainable AI"],
        "shap": ["SHAP"],
    },
}


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "cvam-learn-reference-sync"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def normalize(label):
    return label.strip().casefold()


import sys
only = sys.argv[1:]
for course, lessons in LESSONS.items():
    if only and course not in only:
        continue
    nodes = fetch(f"{API}/{course}")["nodes"]
    ids = {}
    for node in nodes:
        if node.get("type") in ("topic", "subtopic"):
            label = node.get("data", {}).get("label") or ""
            ids.setdefault(normalize(label), []).append(node["id"])

    topics = {}
    for lesson, labels in lessons.items():
        seen, found = set(), []
        for label in labels:
            matches = ids.get(normalize(label), [])
            if not matches:
                print(f"UNMATCHED {course}: {label}")
            for node_id in matches:
                if node_id not in topics:
                    time.sleep(0.15)
                    try:
                        topics[node_id] = fetch(f"{API}-topic/{course}/{node_id}").get("resources") or []
                    except Exception as error:
                        print(f"FAILED {course}: {label}: {error}")
                        topics[node_id] = []
                for resource in topics[node_id]:
                    url = resource.get("url")
                    if url and url not in seen:
                        seen.add(url)
                        found.append({"type": resource.get("type", "article"), "title": resource.get("title", url).strip(), "url": url})
        lessons[lesson] = found

    target = ROOT / "src" / "content" / course / "references.json"
    target.write_text(json.dumps(lessons, indent=2, ensure_ascii=False) + "\n")
    empty = [lesson for lesson, refs in lessons.items() if not refs]
    print(f"{course}: {len(lessons)} lessons, {sum(map(len, lessons.values()))} links, no links: {empty}")

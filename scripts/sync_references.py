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


for course, lessons in LESSONS.items():
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

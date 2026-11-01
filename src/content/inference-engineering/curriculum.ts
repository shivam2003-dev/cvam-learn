import type { Course } from "@/lib/types";

export const inferenceEngineering: Course = {
  slug: "inference-engineering",
  title: "Inference Engineering",
  tagline:
    "Serve AI models fast, reliably and cheaply, from your first GPU to a multi-cloud fleet.",
  description:
    "Learn how production AI inference works end to end: the metrics that matter, how models and GPUs behave, the engines that serve them, and the optimizations and operations that keep latency and cost under control.",
  level: "Intermediate",
  skills: ["LLM serving", "GPU capacity", "Latency tuning", "vLLM & SGLang", "Quantization", "Autoscaling"],
  modules: [
    {
      id: "introduction",
      title: "Introduction",
      blurb: "What inference engineering is and where it sits.",
      lessons: [
        { slug: "inference-vs-training", title: "Inference vs. Training", summary: "Why serving a model is a different discipline from building one." },
        { slug: "open-vs-closed-models", title: "Open vs. Closed Models", summary: "Open weights, closed APIs, and how to choose between them." },
        { slug: "shared-vs-dedicated-inference", title: "Shared vs. Dedicated Inference", summary: "Pay per token or pay per GPU hour, and when each one wins." },
        { slug: "the-inference-stack", title: "The Inference Stack", summary: "Every layer a request crosses, from gateway to GPU." },
      ],
    },
    {
      id: "metrics",
      title: "Performance Metrics",
      blurb: "The numbers every inference decision is judged by.",
      lessons: [
        { slug: "ttft-tps-itl", title: "TTFT, TPS and Inter-Token Latency", summary: "The three numbers that describe how a streamed response feels." },
        { slug: "latency-vs-throughput", title: "Latency vs. Throughput", summary: "Why you trade one for the other, and how to pick an operating point." },
        { slug: "percentiles-and-end-to-end", title: "Percentiles, End-to-End and Real-Time Factor", summary: "Measure the tail, measure from the client, and measure audio properly." },
      ],
    },
    {
      id: "workloads",
      title: "Workloads & Model Choice",
      blurb: "Match the serving setup to what the product actually needs.",
      lessons: [
        { slug: "online-offline-async", title: "Online, Offline and Async Inference", summary: "Three delivery modes with very different cost profiles." },
        { slug: "ai-native-consumer-b2b", title: "AI-Native Apps: Consumer vs. B2B", summary: "How traffic shape and expectations differ by audience." },
        { slug: "reasoning-models", title: "Reasoning Models", summary: "Why long hidden thinking changes capacity planning." },
        { slug: "model-selection-evaluation", title: "Model Selection & Evaluation", summary: "Choose on your own evals, not on leaderboards." },
        { slug: "fine-tuning-distillation", title: "Fine-Tuning & Distillation", summary: "Make a smaller model do a specific job well." },
      ],
    },
    {
      id: "llm-architecture",
      title: "Neural Networks & LLMs",
      blurb: "Just enough architecture to reason about performance.",
      lessons: [
        { slug: "encoder-decoder", title: "Neural Networks & Encoder-Decoder Models", summary: "The building blocks behind modern model families." },
        { slug: "transformer-blocks", title: "Transformer Blocks", summary: "What runs inside each layer of an LLM." },
        { slug: "attention-mechanism", title: "The Attention Mechanism", summary: "How tokens read from each other, and what it costs." },
        { slug: "kv-cache", title: "The KV Cache", summary: "The memory structure that makes LLM decoding affordable." },
        { slug: "mixture-of-experts", title: "Mixture of Experts", summary: "Large models that only activate part of themselves." },
      ],
    },
    {
      id: "image-video-models",
      title: "Image & Video Models",
      blurb: "How generative media models work.",
      lessons: [
        { slug: "diffusion-models", title: "Diffusion Models", summary: "Generating by removing noise, step by step." },
        { slug: "image-generation-architectures", title: "Image Generation Architectures", summary: "The components of an image pipeline." },
        { slug: "few-step-image-generation", title: "Few-Step Image Generation", summary: "Reducing step counts without ruining quality." },
        { slug: "video-generation-models", title: "Video Generation Models", summary: "Adding the time dimension, and its cost." },
      ],
    },
    {
      id: "bottlenecks",
      title: "Bottleneck Analysis",
      blurb: "Find what is actually limiting performance.",
      lessons: [
        { slug: "ops-byte-ratio", title: "Ops:Byte Ratio", summary: "Compare hardware by compute against memory bandwidth." },
        { slug: "arithmetic-intensity", title: "Arithmetic Intensity", summary: "Characterize a workload the same way." },
        { slug: "roofline-model", title: "The Roofline Model", summary: "Predict the speed limit from both numbers." },
        { slug: "llm-bottlenecks", title: "LLM Bottlenecks", summary: "Why prefill and decode hit different limits." },
        { slug: "image-video-bottlenecks", title: "Image & Video Bottlenecks", summary: "Where generative media spends its time." },
      ],
    },
    {
      id: "attention-optimization",
      title: "Attention Optimization",
      blurb: "Make the hottest operation cheaper.",
      lessons: [
        { slug: "flashattention", title: "FlashAttention", summary: "Fast fused attention kernels." },
        { slug: "pagedattention", title: "PagedAttention", summary: "Managing the KV cache in blocks." },
        { slug: "attention-variants", title: "Attention Variants", summary: "Other approaches and their trade-offs." },
      ],
    },
    {
      id: "gpu-architecture",
      title: "GPU Architecture",
      blurb: "What the hardware is really doing.",
      lessons: [
        { slug: "gpu-compute-memory", title: "Compute & Memory", summary: "Cores, HBM and bandwidth." },
        { slug: "instances-interconnects", title: "Instances & Interconnects", summary: "NVLink, PCIe and multi-GPU machines." },
        { slug: "sizing-procurement", title: "Sizing & Procurement", summary: "Choosing and buying the right capacity." },
      ],
    },
    {
      id: "gpu-models",
      title: "GPU Models & Accelerators",
      blurb: "The hardware landscape.",
      lessons: [
        { slug: "nvidia-hopper-blackwell", title: "NVIDIA: Hopper & Blackwell", summary: "Comparing the current generations." },
        { slug: "grace-vera", title: "Grace & Vera", summary: "Where the CPU fits in." },
        { slug: "other-accelerators", title: "Other Accelerators", summary: "Alternatives to NVIDIA and when they fit." },
      ],
    },
    {
      id: "local-edge",
      title: "Local & Edge Inference",
      blurb: "Serving outside the data center.",
      lessons: [
        { slug: "desktop-inference", title: "Desktop Inference", summary: "Running models on workstations." },
        { slug: "mobile-inference", title: "Mobile Inference", summary: "Tight memory, power and thermal limits." },
      ],
    },
    {
      id: "cuda",
      title: "CUDA",
      blurb: "The layer below your framework.",
      lessons: [
        { slug: "kernel-selection-fusion", title: "Kernel Selection & Fusion", summary: "How work gets mapped onto fast kernels." },
        { slug: "writing-custom-kernels", title: "Writing Custom Kernels", summary: "When to drop down, and how." },
      ],
    },
    {
      id: "frameworks",
      title: "Frameworks & Formats",
      blurb: "From PyTorch to optimized runtimes.",
      lessons: [
        { slug: "pytorch-for-inference", title: "PyTorch for Inference", summary: "Compile, precision and memory settings." },
        { slug: "transformers-diffusers", title: "Transformers & Diffusers", summary: "Reference implementations and their limits." },
        { slug: "safetensors", title: "safetensors", summary: "Safe, fast model loading." },
        { slug: "tensorrt-onnx-runtime", title: "TensorRT & ONNX Runtime", summary: "Compiled runtimes for fixed graphs." },
      ],
    },
    {
      id: "inference-engines",
      title: "Inference Engines",
      blurb: "The software that serves LLMs.",
      lessons: [
        { slug: "continuous-batching", title: "Continuous Batching", summary: "The core scheduling trick of LLM serving." },
        { slug: "vllm", title: "vLLM", summary: "The widely used open engine." },
        { slug: "sglang", title: "SGLang", summary: "Prefix-aware serving and structured workloads." },
        { slug: "tensorrt-llm", title: "TensorRT-LLM", summary: "NVIDIA's optimized engine." },
        { slug: "nvidia-dynamo", title: "NVIDIA Dynamo", summary: "Distributed serving across a cluster." },
      ],
    },
    {
      id: "benchmarking",
      title: "Benchmarking & Profiling",
      blurb: "Measure honestly, then find the cause.",
      lessons: [
        { slug: "performance-benchmarking", title: "Performance Benchmarking", summary: "AIPerf, Locust and genai-bench." },
        { slug: "profiling-performance", title: "Profiling Performance", summary: "Locating time inside the stack." },
      ],
    },
    {
      id: "quantization",
      title: "Quantization",
      blurb: "Trade precision for speed and memory.",
      lessons: [
        { slug: "post-training-quantization", title: "Post-Training Quantization", summary: "Shrinking an existing model." },
        { slug: "quantization-aware-training", title: "Quantization-Aware Training", summary: "Training with quantization in mind." },
        { slug: "measuring-quality-impact", title: "Measuring Quality Impact", summary: "Prove the model is still good." },
        { slug: "modelopt", title: "ModelOpt", summary: "Tooling for optimized models." },
      ],
    },
    {
      id: "decoding",
      title: "Speculative & Constrained Decoding",
      blurb: "Generate faster, and generate valid output.",
      lessons: [
        { slug: "draft-target-decoding", title: "Draft-Target Decoding", summary: "Use a small model to guess ahead." },
        { slug: "eagle-ngram", title: "EAGLE & N-gram Speculation", summary: "Cheaper ways to propose tokens." },
        { slug: "structured-outputs", title: "Structured Outputs & Constrained Decoding", summary: "Guarantee output follows a schema." },
      ],
    },
    {
      id: "caching",
      title: "Caching",
      blurb: "Never compute the same thing twice.",
      lessons: [
        { slug: "caching-approaches", title: "Caching Approaches", summary: "Prompt, prefix and response caches." },
        { slug: "kv-cache-storage", title: "KV Cache Storage", summary: "Tiering across GPU, CPU and disk." },
        { slug: "cache-aware-routing", title: "Cache-Aware Routing", summary: "Send requests where their prefix lives." },
        { slug: "long-context-handling", title: "Long Context Handling", summary: "Serving very long prompts safely." },
      ],
    },
    {
      id: "parallelism",
      title: "Model Parallelism",
      blurb: "When one GPU is not enough.",
      lessons: [
        { slug: "tensor-parallelism", title: "Tensor Parallelism", summary: "Split each layer across GPUs." },
        { slug: "pipeline-parallelism", title: "Pipeline Parallelism", summary: "Split layers across GPUs." },
        { slug: "expert-parallelism", title: "Expert Parallelism", summary: "Spread MoE experts across devices." },
        { slug: "multi-node-inference", title: "Multi-Node Inference", summary: "Crossing machine boundaries." },
      ],
    },
    {
      id: "disaggregation",
      title: "Disaggregation",
      blurb: "Run prefill and decode separately.",
      lessons: [
        { slug: "prefill-decode-disaggregation", title: "Prefill & Decode Disaggregation", summary: "Specialize GPUs for each phase." },
      ],
    },
    {
      id: "multimodal",
      title: "Vision & Embedding Models",
      blurb: "Serving beyond plain text.",
      lessons: [
        { slug: "vision-language-models", title: "Vision Language Models", summary: "Images as model input." },
        { slug: "video-processing-vlms", title: "Video Processing for VLMs", summary: "Sampling and encoding video." },
        { slug: "omni-modal-models", title: "Omni-Modal Models", summary: "One model, many input types." },
        { slug: "embedding-models", title: "Embedding Models", summary: "BERT-style and LLM-based embeddings." },
        { slug: "embedding-model-inference", title: "Embedding Model Inference", summary: "Batching for high-volume short jobs." },
      ],
    },
    {
      id: "speech",
      title: "Speech",
      blurb: "Real-time audio pipelines.",
      lessons: [
        { slug: "voice-activity-detection", title: "Voice Activity Detection", summary: "Find where speech begins and ends." },
        { slug: "speech-recognition", title: "Automatic Speech Recognition", summary: "Turning audio into text." },
        { slug: "text-to-speech", title: "Text-to-Speech", summary: "Turning text into audio." },
        { slug: "streaming-tts", title: "Streaming TTS", summary: "Starting playback before synthesis ends." },
        { slug: "speech-to-speech", title: "Speech-to-Speech Models", summary: "Voice in, voice out." },
      ],
    },
    {
      id: "media-inference",
      title: "Image & Video Generation Inference",
      blurb: "Serving generative media in production.",
      lessons: [
        { slug: "image-generation-inference", title: "Image Generation Inference", summary: "Pipelines, batching and queues." },
        { slug: "video-generation-inference", title: "Video Generation Inference", summary: "Long jobs on expensive hardware." },
      ],
    },
    {
      id: "containers",
      title: "Containerization",
      blurb: "Ship models reproducibly.",
      lessons: [
        { slug: "dependency-management", title: "Dependency Management", summary: "Drivers, CUDA and image size." },
        { slug: "nims", title: "NIMs", summary: "Prebuilt inference containers." },
      ],
    },
    {
      id: "autoscaling",
      title: "Autoscaling & Routing",
      blurb: "Follow demand without wasting GPUs.",
      lessons: [
        { slug: "cold-starts", title: "Cold Starts", summary: "Where the startup minutes go." },
        { slug: "request-queueing", title: "Request Queueing", summary: "Absorb bursts and shed load." },
        { slug: "scale-to-zero", title: "Scale to Zero", summary: "Saving money against waking slowly." },
        { slug: "routing-load-balancing", title: "Routing & Load Balancing", summary: "Why round robin falls short." },
        { slug: "lora-aware-routing", title: "LoRA-Aware Routing", summary: "Send traffic to loaded adapters." },
        { slug: "independent-component-scaling", title: "Independent Component Scaling", summary: "Scale each pipeline stage separately." },
      ],
    },
    {
      id: "multi-cloud",
      title: "Multi-Cloud",
      blurb: "Capacity across providers and regions.",
      lessons: [
        { slug: "gpu-procurement", title: "GPU Procurement", summary: "Reserved, on-demand and spot." },
        { slug: "capacity-management", title: "Capacity Management", summary: "Plan and buffer for growth." },
        { slug: "geo-aware-load-balancing", title: "Geo-Aware Load Balancing", summary: "Latency, failover and data residency." },
      ],
    },
    {
      id: "deployment",
      title: "Testing & Deployment",
      blurb: "Run it safely in production.",
      lessons: [
        { slug: "zero-downtime-deployment", title: "Zero-Downtime Deployment", summary: "Rolling out models without dropping streams." },
        { slug: "security-compliance", title: "Security & Compliance", summary: "Isolation, data handling and audits." },
        { slug: "cost-estimation", title: "Cost Estimation", summary: "Forecast cost per token and per customer." },
        { slug: "observability", title: "Observability", summary: "The signals to watch and alert on." },
      ],
    },
  ],
};

import type { Reference } from "@/lib/types";

const book = (title: string, url: string): Reference => ({ type: "book", title, url });
const official = (title: string, url: string): Reference => ({ type: "official", title, url });
const paper = (title: string, url: string): Reference => ({ type: "paper", title, url });
const article = (title: string, url: string): Reference => ({ type: "article", title, url });
const source = (title: string, url: string): Reference => ({ type: "opensource", title, url });

const inferenceBook = book("Inference Engineering, Baseten", "https://www.baseten.co/inference-engineering/");
const aiEngineering = book("AI Engineering, Chip Huyen", "https://www.oreilly.com/library/view/ai-engineering/9781098166298/");
const scaling = book("How to Scale Your Model (free)", "https://jax-ml.github.io/scaling-book/");
const sre = book("Site Reliability Engineering (free online)", "https://sre.google/sre-book/table-of-contents/");
const vllmPaper = paper("PagedAttention: efficient memory management for LLM serving", "https://arxiv.org/abs/2309.06180");
const cuda = official("NVIDIA CUDA documentation", "https://docs.nvidia.com/cuda/");

export const moduleExtras: Record<string, Reference[]> = {
  introduction: [inferenceBook, aiEngineering],
  metrics: [
    inferenceBook,
    paper("The Tail at Scale, Dean & Barroso", "https://research.google/pubs/the-tail-at-scale/"),
    book("SRE book: Service Level Objectives", "https://sre.google/sre-book/service-level-objectives/"),
  ],
  workloads: [
    aiEngineering,
    book("Designing Machine Learning Systems, Chip Huyen", "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/"),
  ],
  "llm-architecture": [
    book("Build a Large Language Model (From Scratch), Sebastian Raschka", "https://www.manning.com/books/build-a-large-language-model-from-scratch"),
    book("Deep Learning, Goodfellow, Bengio & Courville (free online)", "https://www.deeplearningbook.org/"),
    paper("Attention Is All You Need", "https://arxiv.org/abs/1706.03762"),
    article("The Illustrated Transformer, Jay Alammar", "https://jalammar.github.io/illustrated-transformer/"),
  ],
  "image-video-models": [
    book("Understanding Deep Learning, Simon Prince (free)", "https://udlbook.github.io/udlbook/"),
    paper("Denoising Diffusion Probabilistic Models", "https://arxiv.org/abs/2006.11239"),
  ],
  bottlenecks: [inferenceBook, scaling],
  "attention-optimization": [paper("FlashAttention", "https://arxiv.org/abs/2205.14135"), vllmPaper],
  "gpu-architecture": [scaling, cuda],
  "gpu-models": [official("NVIDIA data center platform", "https://www.nvidia.com/en-us/data-center/")],
  "local-edge": [
    source("llama.cpp", "https://github.com/ggml-org/llama.cpp"),
    official("Ollama", "https://ollama.com/"),
    official("Google AI Edge documentation", "https://ai.google.dev/edge"),
  ],
  cuda: [cuda, official("CUDA C++ Programming Guide", "https://docs.nvidia.com/cuda/cuda-c-programming-guide/")],
  frameworks: [
    official("PyTorch documentation", "https://docs.pytorch.org/docs/stable/index.html"),
    official("Hugging Face Transformers documentation", "https://huggingface.co/docs/transformers/index"),
    official("ONNX Runtime documentation", "https://onnxruntime.ai/docs/"),
    official("safetensors documentation", "https://huggingface.co/docs/safetensors/index"),
  ],
  "inference-engines": [
    official("vLLM documentation", "https://docs.vllm.ai/"),
    official("SGLang documentation", "https://docs.sglang.ai/"),
    vllmPaper,
    inferenceBook,
  ],
  benchmarking: [official("Locust documentation", "https://docs.locust.io/"), inferenceBook],
  quantization: [
    official("Quantization in Transformers", "https://huggingface.co/docs/transformers/main/en/quantization/overview"),
    paper("Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference", "https://arxiv.org/abs/1712.05877"),
  ],
  decoding: [
    paper("EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty", "https://arxiv.org/abs/2402.02082"),
    article("Assisted Generation: a new direction toward low-latency text generation", "https://huggingface.co/blog/assisted-generation"),
    source("Outlines: structured outputs", "https://github.com/dottxt-ai/outlines"),
  ],
  caching: [vllmPaper, official("LMCache documentation", "https://docs.lmcache.ai/")],
  parallelism: [scaling, paper("DeepSeek-V3 Technical Report", "https://arxiv.org/abs/2412.19437")],
  disaggregation: [paper("DistServe: disaggregating prefill and decoding", "https://arxiv.org/abs/2401.09670")],
  multimodal: [
    paper("An Image is Worth 16x16 Words (Vision Transformer)", "https://arxiv.org/abs/2010.11929"),
    official("Sentence Transformers documentation", "https://www.sbert.net/"),
  ],
  speech: [
    article("Introducing Whisper", "https://openai.com/index/whisper/"),
    source("Silero VAD", "https://github.com/snakers4/silero-vad"),
  ],
  "media-inference": [official("Hugging Face Diffusers documentation", "https://huggingface.co/docs/diffusers/index")],
  containers: [
    official("Docker documentation", "https://docs.docker.com/"),
    official("NVIDIA Container Toolkit", "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html"),
  ],
  autoscaling: [
    official("Kubernetes Horizontal Pod Autoscaling", "https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/"),
    official("KEDA documentation", "https://keda.sh/docs/"),
    sre,
  ],
  "multi-cloud": [sre, official("FinOps Framework", "https://www.finops.org/framework/")],
  deployment: [
    book("SRE Workbook: Canarying Releases", "https://sre.google/workbook/canarying-releases/"),
    official("OWASP Top 10 for LLM Applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/"),
    official("OpenTelemetry documentation", "https://opentelemetry.io/docs/"),
  ],
};

export const lessonExtras: Record<string, Reference[]> = {
  "mixture-of-experts": [paper("Mixtral of Experts", "https://arxiv.org/abs/2401.04088"), paper("DeepSeek-V3 Technical Report", "https://arxiv.org/abs/2412.19437")],
  "kv-cache": [vllmPaper],
};

import type { Lesson } from "@/lib/types";
import { lesson as aiNativeConsumerB2b } from "./ai-native-consumer-b2b";
import { lesson as arithmeticIntensity } from "./arithmetic-intensity";
import { lesson as attentionMechanism } from "./attention-mechanism";
import { lesson as attentionVariants } from "./attention-variants";
import { lesson as cacheAwareRouting } from "./cache-aware-routing";
import { lesson as cachingApproaches } from "./caching-approaches";
import { lesson as capacityManagement } from "./capacity-management";
import { lesson as coldStarts } from "./cold-starts";
import { lesson as continuousBatching } from "./continuous-batching";
import { lesson as costEstimation } from "./cost-estimation";
import { lesson as dependencyManagement } from "./dependency-management";
import { lesson as desktopInference } from "./desktop-inference";
import { lesson as diffusionModels } from "./diffusion-models";
import { lesson as draftTargetDecoding } from "./draft-target-decoding";
import { lesson as eagleNgram } from "./eagle-ngram";
import { lesson as embeddingModelInference } from "./embedding-model-inference";
import { lesson as embeddingModels } from "./embedding-models";
import { lesson as encoderDecoder } from "./encoder-decoder";
import { lesson as expertParallelism } from "./expert-parallelism";
import { lesson as fewStepImageGeneration } from "./few-step-image-generation";
import { lesson as fineTuningDistillation } from "./fine-tuning-distillation";
import { lesson as flashattention } from "./flashattention";
import { lesson as geoAwareLoadBalancing } from "./geo-aware-load-balancing";
import { lesson as gpuComputeMemory } from "./gpu-compute-memory";
import { lesson as gpuProcurement } from "./gpu-procurement";
import { lesson as graceVera } from "./grace-vera";
import { lesson as imageGenerationArchitectures } from "./image-generation-architectures";
import { lesson as imageGenerationInference } from "./image-generation-inference";
import { lesson as imageVideoBottlenecks } from "./image-video-bottlenecks";
import { lesson as independentComponentScaling } from "./independent-component-scaling";
import { lesson as inferenceVsTraining } from "./inference-vs-training";
import { lesson as instancesInterconnects } from "./instances-interconnects";
import { lesson as kernelSelectionFusion } from "./kernel-selection-fusion";
import { lesson as kvCache } from "./kv-cache";
import { lesson as kvCacheStorage } from "./kv-cache-storage";
import { lesson as latencyVsThroughput } from "./latency-vs-throughput";
import { lesson as llmBottlenecks } from "./llm-bottlenecks";
import { lesson as longContextHandling } from "./long-context-handling";
import { lesson as loraAwareRouting } from "./lora-aware-routing";
import { lesson as measuringQualityImpact } from "./measuring-quality-impact";
import { lesson as mixtureOfExperts } from "./mixture-of-experts";
import { lesson as mobileInference } from "./mobile-inference";
import { lesson as modelSelectionEvaluation } from "./model-selection-evaluation";
import { lesson as modelopt } from "./modelopt";
import { lesson as multiNodeInference } from "./multi-node-inference";
import { lesson as nims } from "./nims";
import { lesson as nvidiaDynamo } from "./nvidia-dynamo";
import { lesson as nvidiaHopperBlackwell } from "./nvidia-hopper-blackwell";
import { lesson as observability } from "./observability";
import { lesson as omniModalModels } from "./omni-modal-models";
import { lesson as onlineOfflineAsync } from "./online-offline-async";
import { lesson as openVsClosedModels } from "./open-vs-closed-models";
import { lesson as opsByteRatio } from "./ops-byte-ratio";
import { lesson as otherAccelerators } from "./other-accelerators";
import { lesson as pagedattention } from "./pagedattention";
import { lesson as percentilesAndEndToEnd } from "./percentiles-and-end-to-end";
import { lesson as performanceBenchmarking } from "./performance-benchmarking";
import { lesson as pipelineParallelism } from "./pipeline-parallelism";
import { lesson as postTrainingQuantization } from "./post-training-quantization";
import { lesson as prefillDecodeDisaggregation } from "./prefill-decode-disaggregation";
import { lesson as profilingPerformance } from "./profiling-performance";
import { lesson as pytorchForInference } from "./pytorch-for-inference";
import { lesson as quantizationAwareTraining } from "./quantization-aware-training";
import { lesson as reasoningModels } from "./reasoning-models";
import { lesson as requestQueueing } from "./request-queueing";
import { lesson as rooflineModel } from "./roofline-model";
import { lesson as routingLoadBalancing } from "./routing-load-balancing";
import { lesson as safetensors } from "./safetensors";
import { lesson as scaleToZero } from "./scale-to-zero";
import { lesson as securityCompliance } from "./security-compliance";
import { lesson as sglang } from "./sglang";
import { lesson as sharedVsDedicatedInference } from "./shared-vs-dedicated-inference";
import { lesson as sizingProcurement } from "./sizing-procurement";
import { lesson as speechRecognition } from "./speech-recognition";
import { lesson as speechToSpeech } from "./speech-to-speech";
import { lesson as streamingTts } from "./streaming-tts";
import { lesson as structuredOutputs } from "./structured-outputs";
import { lesson as tensorParallelism } from "./tensor-parallelism";
import { lesson as tensorrtLlm } from "./tensorrt-llm";
import { lesson as tensorrtOnnxRuntime } from "./tensorrt-onnx-runtime";
import { lesson as textToSpeech } from "./text-to-speech";
import { lesson as theInferenceStack } from "./the-inference-stack";
import { lesson as transformerBlocks } from "./transformer-blocks";
import { lesson as transformersDiffusers } from "./transformers-diffusers";
import { lesson as ttftTpsItl } from "./ttft-tps-itl";
import { lesson as videoGenerationInference } from "./video-generation-inference";
import { lesson as videoGenerationModels } from "./video-generation-models";
import { lesson as videoProcessingVlms } from "./video-processing-vlms";
import { lesson as visionLanguageModels } from "./vision-language-models";
import { lesson as vllm } from "./vllm";
import { lesson as voiceActivityDetection } from "./voice-activity-detection";
import { lesson as writingCustomKernels } from "./writing-custom-kernels";
import { lesson as zeroDowntimeDeployment } from "./zero-downtime-deployment";

export const lessons: Record<string, Lesson> = {
  "ai-native-consumer-b2b": aiNativeConsumerB2b,
  "arithmetic-intensity": arithmeticIntensity,
  "attention-mechanism": attentionMechanism,
  "attention-variants": attentionVariants,
  "cache-aware-routing": cacheAwareRouting,
  "caching-approaches": cachingApproaches,
  "capacity-management": capacityManagement,
  "cold-starts": coldStarts,
  "continuous-batching": continuousBatching,
  "cost-estimation": costEstimation,
  "dependency-management": dependencyManagement,
  "desktop-inference": desktopInference,
  "diffusion-models": diffusionModels,
  "draft-target-decoding": draftTargetDecoding,
  "eagle-ngram": eagleNgram,
  "embedding-model-inference": embeddingModelInference,
  "embedding-models": embeddingModels,
  "encoder-decoder": encoderDecoder,
  "expert-parallelism": expertParallelism,
  "few-step-image-generation": fewStepImageGeneration,
  "fine-tuning-distillation": fineTuningDistillation,
  "flashattention": flashattention,
  "geo-aware-load-balancing": geoAwareLoadBalancing,
  "gpu-compute-memory": gpuComputeMemory,
  "gpu-procurement": gpuProcurement,
  "grace-vera": graceVera,
  "image-generation-architectures": imageGenerationArchitectures,
  "image-generation-inference": imageGenerationInference,
  "image-video-bottlenecks": imageVideoBottlenecks,
  "independent-component-scaling": independentComponentScaling,
  "inference-vs-training": inferenceVsTraining,
  "instances-interconnects": instancesInterconnects,
  "kernel-selection-fusion": kernelSelectionFusion,
  "kv-cache": kvCache,
  "kv-cache-storage": kvCacheStorage,
  "latency-vs-throughput": latencyVsThroughput,
  "llm-bottlenecks": llmBottlenecks,
  "long-context-handling": longContextHandling,
  "lora-aware-routing": loraAwareRouting,
  "measuring-quality-impact": measuringQualityImpact,
  "mixture-of-experts": mixtureOfExperts,
  "mobile-inference": mobileInference,
  "model-selection-evaluation": modelSelectionEvaluation,
  "modelopt": modelopt,
  "multi-node-inference": multiNodeInference,
  "nims": nims,
  "nvidia-dynamo": nvidiaDynamo,
  "nvidia-hopper-blackwell": nvidiaHopperBlackwell,
  "observability": observability,
  "omni-modal-models": omniModalModels,
  "online-offline-async": onlineOfflineAsync,
  "open-vs-closed-models": openVsClosedModels,
  "ops-byte-ratio": opsByteRatio,
  "other-accelerators": otherAccelerators,
  "pagedattention": pagedattention,
  "percentiles-and-end-to-end": percentilesAndEndToEnd,
  "performance-benchmarking": performanceBenchmarking,
  "pipeline-parallelism": pipelineParallelism,
  "post-training-quantization": postTrainingQuantization,
  "prefill-decode-disaggregation": prefillDecodeDisaggregation,
  "profiling-performance": profilingPerformance,
  "pytorch-for-inference": pytorchForInference,
  "quantization-aware-training": quantizationAwareTraining,
  "reasoning-models": reasoningModels,
  "request-queueing": requestQueueing,
  "roofline-model": rooflineModel,
  "routing-load-balancing": routingLoadBalancing,
  "safetensors": safetensors,
  "scale-to-zero": scaleToZero,
  "security-compliance": securityCompliance,
  "sglang": sglang,
  "shared-vs-dedicated-inference": sharedVsDedicatedInference,
  "sizing-procurement": sizingProcurement,
  "speech-recognition": speechRecognition,
  "speech-to-speech": speechToSpeech,
  "streaming-tts": streamingTts,
  "structured-outputs": structuredOutputs,
  "tensor-parallelism": tensorParallelism,
  "tensorrt-llm": tensorrtLlm,
  "tensorrt-onnx-runtime": tensorrtOnnxRuntime,
  "text-to-speech": textToSpeech,
  "the-inference-stack": theInferenceStack,
  "transformer-blocks": transformerBlocks,
  "transformers-diffusers": transformersDiffusers,
  "ttft-tps-itl": ttftTpsItl,
  "video-generation-inference": videoGenerationInference,
  "video-generation-models": videoGenerationModels,
  "video-processing-vlms": videoProcessingVlms,
  "vision-language-models": visionLanguageModels,
  "vllm": vllm,
  "voice-activity-detection": voiceActivityDetection,
  "writing-custom-kernels": writingCustomKernels,
  "zero-downtime-deployment": zeroDowntimeDeployment,
};

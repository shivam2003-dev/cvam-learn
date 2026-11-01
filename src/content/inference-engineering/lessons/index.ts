import type { Lesson } from "@/lib/types";
import { lesson as inferenceVsTraining } from "./inference-vs-training";
import { lesson as kvCache } from "./kv-cache";
import { lesson as latencyVsThroughput } from "./latency-vs-throughput";
import { lesson as openVsClosedModels } from "./open-vs-closed-models";
import { lesson as percentilesAndEndToEnd } from "./percentiles-and-end-to-end";
import { lesson as sharedVsDedicatedInference } from "./shared-vs-dedicated-inference";
import { lesson as theInferenceStack } from "./the-inference-stack";
import { lesson as ttftTpsItl } from "./ttft-tps-itl";

export const lessons: Record<string, Lesson> = {
  "inference-vs-training": inferenceVsTraining,
  "open-vs-closed-models": openVsClosedModels,
  "shared-vs-dedicated-inference": sharedVsDedicatedInference,
  "the-inference-stack": theInferenceStack,
  "ttft-tps-itl": ttftTpsItl,
  "latency-vs-throughput": latencyVsThroughput,
  "percentiles-and-end-to-end": percentilesAndEndToEnd,
  "kv-cache": kvCache,
};

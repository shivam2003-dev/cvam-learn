import type { Lesson } from "@/lib/types";
import { lesson as agentFrameworks } from "./agent-frameworks";
import { lesson as agentPatterns } from "./agent-patterns";
import { lesson as aiBuildingBlocks } from "./ai-building-blocks";
import { lesson as aiCodingTools } from "./ai-coding-tools";
import { lesson as aiEngineerVsMlEngineer } from "./ai-engineer-vs-ml-engineer";
import { lesson as biasFairnessModeration } from "./bias-fairness-moderation";
import { lesson as buildingMcpServersAndClients } from "./building-mcp-servers-and-clients";
import { lesson as callingModelApis } from "./calling-model-apis";
import { lesson as choosingTheRightModel } from "./choosing-the-right-model";
import { lesson as chunkingAndIndexing } from "./chunking-and-indexing";
import { lesson as contextFailureModes } from "./context-failure-modes";
import { lesson as contextLayerAndSources } from "./context-layer-and-sources";
import { lesson as contextSecurityAndIsolation } from "./context-security-and-isolation";
import { lesson as contextVsPromptEngineering } from "./context-vs-prompt-engineering";
import { lesson as contextWindow } from "./context-window";
import { lesson as embeddingModels } from "./embedding-models";
import { lesson as embeddingUseCases } from "./embedding-use-cases";
import { lesson as guardrailsAndAdversarialTesting } from "./guardrails-and-adversarial-testing";
import { lesson as huggingFace } from "./hugging-face";
import { lesson as improvingRag } from "./improving-rag";
import { lesson as llmEvaluations } from "./llm-evaluations";
import { lesson as llmObservability } from "./llm-observability";
import { lesson as llmsAndTokens } from "./llms-and-tokens";
import { lesson as localModels } from "./local-models";
import { lesson as longContextAndCompaction } from "./long-context-and-compaction";
import { lesson as mcpArchitecture } from "./mcp-architecture";
import { lesson as mcpOverview } from "./mcp-overview";
import { lesson as memoryAndState } from "./memory-and-state";
import { lesson as modelFamilies } from "./model-families";
import { lesson as modelGateways } from "./model-gateways";
import { lesson as multimodalAi } from "./multimodal-ai";
import { lesson as openVsClosedModels } from "./open-vs-closed-models";
import { lesson as promptBasics } from "./prompt-basics";
import { lesson as promptCachingAndStreaming } from "./prompt-caching-and-streaming";
import { lesson as promptInjection } from "./prompt-injection";
import { lesson as ragOverview } from "./rag-overview";
import { lesson as reasoningPrompts } from "./reasoning-prompts";
import { lesson as regressionTesting } from "./regression-testing";
import { lesson as retrievalAndGeneration } from "./retrieval-and-generation";
import { lesson as samplingParameters } from "./sampling-parameters";
import { lesson as securityAndPrivacy } from "./security-and-privacy";
import { lesson as speechAndAudio } from "./speech-and-audio";
import { lesson as structuredOutput } from "./structured-output";
import { lesson as toolsAndFunctionCalling } from "./tools-and-function-calling";
import { lesson as trainingInferenceFineTuning } from "./training-inference-fine-tuning";
import { lesson as vectorDatabaseBasics } from "./vector-database-basics";
import { lesson as vectorDatabaseOptions } from "./vector-database-options";
import { lesson as whatAreAgents } from "./what-are-agents";
import { lesson as whatAreEmbeddings } from "./what-are-embeddings";
import { lesson as whatIsAnAiEngineer } from "./what-is-an-ai-engineer";
import { lesson as zeroShotFewShot } from "./zero-shot-few-shot";

export const lessons: Record<string, Lesson> = {
  "agent-frameworks": agentFrameworks,
  "agent-patterns": agentPatterns,
  "ai-building-blocks": aiBuildingBlocks,
  "ai-coding-tools": aiCodingTools,
  "ai-engineer-vs-ml-engineer": aiEngineerVsMlEngineer,
  "bias-fairness-moderation": biasFairnessModeration,
  "building-mcp-servers-and-clients": buildingMcpServersAndClients,
  "calling-model-apis": callingModelApis,
  "choosing-the-right-model": choosingTheRightModel,
  "chunking-and-indexing": chunkingAndIndexing,
  "context-failure-modes": contextFailureModes,
  "context-layer-and-sources": contextLayerAndSources,
  "context-security-and-isolation": contextSecurityAndIsolation,
  "context-vs-prompt-engineering": contextVsPromptEngineering,
  "context-window": contextWindow,
  "embedding-models": embeddingModels,
  "embedding-use-cases": embeddingUseCases,
  "guardrails-and-adversarial-testing": guardrailsAndAdversarialTesting,
  "hugging-face": huggingFace,
  "improving-rag": improvingRag,
  "llm-evaluations": llmEvaluations,
  "llm-observability": llmObservability,
  "llms-and-tokens": llmsAndTokens,
  "local-models": localModels,
  "long-context-and-compaction": longContextAndCompaction,
  "mcp-architecture": mcpArchitecture,
  "mcp-overview": mcpOverview,
  "memory-and-state": memoryAndState,
  "model-families": modelFamilies,
  "model-gateways": modelGateways,
  "multimodal-ai": multimodalAi,
  "open-vs-closed-models": openVsClosedModels,
  "prompt-basics": promptBasics,
  "prompt-caching-and-streaming": promptCachingAndStreaming,
  "prompt-injection": promptInjection,
  "rag-overview": ragOverview,
  "reasoning-prompts": reasoningPrompts,
  "regression-testing": regressionTesting,
  "retrieval-and-generation": retrievalAndGeneration,
  "sampling-parameters": samplingParameters,
  "security-and-privacy": securityAndPrivacy,
  "speech-and-audio": speechAndAudio,
  "structured-output": structuredOutput,
  "tools-and-function-calling": toolsAndFunctionCalling,
  "training-inference-fine-tuning": trainingInferenceFineTuning,
  "vector-database-basics": vectorDatabaseBasics,
  "vector-database-options": vectorDatabaseOptions,
  "what-are-agents": whatAreAgents,
  "what-are-embeddings": whatAreEmbeddings,
  "what-is-an-ai-engineer": whatIsAnAiEngineer,
  "zero-shot-few-shot": zeroShotFewShot,
};

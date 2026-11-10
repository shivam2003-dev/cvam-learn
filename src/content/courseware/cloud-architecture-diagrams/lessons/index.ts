import type { Lesson } from "@/lib/types";
import { lesson as cicdPipeline } from "./cicd-pipeline";
import { lesson as containerPlatform } from "./container-platform";
import { lesson as dataLakeAnalytics } from "./data-lake-analytics";
import { lesson as ecommercePlatform } from "./ecommerce-platform";
import { lesson as eventDrivenPipeline } from "./event-driven-pipeline";
import { lesson as fintechPayments } from "./fintech-payments";
import { lesson as healthcareDataPlatform } from "./healthcare-data-platform";
import { lesson as hubAndSpoke } from "./hub-and-spoke";
import { lesson as iotTelemetry } from "./iot-telemetry";
import { lesson as saasMultitenant } from "./saas-multitenant";
import { lesson as securePerimeter } from "./secure-perimeter";
import { lesson as serverlessApi } from "./serverless-api";
import { lesson as threeTierWebApp } from "./three-tier-web-app";

export const lessons: Record<string, Lesson> = {
  "three-tier-web-app": threeTierWebApp,
  "serverless-api": serverlessApi,
  "container-platform": containerPlatform,
  "saas-multitenant": saasMultitenant,
  "event-driven-pipeline": eventDrivenPipeline,
  "data-lake-analytics": dataLakeAnalytics,
  "iot-telemetry": iotTelemetry,
  "cicd-pipeline": cicdPipeline,
  "secure-perimeter": securePerimeter,
  "hub-and-spoke": hubAndSpoke,
  "ecommerce-platform": ecommercePlatform,
  "fintech-payments": fintechPayments,
  "healthcare-data-platform": healthcareDataPlatform,
};

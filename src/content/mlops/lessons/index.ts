import type { Lesson } from "@/lib/types";
import { lesson as airflow } from "./airflow";
import { lesson as ansible } from "./ansible";
import { lesson as awsAzureGcp } from "./aws-azure-gcp";
import { lesson as bashForMlops } from "./bash-for-mlops";
import { lesson as cicdForMl } from "./cicd-for-ml";
import { lesson as cloudNativeMlServices } from "./cloud-native-ml-services";
import { lesson as cml } from "./cml";
import { lesson as dataIngestionArchitectures } from "./data-ingestion-architectures";
import { lesson as dataLakesWarehouses } from "./data-lakes-warehouses";
import { lesson as dataPipelines } from "./data-pipelines";
import { lesson as deepLearningBasics } from "./deep-learning-basics";
import { lesson as dockerForMl } from "./docker-for-ml";
import { lesson as dvc } from "./dvc";
import { lesson as gitBasics } from "./git-basics";
import { lesson as githubActions } from "./github-actions";
import { lesson as githubCollaboration } from "./github-collaboration";
import { lesson as gitlabJenkins } from "./gitlab-jenkins";
import { lesson as goForMlops } from "./go-for-mlops";
import { lesson as jetson } from "./jetson";
import { lesson as kafkaFlink } from "./kafka-flink";
import { lesson as kubeflow } from "./kubeflow";
import { lesson as kubernetesForMl } from "./kubernetes-for-ml";
import { lesson as lime } from "./lime";
import { lesson as machineLearningBasics } from "./machine-learning-basics";
import { lesson as mathsStatistics } from "./maths-statistics";
import { lesson as mlFrameworks } from "./ml-frameworks";
import { lesson as mlflow } from "./mlflow";
import { lesson as mlopsComponents } from "./mlops-components";
import { lesson as mlopsPrinciples } from "./mlops-principles";
import { lesson as modelEvaluation } from "./model-evaluation";
import { lesson as modelMonitoring } from "./model-monitoring";
import { lesson as prometheusGrafana } from "./prometheus-grafana";
import { lesson as pythonForMlops } from "./python-for-mlops";
import { lesson as shap } from "./shap";
import { lesson as spark } from "./spark";
import { lesson as sqlForMlops } from "./sql-for-mlops";
import { lesson as terraform } from "./terraform";
import { lesson as tflitePytorchMobile } from "./tflite-pytorch-mobile";
import { lesson as whatIsMlops } from "./what-is-mlops";

export const lessons: Record<string, Lesson> = {
  "airflow": airflow,
  "ansible": ansible,
  "aws-azure-gcp": awsAzureGcp,
  "bash-for-mlops": bashForMlops,
  "cicd-for-ml": cicdForMl,
  "cloud-native-ml-services": cloudNativeMlServices,
  "cml": cml,
  "data-ingestion-architectures": dataIngestionArchitectures,
  "data-lakes-warehouses": dataLakesWarehouses,
  "data-pipelines": dataPipelines,
  "deep-learning-basics": deepLearningBasics,
  "docker-for-ml": dockerForMl,
  "dvc": dvc,
  "git-basics": gitBasics,
  "github-actions": githubActions,
  "github-collaboration": githubCollaboration,
  "gitlab-jenkins": gitlabJenkins,
  "go-for-mlops": goForMlops,
  "jetson": jetson,
  "kafka-flink": kafkaFlink,
  "kubeflow": kubeflow,
  "kubernetes-for-ml": kubernetesForMl,
  "lime": lime,
  "machine-learning-basics": machineLearningBasics,
  "maths-statistics": mathsStatistics,
  "ml-frameworks": mlFrameworks,
  "mlflow": mlflow,
  "mlops-components": mlopsComponents,
  "mlops-principles": mlopsPrinciples,
  "model-evaluation": modelEvaluation,
  "model-monitoring": modelMonitoring,
  "prometheus-grafana": prometheusGrafana,
  "python-for-mlops": pythonForMlops,
  "shap": shap,
  "spark": spark,
  "sql-for-mlops": sqlForMlops,
  "terraform": terraform,
  "tflite-pytorch-mobile": tflitePytorchMobile,
  "what-is-mlops": whatIsMlops,
};

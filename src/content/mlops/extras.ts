import type { Reference } from "@/lib/types";

const book = (title: string, url: string): Reference => ({ type: "book", title, url });
const official = (title: string, url: string): Reference => ({ type: "official", title, url });
const paper = (title: string, url: string): Reference => ({ type: "paper", title, url });
const article = (title: string, url: string): Reference => ({ type: "article", title, url });

const designingMl = book("Designing Machine Learning Systems, Chip Huyen", "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/");
const ddia = book("Designing Data-Intensive Applications, Martin Kleppmann", "https://dataintensive.net/");
const sre = book("Site Reliability Engineering (free online)", "https://sre.google/sre-book/table-of-contents/");

export const moduleExtras: Record<string, Reference[]> = {
  "what-is-mlops": [
    designingMl,
    book("Introducing MLOps, Treveil et al.", "https://www.oreilly.com/library/view/introducing-mlops/9781492083283/"),
    paper("Hidden Technical Debt in Machine Learning Systems", "https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems"),
    article("MLOps: Continuous delivery and automation pipelines", "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning"),
    article("Rules of Machine Learning", "https://developers.google.com/machine-learning/guides/rules-of-ml"),
  ],
  programming: [book("The Pragmatic Programmer, Thomas & Hunt", "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/")],
  "version-control": [
    book("Pro Git (free online)", "https://git-scm.com/book/en/v2"),
    official("Git documentation", "https://git-scm.com/doc"),
  ],
  cicd: [
    book("Continuous Delivery, Humble & Farley", "https://continuousdelivery.com/"),
    article("Continuous Delivery for Machine Learning", "https://martinfowler.com/articles/cd4ml.html"),
  ],
  "ml-fundamentals": [
    book("An Introduction to Statistical Learning (free)", "https://www.statlearning.com/"),
    book("Deep Learning, Goodfellow, Bengio & Courville (free online)", "https://www.deeplearningbook.org/"),
    book("Understanding Deep Learning, Simon Prince (free)", "https://udlbook.github.io/udlbook/"),
    official("Machine Learning Crash Course", "https://developers.google.com/machine-learning/crash-course"),
  ],
  cloud: [
    official("AWS SageMaker documentation", "https://docs.aws.amazon.com/sagemaker/"),
    official("Google Cloud Vertex AI documentation", "https://cloud.google.com/vertex-ai/docs"),
    official("Azure Machine Learning documentation", "https://learn.microsoft.com/azure/machine-learning/"),
  ],
  containers: [
    official("Docker documentation", "https://docs.docker.com/"),
    official("Kubernetes documentation", "https://kubernetes.io/docs/home/"),
    book("Kubernetes: Up and Running", "https://www.oreilly.com/library/view/kubernetes-up-and/9781098110192/"),
  ],
  "data-engineering": [
    ddia,
    book("Fundamentals of Data Engineering, Reis & Housley", "https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/"),
  ],
  iac: [book("Terraform: Up & Running, Yevgeniy Brikman", "https://www.terraformupandrunning.com/")],
  orchestration: [official("Apache Airflow documentation", "https://airflow.apache.org/docs/")],
  monitoring: [
    sre,
    official("Prometheus documentation", "https://prometheus.io/docs/introduction/overview/"),
    official("Grafana documentation", "https://grafana.com/docs/grafana/latest/"),
    official("OpenTelemetry documentation", "https://opentelemetry.io/docs/"),
    article("Monitoring Machine Learning Models in Production", "https://www.evidentlyai.com/ml-in-production/model-monitoring"),
  ],
  "edge-ai": [official("Google AI Edge documentation", "https://ai.google.dev/edge")],
  "explainable-ai": [book("Interpretable Machine Learning, Christoph Molnar (free)", "https://christophm.github.io/interpretable-ml-book/")],
};

export const lessonExtras: Record<string, Reference[]> = {
  "python-for-mlops": [
    book("Fluent Python, Luciano Ramalho", "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/"),
    official("The Python Tutorial", "https://docs.python.org/3/tutorial/"),
  ],
  "bash-for-mlops": [
    book("The Linux Command Line, William Shotts (free)", "https://linuxcommand.org/tlcl.php"),
    official("GNU Bash manual", "https://www.gnu.org/software/bash/manual/"),
  ],
  "sql-for-mlops": [
    book("Use The Index, Luke (free)", "https://use-the-index-luke.com/"),
    official("PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html"),
  ],
  "go-for-mlops": [
    book("The Go Programming Language", "https://www.gopl.io/"),
    official("Effective Go", "https://go.dev/doc/effective_go"),
  ],
  dvc: [official("DVC documentation", "https://dvc.org/doc")],
  "github-actions": [official("GitHub Actions documentation", "https://docs.github.com/actions")],
  cml: [official("CML documentation", "https://cml.dev/doc")],
  "ml-frameworks": [
    official("scikit-learn user guide", "https://scikit-learn.org/stable/user_guide.html"),
    official("PyTorch documentation", "https://docs.pytorch.org/docs/stable/index.html"),
    official("TensorFlow guide", "https://www.tensorflow.org/guide"),
    book("Hands-On Machine Learning, Aurélien Géron", "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/"),
  ],
  mlflow: [official("MLflow documentation", "https://mlflow.org/docs/latest/")],
  spark: [
    official("Apache Spark documentation", "https://spark.apache.org/docs/latest/"),
    book("Spark: The Definitive Guide", "https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/"),
  ],
  "kafka-flink": [
    official("Apache Kafka documentation", "https://kafka.apache.org/documentation/"),
    official("Apache Flink documentation", "https://nightlies.apache.org/flink/flink-docs-stable/"),
  ],
  terraform: [official("Terraform documentation", "https://developer.hashicorp.com/terraform/docs")],
  ansible: [official("Ansible documentation", "https://docs.ansible.com/")],
  kubeflow: [official("Kubeflow documentation", "https://www.kubeflow.org/docs/")],
  lime: [paper("\"Why Should I Trust You?\" (the LIME paper)", "https://arxiv.org/abs/1602.04938")],
  shap: [
    paper("A Unified Approach to Interpreting Model Predictions (the SHAP paper)", "https://arxiv.org/abs/1705.07874"),
    official("SHAP documentation", "https://shap.readthedocs.io/en/latest/"),
  ],
};

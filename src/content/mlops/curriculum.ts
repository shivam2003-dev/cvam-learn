import type { Course } from "@/lib/types";

export const mlops: Course = {
  slug: "mlops",
  title: "MLOps",
  tagline:
    "Take machine learning out of notebooks and run it as a reliable production system.",
  description:
    "Learn the tools and practices that turn a model into a dependable product: versioning data and code, automating training, deploying on cloud and containers, and monitoring what happens after launch.",
  level: "Beginner to Intermediate",
  skills: ["Git & DVC", "CI/CD for ML", "Docker & Kubernetes", "Airflow", "MLflow", "Monitoring"],
  modules: [
    {
      id: "what-is-mlops",
      title: "What is MLOps?",
      blurb: "The discipline, its goals and its moving parts.",
      lessons: [
        { slug: "what-is-mlops", title: "What Is MLOps?", summary: "Why most ML projects stall before production, and what fixes it." },
        { slug: "mlops-principles", title: "MLOps Principles", summary: "Automation, versioning, testing, reproducibility and monitoring." },
        { slug: "mlops-components", title: "MLOps Components", summary: "Version control, CI/CD, orchestration, tracking, lineage, serving and monitoring." },
      ],
    },
    {
      id: "programming",
      title: "Programming Basics",
      blurb: "The languages MLOps engineers use daily.",
      lessons: [
        { slug: "python-for-mlops", title: "Python", summary: "Packaging, environments and production-quality code." },
        { slug: "bash-for-mlops", title: "Bash", summary: "Automate the shell work around ML systems." },
        { slug: "sql-for-mlops", title: "SQL", summary: "Query the data your models depend on." },
        { slug: "go-for-mlops", title: "Go", summary: "Where Go appears in ML infrastructure." },
      ],
    },
    {
      id: "version-control",
      title: "Version Control Systems",
      blurb: "Version code, data and models together.",
      lessons: [
        { slug: "git-basics", title: "Git", summary: "The workflow every other tool builds on." },
        { slug: "github-collaboration", title: "GitHub", summary: "Reviews, branches and team workflows." },
        { slug: "dvc", title: "DVC", summary: "Version large data and models alongside code." },
      ],
    },
    {
      id: "cicd",
      title: "CI/CD",
      blurb: "Automate testing and delivery for ML.",
      lessons: [
        { slug: "cicd-for-ml", title: "CI/CD for ML", summary: "What changes when data and models are involved." },
        { slug: "github-actions", title: "GitHub Actions", summary: "Build your first ML pipeline workflow." },
        { slug: "gitlab-jenkins", title: "GitLab & Jenkins", summary: "The other common CI systems." },
        { slug: "cml", title: "CML", summary: "Report model results on pull requests." },
      ],
    },
    {
      id: "ml-fundamentals",
      title: "ML Fundamentals",
      blurb: "Enough ML to support the people who build it.",
      lessons: [
        { slug: "maths-statistics", title: "Maths & Statistics", summary: "The concepts you can't avoid." },
        { slug: "machine-learning-basics", title: "Machine Learning", summary: "Supervised, unsupervised and how training works." },
        { slug: "deep-learning-basics", title: "Deep Learning", summary: "Neural networks in practice." },
        { slug: "model-evaluation", title: "Model Evaluation", summary: "Metrics, validation and leakage." },
        { slug: "ml-frameworks", title: "Scikit-learn, TensorFlow & PyTorch", summary: "When to reach for each one." },
        { slug: "mlflow", title: "MLflow", summary: "Track experiments and register models." },
      ],
    },
    {
      id: "cloud",
      title: "Cloud Computing",
      blurb: "Where ML workloads actually run.",
      lessons: [
        { slug: "aws-azure-gcp", title: "AWS, Azure & GCP", summary: "The core services you'll use on each." },
        { slug: "cloud-native-ml-services", title: "Cloud-Native ML Services", summary: "Managed platforms and when they're worth it." },
      ],
    },
    {
      id: "containers",
      title: "Containerization",
      blurb: "Package once, run anywhere.",
      lessons: [
        { slug: "docker-for-ml", title: "Docker", summary: "Build reproducible ML images." },
        { slug: "kubernetes-for-ml", title: "Kubernetes", summary: "Run and scale ML workloads." },
      ],
    },
    {
      id: "data-engineering",
      title: "Data Engineering Basics",
      blurb: "Get reliable data to your models.",
      lessons: [
        { slug: "data-pipelines", title: "Data Pipelines", summary: "ETL, ELT and data quality." },
        { slug: "data-lakes-warehouses", title: "Data Lakes & Warehouses", summary: "Choosing where data lives." },
        { slug: "data-ingestion-architectures", title: "Data Ingestion Architectures", summary: "Batch and streaming patterns." },
        { slug: "spark", title: "Spark", summary: "Process data across a cluster." },
        { slug: "kafka-flink", title: "Kafka & Flink", summary: "Move and process events in real time." },
      ],
    },
    {
      id: "iac",
      title: "Infrastructure as Code",
      blurb: "Build environments you can recreate.",
      lessons: [
        { slug: "terraform", title: "Terraform", summary: "Declare cloud infrastructure in code." },
        { slug: "ansible", title: "Ansible", summary: "Configure the machines themselves." },
      ],
    },
    {
      id: "orchestration",
      title: "Orchestration",
      blurb: "Run multi-step pipelines dependably.",
      lessons: [
        { slug: "airflow", title: "Airflow", summary: "Schedule and monitor workflows." },
        { slug: "kubeflow", title: "Kubeflow", summary: "ML pipelines on Kubernetes." },
      ],
    },
    {
      id: "monitoring",
      title: "Monitoring & Observability",
      blurb: "Know when a model quietly goes wrong.",
      lessons: [
        { slug: "model-monitoring", title: "Monitoring Models", summary: "Drift, decay and data quality." },
        { slug: "prometheus-grafana", title: "Prometheus & Grafana", summary: "Collect metrics and build dashboards." },
      ],
    },
    {
      id: "edge-ai",
      title: "Edge AI",
      blurb: "Run models on devices.",
      lessons: [
        { slug: "tflite-pytorch-mobile", title: "TFLite & PyTorch Mobile", summary: "Deploy to phones." },
        { slug: "jetson", title: "NVIDIA Jetson", summary: "Embedded GPU deployment." },
      ],
    },
    {
      id: "explainable-ai",
      title: "Explainable AI",
      blurb: "Understand why a model decided.",
      lessons: [
        { slug: "lime", title: "LIME", summary: "Local explanations for single predictions." },
        { slug: "shap", title: "SHAP", summary: "Feature attributions with solid theory." },
      ],
    },
  ],
};

# Professional Cloud Architect bank — 7 November 2026

The bank contains one adapted record for each of the 253 numbered questions in `Professional_Cloud_Architect_Question_Bank.pdf`. The 60 original course questions remain separately selectable. Repeated concepts in the PDF are deliberately retained so no source number is lost. Each adapted record has a stable ID, source number, section, topic, complete alternatives, scoring key, explanation, revision date, and documentation links.

This is an editorial modernization of supplied study material, not a reproduction of an official exam or a claim of complete current-exam coverage. The PDF's keys were not treated as authoritative. Broken alternatives, missing code samples, and missing diagrams were reconstructed as self-contained scenarios; answers and wording can differ from the PDF. The six sections support topic reports; random practice sets do not enforce the official weighting or case-study distribution.

## Principal revisions

- Short-lived workload credentials and attached identities replace advice to distribute service account keys.
- Cloud Run, Cloud Run functions, Artifact Registry, Infrastructure Manager/Terraform, Cloud Service Mesh, and Managed Service for Apache Spark replace inappropriate or outdated platform recommendations.
- Cloud Monitoring/Logging, OpenTelemetry/Cloud Trace, the Ops Agent, BigQuery data preparation and data-quality scans replace older operational and analytical tooling.
- Current regional Cloud SQL HA replaces legacy failover-replica terminology. Regional disk recovery explicitly addresses two-zone scope and fencing.
- GKE HPA and cluster autoscaling, readiness probes, Binary Authorization, API versioning, immutable image digests, and pipeline approvals are distinguished from VM-level mechanisms.
- Retryable failures use exponential backoff and idempotency; uploaded data uses checksums; per-user query attribution uses job metadata.
- Privacy, healthcare and payment scenarios describe required controls without claiming that a provider certification automatically makes an application compliant.
- Missing-context questions 25/119, 51/192, 120/184, 157, and 227 were rewritten. Two diagrams were generated with the built-in imagegen tool; the migration topology is part of the question, while the analytics solution is shown only after reveal or submission.

## Mode behavior

Learning follows source order within the chosen bank and filters. Reveal works without selecting an option; study exposure is reported separately and excluded from readiness trends. Practice shuffles questions/options, locks a checked answer, and shows immediate explanation. Exam mode is timed at two minutes per selected question and withholds answers and documentation until submission. A 60-question run is 120 minutes; selecting the entire bank produces an extended drill. Attempts, flags, answers, revealed cards and progress are saved in browser-local storage; no account synchronization is implied.

## Primary sources checked

- [PCA standard exam information](https://cloud.google.com/learn/certification/cloud-architect)
- [Service-account security](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)
- [Deployment Manager deprecation and Infrastructure Manager migration](https://docs.cloud.google.com/deployment-manager/docs/deprecations)
- [Artifact Registry](https://docs.cloud.google.com/artifact-registry/docs/overview)
- [Managed Service for Apache Spark](https://cloud.google.com/products/managed-service-for-apache-spark)
- [Cloud Service Mesh](https://cloud.google.com/products/service-mesh)
- [GKE cluster autoscaling](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cluster-autoscaler)
- [App Engine VPC connectivity](https://docs.cloud.google.com/appengine/docs/standard/connecting-vpc)
- [IAP TCP forwarding](https://docs.cloud.google.com/iap/docs/using-tcp-forwarding)
- [Cloud SQL HA](https://docs.cloud.google.com/sql/docs/mysql/high-availability)
- [Synchronous disk replication](https://docs.cloud.google.com/compute/docs/disks/about-regional-persistent-disk)
- [Cloud Storage retries](https://docs.cloud.google.com/storage/docs/retry-strategy)
- [Cloud Storage resumable uploads](https://docs.cloud.google.com/storage/docs/resumable-uploads)
- [Cloud Storage signed URLs](https://docs.cloud.google.com/storage/docs/access-control/signed-urls)
- [Object Versioning and soft-delete guidance](https://docs.cloud.google.com/storage/docs/object-versioning)
- [BigQuery JOBS metadata](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs)
- [BigQuery data preparation](https://docs.cloud.google.com/bigquery/docs/data-prep-introduction)
- [BigQuery quality scans](https://docs.cloud.google.com/bigquery/docs/data-quality-scan)

Run `node scripts/exams/validate-bank.mjs` for source-number completeness, answer integrity, terminology, missing-context checks, and regression checks for corrected PDF keys. The PDF is not needed at runtime.

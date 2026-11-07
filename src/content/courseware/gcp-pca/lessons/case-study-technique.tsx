import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Explain how case-study questions work and how much they weigh in the exam",
    "Extract business drivers, technical constraints and success measures from a case study quickly",
    "Map industry themes to Google Cloud building blocks",
    "Answer case-study questions by tracing each requirement to a design choice",
  ],
  tasks: [
    {
      id: "format",
      title: "How case studies are used",
      body: (
        <>
          <p>
            Each exam includes <strong>two case studies</strong>, which together account for about 20
            to 30 percent of the questions. You can view the case study on a split screen while
            answering. The four published case studies are <strong>Altostrat Media</strong>,{" "}
            <strong>Cymbal Retail</strong>, <strong>EHR Healthcare</strong> and{" "}
            <strong>KnightMotives Automotive</strong>; several use Google Cloud generative AI.
          </p>
          <Callout tone="warn" title="Read the official documents">
            This course does not reproduce the case studies. Download all four from the official
            exam guide page and read them closely at least once before the exam. Below is a method
            you can apply to any of them, plus typical architectural themes by industry. The themes
            are study aids, not statements about what a particular case study says.
          </Callout>
        </>
      ),
    },
    {
      id: "method",
      title: "A method for any case study",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="case-study-technique-diagram-1" />
          <ol>
            <li>On the first question, spend two minutes jotting a compact table: drivers, estate, must-haves, constraints. Reuse it.</li>
            <li>Highlight numbers (users, data size, latency, uptime, RPO/RTO, budget, dates) and words like &ldquo;must&rdquo;, &ldquo;cannot&rdquo;, &ldquo;minimise&rdquo;.</li>
            <li>For each question, ask which requirement it tests and eliminate answers that contradict a stated one.</li>
            <li>Prefer managed services and the Well-Architected pillars unless the case says otherwise.</li>
            <li>Watch for hidden asks: data residency, licensing, skills of the team, existing contracts, hybrid coexistence.</li>
          </ol>
        </>
      ),
    },
    {
      id: "themes",
      title: "Industry themes and building blocks",
      body: (
        <>
          <Table
            head={["Industry theme", "Typical requirements", "Building blocks to think of"]}
            rows={[
              ["Media and content", "Large video and image libraries, global delivery, content metadata, generative AI for tagging or creation, rights management", "Cloud Storage classes, Cloud CDN and global ALB, Transcoder API, Video Intelligence, Gemini and Imagen/Veo, BigQuery, Pub/Sub, Dataflow, Model Armor"],
              ["Retail and commerce", "Peak events, personalised search and recommendations, inventory across stores, omnichannel, payments", "Cloud Run or GKE with autoscaling, Spanner/AlloyDB/Firestore, Vertex AI Search for commerce, Memorystore, Pub/Sub, BigQuery, Cloud Armor, PCI segmentation"],
              ["Healthcare", "Regulation, patient privacy, interoperability, legacy and hybrid systems, auditability", "Cloud Healthcare API (FHIR, HL7v2, DICOM), Sensitive Data Protection, VPC Service Controls, CMEK/EKM, Assured Workloads, Interconnect, audit logs"],
              ["Automotive and IoT", "Vehicle telemetry at scale, over-the-air updates, edge, predictive maintenance, connected services", "Pub/Sub, Dataflow, Bigtable, BigQuery, Vertex AI, GKE, Artifact Registry, IoT-style ingestion patterns, Apigee for partner APIs"],
            ]}
          />
          <Exercise
            title="Practise on a mini case"
            task={<p>Mini case: a regional broadcaster has 2 PB of archive video on tape, wants to make it searchable with AI, serve clips globally with low latency, stay within a fixed budget, and cannot expose unreleased content. Build the requirement table and propose the architecture.</p>}
          >
            <p>
              <strong>Drivers:</strong> monetise the archive, speed up editing. <strong>Constraints:</strong>{" "}
              budget, confidentiality, 2 PB transfer, tape source. <strong>Design:</strong> ship data
              with <strong>Transfer Appliance</strong> into Cloud Storage (Standard briefly, then
              Nearline/Coldline with lifecycle and Autoclass); index with{" "}
              <strong>Video Intelligence</strong>/Gemini to produce metadata into BigQuery and a
              search index (Vertex AI Search); serve clips via a global ALB with <strong>Cloud
              CDN</strong> and signed URLs; protect unreleased content with IAM, VPC Service Controls,
              CMEK and Model Armor on AI flows; control cost with batch processing on Spot VMs and
              budgets. Each element maps to a stated requirement.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Two case studies per exam, 20 to 30 percent of questions, viewable on a split screen; read all four published ones beforehand.",
    "Extract drivers, estate, requirements and constraints once, then trace every answer to a stated requirement.",
    "Industry themes suggest building blocks, but the case text decides.",
    "Watch hidden asks: residency, licensing, skills, existing contracts, hybrid coexistence.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Approximately what share of the exam do case-study questions represent?",
      options: ["20 to 30 percent", "5 percent", "50 percent", "100 percent"],
      answer: 0,
      explain: "Case study questions make up about 20 to 30 percent of the exam.",
    },
    {
      kind: "mcq",
      q: "What is the best first step on a case-study question?",
      options: ["Extract business drivers, constraints and requirements", "Pick the cheapest service", "Skip the case study", "Choose Kubernetes"],
      answer: 0,
      explain: "A requirement table anchors every answer to the case text.",
    },
    {
      kind: "mcq",
      q: "Two options both meet the technical need; one violates the case's data residency statement. Which do you choose?",
      options: ["The one that respects residency", "The cheaper one", "The newer one", "The one with more services"],
      answer: 0,
      explain: "Stated constraints are hard requirements that eliminate options.",
    },
    {
      kind: "mcq",
      q: "Which is NOT one of the four published case studies?",
      options: ["Globex Logistics", "Altostrat Media", "Cymbal Retail", "KnightMotives Automotive"],
      answer: 0,
      explain: "The published set is Altostrat Media, Cymbal Retail, EHR Healthcare and KnightMotives Automotive.",
    },
    {
      kind: "text",
      q: "How many case studies are in each standard PCA exam?",
      format: "*",
      accept: ["2", "two"],
      explain: "Each exam includes two case studies.",
    },
  ],
};

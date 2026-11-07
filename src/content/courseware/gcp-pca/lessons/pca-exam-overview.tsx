import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Easy",
  objectives: [
    "State the PCA exam format, fee, validity and recommended experience",
    "Name the six exam sections with their approximate weightings",
    "Explain how the case-study questions work",
    "Build a study plan that mixes reading, hands-on practice and scenario drills",
  ],
  tasks: [
    {
      id: "what",
      title: "What the certification validates",
      body: (
        <>
          <p>
            A Professional Cloud Architect designs, develops and manages secure, scalable, highly
            available and cost-effective solutions on Google Cloud that drive business objectives.
            Google expects proficiency in enterprise cloud strategy, solution design, migration,
            deployment and orchestration, optimization and architectural best practice, with
            familiarity with the <strong>Google Cloud Well-Architected Framework</strong> as a key
            requirement.
          </p>
          <Table
            head={["Item", "Detail (standard exam)"]}
            rows={[
              ["Length", "2 hours"],
              ["Format", "50 to 60 multiple choice and multiple select questions"],
              ["Fee", "$200 plus tax where applicable"],
              ["Languages", "English and Japanese"],
              ["Case studies", "Each exam includes 2 case studies, making up about 20 to 30 percent of the exam; four are published"],
              ["Delivery", "Online proctored, or onsite at a testing centre"],
              ["Validity", "2 years; a shorter renewal exam exists (25 questions, 1 hour, one generative AI case study)"],
              ["Prerequisites", "None. Recommended: 3+ years of industry experience including 1+ year designing and managing solutions on Google Cloud"],
            ]}
          />
          <Callout tone="note" title="Confirm before booking">
            This course follows the PCA exam guide published on the Google Cloud certification site
            (reviewed November 2026). Google updates the guide, fee and case studies from time to
            time; compare the section list with the chapters here before you book.
          </Callout>
        </>
      ),
    },
    {
      id: "sections",
      title: "The six sections",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="pca-exam-overview-diagram-1" />
          <p>
            The current guide adds generative AI content in several places: Gemini Cloud Assist,
            Google Cloud AI and ML solutions (Gemini, Agent Builder, Model Garden, AI Hypercomputer),
            the Gemini Enterprise Agent Platform for ML workflows, and securing AI with Model Armor
            and Sensitive Data Protection. Expect these alongside the classic topics.
          </p>
        </>
      ),
    },
    {
      id: "cases",
      title: "Case studies",
      body: (
        <>
          <p>
            Some questions refer to a case study describing a fictitious business and solution
            concept. Several use Google Cloud generative AI to solve real-world challenges. You can
            view the case study on a split screen during the exam. The published case studies are{" "}
            <strong>Altostrat Media</strong>, <strong>Cymbal Retail</strong>, <strong>EHR
            Healthcare</strong> and <strong>KnightMotives Automotive</strong>. Read all four on the
            official guide page before the exam and practise extracting requirements from them; the
            case-study lesson near the end of this course gives a method.
          </p>
        </>
      ),
    },
    {
      id: "plan",
      title: "A study plan",
      body: (
        <>
          <ol>
            <li><strong>Weeks 1 to 2:</strong> foundations, design principles, compute, storage, data and network choices (Section 1).</li>
            <li><strong>Week 3:</strong> provisioning and configuration; build a small VPC, MIG, GKE or Cloud Run service (Section 2).</li>
            <li><strong>Week 4:</strong> security and compliance (Section 3), which is heavy on scenario judgment.</li>
            <li><strong>Week 5:</strong> processes, implementation, operations (Sections 4 to 6).</li>
            <li><strong>Week 6:</strong> case studies, scenarios, the lab and timed practice.</li>
          </ol>
          <Exercise
            title="Where to focus"
            task={<p>You are a strong Kubernetes engineer but have never done a migration or worked on compliance. Which sections need extra attention?</p>}
          >
            <p>
              Section 1.4 (migration planning, licensing, dependencies) and Sections 3 and 4.2
              (compliance, data residency, stakeholder and change management). Section 1 is also the
              largest block, and migration, hybrid connectivity and cost trade-offs appear often in
              case studies.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "PCA: 2 hours, 50 to 60 questions, $200, two case studies making up 20 to 30 percent of the exam.",
    "Six sections: design and plan (~25%), provision (17.5%), security (17.5%), optimize processes (15%), implementation (12.5%), operations (12.5%).",
    "The Well-Architected Framework pillars guide decisions across the exam.",
    "The guide now includes generative AI topics: Gemini Cloud Assist, Model Garden, Agent Builder, AI Hypercomputer, Model Armor.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which section carries the highest weighting on the PCA exam?",
      options: ["Designing and planning a cloud solution architecture (~25%)", "Designing for security and compliance", "Managing implementation", "Ensuring solution and operations excellence"],
      answer: 0,
      explain: "Section 1 is about 25 percent of the exam.",
    },
    {
      kind: "mcq",
      q: "How many case studies does each standard PCA exam include?",
      options: ["2", "1", "4", "None"],
      answer: 0,
      explain: "Each exam includes 2 case studies; four are published in total.",
    },
    {
      kind: "mcq",
      q: "How long is the PCA certification valid?",
      options: ["2 years", "1 year", "3 years", "Lifetime"],
      answer: 0,
      explain: "The certification is valid for two years and can be renewed with a shorter exam.",
    },
    {
      kind: "mcq",
      q: "Which framework is described as a key requirement for the role?",
      options: ["Google Cloud Well-Architected Framework", "ITIL only", "TOGAF only", "PMBOK"],
      answer: 0,
      explain: "Familiarity with the Well-Architected Framework is explicitly required.",
    },
    {
      kind: "text",
      q: "How many minutes long is the standard PCA exam?",
      format: "***",
      accept: ["120", "120 minutes", "2 hours", "two hours"],
      explain: "The standard exam is 2 hours (120 minutes).",
    },
  ],
};

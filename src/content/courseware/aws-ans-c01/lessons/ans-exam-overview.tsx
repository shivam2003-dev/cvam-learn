import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Easy",
  objectives: [
    "State the ANS-C01 format, the four domains and their weightings",
    "Map each of the 16 task statements to a chapter of this course",
    "Recognise which AWS services are in scope and which are not",
    "Build a realistic study plan that mixes reading, labs and practice questions",
  ],
  tasks: [
    {
      id: "what",
      title: "What the exam validates",
      body: (
        <>
          <p>
            The AWS Certified Advanced Networking - Specialty exam (<strong>ANS-C01</strong>) is aimed
            at people who act as an AWS networking specialist. AWS describes it as validating the
            ability to <em>design, implement, manage and secure AWS and hybrid network architectures
            at scale</em>. The target candidate has five or more years of networking experience and at
            least two years of cloud and hybrid networking experience.
          </p>
          <p>
            This is not an exam about clicking through the console. Most questions give you a
            business or technical scenario with several constraints (cost, resilience, overlapping
            addresses, compliance, latency) and ask which design satisfies <em>all</em> of them.
          </p>
          <Table
            head={["Item", "Detail"]}
            rows={[
              ["Scored questions", "50 questions count towards your score"],
              ["Unscored questions", "15 more are unscored trial questions and are not identified"],
              ["Total", "65 questions in about 170 minutes"],
              ["Question types", "Multiple response (two or more correct answers) and matching; some forms also include multiple choice"],
              ["Passing score", "750 on a scaled range of 100 to 1,000"],
              ["Scoring model", "Compensatory: you only need to pass overall, not each domain"],
              ["Guessing", "Unanswered questions score zero and there is no penalty for a wrong answer"],
            ]}
          />
          <Callout tone="note" title="Always confirm the latest details">
            AWS can revise the exam guide, fees and duration. This course follows the ANS-C01 exam
            guide published in AWS documentation (reviewed November 2026). Before you book, open the
            official exam page and exam guide and compare the task statements with the chapters here.
          </Callout>
        </>
      ),
    },
    {
      id: "domains",
      title: "The four domains and where they live in this course",
      body: (
        <>
          <Figure caption="The four content domains with their weightings. Network Design and Network Implementation together make up more than half of the scored content.">
            <Layers
              layers={[
                { title: "Domain 1: Network Design (30%)", note: "Edge, DNS, load balancing, logging requirements, hybrid and multi-account routing strategy (6 tasks).", tone: "lime" },
                { title: "Domain 2: Network Implementation (26%)", note: "Build hybrid links, multi-account connectivity, hybrid DNS and automation (4 tasks).", tone: "sky" },
                { title: "Domain 3: Management and Operation (20%)", note: "Maintain routing, monitor and troubleshoot, optimize cost and performance (3 tasks).", tone: "amber" },
                { title: "Domain 4: Security, Compliance, Governance (24%)", note: "Secure flows, audit with logs, protect data in transit (3 tasks).", tone: "rose" },
              ]}
            />
          </Figure>
          <Table
            head={["Task", "Topic", "Chapter in this course"]}
            rows={[
              ["1.1", "Edge services for global architectures", "Edge Networking and Global Traffic"],
              ["1.2", "Public, private and hybrid DNS design", "DNS on AWS"],
              ["1.3", "Load balancing for HA, scale and security", "Load Balancing"],
              ["1.4", "Logging and monitoring requirements", "Monitoring, Logging and Automation"],
              ["1.5", "On-premises to AWS routing and connectivity design", "Hybrid Connectivity"],
              ["1.6", "Multi-account, multi-Region, multi-VPC design", "Multi-VPC, Multi-Account and Multi-Region"],
              ["2.1", "Implement hybrid routing and connectivity", "Hybrid Connectivity"],
              ["2.2", "Implement multi-account, Region and VPC connectivity", "Multi-VPC, Multi-Account and Multi-Region"],
              ["2.3", "Complex hybrid and multi-account DNS", "DNS on AWS"],
              ["2.4", "Automate and configure network infrastructure", "Monitoring, Logging and Automation"],
              ["3.1", "Maintain routing and connectivity", "Operations, Troubleshooting and Optimization"],
              ["3.2", "Monitor and analyze traffic, troubleshoot", "Monitoring, Logging and Automation"],
              ["3.3", "Optimize for performance, reliability, cost", "Operations, Troubleshooting and Optimization"],
              ["4.1", "Network features for security and compliance", "Network Security, Compliance and Governance"],
              ["4.2", "Validate and audit with monitoring and logs", "Network Security, Compliance and Governance"],
              ["4.3", "Confidentiality of data and communications", "Network Security, Compliance and Governance"],
            ]}
          />
        </>
      ),
    },
    {
      id: "services",
      title: "In-scope services",
      body: (
        <>
          <p>
            AWS publishes a non-exhaustive list of in-scope services. For networking you should be
            fluent in the following, because they appear in scenario after scenario:
          </p>
          <ul>
            <li><strong>Networking and content delivery:</strong> Amazon VPC, Transit Gateway, Direct Connect, Site-to-Site VPN, Client VPN, PrivateLink, Route 53, CloudFront, Global Accelerator, Elastic Load Balancing, API Gateway, App Mesh, Cloud Map.</li>
            <li><strong>Security:</strong> AWS WAF, Shield, Network Firewall, Firewall Manager, IAM, Resource Access Manager (RAM).</li>
            <li><strong>Management and governance:</strong> CloudWatch, CloudTrail, Config, CloudFormation, AWS CLI, Organizations, Control Tower, Trusted Advisor, Health Dashboard, Well-Architected Tool.</li>
            <li><strong>Supporting services:</strong> EC2 and Auto Scaling, Lambda, ECS, EKS, Fargate, ECR, S3, EventBridge, SNS, SQS, Cost Explorer.</li>
          </ul>
          <Callout tone="tip" title="Newer services">
            Services such as AWS Cloud WAN or VPC Lattice are not on the in-scope list at the time of
            writing. Understand what they are for, but spend your study time on the listed services
            and the patterns built from them.
          </Callout>
        </>
      ),
    },
    {
      id: "plan",
      title: "A study plan that works",
      body: (
        <>
          <Figure caption="A suggested eight-week rhythm. Each loop is read, build, verify, then drill questions on that domain.">
            <Flow
              numbered
              steps={[
                { title: "Foundations", note: "Week 1: OSI, CIDR, BGP, MTU, VPC", tone: "sky" },
                { title: "Edge, DNS, ELB", note: "Weeks 2 to 3", tone: "lime" },
                { title: "Hybrid + multi-VPC", note: "Weeks 4 to 5, the heaviest", tone: "lime" },
                { title: "Ops + monitoring", note: "Week 6", tone: "amber" },
                { title: "Security", note: "Week 7", tone: "amber" },
                { title: "Scenarios + review", note: "Week 8", tone: "rose" },
              ]}
            />
          </Figure>
          <ol>
            <li>Read a lesson, then <strong>build it</strong> in a sandbox account. Networking is learned by seeing routes, not by memorising them.</li>
            <li>Keep a one-page <strong>decision table</strong> per topic (for example peering versus Transit Gateway versus PrivateLink).</li>
            <li>Use each lesson quiz as a check, then redo wrong answers a week later.</li>
            <li>Draw every scenario on paper: subnets, route tables, attachments and the packet path.</li>
          </ol>
          <Callout tone="warn" title="Cost hygiene in labs">
            NAT gateways, Transit Gateway attachments, Direct Connect-style VPN connections and
            Network Firewall endpoints all bill hourly. Create budgets and delete lab resources the
            same day.
          </Callout>
          <Exercise
            title="Plan your weeks"
            task={<p>You have used AWS for compute and storage but never configured BGP. Which domain topics should get the most extra time?</p>}
          >
            <p>
              Hybrid connectivity (Tasks 1.5 and 2.1) and Transit Gateway routing (Tasks 1.6 and 2.2).
              Together they drive a large share of Domains 1 and 2, and they depend on BGP path
              selection, communities and route-table priority. Do the foundations lesson first, then
              build a VPN to a software router such as FRRouting in a second VPC to practise BGP.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "ANS-C01 has four domains weighted 30, 26, 20 and 24 percent, with 16 task statements.",
    "Expect scenario questions with multiple constraints; the best answer satisfies all of them.",
    "The score is compensatory, so strong domains can offset weak ones, but Design and Implementation carry the most weight.",
    "Build in a sandbox and draw packet paths; do not rely on memorising features.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which domain carries the highest weighting on ANS-C01?",
      options: ["Network Design (30%)", "Network Implementation (26%)", "Network Management and Operation (20%)", "Network Security, Compliance, and Governance (24%)"],
      answer: 0,
      explain: "Network Design is 30%, followed by Implementation at 26%, Security at 24% and Management and Operation at 20%.",
    },
    {
      kind: "mcq",
      q: "How does ANS-C01 treat unanswered questions?",
      options: ["They score zero and there is no penalty for guessing", "They subtract points", "They are skipped from scoring", "They count as correct"],
      answer: 0,
      explain: "Unanswered questions are scored incorrect and wrong answers carry no penalty, so always answer.",
    },
    {
      kind: "mcq",
      q: "What does a compensatory scoring model mean?",
      options: [
        "You need to pass the exam overall, not each domain",
        "You must pass each domain separately",
        "Domains are weighted equally",
        "Wrong answers are compensated with partial credit",
      ],
      answer: 0,
      explain: "Strong performance in one domain can offset weakness in another; only the overall scaled score of 750 matters.",
    },
    {
      kind: "mcq",
      q: "Which of these is the best way to learn Transit Gateway route-table behaviour?",
      options: [
        "Build attachments and inspect association and propagation in a sandbox",
        "Memorise the service quotas page",
        "Only read whitepapers",
        "Skip it because it is rarely tested",
      ],
      answer: 0,
      explain: "Routing questions require tracing a packet through association and propagation; hands-on practice makes this concrete.",
    },
    {
      kind: "text",
      q: "What is the minimum passing scaled score on ANS-C01?",
      format: "***",
      accept: ["750"],
      explain: "Results are reported on a scale of 100 to 1,000 and 750 is the minimum passing score.",
    },
  ],
};

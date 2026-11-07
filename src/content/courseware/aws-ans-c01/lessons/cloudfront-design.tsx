import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Explain how CloudFront caches content through edge locations and regional edge caches",
    "Design origins, behaviors, cache policies and origin groups for a global workload",
    "Lock down origins so users cannot bypass CloudFront (OAC, VPC origins, custom headers, prefix list)",
    "Integrate CloudFront with ALB, S3, API Gateway and AWS WAF",
    "Choose between Lambda@Edge, CloudFront Functions, signed URLs and field-level encryption",
  ],
  tasks: [
    {
      id: "how",
      title: "How CloudFront serves a request",
      body: (
        <>
          <p>
            Amazon CloudFront is a content delivery network (CDN). DNS routes a viewer to a nearby
            <strong> edge location</strong>. On a cache hit the object is returned immediately. On a
            miss the edge asks a <strong>regional edge cache</strong>, then, if still missing, the{" "}
            <strong>origin</strong>. Traffic between CloudFront and the origin travels over the AWS
            backbone, which is usually faster and more consistent than the public internet, and
            connections to the origin are reused.
          </p>
          <Figure caption="Cache hierarchy. A hit at the edge never touches the origin; Origin Shield adds one more consolidating cache in front of the origin.">
            <Graph
              label="CloudFront request flow: viewer, edge location, regional edge cache, optional origin shield, origin"
              cellW={170}
              cellH={96}
              nodeW={140}
              nodes={[
                { id: "v", label: "Viewer", col: 0, row: 0, tone: "sky", shape: "pill" },
                { id: "e", label: "Edge location", sub: "cache hit returns here", col: 1, row: 0, tone: "lime" },
                { id: "r", label: "Regional edge cache", col: 2, row: 0, tone: "lime" },
                { id: "s", label: "Origin Shield", sub: "optional", col: 3, row: 0, tone: "amber" },
                { id: "o", label: "Origin", sub: "S3, ALB, custom", col: 4, row: 0, tone: "plain" },
              ]}
              edges={[
                { from: "v", to: "e" },
                { from: "e", to: "r", label: "miss" },
                { from: "r", to: "s", label: "miss" },
                { from: "s", to: "o", label: "miss" },
              ]}
            />
          </Figure>
          <p>
            The exam focus is design: what to cache, what to forward, how to protect the origin, and
            how to keep hit ratio high. Cache behavior is governed by the <strong>cache policy</strong>{" "}
            (TTLs and which headers, cookies and query strings form the cache key) and the{" "}
            <strong>origin request policy</strong> (what extra values are sent to the origin without
            being part of the cache key). Keep the cache key minimal: every extra value fragments the
            cache and lowers the hit ratio.
          </p>
        </>
      ),
    },
    {
      id: "origins",
      title: "Origins, behaviors and failover",
      body: (
        <>
          <p>
            A distribution has one or more origins and path-pattern <strong>behaviors</strong> that
            map requests to origins: for example <code>/static/*</code> to S3, <code>/api/*</code> to
            API Gateway, default to an ALB. Each behavior has its own viewer protocol policy, cache
            policy, allowed methods and function associations.
          </p>
          <Table
            head={["Capability", "What it does", "Use when"]}
            rows={[
              ["Origin group", "Primary and secondary origin; fails over on selected HTTP status codes or timeouts", "Resilient reads, S3 in two Regions"],
              ["Origin Shield", "Extra centralized cache layer in a chosen Region to cut origin load", "Many edge locations, expensive origin"],
              ["Price class", "Limit to cheaper edge regions", "Cost-sensitive, regional audience"],
              ["Geo restriction", "Allow or block by country", "Licensing or compliance"],
              ["Signed URLs / cookies", "Time-limited access to private content", "Paid media, per-user downloads"],
              ["Field-level encryption", "Encrypt specific POST fields at the edge with a public key", "Protect sensitive form fields end to end"],
              ["Custom SSL certificate", "Your domain over HTTPS; certificate in ACM in us-east-1; SNI recommended", "Use your own domain names"],
            ]}
          />
          <Callout tone="note" title="Edge compute">
            <strong>CloudFront Functions</strong> are lightweight JavaScript run at edge locations
            for viewer request/response tasks (URL rewrites, header manipulation, simple auth) with
            sub-millisecond start. <strong>Lambda@Edge</strong> runs at regional edge caches, supports
            viewer and origin events, longer execution and network calls. Pick the cheapest tool that
            fits.
          </Callout>
        </>
      ),
    },
    {
      id: "lockdown",
      title: "Forcing traffic through CloudFront",
      body: (
        <>
          <p>
            A frequent exam theme: viewers must reach content <em>only</em> through CloudFront (so
            AWS WAF, geo rules and caching cannot be bypassed). The mechanism depends on the origin:
          </p>
          <Figure caption="Protecting each origin type. Each layer removes the direct-to-origin path.">
            <Layers
              layers={[
                { title: "S3 origin", note: "Origin access control (OAC): bucket policy allows only the CloudFront service principal for that distribution. Block public access stays on.", tone: "lime" },
                { title: "ALB / NLB / EC2 in private subnets", note: "CloudFront VPC origins keep the origin private with no public IP, reached through a service-managed ENI.", tone: "lime" },
                { title: "Public ALB or custom origin", note: "Allow the AWS-managed prefix list for CloudFront origin-facing IPs in the security group, plus a secret custom header the origin verifies (rotate it).", tone: "sky" },
                { title: "API Gateway", note: "Use an edge-optimized or regional endpoint with a CloudFront-added header or API key; resource policy or WAF for validation.", tone: "amber" },
                { title: "Viewer side", note: "HTTPS only (redirect HTTP), TLS 1.2+ security policy, AWS WAF web ACL attached to the distribution.", tone: "plain" },
              ]}
            />
          </Figure>
          <p>
            Remember the scope of AWS WAF on CloudFront: the web ACL is a <em>global</em> resource
            created in <strong>us-east-1</strong>. The same applies to ACM certificates used by
            CloudFront. For origin-to-viewer encryption, set the origin protocol policy to HTTPS only
            and use a valid certificate on the origin.
          </p>
        </>
      ),
    },
    {
      id: "dynamic",
      title: "Dynamic content, APIs and logging",
      body: (
        <>
          <p>
            CloudFront also accelerates non-cacheable traffic: it terminates the TCP/TLS handshake
            close to the viewer, then reuses persistent connections to the origin. Set a cache policy
            with a TTL of zero (or use the managed <em>CachingDisabled</em> policy) for dynamic
            paths, and allow all HTTP methods where needed. WebSockets and HTTP/3 are supported.
          </p>
          <ul>
            <li><strong>Standard logs</strong> go to S3 and are delayed; <strong>real-time logs</strong> go to Kinesis Data Streams in seconds with selectable fields.</li>
            <li><strong>Metrics</strong> in CloudWatch (us-east-1) include requests, bytes, 4xx and 5xx rates; additional metrics add cache hit rate and origin latency.</li>
            <li>Use <strong>custom error pages</strong> and <strong>error caching minimum TTL</strong> to protect the origin during failures.</li>
          </ul>
          <Exercise
            title="Design check"
            task={<p>A gaming company serves a launcher app. Downloads (large, static) come from S3; login calls (dynamic) go to an ALB in one Region. Users complain about slow logins in Asia. Origin servers must not be reachable directly. What do you recommend?</p>}
          >
            <p>
              One CloudFront distribution with two behaviors: a cached <code>/downloads/*</code>{" "}
              behavior to S3 via OAC, and a dynamic <code>/login/*</code> behavior to the ALB with
              caching disabled and all needed methods. Use a VPC origin (or the CloudFront prefix list
              plus a secret header) so the ALB is not reachable directly, and attach AWS WAF. Dynamic
              requests still gain from edge TLS termination and the backbone path. If login latency
              remains high, consider also adding a second origin Region with latency-based routing
              behind the ALB or evaluate Global Accelerator for non-HTTP traffic.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Edge location, regional edge cache, optional Origin Shield, then origin; keep the cache key minimal for a high hit ratio.",
    "Use OAC for S3 and VPC origins or prefix list plus custom header for load balancer origins so CloudFront cannot be bypassed.",
    "Origin groups give origin failover; signed URLs/cookies protect private content; field-level encryption protects specific fields.",
    "WAF web ACLs and ACM certificates for CloudFront live in us-east-1.",
    "CloudFront Functions for light viewer logic; Lambda@Edge for heavier or origin-side logic.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How do you ensure an S3 origin can only be read through CloudFront?",
      options: [
        "Use origin access control and a bucket policy for the distribution",
        "Make the bucket public",
        "Use a security group on the bucket",
        "Enable S3 Transfer Acceleration",
      ],
      answer: 0,
      explain: "OAC lets the CloudFront service principal read the bucket while public access stays blocked.",
    },
    {
      kind: "mcq",
      q: "Where must the ACM certificate for a CloudFront custom domain be requested?",
      options: ["us-east-1", "The Region of the origin", "eu-west-1", "Any Region"],
      answer: 0,
      explain: "CloudFront can only use ACM certificates from US East (N. Virginia).",
    },
    {
      kind: "mcq",
      q: "Which feature provides origin failover?",
      options: ["Origin groups", "Price classes", "Geo restriction", "Origin request policy"],
      answer: 0,
      explain: "An origin group has a primary and secondary origin and fails over on configured status codes.",
    },
    {
      kind: "mcq",
      q: "Which is best for a simple URL rewrite executed at every viewer request with the lowest latency and cost?",
      options: ["CloudFront Functions", "Lambda@Edge origin request", "An EC2 proxy", "API Gateway"],
      answer: 0,
      explain: "CloudFront Functions run at the edge with very low overhead for lightweight viewer events.",
    },
    {
      kind: "mcq",
      q: "A public ALB origin must accept traffic only from CloudFront. Which combination is recommended?",
      options: [
        "Security group allowing the CloudFront origin-facing prefix list plus a secret custom header check",
        "Allow 0.0.0.0/0 on port 443",
        "Use an internet gateway route only",
        "Disable HTTPS on the origin",
      ],
      answer: 0,
      explain: "The managed prefix list limits network sources, and the secret header ensures requests came from your distribution.",
    },
  ],
};

import { ACCOUNT } from "../kit/builder";
import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 24,
  difficulty: "Medium",
  context: "Smart factories, connected vehicles, energy meters, cold-chain logistics, wearables and building sensors.",
  objectives: [
    "Describe the device, edge, ingestion, hot path and cold path of an IoT system",
    "Explain per-device identity and why shared credentials are dangerous",
    "Separate real-time alerting from long-term analytics",
    "Map the pattern to the four clouds",
  ],
  problem: [
    "A cold-chain company has 40,000 refrigerated trucks. Each sends temperature and location every ten seconds. If a load warms up, someone must be alerted within a minute; the same data must also feed monthly compliance reports and route optimisation.",
    "Devices are unreliable, networks drop, and a single leaked password could expose every vehicle. The architecture has to handle intermittent connectivity, millions of messages and per-device trust.",
  ],
  diagramTitle: "IoT telemetry pipeline with hot and cold paths",
  arch: {
    width: 960,
    height: 470,
    groups: [
      { id: "site", kind: "private", x: 20, y: 160, w: 235, h: 150, label: "Site: truck, factory or home", step: 1 },
      { id: "acct", kind: "region", x: 270, y: 20, w: 670, h: 430, label: ACCOUNT, step: 3 },
    ],
    nodes: [
      { id: "dev", svc: "device", x: 65, y: 235, step: 1, label: "Sensors" },
      { id: "edge", svc: "edgeiot", x: 195, y: 235, step: 2, label: "Edge gateway" },
      { id: "iot", svc: "iot", x: 345, y: 235, step: 3 },
      { id: "stream", svc: "stream", x: 495, y: 235, step: 4, label: "Telemetry stream" },
      { id: "fn", svc: "fn", x: 650, y: 110, step: 5, label: "Rules and alert function" },
      { id: "state", svc: "nosql", x: 790, y: 110, step: 5, label: "Latest device state" },
      { id: "notify", svc: "notify", x: 890, y: 235, step: 5, label: "Alerts to on-call" },
      { id: "lake", svc: "lake", x: 650, y: 370, step: 6, label: "History in the lake" },
      { id: "dwh", svc: "dwh", x: 790, y: 370, step: 6 },
      { id: "bi", svc: "bi", x: 910, y: 370, step: 6 },
    ],
    edges: [
      { from: "dev", to: "edge", step: 2, label: "local" },
      { from: "edge", to: "iot", step: 3, num: 1, label: "MQTT over TLS" },
      { from: "iot", to: "stream", step: 4, num: 2 },
      { from: "stream", to: "fn", step: 5, num: 3, elbow: "hv" },
      { from: "fn", to: "state", step: 5, num: 4 },
      { from: "fn", to: "notify", step: 5, num: 5, via: [[890, 50]], dashed: true, label: "threshold crossed" },
      { from: "stream", to: "lake", step: 6, via: [[495, 370]] },
      { from: "lake", to: "dwh", step: 6 },
      { from: "dwh", to: "bi", step: 6 },
    ],
    steps: [
      {
        title: "Start with the devices",
        body: "Sensors measure and send small messages. They have tiny CPUs, patchy networks and a life of years, so everything downstream must tolerate silence, duplicates and late data.",
        points: ["Include a device timestamp and sequence number in every message.", "Decide the message rate with cost in mind: 10 seconds versus 10 minutes is a hundredfold difference at scale."],
        per: {
          aws: "AWS: devices can use the AWS IoT Device SDK, with FreeRTOS for microcontrollers.",
          azure: "Azure: devices use the Azure IoT Device SDK, with Azure RTOS or Azure Sphere for constrained hardware.",
          gcp: "Google Cloud: IoT Core was retired in 2023; devices now publish through MQTT brokers from partners, or directly to Pub/Sub over HTTPS.",
          oci: "OCI: devices connect through the IoT Platform or any MQTT or HTTPS gateway you run.",
        },
      },
      {
        title: "Add an edge gateway",
        body: "A gateway at the site buffers messages when the link drops, filters noise and can run rules locally so a cut cable does not blind you.",
        points: ["Store and forward: keep data on disk until the cloud acknowledges it.", "Send only what matters: aggregate or sample at the edge to save bandwidth."],
        per: {
          aws: "AWS: IoT Greengrass runs Lambda functions and containers on the gateway.",
          azure: "Azure: IoT Edge runs containers and Azure Functions on the gateway.",
          gcp: "Google Cloud: run your own container on a gateway using GKE Enterprise or a plain Linux host with the Pub/Sub client.",
          oci: "OCI: run a container-based gateway on a small compute device; OCI IoT Platform can manage it.",
        },
      },
      {
        title: "Ingest securely",
        body: "A managed IoT service speaks MQTT, authenticates every device and applies per-device permissions. Each device has its own identity, so one stolen device can be revoked alone.",
        points: ["Give every device its own X.509 certificate, never a shared password.", "Scope each device's policy to its own topics so it cannot read or write another device's data."],
        per: {
          aws: "AWS: IoT Core with certificates and IoT policies; fleet provisioning enrols devices at first boot.",
          azure: "Azure: IoT Hub with per-device identities and the Device Provisioning Service.",
          gcp: "Google Cloud: authenticate to Pub/Sub with a per-device service account or workload identity, or use a partner IoT platform.",
          oci: "OCI: the IoT Platform with per-device credentials and an IoT domain.",
        },
      },
      {
        title: "Buffer in a stream",
        body: "A stream absorbs spikes and lets several consumers read the same messages: the alert logic now, the archive later, new analytics tomorrow.",
        points: ["Partition by device ID to keep one device's messages in order.", "Set retention long enough to recover from a consumer outage."],
        per: {
          aws: "AWS: IoT Core rules route to Kinesis Data Streams or Data Firehose.",
          azure: "Azure: IoT Hub exposes an Event Hubs-compatible endpoint, or routes to Event Hubs.",
          gcp: "Google Cloud: Pub/Sub topics, optionally with Dataflow for stream processing.",
          oci: "OCI: Streaming (Kafka-compatible) receives messages from the IoT Platform or gateways.",
        },
      },
      {
        title: "Hot path: act within seconds",
        body: "A small function evaluates each reading against rules, writes the latest state for dashboards and raises an alert when a threshold is crossed.",
        points: ["Alert on 'no data for N minutes' as well as bad values: a dead sensor looks like silence.", "Debounce alerts so one wobble does not page someone twenty times."],
        per: {
          aws: "AWS: Lambda reads from Kinesis, writes to DynamoDB and publishes to SNS.",
          azure: "Azure: Stream Analytics or Functions read from Event Hubs, write to Cosmos DB and notify through Action Groups.",
          gcp: "Google Cloud: Cloud Functions or Dataflow read from Pub/Sub, write to Firestore or Bigtable and alert via Cloud Monitoring.",
          oci: "OCI: Functions read from Streaming, write to NoSQL Database and notify through the Notifications service.",
        },
      },
      {
        title: "Cold path: keep history",
        body: "The same stream also lands in cheap storage and a warehouse for trend analysis, compliance reports and model training.",
        points: ["Store in columnar files partitioned by date and device group.", "Keep raw data long enough for audit; downsample older data to save money."],
        per: {
          aws: "AWS: Firehose to S3, queried with Athena or Redshift, visualised in QuickSight.",
          azure: "Azure: Event Hubs Capture or Stream Analytics to Data Lake, queried in Synapse, shown in Power BI.",
          gcp: "Google Cloud: Pub/Sub to BigQuery with a subscription, shown in Looker.",
          oci: "OCI: Streaming to Object Storage through a connector, queried in Autonomous Data Warehouse.",
        },
      },
    ],
  },
  notes: {
    aws: ["AWS IoT Core's rules engine can route, transform and fan out messages without code, which is often all the hot path needs.", "Device Shadow stores the last reported and desired state, so apps can read a device that is currently offline."],
    azure: ["IoT Hub's device twins keep desired and reported properties and support cloud-to-device messages and direct methods.", "IoT Central is a managed application platform on top of IoT Hub if you want dashboards without building them."],
    gcp: ["Google retired Cloud IoT Core in August 2023. New designs publish to Pub/Sub directly or use a partner device-management platform, so check current guidance before committing.", "Bigtable suits very high write rates for time series; BigQuery suits analysis."],
    oci: ["OCI's IoT Platform offers digital twins and device models; confirm current regional availability.", "Many OCI IoT designs use an MQTT broker you run plus Streaming, because the managed portfolio is smaller than on other clouds."],
  },
  decisions: [
    { title: "Hot and cold paths", text: "Act on fresh data quickly with a small cheap path, and keep everything for analysis on a separate path. Do not make one system do both." },
    { title: "Per-device identity", text: "A shared key means one leaked device compromises the fleet. Give each device its own certificate and revoke individually." },
    { title: "Late and duplicate data", text: "Use device timestamps and de-duplicate on device ID plus sequence number; do not trust arrival order." },
    { title: "Over-the-air updates", text: "Plan firmware updates from the start: signed images, staged rollout and rollback, or you will own an unpatchable fleet." },
  ],
  exercise: {
    title: "A thousand trucks go quiet",
    task: "At 3 a.m. one region's trucks stop reporting, but no threshold alerts fire. Why, and how would you have caught it?",
    answer: [
      "Threshold rules only run when data arrives, so silence produces no alerts.",
      "Add 'no message from device or group for N minutes' alarms based on the latest-state table or ingestion metrics.",
      "Alarm on ingestion message count dropping below a baseline per region, which also catches an ingestion outage.",
      "The edge gateway's store-and-forward buffer means data is not lost, but you still need to know the link is down.",
    ],
  },
  takeaways: [
    "Devices, edge gateway, secure ingestion, a stream, a hot path and a cold path are the standard IoT shape.",
    "Give every device its own identity and least-privilege policy.",
    "Buffer at the edge and in a stream; assume duplicate, late and missing data.",
    "Alert on silence as well as on bad values.",
    "Plan signed over-the-air updates from the first release.",
  ],
  quiz: [
    { kind: "mcq", q: "Why give each device its own certificate?", options: ["So a compromised device can be revoked without affecting the fleet", "To make messages smaller", "To speed up MQTT", "Because it is cheaper"], answer: 0, explain: "Per-device identity limits the blast radius and enables individual revocation." },
    { kind: "mcq", q: "What is the purpose of the edge gateway's store-and-forward behaviour?", options: ["Keep data during network outages and send it later", "Encrypt the database", "Reduce DNS lookups", "Replace the stream"], answer: 0, explain: "The gateway buffers messages until the cloud connection returns." },
    { kind: "mcq", q: "Which path should raise an alert within seconds?", options: ["The hot path", "The cold path", "The backup path", "The DNS path"], answer: 0, explain: "The hot path processes fresh data quickly; the cold path serves history and analytics." },
    { kind: "text", q: "Name the lightweight publish/subscribe protocol most IoT devices use (four letters).", format: "****", accept: ["mqtt"], explain: "MQTT is the standard lightweight messaging protocol for IoT." },
  ],
});

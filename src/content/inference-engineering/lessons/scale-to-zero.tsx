import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Calculate the savings from scaling a model to zero",
    "Choose an idle timeout using the break-even between staying warm and restarting",
    "Decide which workloads should and shouldn't scale to zero",
    "Configure scale-to-zero so the first request isn't lost",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A GPU costs the same whether it's busy or idle. If a model gets traffic for two hours
            a day, you're paying for 22 hours of nothing. Across dozens of rarely used models,
            that's a lot of money burned on waiting.
          </p>
          <p>
            <strong>Scale to zero</strong> means removing all replicas when a model is idle, and
            starting one when a request arrives. The GPU bill stops during the gap. The cost is
            that whoever arrives first has to wait through a full cold start.
          </p>
          <p>
            It's like parking a car. At a red light, you leave the engine on, as restarting isn't
            worth it for a short pause. When you're home for the night, you switch it off. Scale
            to zero is the same decision for a GPU, and the skill is knowing which kind of pause
            you're in.
          </p>
        </>
      ),
    },
    {
      id: "savings",
      title: "Worked example: the savings",
      body: (
        <>
          <p>
            Take one GPU replica at $3 per hour and a 30-day month. The rate is illustrative, and
            real prices vary by provider and change often.
          </p>
          <p>
            The model is used in 6 sessions a day, each 20 minutes long. After a session, the
            replica stays idle for 15 minutes in case more traffic arrives. Each session also
            starts with a 5-minute cold start, which you pay for.
          </p>
          <pre>
            <code>{`Always on:
  24 h × 30 days × $3            = $2,160 per month

Scale to zero:
  Per session: 20 + 15 + 5       = 40 billed minutes
  Per day:     6 × 40            = 240 minutes = 4 hours
  Per month:   4 h × 30 × $3     = $360 per month

Saving:        $2,160 − $360     = $1,800 (about 83%)`}</code>
          </pre>
          <p>
            Notice that only 2 of those 4 billed hours do useful work. The idle tail and the cold
            starts take up the rest. Scale to zero doesn't remove waste entirely, but it can reduce
            it a lot.
          </p>
        </>
      ),
    },
    {
      id: "idle-timeout",
      title: "Picking the idle timeout",
      body: (
        <>
          <p>
            How long should a replica wait before shutting down? Too short, and it restarts
            constantly. Too long, and it burns money. Thankfully, there's a clean way to think
            about it.
          </p>
          <p>
            If you shut down and restart, you pay for the cold start. If you stay up, you pay for
            the idle gap. So staying up is cheaper whenever the gap is shorter than the cold start:
          </p>
          <Formula>stay warm if idle gap &lt; billed cold start time</Formula>
          <p>
            You don't know how long the next gap will be, so use a simple rule: set the idle timeout
            close to the billed cold start time. With a 5-minute cold start, wait about 5 minutes.
            If traffic returns in that window, you've saved a restart. If it doesn't, the worst case
            costs you about 10 minutes of billing, compared to 5 minutes if you'd known the future.
            So this rule never costs more than about double the best possible choice.
          </p>
          <p>
            That rule only looks at dollars. User experience often pushes the timeout longer, as
            each restart means someone waits for minutes. If people use a model in clusters, lean
            toward a longer timeout during working hours.
          </p>
          <Callout tone="tip">
            Check your real gap lengths before you choose. Plot the time between requests for each
            model. If most gaps are 30 seconds or 3 hours, with little between them, almost any
            timeout from 1 to 30 minutes will behave about the same.
          </Callout>
        </>
      ),
    },
    {
      id: "fit",
      title: "Which workloads fit",
      body: (
        <>
          <Table
            head={["Workload", "Scale to zero?", "Why"]}
            rows={[
              ["Dev and staging models", "Yes", "Long idle periods, and a slow start is acceptable"],
              ["Internal tools", "Usually", "Users can tolerate a warming message"],
              ["Batch and async jobs", "Yes", "Nobody is watching a spinner"],
              ["Long-tail customer models", "Often", "Each is rarely used, and the savings add up"],
              ["Main chat product", "No", "Traffic is steady, and first-token targets are strict"],
              ["Voice agents", "No", "A live caller can't sit through a cold start"],
            ]}
          />
          <p>
            There's a middle ground: keep one replica warm at all times and scale up from there. You
            pay for a floor of capacity, but nobody gets a cold start. For many production models,
            a minimum of one or two is the right compromise.
          </p>
          <Callout tone="warn">
            Scaling to zero gives up your GPU. During a shortage, you may not get one back when you
            need it. If a model must be able to wake up reliably, hold the capacity through a
            reservation or a warm node pool. Then your saving will be smaller, but your start will
            be dependable.
          </Callout>
        </>
      ),
    },
    {
      id: "implementing",
      title: "Making it work",
      body: (
        <>
          <p>
            Something must stay awake to catch the first request, because no replica is running.
            That's usually your gateway, or a component such as the Knative activator. It holds the
            request, triggers a scale-up, and forwards it when a replica is ready.
          </p>
          <p>
            The standard Kubernetes autoscaler doesn't scale to zero by default, so teams commonly
            use KEDA, which does. Here's a <code>ScaledObject</code> driven by a Prometheus metric:
          </p>
          <pre>
            <code>{`apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: my-model
spec:
  scaleTargetRef:
    name: my-model
  minReplicaCount: 0
  maxReplicaCount: 5
  pollingInterval: 15
  cooldownPeriod: 300      # seconds idle before going to zero
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://prometheus.monitoring:9090
        query: sum(gateway_pending_requests{model="my-model"})
        threshold: "4"
        activationThreshold: "0"`}</code>
          </pre>
          <p>
            Look at where the metric comes from. <code>gateway_pending_requests</code> is an example
            name for a metric your gateway exposes. It has to come from the gateway, because engine
            metrics vanish when there are no engine pods left to report them. A signal that only
            exists while replicas are running can never wake one up.
          </p>
          <p>Then handle the first caller well:</p>
          <ul>
            <li>Make sure gateway and client timeouts are longer than the cold start.</li>
            <li>
              Or return <code>503</code> with a <code>Retry-After</code> header, and let the client
              poll.
            </li>
            <li>Show users a "warming up" message, so they don't assume it's broken.</li>
            <li>Pre-warm before known busy periods, such as the start of the working day.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Scale to zero stops GPU billing when idle, and the first caller pays with a cold start.",
    "Stay warm when the idle gap is shorter than the billed cold start.",
    "An idle timeout near the cold start time is a safe default on cost alone.",
    "It suits dev, batch and long-tail models, not strict real-time products.",
    "Wake-up metrics must come from outside the replicas, and timeouts must outlast cold starts.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A replica costs $2 per hour and bills 60 hours in a month. What is the monthly cost in dollars?",
      format: "***",
      accept: ["120", "$120"],
      explain: "60 × $2 = $120, compared with $1,440 for a 720-hour month of being always on.",
    },
    {
      kind: "mcq",
      q: "Why must a scale-to-zero trigger usually come from the gateway and not the engine?",
      options: [
        "Gateways are faster than engines",
        "Engine metrics don't exist when there are zero engine pods",
        "Engines can't export metrics",
        "KEDA only reads gateway logs",
      ],
      answer: 1,
      explain: "With no pods, nothing reports engine metrics, so the signal could never trigger a wake-up.",
    },
    {
      kind: "mcq",
      q: "Which workload is the worst fit for scale to zero?",
      options: [
        "A staging model used by the team",
        "An overnight batch job",
        "A live voice agent with steady calls",
        "A rarely used internal tool",
      ],
      answer: 2,
      explain: "A live caller can't wait through a cold start of several minutes.",
    },
    {
      kind: "text",
      q: "Billed cold start is 6 minutes. On cost alone, roughly how many minutes should the idle timeout be?",
      format: "*",
      accept: ["6"],
      explain: "Set the timeout close to the billed cold start time.",
    },
  ],
};

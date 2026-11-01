import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Estimate network delay from distance and see what it does to a stream",
    "Choose a region using both network delay and queue time",
    "Calculate the headroom each region needs to survive a failure",
    "Treat data residency as a hard limit on routing",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Your users are spread around the world, but your GPUs aren't. They're in the few regions
            where you could get them, and possibly with several providers. Each request now needs a
            decision: which region should serve this?
          </p>
          <p>
            Three goals pull on that decision. Users want low latency. The business wants the
            service to survive a region going down. Lawyers and customers want some data to stay
            inside certain borders.
          </p>
          <p>
            It's like a shipping company with several warehouses. Usually, the nearest warehouse
            sends the parcel. If it's out of stock, another one steps in. But some goods can't cross
            a border at all, no matter how empty the shelves are. Geo-aware load balancing applies
            those same rules, in that same order of strictness, to requests.
          </p>
        </>
      ),
    },
    {
      id: "physics",
      title: "How much distance really costs",
      body: (
        <>
          <p>
            Light in optical fiber travels at about 200,000 km per second, or 200 km per
            millisecond. That sets a floor no engineering can beat:
          </p>
          <Formula>minimum round trip (ms) = 2 × distance (km) ÷ 200</Formula>
          <p>
            Between two cities 13,000 km apart, that's 2 × 13,000 ÷ 200 = 130 ms. Real paths aren't
            straight and pass through routers, so measured times are higher.
          </p>
          <p>
            How much does that hurt? A new connection needs round trips for TCP and TLS before the
            prompt even arrives, so a cold connection adds about three round trips to the time to
            first token. Reusing connections removes most of that.
          </p>
          <p>
            But distance doesn't slow a stream once it's going. All tokens arrive late by the same
            amount, so the gap between them stays about the same. Far from the region, the response
            starts later and then flows normally.
          </p>
          <Callout tone="note">
            In many LLM products, queue time and prefill are much larger than network delay. Voice
            is an exception: in a live conversation, every 100 ms is noticeable, so region choice
            counts for more.
          </Callout>
        </>
      ),
    },
    {
      id: "score",
      title: "Nearest isn't always fastest",
      body: (
        <>
          <p>
            Compare two regions for a user. The numbers are illustrative.
          </p>
          <Table
            head={["Region", "Round trip", "Queue wait", "Total"]}
            rows={[
              ["Nearby, busy", "30 ms", "2,000 ms", "2,030 ms"],
              ["Far, quiet", "180 ms", "100 ms", "280 ms"],
            ]}
          />
          <p>
            The far region wins by a wide margin. A router that looks at geography alone will send
            traffic to a full region. A better one estimates the whole wait:
          </p>
          <Formula>region score = network round trip + estimated queue wait</Formula>
          <p>Traffic reaches a region through a few standard mechanisms:</p>
          <Table
            head={["Mechanism", "How it works", "Trade-off"]}
            rows={[
              ["DNS routing", "DNS returns a region based on where the client is, or on measured latency", "Clients cache answers, so changes are slow to take effect"],
              ["Anycast", "One IP address is announced from many places, and networks pick a near one", "Fast failover, but limited control over load"],
              ["Global L7 gateway", "An edge proxy ends the connection, then picks a region for each request", "Most control, but you run or rent the layer"],
            ]}
          />
          <p>
            Many systems combine them. Anycast or DNS gets users to a nearby edge, where a gateway
            makes a detailed decision per request using live capacity data.
          </p>
        </>
      ),
    },
    {
      id: "failover",
      title: "Surviving a region failure",
      body: (
        <>
          <p>
            Failover only works if the survivors can take the load. Say you've got 3 equal regions,
            each carrying 100 units at peak. When one fails, the other two share 300 units, so each
            needs to handle 150. Each region must therefore run at no more than two-thirds of its
            capacity in normal times.
          </p>
          <Formula>safe peak utilization = (regions − 1) ÷ regions</Formula>
          <Table
            head={["Regions", "Safe peak utilization", "Spare share"]}
            rows={[
              ["2", "50%", "50%"],
              ["3", "67%", "33%"],
              ["4", "75%", "25%"],
              ["5", "80%", "20%"],
            ]}
          />
          <p>
            More regions make each one more efficient, but they also add operating work, and your
            GPUs may be scarce in some of them.
          </p>
          <p>A failover plan also needs to handle these:</p>
          <ul>
            <li>
              <strong>Cascades:</strong> moving all traffic at once can overload the next region.
              Shift it in steps, and shed low-priority work first.
            </li>
            <li>
              <strong>In-flight streams:</strong> these usually can't move. The client must retry,
              ideally with an idempotency key so that it isn't billed twice.
            </li>
            <li>
              <strong>Cold prefix caches:</strong> traffic landing in a new region has no cached
              prefixes, so prefill takes longer and capacity drops just when you need it.
            </li>
            <li>
              <strong>Model parity:</strong> every region must host the same model version, or
              answers will change during failover.
            </li>
          </ul>
          <Callout tone="tip">
            An untested failover plan is only a theory. Drain a region on purpose during a calm
            period and watch what happens. It's much better to discover a gap then than during a
            real outage.
          </Callout>
        </>
      ),
    },
    {
      id: "residency",
      title: "Data residency comes first",
      body: (
        <>
          <p>
            <strong>Data residency</strong> means keeping data within a chosen location. This usually
            comes from a contract, a regulation or a customer's policy. It's a hard rule. A faster
            region doesn't matter if using it breaks a promise.
          </p>
          <p>So filter before you score. The order of the steps is the important part:</p>
          <pre>
            <code>{`def pick_region(request, regions):
    # 1. Hard rule: only regions this tenant allows.
    allowed = [r for r in regions if r.geo in request.tenant.allowed_geos]

    # 2. Only regions that are healthy and have room.
    usable = [r for r in allowed if r.healthy and r.has_capacity]
    if not usable:
        # Never widen 'allowed' to find capacity.
        raise NoCapacityError("no permitted region available")

    # 3. Best experience among what's left.
    return min(usable, key=lambda r: r.rtt_ms(request) + r.queue_wait_ms)`}</code>
          </pre>
          <p>
            The failure case is deliberate. If all EU regions are down, a request limited to the EU
            gets an error, not a quiet trip to another continent. So residency customers need at
            least two regions inside their boundary if they want real failover.
          </p>
          <Callout tone="warn">
            Residency covers more than the GPU that runs the request. Logs, traces, cached prompts,
            backups and support tools can all hold customer data. If your logs ship to a central
            region, a request can obey the routing rule and still break the promise.
          </Callout>
          <p>
            Rules differ by law, sector and contract, so involve your legal team in deciding what's
            required. Your job is to make the routing enforce those decisions reliably.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Fiber sets a floor of about 1 ms round trip per 100 km of distance.",
    "Distance delays the first token, not the gaps between tokens.",
    "Score regions on network delay plus queue wait, not on geography alone.",
    "With N equal regions, keep peak utilization under (N − 1) ÷ N to survive one failure.",
    "Apply residency as a filter before everything else, including during failover.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Two cities are 6,000 km apart in a straight fiber line. What's the minimum round trip, in milliseconds?",
      format: "**",
      accept: ["60", "60ms"],
      explain: "2 × 6,000 ÷ 200 = 60 ms.",
    },
    {
      kind: "text",
      q: "With 5 equal regions, what's the highest safe peak utilization to survive one region failing, as a percentage?",
      format: "**",
      accept: ["80", "80%"],
      explain: "(5 − 1) ÷ 5 = 80%.",
    },
    {
      kind: "mcq",
      q: "A user is farther from a region. What changes most in their streamed response?",
      options: [
        "Tokens arrive further apart",
        "The first token arrives later, and spacing stays about the same",
        "The model's output quality drops",
        "Throughput per GPU falls",
      ],
      answer: 1,
      explain: "Network delay shifts the whole stream by a roughly fixed amount.",
    },
    {
      kind: "mcq",
      q: "All permitted EU regions are down for an EU-only tenant, but a US region is healthy. What should the router do?",
      options: [
        "Send the request to the US region",
        "Return an error",
        "Send it to the US and delete logs later",
        "Pick a region at random",
      ],
      answer: 1,
      explain: "Residency is a hard rule, so failover must stay within the permitted boundary.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain why layered controls beat a single strong barrier",
    "Describe how segmentation limits the damage from one compromised machine",
    "State the core ideas of zero trust and how they differ from a perimeter model",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Every single control fails sometimes. Firewalls get misconfigured, passwords get
            guessed, patches arrive late, and people click links. If your whole security plan is
            one wall, the day that wall has a gap is the day everything is exposed.
          </p>
          <p>
            <strong>Defense in depth</strong> is the answer: use several independent layers so
            that an attacker who gets past one still faces the next. A medieval castle is the
            classic picture: moat, outer wall, inner wall, locked keep, and guards inside. None is
            perfect. Together they make attacking slow, noisy and costly.
          </p>
          <svg
            viewBox="0 0 520 220"
            role="img"
            aria-label="Concentric layers: policy and people, perimeter, network, host, application, data at the centre"
            className="mx-auto my-4 w-full max-w-xl"
          >
            <rect x="10" y="10" width="500" height="200" rx="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="50" y="35" width="420" height="150" rx="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="95" y="58" width="330" height="104" rx="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="140" y="80" width="240" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="260" y="27" textAnchor="middle" fontSize="12" fill="currentColor">Policy, training, physical</text>
            <text x="260" y="52" textAnchor="middle" fontSize="12" fill="currentColor">Perimeter and network</text>
            <text x="260" y="75" textAnchor="middle" fontSize="12" fill="currentColor">Host and application</text>
            <text x="260" y="115" textAnchor="middle" fontSize="13" fill="currentColor" fontWeight="bold">Data and identity</text>
          </svg>
        </>
      ),
    },
    {
      id: "layers",
      title: "The layers and what each one does",
      body: (
        <>
          <Table
            head={["Layer", "Example controls", "What it catches or limits"]}
            rows={[
              ["Policy and people", "Security training, acceptable-use rules, onboarding and offboarding", "Careless or malicious behaviour; unclear ownership"],
              ["Physical", "Locks, badges, cameras, visitor logs", "Walk-in theft or tampering with hardware"],
              ["Perimeter", "Firewall, email filtering, DDoS protection", "Unwanted traffic before it reaches your systems"],
              ["Network", "Segmentation, VLANs, internal firewalls, IDS", "Movement between systems after a first foothold"],
              ["Host", "Patching, hardening, endpoint protection, host firewall", "Exploits and malware on a single machine"],
              ["Application", "Input validation, authentication, secure coding", "Flaws in the software itself"],
              ["Data", "Encryption, access control, backups, classification", "Theft or loss even if everything else fails"],
            ]}
          />
          <p>
            Good layering mixes three kinds of control: <strong>preventive</strong> (stop it, like
            a firewall rule), <strong>detective</strong> (notice it, like log alerts) and{" "}
            <strong>corrective</strong> (recover, like restoring from backup). A stack of only
            preventive controls leaves you blind when one slips.
          </p>
        </>
      ),
    },
    {
      id: "layer-math",
      title: "Why layers multiply your odds",
      body: (
        <>
          <p>
            Suppose an attack has to pass each layer in turn, and each layer fails independently.
            Then the chance of getting through is the product of each layer&apos;s miss rate.
          </p>
          <Formula>P(get through) = miss rate 1 × miss rate 2 × miss rate 3 × ...</Formula>
          <pre>
            <code>{`Illustrative figures
Layer A stops 90% of attempts  -> misses 10% = 0.10
Layer B stops 80% of attempts  -> misses 20% = 0.20

Both layers: 0.10 x 0.20 = 0.02  -> 2% get through, 98% are stopped

Add a third layer that stops 90%:
0.10 x 0.20 x 0.10 = 0.002 -> 0.2% get through`}</code>
          </pre>
          <p>
            Two mediocre layers beat one good one, and that is the whole argument for depth.
          </p>
          <Callout tone="warn" title="Independence matters">
            The multiplication only works if the layers fail for different reasons. Three tools
            that all read the same signature feed, or three checks that all trust the same stolen
            password, share a weakness and fail together. Choose layers that rely on different
            mechanisms.
          </Callout>
        </>
      ),
    },
    {
      id: "segmentation",
      title: "Segmentation: stop one problem becoming everything",
      body: (
        <>
          <p>
            A flat network, where every machine can talk to every other, lets an intruder who owns
            one laptop reach the database. <strong>Segmentation</strong> splits the network into
            zones and allows only the traffic each zone really needs. Typical zones: user devices,
            web servers (often in a DMZ, a buffer zone facing the internet), application servers,
            databases, and management systems.
          </p>
          <p>
            Here is an illustrative host firewall policy for a database server on your own lab or
            private network. It drops everything by default, then allows replies, local traffic,
            and PostgreSQL (port 5432) only from the application subnet.
          </p>
          <pre>
            <code>{`table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iif "lo" accept
    ip saddr 10.0.20.0/24 tcp dport 5432 accept
    ip saddr 10.0.99.5 tcp dport 22 accept   # admin jump host only
  }
}`}</code>
          </pre>
          <p>
            Anything not listed is dropped: a compromised web server in another subnet cannot even
            try the database port. This is the <strong>deny by default</strong> idea. Allow-lists
            are safer than block-lists because new, unexpected things are blocked until someone
            decides otherwise.
          </p>
          <Callout tone="warn">
            Test firewall changes on systems you own, with console access in case you lock
            yourself out. Never apply rules to systems you are not authorised to manage.
          </Callout>
        </>
      ),
    },
    {
      id: "zero-trust",
      title: "Zero trust: no free passes for being inside",
      body: (
        <>
          <p>
            The older <em>castle-and-moat</em> model trusted anything inside the network and
            watched the edge. That broke as people started working from home, applications moved
            to the cloud and attackers learned that one phished laptop puts them inside the
            moat. <strong>Zero trust</strong> drops the idea that a network location earns trust.
            NIST describes the approach in SP 800-207, Zero Trust Architecture.
          </p>
          <Table
            head={["Principle", "In practice"]}
            rows={[
              ["Verify explicitly", "Check identity, device health and context on every access request, not once at the door"],
              ["Least privilege", "Give only the access needed, for only as long as needed"],
              ["Assume breach", "Design as if an attacker is already inside: segment, log everything, limit blast radius"],
              ["Protect resources, not locations", "Policy attaches to each application and data set, whatever network the user is on"],
            ]}
          />
          <Table
            head={["", "Perimeter model", "Zero trust"]}
            rows={[
              ["Trust is based on", "Being on the internal network", "Identity, device state and context, checked continually"],
              ["Inside traffic", "Mostly allowed", "Authenticated and authorised"],
              ["After a stolen laptop", "Attacker roams freely", "Attacker still faces per-resource checks"],
              ["Remote work", "VPN into the network", "Direct, policy-checked access to each app"],
            ]}
          />
          <Callout tone="note">
            Zero trust is a strategy, not a product. No single purchase makes you zero trust. It
            is built from strong identity and MFA, device checks, segmentation and good logging,
            introduced step by step, starting with your most sensitive systems.
          </Callout>
          <p>
            The two ideas fit together. Defense in depth says use many layers. Zero trust says
            make every layer verify, rather than assuming a visitor is friendly because they got
            past the previous one.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "No single control is perfect, so stack independent layers.",
    "Mix preventive, detective and corrective controls.",
    "Segmentation with deny-by-default rules limits how far one compromise can spread.",
    "Zero trust means verifying every request and assuming breach; location alone grants nothing.",
    "Layers only help if they fail for different reasons.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main goal of defense in depth?",
      options: [
        "Make one control so strong it never fails",
        "Ensure that when one control fails, others still protect the asset",
        "Remove the need for monitoring",
        "Trust anything inside the network",
      ],
      answer: 1,
      explain: "Layers give overlapping protection so a single failure is not fatal.",
    },
    {
      kind: "mcq",
      q: "Which statement best matches zero trust?",
      options: [
        "Traffic from the office network is trusted",
        "Trust is granted once at login and never rechecked",
        "Every access request is verified, whatever network it comes from",
        "A VPN makes a device fully trusted",
      ],
      answer: 2,
      explain: "Zero trust removes location-based trust and checks each request using identity, device and context.",
    },
    {
      kind: "text",
      q: "Two independent layers stop 90% and 80% of attacks. What percentage of attacks get through both?",
      format: "*",
      accept: ["2", "2%", "2 percent"],
      explain: "0.10 × 0.20 = 0.02, which is 2%.",
    },
    {
      kind: "text",
      q: "Which NIST Special Publication number describes Zero Trust Architecture? Give the number only.",
      format: "***",
      accept: ["800-207", "sp 800-207", "800207"],
      explain: "NIST SP 800-207 is Zero Trust Architecture.",
    },
  ],
};

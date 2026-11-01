import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Compare stateless packet filters, stateful firewalls, next-generation firewalls and web application firewalls",
    "Read a rule list and predict which rule matches a packet",
    "Write a default-deny host firewall policy for your own machine",
    "Use segmentation and a DMZ to limit how far an intruder can travel",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a flat network is one big blast radius",
      body: (
        <>
          <p>
            On a flat network every device can talk to every other device. If one laptop is
            infected, it can reach the file server, the database and the payroll system. Attackers
            count on this. Once inside, they move sideways until they find something valuable.
          </p>
          <p>
            A <strong>firewall</strong> is a control point that decides which traffic may pass
            between two networks or to a single host. Think of a building with locked doors between
            departments and a guard at each door with a list of who may enter. A thief who gets
            into the lobby still cannot walk straight into the safe room.
          </p>
          <p>
            Firewalls work on a short list of fields: source address, destination address,
            protocol, and port. Newer ones look deeper, at the application and the user.
          </p>
        </>
      ),
    },
    {
      id: "types",
      title: "Kinds of firewall",
      body: (
        <>
          <Table
            head={["Type", "What it looks at", "Strength", "Limit"]}
            rows={[
              ["Stateless packet filter", "Each packet alone: addresses, protocol, ports", "Fast and simple", "Does not know if a packet belongs to a real conversation"],
              ["Stateful firewall", "Packets plus a table of active connections", "Allows replies to outgoing requests automatically", "Does not understand the application"],
              ["Next-generation firewall (NGFW)", "Application, user identity, and often a built-in IPS", "Rules like 'block file sharing apps for guests'", "Heavier, needs tuning, may inspect encrypted traffic"],
              ["Web application firewall (WAF)", "HTTP requests to a web app", "Blocks known web attack patterns and can virtually patch", "Not a fix for the underlying bug"],
              ["Host-based firewall", "Traffic to and from one machine", "Protects the machine on any network", "Must be managed on every host"],
            ]}
          />
          <p>
            A stateful firewall is what most people mean today. When your laptop opens a connection
            out to a website, it records that connection. The reply is allowed back in because it
            matches the record. An unrelated packet arriving from the internet is dropped because it
            matches nothing.
          </p>
          <p>
            Other terms: <strong>proxy</strong> firewalls sit in the middle and make requests on
            behalf of users, so the client and server never talk directly. <strong>NAT</strong>{" "}
            hides internal addresses behind one public one. NAT is useful, but it is not a security
            control by itself.
          </p>
        </>
      ),
    },
    {
      id: "rules",
      title: "Reading and ordering rules",
      body: (
        <>
          <p>
            Rules are checked from top to bottom, and the <strong>first match wins</strong>. Most
            firewalls end with an <strong>implicit deny</strong>: anything not allowed is dropped.
            That is the safe default. Compare it with &quot;default allow&quot;, where you must
            remember to block every bad thing, and you will miss some.
          </p>
          <p>An illustrative rule list for an office with web servers in a screened network:</p>
          <Table
            head={["#", "Source", "Destination", "Port", "Action"]}
            rows={[
              ["1", "203.0.113.0/24", "any", "any", "Deny"],
              ["2", "any", "198.51.100.10 (web server)", "TCP 443", "Allow"],
              ["3", "192.168.10.0/24 (admins)", "198.51.100.10", "TCP 22", "Allow"],
              ["4", "192.168.20.0/24 (staff)", "any", "TCP 80, 443", "Allow"],
              ["5", "any", "any", "any", "Deny (implicit)"],
            ]}
          />
          <p>
            Test your understanding. A packet from <code>203.0.113.9</code> to the web server on
            TCP 443 matches rule 1 first (source is inside 203.0.113.0/24), so it is denied, even
            though rule 2 would have allowed it. A packet from a staff laptop to the web server on
            TCP 22 matches nothing until rule 5, so it is denied. Order matters, so put specific
            rules above general ones.
          </p>
          <Callout tone="tip">
            Write a reason next to each rule and review the list on a schedule. Old rules for
            projects that ended years ago are a common weakness. Also filter outgoing traffic
            (egress). Servers rarely need to browse the open internet, and blocking it can stop
            malware from calling home.
          </Callout>
        </>
      ),
    },
    {
      id: "host-firewall",
      title: "A default-deny host firewall you can try",
      body: (
        <>
          <p>
            Practise on your own lab VM. With <code>ufw</code> on Ubuntu or Debian, the policy is
            short:
          </p>
          <pre>
            <code>{`sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.50.0/24 to any port 22 proto tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose`}</code>
          </pre>
          <p>
            This drops everything inbound except SSH from your management subnet and HTTPS. The same
            idea in <code>nftables</code>:
          </p>
          <pre>
            <code>{`table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;

    ct state established,related accept   # replies to our own traffic
    iif "lo" accept                       # loopback
    ip saddr 192.168.50.0/24 tcp dport 22 accept
    tcp dport 443 accept
  }
}`}</code>
          </pre>
          <p>
            The line <code>policy drop</code> is the implicit deny. The <code>ct state</code> line is
            the stateful part: it lets in the replies that belong to connections the machine started.
          </p>
          <Callout tone="warn">
            If you are connected over SSH, enable the rule that allows your own session before you
            turn on default deny, or you will lock yourself out. Keep console access to the VM, and
            only run firewall commands on machines you own or administer with permission.
          </Callout>
        </>
      ),
    },
    {
      id: "segmentation",
      title: "Segmentation and the DMZ",
      body: (
        <>
          <p>
            <strong>Segmentation</strong> splits a network into zones with a firewall between
            them. Common tools are separate subnets, VLANs (virtual LANs on switches) and firewall
            zones. Typical zones: user devices, servers, databases, guests, and management.
          </p>
          <p>
            A <strong>DMZ</strong> (demilitarised zone, also called a screened subnet) holds
            servers that must be reachable from the internet, such as a web or mail server. The
            internet can reach the DMZ, the DMZ can reach only the few internal systems it needs, and
            the internet cannot reach the inside directly. If a DMZ server is compromised, the
            intruder is still outside the internal network.
          </p>
          <p>
            Subnet arithmetic helps you plan zones. A /24 holds 256 addresses, of which 254 are
            usable for hosts (the network and broadcast addresses are reserved):
          </p>
          <Formula>usable hosts = 2^(32 − prefix) − 2, so a /24 gives 2^8 − 2 = 254</Formula>
          <p>
            Splitting a 10.0.0.0/16 private block into /24 networks gives 2^(24 − 16) = 256 zones of
            254 hosts each. That is plenty of room to give servers, staff, guests and cameras
            separate subnets.
          </p>
          <p>
            Segmentation is the practical form of defence in depth and zero trust: do not assume a
            device is safe because it is on the inside. Allow only the flows a system needs, such as
            the web tier talking to the database on its one port.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A firewall decides which traffic may pass based on addresses, ports, connection state and sometimes the application.",
    "Stateful firewalls track connections, so replies to your own requests are allowed automatically.",
    "Rules run top to bottom, first match wins, and the safe default is to deny anything not allowed.",
    "A WAF protects web apps from known patterns but does not replace fixing the code.",
    "Segmentation and a DMZ limit how far an intruder can move after the first compromise.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A packet matches rule 3 (Allow) and also rule 6 (Deny). Which applies?",
      options: ["Rule 6, because it is later", "Rule 3, because the first match wins", "Neither, the packet is held for review", "Both are applied"],
      answer: 1,
      explain: "Firewalls process rules in order and stop at the first match.",
    },
    {
      kind: "mcq",
      q: "Which device inspects HTTP requests specifically to block web attack patterns?",
      options: ["Layer 2 switch", "Stateless packet filter", "NAT gateway", "Web application firewall"],
      answer: 3,
      explain: "A WAF understands HTTP and is built for web application traffic.",
    },
    {
      kind: "mcq",
      q: "Why put a public web server in a DMZ?",
      options: [
        "So that a compromise of that server does not give direct access to the internal network",
        "To make it faster",
        "So that it needs no patching",
        "To avoid using HTTPS",
      ],
      answer: 0,
      explain: "A DMZ keeps internet-facing servers separate from internal systems, so one breach stays contained.",
    },
    {
      kind: "text",
      q: "How many usable host addresses are in a /24 network?",
      format: "***",
      accept: ["254"],
      explain: "2^8 = 256 addresses, minus the network and broadcast addresses, gives 254.",
    },
    {
      kind: "text",
      q: "What one-word action should a firewall take by default for traffic that matches no rule? (Four letters.)",
      format: "****",
      accept: ["deny", "drop"],
      explain: "Default deny: only traffic that a rule explicitly allows gets through.",
    },
  ],
};

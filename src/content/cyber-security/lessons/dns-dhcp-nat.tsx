import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Walk through a DHCP lease and a DNS lookup step by step",
    "Explain how NAT and PAT share one public address among many hosts",
    "Describe how DNS, DHCP and NAT are abused, and what that looks like in logs",
    "Name the controls that protect each service",
  ],
  tasks: [
    {
      id: "problem",
      title: "Three helpers that make a network usable",
      body: (
        <>
          <p>
            Plug a laptop into a network and, within seconds, you can browse. Behind that, three
            services did quiet work. <strong>DHCP</strong> gave your laptop an address and told it
            where the router is. <strong>DNS</strong> turned a name like <code>www.example.com</code>{" "}
            into an IP address. <strong>NAT</strong> let your private address share one public
            address with everyone else in the building.
          </p>
          <p>
            Because every device uses them, and because they were designed in a more trusting era,
            they are attractive targets. An attacker who controls your DNS answers or your gateway
            controls where your traffic goes, without breaking any encryption.
          </p>
        </>
      ),
    },
    {
      id: "dhcp",
      title: "DHCP: handing out addresses",
      body: (
        <>
          <p>
            A new device has no address, so it cannot talk to a specific server. It shouts to
            everyone on the local network. The exchange is known as <strong>DORA</strong>:
          </p>
          <Table
            head={["Step", "Message", "Who sends it", "What it says"]}
            rows={[
              ["D", "Discover", "Client (broadcast)", "Is there a DHCP server out there?"],
              ["O", "Offer", "Server", "You may have 192.168.1.50 for 24 hours"],
              ["R", "Request", "Client (broadcast)", "I accept that offer"],
              ["A", "Acknowledge", "Server", "Confirmed; here are the mask, gateway and DNS servers"],
            ]}
          />
          <p>
            DHCP uses UDP. Servers listen on port 67 and clients use port 68. The address comes with
            a <strong>lease</strong>, a time limit. A client starts trying to renew at 50 percent of
            the lease (called T1) and, if that fails, tries any server at 87.5 percent (T2).
          </p>
          <Formula>24 h lease: renew at 0.5 × 24 = 12 h, rebind at 0.875 × 24 = 21 h</Formula>
          <p>
            DHCP trusts whoever answers first. Two abuses follow. A <strong>rogue DHCP server</strong>{" "}
            answers clients with its own gateway or DNS server, steering traffic through the
            attacker. A <strong>starvation</strong> attack requests addresses with many fake
            hardware addresses until the pool is empty, which sets up the rogue server or simply
            denies service.
          </p>
          <p>
            The standard fix is <strong>DHCP snooping</strong> on the switch. Ports are untrusted by
            default, and only ports facing the real server are trusted to send Offers. A sketch in
            Cisco-style syntax:
          </p>
          <pre>
            <code>{`ip dhcp snooping
ip dhcp snooping vlan 10
!
interface GigabitEthernet0/1
 description uplink to legitimate DHCP server
 ip dhcp snooping trust
!
interface range GigabitEthernet0/2 - 24
 ip dhcp snooping limit rate 15`}</code>
          </pre>
          <p>
            The rate limit also caps how fast a port can send DHCP messages, which slows starvation.
            In logs, watch for DHCP Offers from a source that is not your server.
          </p>
        </>
      ),
    },
    {
      id: "dns",
      title: "DNS: the internet's phone book",
      body: (
        <>
          <p>
            DNS maps names to data. When you type <code>www.example.com</code>, your machine asks a{" "}
            <strong>recursive resolver</strong> (from your ISP, company or a public service). If it
            does not already know, it asks a root server, which points to the servers for{" "}
            <code>.com</code>, which point to the <strong>authoritative</strong> server for{" "}
            <code>example.com</code>. The answer is cached for its <strong>TTL</strong> (time to
            live) in seconds. DNS normally uses UDP port 53, and TCP port 53 for large answers and
            zone transfers.
          </p>
          <Table
            head={["Record", "Holds", "Example use"]}
            rows={[
              ["A", "IPv4 address", "www.example.com points to 203.0.113.10"],
              ["AAAA", "IPv6 address", "Same, for IPv6"],
              ["CNAME", "Alias to another name", "blog points to a hosting provider's name"],
              ["MX", "Mail server for a domain", "Where to deliver mail for example.com"],
              ["NS", "Authoritative name servers", "Who answers for the zone"],
              ["TXT", "Free text", "SPF, DKIM and domain verification"],
              ["PTR", "Name for an address (reverse lookup)", "Log analysis and mail checks"],
            ]}
          />
          <p>You can query your own resolver from a terminal. Illustrative output:</p>
          <pre>
            <code>{`$ dig example.com A +noall +answer
example.com.    300    IN    A    203.0.113.10`}</code>
          </pre>
          <p>
            The 300 is the TTL. If the record changes, resolvers that cached it just before the
            change may keep the old answer for up to 300 seconds, which is 5 minutes.
          </p>
          <p>Common DNS abuses and their signs:</p>
          <ul>
            <li>
              <strong>Cache poisoning:</strong> a forged reply is accepted by a resolver, so users
              are sent to the wrong address. Resolvers defend with random transaction IDs and random
              source ports, and <strong>DNSSEC</strong> adds digital signatures so answers can be
              verified.
            </li>
            <li>
              <strong>DNS tunnelling:</strong> malware hides data inside query names, because
              DNS is often allowed out of networks. Each label can be up to 63 characters and a
              whole name up to 253, so a lot can be smuggled. Look for many long, random-looking
              subdomains under one domain, or unusually many TXT queries from one host.
            </li>
            <li>
              <strong>Subdomain takeover:</strong> a CNAME still points at a cloud service that has
              been deleted, so someone else can claim it. Audit your zone for dangling records.
            </li>
          </ul>
          <pre>
            <code>{`10:02:11 client 10.1.5.23 query a9f3k2x8q1v7m4n0b6c5d2e8f1g3h7j9.t.example.com TXT
10:02:11 client 10.1.5.23 query q2w8e4r6t1y7u3i9o5p0a4s8d2f6g1h3.t.example.com TXT
(illustrative: two long random labels, same parent domain, same host, same second)`}</code>
          </pre>
          <Callout tone="tip">
            Log every DNS query your resolver answers. It is one of the cheapest and most useful
            data sources in a security team: it shows which hosts contacted which names, even when
            the traffic itself was encrypted.
          </Callout>
        </>
      ),
    },
    {
      id: "nat",
      title: "NAT and PAT: sharing one public address",
      body: (
        <>
          <p>
            IPv4 addresses ran short, so homes and offices use private ranges inside and one or a
            few public addresses outside. <strong>NAT</strong> (Network Address Translation) on the
            router rewrites the source address of outgoing packets. The common form is{" "}
            <strong>PAT</strong> (port address translation), which also rewrites the source port so
            the router can tell replies apart.
          </p>
          <Table
            head={["Inside (private)", "Outside (public) as seen by the server", "Destination"]}
            rows={[
              ["192.168.1.10:51000", "203.0.113.5:40001", "198.51.100.7:443"],
              ["192.168.1.11:51000", "203.0.113.5:40002", "198.51.100.7:443"],
            ]}
          />
          <p>
            Two laptops used the same source port, but the router gave them different outside ports,
            so the reply to port 40002 goes back to .11. A port is a 16-bit number, so one public
            address has at most 65,535 ports to hand out, which limits how many connections it can
            carry to the same destination.
          </p>
          <Callout tone="warn">
            NAT is not a firewall. It blocks unsolicited inbound traffic as a side effect, because
            no mapping exists yet, but port forwarding opens a hole by design, and malware inside
            simply connects outwards. Run a real firewall in addition. When practising with DHCP
            starvation, rogue servers or DNS tunnelling, do it only in your own isolated lab
            network, never on a network you do not own or have written permission to test.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "DHCP follows Discover, Offer, Request, Acknowledge, and leases renew at 50 percent of their time.",
    "DNS answers are cached for their TTL, so changes and attacks both spread at that speed.",
    "PAT lets many private hosts share one public address by rewriting source ports.",
    "DHCP snooping, DNSSEC and DNS query logging are the key controls for these services.",
    "NAT hides addresses but is not a security boundary on its own.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Which UDP port does a DHCP server listen on?",
      format: "**",
      accept: ["67"],
      explain: "DHCP servers use UDP 67 and clients use UDP 68.",
    },
    {
      kind: "mcq",
      q: "Which DNS record type maps a name to an IPv6 address?",
      options: ["A", "MX", "CNAME", "AAAA"],
      answer: 3,
      explain: "AAAA holds an IPv6 address. A holds IPv4, MX names a mail server, CNAME is an alias.",
    },
    {
      kind: "mcq",
      q: "Which control stops a rogue DHCP server from handing out addresses on a switch port?",
      options: ["DHCP snooping", "Longer lease times", "A bigger address pool", "Disabling DNS"],
      answer: 0,
      explain: "DHCP snooping only trusts Offers from designated ports.",
    },
    {
      kind: "text",
      q: "In the DORA exchange, what does the first letter, D, stand for? One word.",
      format: "********",
      accept: ["discover"],
      explain: "The client broadcasts a Discover message to find DHCP servers.",
    },
  ],
};

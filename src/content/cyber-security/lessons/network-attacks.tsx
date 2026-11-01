import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain how spoofing, poisoning and man-in-the-middle attacks abuse trust in network protocols",
    "Describe how denial-of-service and amplification attacks overwhelm a target",
    "Match each attack to a defence and to the log evidence it leaves",
  ],
  tasks: [
    {
      id: "problem",
      title: "Networks run on trust",
      body: (
        <>
          <p>
            Core network protocols were built to be fast and simple. A device that asks "who has
            this address?" accepts the first answer. A switch learns addresses from whatever it
            sees. A DNS cache stores whatever looks like a valid reply. Network attacks abuse that
            default trust. The pattern is always the same: the attacker pretends to be something
            they are not, or floods something until it stops working.
          </p>
          <p>
            Defence follows the same pattern: add authentication where there was none, check
            claims against a trusted source, and limit how much any one sender can demand.
          </p>
          <Callout tone="warn">
            This lesson explains concepts and defences. Only test your own lab network or systems
            where you have written permission. Attacking a network you don't own is illegal.
          </Callout>
        </>
      ),
    },
    {
      id: "spoofing",
      title: "Spoofing and poisoning",
      body: (
        <>
          <p>
            <strong>Spoofing</strong> is forging an identity: a source IP, a MAC address, a sender
            name. <strong>Poisoning</strong> is planting false data in a table that other devices
            rely on.
          </p>
          <ul>
            <li>
              <strong>ARP poisoning:</strong> on a local network, ARP maps IP addresses to MAC
              addresses. A forged ARP reply can make neighbours send traffic for the gateway to the
              wrong machine. That puts an attacker in the middle.
            </li>
            <li>
              <strong>DNS cache poisoning:</strong> a resolver is tricked into storing a wrong
              answer, so everyone using it is sent to the wrong address.
            </li>
            <li>
              <strong>MAC flooding:</strong> filling a switch's address table so it falls back to
              sending frames out of every port.
            </li>
            <li>
              <strong>DHCP spoofing:</strong> a rogue DHCP server hands out a malicious gateway or
              DNS server.
            </li>
          </ul>
          <Table
            head={["Attack", "What it abuses", "Defence"]}
            rows={[
              ["ARP poisoning", "ARP accepts unsolicited replies", "Dynamic ARP inspection, static entries for key hosts"],
              ["DNS cache poisoning", "Resolver trusts forged answers", "DNSSEC validation, randomised ports and IDs, patched resolvers"],
              ["MAC flooding", "Finite switch table", "Port security limits per port"],
              ["DHCP spoofing", "First offer wins", "DHCP snooping, trusted ports only"],
              ["IP spoofing", "Source address isn't checked", "Ingress and egress filtering"],
            ]}
          />
          <p>
            On your own Linux lab machine, a sign of ARP trouble is one IP address suddenly
            mapped to a different MAC address than before, or two IPs sharing one MAC:
          </p>
          <pre>
            <code>{`ip neigh show
192.168.1.1  dev eth0 lladdr 02:00:5e:10:00:01 REACHABLE
192.168.1.77 dev eth0 lladdr 02:00:5e:10:00:01 REACHABLE   <- same MAC as the gateway`}</code>
          </pre>
          <p>
            Two addresses with one MAC is not always an attack (a router can legitimately answer
            for several), but it deserves a look. Managed switches can log the same thing.
          </p>
        </>
      ),
    },
    {
      id: "mitm",
      title: "Man-in-the-middle",
      body: (
        <>
          <p>
            In a man-in-the-middle (MITM) attack, the attacker sits between two parties and relays
            their traffic, reading or changing it. Poisoning, rogue Wi-Fi and compromised routers
            are common ways to get into that position. The attack only works usefully if the
            traffic is readable or the victim doesn't notice.
          </p>
          <p>
            That's why encryption with authentication is the main defence. With TLS, an attacker
            who relays traffic sees only ciphertext, and a fake server can't present a valid
            certificate for your site name. The user-side risks are clicking through certificate
            warnings and using protocols that are still unencrypted.
          </p>
          <ul>
            <li>Use HTTPS everywhere, with HSTS so browsers never try plain HTTP.</li>
            <li>Treat certificate warnings as a stop sign.</li>
            <li>Use a VPN on untrusted networks.</li>
            <li>Never reuse an unencrypted protocol for sensitive data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "dos",
      title: "Denial of service and amplification",
      body: (
        <>
          <p>
            A <strong>denial-of-service (DoS)</strong> attack tries to make a service unavailable.
            When it comes from many machines, usually a botnet, it's a <strong>distributed
            DoS (DDoS)</strong>. There are three broad families.
          </p>
          <Table
            head={["Family", "Target", "Example"]}
            rows={[
              ["Volumetric", "Bandwidth", "A flood of traffic that fills the link"],
              ["Protocol", "Connection tables", "SYN flood leaves half-open connections"],
              ["Application", "Expensive code paths", "Many requests to a slow search page"],
            ]}
          />
          <p>
            In a <strong>SYN flood</strong>, the attacker starts many TCP handshakes but never
            finishes them. The server keeps each half-open entry until it times out, and its queue
            fills. <strong>SYN cookies</strong> encode the state in the reply itself, so the server
            keeps nothing until the final step. On Linux you can check your own machine:
          </p>
          <pre>
            <code>{`sysctl net.ipv4.tcp_syncookies
net.ipv4.tcp_syncookies = 1`}</code>
          </pre>
          <p>
            <strong>Reflection and amplification</strong> use a third party. The attacker sends a
            small request with the victim's address forged as the source. A server answers with a
            much larger reply, aimed at the victim. Illustrative arithmetic: a 60-byte request
            that produces a 3,000-byte answer.
          </p>
          <Formula>amplification factor = 3,000 ÷ 60 = 50×</Formula>
          <p>
            So 10 Mbps of forged requests becomes about 500 Mbps hitting the victim. Defences
            include ingress filtering by providers (so forged sources are dropped), closing open
            services that answer anyone, rate limiting, and scrubbing or CDN services with more
            capacity than the attacker.
          </p>
        </>
      ),
    },
    {
      id: "wireless",
      title: "Wireless attacks",
      body: (
        <>
          <p>
            Wi-Fi shares the air, so anyone nearby can try to listen or impersonate.
          </p>
          <ul>
            <li>
              <strong>Evil twin / rogue access point:</strong> a fake network with a familiar name.
              Devices that auto-join it expose their traffic.
            </li>
            <li>
              <strong>Deauthentication:</strong> forged management frames kick clients off a
              network, often to push them onto a rogue one. Management frame protection (802.11w)
              reduces this.
            </li>
            <li>
              <strong>Weak keys and protocols:</strong> WEP is broken and WPA with TKIP is
              outdated. Use WPA2 with AES at the least, and WPA3 where devices support it.
            </li>
            <li>
              <strong>Shared passphrase risk:</strong> anyone who knows a personal-mode
              passphrase can be a threat inside the network. Use 802.1X with per-user credentials
              for organisations.
            </li>
          </ul>
          <p>
            For defenders, regularly scan your own premises for access points that aren't on your
            approved list. Unknown SSIDs broadcasting your company name are a red flag.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Many network attacks abuse default trust: ARP, DNS, DHCP and source addresses accept claims without proof.",
    "Spoofing forges identity; poisoning plants false entries; MITM relays traffic in between.",
    "TLS with certificate checking and HSTS is the main defence against MITM.",
    "DoS comes in volumetric, protocol and application forms; amplification multiplies the attacker's bandwidth.",
    "Switch features (DAI, DHCP snooping, port security), ingress filtering, SYN cookies and WPA3 or 802.1X are the key defences.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which defence directly protects against SYN flood exhaustion of the connection queue?",
      options: ["SYN cookies", "HSTS", "DNSSEC", "WPA3"],
      answer: 0,
      explain: "SYN cookies avoid storing state for half-open connections.",
    },
    {
      kind: "mcq",
      q: "What does DHCP snooping on a switch mainly prevent?",
      options: [
        "Slow DNS lookups",
        "Weak Wi-Fi passwords",
        "Packet loss",
        "Rogue DHCP servers handing out bad settings",
      ],
      answer: 3,
      explain: "Only ports marked trusted may send DHCP server replies.",
    },
    {
      kind: "text",
      q: "Which protocol maps IP addresses to MAC addresses on a local network? Give the acronym.",
      format: "***",
      accept: ["arp"],
      explain: "ARP, the Address Resolution Protocol, is the one poisoned in local MITM attacks.",
    },
    {
      kind: "text",
      q: "A 40-byte request produces a 2,000-byte reply. What is the amplification factor? Number only.",
      format: "**",
      accept: ["50", "50x"],
      explain: "2,000 ÷ 40 = 50.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Tell hubs, switches, routers, firewalls and other devices apart by what they decide on",
    "Explain VLANs, trunks and why they are used for segmentation",
    "Describe a DMZ and the traffic rules that go with it",
    "Compare common topologies and calculate links in a full mesh",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: connecting many machines safely",
      body: (
        <>
          <p>
            Two computers can be joined with one cable. A building of five hundred needs devices that
            decide where each piece of traffic goes. The choice of device decides what a network can
            see, what it can block, and how far trouble spreads when something goes wrong.
          </p>
          <Table
            head={["Device", "Layer", "Decides using", "Security relevance"]}
            rows={[
              ["Hub", "1", "Nothing; repeats to every port", "Everyone sees everything; obsolete"],
              ["Switch", "2", "Destination MAC address", "Port security, VLANs, 802.1X"],
              ["Router", "3", "Destination IP address", "ACLs, routing between segments"],
              ["Firewall", "3 to 7", "Addresses, ports, connection state, sometimes content", "Enforces policy between zones"],
              ["Wireless access point", "1 and 2", "Radio association and MAC", "Needs strong encryption and authentication"],
              ["Load balancer", "4 to 7", "Health and rules for a pool of servers", "Hides back-end servers; can end TLS"],
              ["Proxy", "7", "Application requests", "Filters and logs web use"],
              ["IDS / IPS", "2 to 7", "Traffic patterns and signatures", "Detects (IDS) or blocks (IPS) attacks"],
            ]}
          />
          <p>
            A <strong>hub</strong> is the cautionary tale. It copies every frame to every port, so any
            attached machine can read everyone else's traffic. Switches replaced hubs.
          </p>
        </>
      ),
    },
    {
      id: "switching",
      title: "Switches, MAC tables and where they can be fooled",
      body: (
        <>
          <p>
            A <strong>switch</strong> learns which MAC address sits behind which port by reading the
            source address of frames it receives. It stores this in a MAC address table. When a frame
            arrives, the switch looks up the destination and sends it out of one port only. If the
            destination is unknown, it floods the frame to all ports in the VLAN, then learns from the
            reply.
          </p>
          <p>
            This design assumes devices are honest, which leads to two abuses worth knowing at concept
            level:
          </p>
          <ul>
            <li>
              <strong>MAC flooding:</strong> an attacker sends frames with many forged source
              addresses to fill the table. A switch with a full table may flood unknown traffic out
              of all ports, so the attacker's port sees other people's frames.
            </li>
            <li>
              <strong>ARP spoofing:</strong> ARP maps IP addresses to MAC addresses and trusts any
              reply, so a host can falsely claim another's address and attract its traffic.
            </li>
          </ul>
          <p>
            Both are limited by switch features: port security caps the MAC addresses per port, and
            dynamic ARP inspection checks ARP replies against known bindings. Illustrative Cisco-style
            configuration for a user port and for unused ports:
          </p>
          <pre>
            <code>{`interface GigabitEthernet0/5
 switchport mode access
 switchport access vlan 10
 switchport nonegotiate
 switchport port-security
 switchport port-security maximum 2
 switchport port-security violation restrict
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface range GigabitEthernet0/20 - 24
 switchport access vlan 999
 shutdown`}</code>
          </pre>
          <p>
            Unused ports are shut down and parked in an isolated VLAN, so an unauthorised device
            plugged into a wall socket gets nothing. A violation shows up in the switch log. An
            illustrative line:
          </p>
          <pre>
            <code>{`%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address aaaa.bbbb.cccc on port GigabitEthernet0/5.`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "vlans",
      title: "VLANs and trunks",
      body: (
        <>
          <p>
            A <strong>VLAN</strong> (virtual LAN) splits one physical switch into several logical
            networks. Devices in VLAN 10 cannot talk directly to devices in VLAN 20, even on the
            same switch; they must go through a router or firewall, where rules apply. Each VLAN is
            also its own broadcast domain, so broadcast noise stays local.
          </p>
          <p>
            Between switches, a <strong>trunk</strong> link carries several VLANs at once. Under the
            802.1Q standard, a 4-byte tag inserted into the Ethernet frame names the VLAN. The VLAN ID
            has 12 bits.
          </p>
          <Formula>2^12 = 4,096 IDs, minus reserved 0 and 4095 = 4,094 usable VLANs</Formula>
          <p>
            <strong>VLAN hopping</strong> is an attack in which a device gets onto a VLAN it should not
            reach, either by tricking a switch port into negotiating a trunk or by abusing the untagged
            "native" VLAN on a trunk. The defences are plain configuration: set user ports explicitly
            to access mode, turn off trunk negotiation (<code>switchport nonegotiate</code>), use an
            unused VLAN as the native VLAN and allow only needed VLANs on each trunk.
          </p>
          <Callout tone="warn">
            Practise MAC flooding, ARP spoofing and VLAN hopping only on switches and virtual labs
            you own. Running them on a shared or corporate network can take it down and is
            unauthorised without written permission.
          </Callout>
        </>
      ),
    },
    {
      id: "dmz",
      title: "DMZ and network shapes",
      body: (
        <>
          <p>
            Some servers must be reachable from the internet: a website, a mail gateway. If one is
            compromised and sits in the same network as your databases and staff laptops, the intruder
            is already inside. The answer is a <strong>DMZ</strong> (demilitarised zone), also called a
            screened subnet: a separate segment for public-facing systems, with firewall rules on every
            edge.
          </p>
          <Table
            head={["From", "To", "Policy"]}
            rows={[
              ["Internet", "DMZ", "Allow only the needed service, such as TCP 443 to the web server"],
              ["Internet", "Internal LAN", "Deny"],
              ["DMZ", "Internal LAN", "Deny by default; allow one narrow flow, such as web server to database on one port"],
              ["Internal LAN", "DMZ", "Allow for administration, with logging"],
              ["Internal LAN", "Internet", "Allow selected services through a proxy"],
            ]}
          />
          <p>
            The logic is that the DMZ is assumed likely to be attacked, so it is never trusted by the
            inside. Now the physical or logical shape, the <strong>topology</strong>:
          </p>
          <Table
            head={["Topology", "Shape", "Strength", "Weakness"]}
            rows={[
              ["Bus", "All devices on one shared cable", "Cheap", "One break stops everyone; obsolete"],
              ["Star", "Every device connects to a central switch", "Easy to manage; one failure only affects one link", "The centre is a single point of failure"],
              ["Ring", "Each device connects to two neighbours", "Predictable paths", "A break can disrupt the ring unless it is dual"],
              ["Full mesh", "Every device connects to every other", "Highly resilient", "Cost grows quickly"],
              ["Hybrid", "Mix of the above", "Matches real needs", "More complex to document"],
            ]}
          />
          <p>The number of links in a full mesh of n nodes grows with the square of n:</p>
          <Formula>links = n × (n − 1) ÷ 2</Formula>
          <pre>
            <code>{`n = 6 nodes  ->  6 x 5 / 2 = 15 links
n = 10 nodes ->  10 x 9 / 2 = 45 links
A star of 6 devices around one switch needs only 6 links.`}</code>
          </pre>
          <p>
            That is why most offices use a star (or a tree of stars), with a partial mesh only where
            redundancy is worth the cost, such as between core switches.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Switches forward on MAC addresses, routers on IP addresses, and firewalls enforce policy between zones.",
    "Port security, DHCP snooping and ARP inspection harden a switch against forged identities.",
    "VLANs create separate broadcast domains and force traffic through a control point; 4,094 IDs are usable.",
    "A DMZ keeps public-facing servers away from the internal network, with narrow rules in each direction.",
    "Full mesh links equal n times n minus 1, divided by 2; star is the practical default.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A switch normally forwards a frame based on which value?",
      options: ["Destination MAC address", "Destination TCP port", "Hostname", "Source IP address"],
      answer: 0,
      explain: "Switches operate at layer 2 and use their MAC address table to pick the egress port.",
    },
    {
      kind: "mcq",
      q: "What is the main purpose of a DMZ?",
      options: [
        "To speed up the internal network",
        "To store encrypted backups",
        "To keep public-facing servers separate from the internal LAN",
        "To assign IP addresses",
      ],
      answer: 2,
      explain: "If a public server is compromised, the DMZ limits what the intruder can reach next.",
    },
    {
      kind: "text",
      q: "How many links does a full mesh of 5 nodes need?",
      format: "**",
      accept: ["10"],
      explain: "5 x 4 / 2 = 10.",
    },
    {
      kind: "text",
      q: "How many VLAN IDs are usable on an 802.1Q network (12-bit ID, with 0 and 4095 reserved)?",
      format: "****",
      accept: ["4094", "4,094"],
      explain: "2^12 = 4096, minus the two reserved values leaves 4094.",
    },
  ],
};

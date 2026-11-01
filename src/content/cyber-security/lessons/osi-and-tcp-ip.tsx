import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Name the seven OSI layers and the four TCP/IP layers, and map one onto the other",
    "Describe encapsulation and name the unit of data at each layer",
    "Work out how application data is split into segments and frames",
    "Place common security controls and attacks on the layer they work at",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem layers solve",
      body: (
        <>
          <p>
            Sending a web page from a server to your laptop involves cables or radio waves, hardware
            addresses, routing across many networks, reliable delivery, and finally an application
            that understands the data. Nobody builds one giant program that does all of that. The
            work is split into <strong>layers</strong>. Each layer does one job, talks only to the
            layer above and below it, and can be replaced without breaking the rest.
          </p>
          <p>
            Think of posting a parcel. You pack the item (the application), a courier company picks
            a service and tracking number (transport), a sorting office reads the address and picks
            the next hop (network), and a van drives one stretch of road (link). Each step ignores
            how the others work.
          </p>
          <p>
            For security this matters because every control and every attack lives at a specific
            layer. If you can say which layer something happens at, you know which tool can see it
            and which tool can stop it.
          </p>
        </>
      ),
    },
    {
      id: "models",
      title: "Two models, one idea",
      body: (
        <>
          <p>
            The <strong>OSI model</strong> (Open Systems Interconnection) has seven layers. It is a
            teaching and troubleshooting reference. The <strong>TCP/IP model</strong> has four
            layers and describes what the internet actually runs. Engineers use both: OSI numbers
            for conversation ("that's a layer 2 problem"), TCP/IP for how the protocols really
            behave.
          </p>
          <Table
            head={["OSI layer", "Name", "Job", "Examples", "TCP/IP layer"]}
            rows={[
              ["7", "Application", "Services the user's program talks to", "HTTP, DNS, SMTP, SSH", "Application"],
              ["6", "Presentation", "Encoding, compression, encryption format", "TLS record format, JPEG", "Application"],
              ["5", "Session", "Opens, keeps and closes conversations", "RPC sessions, NetBIOS", "Application"],
              ["4", "Transport", "End-to-end delivery, ports", "TCP, UDP", "Transport"],
              ["3", "Network", "Addressing and routing between networks", "IP, ICMP", "Internet"],
              ["2", "Data link", "Delivery on one local network, MAC addresses", "Ethernet, Wi-Fi, ARP", "Link"],
              ["1", "Physical", "Bits as signals on a medium", "Cable, fibre, radio", "Link"],
            ]}
          />
          <p>
            A common memory aid from layer 1 upward is "Please Do Not Throw Sausage Pizza Away":
            Physical, Data link, Network, Transport, Session, Presentation, Application.
          </p>
          <Callout tone="note">
            TLS does not fit neatly into one OSI layer. It sits above TCP and below the application
            protocol, so people place it at layer 5, 6 or 7 depending on who is drawing the diagram.
            Do not lose marks or sleep over it. Know what it does, not which box it lives in.
          </Callout>
        </>
      ),
    },
    {
      id: "encapsulation",
      title: "Encapsulation: wrapping data on the way down",
      body: (
        <>
          <p>
            When you send data, each layer adds its own <strong>header</strong> (and the link layer
            also a trailer) around what it received from above. This is <strong>encapsulation</strong>.
            The receiver reverses it, stripping one header per layer on the way up. The name for the
            chunk of data at each layer is the <strong>protocol data unit</strong> (PDU).
          </p>
          <Table
            head={["Layer", "PDU", "Header adds", "Typical header size"]}
            rows={[
              ["Application", "Data", "Protocol messages such as an HTTP request", "Varies"],
              ["Transport", "Segment (TCP) or datagram (UDP)", "Source and destination ports, sequence numbers", "TCP 20 bytes minimum, UDP 8 bytes"],
              ["Network", "Packet", "Source and destination IP addresses, TTL", "IPv4 20 bytes minimum"],
              ["Data link", "Frame", "Source and destination MAC addresses, checksum", "Ethernet header 14 bytes, trailer 4 bytes"],
              ["Physical", "Bits", "Nothing, just signals", "Not applicable"],
            ]}
          />
          <p>
            Worked example. A server replies with 3,000 bytes of HTTP data over Ethernet. A standard
            Ethernet frame carries at most 1,500 bytes of payload (the <strong>MTU</strong>, maximum
            transmission unit). Subtract the IPv4 and TCP headers to find how much data fits in each
            TCP segment, called the <strong>MSS</strong> (maximum segment size). This ignores TCP
            options, which shrink it slightly in real traffic.
          </p>
          <Formula>MSS = MTU − IP header − TCP header = 1500 − 20 − 20 = 1460 bytes</Formula>
          <pre>
            <code>{`3000 bytes of data
  segment 1: 1460 bytes   frame size = 1460 + 20 + 20 + 14 = 1514 bytes
  segment 2: 1460 bytes   frame size = 1514 bytes
  segment 3:   80 bytes   frame size = 80 + 20 + 20 + 14 = 134 bytes
  (1460 + 1460 + 80 = 3000)   Ethernet's 4-byte trailer not counted`}</code>
          </pre>
          <p>
            So three frames travel the wire, and the headers on a full frame take 54 of 1,514 bytes,
            about 3.6 percent. These sizes are the common defaults. Tunnels and VPNs add headers of
            their own and lower the usable MTU.
          </p>
        </>
      ),
    },
    {
      id: "controls",
      title: "Where controls and attacks sit",
      body: (
        <>
          <p>
            Defence in depth means putting a control at several layers, because an attacker who
            beats one layer should hit another. The table below pairs each layer with a typical
            attack idea and a typical control.
          </p>
          <Table
            head={["Layer", "What an attacker abuses", "Control that helps"]}
            rows={[
              ["1 Physical", "Unlocked cabinets, spare wall ports", "Locks, cameras, disabled unused ports"],
              ["2 Data link", "ARP trusts any reply, so a host can claim another host's address", "Port security, 802.1X, dynamic ARP inspection"],
              ["3 Network", "Forged source IP addresses", "Egress and ingress filtering, router ACLs, IPsec"],
              ["4 Transport", "SYN flood: many half-open TCP connections exhaust a server", "Stateful firewall, SYN cookies, rate limits"],
              ["5-7 Session to application", "Flaws in the application, such as unsanitised input", "WAF, input validation, TLS, patching"],
            ]}
          />
          <p>
            Each tool also has a layer. A switch reads MAC addresses (layer 2). A router and a basic
            packet filter read IP addresses (layer 3). A stateful firewall tracks TCP connections
            (layer 4). A web application firewall (WAF) reads HTTP requests (layer 7). A tool can only
            decide using the fields it can read, so a layer 3 filter cannot tell a normal web request
            from a malicious one on the same port.
          </p>
          <p>
            In logs, a layer 4 problem often looks like thousands of connections in the{" "}
            <code>SYN_RECV</code> state from many sources. A layer 2 problem often looks like a
            switch warning that one MAC address keeps moving between ports.
          </p>
          <Callout tone="tip">
            When troubleshooting, work bottom up. Is the cable or Wi-Fi link up (1)? Do you have a
            local address and can you reach the gateway (2 and 3)? Does the port answer (4)? Does the
            application respond (7)? Most "the network is down" reports are solved in the first three
            steps.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Layers split a hard problem into small jobs, so each control and each attack has a home layer.",
    "OSI has seven layers for teaching and troubleshooting; TCP/IP has four and is what runs the internet.",
    "Encapsulation adds a header per layer going down; PDUs are data, segment, packet, frame and bits.",
    "A security tool can only judge traffic by the fields at its own layer and below.",
    "Troubleshoot from the bottom up, and defend at several layers at once.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A router chooses where to send a packet using which value?",
      options: ["Source MAC address", "TCP port number", "Destination IP address", "Hostname"],
      answer: 2,
      explain: "Routers work at layer 3 and forward on the destination IP address.",
    },
    {
      kind: "mcq",
      q: "A web application firewall mainly inspects traffic at which layer?",
      options: ["Physical", "Data link", "Transport", "Application"],
      answer: 3,
      explain: "A WAF reads HTTP requests and responses, which are layer 7 data.",
    },
    {
      kind: "text",
      q: "What is the PDU at the transport layer called when TCP is used? One word.",
      format: "*******",
      accept: ["segment", "segments"],
      explain: "TCP data units are segments. UDP's are called datagrams.",
    },
    {
      kind: "text",
      q: "At which OSI layer number does a router operate?",
      format: "*",
      accept: ["3", "three", "layer 3"],
      explain: "Routers work at the network layer, layer 3.",
    },
  ],
};

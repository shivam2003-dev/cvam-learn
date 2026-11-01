import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Pick the right tool for a question: reachability, path, name, sockets, packets or open ports",
    "Read basic output from ping, traceroute, dig, ss, tcpdump and nmap",
    "Recognise a TCP handshake in a capture",
    "Describe what a port scan looks like to a defender, and use scanners only where permitted",
  ],
  tasks: [
    {
      id: "problem",
      title: "From \"it's broken\" to a specific answer",
      body: (
        <>
          <p>
            "The network is down" is not a diagnosis. Is the cable plugged in? Does the machine have
            an address? Can it find the name? Does the server answer on that port? Each question
            has a tool built to answer it. The same tools help a security analyst, who asks a
            different version: who is talking to this host, on which ports, and is that normal?
          </p>
          <Table
            head={["Tool", "Layer", "Question it answers", "Example"]}
            rows={[
              ["ping", "3", "Does the host answer at all, and how fast?", <code key="a">ping -c 4 127.0.0.1</code>],
              ["traceroute (tracert on Windows)", "3", "Which routers lie on the path?", <code key="b">traceroute example.com</code>],
              ["dig / nslookup", "7", "What does DNS say for this name?", <code key="c">dig example.com A +short</code>],
              ["ss (netstat on older systems)", "4", "Which ports is this machine listening on, and who is connected?", <code key="d">ss -tuln</code>],
              ["tcpdump / Wireshark", "2 to 7", "What exactly is on the wire?", <code key="e">sudo tcpdump -i lo -nn port 8080</code>],
              ["nmap", "4", "Which ports on a host respond?", <code key="f">nmap 127.0.0.1</code>],
            ]}
          />
          <p>
            Work in order from the bottom: own interface, then gateway, then name resolution, then
            the remote service. Stop at the first step that fails.
          </p>
        </>
      ),
    },
    {
      id: "reachability",
      title: "ping, traceroute and dig",
      body: (
        <>
          <p>
            <code>ping</code> sends ICMP echo requests and waits for echo replies. Pinging{" "}
            <code>127.0.0.1</code> tests only your own network stack. Illustrative result:
          </p>
          <pre>
            <code>{`$ ping -c 4 127.0.0.1
4 packets transmitted, 3 received, 25% packet loss`}</code>
          </pre>
          <Formula>loss % = (sent − received) ÷ sent × 100 = (4 − 3) ÷ 4 × 100 = 25%</Formula>
          <p>
            A missing reply does not prove a host is down. Many firewalls drop ICMP deliberately, so
            "no reply" can mean "blocked". Confirm with another test, such as connecting to a known
            port.
          </p>
          <p>
            <code>traceroute</code> relies on the <strong>TTL</strong> (time to live) field in the IP
            header. Every router subtracts one. When it reaches zero, the router drops the packet and
            sends back an ICMP "time exceeded" message that reveals its address. The tool sends
            packets with TTL 1, 2, 3 and so on, so each reply reveals the next hop. Starred lines
            (<code>* * *</code>) mean a hop did not answer, often because of filtering.
          </p>
          <p>
            <code>dig</code> asks DNS directly. Use <code>+short</code> for just the answer, or name
            a server with <code>@</code> to compare resolvers:
          </p>
          <pre>
            <code>{`dig example.com A +short
dig example.com MX
dig @127.0.0.1 example.com A     # ask a resolver running on this machine`}</code>
          </pre>
          <p>
            If <code>ping 203.0.113.10</code> works but <code>ping example.com</code> fails, the
            fault is in name resolution, not in the path. That one comparison narrows a long search.
          </p>
        </>
      ),
    },
    {
      id: "capture",
      title: "Packet capture with tcpdump and Wireshark",
      body: (
        <>
          <p>
            Sometimes you need to see the packets themselves. <strong>tcpdump</strong> is a
            command-line sniffer and <strong>Wireshark</strong> is a graphical one that decodes
            hundreds of protocols. Both read from a network interface. To try it safely, start a
            throwaway web server on your own machine and watch the loopback interface:
          </p>
          <pre>
            <code>{`# terminal 1: a local test server
python3 -m http.server 8080

# terminal 2: capture traffic to that port on loopback
sudo tcpdump -i lo -nn port 8080

# terminal 3: make one request
curl -s http://127.0.0.1:8080/ > /dev/null`}</code>
          </pre>
          <p>
            The loopback interface is named <code>lo</code> on Linux and <code>lo0</code> on macOS.
            The flag <code>-nn</code> stops tcpdump turning addresses and ports into names. The
            first three lines you will see are the TCP three-way handshake. Illustrative output:
          </p>
          <pre>
            <code>{`IP 127.0.0.1.52344 > 127.0.0.1.8080: Flags [S],  seq 1000, length 0
IP 127.0.0.1.8080 > 127.0.0.1.52344: Flags [S.], seq 2000, ack 1001, length 0
IP 127.0.0.1.52344 > 127.0.0.1.8080: Flags [.],  ack 2001, length 0`}</code>
          </pre>
          <Table
            head={["Flag shown", "Meaning"]}
            rows={[
              ["[S]", "SYN: client asks to open a connection"],
              ["[S.]", "SYN-ACK: server agrees"],
              ["[.]", "ACK: acknowledgement; the connection is established"],
              ["[P.]", "PSH-ACK: data is being pushed to the application"],
              ["[F.]", "FIN-ACK: orderly close"],
              ["[R] or [R.]", "RST: connection refused or aborted"],
            ]}
          />
          <p>
            Two kinds of filter exist. A <strong>capture filter</strong> (tcpdump syntax, called BPF)
            decides what is recorded, such as <code>port 8080</code>. A Wireshark{" "}
            <strong>display filter</strong> decides what is shown from what was recorded, such as{" "}
            <code>tcp.port == 8080</code>, <code>dns</code> or <code>http.request</code>. Save a
            capture with <code>-w capture.pcap</code> and open it later in Wireshark.
          </p>
          <Callout tone="warn">
            Captures can contain passwords, cookies and private messages. Only capture on networks
            and devices you own or are explicitly authorised to monitor, store the files securely
            and delete them when the work is done. Capturing other people's traffic without
            permission can be illegal.
          </Callout>
        </>
      ),
    },
    {
      id: "nmap",
      title: "nmap, used responsibly",
      body: (
        <>
          <p>
            <strong>nmap</strong> checks which ports on a host respond and can identify the service
            behind them. Defenders use it to audit their own estate and compare the result with what
            is meant to be exposed. Run against your own machine, using the loopback address:
          </p>
          <pre>
            <code>{`nmap 127.0.0.1
# illustrative output
PORT     STATE  SERVICE
22/tcp   open   ssh
8080/tcp open   http-proxy`}</code>
          </pre>
          <Table
            head={["State", "Meaning"]}
            rows={[
              ["open", "A program is listening and accepted the probe"],
              ["closed", "The host replied that nothing listens there (a reset)"],
              ["filtered", "No useful reply; a firewall is probably dropping the probe"],
              ["open|filtered", "nmap cannot tell which of the two applies"],
            ]}
          />
          <p>
            A TCP <em>connect</em> scan completes the full handshake and so appears in the target's
            application logs. A <em>SYN</em> scan stops after the second step and needs raised
            privileges. Either way, the pattern is easy for a defender to see, because a scanner
            touches many ports quickly. A simple detection idea, with an illustrative threshold:
          </p>
          <pre>
            <code>{`from collections import defaultdict

ports_by_src = defaultdict(set)
for src, dport in connection_attempts_last_minute:
    ports_by_src[src].add(dport)

for src, ports in ports_by_src.items():
    if len(ports) > 100:          # tune for your own network
        print(f"possible port scan from {src}: {len(ports)} distinct ports")`}</code>
          </pre>
          <Callout tone="warn">
            Scanning systems you do not own, or lack written permission to test, can break computer
            misuse laws and can disrupt services. Never scan third parties, even out of curiosity.
            Practise on your own lab VM, and for work, get the scope in writing first.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Use the tool that matches the question: ping for reachability, traceroute for path, dig for names, ss for sockets, tcpdump for packets, nmap for ports.",
    "Troubleshoot bottom up and stop at the first failing step; compare IP and name tests to isolate DNS faults.",
    "A TCP handshake looks like [S], then [S.], then [.] in tcpdump.",
    "Open, closed and filtered describe three different responses to a probe.",
    "Scan and capture only your own systems or ones you have written permission to test.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Which protocol does ping use? Give the four-letter acronym.",
      format: "****",
      accept: ["icmp"],
      explain: "Ping uses ICMP echo request and echo reply messages.",
    },
    {
      kind: "mcq",
      q: "An nmap probe gets no reply because a firewall silently drops it. Which state is reported?",
      options: ["open", "filtered", "closed", "reset"],
      answer: 1,
      explain: "Closed ports answer with a reset. Silence usually means filtered.",
    },
    {
      kind: "mcq",
      q: "In tcpdump, what does Flags [S.] on a packet from the server mean?",
      options: [
        "A SYN-ACK reply that accepts the connection",
        "The connection is being closed",
        "The connection was refused",
        "Data is being pushed to the application",
      ],
      answer: 0,
      explain: "S plus the dot (ACK) is SYN-ACK, the second step of the handshake.",
    },
    {
      kind: "text",
      q: "You send 8 pings and 2 get no reply. What is the packet loss as a percentage? Digits only.",
      format: "**",
      accept: ["25", "25%"],
      explain: "(8 - 6) / 8 x 100 = 25 percent.",
    },
  ],
};

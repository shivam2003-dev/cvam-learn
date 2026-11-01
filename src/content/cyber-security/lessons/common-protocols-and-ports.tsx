import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Explain what a port is and name the three port ranges",
    "Recognise the common service ports on sight and say which are encrypted",
    "Read a list of listening sockets and spot what should not be exposed",
    "Apply basic hardening to SSH and to firewall rules",
  ],
  tasks: [
    {
      id: "problem",
      title: "One address, many services",
      body: (
        <>
          <p>
            A server has one IP address but may run a web server, an SSH service, a database and a
            mail server at the same time. How does an incoming packet reach the right program? The
            answer is the <strong>port</strong>: a 16-bit number carried in the TCP or UDP header. The
            IP address finds the building, the port finds the room.
          </p>
          <p>
            With 16 bits there are 2^16 = 65,536 ports, numbered 0 to 65,535. They are grouped:
          </p>
          <Table
            head={["Range", "Name", "Typical use"]}
            rows={[
              ["0 to 1023", "Well-known (system) ports", "Standard services such as HTTP and SSH"],
              ["1024 to 49151", "Registered ports", "Applications such as databases"],
              ["49152 to 65535", "Dynamic (ephemeral) ports", "Temporary source ports for outgoing connections"],
            ]}
          />
          <p>
            A connection is identified by four values: source address, source port, destination
            address and destination port. When your browser connects to a web server, the
            destination is port 443 and the source is a random ephemeral port. Many operating
            systems use a slightly different ephemeral range, but the idea is the same.
          </p>
          <p>
            For defenders, ports are the language of firewall rules and logs. Knowing the standard
            ones lets you read an alert such as "denied TCP from 203.0.113.50 to 10.0.5.20 port
            3389" and immediately understand someone tried to reach Remote Desktop.
          </p>
        </>
      ),
    },
    {
      id: "table",
      title: "The ports to recognise on sight",
      body: (
        <>
          <p>
            Learn this table until it is automatic. The last column shows whether the traffic is
            protected by default, and what to prefer when it is not.
          </p>
          <Table
            head={["Port", "Protocol", "Transport", "Encrypted by default?", "Notes"]}
            rows={[
              ["20, 21", "FTP", "TCP", "No", "Passwords in clear text. Use SFTP or FTPS"],
              ["22", "SSH (and SFTP)", "TCP", "Yes", "Remote shell and file transfer"],
              ["23", "Telnet", "TCP", "No", "Legacy remote shell. Replace with SSH"],
              ["25", "SMTP", "TCP", "No", "Server-to-server mail"],
              ["53", "DNS", "UDP and TCP", "No", "Name lookups"],
              ["67, 68", "DHCP", "UDP", "No", "Server 67, client 68"],
              ["80", "HTTP", "TCP", "No", "Web, should redirect to HTTPS"],
              ["110", "POP3", "TCP", "No", "Mail download. 995 is the TLS version"],
              ["123", "NTP", "UDP", "No", "Time sync"],
              ["143", "IMAP", "TCP", "No", "Mail access. 993 is the TLS version"],
              ["161", "SNMP", "UDP", "Depends on version", "Device monitoring; use the newest version with authentication"],
              ["389", "LDAP", "TCP", "No", "Directory lookups. 636 is LDAPS"],
              ["443", "HTTPS", "TCP", "Yes (TLS)", "Encrypted web"],
              ["445", "SMB", "TCP", "Depends on version", "Windows file sharing. Never expose to the internet"],
              ["587", "SMTP submission", "TCP", "Usually with STARTTLS", "Mail clients sending out"],
              ["3306", "MySQL", "TCP", "Optional", "Database, keep off public networks"],
              ["3389", "RDP", "TCP", "Yes, with caveats", "Windows remote desktop"],
              ["5432", "PostgreSQL", "TCP", "Optional", "Database, keep off public networks"],
            ]}
          />
          <p>
            Two patterns stand out. First, older protocols (FTP, Telnet, POP3, plain IMAP, HTTP) send
            credentials and data in clear text, so anyone able to watch the network path can read
            them. Second, many protocols have a secure sibling on a different port or with an upgrade
            step (STARTTLS), which is why you see pairs such as 143 and 993.
          </p>
          <Callout tone="note">
            Ports are conventions, not laws. An administrator can run SSH on port 2222 or a malicious
            program can use port 443 for something that is not web traffic. Never decide what traffic
            is purely from the port number. Combine it with the protocol, content and behaviour.
          </Callout>
        </>
      ),
    },
    {
      id: "listening",
      title: "What is your machine actually exposing?",
      body: (
        <>
          <p>
            Every open (listening) port is a possible way in, so the first hardening step is to list
            them. On a Linux machine that you own, <code>ss</code> shows listening sockets (
            <code>-t</code> TCP, <code>-u</code> UDP, <code>-l</code> listening, <code>-n</code>{" "}
            numeric). Illustrative output:
          </p>
          <pre>
            <code>{`$ ss -tuln
Netid State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port
tcp   LISTEN 0      128     0.0.0.0:22          0.0.0.0:*
tcp   LISTEN 0      511     0.0.0.0:80          0.0.0.0:*
tcp   LISTEN 0      200     127.0.0.1:5432      0.0.0.0:*`}</code>
          </pre>
          <p>
            Read the Local Address column. <code>0.0.0.0</code> means "all interfaces", so SSH and the
            web server accept connections from anywhere that can reach the machine. <code>127.0.0.1</code>{" "}
            means loopback only: the database can be used by programs on this very machine and is
            not reachable from the network. That is the right setting for a database that only a
            local application needs.
          </p>
          <p>
            Worked reasoning: three services are listening, two on all interfaces. Ask of each one,
            "Does this need to be reachable from the network, and from where?" SSH may need to be, but
            only from the office network. The web server may need to be reachable by everyone. The
            database does not. Then write the firewall rule to match the answer, not the other way
            around.
          </p>
        </>
      ),
    },
    {
      id: "hardening",
      title: "Hardening the common ones",
      body: (
        <>
          <p>
            Exposed management ports, mainly SSH, RDP and SMB, are heavily and constantly probed by
            automated tools on the internet. You can see it in an SSH server log within minutes of
            exposing one:
          </p>
          <pre>
            <code>{`Failed password for invalid user admin from 203.0.113.50 port 51234 ssh2
Failed password for invalid user test from 203.0.113.50 port 51240 ssh2
Failed password for root from 203.0.113.50 port 51246 ssh2
(illustrative: one source, many usernames, seconds apart = automated guessing)`}</code>
          </pre>
          <p>
            Defences, in order of value: do not expose the port at all (use a VPN or a bastion host);
            use key-based logins rather than passwords; restrict who can log in; and rate-limit or
            block repeat failures. An illustrative <code>sshd_config</code> fragment:
          </p>
          <pre>
            <code>{`PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
AllowUsers deploy alice
MaxAuthTries 3`}</code>
          </pre>
          <p>
            Moving SSH to another port only reduces log noise from lazy scanners. It does not stop a
            determined attacker, so it is not a substitute for the settings above. For SMB and RDP the
            rule is stricter still: keep them off the internet entirely, require multi-factor
            authentication where available and patch promptly.
          </p>
          <Callout tone="warn">
            Checking which ports are open on a machine is fine on your own system or lab VM. Do not
            probe addresses you do not own or lack written permission to test, even if the check feels
            harmless. In many places, unauthorised scanning can be treated as hostile activity.
          </Callout>
          <p>
            Finally, the firewall rule of thumb is <strong>default deny</strong>: block everything,
            then allow only the ports and sources you can justify, and review the list regularly.
            Fewer open ports means fewer things to patch and fewer places to be attacked.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A port is a 16-bit number (0 to 65535) that selects a service on a host.",
    "Well-known ports are 0 to 1023; learn 22, 53, 80, 443, 445 and 3389 first.",
    "Telnet, FTP, POP3, plain IMAP and HTTP send data in clear text; prefer SSH, SFTP, TLS-protected mail and HTTPS.",
    "0.0.0.0 listens on every interface; 127.0.0.1 listens on this machine only.",
    "Do not expose SSH, RDP, SMB or databases to the internet; default deny and justify every open port.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which protocol sends passwords in clear text and should be replaced by SSH?",
      options: ["FTPS", "SSH", "Telnet", "HTTPS"],
      answer: 2,
      explain: "Telnet has no encryption, so anyone watching the path can read the login.",
    },
    {
      kind: "mcq",
      q: "A database shows as listening on 127.0.0.1:5432. Who can connect to it over the network?",
      options: [
        "Any host on the internet",
        "Nobody over the network; only programs on that machine",
        "Any host in the same subnet",
        "Only hosts that use a VPN",
      ],
      answer: 1,
      explain: "127.0.0.1 is loopback. The service is not reachable from other machines.",
    },
    {
      kind: "text",
      q: "Which TCP port does Remote Desktop Protocol (RDP) use by default?",
      format: "****",
      accept: ["3389"],
      explain: "RDP listens on TCP 3389 by default, and exposed RDP is a frequent target.",
    },
    {
      kind: "text",
      q: "What is the highest port number in the well-known range?",
      format: "****",
      accept: ["1023"],
      explain: "Well-known ports run from 0 to 1023.",
    },
  ],
};

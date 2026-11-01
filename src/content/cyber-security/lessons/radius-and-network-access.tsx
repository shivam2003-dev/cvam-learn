import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain AAA and why network devices defer to a central server",
    "Describe how RADIUS works, including its ports, messages and shared secret",
    "Compare RADIUS and TACACS+",
    "Walk through 802.1X port-based access control and the role of NAC",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: every door has its own lock",
      body: (
        <>
          <p>
            A company may have 300 switches, 150 wireless access points and several VPN gateways. If
            each keeps its own list of usernames, a leaver must be removed in hundreds of places, and
            somewhere an old account will survive. The fix is to let every device ask one central
            server. It is like a building where every door reader checks with one security desk,
            rather than each door storing its own list of staff.
          </p>
          <p>
            The idea has a name: <strong>AAA</strong>.
          </p>
          <Table
            head={["Letter", "Question", "Example"]}
            rows={[
              ["Authentication", "Who are you?", "Check a password or certificate"],
              ["Authorization", "What may you do?", "Place the user in the staff VLAN, allow read-only commands"],
              ["Accounting", "What did you do?", "Log when the session began, how long it lasted, how much data moved"],
            ]}
          />
          <p>
            Accounting is easy to overlook, yet it is what answers the incident-response question
            "who was connected to the VPN at 03:12?"
          </p>
        </>
      ),
    },
    {
      id: "radius",
      title: "RADIUS: central AAA for network access",
      body: (
        <>
          <p>
            <strong>RADIUS</strong> (Remote Authentication Dial-In User Service) is the most widely
            used AAA protocol for Wi-Fi, VPN and switch ports. The device that users connect to
            (switch, access point, VPN gateway) is the <strong>network access server</strong> (NAS).
            It is the RADIUS <em>client</em>. It forwards login attempts to the RADIUS{" "}
            <em>server</em>, which checks them, often against a directory such as Active Directory.
          </p>
          <Table
            head={["Message", "Direction", "Meaning"]}
            rows={[
              ["Access-Request", "NAS to server", "Please check this user"],
              ["Access-Challenge", "Server to NAS", "More information needed, for example a second step"],
              ["Access-Accept", "Server to NAS", "Allowed, with attributes such as the VLAN to use"],
              ["Access-Reject", "Server to NAS", "Denied"],
              ["Accounting-Request", "NAS to server", "Session started, stopped or updated"],
            ]}
          />
          <p>
            RADIUS runs over UDP. Authentication uses port 1812 and accounting uses 1813. Older
            equipment sometimes still uses 1645 and 1646. The Access-Accept can carry attributes that
            tell the switch what to do, such as placing the user in a particular VLAN using the
            tunnel attributes.
          </p>
          <p>
            Each NAS and the server share a <strong>shared secret</strong>. It authenticates messages
            between them and hides the user password field. Everything else in the packet travels
            readable, so keep RADIUS traffic on a protected management network, or wrap it in TLS with{" "}
            <strong>RadSec</strong> (TCP port 2083). The strength of the secret matters because it can
            be guessed offline if an attacker captures packets:
          </p>
          <Formula>strength in bits = length × log2(alphabet size)</Formula>
          <pre>
            <code>{`8 lowercase letters      : 8  x log2(26) = 8  x 4.70 = about 38 bits   (weak)
20 random letters/digits : 20 x log2(62) = 20 x 5.95 = about 119 bits  (strong)`}</code>
          </pre>
          <p>
            Use a unique, long, random secret per client, kept in a password manager. Here is an
            illustrative FreeRADIUS client entry, with a placeholder instead of a real secret:
          </p>
          <pre>
            <code>{`client switch1 {
    ipaddr    = 10.0.0.2
    secret    = "REPLACE_WITH_A_LONG_RANDOM_SECRET"
    shortname = switch1
}`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "tacacs",
      title: "RADIUS versus TACACS+",
      body: (
        <>
          <p>
            <strong>TACACS+</strong> was designed by Cisco for managing network devices. It runs over
            TCP port 49 and encrypts the whole body of each packet, not just the password. It also
            keeps authentication, authorization and accounting as separate steps, which makes
            per-command authorization simple: a junior engineer may run <code>show</code> commands
            but not change configuration.
          </p>
          <Table
            head={["", "RADIUS", "TACACS+"]}
            rows={[
              ["Transport", "UDP (1812, 1813)", "TCP (49)"],
              ["Encryption", "Password field only, unless RadSec", "Entire packet body"],
              ["AAA", "Authentication and authorization combined", "Separated"],
              ["Best fit", "Users joining a network: Wi-Fi, VPN, 802.1X", "Administrators logging in to devices"],
              ["Standard", "Open, multi-vendor", "Originally Cisco, widely supported"],
            ]}
          />
          <p>
            Many organisations use both: RADIUS for users, TACACS+ for administrators.
          </p>
        </>
      ),
    },
    {
      id: "dot1x",
      title: "802.1X and network access control",
      body: (
        <>
          <p>
            <strong>IEEE 802.1X</strong> decides whether a device may use a network port or Wi-Fi
            network <em>before</em> it gets any access. It has three roles:
          </p>
          <ul>
            <li><strong>Supplicant:</strong> the device that wants in, such as a laptop.</li>
            <li>
              <strong>Authenticator:</strong> the switch or access point. It blocks all traffic except
              authentication messages until told otherwise.
            </li>
            <li><strong>Authentication server:</strong> the RADIUS server that makes the decision.</li>
          </ul>
          <p>
            The device and switch talk using <strong>EAP</strong> (Extensible Authentication Protocol)
            carried in EAPOL frames. The switch repackages the EAP messages inside RADIUS to the
            server. On Accept, the port opens, usually in the VLAN the server named. WPA2 and WPA3
            Enterprise Wi-Fi use the same design.
          </p>
          <Table
            head={["EAP method", "How the user proves identity", "Notes"]}
            rows={[
              ["EAP-TLS", "Certificates on both client and server", "Strongest; needs a certificate for every device"],
              ["PEAP", "Server certificate builds a TLS tunnel, then a password goes inside", "Common; clients must validate the server certificate"],
              ["EAP-TTLS", "Similar tunnel approach with more inner methods", "Also relies on server validation"],
            ]}
          />
          <p>
            <strong>Network access control (NAC)</strong> builds on this. After authentication, it
            can check <em>posture</em> (is the disk encrypted, is the antivirus current) and choose
            a VLAN: staff, guest or a quarantine network with only update servers. Printers and
            other devices that cannot do 802.1X are often let in by their MAC address
            (MAC authentication bypass). MAC addresses are easy to copy, so such devices belong in a
            tightly limited VLAN.
          </p>
          <Callout tone="warn">
            A classic weakness is an <strong>evil twin</strong>: a fake access point that copies the
            real network name to collect credentials from PEAP clients. It only works when devices
            are not told to verify the server certificate. Configure clients through policy to trust
            only your own certificate authority and server name. Test rogue access points and
            credential capture only in your own lab, never near other people's networks.
          </Callout>
          <p>
            In logs, watch for repeated failures from one username across many ports, or one
            MAC address suddenly appearing on a different switch. An illustrative line:
          </p>
          <pre>
            <code>{`Auth: Login incorrect: [alice] (from client switch1 port 12)
(repeated 30 times in 1 minute for different users = password spraying)`}</code>
          </pre>
        </>
      ),
    },
  ],
  takeaways: [
    "AAA means authentication, authorization and accounting, ideally done in one central place.",
    "RADIUS uses UDP 1812 for authentication and 1813 for accounting; protect the shared secret and the path.",
    "TACACS+ uses TCP 49, encrypts the whole body and suits device administration.",
    "802.1X has a supplicant, an authenticator and an authentication server, and blocks ports until authenticated.",
    "NAC adds posture checks and VLAN placement; MAC-based exceptions are weak and need tight limits.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Which UDP port does RADIUS use for authentication in current deployments?",
      format: "****",
      accept: ["1812"],
      explain: "Authentication uses 1812 and accounting 1813. Legacy gear used 1645 and 1646.",
    },
    {
      kind: "mcq",
      q: "In 802.1X, which device is the authenticator?",
      options: [
        "The laptop trying to connect",
        "The switch or access point",
        "The RADIUS server",
        "The certificate authority",
      ],
      answer: 1,
      explain: "The authenticator sits in the middle, blocking the port and relaying messages.",
    },
    {
      kind: "text",
      q: "Which TCP port does TACACS+ use?",
      format: "**",
      accept: ["49"],
      explain: "TACACS+ runs over TCP port 49.",
    },
    {
      kind: "mcq",
      q: "Which EAP method requires a certificate on both the client and the server?",
      options: ["PEAP", "EAP-TTLS", "EAP-TLS", "PAP"],
      answer: 2,
      explain: "EAP-TLS uses mutual certificate authentication, which is why it is the strongest.",
    },
  ],
};

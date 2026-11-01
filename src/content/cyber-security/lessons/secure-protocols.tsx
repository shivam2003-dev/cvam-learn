import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Replace common cleartext protocols with their secure equivalents",
    "Explain what SSH, SFTP, IPsec, DNSSEC and S/MIME each protect",
    "Apply a basic hardened SSH server configuration",
  ],
  tasks: [
    {
      id: "problem",
      title: "Old protocols trusted the network",
      body: (
        <>
          <p>
            Many internet protocols were designed when networks were small and friendly. Telnet,
            FTP, HTTP and early email sent everything, including passwords, as plain text. Anyone on
            the path could read or change it. The fix is rarely a brand new idea. It is usually the
            same protocol wrapped in encryption, or a replacement that adds it.
          </p>
          <p>
            The skill here is matching a protocol to what it protects. Some secure protocols hide
            content (confidentiality). Some prove the data wasn't changed or came from the right
            source (integrity and authenticity). Some do only one of these.
          </p>
          <Table
            head={["Insecure", "Port", "Secure choice", "Port"]}
            rows={[
              ["Telnet", "23", "SSH", "22"],
              ["FTP", "21", "SFTP (over SSH) or FTPS", "22 / 990 implicit"],
              ["HTTP", "80", "HTTPS", "443"],
              ["IMAP", "143", "IMAP over TLS (IMAPS)", "993"],
              ["POP3", "110", "POP3 over TLS (POP3S)", "995"],
              ["LDAP", "389", "LDAPS or LDAP with StartTLS", "636 / 389"],
              ["SNMP v1 and v2c", "161", "SNMPv3", "161"],
            ]}
          />
          <Callout tone="note">
            SFTP and FTPS sound alike but are different. SFTP is a file transfer protocol that runs
            inside SSH. FTPS is the old FTP protocol with TLS added.
          </Callout>
        </>
      ),
    },
    {
      id: "ssh",
      title: "SSH and SFTP",
      body: (
        <>
          <p>
            SSH (Secure Shell) gives an encrypted remote terminal on TCP port 22. It also carries
            file copy (SCP and SFTP) and port forwarding. Two checks happen at connection time.
          </p>
          <ul>
            <li>
              <strong>Server authentication:</strong> the server shows a host key. Your client
              records it in <code>known_hosts</code> the first time. If it changes later, you get a
              loud warning. That warning may mean a man-in-the-middle, so don't dismiss it.
            </li>
            <li>
              <strong>User authentication:</strong> a password, or better, a key pair. The private
              key stays on your machine, and the server holds only the public key.
            </li>
          </ul>
          <p>An illustrative hardening of your own lab server, in <code>/etc/ssh/sshd_config</code>:</p>
          <pre>
            <code>{`PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
AllowUsers deploy admin
MaxAuthTries 3`}</code>
          </pre>
          <p>
            Generate a key on your own machine with <code>ssh-keygen -t ed25519</code>, copy the
            public half to the server, test that key login works in a second terminal, and only then
            reload the service. Locking yourself out by disabling passwords first is a classic
            mistake.
          </p>
          <Callout tone="warn">
            Password guessing against SSH is constant on any internet-facing host. Expect failed
            login lines in your logs. Only test your own servers, never anyone else's.
          </Callout>
        </>
      ),
    },
    {
      id: "ipsec",
      title: "IPsec",
      body: (
        <>
          <p>
            SSH and TLS protect one application. <strong>IPsec</strong> protects traffic at the IP
            layer, so every application above it is covered without changes. It is common for
            site-to-site VPNs that link two offices.
          </p>
          <ul>
            <li>
              <strong>IKE</strong> (Internet Key Exchange) negotiates keys and authenticates the
              peers. It uses UDP port 500, and UDP 4500 when NAT is in the path.
            </li>
            <li>
              <strong>ESP</strong> (Encapsulating Security Payload, IP protocol 50) encrypts and
              authenticates packets. It is what nearly everyone uses.
            </li>
            <li>
              <strong>AH</strong> (Authentication Header, IP protocol 51) authenticates only. It
              gives no encryption.
            </li>
          </ul>
          <p>
            There are two modes. <strong>Transport mode</strong> protects the payload between two
            hosts. <strong>Tunnel mode</strong> wraps the whole original packet inside a new one,
            which is how gateways join networks.
          </p>
          <Table
            head={["Mode", "Protects", "Typical use"]}
            rows={[
              ["Transport", "Payload of each packet", "Host to host"],
              ["Tunnel", "The entire original packet", "Gateway to gateway VPN"],
            ]}
          />
        </>
      ),
    },
    {
      id: "dns-mail",
      title: "DNSSEC and S/MIME",
      body: (
        <>
          <p>
            <strong>DNSSEC</strong> adds digital signatures to DNS records. A resolver that
            validates them can tell that an answer really came from the zone owner and wasn't
            altered. That stops cache poisoning. Records such as DNSKEY, RRSIG and DS carry the keys
            and signatures, and the chain of trust runs from the root zone downward.
          </p>
          <p>
            Important limit: DNSSEC gives <strong>authenticity and integrity, not secrecy</strong>.
            Anyone can still see which names you look up. Encrypting the lookups themselves is a
            separate job, done by DNS over TLS (port 853) or DNS over HTTPS (port 443).
          </p>
          <p>
            <strong>S/MIME</strong> protects individual email messages. With an X.509 certificate
            you can sign a message, so the receiver knows who sent it and that it wasn't altered, and
            you can encrypt it so only the recipient's key can open it. This is end-to-end: mail
            servers in the middle see only ciphertext. TLS between mail servers is different, since
            it protects one hop and the message sits readable on each server.
          </p>
          <Table
            head={["Protocol", "Confidentiality", "Integrity and authenticity"]}
            rows={[
              ["SSH", "Yes", "Yes"],
              ["IPsec ESP", "Yes", "Yes"],
              ["IPsec AH", "No", "Yes"],
              ["DNSSEC", "No", "Yes"],
              ["S/MIME", "Yes, if encrypted", "Yes, if signed"],
            ]}
          />
        </>
      ),
    },
    {
      id: "choosing",
      title: "A quick audit habit",
      body: (
        <>
          <p>
            Once a quarter, list what is listening on your own systems and ask of each port: is this
            protocol encrypted, and does it need to be reachable at all? On a Linux lab machine:
          </p>
          <pre>
            <code>{`ss -tlnp
# look for 21, 23, 80, 110, 143, 389 and decide whether each
# should be replaced, firewalled or switched off`}</code>
          </pre>
          <p>
            Disabling a service you don't use beats securing it. A closed port has no
            vulnerabilities.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Replace Telnet, FTP, HTTP and other cleartext protocols with SSH, SFTP or FTPS, and HTTPS.",
    "SSH uses host keys to prove the server and keys or passwords to prove the user; prefer key login.",
    "IPsec protects at the IP layer; ESP encrypts, AH only authenticates, and tunnel mode links networks.",
    "DNSSEC proves DNS answers are genuine but does not hide them.",
    "S/MIME signs and encrypts individual messages end to end.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which protocol proves a DNS answer is genuine but does not hide the lookup?",
      options: ["DNS over HTTPS", "S/MIME", "DNSSEC", "IPsec ESP"],
      answer: 2,
      explain: "DNSSEC signs records. It gives authenticity and integrity, not confidentiality.",
    },
    {
      kind: "mcq",
      q: "A server's SSH host key suddenly differs from the one in known_hosts. What should you do first?",
      options: [
        "Accept it and continue",
        "Delete known_hosts",
        "Investigate; it may be a man-in-the-middle or a rebuilt server",
        "Switch to Telnet",
      ],
      answer: 2,
      explain: "A changed host key is a warning sign. Confirm with the server owner before trusting it.",
    },
    {
      kind: "text",
      q: "What TCP port does SSH use by default?",
      format: "**",
      accept: ["22"],
      explain: "SSH and SFTP use TCP port 22.",
    },
    {
      kind: "text",
      q: "Which IP protocol number identifies IPsec ESP?",
      format: "**",
      accept: ["50"],
      explain: "ESP is IP protocol 50. AH is 51.",
    },
  ],
};

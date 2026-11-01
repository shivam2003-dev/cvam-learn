import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe what TLS protects and walk through the steps of a handshake",
    "Read a certificate and explain how a chain of trust is checked",
    "Name the common certificate failures and the config that prevents them",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem TLS solves",
      body: (
        <>
          <p>
            Data crossing the internet passes through many networks you don't control: a caf&eacute;
            Wi-Fi router, a provider, a carrier. Without protection, any of them could read it or
            change it. Worse, you can't tell whether the server answering is the real one. TLS
            (Transport Layer Security) fixes three things at once:
          </p>
          <ul>
            <li><strong>Confidentiality:</strong> outsiders can't read the traffic.</li>
            <li><strong>Integrity:</strong> changes in transit are detected.</li>
            <li><strong>Authentication:</strong> the client can check who the server is.</li>
          </ul>
          <p>
            HTTPS is simply HTTP carried inside TLS, on port 443 by default. The current version is
            TLS 1.3 (RFC 8446). TLS 1.2 is still common. The older SSL versions and TLS 1.0 and 1.1
            are deprecated and should be switched off.
          </p>
          <p>
            Think of a sealed courier van. The sealed box keeps the contents private, the seal shows
            tampering, and the driver's ID badge, issued by a company you trust, shows who he works
            for. TLS is the box and the seal. The certificate is the badge.
          </p>
        </>
      ),
    },
    {
      id: "handshake",
      title: "The handshake in plain steps",
      body: (
        <>
          <p>
            Before any web page is sent, client and server agree on how to protect the connection.
            This is the handshake. In simplified form for TLS 1.3:
          </p>
          <ol>
            <li>
              The client sends a <strong>ClientHello</strong>: the versions and cipher suites it
              supports, a random value, a key share, and the server name it wants (SNI).
            </li>
            <li>
              The server replies with a <strong>ServerHello</strong> choosing the settings, plus its
              own key share. From here both sides can compute the same session keys.
            </li>
            <li>
              The server sends its <strong>certificate</strong> and a signature that proves it holds
              the matching private key.
            </li>
            <li>
              Both sides send a <strong>Finished</strong> message that confirms nothing was altered.
              Application data now flows, encrypted.
            </li>
          </ol>
          <p>
            The key share uses an ephemeral Diffie-Hellman exchange (ECDHE). Ephemeral means the
            keys are made fresh for each connection and thrown away. That gives{" "}
            <strong>forward secrecy</strong>: if the server's long-term private key leaks next year,
            recorded traffic from today still can't be decrypted. TLS 1.3 needs one round trip to
            set up, where TLS 1.2 needs two.
          </p>
          <Table
            head={["Item", "Role in the handshake"]}
            rows={[
              ["Cipher suite", "The bundle of algorithms used for the connection"],
              ["Key share (ECDHE)", "Lets both sides derive the same secret without sending it"],
              ["Certificate", "Binds a public key to a name, signed by a CA"],
              ["Session keys", "Fast symmetric keys that encrypt the actual data"],
            ]}
          />
        </>
      ),
    },
    {
      id: "certificates",
      title: "Certificates and the chain of trust",
      body: (
        <>
          <p>
            A certificate (an X.509 document) says: this public key belongs to this name. Key
            fields are the subject, the Subject Alternative Names (SAN) listing every valid host
            name, the issuer, the validity dates, the public key and the issuer's signature.
            Browsers match the host name against the SAN list.
          </p>
          <p>
            Why trust the signature? Because of a chain. Your operating system or browser ships a
            list of <strong>root CAs</strong> (certificate authorities) it trusts. A root signs an{" "}
            <strong>intermediate</strong>, and the intermediate signs the server's{" "}
            <strong>leaf</strong> certificate. This set of arrangements is called PKI (public key
            infrastructure). The roots stay offline, and the intermediates do the daily signing.
          </p>
          <p>A client accepts a certificate only if all of these pass:</p>
          <ul>
            <li>The chain leads to a root in its trust store, with valid signatures at each step.</li>
            <li>The current date is inside every certificate's validity period.</li>
            <li>The requested host name is in the SAN list.</li>
            <li>None of the certificates has been revoked.</li>
          </ul>
          <p>
            Revocation uses CRLs (lists of revoked serials) or OCSP (ask the CA about one
            certificate). OCSP stapling lets the server attach a fresh signed answer itself, so
            clients don't need to contact the CA. Certificate Transparency adds public, append-only
            logs of issued certificates, so a CA that mis-issues one can be caught.
          </p>
          <Callout tone="note">
            A self-signed certificate is its own issuer. It's fine in a lab, but a client has no
            reason to trust it, so users learn to click through warnings. That habit is dangerous.
          </Callout>
        </>
      ),
    },
    {
      id: "inspect",
      title: "Inspecting and hardening your own server",
      body: (
        <>
          <p>
            In your own lab VM, create a short-lived test certificate and look inside it. Replace
            the names with your lab's.
          </p>
          <pre>
            <code>{`openssl req -x509 -newkey rsa:2048 -nodes -days 30 \\
  -keyout lab.key -out lab.pem \\
  -subj "/CN=lab.example.com" \\
  -addext "subjectAltName=DNS:lab.example.com"

openssl x509 -in lab.pem -noout -subject -issuer -dates -ext subjectAltName

# once your lab web server listens on 8443:
openssl s_client -connect 127.0.0.1:8443 -servername lab.example.com`}</code>
          </pre>
          <p>
            The last command prints the chain the server sends, the negotiated protocol and the
            cipher. Now harden the server. An illustrative nginx fragment:
          </p>
          <pre>
            <code>{`ssl_protocols TLSv1.2 TLSv1.3;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`}</code>
          </pre>
          <p>
            HSTS tells browsers to use HTTPS only for this site for the stated time. Worked check:
            one year is 365 days × 24 hours × 3,600 seconds = 31,536,000 seconds, which is the{" "}
            <code>max-age</code> above.
          </p>
          <Callout tone="warn">
            Only run <code>s_client</code> and similar probes against servers you own or have
            written permission to test.
          </Callout>
        </>
      ),
    },
    {
      id: "failures",
      title: "How it goes wrong",
      body: (
        <>
          <Table
            head={["Failure", "What it looks like", "Fix"]}
            rows={[
              ["Expired certificate", "Browser warning, API calls fail", "Automate renewal and alert early"],
              ["Name mismatch", "Host not in SAN list", "Issue with every needed name"],
              ["Missing intermediate", "Works in one browser, fails in tools", "Serve the full chain"],
              ["Old protocol enabled", "Scanner flags TLS 1.0", "Allow TLS 1.2 and 1.3 only"],
              ["Private key leaked", "Attacker can impersonate", "Revoke, reissue, rotate"],
            ]}
          />
          <p>
            Lifetimes of public certificates keep getting shorter, which limits damage from leaks
            but makes automatic renewal essential. A simple rule: renew when a third of the life is
            left. For a 90-day certificate (illustrative), that means renewing at day 60, which
            leaves a 30-day buffer to fix a broken renewal job.
          </p>
          <Formula>renewal buffer = lifetime − renew day = 90 − 60 = 30 days</Formula>
        </>
      ),
    },
  ],
  takeaways: [
    "TLS gives confidentiality, integrity and server authentication; HTTPS is HTTP inside TLS on port 443.",
    "The handshake agrees on settings, swaps ephemeral key shares and proves identity with a certificate.",
    "Ephemeral keys give forward secrecy, so a later key leak can't expose old traffic.",
    "Clients trust a certificate only if its chain reaches a trusted root, is in date, matches the name and isn't revoked.",
    "Most real incidents are expired certs, wrong names or old protocols, so automate renewal and disable legacy versions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which field does a browser compare against the host name it is visiting?",
      options: ["Serial number", "Subject Alternative Name list", "Signature algorithm", "Issuer country"],
      answer: 1,
      explain: "The host name must appear in the SAN list of the leaf certificate.",
    },
    {
      kind: "mcq",
      q: "What does ephemeral key exchange (ECDHE) give you?",
      options: [
        "Faster certificates",
        "Free certificates",
        "Forward secrecy",
        "Protection from DoS",
      ],
      answer: 2,
      explain: "Fresh keys per connection mean a later private key leak can't decrypt recorded traffic.",
    },
    {
      kind: "text",
      q: "What is the default TCP port for HTTPS?",
      format: "***",
      accept: ["443"],
      explain: "HTTPS uses port 443; plain HTTP uses 80.",
    },
    {
      kind: "text",
      q: "An HSTS max-age of one year (365 days) is how many seconds? Digits only.",
      format: "********",
      accept: ["31536000", "31,536,000"],
      explain: "365 × 24 × 3,600 = 31,536,000.",
    },
  ],
};

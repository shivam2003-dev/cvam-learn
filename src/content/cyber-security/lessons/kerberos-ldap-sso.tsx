import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Hard",
  objectives: [
    "Explain what a directory is and read an LDAP distinguished name and filter",
    "Walk through the Kerberos exchange: TGT, service ticket and service",
    "Compare SAML, OAuth 2.0 and OpenID Connect for single sign-on",
    "Describe how Kerberos and LDAP are attacked and which controls and logs matter",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: one person, hundreds of systems",
      body: (
        <>
          <p>
            A company with 2,000 staff and 100 systems would need 200,000 separate accounts if every
            system kept its own password list. People would reuse passwords, leavers would keep
            access somewhere, and nobody could answer "what can Alice reach?". The fix is to keep
            identities in one place and let every system ask it. Three ideas do most of the work:
          </p>
          <Table
            head={["Technology", "Role", "Analogy"]}
            rows={[
              ["LDAP", "A directory: stores and looks up users, groups and attributes", "The company phone book"],
              ["Kerberos", "Ticket-based login inside a network, so passwords do not travel", "A theme-park wristband"],
              ["SSO (SAML, OAuth 2.0, OpenID Connect)", "Log in once, use many web applications", "A passport accepted by many countries"],
            ]}
          />
          <p>
            In a Windows environment, Active Directory combines the first two: it is an LDAP
            directory and a Kerberos service in one product.
          </p>
        </>
      ),
    },
    {
      id: "ldap",
      title: "LDAP: the directory",
      body: (
        <>
          <p>
            <strong>LDAP</strong> (Lightweight Directory Access Protocol) reads and changes a
            tree of entries. Each entry is found by its <strong>distinguished name</strong> (DN),
            read from the most specific part to the root:
          </p>
          <pre>
            <code>{`uid=alice,ou=People,dc=example,dc=com
  uid = the user    ou = organisational unit    dc = domain component`}</code>
          </pre>
          <p>
            Clients can <strong>bind</strong> (authenticate), <strong>search</strong>,{" "}
            <strong>add</strong>, <strong>modify</strong> and <strong>delete</strong>. Searches use a
            filter. This one finds people in Finance (prefix notation: <code>&amp;</code> means AND):
          </p>
          <pre>
            <code>{`(&(objectClass=person)(department=Finance))

# against a directory you own, such as a lab server
ldapsearch -x -H ldaps://ldap.lab.example.com -b "dc=example,dc=com" "(uid=alice)"`}</code>
          </pre>
          <p>
            LDAP uses TCP port 389 and LDAPS (LDAP inside TLS) uses 636. Port 389 can be upgraded to
            TLS with StartTLS. A plain simple bind sends the password unencrypted, so require TLS and
            disable anonymous binds unless you truly need them.
          </p>
          <p>
            <strong>LDAP injection</strong> happens when an application pastes user input into a
            filter. Input containing characters such as <code>*</code> or parentheses can change the
            filter's meaning, for example matching every user. The fix mirrors other injection bugs:
            escape input before it enters the filter, or use a library that does.
          </p>
          <pre>
            <code>{`from ldap3.utils.conv import escape_filter_chars

safe = escape_filter_chars(username)
search_filter = f"(&(objectClass=person)(uid={safe}))"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "kerberos",
      title: "Kerberos: tickets instead of passwords",
      body: (
        <>
          <p>
            Kerberos uses a trusted third party, the <strong>KDC</strong> (key distribution centre,
            run on domain controllers in Active Directory). It has two parts: the Authentication
            Service (AS) and the Ticket-Granting Service (TGS). Everyone talks to it on port 88.
          </p>
          <Table
            head={["Step", "Messages", "What happens"]}
            rows={[
              ["1. Log in", "AS-REQ, AS-REP", "You prove who you are to the AS. It returns a TGT (ticket-granting ticket) that only the KDC can read, plus a session key"],
              ["2. Ask for a service", "TGS-REQ, TGS-REP", "You show the TGT to the TGS and name a service, such as a file server. It returns a service ticket sealed with that service's secret key"],
              ["3. Use the service", "AP-REQ, AP-REP", "You hand the service ticket to the service. It can open it, so it knows the KDC vouched for you"],
            ]}
          />
          <p>
            Your password is never sent. In step 1 the key derived from it is only used to unlock the
            reply, which is why a wrong password simply fails. After the first login you get new
            service tickets silently, which is the single sign-on experience on a company network.
          </p>
          <p>
            Two practical numbers. Tickets carry timestamps, so Kerberos tolerates only a small clock
            difference, 5 minutes by default in Active Directory. And a TGT is typically valid for
            10 hours and renewable for up to 7 days by default there.
          </p>
          <pre>
            <code>{`Client clock : 10:00:00
KDC clock    : 10:06:30      difference = 6 min 30 s  (limit = 5 min)
Result       : KRB_AP_ERR_SKEW, login fails. Fix: sync both machines with NTP.`}</code>
          </pre>
          <p>
            This is why "can't log in to anything" tickets are so often a time problem.
          </p>
        </>
      ),
    },
    {
      id: "attacks",
      title: "How Kerberos is abused, and what to watch",
      body: (
        <>
          <p>
            Concept-level only. Any user in the domain may request a service ticket for any service.
            That ticket is encrypted with the service account's password-derived key.
          </p>
          <ul>
            <li>
              <strong>Kerberoasting:</strong> an attacker with one ordinary account requests tickets
              for service accounts and tries to guess the password offline. Weak service passwords
              fall. Defend with long random passwords (25+ characters) or managed service accounts
              (gMSA), and enforce AES instead of RC4.
            </li>
            <li>
              <strong>Golden ticket:</strong> if the secret of the domain's <code>krbtgt</code> account
              is stolen, tickets can be forged for anyone. The response is to reset the{" "}
              <code>krbtgt</code> password twice, and to protect domain controllers heavily.
            </li>
            <li>
              <strong>Pass-the-ticket:</strong> a stolen ticket is reused from another machine until it
              expires. Short lifetimes and endpoint protection limit it.
            </li>
          </ul>
          <p>
            Useful Windows security events are 4768 (a TGT was requested), 4769 (a service ticket was
            requested) and 4771 (pre-authentication failed). An illustrative signal for Kerberoasting
            is one account requesting service tickets for many different services in a short time,
            especially with the old RC4 type:
          </p>
          <pre>
            <code>{`Event 4769  Account Name: alice@EXAMPLE.COM  Service Name: svc-sql
            Ticket Encryption Type: 0x17  Client Address: 10.0.4.21
(0x17 = RC4. Many such events for different services from one account is suspicious.)`}</code>
          </pre>
          <Callout tone="warn">
            Practise these attack ideas only in your own lab domain, never against a company or
            school directory without written permission. Your aim as a defender is to know what the
            log looks like, not to run the attack.
          </Callout>
        </>
      ),
    },
    {
      id: "sso",
      title: "Federated single sign-on for the web",
      body: (
        <>
          <p>
            Kerberos works inside one network. For web and cloud applications we use{" "}
            <strong>federation</strong>: an <strong>identity provider</strong> (IdP) logs you in, and
            each application (the <strong>service provider</strong>, SP) trusts its signed answer.
          </p>
          <Table
            head={["Standard", "Purpose", "Format", "Typical use"]}
            rows={[
              ["SAML 2.0", "Authentication", "Signed XML assertion", "Enterprise web SSO"],
              ["OAuth 2.0", "Delegated authorisation (not login by itself)", "Access token", "An app acts on your behalf, such as reading a calendar"],
              ["OpenID Connect", "Authentication layered on OAuth 2.0", "ID token, a signed JWT", "Modern 'Sign in with' flows"],
            ]}
          />
          <p>
            The flow is the same in spirit. You visit the app, it redirects you to the IdP, you log in
            there (ideally with MFA), and the IdP sends back an assertion or token. The app must
            check the <strong>signature</strong>, the <strong>issuer</strong>, that it is the
            intended <strong>audience</strong> and that it has not <strong>expired</strong>. Skipping any
            of these is a classic bug.
          </p>
          <p>
            SSO concentrates risk: whoever controls your IdP session reaches every app. So protect
            the IdP with MFA, short sessions and alerts on unusual sign-ins.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "LDAP is the directory; Kerberos and SSO use identities that a directory holds.",
    "LDAP uses 389 (with StartTLS) or 636 (LDAPS); always protect binds with TLS and escape filter input.",
    "Kerberos exchanges a TGT for service tickets, sends no password and needs clocks within about 5 minutes.",
    "Kerberoasting and golden tickets are defeated by strong service passwords, AES and krbtgt hygiene.",
    "Validate signature, issuer, audience and expiry on every SAML assertion or OIDC token.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Which port does Kerberos use?",
      format: "**",
      accept: ["88"],
      explain: "Kerberos listens on port 88, over UDP and TCP.",
    },
    {
      kind: "mcq",
      q: "Which item do you present to the TGS to ask for access to a specific service?",
      options: ["A session cookie", "A service ticket", "A SAML assertion", "A ticket-granting ticket"],
      answer: 3,
      explain: "The TGT proves you already authenticated and lets you request service tickets.",
    },
    {
      kind: "text",
      q: "Which TCP port does LDAP over TLS (LDAPS) use?",
      format: "***",
      accept: ["636"],
      explain: "LDAP uses 389, LDAPS uses 636.",
    },
    {
      kind: "mcq",
      q: "Which standard is designed for delegated authorisation and is not a login protocol on its own?",
      options: ["OAuth 2.0", "LDAP", "Kerberos", "RADIUS"],
      answer: 0,
      explain: "OAuth 2.0 grants access tokens. OpenID Connect adds the authentication layer on top.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Recognise the main forms of social engineering and the pressure tricks they use",
    "Read the signs of a phishing email, including authentication results",
    "Apply technical and human controls that reduce the damage",
  ],
  tasks: [
    {
      id: "problem",
      title: "Attacking the person, not the machine",
      body: (
        <>
          <p>
            Breaking software takes skill and time. Asking a tired employee to "just approve this"
            takes a good story. Social engineering is manipulating people into giving up access,
            money or information. It works because humans are helpful, trusting and busy, and no
            patch fixes that.
          </p>
          <p>
            Almost every attack uses a few levers. Learn to spot these and you can recognise
            techniques you've never seen before.
          </p>
          <ul>
            <li><strong>Authority:</strong> "I'm the CEO" or "this is the bank's fraud team".</li>
            <li><strong>Urgency:</strong> "Do it in ten minutes or the account closes."</li>
            <li><strong>Fear or greed:</strong> a threat, or an unexpected prize.</li>
            <li><strong>Helpfulness:</strong> a stranger who simply needs a hand.</li>
            <li><strong>Familiarity:</strong> a message that seems to come from a colleague.</li>
          </ul>
        </>
      ),
    },
    {
      id: "types",
      title: "The common forms",
      body: (
        <>
          <Table
            head={["Type", "Channel", "How it works"]}
            rows={[
              ["Phishing", "Email", "Mass message with a fake link or attachment"],
              ["Spear phishing", "Email", "Written for one person, using real details"],
              ["Whaling", "Email", "Spear phishing aimed at senior executives"],
              ["Smishing", "SMS", "Fake text, often about a parcel or a bank"],
              ["Vishing", "Phone call", "A caller pretends to be support, a bank or a boss"],
              ["Pretexting", "Any", "An invented scenario that justifies the request"],
              ["Business email compromise", "Email", "Impersonating a boss or supplier to redirect a payment"],
              ["Tailgating", "Physical", "Following an employee through a secured door"],
              ["Baiting", "Physical or online", "Leaving a tempting item, such as a labelled USB stick"],
              ["Watering hole", "Web", "Compromising a site the target group visits"],
            ]}
          />
          <p>
            Business email compromise often has no malware at all. It's just a believable email
            asking finance to change a supplier's bank account. That's why technical filters alone
            don't catch it, and why a human process matters.
          </p>
        </>
      ),
    },
    {
      id: "spot",
      title: "Spotting a phishing email",
      body: (
        <>
          <p>Look at both the content and the technical headers.</p>
          <ul>
            <li>The sender's address doesn't match the display name, or uses a lookalike domain such as <code>examp1e.com</code>.</li>
            <li>A link's visible text differs from where it really goes. Hover before you click.</li>
            <li>An unexpected attachment, or a request to "log in again".</li>
            <li>Pressure to skip the normal process.</li>
          </ul>
          <p>
            In mail headers, the receiving server records whether the sender passed checks. An
            illustrative line:
          </p>
          <pre>
            <code>{`Authentication-Results: mx.example.com;
  spf=fail smtp.mailfrom=billing@example.net;
  dkim=none;
  dmarc=fail header.from=example.com`}</code>
          </pre>
          <p>
            Here the message claims to be from <code>example.com</code> but fails SPF and DMARC, a
            strong sign of spoofing. Those three checks work as follows:
          </p>
          <Table
            head={["Check", "What it verifies"]}
            rows={[
              ["SPF", "The sending server's IP is allowed to send for the domain"],
              ["DKIM", "A cryptographic signature shows the message wasn't altered and came from the domain"],
              ["DMARC", "Tells receivers what to do when SPF and DKIM don't align with the From domain"],
            ]}
          />
          <p>You publish them as DNS TXT records for your own domain. Illustrative examples:</p>
          <pre>
            <code>{`example.com.        TXT  "v=spf1 ip4:203.0.113.10 include:_spf.example.com -all"
_dmarc.example.com. TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@example.com"`}</code>
          </pre>
          <p>
            Start DMARC at <code>p=none</code> to collect reports, then move to quarantine and
            finally reject once you're sure that your legitimate mail passes.
          </p>
        </>
      ),
    },
    {
      id: "defence",
      title: "Defences that actually work",
      body: (
        <>
          <p>No one is immune, so layer the controls.</p>
          <ul>
            <li>
              <strong>Phishing-resistant MFA:</strong> hardware keys or passkeys (FIDO2/WebAuthn)
              are bound to the real site, so a fake login page can't capture a usable login. SMS
              codes and push approvals can be tricked.
            </li>
            <li>
              <strong>Out-of-band verification:</strong> for payments or password resets, call back
              on a number you already hold, not the one in the message.
            </li>
            <li>
              <strong>Easy reporting:</strong> a one-click "report phishing" button turns every
              employee into a sensor. Thank people who report, even false alarms.
            </li>
            <li>
              <strong>Physical rules:</strong> badges, visitor escorts, and a polite culture of
              challenging unknown faces.
            </li>
            <li>
              <strong>Least privilege:</strong> if one account is fooled, the damage stays small.
            </li>
          </ul>
          <Callout tone="tip">
            Blame-free culture matters more than perfect training. People hide a mistake when they
            fear punishment, and that delays the response by hours.
          </Callout>
        </>
      ),
    },
    {
      id: "measure",
      title: "Measuring awareness training",
      body: (
        <>
          <p>
            Organisations run authorised phishing simulations and track two numbers. Illustrative
            example: 400 staff receive a test email. 52 click the link, and 30 report it.
          </p>
          <pre>
            <code>{`click rate  = 52 / 400 = 0.13   = 13%
report rate = 30 / 400 = 0.075  = 7.5%`}</code>
          </pre>
          <p>
            After training, 26 click. That's 26 / 400 = 6.5%, so the click rate halved. The healthier
            sign is the report rate rising, since someone who reports gives the security team a
            head start.
          </p>
          <Callout tone="warn">
            Run simulations only with written approval from the organisation, and never send
            deceptive messages to people outside a scope you've been given.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Social engineering exploits trust, urgency, authority and helpfulness, not software flaws.",
    "Know the forms: phishing, spear phishing, whaling, smishing, vishing, pretexting, tailgating and baiting.",
    "Check sender domains, link targets and SPF, DKIM and DMARC results.",
    "FIDO2 or passkey MFA and call-back verification beat training alone.",
    "Make reporting easy and blame-free, and measure report rate as well as click rate.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which control best stops a convincing fake login page from capturing a usable login?",
      options: [
        "A longer password",
        "SMS one-time codes",
        "Annual awareness slides",
        "A FIDO2 security key",
      ],
      answer: 3,
      explain: "Security keys are bound to the genuine site's domain, so a lookalike page can't use them.",
    },
    {
      kind: "mcq",
      q: "A caller says he is from IT and needs your password right now. This is mainly an example of:",
      options: ["Pretexting with urgency", "A brute force attack", "Packet sniffing", "Tailgating"],
      answer: 0,
      explain: "An invented scenario (pretext) plus time pressure is the classic pattern.",
    },
    {
      kind: "text",
      q: "What is phishing by phone call called? One word.",
      format: "*******",
      accept: ["vishing"],
      explain: "Vishing means voice phishing.",
    },
    {
      kind: "text",
      q: "What is phishing by SMS text message called? One word.",
      format: "********",
      accept: ["smishing"],
      explain: "Smishing is SMS phishing.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Distinguish brute force, spraying, credential stuffing and offline cracking",
    "Estimate password strength with entropy arithmetic",
    "Explain pass-the-hash and apply the controls that stop password attacks",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why passwords are attacked so often",
      body: (
        <>
          <p>
            A valid login is the easiest way in. It needs no exploit, and it looks like normal
            activity in the logs. Attackers use passwords in two settings, and the defences differ
            for each.
          </p>
          <ul>
            <li>
              <strong>Online attacks</strong> guess against a live login page or service. They are
              slow and noisy, and the service can rate-limit or lock them out.
            </li>
            <li>
              <strong>Offline attacks</strong> start with a stolen file of password hashes. The
              attacker guesses on their own hardware with no limits and no logs on your side. Here
              the only protection is how slow and well-salted your hash is.
            </li>
          </ul>
          <Callout tone="warn">
            Only test passwords on systems you own or have written permission to test. Guessing
            logins on someone else's service is a crime in most places.
          </Callout>
        </>
      ),
    },
    {
      id: "types",
      title: "The attack types",
      body: (
        <>
          <Table
            head={["Attack", "Idea", "Key defence"]}
            rows={[
              ["Brute force", "Try every combination", "Length, rate limits, slow hashing"],
              ["Dictionary", "Try common words and known passwords", "Block common and breached passwords"],
              ["Hybrid", "Dictionary words plus tweaks like a trailing 1!", "Same, plus length"],
              ["Password spraying", "One or few common passwords across many accounts", "MFA, detect spread across accounts"],
              ["Credential stuffing", "Replay leaked email and password pairs from other sites", "MFA, unique passwords, breach checks, bot defences"],
              ["Rainbow table", "Look up precomputed hash results", "Per-user random salts"],
              ["Pass-the-hash", "Reuse a captured hash as if it were the password", "Least privilege, credential protection, MFA, segmentation"],
            ]}
          />
          <p>
            <strong>Spraying</strong> defeats lockout on purpose. If your account locks after 5
            failures, an attacker tries just one password on each of 1,000 accounts. Every account
            sees one failure and none locks, but a few use a weak password. <strong>Credential
            stuffing</strong> works because people reuse one password across many sites. When site
            A leaks, the attacker simply tests those pairs on site B.
          </p>
          <p>
            Pass-the-hash applies to authentication schemes where the hash itself is the proof, such
            as Windows NTLM. The attacker never needs the original password. Stealing the hash from
            memory on one machine is enough to log in to others that accept it. This is why local
            admin passwords must differ on every machine, and why privileged accounts should not log
            in to ordinary workstations.
          </p>
        </>
      ),
    },
    {
      id: "entropy",
      title: "Strength: the arithmetic",
      body: (
        <>
          <p>
            A password's strength is how many guesses an attacker needs. For random choices:
          </p>
          <Formula>entropy (bits) = length × log2(pool size)</Formula>
          <p>Compare two choices, with illustrative numbers:</p>
          <Table
            head={["Choice", "Pool", "Entropy"]}
            rows={[
              ["8 random characters from 94 printable", "94", "8 × 6.55 ≈ 52 bits"],
              ["4 random words from a 7,776-word list", "7,776", "4 × 12.92 ≈ 52 bits"],
              ["6 random words from the same list", "7,776", "6 × 12.92 ≈ 78 bits"],
            ]}
          />
          <p>
            A four-word phrase is as strong as eight random symbols but much easier to remember. Six
            words is far stronger. The word "random" is the catch. Human-chosen passwords are
            much weaker than the formula suggests, because people pick predictable patterns.
          </p>
          <p>
            Now the cost of guessing. The full space of 8 characters from 94 is 94<sup>8</sup>, about
            6.1 × 10<sup>15</sup>. Suppose an attacker with a stolen file of fast, unsalted hashes
            makes 10 billion guesses per second (illustrative):
          </p>
          <pre>
            <code>{`6.1e15 / 1e10 = 610,000 seconds  =  about 7 days`}</code>
          </pre>
          <p>
            If the same passwords were stored with a deliberately slow hash that limits the attacker
            to 10,000 guesses per second (also illustrative):
          </p>
          <pre>
            <code>{`6.1e15 / 1e4 = 6.1e11 seconds  =  about 19,000 years`}</code>
          </pre>
          <p>
            The password is identical in both cases. Only the storage changed. That's the power of
            slow hashing.
          </p>
        </>
      ),
    },
    {
      id: "storage",
      title: "Storing passwords correctly",
      body: (
        <>
          <p>
            Never store passwords in plain text or with a fast hash such as plain SHA-256 or MD5.
            Use a purpose-built password hash (Argon2id, scrypt, bcrypt or PBKDF2) with a unique
            random <strong>salt</strong> per user. The salt makes identical passwords hash
            differently and kills rainbow tables. A sketch using Python's standard library:
          </p>
          <pre>
            <code>{`import hashlib, hmac, os

def hash_password(password: str) -> tuple[bytes, bytes]:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return salt, digest

def verify(password: str, salt: bytes, digest: bytes) -> bool:
    candidate = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return hmac.compare_digest(candidate, digest)`}</code>
          </pre>
          <p>
            Tune cost parameters to what your servers can afford, and review them as hardware gets
            faster. In production, prefer a well-reviewed library and the parameters it recommends.
          </p>
        </>
      ),
    },
    {
      id: "detect",
      title: "Detecting and stopping them",
      body: (
        <>
          <p>
            Brute force shows up as many failures against one account. Spraying and stuffing show
            up differently: many accounts, few attempts each, from one source or a botnet. An
            illustrative log excerpt:
          </p>
          <pre>
            <code>{`10:02:01 FAIL user=alice  src=203.0.113.20
10:02:02 FAIL user=bob    src=203.0.113.20
10:02:03 FAIL user=carol  src=203.0.113.20
10:02:04 FAIL user=dave   src=203.0.113.20`}</code>
          </pre>
          <p>
            One source failing for four different users in four seconds is a spray pattern. A
            simple rule in Python-like pseudo-logic:
          </p>
          <pre>
            <code>{`# per source IP, in a 10 minute window
if len(set(failed_usernames[src])) >= 10:
    alert("possible password spraying", src)`}</code>
          </pre>
          <p>The control set, in priority order:</p>
          <ul>
            <li><strong>MFA</strong> on every account that supports it, preferably phishing-resistant.</li>
            <li>Rate limiting and bot defences on login endpoints.</li>
            <li>Screening new passwords against breached and common lists, and favouring length. Current NIST guidance (SP 800-63B) advises against forced periodic changes without cause.</li>
            <li>Password managers, so every site gets a unique password.</li>
            <li>Alerting on the log patterns above.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Online attacks are limited by the service; offline attacks are limited only by your hash.",
    "Spraying avoids lockout by spreading guesses over many accounts; stuffing exploits password reuse.",
    "Entropy is length × log2(pool size), and it only applies to truly random choices.",
    "Store passwords with a slow, salted hash such as Argon2id, scrypt, bcrypt or PBKDF2.",
    "MFA, unique passwords and log detection beat complexity rules.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does a unique random salt per user matter?",
      options: [
        "It makes passwords shorter",
        "It speeds up login",
        "It encrypts the database",
        "It stops precomputed tables and makes equal passwords hash differently",
      ],
      answer: 3,
      explain: "Salts force attackers to attack each hash separately.",
    },
    {
      kind: "mcq",
      q: "One attacker tries the password 'Summer2025!' on 1,000 accounts, once each. What is it?",
      options: ["Credential stuffing", "Password spraying", "Pass-the-hash", "Rainbow table lookup"],
      answer: 1,
      explain: "One common password across many accounts is spraying, and it avoids per-account lockout.",
    },
    {
      kind: "text",
      q: "How many possible 4-digit PINs exist (0000 to 9999)? Digits only.",
      format: "*****",
      accept: ["10000", "10,000"],
      explain: "10 choices per digit, so 10 × 10 × 10 × 10 = 10,000.",
    },
    {
      kind: "text",
      q: "Replaying leaked email and password pairs from one site on other sites is called credential what? One word.",
      format: "********",
      accept: ["stuffing"],
      explain: "Credential stuffing relies on password reuse.",
    },
  ],
};

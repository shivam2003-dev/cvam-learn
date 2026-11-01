import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain what a cryptographic hash is and list the properties that make it useful",
    "Use hashes to check file integrity",
    "Explain why passwords need a salt and a deliberately slow algorithm",
    "Choose sensible algorithms for integrity, message authentication and password storage",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Two everyday problems look different but share one answer. First: how do you know a
            large download was not damaged or altered on the way? Second: how can a website check
            your password without keeping a copy of it that a thief could read?
          </p>
          <p>
            Both are solved by a <strong>cryptographic hash function</strong>. It turns any input
            into a short, fixed-size fingerprint called a <strong>digest</strong>. Think of a
            meat grinder: you can turn a steak into mince easily, but nobody can turn mince back
            into the original steak. And a different steak gives different mince.
          </p>
        </>
      ),
    },
    {
      id: "properties",
      title: "What a good hash must do",
      body: (
        <>
          <Table
            head={["Property", "Meaning"]}
            rows={[
              ["Deterministic", "The same input always gives the same digest"],
              ["Fixed size", "A 1-byte input and a 1-GB input both give the same digest length"],
              ["Fast to compute", "Good for integrity checks (a drawback for passwords, as you will see)"],
              ["Avalanche effect", "Changing one bit of input changes about half the output bits"],
              ["Preimage resistance", "Given a digest, you cannot feasibly find an input that produces it"],
              ["Collision resistance", "You cannot feasibly find two different inputs with the same digest"],
            ]}
          />
          <p>
            Hashing is <strong>not encryption</strong>. Encryption is reversible with a key. A hash
            has no key and no way back. You can only guess inputs and compare digests.
          </p>
          <p>
            You can see the avalanche effect on your own machine. Adding a single full stop
            changes the whole result:
          </p>
          <pre>
            <code>{`$ printf 'hello'  | sha256sum
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824  -
$ printf 'hello.' | sha256sum
1589999b0ca6ef8814283026a9f166d51c70a910671c3d44049755f07f2eb910  -`}</code>
          </pre>
          <p>
            (On macOS use <code>shasum -a 256</code> instead of <code>sha256sum</code>.) SHA-256
            gives 256 bits. Each hex character encodes 4 bits, so the digest is 256 ÷ 4 = 64
            characters long, whatever you feed in.
          </p>
        </>
      ),
    },
    {
      id: "algorithms",
      title: "Which algorithm, for which job",
      body: (
        <>
          <Table
            head={["Algorithm", "Digest size", "Status", "Use it for"]}
            rows={[
              ["MD5", "128 bits", "Broken for collisions", "Not for security. Only non-security checksums"],
              ["SHA-1", "160 bits", "Practical collision shown in 2017; deprecated", "Not for new security uses"],
              ["SHA-256 / SHA-512 (SHA-2 family)", "256 / 512 bits", "Considered strong", "File integrity, signatures, general hashing"],
              ["SHA-3", "Several sizes", "Considered strong, different internal design", "Alternative to SHA-2"],
              ["bcrypt, scrypt, Argon2", "Configurable", "Designed to be slow on purpose", "Storing passwords"],
            ]}
          />
          <p>
            A collision means two different inputs share a digest. That lets an attacker craft a
            harmless file and a malicious file that appear to match. With a 256-bit hash, finding
            a collision by brute force takes on the order of 2^128 operations (the birthday
            bound), which is far out of reach.
          </p>
          <Callout tone="tip">
            For integrity, publish the digest through a different channel than the file, or sign
            it. If an attacker can replace both the file and its digest on the same page, the check
            proves nothing.
          </Callout>
          <p>
            Hashes also protect against tampering when a secret is involved. <strong>HMAC</strong>{" "}
            mixes a secret key into the hash so only someone holding the key can produce a valid
            tag. It is used to authenticate messages, for example signing webhook requests.
          </p>
        </>
      ),
    },
    {
      id: "passwords",
      title: "Storing passwords: salt and slow",
      body: (
        <>
          <p>
            Never store passwords in plain text, and never store them with reversible encryption
            when you do not need to read them back. Store a hash. At login, hash what the user
            typed and compare. But a plain hash has two weaknesses.
          </p>
          <p>
            <strong>Weakness 1: identical passwords give identical hashes.</strong> If thousands of
            users picked the same common password, one cracked hash exposes them all. Attackers
            also keep huge precomputed lists of hashes (lookup tables, including{" "}
            <em>rainbow tables</em>) for common passwords.
          </p>
          <p>
            The fix is a <strong>salt</strong>: a random value, unique per user, stored beside the
            hash and mixed in before hashing. It is not secret. Its job is to make every stored
            hash unique, so precomputed tables are useless and each password must be attacked
            separately.
          </p>
          <Formula>stored = salt + hash(salt + password)</Formula>
          <p>
            <strong>Weakness 2: fast hashes are fast to guess.</strong> The same speed that makes
            SHA-256 good for files makes it good for attackers testing guesses. Compare an
            eight-letter lowercase password:
          </p>
          <pre>
            <code>{`Possible passwords: 26^8 = 208,827,064,576  (about 2.1 x 10^11)

Illustrative guess rates:
Fast hash,  10,000,000,000 guesses/s  -> about 21 seconds
Slow hash,          10,000 guesses/s  -> 208,827,064,576 / 10,000
                                         = 20,882,706 s  = about 242 days`}</code>
          </pre>
          <p>
            Those speeds are illustrative and vary by hardware, but the gap is the point. Password
            hashes such as bcrypt, scrypt and Argon2 (specified in RFC 9106) are built to be
            slow and, in the case of scrypt and Argon2, to need a lot of memory, which limits
            parallel guessing. They also generate and store the salt for you. Real attackers try
            likely passwords first, so length and uniqueness matter more than this worst case
            suggests.
          </p>
          <pre>
            <code>{`import hashlib, hmac, os

def hash_password(password: str):
    salt = os.urandom(16)                       # unique per user
    digest = hashlib.scrypt(password.encode(), salt=salt,
                            n=2**14, r=8, p=1, dklen=32)
    return salt, digest                         # store both

def check_password(password: str, salt: bytes, expected: bytes) -> bool:
    digest = hashlib.scrypt(password.encode(), salt=salt,
                            n=2**14, r=8, p=1, dklen=32)
    return hmac.compare_digest(digest, expected)  # constant-time compare`}</code>
          </pre>
          <p>
            This is a teaching sketch. In production prefer a maintained library that handles
            encoding, parameters and upgrades, and tune the cost settings to your hardware.
          </p>
          <Callout tone="warn">
            Only analyse password hashes that you own or are authorised to audit, such as your own
            lab data. Cracking other people&apos;s credentials is illegal in most places.
          </Callout>
        </>
      ),
    },
    {
      id: "extras",
      title: "Extra safeguards and common mistakes",
      body: (
        <>
          <ul>
            <li>
              <strong>Pepper:</strong> a secret value added to every password, kept outside the
              database (for example in a secrets manager). If only the database leaks, the pepper
              is still unknown.
            </li>
            <li>
              <strong>Constant-time comparison:</strong> compare digests with a function made for
              it, so response time does not leak how many leading bytes matched.
            </li>
            <li>
              <strong>Upgrade path:</strong> store the algorithm and cost with each hash so you can
              raise the cost or switch algorithms and re-hash users when they next sign in.
            </li>
            <li>
              <strong>Do not invent your own scheme</strong>, such as hashing twice or hiding the
              salt. Use a well-reviewed password hashing function.
            </li>
          </ul>
          <p>
            Defenders also use hashes to spot known-bad files: security tools compare a file&apos;s
            digest with lists of known malware. That only catches exact copies, since changing a
            single byte yields a new digest.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "A hash turns any input into a fixed-size fingerprint that cannot be reversed.",
    "A small change in input changes the whole digest, which makes tampering visible.",
    "Avoid MD5 and SHA-1 for security; use SHA-256 or stronger for integrity.",
    "Passwords need a unique salt and a deliberately slow algorithm such as bcrypt, scrypt or Argon2.",
    "Publish file digests separately from the file, or sign them, otherwise the check proves little.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main purpose of a salt?",
      options: [
        "To make hashing faster",
        "To encrypt the password so it can be decrypted later",
        "To make identical passwords produce different hashes and defeat precomputed tables",
        "To keep the password hash secret",
      ],
      answer: 2,
      explain: "A unique random salt per user means precomputed tables no longer work and one cracked hash does not reveal others. The salt itself is not secret.",
    },
    {
      kind: "mcq",
      q: "Which is the best choice for storing user passwords?",
      options: ["Argon2 or bcrypt with a per-user salt", "SHA-256 of the password", "MD5 of the password", "AES encryption with one shared key"],
      answer: 0,
      explain: "Password hashes like Argon2 and bcrypt are slow by design and handle salting. Fast hashes are easy to brute force, and reversible encryption lets a stolen key reveal every password.",
    },
    {
      kind: "text",
      q: "How many hexadecimal characters are in a SHA-256 digest?",
      format: "**",
      accept: ["64"],
      explain: "256 bits ÷ 4 bits per hex character = 64 characters.",
    },
    {
      kind: "text",
      q: "A hash function is described as one-way. Which property says you cannot work backwards from a digest to an input? Two words.",
      format: "******** **********",
      accept: ["preimage resistance", "pre-image resistance", "preimage resistant"],
      explain: "Preimage resistance means that given a digest, finding an input that produces it is infeasible.",
    },
  ],
};

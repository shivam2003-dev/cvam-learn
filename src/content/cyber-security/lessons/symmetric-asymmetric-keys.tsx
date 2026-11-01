import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Hard",
  objectives: [
    "Contrast symmetric and asymmetric encryption and say when each is used",
    "Count how many keys a group needs under each approach",
    "Walk through a Diffie-Hellman key exchange with small numbers",
    "Explain how digital signatures work and why real systems combine both kinds of cryptography",
  ],
  tasks: [
    {
      id: "symmetric",
      title: "Symmetric encryption: one shared key",
      body: (
        <>
          <p>
            The problem: you want to send data across a network where others can listen, and keep
            it unreadable to them. <strong>Encryption</strong> scrambles plaintext into
            ciphertext using an algorithm and a key. In <strong>symmetric</strong> encryption the
            same key locks and unlocks the data, like a house key that both locks and opens one
            door.
          </p>
          <p>
            The standard algorithm is <strong>AES</strong> (Advanced Encryption Standard). It works
            on 128-bit blocks and allows 128, 192 or 256-bit keys. Another well-regarded choice is
            ChaCha20-Poly1305. Symmetric ciphers are fast, so they handle bulk data: disks, files,
            and the body of every secure web connection.
          </p>
          <p>
            The algorithm is only half the story. The <strong>mode</strong> decides how blocks are
            chained.
          </p>
          <Table
            head={["Mode", "Verdict", "Why"]}
            rows={[
              ["ECB", "Avoid", "Identical plaintext blocks give identical ciphertext blocks, so patterns in the data show through"],
              ["CBC", "Legacy, needs care", "Hides patterns but gives no integrity check; mistakes in padding handling have led to real attacks"],
              ["GCM", "Preferred", "Authenticated encryption: it hides the data and detects any tampering"],
            ]}
          />
          <pre>
            <code>{`# pip install cryptography
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

key = AESGCM.generate_key(bit_length=256)   # keep this secret
aes = AESGCM(key)
nonce = os.urandom(12)                       # must be unique for every message
ciphertext = aes.encrypt(nonce, b"payroll.csv contents", b"header-v1")
plaintext = aes.decrypt(nonce, ciphertext, b"header-v1")   # raises if altered`}</code>
          </pre>
          <Callout tone="warn" title="Never reuse a nonce with the same key">
            In GCM, reusing a nonce under one key can destroy the confidentiality and
            authenticity guarantees. Generate a fresh nonce for every message and send it
            alongside the ciphertext. It is not secret.
          </Callout>
          <p>
            The hard part of symmetric crypto is not the maths but sharing the key. How do two
            people agree on a secret over a line that others can read?
          </p>
        </>
      ),
    },
    {
      id: "asymmetric",
      title: "Asymmetric encryption: a key pair",
      body: (
        <>
          <p>
            First, the scale of the problem. If every pair among n people needs its own shared
            key, the number of keys is n × (n − 1) ÷ 2.
          </p>
          <Formula>pairwise keys = n × (n − 1) ÷ 2</Formula>
          <Table
            head={["People (n)", "Symmetric pairwise keys", "Asymmetric keys (one pair each)"]}
            rows={[
              ["10", "10 × 9 ÷ 2 = 45", "10 pairs (20 keys)"],
              ["12", "12 × 11 ÷ 2 = 66", "12 pairs (24 keys)"],
              ["100", "100 × 99 ÷ 2 = 4,950", "100 pairs (200 keys)"],
            ]}
          />
          <p>
            <strong>Asymmetric</strong> (public-key) cryptography fixes this. Each person has a{" "}
            <strong>key pair</strong>: a <strong>public key</strong> they hand out freely and a{" "}
            <strong>private key</strong> they never share. The two are mathematically linked, but
            you cannot practically work out the private key from the public one. Think of a
            mailbox with a slot: anyone can post a letter in (public key), but only the owner has
            the key to open it (private key).
          </p>
          <Table
            head={["Goal", "Use", "Who can do it"]}
            rows={[
              ["Confidentiality", "Encrypt with the recipient's public key; decrypt with their private key", "Anyone can encrypt; only the owner can decrypt"],
              ["Authenticity and integrity", "Sign with your private key; verify with your public key", "Only the owner can sign; anyone can verify"],
            ]}
          />
          <p>
            Common algorithms: <strong>RSA</strong> (based on the difficulty of factoring large
            numbers) and <strong>elliptic-curve cryptography</strong> (ECC; examples include P-256
            and Curve25519). Per NIST guidance, RSA with a 2048-bit key offers roughly the same
            strength as a 112-bit symmetric key, while a 256-bit elliptic-curve key is roughly
            128-bit strength. That is why ECC keys are far smaller. The catch: asymmetric
            operations are much slower than AES, so they are used for small jobs only.
          </p>
        </>
      ),
    },
    {
      id: "key-exchange",
      title: "Key exchange: agreeing a secret in public",
      body: (
        <>
          <p>
            <strong>Diffie-Hellman (DH)</strong> lets two parties build a shared secret while an
            eavesdropper sees everything they send. Paint mixing is the standard analogy: each
            side mixes a secret colour into a shared base colour and swaps the results. Mixing in
            your own secret colour again gives both sides the same final colour, but separating the
            mixes is infeasible for the listener.
          </p>
          <p>
            The real thing uses modular arithmetic. Here are toy numbers. Real systems use values
            hundreds of digits long, or elliptic curves; never use numbers this small for security.
          </p>
          <pre>
            <code>{`Public values:  p = 23 (modulus),  g = 5 (base)

Alice picks secret a = 6   sends A = g^a mod p = 5^6  mod 23 = 8
Bob   picks secret b = 15  sends B = g^b mod p = 5^15 mod 23 = 19

Alice computes  B^a mod p = 19^6  mod 23 = 2
Bob   computes  A^b mod p = 8^15  mod 23 = 2

Shared secret = 2. An eavesdropper saw 23, 5, 8 and 19 only.`}</code>
          </pre>
          <p>
            Both reach the same number because (g^a)^b = (g^b)^a. With big numbers, going from A
            back to a is the <em>discrete logarithm problem</em>, which is believed to be hard. The
            shared secret is then fed into a key derivation function to produce the AES key.
          </p>
          <Callout tone="note" title="Raw DH has no identity">
            A person in the middle could run one exchange with Alice and another with Bob, and
            relay messages between them. DH alone cannot tell you who you are talking to. That is
            why real protocols add signatures and certificates, covered in the TLS lesson.
          </Callout>
        </>
      ),
    },
    {
      id: "signatures-hybrid",
      title: "Signatures and the hybrid approach",
      body: (
        <>
          <p>
            A <strong>digital signature</strong> proves who made something and that it has not
            changed. The signer hashes the message, then uses their private key on that hash.
            Anyone with the public key can check it. If even one bit of the message changes, the
            check fails. That is also the basis of non-repudiation: only the key holder could have
            produced the signature.
          </p>
          <p>
            Real systems use <strong>hybrid encryption</strong>, taking the best of both:
          </p>
          <ol>
            <li>Use asymmetric cryptography (key exchange and signatures) to agree on a fresh key and prove identity.</li>
            <li>Use that key with a fast symmetric cipher such as AES-GCM for the actual data.</li>
          </ol>
          <Table
            head={["", "Symmetric", "Asymmetric"]}
            rows={[
              ["Keys", "One shared secret", "Public and private pair"],
              ["Speed", "Very fast", "Much slower"],
              ["Main use", "Bulk data encryption", "Key exchange, signatures, identity"],
              ["Hard problem", "Sharing the key safely", "Proving a public key really belongs to its owner"],
              ["Examples", "AES, ChaCha20", "RSA, ECC, Diffie-Hellman"],
            ]}
          />
          <p>
            That last cell leads to certificates and PKI: how you learn that a public key is
            genuine. Also note that large quantum computers, if built at scale, would threaten RSA
            and today&apos;s elliptic-curve schemes. Standards bodies including NIST have already
            published post-quantum algorithms, and migration planning is under way.
          </p>
        </>
      ),
    },
    {
      id: "hands-on",
      title: "Try it on your own machine",
      body: (
        <>
          <p>
            With OpenSSL 3 you can generate a key pair and sign a file locally. Run these only in a
            scratch folder on a machine you own.
          </p>
          <pre>
            <code>{`# Create an Ed25519 key pair
openssl genpkey -algorithm ed25519 -out key.pem
openssl pkey -in key.pem -pubout -out pub.pem
chmod 600 key.pem                      # the private key stays private

# Sign a message and verify it
echo "pay 10" > msg.txt
openssl pkeyutl -sign -inkey key.pem -rawin -in msg.txt -out sig.bin
openssl pkeyutl -verify -pubin -inkey pub.pem -rawin -in msg.txt -sigfile sig.bin
# Signature Verified Successfully

# Change the message and verify again
echo "pay 99" > msg.txt
openssl pkeyutl -verify -pubin -inkey pub.pem -rawin -in msg.txt -sigfile sig.bin
# Signature Verification Failure`}</code>
          </pre>
          <p>
            Good key hygiene matters more than clever algorithms:
          </p>
          <ul>
            <li>Generate keys with a vetted library or tool, never your own random code.</li>
            <li>Keep private keys out of source control, chat and tickets. Use a secrets manager or hardware module where possible.</li>
            <li>Rotate keys on a schedule and immediately after any suspected exposure.</li>
            <li>Use separate keys for separate purposes, and plan how you will revoke and replace each one.</li>
            <li>Do not design your own cipher or protocol. Use standard algorithms through reviewed libraries.</li>
          </ul>
          <Callout tone="warn">
            Only handle keys and traffic that you own or are authorised to work with. Intercepting
            or decrypting other people&apos;s communications is illegal in most places.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Symmetric encryption uses one shared key and is fast; AES-GCM is the standard choice and hides and authenticates data.",
    "Asymmetric cryptography uses a public and private key pair, solves key distribution, but is slower.",
    "Pairwise symmetric keys grow as n × (n − 1) ÷ 2, which is why public-key methods scale better.",
    "Diffie-Hellman agrees a shared secret in public, but needs signatures and certificates to prove who is on the other end.",
    "Real protocols are hybrid: asymmetric for key exchange and identity, symmetric for bulk data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Alice signs a document. Which key does Bob use to verify the signature?",
      options: ["Bob's private key", "Alice's public key", "Alice's private key", "A shared symmetric key"],
      answer: 1,
      explain: "Alice signs with her private key. Anyone verifies with her public key.",
    },
    {
      kind: "mcq",
      q: "Why do real protocols such as secure web connections use both symmetric and asymmetric cryptography?",
      options: [
        "Asymmetric is faster for bulk data",
        "Symmetric keys never need to be shared",
        "Two layers are required by law",
        "Asymmetric solves key exchange and identity, while symmetric is fast for the data itself",
      ],
      answer: 3,
      explain: "Asymmetric methods set up a shared key and prove identity. A fast symmetric cipher then protects the data.",
    },
    {
      kind: "text",
      q: "How many pairwise symmetric keys does a group of 12 people need so every pair can talk privately?",
      format: "**",
      accept: ["66"],
      explain: "n × (n − 1) ÷ 2 = 12 × 11 ÷ 2 = 66.",
    },
    {
      kind: "text",
      q: "In the toy Diffie-Hellman example (p = 23, g = 5, a = 6, b = 15), what is the shared secret?",
      format: "*",
      accept: ["2"],
      explain: "Alice computes 19^6 mod 23 = 2 and Bob computes 8^15 mod 23 = 2.",
    },
  ],
};

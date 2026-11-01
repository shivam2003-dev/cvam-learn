import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Define RPO and RTO and use them to choose a backup schedule",
    "Apply the 3-2-1 rule and its modern extension",
    "Compare full, incremental and differential backups with real numbers",
    "Explain why ransomware targets backups and how immutability and restore tests defend them",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: things will fail",
      body: (
        <>
          <p>
            Every system loses data eventually. Disks die, people delete the wrong folder, a bad
            deployment corrupts a database, a building floods, or an attacker encrypts everything
            and demands payment. Prevention lowers the odds, but it never reaches zero. A backup is
            your last line of defence: a separate copy you can restore from when everything else
            has failed.
          </p>
          <p>
            <strong>Resilience</strong> is the wider idea. It means the business keeps running, or
            returns quickly, when something goes wrong. Backups are one part. Others are redundancy
            (a second server ready to take over), tested recovery plans, and clear owners who know
            what to do at 3 a.m.
          </p>
          <p>
            Think of a spare tyre. It does nothing for you while the car runs well. Its value shows
            up on the worst day, and only if it is inflated, fits the car, and you know how to
            change it. A backup that has never been restored is a spare tyre nobody has checked.
          </p>
        </>
      ),
    },
    {
      id: "rpo-rto",
      title: "Two numbers that drive everything: RPO and RTO",
      body: (
        <>
          <p>Before choosing any tool, ask the business two questions.</p>
          <ul>
            <li>
              <strong>Recovery Point Objective (RPO):</strong> how much data can we afford to lose,
              measured in time? An RPO of 4 hours means that after a failure, losing the last 4
              hours of work is acceptable.
            </li>
            <li>
              <strong>Recovery Time Objective (RTO):</strong> how long can the service stay down?
              An RTO of 2 hours means it must be working again within 2 hours.
            </li>
          </ul>
          <p>
            RPO sets how often you back up. RTO sets how fast your restore path must be. They
            cost money in opposite directions: a tiny RPO needs frequent backups or live
            replication, and a tiny RTO needs fast storage and a practised procedure.
          </p>
          <Formula>worst-case data loss = time since the last good backup</Formula>
          <p>
            Worked example (illustrative): a payments database is backed up every 4 hours. If it
            fails just before the next run, you lose almost 4 hours of data. So the backup
            interval is 4 hours and the best RPO you can promise is 4 hours. If the business needs
            15 minutes, you need a different design, such as continuous log shipping.
          </p>
          <p>Now the RTO side. Suppose you must restore 625 GB over a link that sustains 100 MB/s:</p>
          <pre>
            <code>{`625 GB = 625,000 MB
625,000 MB ÷ 100 MB/s = 6,250 seconds
6,250 ÷ 3,600 ≈ 1.74 hours (about 1 h 44 min)`}</code>
          </pre>
          <p>
            That is only the data transfer. Add time to find the right backup, provision a server,
            and check the result. If the RTO is 1 hour, this plan fails on paper, and you want to
            learn that now, not during an outage.
          </p>
        </>
      ),
    },
    {
      id: "rule-321",
      title: "The 3-2-1 rule",
      body: (
        <>
          <p>
            The 3-2-1 rule is a simple pattern that survives most single failures:
          </p>
          <ul>
            <li>
              <strong>3</strong> copies of your data: the live data plus two backups.
            </li>
            <li>
              <strong>2</strong> different kinds of storage, so one fault type cannot take out
              both (for example local disk and cloud object storage).
            </li>
            <li>
              <strong>1</strong> copy off site, so a fire or flood at the main location does not
              destroy everything.
            </li>
          </ul>
          <p>
            Many teams now use an extended form, often written 3-2-1-1-0. The extra{" "}
            <strong>1</strong> is one copy that is offline or immutable. The <strong>0</strong>{" "}
            means zero errors after you verify the backups by restoring them. This addition exists
            because of ransomware, covered below.
          </p>
          <Table
            head={["Failure", "Does 3-2-1 help?", "Why"]}
            rows={[
              ["One disk dies", "Yes", "Other copies exist"],
              ["Office fire or flood", "Yes", "The off-site copy is elsewhere"],
              ["Someone deletes a folder", "Only if versioned", "A sync copy mirrors the deletion"],
              ["Ransomware encrypts everything reachable", "Only with an offline or immutable copy", "Online copies get encrypted too"],
            ]}
          />
          <Callout tone="note">
            Sync is not backup. A tool that mirrors a folder to the cloud copies your mistakes and
            your encrypted files just as faithfully as your good ones. A backup keeps older
            versions you can go back to.
          </Callout>
        </>
      ),
    },
    {
      id: "types",
      title: "Full, incremental and differential backups",
      body: (
        <>
          <ul>
            <li>
              <strong>Full:</strong> a copy of everything. Simple to restore, slow and large.
            </li>
            <li>
              <strong>Incremental:</strong> only what changed since the last backup of any kind.
              Small and fast, but a restore needs the full backup plus every incremental in order.
            </li>
            <li>
              <strong>Differential:</strong> everything changed since the last full backup. Grows
              each day, but a restore needs only the full plus the latest differential.
            </li>
          </ul>
          <p>
            Worked example (illustrative): a 500 GB dataset, a full backup every Sunday, and 25 GB
            of new changes each day that do not overlap. You restore on Friday evening.
          </p>
          <Table
            head={["Measure", "Incremental", "Differential"]}
            rows={[
              ["Mon to Sat daily sizes", "25 GB each", "25, 50, 75, 100, 125, 150 GB"],
              ["Stored Mon to Sat", "6 × 25 = 150 GB", "25+50+75+100+125+150 = 525 GB"],
              ["Weekly total with full", "650 GB", "1,025 GB"],
              ["Restore Friday needs", "Full + 5 incrementals", "Full + Friday differential"],
              ["Data to read for restore", "500 + 125 = 625 GB", "500 + 125 = 625 GB"],
              ["Backup sets involved", "6", "2"],
            ]}
          />
          <p>
            The data volume read is the same here, but incrementals need six sets to all be intact
            and in order. One corrupt link in the chain breaks everything after it. Differentials
            cost more storage and make restores simpler and safer. Many tools also offer
            deduplicated, snapshot-style repositories that hide this chain from you, but the trade
            is the same underneath.
          </p>
        </>
      ),
    },
    {
      id: "ransomware",
      title: "Surviving ransomware",
      body: (
        <>
          <p>
            <strong>Ransomware</strong> is malware that encrypts your files and demands payment
            for the key. Attackers know backups are your way out, so they hunt for them first.
            They look for backup servers, mounted network shares, cloud storage keys saved on
            machines they control, and backup admin accounts. Some also delete snapshots before
            encrypting anything.
          </p>
          <p>Defences, from cheapest up:</p>
          <ul>
            <li>
              <strong>Separate credentials.</strong> The account that runs backups should not be
              the domain admin, and domain admins should not be able to casually delete backups.
            </li>
            <li>
              <strong>Immutable storage.</strong> Write-once-read-many (WORM) storage refuses
              changes or deletes for a set retention period, even from an administrator. Several
              object stores and backup products offer this under names like object lock.
            </li>
            <li>
              <strong>Offline or air-gapped copy.</strong> Tape or a disk that is disconnected
              cannot be reached by malware on the network.
            </li>
            <li>
              <strong>Monitoring.</strong> Alert on mass deletions, failed backup jobs, and changes
              to retention settings.
            </li>
            <li>
              <strong>Tested restores.</strong> Practise the full path, including the credentials
              and documents you would need if your normal systems were down.
            </li>
          </ul>
          <Callout tone="warn" title="Watch out: untested backups">
            Many organisations discover during an incident that backups were incomplete, ran with
            an expired credential, or took longer to restore than the business could tolerate. A
            job that reports success is not proof you can restore. Schedule real restore tests
            and record the time they take.
          </Callout>
          <p>
            Here is a small, realistic example using the open-source tool restic on your own
            machine. It encrypts and deduplicates, and its commands show the pattern: back up,
            verify, then restore somewhere else.
          </p>
          <pre>
            <code>{`# one-time: create an encrypted repository
export RESTIC_PASSWORD_FILE=$HOME/.restic-pass
restic -r /srv/restic-repo init

# back up a folder
restic -r /srv/restic-repo backup $HOME/documents

# list snapshots and check repository integrity
restic -r /srv/restic-repo snapshots
restic -r /srv/restic-repo check

# prove it works: restore the latest snapshot to a scratch folder
restic -r /srv/restic-repo restore latest --target /tmp/restore-test`}</code>
          </pre>
          <p>
            Note that a repository on the same disk as the data only protects against mistakes. To
            meet 3-2-1 you would also copy it to a second medium and an off-site location.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "RPO is how much data you can lose; RTO is how long you can be down. Set them with the business first.",
    "3-2-1 means three copies, two media types, one off site. Add an offline or immutable copy and verified restores.",
    "Sync is not backup. You need versions you can go back to.",
    "Ransomware attacks backups, so isolate credentials and use immutable or offline storage.",
    "A backup you have not restored is only a hope. Test the restore and time it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A team backs up a database every 6 hours. What is the best RPO this schedule can promise?",
      options: ["15 minutes", "1 hour", "3 hours", "6 hours"],
      answer: 3,
      explain: "Worst case, the failure happens just before the next run, so up to 6 hours of data is lost.",
    },
    {
      kind: "mcq",
      q: "Which backup type needs only the last full backup plus the most recent copy to restore?",
      options: ["Incremental", "Plain folder sync", "Differential", "Mirror"],
      answer: 2,
      explain: "A differential holds everything changed since the last full, so full plus the latest differential is enough.",
    },
    {
      kind: "mcq",
      q: "Why is a folder synced to the cloud not a real backup?",
      options: [
        "Cloud storage is always too slow",
        "It cannot hold more than one file",
        "It copies deletions and encrypted files as faithfully as good ones",
        "Sync tools do not use the internet",
      ],
      answer: 2,
      explain: "Without older versions, a mistake or ransomware encryption is mirrored to the copy.",
    },
    {
      kind: "text",
      q: "You must restore 720 GB at a sustained 200 MB/s (1 GB = 1,000 MB). How many hours does the transfer take?",
      format: "*",
      accept: ["1", "1 hour", "one"],
      explain: "720,000 MB ÷ 200 MB/s = 3,600 seconds = 1 hour.",
    },
    {
      kind: "text",
      q: "In the 3-2-1 rule, how many copies of the data are kept in total (including the live data)?",
      format: "*",
      accept: ["3", "three"],
      explain: "Three copies: the live data plus two backups.",
    },
  ],
};

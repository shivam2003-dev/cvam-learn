import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Explain the order of volatility and why it decides what you collect first",
    "Describe evidence handling: chain of custody, write blockers and hashing",
    "Distinguish disk images from memory images and what each reveals",
    "Build a timeline from file and log timestamps, and estimate imaging time",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: evidence is fragile",
      body: (
        <>
          <p>
            After a security incident, people ask hard questions. What did the attacker do? What data
            was taken? Which accounts were used? Who was responsible? To answer with confidence, and
            sometimes in front of a court or regulator, you need evidence that is complete,
            unaltered and provably so.
          </p>
          <p>
            <strong>Digital forensics</strong> is the discipline of collecting, preserving and
            analysing digital evidence in a way that can be trusted. It has two enemies. The first
            is time: the most useful data, such as what is running in memory, disappears when power
            is lost. The second is the investigator. Opening a file, booting a laptop or plugging in
            a drive can change timestamps and overwrite data. Every careless action can make
            evidence weaker.
          </p>
          <p>
            Picture a crime scene. Investigators photograph before they touch, wear gloves, bag each
            item, and log who held it. Digital forensics applies the same habits to disks and
            memory.
          </p>
        </>
      ),
    },
    {
      id: "volatility",
      title: "Order of volatility",
      body: (
        <>
          <p>
            Collect the most short-lived data first. A guideline published as RFC 3227 lists the order,
            from most to least volatile:
          </p>
          <Table
            head={["Order", "Data", "How long it lasts"]}
            rows={[
              ["1", "CPU registers and cache", "Nanoseconds"],
              ["2", "Routing and ARP tables, process table, memory (RAM)", "Gone at power-off"],
              ["3", "Temporary file systems", "Often cleared at shutdown"],
              ["4", "Disk (files, free space, swap)", "Persists until overwritten"],
              ["5", "Remote logs and monitoring data", "Depends on retention"],
              ["6", "Physical configuration and network topology", "Slow to change"],
              ["7", "Archival media such as backups", "Long-lived"],
            ]}
          />
          <p>
            In practice, on a live suspect machine you capture memory before you image the disk,
            and you record the time and everything you did. If a machine is already powered off, the
            memory is gone, so you move straight to the disk.
          </p>
          <Callout tone="warn">
            Only examine devices you own or have written authority to investigate. Acquiring data
            from someone else's phone, laptop or account without permission can break privacy and
            computer misuse laws, even if you suspect wrongdoing. Involve legal counsel and HR first.
          </Callout>
        </>
      ),
    },
    {
      id: "handling",
      title: "Handling evidence properly",
      body: (
        <>
          <p>Four habits separate trustworthy forensics from guesswork.</p>
          <ul>
            <li>
              <strong>Chain of custody.</strong> A written record of every person who held the
              evidence, when, why, and where it was stored. A gap in the chain gives the other side
              a reason to question it.
            </li>
            <li>
              <strong>Work on copies.</strong> Make a bit-for-bit <strong>forensic image</strong> of
              the drive, meaning every sector including deleted and empty space, and analyse the
              copy. The original is stored safely and untouched.
            </li>
            <li>
              <strong>Write blockers.</strong> A hardware (or software) device between the drive and
              your computer lets you read but physically prevents writes, so the evidence is not
              changed by being connected.
            </li>
            <li>
              <strong>Hash everything.</strong> A cryptographic hash is a fixed-length fingerprint of
              data. Hash the original and the image. If they match, the copy is exact. Re-hash later to
              show nothing has changed. Use SHA-256; MD5 and SHA-1 have known collision weaknesses.
            </li>
          </ul>
          <p>
            On your own lab machine, with a spare disk you own and are free to wipe, the pattern
            looks like this. The device name is an example, so always confirm with <code>lsblk</code>{" "}
            first, because pointing a copy command at the wrong device destroys data:
          </p>
          <pre>
            <code>{`# identify the lab disk (read-only listing)
lsblk

# image it to a file (lab disk /dev/sdb is an example)
sudo dd if=/dev/sdb of=evidence.img bs=4M conv=noerror,sync status=progress

# fingerprint the source and the image, then compare
sudo sha256sum /dev/sdb evidence.img

# store the hash in your case notes, and set the image read-only
chmod 444 evidence.img`}</code>
          </pre>
          <p>
            Real casework uses write blockers and dedicated imaging tools that also record hashes
            and errors. The idea is identical: copy, hash, verify, then work on the copy.
          </p>
          <p>
            Time is a real planning factor. Imaging speed is roughly disk size divided by the
            slowest link in the chain:
          </p>
          <Formula>imaging time = disk size ÷ sustained transfer rate</Formula>
          <p>
            Worked example (illustrative): a 500 GB disk at a sustained 150 MB/s is 500,000 MB ÷
            150 MB/s ≈ 3,333 seconds, about 56 minutes. Hashing adds another read pass, so plan for
            more time, and larger disks over slow USB links can take many hours.
          </p>
        </>
      ),
    },
    {
      id: "images",
      title: "Disk images and memory images",
      body: (
        <>
          <p>
            A <strong>disk image</strong> shows what is stored: files, deleted file remnants,
            browser history, program installation records, and the structure of the file system. It
            tells you what was <em>there</em>.
          </p>
          <p>
            A <strong>memory image</strong> is a capture of RAM. It shows what was{" "}
            <em>happening</em>: running processes, open network connections, loaded modules, and
            sometimes passwords or keys in use. Some malware lives only in memory and leaves little on
            disk, so the memory image may be the only place it appears. Tools such as WinPmem and LiME
            can capture memory, and the open-source framework Volatility analyses it. On a memory
            image you captured from your own lab VM, a first look at processes is:
          </p>
          <pre>
            <code>{`# Volatility 3: list processes in a Windows memory image from your lab
vol -f lab-memory.raw windows.pslist`}</code>
          </pre>
          <p>
            Analysts compare the process list with what should be running, and look for odd parent
            and child relationships, such as a document viewer launching a command shell.
          </p>
          <Table
            head={["", "Disk image", "Memory image"]}
            rows={[
              ["Shows", "Stored files and history", "Running state"],
              ["Survives power-off", "Yes", "No"],
              ["Typical size", "Whole disk capacity", "Size of installed RAM"],
              ["Good for", "Deleted files, user activity, persistence", "Live malware, connections, keys"],
            ]}
          />
        </>
      ),
    },
    {
      id: "timeline",
      title: "Building a timeline",
      body: (
        <>
          <p>
            The aim of most investigations is a <strong>timeline</strong>: a single ordered list of
            what happened and when. Pull timestamps from many places and merge them: file system
            times (often called MAC times, for modified, accessed and changed or created), event
            logs, browser history, and network logs. Open-source tools such as Plaso (log2timeline)
            automate this.
          </p>
          <pre>
            <code>{`02:11:40  Phishing email opened by user jsmith (mail log)
02:12:05  New process: document viewer starts a command shell (event 4688)
02:14:30  New scheduled task created (event 4698)
02:20:02  Large outbound transfer to 203.0.113.80 (flow data)
03:05:11  Security log cleared (event 1102)`}</code>
          </pre>
          <p>
            Timelines are only as good as their clocks. Check each source's time zone and its offset
            from real time, and write down the correction you applied. Finally, remember that
            timestamps can be altered by an attacker, so look for several sources that agree. A
            report should separate <em>facts</em> (this file has this hash) from{" "}
            <em>interpretation</em> (this suggests the attacker used it).
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Collect the most volatile evidence first: memory before disk, and note everything you do.",
    "Keep a chain of custody, use write blockers, and work on forensic copies, never the original.",
    "Hash original and image with SHA-256 to prove the copy is exact and unchanged.",
    "Disk images show what was stored; memory images show what was running.",
    "A timeline merges many sources, so check clocks and time zones before trusting it.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A suspect server is running and you are authorised to investigate. Which should you capture first?",
      options: ["The disk image", "The memory contents", "The backup tapes", "The network diagram"],
      answer: 1,
      explain: "Memory is far more volatile than disk and is lost at power-off, so it comes first.",
    },
    {
      kind: "mcq",
      q: "What is the main purpose of a hardware write blocker?",
      options: [
        "To speed up copying",
        "To encrypt the evidence",
        "To prevent writes to the original drive while it is read",
        "To compress the image",
      ],
      answer: 2,
      explain: "It lets you read the drive without changing it, which protects the integrity of the evidence.",
    },
    {
      kind: "mcq",
      q: "Which gives you the strongest proof that a forensic image is an exact copy of the source?",
      options: [
        "Matching file names",
        "Matching cryptographic hashes",
        "Matching file sizes",
        "A signed email from the owner",
      ],
      answer: 1,
      explain: "A matching SHA-256 hash means the content is identical bit for bit, with overwhelming probability.",
    },
    {
      kind: "text",
      q: "A 450 GB disk is imaged at a sustained 150 MB/s (1 GB = 1,000 MB). How many minutes does the copy take?",
      format: "**",
      accept: ["50", "50 minutes", "50 min"],
      explain: "450,000 MB ÷ 150 MB/s = 3,000 seconds = 50 minutes.",
    },
    {
      kind: "text",
      q: "Which hash algorithm, preferred over MD5 and SHA-1, is commonly used to verify image integrity? Give the name with its number.",
      format: "*******",
      accept: ["sha-256", "sha256", "sha 256"],
      explain: "SHA-256 is the usual choice because MD5 and SHA-1 have known collision weaknesses.",
    },
  ],
};

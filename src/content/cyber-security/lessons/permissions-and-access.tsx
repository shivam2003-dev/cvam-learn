import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Read and set Unix permissions in symbolic and octal form",
    "Calculate the effect of umask on new files and folders",
    "Explain ACLs and how they extend basic owner and group rules",
    "Apply least privilege, need to know and separation of duties",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: who may do what?",
      body: (
        <>
          <p>
            A computer holds many things: your files, other users' files, system settings, secrets. If
            every program and person could touch everything, one mistake or one piece of malware could
            ruin it all. <strong>Access control</strong> is how an operating system decides who can
            read, change or run each thing.
          </p>
          <p>
            Most real-world breaches get worse because an account had more access than it needed. A
            web server that can read the whole disk turns a small bug into a large leak. This lesson
            gives you the rules that keep damage small. The ideas are the same on Linux, Windows and
            macOS; only the commands differ.
          </p>
        </>
      ),
    },
    {
      id: "unix",
      title: "Unix permissions: owner, group, others",
      body: (
        <>
          <p>
            Every file has an <strong>owner</strong>, a <strong>group</strong> and three permission
            sets. Each set has read (<code>r</code>), write (<code>w</code>) and execute (
            <code>x</code>) bits. For a folder, execute means "may enter it".
          </p>
          <pre>
            <code>{`$ ls -l report.txt
-rw-r----- 1 alice finance 2048 Nov  2 09:15 report.txt

first character  -    a regular file (d would mean a folder)
next three       rw-  owner alice may read and write
next three       r--  group finance may read
last three       ---  others have no access`}</code>
          </pre>
          <p>
            Each bit has a number: read is 4, write is 2, execute is 1. Add them up per set to get
            the <strong>octal</strong> form.
          </p>
          <Formula>rw- = 4 + 2 + 0 = 6 &nbsp;|&nbsp; r-- = 4 &nbsp;|&nbsp; --- = 0</Formula>
          <p>
            So <code>rw-r-----</code> is <code>640</code>.
          </p>
          <Table
            head={["Mode", "Symbolic", "Typical use"]}
            rows={[
              ["600", "rw-------", "Private keys and secrets"],
              ["644", "rw-r--r--", "Normal readable files"],
              ["640", "rw-r-----", "Shared with one group only"],
              ["700", "rwx------", "Private scripts or folders"],
              ["755", "rwxr-xr-x", "Programs and public folders"],
              ["777", "rwxrwxrwx", "Anyone can change it: avoid"],
            ]}
          />
          <pre>
            <code>{`chmod 640 report.txt         # set by number
chmod g-r report.txt         # remove read from group
chown alice:finance report.txt
ls -ld ~/.ssh                # SSH folders should be 700, private keys 600`}</code>
          </pre>
          <Callout tone="warn">
            Making something <code>777</code> to "make the error go away" is a common and dangerous
            habit. It lets any user or compromised process rewrite the file. Find the real cause and
            grant the narrowest permission that works.
          </Callout>
        </>
      ),
    },
    {
      id: "umask",
      title: "Worked example: umask",
      body: (
        <>
          <p>
            When you create a file, the system starts from a default and removes bits listed in the{" "}
            <strong>umask</strong>. New files start from 666 (never executable by default) and new
            folders from 777.
          </p>
          <Formula>new mode = default mode AND NOT umask</Formula>
          <pre>
            <code>{`umask 022
files:   666 minus 022 = 644   (rw-r--r--)
folders: 777 minus 022 = 755   (rwxr-xr-x)

umask 077
files:   666 minus 077 = 600   (rw-------)
folders: 777 minus 077 = 700   (rwx------)`}</code>
          </pre>
          <p>
            (The subtraction works here because the umask digits only remove bits that are set.) A
            umask of 077 suits a machine that holds sensitive data: new files are private to their
            owner by default. Check yours with <code>umask</code>.
          </p>
        </>
      ),
    },
    {
      id: "special",
      title: "Special bits and ACLs",
      body: (
        <>
          <p>Three extra bits matter for security:</p>
          <ul>
            <li>
              <strong>setuid:</strong> the program runs with its owner's rights, not the caller's.
              Needed for tools like <code>passwd</code>, but any flaw in such a program can give an
              attacker its owner's power, usually root.
            </li>
            <li>
              <strong>setgid:</strong> same idea for the group; on folders, new files inherit the
              folder's group.
            </li>
            <li>
              <strong>sticky bit:</strong> on a shared folder such as <code>/tmp</code>, users can
              delete only their own files.
            </li>
          </ul>
          <p>
            A defender audits setuid programs on their own machine and compares the list with what is
            expected:
          </p>
          <pre>
            <code>{`find / -perm -4000 -type f 2>/dev/null`}</code>
          </pre>
          <p>
            The basic three-set model cannot say "alice may read, bob may write, everyone else
            nothing". For that there are <strong>ACLs</strong> (access control lists), lists of
            individual entries on a file.
          </p>
          <Table
            head={["System", "View", "Change"]}
            rows={[
              ["Linux", "getfacl file", "setfacl -m u:bob:rw file"],
              ["Windows (NTFS)", "icacls file", "icacls file /grant bob:(M)"],
              ["macOS", "ls -le file", "chmod +a with an ACL rule"],
            ]}
          />
          <p>
            On Windows, each entry in the list is an <strong>ACE</strong> (access control entry), and
            the list that grants or denies access is the <strong>DACL</strong>.
          </p>
        </>
      ),
    },
    {
      id: "principles",
      title: "Principles that apply everywhere",
      body: (
        <>
          <Table
            head={["Principle", "Meaning", "Example"]}
            rows={[
              ["Least privilege", "Give only the access needed for the job, no more", "A backup account can read data but not delete it"],
              ["Need to know", "Access to data depends on a work reason, not rank", "Payroll files visible only to payroll"],
              ["Separation of duties", "No single person controls a whole sensitive process", "One person requests a payment, another approves it"],
              ["Role-based access control (RBAC)", "Grant access to roles, then assign people to roles", "A new analyst joins the Analyst group"],
              ["Default deny", "Block unless explicitly allowed", "A firewall rule list ending in deny all"],
            ]}
          />
          <p>
            Why does least privilege matter so much? If an attacker takes over an account, they inherit
            exactly its rights. A service account that can only read one folder limits the damage to
            that folder. Regular reviews also matter: remove access when people change roles or leave,
            and keep admin accounts separate from daily accounts.
          </p>
          <Callout tone="tip">
            Ask of every service you run: "which user does it run as, and what could that user touch
            if the service were fully compromised?" If the answer is "everything", fix that first.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Each file has an owner, a group and permissions for owner, group and others.",
    "Read is 4, write is 2 and execute is 1; rw-r----- equals 640.",
    "A umask of 022 gives files 644 and folders 755; 077 gives 600 and 700.",
    "setuid programs run with their owner's rights and should be audited.",
    "Least privilege, need to know and separation of duties limit the damage of any single compromise.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the sticky bit on /tmp achieve?",
      options: [
        "Makes files read-only",
        "Encrypts temporary files",
        "Lets users delete only their own files in a shared folder",
        "Runs programs as root",
      ],
      answer: 2,
      explain: "The sticky bit stops users from deleting or renaming other users' files in a shared folder.",
    },
    {
      kind: "mcq",
      q: "Which principle says to give an account only the access its job requires?",
      options: ["Least privilege", "Defence in depth", "Non-repudiation", "Default allow"],
      answer: 0,
      explain: "Least privilege keeps the damage small if an account is compromised.",
    },
    {
      kind: "text",
      q: "What octal mode equals rw-r-----? Three digits.",
      format: "***",
      accept: ["640"],
      explain: "Owner rw- is 6, group r-- is 4, others --- is 0.",
    },
    {
      kind: "text",
      q: "With umask 022, what mode does a newly created file get? Three digits.",
      format: "***",
      accept: ["644"],
      explain: "666 minus 022 gives 644 (rw-r--r--).",
    },
  ],
};

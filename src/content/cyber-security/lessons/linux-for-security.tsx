import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 15,
  difficulty: "Medium",
  objectives: [
    "Find your way around the Linux filesystem and know where config and logs live",
    "Use core commands to inspect users, processes, services and network sockets",
    "Read authentication logs and spot repeated failed logins",
    "Apply two basic SSH hardening settings",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why Linux comes first",
      body: (
        <>
          <p>
            Most servers, cloud machines, containers, routers and security tools run Linux or
            something close to it. When something goes wrong at 3 a.m., you will probably be typing
            into a Linux shell. If you cannot read its files, users and logs, you cannot tell what
            happened.
          </p>
          <p>
            Linux feels strange at first because there is no map on screen. The skill is to hold a
            small mental model: everything is a file, everything has an owner, and every action leaves
            a trace somewhere. This lesson gives you that model. Run the commands on a Linux machine
            or virtual machine that you own.
          </p>
        </>
      ),
    },
    {
      id: "filesystem",
      title: "The filesystem, mapped",
      body: (
        <>
          <p>
            Linux has one tree that starts at <code>/</code> (root). There are no drive letters. A
            second disk is simply attached to a folder.
          </p>
          <Table
            head={["Path", "What lives there", "Why a defender cares"]}
            rows={[
              ["/etc", "System configuration files", "Changes here can change how the system behaves"],
              ["/var/log", "Logs", "Your main evidence trail"],
              ["/home", "Users' personal files", "Where user data and shell history sit"],
              ["/root", "The root user's home", "Should not be readable by others"],
              ["/tmp", "Temporary files, world-writable", "Often misused to stage things"],
              ["/usr and /bin", "Programs and libraries", "Should only change through updates"],
              ["/proc", "A live view of processes and the kernel", "Inspect running programs"],
              ["/dev", "Devices shown as files", "Disks, terminals"],
            ]}
          />
          <p>
            Some everyday navigation commands:
          </p>
          <pre>
            <code>{`pwd                  # where am I?
ls -la               # list all files with owner, size, permissions
cd /var/log          # move to a folder
less syslog          # read a file page by page (q to quit)
grep -i error syslog # lines containing "error", ignoring case
find /etc -name "*.conf" -mtime -1   # config files changed in the last day`}</code>
          </pre>
          <p>
            That last command is a real defender habit: after an incident, list what changed
            recently.
          </p>
        </>
      ),
    },
    {
      id: "users",
      title: "Users, groups and sudo",
      body: (
        <>
          <p>
            Every process runs as a user. The all-powerful user is <strong>root</strong>, with user ID
            0. Normal users have IDs usually starting at 1000. Accounts are listed in{" "}
            <code>/etc/passwd</code>, and password hashes are kept in <code>/etc/shadow</code>, which
            only root can read.
          </p>
          <pre>
            <code>{`whoami               # my username
id                   # my user ID, group ID and groups
cat /etc/passwd      # one line per account
last -n 10           # recent logins
sudo -l              # what may I run as root?`}</code>
          </pre>
          <p>
            <code>sudo</code> lets a permitted user run a single command as root. This is safer than
            logging in as root because each use can be logged and the rights can be limited. Logging in
            directly as root should be avoided.
          </p>
          <Callout tone="tip">
            Accounts with a login shell that nobody recognises are worth a second look. In{" "}
            <code>/etc/passwd</code>, the last field is the shell. Service accounts usually have{" "}
            <code>/usr/sbin/nologin</code> there.
          </Callout>
        </>
      ),
    },
    {
      id: "services",
      title: "Processes, services and open ports",
      body: (
        <>
          <p>
            A <strong>process</strong> is a running program. A <strong>service</strong> (or daemon) is
            a process that runs in the background, started by the init system. On most modern
            distributions that system is <strong>systemd</strong>.
          </p>
          <pre>
            <code>{`ps aux                       # all processes, with owner
systemctl status ssh         # is the SSH service running? (name may be sshd)
systemctl list-units --type=service --state=running
ss -tulpn                    # listening TCP/UDP sockets and the owning program
journalctl -u ssh --since "1 hour ago"   # that service's logs`}</code>
          </pre>
          <p>
            The command <code>ss -tulpn</code> deserves a habit. Every listening port is a door. If
            you see something listening that you did not expect, find out what it is. Closing
            unneeded services is one of the most effective hardening steps there is, because a
            service that is not running cannot be attacked.
          </p>
        </>
      ),
    },
    {
      id: "logs",
      title: "Worked example: spotting a login guessing attempt",
      body: (
        <>
          <p>
            Authentication events live in <code>/var/log/auth.log</code> on Debian and Ubuntu, and in{" "}
            <code>/var/log/secure</code> on Red Hat style systems. Many newer systems also store them
            in the journal. Imagine your own lab server has a public address and you see lines like
            these (addresses are from a documentation range):
          </p>
          <pre>
            <code>{`Nov  2 03:14:07 lab sshd[2211]: Failed password for invalid user admin from 203.0.113.50 port 51234 ssh2
Nov  2 03:14:09 lab sshd[2213]: Failed password for invalid user test from 203.0.113.50 port 51240 ssh2
Nov  2 03:14:12 lab sshd[2215]: Failed password for root from 203.0.113.50 port 51251 ssh2`}</code>
          </pre>
          <p>
            One address trying common usernames in seconds is the signature of automated password
            guessing. To count failures per address:
          </p>
          <pre>
            <code>{`grep "Failed password" /var/log/auth.log \\
  | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head`}</code>
          </pre>
          <p>
            The address is the fourth field from the end of each line, so <code>$(NF-3)</code>{" "}
            picks it. The command sorts and counts, and the most active source is shown first. A
            result such as 412 failures from one address in an hour is clearly not a person
            mistyping.
          </p>
          <p>How to stop it, from simple to strong:</p>
          <ul>
            <li>Use key-based SSH login and turn off password login.</li>
            <li>Disallow direct root login.</li>
            <li>Limit who can reach port 22 with a firewall.</li>
            <li>Add a tool such as fail2ban that blocks addresses after repeated failures.</li>
          </ul>
          <pre>
            <code>{`# /etc/ssh/sshd_config  (back up first, then reload the service)
PermitRootLogin no
PasswordAuthentication no`}</code>
          </pre>
          <Callout tone="warn">
            Before turning off password login, confirm your key login works in a second terminal.
            Otherwise you can lock yourself out. Only run these checks and changes on machines you
            own or administer.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Linux has one tree from /, with config in /etc and logs in /var/log.",
    "Root has user ID 0; use sudo for single privileged commands instead of logging in as root.",
    "ss -tulpn shows listening ports, and every unexpected listener needs an explanation.",
    "Failed-login lines in the auth log reveal automated guessing, which key-based SSH and firewalls stop.",
    "Recent changes in /etc and /var/log are the first place to look after an incident.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where are most system configuration files stored on Linux?",
      options: ["/etc", "/tmp", "/dev", "/home"],
      answer: 0,
      explain: "/etc holds system configuration. /var/log holds logs.",
    },
    {
      kind: "mcq",
      q: "Which log line pattern suggests automated password guessing?",
      options: [
        "One successful login at 09:00 from a known address",
        "Hundreds of failed logins from one address across many usernames within minutes",
        "A service restart after an update",
        "A user changing their own password",
      ],
      answer: 1,
      explain: "Many failures across many usernames in a short time from one source is automated guessing.",
    },
    {
      kind: "text",
      q: "Which command, with the flags -tulpn, lists listening network sockets? Two letters.",
      format: "**",
      accept: ["ss"],
      explain: "ss -tulpn lists TCP and UDP listeners with the owning process.",
    },
    {
      kind: "text",
      q: "What is the user ID of the root user? Number only.",
      format: "*",
      accept: ["0"],
      explain: "Root always has user ID 0.",
    },
  ],
};

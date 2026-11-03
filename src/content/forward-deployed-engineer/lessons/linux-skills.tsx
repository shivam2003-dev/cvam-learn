import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Navigate files, search logs and chain commands with pipes",
    "Inspect processes, ports, disk and memory on an unfamiliar server",
    "Manage services, permissions and remote access safely",
  ],
  tasks: [
    {
      id: "files",
      title: "Files, search and pipes",
      body: (
        <>
          <p>
            Customers hand you a Linux box and a vague description. The shell is how you find out
            what is on it.
          </p>
          <pre>
            <code>{`ls -lah /var/log            # list with sizes and hidden files
tail -f app.log             # follow a log live
grep -i "error" app.log | tail -20       # last 20 errors
grep -rn "timeout" /etc/myapp/           # search a directory
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head   # top client IPs
find / -name "*.conf" -mtime -1 2>/dev/null   # configs changed in the last day
cat data.json | jq '.items[] | {id, status}'  # reshape JSON`}</code>
          </pre>
          <Callout tone="tip">
            Pipes turn small tools into a pipeline. Learn <code>grep</code>, <code>awk</code>,
            <code> sort</code>, <code>uniq</code>, <code>cut</code>, <code>xargs</code> and
            <code> jq</code> well and you can answer most questions without writing a script.
          </Callout>
        </>
      ),
    },
    {
      id: "system",
      title: "What is this machine doing?",
      body: (
        <>
          <Table
            head={["Question", "Command"]}
            rows={[
              ["What is using CPU and memory?", "top or htop"],
              ["Is the disk full?", "df -h, then du -sh * | sort -h"],
              ["What is listening on which port?", "ss -tulpn"],
              ["Is the process running?", "ps aux | grep name"],
              ["Why did the service fail?", "systemctl status name; journalctl -u name -n 100"],
              ["Can I reach the other system?", "curl -v https://host/health; nc -zv host 5432"],
              ["What is the DNS answer?", "dig example.com"],
            ]}
          />
          <p>
            Work in a fixed order: is it up, is it reachable, is it healthy, what do the logs say.
            Most customer incidents turn out to be a full disk, an expired certificate, a changed
            firewall rule or a missing environment variable.
          </p>
        </>
      ),
    },
    {
      id: "access",
      title: "Permissions, services and remote access",
      body: (
        <>
          <pre>
            <code>{`ls -l script.sh        # -rwxr-x--- owner group others
chmod 750 script.sh    # owner rwx, group r-x, others none
chown app:app data/    # change owner
sudo systemctl restart myapp
ssh -i ~/.ssh/key.pem user@host
scp report.csv user@host:/tmp/          # copy files
ssh -L 5432:db.internal:5432 user@bastion   # tunnel to a private database`}</code>
          </pre>
          <ul>
            <li>Use SSH keys, not shared passwords, and never leave keys on shared machines.</li>
            <li>Run services as a dedicated user with the least privilege that works.</li>
            <li>Put recurring jobs in <code>cron</code> or a systemd timer, and log their output.</li>
            <li>Change production only as the customer's process allows, and note what you changed.</li>
          </ul>
          <Callout tone="warn">
            Be careful with <code>rm -rf</code> and with anything run as root on a customer
            machine. Look at the target path twice, and take a backup before editing configs.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "grep, awk, sort, uniq, jq and pipes answer most log questions quickly.",
    "Check up, reachable, healthy, then logs; disk, certificates, firewalls and env vars cause most issues.",
    "Use SSH keys, least privilege, systemd and cron; record every production change.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which command shows which process is listening on which port?",
      options: ["ss -tulpn", "ls -l", "chmod 750", "tail -f"],
      answer: 0,
      explain: "ss -tulpn lists listening TCP and UDP sockets with the owning process.",
    },
    {
      kind: "mcq",
      q: "A service will not start and you suspect a config error. Which is the best first command?",
      options: [
        "rm -rf /etc/myapp",
        "journalctl -u myapp -n 100",
        "reboot the machine",
        "chmod 777 everything",
      ],
      answer: 1,
      explain: "The journal usually states exactly why the service failed to start.",
    },
    {
      kind: "text",
      q: "What octal mode gives the owner read, write and execute, the group read and execute, and others nothing?",
      format: "***",
      accept: ["750"],
      explain: "rwx = 7, r-x = 5, --- = 0, so 750.",
    },
  ],
};

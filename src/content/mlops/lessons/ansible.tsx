import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Separate Ansible's job from Terraform's",
    "Write an inventory and a playbook for GPU hosts",
    "Keep tasks idempotent and use handlers correctly",
    "Roll out changes without taking a whole fleet offline",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Terraform has given you ten GPU servers. They boot, but training fails. Three have an
            older NVIDIA driver, one has no Docker, and the data mount is missing on two. Someone
            set up each machine by hand over SSH, and each one turned out slightly different.
          </p>
          <p>
            <strong>Ansible</strong> configures the machines themselves. You describe the state
            each machine should be in, and Ansible connects over SSH and makes it so. It's{" "}
            <strong>agentless</strong>: nothing needs to be installed on the targets except SSH and
            Python. That makes it easy to adopt, including on on-prem GPU servers.
          </p>
          <p>
            If Terraform is the builder who puts up the house, Ansible is the team that moves in
            afterwards to wire the appliances and stock the shelves.
          </p>
          <Table
            head={["", "Terraform", "Ansible"]}
            rows={[
              ["Main job", "Create cloud resources", "Configure what runs on machines"],
              ["Example", "A GPU instance and its bucket", "Drivers, Docker, agents, config files"],
              ["Tracks state", "Yes, in a state file", "No, it checks each host on every run"],
              ["Connects through", "Cloud provider APIs", "SSH, usually"],
            ]}
          />
          <p>
            The two overlap at the edges, since Ansible has cloud modules too, but this split is a
            good default.
          </p>
        </>
      ),
    },
    {
      id: "inventory",
      title: "Inventory and playbooks",
      body: (
        <>
          <p>
            An <strong>inventory</strong> lists your hosts and groups them. A static one is fine
            for fixed servers. In the cloud, inventory plugins can build the list from your account
            so that it stays current.
          </p>
          <pre>
            <code>{`# inventory.ini
[gpu_trainers]
gpu-01 ansible_host=10.0.1.11
gpu-02 ansible_host=10.0.1.12

[gpu_trainers:vars]
ansible_user=ubuntu`}</code>
          </pre>
          <p>
            A <strong>playbook</strong> is a YAML file that maps groups of hosts to{" "}
            <strong>tasks</strong>. Each task calls a <strong>module</strong>, a small unit of work
            such as installing a package. Variables are inserted with{" "}
            <code>{"{{ double braces }}"}</code>, which use the Jinja2 template language.
          </p>
          <pre>
            <code>{`# gpu.yml
- name: Prepare GPU training hosts
  hosts: gpu_trainers
  become: true
  vars:
    nvidia_driver_package: nvidia-driver-550
    expected_gpus: 4

  tasks:
    - name: Install NVIDIA driver
      ansible.builtin.apt:
        name: "{{ nvidia_driver_package }}"
        state: present
        update_cache: true
      notify: Reboot host

    - name: Install Docker
      ansible.builtin.apt:
        name: docker.io
        state: present

    - name: Start Docker on boot
      ansible.builtin.service:
        name: docker
        state: started
        enabled: true

    - name: Apply a pending reboot before testing the GPUs
      ansible.builtin.meta: flush_handlers

    - name: List GPUs
      ansible.builtin.command: nvidia-smi -L
      register: gpu_list
      changed_when: false
      check_mode: false

    - name: Fail if GPUs are missing
      ansible.builtin.assert:
        that: gpu_list.stdout_lines | length == expected_gpus

  handlers:
    - name: Reboot host
      ansible.builtin.reboot:`}</code>
          </pre>
          <p>
            <code>become: true</code> runs tasks with root privileges. The final assert is the
            useful part for ML: it proves the machine can see its GPUs, so a bad host fails here
            rather than an hour into a training job.
          </p>
          <pre>
            <code>{`ansible gpu_trainers -i inventory.ini -m ansible.builtin.ping   # can we reach them?
ansible-playbook -i inventory.ini gpu.yml --check --diff        # dry run
ansible-playbook -i inventory.ini gpu.yml --limit gpu-02        # one host only`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "idempotent",
      title: "Idempotence and handlers",
      body: (
        <>
          <p>
            Most modules are <strong>idempotent</strong>: they check first and act only if needed.
            <code> state: present</code> doesn't reinstall a driver that's already there. You can
            rerun a playbook safely, and a clean rerun reports zero changes. Running it regularly
            also repairs any host that has drifted.
          </p>
          <p>
            The exception is <code>command</code> and <code>shell</code>. Ansible can't know what an
            arbitrary command does, so it always runs it and reports "changed". Prefer a real
            module. If you can't, tell Ansible how to judge the result:
          </p>
          <ul>
            <li><code>changed_when: false</code> for read-only commands, as in the example.</li>
            <li><code>creates: /path/to/file</code> to skip a command if its output already exists.</li>
          </ul>
          <p>
            A <strong>handler</strong> is a task that runs only when another task reports a change,
            through <code>notify</code>. So the host reboots only if the driver really was
            installed or upgraded.
          </p>
          <Callout tone="warn">
            Handlers normally run at the end of a play. Without the <code>flush_handlers</code>{" "}
            line above, the GPU check would run before the reboot, while the new driver wasn't yet
            loaded. Also note that <code>--check</code> is a preview, not a promise: a task that
            depends on an earlier change can behave differently in a dry run. That's why the
            read-only GPU listing sets <code>check_mode: false</code>, so that it still runs.
          </Callout>
        </>
      ),
    },
    {
      id: "fleet",
      title: "Working across a fleet",
      body: (
        <>
          <p>
            By default, Ansible works on 5 hosts at once for each task, a setting called{" "}
            <strong>forks</strong>. On a large fleet, that can be slow. Take a package task that
            needs an illustrative 6 minutes per host, across 40 hosts:
          </p>
          <Formula>rounds = hosts ÷ forks (rounded up), then time = rounds × task time</Formula>
          <pre>
            <code>{`5 forks:   40 ÷ 5  = 8 rounds × 6 minutes = 48 minutes
20 forks:  40 ÷ 20 = 2 rounds × 6 minutes = 12 minutes`}</code>
          </pre>
          <p>
            Speed isn't always the goal. If a play reboots hosts in a model-serving pool, updating
            them all at once is an outage. The <code>serial</code> keyword does a rolling update
            instead:
          </p>
          <pre>
            <code>{`- name: Upgrade serving hosts
  hosts: gpu_serving
  serial: 3
  max_fail_percentage: 10
  become: true
  roles:
    - gpu_host`}</code>
          </pre>
          <p>
            With 12 hosts and <code>serial: 3</code>, at least 9 remain available, or 75% of
            capacity, during each batch. If each batch takes 5 minutes, the rollout takes 4 × 5 =
            20 minutes. Check that your load balancer takes a host out before its reboot, and that
            the remaining hosts can carry the traffic.
          </p>
          <p>
            A <strong>role</strong> is a reusable folder of tasks, handlers, templates and default
            variables, like <code>gpu_host</code> above. It's Ansible's version of a Terraform
            module.
          </p>
          <p>
            Secrets, such as a registry password, shouldn't sit in Git as plain text.{" "}
            <strong>Ansible Vault</strong> encrypts them:{" "}
            <code>ansible-vault encrypt group_vars/gpu_trainers/vault.yml</code>.
          </p>
          <Callout tone="tip">
            In cloud setups that scale often, consider baking drivers and Docker into a machine
            image, then using it in Terraform. New machines start faster and match each other
            exactly. Ansible is still handy for building those images, and for long-lived or
            on-prem servers that can't simply be replaced.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Terraform creates machines. Ansible configures what's on them.",
    "Ansible is agentless: it needs only SSH and Python on the target.",
    "Most modules are idempotent, but command and shell need extra care.",
    "Handlers run only on change, and normally at the end of a play.",
    "Use serial for rolling updates so that a fleet stays online.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What must be installed on a target host for Ansible to manage it?",
      options: [
        "The Ansible agent",
        "SSH and Python",
        "Terraform",
        "Docker",
      ],
      answer: 1,
      explain: "Ansible is agentless, so it connects over SSH and runs small Python modules.",
    },
    {
      kind: "mcq",
      q: "Why does a command task report changed on every run?",
      options: [
        "It's a bug in Ansible",
        "Ansible can't know what an arbitrary command did",
        "Commands always modify files",
        "The inventory is out of date",
      ],
      answer: 1,
      explain: "Use a proper module, or set changed_when or creates to describe the result.",
    },
    {
      kind: "mcq",
      q: "Which keyword makes a play update a few hosts at a time?",
      options: ["become", "notify", "serial", "register"],
      answer: 2,
      explain: "serial sets the batch size for a rolling update.",
    },
    {
      kind: "text",
      q: "20 hosts are upgraded with serial: 5, and each batch takes 4 minutes. How many minutes does the rollout take?",
      format: "**",
      accept: ["16", "16 min", "16 minutes"],
      explain: "20 ÷ 5 = 4 batches, and 4 × 4 = 16 minutes.",
    },
    {
      kind: "text",
      q: "What is the name for a task that runs only when another task notifies it of a change?",
      format: "*******",
      accept: ["handler", "handlers"],
      explain: "Handlers suit actions like a reboot that should run only after a change.",
    },
  ],
};

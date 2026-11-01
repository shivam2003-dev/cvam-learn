import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Explain what a virtual machine and a hypervisor are",
    "Tell Type 1 and Type 2 hypervisors apart, and VMs from containers",
    "Choose a network mode that keeps a lab isolated",
    "Plan host resources and use snapshots for a safe, repeatable lab",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: you need somewhere safe to break things",
      body: (
        <>
          <p>
            To learn security you must run strange software, change risky settings and sometimes
            deliberately break a system to see what happens. Doing that on the laptop that holds your
            photos and work is a bad idea. One wrong step and you lose data or expose your real
            network.
          </p>
          <p>
            A <strong>virtual machine</strong> (VM) solves this. It is a complete computer simulated
            by software, with its own virtual disk, memory and network card. You can run Linux inside
            your Windows or Mac, crash it, delete it and start again. The real machine, called the{" "}
            <strong>host</strong>, stays untouched. The VM is called the <strong>guest</strong>.
          </p>
          <p>
            Think of a flight simulator. Pilots practise emergencies there because failing costs
            nothing. A home lab is your simulator.
          </p>
        </>
      ),
    },
    {
      id: "hypervisors",
      title: "Hypervisors: the software that makes VMs",
      body: (
        <>
          <p>
            A <strong>hypervisor</strong> shares the host's CPU, memory and disk between guests and
            keeps them separated from each other.
          </p>
          <Table
            head={["Type", "How it runs", "Examples", "Typical use"]}
            rows={[
              ["Type 1 (bare metal)", "Sits directly on the hardware, with no ordinary OS underneath", "VMware ESXi, Microsoft Hyper-V, Xen, KVM", "Servers and data centres"],
              ["Type 2 (hosted)", "An application on a normal OS", "VirtualBox, VMware Workstation or Fusion, Parallels", "Laptops and home labs"],
            ]}
          />
          <p>
            For a home lab, a Type 2 tool is simplest. VirtualBox is free; others have free or paid
            editions that change over time. KVM is built into the Linux kernel and is usually counted
            as Type 1.
          </p>
          <Callout tone="note">
            Check your CPU. VMs run fast only when hardware virtualisation is enabled in the firmware
            settings (often called VT-x or AMD-V). Also, on Macs with Apple silicon, VMs use an ARM
            processor, so choose ARM versions of guest operating systems; many x86-only images will
            not run natively.
          </Callout>
        </>
      ),
    },
    {
      id: "containers",
      title: "VMs versus containers",
      body: (
        <>
          <p>
            A <strong>container</strong>, such as one made with Docker, packages an application and its
            files but shares the host's operating-system kernel. It starts in seconds and uses little
            memory. A VM includes a full guest operating system with its own kernel.
          </p>
          <Table
            head={["", "Virtual machine", "Container"]}
            rows={[
              ["Isolation", "Strong: separate kernel", "Lighter: shared kernel"],
              ["Startup", "Tens of seconds to minutes", "Seconds"],
              ["Size", "Gigabytes", "Often megabytes"],
              ["Good for", "Full operating systems, risky experiments", "Packaging and running apps and tools"],
            ]}
          />
          <p>
            Because a container shares the kernel, a flaw in the kernel can affect every container.
            For anything you are unsure about, such as a suspicious file or a deliberately vulnerable
            test system, use a VM.
          </p>
        </>
      ),
    },
    {
      id: "network",
      title: "Isolation: choosing a network mode",
      body: (
        <>
          <p>
            The most important lab decision is how the VM connects to the network. Names vary by
            product, but the idea is common.
          </p>
          <Table
            head={["Mode", "What the guest can reach", "When to use it"]}
            rows={[
              ["NAT", "The internet, through the host; hidden from your home network", "Downloading updates and tools"],
              ["Bridged", "Appears as its own device on your home network", "Rarely; exposes the VM to every device you own"],
              ["Host-only", "Only the host and other VMs on that private network", "Safe isolated lab"],
              ["Internal network", "Only other VMs on that named network, not even the host", "Strict isolation between lab machines"],
            ]}
          />
          <p>
            A deliberately vulnerable practice VM should never sit on a bridged network. Others on
            your Wi-Fi could reach it, and if it is attacked it becomes a foothold inside your home. Put
            it on a host-only or internal network. If it needs updates, switch it to NAT briefly, then
            switch back.
          </p>
          <Callout tone="warn">
            Only attack machines inside your own lab. Even a tool pointed at the wrong address is
            enough to cross a legal line, so double-check that addresses belong to your lab network,
            for example a private range like 192.168.56.0/24.
          </Callout>
        </>
      ),
    },
    {
      id: "plan",
      title: "Worked example: sizing a lab",
      body: (
        <>
          <p>
            Your host has 16 GB of RAM, 8 CPU cores and 512 GB of free disk. The host itself needs
            memory to keep working, so reserve a share before dividing the rest.
          </p>
          <Formula>VM memory budget = host RAM − memory reserved for the host</Formula>
          <pre>
            <code>{`Host RAM:               16 GB
Reserved for host:       6 GB   (OS, browser, hypervisor)
Budget for VMs:         16 - 6 = 10 GB

Planned VMs (illustrative):
  Linux workstation      4 GB
  Windows victim lab     4 GB
  Log server             2 GB
  Total                  4 + 4 + 2 = 10 GB   (fits exactly)`}</code>
          </pre>
          <p>
            Running all three at once uses the whole budget, so you would have no room to spare. A
            better plan is to start only the VMs a given exercise needs. Over-assigning memory makes
            everything slow, including the host.
          </p>
          <p>
            Disk works similarly. Each VM disk is often a file that can grow. A 40 GB virtual disk
            for each of three VMs reserves up to 120 GB, which fits comfortably in 512 GB, but
            snapshots add more.
          </p>
        </>
      ),
    },
    {
      id: "snapshots",
      title: "Snapshots: the undo button",
      body: (
        <>
          <p>
            A <strong>snapshot</strong> saves a VM's state at one moment. After a risky experiment
            you can roll back in seconds. The workflow for every lab:
          </p>
          <ol>
            <li>Install the operating system and updates.</li>
            <li>Take a snapshot named "clean install".</li>
            <li>Experiment.</li>
            <li>Revert to the snapshot, or take a new one at a good point.</li>
          </ol>
          <p>
            Snapshots are not backups. They usually live on the same disk as the VM, grow over time,
            and long chains slow things down. For files you care about, copy them out to the host or
            to real backup storage. Delete old snapshots you no longer need.
          </p>
          <Callout tone="tip">
            Keep a short lab notebook: what you built, what you changed, which address each VM has. It
            makes the lab repeatable and doubles as a record of your learning.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A VM is a full computer in software; the hypervisor shares hardware between guests.",
    "Type 1 hypervisors run on bare metal, Type 2 run as applications on a normal OS.",
    "Containers share the host kernel, so use a VM for risky or untrusted software.",
    "Use host-only or internal networks for vulnerable lab machines and avoid bridged mode.",
    "Plan RAM and disk for the host first, and use snapshots for undo, not as backups.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which network mode best keeps a deliberately vulnerable VM off your home network while still letting it talk to the host?",
      options: ["Bridged", "Host-only", "Public", "Promiscuous"],
      answer: 1,
      explain: "Host-only gives a private network between the host and its VMs, with no path to your LAN.",
    },
    {
      kind: "mcq",
      q: "Why are containers considered less isolated than VMs?",
      options: [
        "They cannot run Linux",
        "They use more memory",
        "They share the host's kernel",
        "They have no network",
      ],
      answer: 2,
      explain: "A kernel flaw can affect all containers, while each VM has its own kernel.",
    },
    {
      kind: "text",
      q: "A host has 32 GB of RAM and you reserve 8 GB for it. How many GB are left for VMs? Number only.",
      format: "**",
      accept: ["24"],
      explain: "32 − 8 = 24 GB.",
    },
    {
      kind: "text",
      q: "What is the name for the saved state of a VM that lets you roll back? One word.",
      format: "********",
      accept: ["snapshot"],
      explain: "A snapshot captures the VM's state so you can return to it after an experiment.",
    },
  ],
};

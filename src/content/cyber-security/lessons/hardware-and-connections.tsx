import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Name the main components of a computer and what each one does",
    "Recognise common ports and wired and wireless connection types",
    "Work out file transfer time from link speed",
    "Troubleshoot a connection in a sensible order",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why a security learner needs hardware basics",
      body: (
        <>
          <p>
            Software runs on hardware, and hardware has its own weak spots. A stolen laptop exposes
            its disk. A USB stick plugged in at the wrong moment can bring malware inside a
            building. A badly set up Wi-Fi network lets neighbours listen in. Before you can protect
            or troubleshoot any of this, you need to know what the parts are and how they talk to
            each other.
          </p>
          <p>
            It also saves time. A large share of "the network is down" tickets turn out to be an
            unplugged cable or a switched-off adapter. A defender who checks the physical layer first
            solves them in a minute.
          </p>
        </>
      ),
    },
    {
      id: "components",
      title: "Inside the box",
      body: (
        <>
          <p>
            Picture a kitchen. The <strong>CPU</strong> is the cook, the <strong>RAM</strong> is the
            counter where work happens, and the <strong>storage</strong> is the pantry. Everything
            is joined by the <strong>motherboard</strong>.
          </p>
          <Table
            head={["Part", "Job", "Security angle"]}
            rows={[
              ["CPU", "Runs instructions", "Some chip flaws let one program peek at another's data"],
              ["RAM", "Fast, temporary working memory; cleared at power off", "Secrets such as keys sit here while in use, so memory can be examined in forensics"],
              ["Storage (SSD or HDD)", "Keeps data when power is off", "Encrypt it so a lost device does not leak data"],
              ["Motherboard", "Connects every component", "Holds the firmware and often a security chip"],
              ["Network interface card (NIC)", "Connects to a wired or wireless network", "Has a MAC address; the network's first line of contact"],
              ["Firmware (BIOS or UEFI)", "The first code that runs at power on", "Secure Boot checks that the boot software is trusted"],
            ]}
          />
          <p>
            Two features worth knowing now. A <strong>TPM</strong> (Trusted Platform Module) is a
            small chip that stores encryption keys and checks the machine started in a known state.
            <strong> Full-disk encryption</strong> uses it so that removing the drive and reading it
            elsewhere yields only scrambled data.
          </p>
          <Callout tone="tip">
            Volatile means "lost when power is cut". RAM is volatile, storage is not. Forensic
            investigators therefore capture memory first on a live machine, because switching it off
            destroys that evidence.
          </Callout>
        </>
      ),
    },
    {
      id: "ports",
      title: "Ports and wired links",
      body: (
        <>
          <p>
            A <em>port</em> here is a physical socket. (Do not confuse it with a network port number
            such as 22 or 443, which you will meet in the networking lessons.)
          </p>
          <Table
            head={["Connector", "Used for", "Note"]}
            rows={[
              ["USB-A and USB-C", "Keyboards, storage, chargers, many devices", "USB-C is the shape; speeds vary by version"],
              ["Ethernet (RJ-45)", "Wired network", "Twisted-pair cable runs up to 100 m per segment"],
              ["HDMI and DisplayPort", "Video out", "Rarely a security concern"],
              ["Thunderbolt", "High-speed data, video, power", "Gives devices fast direct access, so lock a machine you leave unattended"],
              ["Audio jack", "Headphones, microphones", "Low risk"],
            ]}
          />
          <p>
            Wired Ethernet is usually the most reliable and hardest to intercept, because an attacker
            needs physical access to the cable or the switch. It is also quick: common speeds are 100
            Mbps, 1 Gbps and 10 Gbps.
          </p>
          <Callout tone="warn">
            Treat unknown USB devices as untrusted. A stick found in a car park, or a cable handed to
            you, can pretend to be a keyboard or carry malware. Organisations disable unused USB
            ports or allow only approved devices. Never plug an unknown drive into a machine you care
            about; if you must inspect one, use a throwaway virtual machine.
          </Callout>
        </>
      ),
    },
    {
      id: "wireless",
      title: "Wireless connections",
      body: (
        <>
          <p>
            Wireless links send data through the air, so anyone in range can in principle receive the
            signal. That is why encryption is not optional.
          </p>
          <Table
            head={["Technology", "Range", "Typical use", "Protect it with"]}
            rows={[
              ["Wi-Fi", "Tens of metres", "Laptops, phones, offices", "WPA3 where possible, otherwise WPA2 with a long passphrase"],
              ["Bluetooth", "A few metres", "Headsets, keyboards, wearables", "Turn off when unused; remove old pairings"],
              ["NFC", "A few centimetres", "Contactless payment, badges", "Short range is itself a protection"],
              ["Cellular (4G, 5G)", "Kilometres", "Phones, hotspots, IoT", "Provider encryption plus your own VPN or TLS"],
            ]}
          />
          <p>
            Wi-Fi commonly uses the 2.4 GHz and 5 GHz radio bands. The 2.4 GHz band reaches further
            through walls but is slower and more crowded. The 5 GHz band is faster over shorter
            distances.
          </p>
          <p>
            Avoid the old WEP standard, which is broken, and avoid open networks for anything
            sensitive. On public Wi-Fi, rely on HTTPS and consider a VPN.
          </p>
        </>
      ),
    },
    {
      id: "speed",
      title: "Worked example: how long will it take?",
      body: (
        <>
          <p>
            Link speeds are quoted in <strong>bits</strong> per second, while files are measured in{" "}
            <strong>bytes</strong>. One byte is 8 bits. This mismatch trips up many people.
          </p>
          <Formula>time (s) = file size in megabytes × 8 ÷ link speed in Mbps</Formula>
          <p>
            You want to copy a 1,500 MB backup over a 100 Mbps link. Real links rarely reach full
            speed, so this is a best case.
          </p>
          <pre>
            <code>{`1,500 MB × 8 = 12,000 megabits
12,000 ÷ 100 Mbps = 120 seconds (2 minutes)

Same file at 1 Gbps (1,000 Mbps):
12,000 ÷ 1,000 = 12 seconds`}</code>
          </pre>
          <p>
            Knowing this helps in security work too: if an alert says 40 GB left your network in an
            hour, you can judge whether that fits normal behaviour or looks like bulk copying.
          </p>
        </>
      ),
    },
    {
      id: "troubleshoot",
      title: "Troubleshooting a connection, bottom up",
      body: (
        <>
          <p>
            Work from the physical layer upwards and stop when you find the fault.
          </p>
          <ol>
            <li>
              <strong>Is it powered and plugged in?</strong> Check cable, link lights, Wi-Fi switch,
              airplane mode.
            </li>
            <li>
              <strong>Does the machine have an address?</strong> Check the IP configuration.
            </li>
            <li>
              <strong>Can it reach the gateway?</strong> Ping the router.
            </li>
            <li>
              <strong>Can it reach the outside by number?</strong> Ping a public IP address.
            </li>
            <li>
              <strong>Can it resolve names?</strong> If numbers work but names fail, suspect DNS.
            </li>
          </ol>
          <pre>
            <code>{`# Linux or macOS
ip addr            # Linux: list interfaces and addresses
ifconfig           # macOS: same idea
ping -c 4 192.168.1.1     # your router (use your own gateway address)

# Windows (Command Prompt or PowerShell)
ipconfig /all
ping 192.168.1.1`}</code>
          </pre>
          <p>
            If you see an address beginning with 169.254, the machine failed to get one from the
            network's DHCP service and made up its own. That points to a problem reaching the router
            or the DHCP server, not to a problem with the internet.
          </p>
          <Callout tone="note">
            Run these commands only against your own devices and network. The address 192.168.1.1 is
            a common private home-router address, but check your own.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "CPU computes, RAM is volatile working memory, storage keeps data, and the NIC connects to networks.",
    "Encrypt storage and use a TPM and Secure Boot so a lost or tampered device does not expose data.",
    "Treat unknown USB devices as untrusted and secure Wi-Fi with WPA3 or WPA2.",
    "Link speeds use bits, file sizes use bytes: multiply megabytes by 8 before dividing.",
    "Troubleshoot from the physical layer upward before blaming software.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which component loses its contents when the power is switched off?",
      options: ["SSD", "RAM", "Hard disk", "Firmware chip"],
      answer: 1,
      explain: "RAM is volatile. Storage and firmware keep their contents without power.",
    },
    {
      kind: "mcq",
      q: "A laptop shows an address starting with 169.254. What does this most likely mean?",
      options: [
        "It is connected to the internet through a VPN",
        "The router has been hacked",
        "It could not get an address from DHCP and assigned itself one",
        "Its disk is encrypted",
      ],
      answer: 2,
      explain: "A 169.254 address is self-assigned when DHCP does not answer, so look at the link or the DHCP server.",
    },
    {
      kind: "text",
      q: "How many seconds does a 500 MB file take on a 100 Mbps link at full speed? Number only.",
      format: "**",
      accept: ["40"],
      explain: "500 × 8 = 4,000 megabits. 4,000 ÷ 100 = 40 seconds.",
    },
    {
      kind: "text",
      q: "What small chip stores encryption keys and checks that a machine booted in a trusted state? Give the three-letter acronym.",
      format: "***",
      accept: ["tpm"],
      explain: "The Trusted Platform Module holds keys and supports measured boot and disk encryption.",
    },
  ],
};

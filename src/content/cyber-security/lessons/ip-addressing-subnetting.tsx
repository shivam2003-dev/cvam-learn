import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Read an IPv4 address and a CIDR prefix, and convert between prefix and subnet mask",
    "Recognise private, loopback, link-local and documentation ranges",
    "Calculate the network address, broadcast address and usable hosts of a subnet",
    "Explain why subnetting is a security tool as well as an addressing tool",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: finding and grouping machines",
      body: (
        <>
          <p>
            For two machines to talk across a network, each needs an address that says where it is.
            A flat list of every device on earth would be unusable, so addresses are built in two
            parts: a <strong>network part</strong> (which group) and a <strong>host part</strong>{" "}
            (which machine in that group). It works like a postal address, where the street tells
            the sorting office where to send the letter and the house number picks the door.
          </p>
          <p>
            An IPv4 address is 32 bits, written as four 8-bit numbers (octets) in decimal. The
            address 192.168.10.77 is really this:
          </p>
          <pre>
            <code>{`192      .168      .10       .77
11000000 .10101000 .00001010 .01001101

77 = 64 + 8 + 4 + 1 = 01001101`}</code>
          </pre>
          <p>
            Where does the network part end? That is what the <strong>subnet mask</strong> or the
            <strong> CIDR prefix</strong> tells you. A mask has ones for the network bits and zeros
            for the host bits. The prefix <code>/26</code> means the first 26 bits are the network.
            Written as a mask, that is 255.255.255.192.
          </p>
        </>
      ),
    },
    {
      id: "ranges",
      title: "Ranges you should know on sight",
      body: (
        <>
          <p>
            Some blocks are reserved. Private ranges are not routed on the public internet, so every
            home and office can reuse them. Learning these by heart helps you read logs quickly.
          </p>
          <Table
            head={["Range", "Purpose", "Notes"]}
            rows={[
              ["10.0.0.0/8", "Private (RFC 1918)", "About 16.7 million addresses"],
              ["172.16.0.0/12", "Private (RFC 1918)", "Covers 172.16.0.0 to 172.31.255.255"],
              ["192.168.0.0/16", "Private (RFC 1918)", "Common on home routers"],
              ["127.0.0.0/8", "Loopback", "127.0.0.1 is your own machine"],
              ["169.254.0.0/16", "Link-local", "Self-assigned when DHCP fails"],
              ["100.64.0.0/10", "Carrier-grade NAT", "Used by some internet providers"],
              ["192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24", "Documentation", "Safe for examples; never real hosts"],
            ]}
          />
          <p>
            Spotting an address starting with 169.254 on a laptop is a quick clue: the machine asked
            for an address by DHCP, got no answer, and gave itself one. Spotting a private source
            address arriving from the internet is a clue of a different kind, covered below.
          </p>
        </>
      ),
    },
    {
      id: "subnet-math",
      title: "Subnet arithmetic",
      body: (
        <>
          <p>
            Every subnet loses two addresses: the first is the <strong>network address</strong>{" "}
            (all host bits zero) and the last is the <strong>broadcast address</strong> (all host
            bits one). Neither can be given to a host.
          </p>
          <Formula>addresses = 2^(32 − prefix)     usable hosts = 2^(32 − prefix) − 2</Formula>
          <Table
            head={["Prefix", "Mask", "Addresses", "Usable hosts"]}
            rows={[
              ["/24", "255.255.255.0", "256", "254"],
              ["/25", "255.255.255.128", "128", "126"],
              ["/26", "255.255.255.192", "64", "62"],
              ["/27", "255.255.255.224", "32", "30"],
              ["/28", "255.255.255.240", "16", "14"],
              ["/29", "255.255.255.248", "8", "6"],
              ["/30", "255.255.255.252", "4", "2"],
            ]}
          />
          <p>
            <strong>Worked example.</strong> Find the network, broadcast and host range for{" "}
            <code>10.20.30.77/27</code>.
          </p>
          <pre>
            <code>{`Prefix /27 -> 5 host bits -> block size 2^5 = 32
Subnet starts in the last octet: 0, 32, 64, 96 ...
77 falls between 64 and 95  ->  the subnet starts at 64

Network address : 10.20.30.64
Broadcast       : 10.20.30.95   (64 + 32 - 1)
Usable hosts    : 10.20.30.65 to 10.20.30.94   (30 hosts)`}</code>
          </pre>
          <p>
            The shortcut: find the block size (256 minus the interesting octet of the mask, here 256
            minus 224 equals 32), step through multiples of it, and pick the one at or below your
            number.
          </p>
        </>
      ),
    },
    {
      id: "design",
      title: "Designing subnets, and why it helps security",
      body: (
        <>
          <p>
            Say an office has 192.168.10.0/24 and four teams, each needing up to 50 hosts. A /26
            holds 62, so split the /24 into four /26 blocks of 64 addresses.
          </p>
          <Table
            head={["Team", "Subnet", "Usable range", "Broadcast"]}
            rows={[
              ["Engineering", "192.168.10.0/26", "192.168.10.1 to .62", "192.168.10.63"],
              ["Finance", "192.168.10.64/26", "192.168.10.65 to .126", "192.168.10.127"],
              ["Guests", "192.168.10.128/26", "192.168.10.129 to .190", "192.168.10.191"],
              ["Servers", "192.168.10.192/26", "192.168.10.193 to .254", "192.168.10.255"],
            ]}
          />
          <p>
            Each host also has a <strong>default gateway</strong>, the router interface used to leave
            the subnet. A host decides by comparing the destination with its own network using the
            mask. A Finance host at 192.168.10.70/26 sending to 192.168.10.130 sees that .130 is in a
            different /26, so it hands the packet to the gateway. Because all cross-team traffic now
            passes a router or firewall, you can apply rules there: Guests may reach the internet but
            not Servers, Finance may reach a database but Engineering may not.
          </p>
          <p>
            This is <strong>segmentation</strong>. It limits how far an intruder can move sideways,
            keeps broadcast noise small and makes logs easier to read, since the source subnet
            tells you which team a host belongs to.
          </p>
          <Callout tone="warn">
            Private addresses are not a security control. A private range only means the address
            is not routed on the public internet. Anyone inside the network, or anyone who gains a
            foothold on one machine, can reach the rest. Only scan or probe address ranges that you
            own or have written permission to test; your own lab VM network is the right place to
            practise.
          </Callout>
        </>
      ),
    },
    {
      id: "defence",
      title: "Defensive uses of address knowledge",
      body: (
        <>
          <p>
            A packet arriving from the internet with a private or loopback source address cannot be
            genuine, because no legitimate internet host uses those addresses. It is usually a
            forged source, so edge devices drop such traffic. This filter is sometimes called{" "}
            <strong>bogon filtering</strong>. A sketch for an nftables firewall, assuming{" "}
            <code>eth0</code> faces the internet:
          </p>
          <pre>
            <code>{`table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iifname "eth0" ip saddr { 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8 } drop
  }
}`}</code>
          </pre>
          <p>
            Good address plans also help incident response. If you record which subnets map to
            which teams and which are DHCP pools, you can answer "who was 192.168.10.140 at 09:12?"
            in minutes. Keep that map current.
          </p>
          <p>
            One note on IPv6: addresses are 128 bits, usually written in hexadecimal such as{" "}
            <code>2001:db8::1</code> (the 2001:db8::/32 block is reserved for documentation). A
            normal LAN subnet is a /64, so you do not count hosts the way you do with IPv4. The ideas
            of prefix, gateway and segmentation stay the same.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "An IP address has a network part and a host part; the prefix or mask marks the split.",
    "Usable hosts equal 2 to the power of host bits, minus 2 for the network and broadcast addresses.",
    "Know the private ranges 10/8, 172.16/12 and 192.168/16, plus loopback 127/8 and link-local 169.254/16.",
    "Subnets create boundaries where firewalls and ACLs can enforce who talks to whom.",
    "Private addressing hides nothing; treat it as addressing, not as protection.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which address is in a private RFC 1918 range?",
      options: ["172.20.4.1", "172.32.4.1", "192.169.1.1", "100.1.1.1"],
      answer: 0,
      explain: "172.16.0.0/12 covers 172.16.x.x to 172.31.x.x. The others are public addresses.",
    },
    {
      kind: "mcq",
      q: "What is the broadcast address of 192.168.1.0/25?",
      options: ["192.168.1.255", "192.168.1.128", "192.168.1.127", "192.168.1.63"],
      answer: 2,
      explain: "A /25 has 128 addresses, so the first subnet runs from .0 to .127 and .127 is the broadcast.",
    },
    {
      kind: "text",
      q: "How many usable host addresses does a /28 subnet have?",
      format: "**",
      accept: ["14"],
      explain: "2^(32 - 28) = 16 addresses, minus the network and broadcast addresses, leaves 14.",
    },
    {
      kind: "text",
      q: "Write the dotted-decimal subnet mask for a /26 prefix.",
      format: "***.***.***.***",
      accept: ["255.255.255.192"],
      explain: "26 ones leave 6 host bits. In the last octet, the top 2 bits are ones: 128 + 64 = 192.",
    },
  ],
};

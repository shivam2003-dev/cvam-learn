import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe what's inside a multi-GPU machine",
    "Compare PCIe, NVLink and network speeds",
    "Calculate how long a transfer takes over each link",
    "Inspect GPU topology on a real instance",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: one GPU often isn't enough",
      body: (
        <>
          <p>
            A large model may not fit on one GPU. When you split it across several, those GPUs
            have to talk to each other on every step. The links between them can then become the
            slowest part of the system. Two machines listed with eight of the same GPU can behave
            very differently, because a GPU only reaches its speed if data arrives fast enough.
          </p>
          <p>
            Think of an office. Colleagues at one desk (a single GPU) can share papers instantly.
            People on one floor have a fast internal corridor (NVLink). Different floors use the
            stairs (PCIe). Different buildings use a courier (the network). Your job is to keep
            the most frequent conversations on the shortest route.
          </p>
        </>
      ),
    },
    {
      id: "machine",
      title: "Inside a GPU instance",
      body: (
        <>
          <p>
            An <strong>instance</strong> is the virtual or physical machine you rent. A typical
            eight-GPU server contains:
          </p>
          <ul>
            <li>
              <strong>GPUs:</strong> usually mounted on a shared baseboard. NVIDIA's standard
              eight-GPU board design is called HGX.
            </li>
            <li>
              <strong>NVSwitch:</strong> switch chips that let any GPU talk to any other at full
              NVLink speed.
            </li>
            <li>
              <strong>CPUs and system memory:</strong> run the serving process, tokenizers and
              networking.
            </li>
            <li>
              <strong>Network cards:</strong> connect this machine to others.
            </li>
            <li>
              <strong>Local NVMe drives:</strong> hold model files for fast loading.
            </li>
          </ul>
          <p>
            Cloud names hide all this. For example, AWS <code>p5.48xlarge</code>, Google Cloud{" "}
            <code>a3-highgpu-8g</code> and Azure's ND H100 v5 are all eight-H100 machines. Instance
            types change often, so check the provider's docs for the current list, and look at the
            interconnect and network as well as the GPU name.
          </p>
          <p>
            Cards matter too. An <strong>SXM</strong> GPU is mounted on the board and connects
            through NVLink. A <strong>PCIe</strong> card plugs into a standard slot, like a desktop
            GPU. It may run at lower power, and its GPU-to-GPU connection is usually much more
            limited. The two can share a product name, so read the details.
          </p>
        </>
      ),
    },
    {
      id: "links",
      title: "The three kinds of link",
      body: (
        <>
          <Table
            head={["Link", "Connects", "Typical peak speed", "Used for"]}
            rows={[
              ["NVLink 4 (Hopper)", "GPUs in a machine", "900 GB/s total per GPU", "Tensor parallelism"],
              ["NVLink 5 (Blackwell)", "GPUs in a machine or rack", "1.8 TB/s total per GPU", "Tensor parallelism, large models"],
              ["PCIe Gen5 x16", "GPU to CPU, GPU to NIC", "About 64 GB/s each way", "Loading weights, CPU offload"],
              ["400 Gb/s network", "Machine to machine", "About 50 GB/s", "Multi-node serving"],
            ]}
          />
          <p>
            These are nominal figures, which change with each generation, and real throughput is
            lower once protocol overhead is included. Also note that NVLink totals count both
            directions, so 900 GB/s means about 450 GB/s each way.
          </p>
          <Callout tone="warn">
            Mind the units. Networks are sold in gigabits per second (Gb/s), while memory and
            NVLink are usually quoted in gigabytes per second (GB/s). Divide bits by 8. A 400 Gb/s
            link is 50 GB/s, not 400. This is a very common sizing error.
          </Callout>
          <p>
            Between machines, standard networking would add CPU copies and delay. So GPU clusters
            use <strong>RDMA</strong> (remote direct memory access), which moves data between
            machines without involving the remote CPU. <strong>GPUDirect RDMA</strong> goes
            further, letting the network card read and write GPU memory directly. InfiniBand and
            RDMA-capable Ethernet are the common choices.
          </p>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "Worked example: moving a KV cache",
      body: (
        <>
          <p>
            Suppose you want to move a 4 GB KV cache, perhaps to offload it or to send it from a
            prefill GPU to a decode GPU.
          </p>
          <Formula>transfer time = data size ÷ one-way bandwidth</Formula>
          <pre>
            <code>{`NVLink 4 (450 GB/s one way):  4 ÷ 450 = 8.9 ms
PCIe Gen5 x16 (64 GB/s):       4 ÷ 64  = 62.5 ms
400 Gb/s network (50 GB/s):    4 ÷ 50  = 80 ms`}</code>
          </pre>
          <p>
            All of these are best cases. In comparison, a smooth stream needs a token every 20 ms
            or so at 50 tokens per second. So one trip over PCIe or the network costs several
            tokens' worth of time, while NVLink costs less than one.
          </p>
          <p>
            Compare this with memory bandwidth. A GPU reads its own HBM at terabytes per second,
            so even NVLink is much slower than local memory. This is why tensor parallelism works
            hard to send as little as possible, and why fast links such as NVLink are strongly preferred for it.
          </p>
          <Table
            head={["Pattern", "Traffic", "Link needed"]}
            rows={[
              ["One replica per GPU", "Almost none between GPUs", "PCIe is fine"],
              ["Tensor parallelism in one machine", "Heavy, every layer", "NVLink"],
              ["Prefill and decode on separate machines", "Bursts of KV cache", "Fast RDMA network"],
              ["Model spanning machines", "Heavy, between stages", "Fast RDMA network, or a rack-scale NVLink domain"],
            ]}
          />
          <Callout tone="tip">
            If your model fits on one GPU, run one replica per GPU. Eight independent replicas
            avoid interconnect traffic altogether, and one failure takes down only an eighth of
            your capacity.
          </Callout>
        </>
      ),
    },
    {
      id: "topology",
      title: "Checking topology on a real machine",
      body: (
        <>
          <p>Don't rely on the listing alone. Ask the machine:</p>
          <pre>
            <code>{`# How GPUs, NICs and CPUs connect
nvidia-smi topo -m

# NVLink state for each GPU
nvidia-smi nvlink --status

# PCIe generation and width, current and maximum
nvidia-smi --query-gpu=pcie.link.gen.current,pcie.link.gen.max,pcie.link.width.current --format=csv`}</code>
          </pre>
          <p>
            In the <code>topo -m</code> matrix, entries starting with <code>NV</code> mean an NVLink
            path. Entries such as <code>PIX</code>, <code>PXB</code>, <code>PHB</code>,{" "}
            <code>NODE</code> and <code>SYS</code> describe PCIe paths, from close to far. The
            output also shows which CPU cores are nearest to each GPU.
          </p>
          <p>
            That last part matters on two-socket servers, where each CPU has its own memory and
            PCIe devices. This is called <strong>NUMA</strong> (non-uniform memory access). If a
            serving process runs on the CPU far from its GPU, its traffic must cross the link
            between sockets. Pinning each process close to its GPU avoids this:
          </p>
          <pre>
            <code>{`# Run on CPU socket 0 and its local memory
numactl --cpunodebind=0 --membind=0 python serve.py`}</code>
          </pre>
          <Callout tone="note">
            A PCIe link may report a lower current generation while idle, since it saves power. Check
            it under load before you decide something is wrong.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An instance is GPUs plus switches, CPUs, network cards and storage, so read beyond the GPU name.",
    "NVLink is far faster than PCIe or a typical network, but much slower than local HBM.",
    "Network speeds are in bits. Divide by 8 before comparing them.",
    "If a model fits on one GPU, one replica per GPU avoids interconnect costs.",
    "Check real topology with nvidia-smi and keep processes close to their GPU.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which job most needs NVLink?",
      options: [
        "One independent replica per GPU",
        "Tensor parallelism within one machine",
        "Loading a model file from disk",
        "Tokenizing requests",
      ],
      answer: 1,
      explain: "Tensor parallelism exchanges data on every layer, so it needs a very fast GPU-to-GPU link.",
    },
    {
      kind: "mcq",
      q: "What does GPUDirect RDMA allow?",
      options: [
        "The GPU to run without a CPU",
        "The network card to access GPU memory directly",
        "PCIe to run at NVLink speed",
        "Two models to share weights",
      ],
      answer: 1,
      explain: "Data moves between the network card and GPU memory without extra CPU copies.",
    },
    {
      kind: "text",
      q: "A network link is rated at 800 Gb/s. What is that in GB/s?",
      format: "***",
      accept: ["100"],
      explain: "800 ÷ 8 = 100 GB/s.",
    },
    {
      kind: "text",
      q: "How many milliseconds does it take to move 9 GB at 450 GB/s?",
      format: "**",
      accept: ["20"],
      explain: "9 ÷ 450 = 0.02 s, which is 20 ms.",
    },
    {
      kind: "text",
      q: "Which nvidia-smi subcommand shows how GPUs connect? (one word)",
      format: "****",
      accept: ["topo"],
      explain: "nvidia-smi topo -m prints a matrix of links between GPUs, NICs and CPUs.",
    },
  ],
};

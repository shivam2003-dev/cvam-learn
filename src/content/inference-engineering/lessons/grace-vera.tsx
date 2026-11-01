import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain what the CPU does in a GPU inference server",
    "Describe Grace, Vera and the superchip design",
    "Compare NVLink-C2C with PCIe for KV cache offload",
    "Prepare software for Arm-based GPU servers",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the CPU can quietly hold back the GPU",
      body: (
        <>
          <p>
            It's easy to think of the CPU as an afterthought in an AI server. But every request
            passes through it. If the CPU is overloaded, or if it talks to the GPU too slowly, an
            expensive GPU sits waiting. Think of a head waiter in a busy restaurant. The kitchen
            can be superb, but orders only reach it as fast as the waiter takes them.
          </p>
          <p>In an inference server, the CPU handles:</p>
          <ul>
            <li>
              <strong>Networking:</strong> accepting connections and streaming responses.
            </li>
            <li>
              <strong>Tokenization:</strong> turning text into tokens and back. It's light per
              request but adds up at high volumes.
            </li>
            <li>
              <strong>Scheduling:</strong> the engine's batching loop usually runs here.
            </li>
            <li>
              <strong>Media work:</strong> decoding images, audio and video for multimodal models.
            </li>
            <li>
              <strong>Memory for offload:</strong> holding KV caches that don't fit on the GPU.
            </li>
          </ul>
          <p>
            Standard GPU servers use x86 CPUs from Intel or AMD, joined to GPUs over PCIe. That
            works well in most cases. Yet the last item on the list exposes a weakness, because
            PCIe is slow compared with the GPU's own memory. NVIDIA's own CPUs are built around
            that problem.
          </p>
        </>
      ),
    },
    {
      id: "grace",
      title: "Grace and the superchip idea",
      body: (
        <>
          <p>
            <strong>Grace</strong> is NVIDIA's Arm-based data center CPU, with 72 Arm Neoverse
            cores per chip and LPDDR5X memory. It uses the low-power memory found in phones and
            laptops, in a server-grade form, which gives high bandwidth per watt.
          </p>
          <p>
            Its defining feature is <strong>NVLink-C2C</strong> (chip to chip), a direct link
            between the CPU and GPU with far more bandwidth than PCIe. It's also coherent, which
            means CPU and GPU can read each other's memory, and hardware keeps those views in
            agreement. A CPU and GPUs joined this way form a <strong>superchip</strong>.
          </p>
          <Table
            head={["Product", "CPU to GPU", "Notes"]}
            rows={[
              ["GH200 Grace Hopper", "1 Grace, 1 Hopper", "NVLink-C2C at 900 GB/s in total"],
              ["GB200 Grace Blackwell", "1 Grace, 2 Blackwell", "Building block of GB200 NVL72"],
              ["GB200 NVL72", "36 Grace, 72 Blackwell", "Full rack in one NVLink domain"],
            ]}
          />
          <Callout tone="note">
            Grace also comes as a CPU-only superchip with two Grace dies. It's aimed at general
            high-performance computing rather than GPU serving.
          </Callout>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "Worked example: offloading KV cache",
      body: (
        <>
          <p>
            Say your GPU's memory is full, and you need to move 40 GB of idle KV cache to CPU
            memory and bring it back later. The caching lessons explain why you might do this:
            reusing a cache beats recomputing a long prefix.
          </p>
          <Formula>transfer time = data size ÷ one-way bandwidth</Formula>
          <pre>
            <code>{`PCIe Gen5 x16, about 64 GB/s:
  40 ÷ 64 = 0.625 s, or 625 ms

NVLink-C2C on Grace Hopper, about 450 GB/s one way:
  40 ÷ 450 = 0.089 s, or 89 ms`}</code>
          </pre>
          <p>
            The direct link is about seven times faster at these peak rates. That can decide
            whether CPU memory is a practical cache tier or a last resort. Real transfers will run
            slower than both figures, and engines usually move smaller pieces.
          </p>
          <p>
            It also changes how you think about memory. With a coherent link, the CPU's memory
            acts like a large, slower extension of GPU memory. That doesn't make CPU memory as
            fast as HBM, though. Running weights straight from CPU memory is still far slower,
            because bandwidth to it is much lower than the bandwidth of HBM.
          </p>
        </>
      ),
    },
    {
      id: "vera",
      title: "Vera: the next CPU",
      body: (
        <>
          <p>
            <strong>Vera</strong> is the successor to Grace. It's designed to pair with{" "}
            <strong>Rubin</strong>, the GPU generation after Blackwell. The combined platform is
            called Vera Rubin.
          </p>
          <Table
            head={["", "Grace", "Vera"]}
            rows={[
              ["Cores", "72 Arm Neoverse", "88 custom Arm (Olympus)"],
              ["Threads", "72", "176"],
              ["Memory type", "LPDDR5X", "LPDDR5X"],
              ["NVLink-C2C", "900 GB/s total", "Up to 1.8 TB/s"],
            ]}
          />
          <p>
            As with Grace Blackwell, a rack-scale version, Vera Rubin NVL72, combines 36 Vera CPUs
            with 72 Rubin GPUs. NVIDIA publicly describes these figures, but this is a recent
            platform, so specs, availability and pricing may shift. Check NVIDIA's and your cloud
            provider's current documents before you plan around it.
          </p>
          <p>
            Vera's design reflects a real shift. CPU work in AI serving is growing, driven by
            agents that call tools, more KV cache offload and pipelines with lots of data handling.
            A chip with more threads and a faster GPU link is a response to that trend.
          </p>
        </>
      ),
    },
    {
      id: "software",
      title: "What changes for your software",
      body: (
        <>
          <p>
            Grace and Vera are Arm CPUs, so x86 builds won't run natively on them. Most Python and
            CUDA software supports Arm64 now, but custom native libraries can trip you up.
          </p>
          <pre>
            <code>{`# Build one image for both CPU architectures
docker buildx build \\
  --platform linux/amd64,linux/arm64 \\
  -t registry.example.com/inference-server:1.4.0 \\
  --push .

# Check which architecture you're on
uname -m   # aarch64 on Grace, x86_64 on most others`}</code>
          </pre>
          <p>Before moving to Arm servers, check these:</p>
          <ul>
            <li>Every native Python dependency has an Arm64 wheel, or can be built.</li>
            <li>Closed-source agents, such as monitoring tools, have Arm builds.</li>
            <li>Any hand-written x86 code, such as AVX tokenizer speedups, has a fallback.</li>
            <li>CPU-side performance is benchmarked again, not assumed.</li>
          </ul>
          <Callout tone="tip">
            If you want the choice later, build multi-architecture images now. It's a small CI
            change today, and it removes a real blocker when Arm capacity becomes the cheapest or
            only option available.
          </Callout>
          <Callout tone="warn">
            Don't under-provision CPU in any setup. Check CPU usage per core, not just the average.
            One saturated core running the scheduler can cap throughput while the GPU appears to
            have room to spare.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The CPU handles networking, tokenization, scheduling, media work and offloaded memory.",
    "Grace is NVIDIA's Arm CPU, linked to GPUs by NVLink-C2C rather than PCIe.",
    "A fast coherent link makes CPU memory a more practical KV cache tier.",
    "Vera succeeds Grace and pairs with Rubin, with more cores and a faster C2C link.",
    "Arm servers need Arm64 builds, so plan multi-architecture images early.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What makes NVLink-C2C better than PCIe for KV cache offload?",
      options: [
        "It stores the cache on disk",
        "It offers much higher CPU-to-GPU bandwidth, with coherent memory",
        "It compresses the weights",
        "It removes the need for a CPU",
      ],
      answer: 1,
      explain: "A faster, coherent link makes moving data between CPU and GPU memory much cheaper.",
    },
    {
      kind: "mcq",
      q: "What is the CPU-to-GPU ratio in GB200 Grace Blackwell?",
      options: ["1 CPU to 1 GPU", "1 CPU to 2 GPUs", "2 CPUs to 1 GPU", "1 CPU to 8 GPUs"],
      answer: 1,
      explain: "One Grace is paired with two Blackwell GPUs, which is why NVL72 has 36 CPUs and 72 GPUs.",
    },
    {
      kind: "mcq",
      q: "Your x86 container fails to start on a Grace server. What's the likely cause?",
      options: [
        "HBM is too small",
        "The image has no Arm64 build",
        "NVLink is disabled",
        "The GPU is too new",
      ],
      answer: 1,
      explain: "Grace is an Arm CPU, so it needs Arm64 images and libraries.",
    },
    {
      kind: "text",
      q: "How many milliseconds does it take to move 45 GB at 450 GB/s?",
      format: "***",
      accept: ["100"],
      explain: "45 ÷ 450 = 0.1 s, which is 100 ms.",
    },
    {
      kind: "text",
      q: "What CPU architecture do Grace and Vera use? One word.",
      format: "***",
      accept: ["arm", "arm64", "aarch64"],
      explain: "Both are Arm-based, unlike the x86 CPUs in many standard GPU servers.",
    },
  ],
};

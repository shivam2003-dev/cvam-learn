import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Use the roofline formula to predict attainable performance",
    "Find the ridge point and read which side a workload sits on",
    "Decide whether to optimize memory traffic or compute",
  ],
  tasks: [
    {
      id: "formula",
      title: "One formula for the speed limit",
      body: (
        <>
          <p>
            You now have two numbers: the chip's peak compute and bandwidth, and the workload's
            arithmetic intensity. The <strong>roofline model</strong> combines them into a ceiling
            on speed.
          </p>
          <Formula>attainable FLOP/s = min(peak FLOP/s, intensity × bandwidth)</Formula>
          <p>
            Intensity times bandwidth is the speed you could reach if memory were the only limit.
            Peak FLOP/s is the speed if compute were the only limit. You get whichever is lower.
          </p>
        </>
      ),
    },
    {
      id: "ridge",
      title: "The ridge point",
      body: (
        <>
          <p>
            Plot attainable speed against intensity and you get a shape like a roof: a slope that
            rises with intensity, then a flat top. The corner where they meet is the{" "}
            <strong>ridge point</strong>, and it equals the chip's ops:byte ratio.
          </p>
          <Table
            head={["Intensity", "Which side", "Limit"]}
            rows={[
              ["Below the ridge", "Left, on the slope", "Memory bandwidth"],
              ["Above the ridge", "Right, on the flat top", "Peak compute"],
            ]}
          />
          <p>
            Use the illustrative chip from before: 1,000 TFLOP/s of compute and 3 TB/s of
            bandwidth, so the ridge is at about 333.
          </p>
          <pre>
            <code>{`Intensity 1   :  min(1000, 1 × 3)    =    3 TFLOP/s   (0.3% of peak)
Intensity 100 :  min(1000, 100 × 3)  =  300 TFLOP/s   (30% of peak)
Intensity 333 :  min(1000, 333 × 3)  = ~1,000 TFLOP/s (ridge)
Intensity 1365:  min(1000, 1365 × 3) = 1,000 TFLOP/s  (flat top)`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "decisions",
      title: "What it tells you to do",
      body: (
        <>
          <p>The roofline is most useful as a decision tool:</p>
          <ul>
            <li>
              <strong>On the slope (memory-bound):</strong> reduce bytes moved or reuse them more.
              Quantize weights, fuse operations, batch more requests, or use faster memory.
              Adding raw compute does nothing.
            </li>
            <li>
              <strong>On the flat top (compute-bound):</strong> do fewer operations or run them in
              a faster format. Faster memory won't help.
            </li>
            <li>
              <strong>Far below the roof:</strong> something else is wrong, such as launch
              overhead, poor kernels or waiting on the CPU. Profile before assuming a hardware
              limit.
            </li>
          </ul>
          <Callout tone="tip">
            Always ask where you sit relative to the roof before you optimize. Teams routinely
            spend weeks speeding up math in a job that was waiting on memory the whole time.
          </Callout>
        </>
      ),
    },
    {
      id: "limits",
      title: "What the roofline leaves out",
      body: (
        <>
          <p>It's a simple model, and it gives an upper bound. Real kernels rarely reach it.</p>
          <ul>
            <li>It ignores latency, so tiny jobs can be slow even though their bytes are few.</li>
            <li>It assumes perfect overlap of compute and memory access, which is optimistic.</li>
            <li>It treats memory as one level, when real chips have caches that change effective traffic.</li>
            <li>Communication between GPUs adds a third limit, covered in later modules.</li>
          </ul>
          <p>
            Even so, being within sight of the roof is a good sign, and being far below it points
            you to where the time is going.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Attainable speed is the lower of peak compute and intensity times bandwidth.",
    "The ridge point equals the chip's ops:byte ratio.",
    "Left of the ridge you are memory-bound, and right of it you are compute-bound.",
    "Match the fix to the side: cut bytes on the left, cut operations on the right.",
    "The roofline is an upper bound that ignores latency and overlap.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A chip has 800 TFLOP/s and 2 TB/s. At what intensity is its ridge point?",
      format: "***",
      accept: ["400"],
      explain: "800 ÷ 2 = 400 FLOP per byte.",
    },
    {
      kind: "text",
      q: "A chip has 500 TFLOP/s peak and 2 TB/s bandwidth. A job has intensity 50. What is its attainable speed in TFLOP/s?",
      format: "***",
      accept: ["100"],
      explain: "min(500, 50 × 2) = min(500, 100) = 100 TFLOP/s.",
    },
    {
      kind: "mcq",
      q: "A workload is left of the ridge point. Which change helps most?",
      options: [
        "Buy a chip with more FLOP/s and the same bandwidth",
        "Reduce the bytes moved, such as by quantizing weights",
        "Increase clock speed of the math units only",
        "Add more tensor cores",
      ],
      answer: 1,
      explain: "It is limited by memory traffic, so moving fewer bytes raises the ceiling.",
    },
    {
      kind: "mcq",
      q: "A job reaches only 2% of its roofline estimate. What should you suspect?",
      options: [
        "The roofline is wrong",
        "Overhead or poor kernels, not the hardware limit",
        "The GPU is too fast",
        "The model has too few layers",
      ],
      answer: 1,
      explain: "Far below the roof usually means launch overhead, bad kernels or waiting elsewhere.",
    },
  ],
};

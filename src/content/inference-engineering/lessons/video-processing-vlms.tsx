import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why video can't be sent to a VLM frame by frame",
    "Calculate token counts from frame rate, resolution and duration",
    "Choose a frame sampling method for a use case",
    "Design a pipeline for long videos",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Video is a stack of images, and each image costs tokens. Take a one-minute clip at 30
            frames per second (fps). If each frame costs 972 tokens, as in the Vision Language
            Models lesson:
          </p>
          <pre>
            <code>{`Frames:  60 s × 30 fps = 1,800 frames
Tokens:  1,800 × 972 = 1,749,600 tokens`}</code>
          </pre>
          <p>
            Nearly 1.75 million tokens is far beyond the context of most models, for only one
            minute. Yet neighbouring frames are almost identical. A person walking across a room
            looks nearly the same one thirtieth of a second later.
          </p>
          <p>
            So the job of a video pipeline is to throw away what's redundant and keep what
            matters. Think of a flipbook: you can follow the story from every tenth page, and you
            only need to look closer when something changes quickly.
          </p>
          <p>There are three main levers:</p>
          <ul>
            <li>
              <strong>Frame rate:</strong> sample fewer frames per second.
            </li>
            <li>
              <strong>Resolution:</strong> use smaller frames.
            </li>
            <li>
              <strong>Temporal merging:</strong> combine neighbouring frames into one set of
              tokens.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "token-math",
      title: "Worked example: from 1.7 million to 13,000",
      body: (
        <>
          <p>
            Some models, such as the Qwen VL family, group frames in pairs before encoding. This
            is often called a <strong>temporal patch</strong>, because it's a patch in time rather
            than in space. So the formula has three parts:
          </p>
          <Formula>
            video tokens = seconds × fps ÷ temporal merge × tokens per frame
          </Formula>
          <p>
            Now sample at 2 fps, shrink to 504 × 336 pixels, and merge pairs of frames. With 28
            pixels per token:
          </p>
          <pre>
            <code>{`Frames:        60 s × 2 fps = 120 frames
After merging: 120 ÷ 2 = 60 time steps
Per step:      (504 ÷ 28) × (336 ÷ 28) = 18 × 12 = 216 tokens
Total:         60 × 216 = 12,960 tokens`}</code>
          </pre>
          <p>
            That's 135 times fewer tokens. Using the same illustrative figures as before, 20,000
            tokens per second of prefill and 0.5 MiB of KV cache per token:
          </p>
          <pre>
            <code>{`Prefill time:  12,960 ÷ 20,000 ≈ 0.65 s
KV memory:     12,960 × 0.5 MiB = 6,480 MiB ≈ 6.3 GiB`}</code>
          </pre>
          <p>
            That's feasible but still heavy. One short clip uses as much KV cache as a long text
            conversation, which is why video requests limit concurrency so quickly.
          </p>
        </>
      ),
    },
    {
      id: "sampling",
      title: "Choosing which frames to keep",
      body: (
        <>
          <Table
            head={["Method", "How it works", "Good for", "Weakness"]}
            rows={[
              ["Uniform", "One frame every fixed interval", "Predictable cost, general use", "Can miss short events"],
              ["Keyframes", "Use the frames the video encoder stored whole", "Very cheap extraction", "Encoder placement, not meaning, decides them"],
              ["Scene change", "Keep frames where the picture shifts a lot", "Edited videos, slides", "Token count varies by clip"],
              ["Fixed count", "N frames spread across the clip", "A guaranteed token budget", "Long clips get sparse coverage"],
            ]}
          />
          <p>The interval between samples sets what you can miss:</p>
          <Formula>sample interval = 1 ÷ fps</Formula>
          <p>
            At 2 fps, a frame arrives every 0.5 seconds. An event lasting a full 0.5 seconds will
            always be seen. A shorter one might not. For a security camera, or a sports clip where
            one instant matters, sparse sampling can fail silently. The model won't say it missed
            anything. It will just answer from the frames it got.
          </p>
          <p>Two ffmpeg commands show the first and third methods:</p>
          <pre>
            <code>{`# Uniform: 2 frames per second, resized
ffmpeg -i input.mp4 -vf "fps=2,scale=504:336" frames/%05d.jpg

# Scene change: keep frames where the picture shifts
ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',scale=504:336" \\
  -fps_mode vfr scenes/%05d.jpg`}</code>
          </pre>
          <Callout tone="tip">
            Tell the model when each frame was taken. Without timestamps, it can't reliably answer
            "when did this happen?", and it has no way to know how far apart frames are.
          </Callout>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "The cost of decoding video",
      body: (
        <>
          <p>
            Before the model sees anything, the file must be decoded. Compressed video stores
            occasional whole frames, called <strong>keyframes</strong>, and saves other frames as
            changes from their neighbours. To rebuild one frame, the decoder often has to process
            several others first.
          </p>
          <p>
            So taking 2 frames per second doesn't mean decoding only 2 frames per second. Decode
            cost mostly follows the video's length, resolution and codec. High-resolution files
            can use many CPU cores. NVIDIA GPUs also include a hardware video decoder, called
            NVDEC, which can take this load off the CPU.
          </p>
          <Table
            head={["Stage", "Usually runs on", "Scales with"]}
            rows={[
              ["Download and decode", "CPU or hardware decoder", "Duration, resolution, codec"],
              ["Sample and resize", "CPU", "Frames kept"],
              ["Vision encoding", "GPU", "Frames kept and their resolution"],
              ["Prefill and decode", "GPU", "Video tokens and text"],
            ]}
          />
          <Callout tone="note">
            VLMs usually see only the picture. If speech matters, run speech recognition on the
            audio track separately, and add the transcript as text. That's often much cheaper
            than adding more frames.
          </Callout>
        </>
      ),
    },
    {
      id: "long-videos",
      title: "Handling long videos",
      body: (
        <>
          <p>
            An hour of video won't fit, even with sampling. The usual answer is{" "}
            <strong>map-reduce</strong>: process chunks separately, then combine the results.
          </p>
          <ol>
            <li>Split the video into chunks, such as 60 seconds each.</li>
            <li>Run the VLM on each chunk to make a short text summary.</li>
            <li>Send the summaries, with timestamps, to an LLM for the final answer.</li>
          </ol>
          <p>With the settings from our example, a one-hour video costs:</p>
          <pre>
            <code>{`Chunks:        60
Video tokens:  60 × 12,960 = 777,600 tokens
Prefill time:  777,600 ÷ 20,000 ≈ 39 s of GPU time, plus decode`}</code>
          </pre>
          <p>
            Each chunk needs only a manageable KV cache, and chunks can run in parallel. The
            downside is that a chunk can't see the others, so an event spanning two chunks can get
            lost. Overlapping chunks by a few seconds helps.
          </p>
          <p>
            Video jobs are also poor fits for synchronous APIs. Run them asynchronously through a
            queue, and scale decode workers apart from GPU workers. Cache results using a hash of
            the file and the sampling settings, as a second question about the same video
            shouldn't redo the work.
          </p>
          <Callout tone="warn">
            Reject oversized jobs early. Check duration and resolution before decoding, and
            estimate tokens from them. One 4K upload shouldn't be able to consume a whole worker
            pool.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Neighbouring frames are nearly identical, so sampling removes most of the cost.",
    "Tokens depend on duration, frame rate, temporal merging and resolution.",
    "The sampling interval sets the shortest event you can be sure to see.",
    "Video decoding has its own cost, driven by length and resolution.",
    "Long videos need chunking, async jobs and result caching.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why doesn't sampling at 1 fps mean decoding only 1 frame per second of video?",
      options: [
        "ffmpeg always decodes at 4K",
        "Compressed frames often depend on other frames",
        "The vision encoder reads the file directly",
        "Audio has to be decoded with each frame",
      ],
      answer: 1,
      explain: "Most frames are stored as changes from others, so rebuilding one requires decoding more.",
    },
    {
      kind: "mcq",
      q: "A safety system must catch events lasting 0.2 seconds. Which is the right fix?",
      options: [
        "Sample at 1 fps with larger frames",
        "Sample at 5 fps or more",
        "Use only keyframes",
        "Reduce the resolution",
      ],
      answer: 1,
      explain: "At 5 fps, the interval is 0.2 seconds, so an event of that length is always sampled.",
    },
    {
      kind: "text",
      q: "A 30-second clip is sampled at 2 fps, with no temporal merging. Each frame costs 200 tokens. How many tokens in total?",
      format: "*****",
      accept: ["12000", "12,000"],
      explain: "30 × 2 = 60 frames, and 60 × 200 = 12,000.",
    },
    {
      kind: "text",
      q: "A 100-second clip is sampled at 3 fps, with frames merged in pairs. Each time step costs 100 tokens. How many tokens in total?",
      format: "*****",
      accept: ["15000", "15,000"],
      explain: "100 × 3 = 300 frames, 300 ÷ 2 = 150 steps, and 150 × 100 = 15,000.",
    },
  ],
};

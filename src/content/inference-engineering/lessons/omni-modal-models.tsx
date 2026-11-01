import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Describe the parts of an omni-modal model",
    "Estimate token counts and TTFT for a mixed-input request",
    "Size separate encoder pools from a traffic mix",
    "Explain what speech output adds to serving",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A support assistant might get a voice note, a photo of a broken part and a typed
            question, all in one message. You could chain a speech model, a vision model and an
            LLM together. But each hand-off loses information. A transcript drops tone of voice,
            for example, and a caption loses detail the LLM might have needed.
          </p>
          <p>
            An <strong>omni-modal model</strong> takes many input types directly, such as text,
            images, audio and video. A <strong>modality</strong> is simply one type of data. Some
            of these models can also speak their answers. Qwen2.5-Omni is one open example.
          </p>
          <p>
            Think of an international airport. Passengers arrive from many countries through
            separate immigration lanes, each with its own staff and speed. After that, they all
            share the same terminal. An omni-modal model works the same way: separate encoders,
            one shared core. As with the airport, the busiest lane decides how long the wait is.
          </p>
        </>
      ),
    },
    {
      id: "architecture",
      title: "Inside the model",
      body: (
        <>
          <p>Most designs have three parts:</p>
          <ol>
            <li>
              <strong>Encoders.</strong> One per modality, each turning raw input into vectors.
            </li>
            <li>
              <strong>A shared core.</strong> Usually a large LLM that reads all the vectors
              together, as one sequence.
            </li>
            <li>
              <strong>Output heads.</strong> A text head, and sometimes a speech generator.
            </li>
          </ol>
          <p>
            Qwen2.5-Omni calls this a Thinker-Talker design. The Thinker reads the inputs and
            writes text. The Talker turns that into speech. Each encoder and head has its own
            serving profile:
          </p>
          <Table
            head={["Component", "Input cost grows with", "Main risk"]}
            rows={[
              ["Text tokenizer", "Characters", "Rarely a problem"],
              ["Image encoder", "Pixels", "Large uploads, CPU preprocessing"],
              ["Audio encoder", "Seconds of audio", "Long files, format conversion"],
              ["Video pipeline", "Duration and frame rate", "Decode cost, huge token counts"],
              ["Shared core", "Total tokens from all inputs", "KV cache, prefill time"],
              ["Speech output", "Seconds of audio produced", "Keeping up with real time"],
            ]}
          />
        </>
      ),
    },
    {
      id: "mixed-request",
      title: "Worked example: one mixed request",
      body: (
        <>
          <p>
            Audio token rates vary a lot by model, so check yours. As one reference point, Whisper's
            encoder produces 1,500 output frames for 30 seconds, or 50 per second. Assume our model
            downsamples further, to 25 tokens per second.
          </p>
          <p>
            A request has 500 text tokens, one image worth 972 tokens and 60 seconds of audio.
            Keep the earlier illustrative figures of 20,000 tokens per second for prefill and 0.5
            MiB of KV cache per token.
          </p>
          <pre>
            <code>{`Audio tokens:  60 × 25 = 1,500
All tokens:    500 + 972 + 1,500 = 2,972
Prefill:       2,972 ÷ 20,000 ≈ 149 ms
KV memory:     2,972 × 0.5 MiB = 1,486 MiB ≈ 1.45 GiB`}</code>
          </pre>
          <p>
            Now the encoders. Say the image takes 30 ms, and the audio encoder runs at an RTF of
            0.01. RTF, or real-time factor, is processing time divided by audio duration, so 60
            seconds of audio takes 0.6 seconds.
          </p>
          <p>
            If the encoders run one after another, that's 630 ms. If they run at the same time,
            you wait only for the slower one, which is 600 ms:
          </p>
          <Formula>TTFT ≈ queue + slowest encoder + prefill</Formula>
          <pre>
            <code>{`Sequential:  30 + 600 + 149 = 779 ms
Parallel:    600 + 149 = 749 ms`}</code>
          </pre>
          <p>
            The gain here is modest, because audio dominates. With several images and a video,
            running encoders concurrently matters more. In a real system, add the queue time for
            each encoder as well. One slow queue delays the whole request.
          </p>
        </>
      ),
    },
    {
      id: "scaling",
      title: "Scaling each part on its own",
      body: (
        <>
          <p>
            Traffic mix is what makes these systems hard. If you run everything as one block, you
            have to scale it all for the busiest component, and the rest sits idle. Separate pools
            for encoders fix that, as the Independent Component Scaling lesson explains.
          </p>
          <p>
            Take 100 requests per second: 60% include an image, 20% include audio, and the rest
            are text only. One GPU handles 50 images per second, or 10 audio clips per second
            (illustrative).
          </p>
          <pre>
            <code>{`Images:  100 × 0.60 = 60 per second, 60 ÷ 50 = 1.2, so 2 GPUs
Audio:   100 × 0.20 = 20 per second, 20 ÷ 10 = 2 GPUs`}</code>
          </pre>
          <Formula>GPUs for a component = demand ÷ capacity of one GPU, rounded up</Formula>
          <p>
            That's 4 encoder GPUs, and the shared core is sized separately from total tokens. A
            monolithic design can't make this split. But separate pools have a cost: encoder
            output now crosses the network, which adds latency. Start together, and split when
            one component clearly limits you.
          </p>
          <p>
            Clients usually send mixed input as content parts. Here's an audio part in the
            OpenAI-style format, where the server must support it:
          </p>
          <pre>
            <code>{`{
  "role": "user",
  "content": [
    {"type": "text", "text": "Is this motor sound normal?"},
    {"type": "input_audio",
     "input_audio": {"data": "<base64 audio>", "format": "wav"}}
  ]
}`}</code>
          </pre>
          <Callout tone="warn">
            Limit each modality on its own. A cap on request size won't protect you from an hour
            of audio that compresses into a small file. Check duration, pixels and frame counts
            before you do any encoding.
          </Callout>
        </>
      ),
    },
    {
      id: "speech-output",
      title: "When the model talks back",
      body: (
        <>
          <p>
            Speech output adds a real-time deadline. Audio has to play smoothly, so the speech
            generator must produce audio faster than playback. That means an RTF below 1, with
            spare margin for bad moments.
          </p>
          <p>
            With text streaming, a brief pause is a small annoyance. With speech, the same pause
            is an audible gap. So speech models need steadier latency and more headroom. Run
            them below their peak capacity, and watch the tail of generation time, not the average.
          </p>
          <Callout tone="tip">
            Report metrics per modality. Track tokens, encoder time and queue length for images
            and audio separately. A single average latency hides which lane is actually jammed.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Omni-modal models use one encoder per modality and a shared core.",
    "All inputs become tokens, so they all add prefill time and KV cache.",
    "Running encoders in parallel means waiting only for the slowest.",
    "Separate encoder pools match capacity to your traffic mix.",
    "Speech output adds a real-time deadline, so it needs headroom.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What's the main benefit of one omni-modal model over a chain of separate models?",
      options: [
        "It needs no GPU",
        "It avoids losing information at each hand-off",
        "It has no encoders",
        "It always has lower total cost",
      ],
      answer: 1,
      explain: "The core sees the original signals, not only a transcript or a caption.",
    },
    {
      kind: "mcq",
      q: "Speech generation has an RTF of 1.3. What happens during streaming playback?",
      options: [
        "Playback stays smooth",
        "It runs out of audio and stutters",
        "TTFT falls",
        "The KV cache shrinks",
      ],
      answer: 1,
      explain: "An RTF above 1 means audio takes longer to make than to play, so the buffer runs dry.",
    },
    {
      kind: "text",
      q: "A request has 300 text tokens, 2 images of 600 tokens each, and 40 seconds of audio at 25 tokens per second. How many tokens in total?",
      format: "*****",
      accept: ["2500", "2,500"],
      explain: "300 + 1,200 + 1,000 = 2,500.",
    },
    {
      kind: "text",
      q: "Traffic has 90 images per second, and one GPU encodes 40 per second. How many image encoder GPUs do you need?",
      format: "*",
      accept: ["3"],
      explain: "90 ÷ 40 = 2.25, which rounds up to 3.",
    },
  ],
};

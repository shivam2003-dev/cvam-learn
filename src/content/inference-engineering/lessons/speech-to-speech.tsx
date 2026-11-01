import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Compare pipeline voice agents with native speech-to-speech models",
    "Build a latency budget for a voice conversation",
    "Calculate frame budgets and session capacity for a fixed-rate model",
    "Choose an architecture based on control, latency and audio quality",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Fluent conversation has a fast rhythm. When a reply takes too long, people assume
            they weren't heard and start repeating themselves. A typical voice agent has to run
            several models for every turn, and each one adds delay.
          </p>
          <p>
            There's also a loss of information. Once speech becomes text, tone, hesitation and
            sarcasm are mostly gone. The model sees "fine" and doesn't know whether it was said
            happily or through gritted teeth.
          </p>
          <p>
            A <strong>speech-to-speech</strong> model tackles both issues by taking audio in and
            producing audio out, with no separate stages. Think of a translator working through
            written notes, compared with one who listens and answers directly. The second is
            quicker and hears the tone of voice, but leaves no notes behind to review.
          </p>
        </>
      ),
    },
    {
      id: "two-designs",
      title: "Two designs",
      body: (
        <>
          <p>
            The <strong>pipeline</strong> design chains separate components:
          </p>
          <pre>
            <code>{`mic → VAD → ASR → LLM → TTS → speaker`}</code>
          </pre>
          <p>
            The <strong>native</strong> design uses one model. Audio is compressed by a neural
            codec into a small set of discrete tokens, and a language-model-style network reads and
            writes those tokens directly:
          </p>
          <pre>
            <code>{`mic → audio codec → speech-to-speech model → audio codec → speaker`}</code>
          </pre>
          <p>
            Examples include hosted services such as OpenAI's Realtime API and Google's Gemini Live
            API, and open research models such as Kyutai's Moshi. This field moves quickly, so check
            current options before you decide.
          </p>
          <Table
            head={["", "Pipeline", "Native"]}
            rows={[
              ["Latency", "Sum of stages", "Often lower, one model"],
              ["Tone of voice", "Mostly lost at ASR", "Can be preserved"],
              ["Transcript", "Comes for free", "Must be produced separately"],
              ["Swapping parts", "Replace any stage", "All or nothing"],
              ["Guardrails on text", "Easy, text exists before speech", "Harder, audio is produced directly"],
              ["Debugging", "Inspect each stage", "Harder to tell what went wrong"],
              ["Scaling", "Each stage scales on its own", "One large stateful workload"],
            ]}
          />
          <p>
            A middle ground also exists. Some models accept audio in and return text, leaving a
            normal TTS stage for output. You keep the text for guardrails and tools while the model
            still hears tone of voice.
          </p>
        </>
      ),
    },
    {
      id: "latency-budget",
      title: "Worked example: a latency budget",
      body: (
        <>
          <p>
            A <strong>latency budget</strong> shares out the time you can afford between each part
            of a system. Latency here means the time from the end of the user's speech to the first
            audio they hear. All numbers are illustrative. Measure your own.
          </p>
          <Table
            head={["Stage", "Pipeline (ms)", "Native (ms)"]}
            rows={[
              ["End-of-turn wait", "400", "400"],
              ["Final ASR", "150", "Not needed"],
              ["LLM first token", "250", "Not needed"],
              ["TTS first byte", "120", "Not needed"],
              ["Model first audio", "Not needed", "200"],
              ["Network, both ways", "80", "80"],
              ["Total", "1,000", "680"],
            ]}
          />
          <pre>
            <code>{`Pipeline: 400 + 150 + 250 + 120 + 80 = 1,000 ms
Native:   400 + 200 + 80 = 680 ms`}</code>
          </pre>
          <p>
            Look at which part dominates. In both columns, the single largest item is the end-of-turn
            wait, which no faster GPU can fix. Before buying more hardware, improve your
            endpointing.
          </p>
          <Callout tone="tip">
            Add a <strong>p95</strong> budget as well. A pipeline's stage delays stack up, and a
            single slow stage ruins that turn. Averages hide this, and users remember the worst
            pauses.
          </Callout>
        </>
      ),
    },
    {
      id: "serving",
      title: "Serving a fixed-rate model",
      body: (
        <>
          <p>
            A chat model produces tokens as fast as it can. A native speech model has a hard
            real-time clock: it consumes and produces audio at a fixed rate, in fixed frames. Each
            step must finish before the next frame is due.
          </p>
          <p>
            Moshi is a useful example, because it works in 80 ms frames, or 12.5 frames per second.
            So each step gets 80 ms at most:
          </p>
          <Formula>frame budget = 1,000 ms ÷ frames per second</Formula>
          <Formula>GPU share per session = step time ÷ frame budget</Formula>
          <p>Say a step takes 50 ms on your GPU, an illustrative figure:</p>
          <pre>
            <code>{`Frame budget: 1,000 ÷ 12.5 = 80 ms
Share per session: 50 ÷ 80 = 62.5%
Sessions without batching: 1 (a second would need 125%)
Spare time per frame: 80 − 50 = 30 ms`}</code>
          </pre>
          <p>
            The GPU can't run a second session sequentially. Batching several sessions into one
            step is the way out, but it needs a lockstep schedule. All sessions in a batch run on
            the same clock, and step time grows with batch size.
          </p>
          <p>These sessions behave differently from web requests in a few ways:</p>
          <ul>
            <li>
              <strong>They're stateful.</strong> A session holds model state in GPU memory for its
              entire length, and that memory can keep growing with the conversation.
            </li>
            <li>
              <strong>They're long.</strong> A call may run for many minutes, so capacity is about
              concurrent sessions, not requests per second.
            </li>
            <li>
              <strong>They can't be moved easily.</strong> Scaling down means draining calls, and a
              crash drops a call in progress.
            </li>
            <li>
              <strong>Overload can't queue.</strong> An audio frame that arrives late is useless.
              Refuse new sessions at the door rather than degrade all current ones.
            </li>
          </ul>
          <Callout tone="warn">
            Watch step time at p99 as well as the average, because missing the frame deadline even
            occasionally makes audible glitches. Noisy neighbors, thermal throttling and other
            GPU workloads all show up here first.
          </Callout>
        </>
      ),
    },
    {
      id: "choosing",
      title: "How to choose",
      body: (
        <>
          <p>Start with the pipeline if you need any of these:</p>
          <ul>
            <li>Reliable tool calling, retrieval or complex business logic</li>
            <li>Compliance review, text guardrails or full transcripts</li>
            <li>Specific voices, or the freedom to swap vendors stage by stage</li>
          </ul>
          <p>Consider a native model if these matter most:</p>
          <ul>
            <li>Natural flow, overlap and fast back-and-forth</li>
            <li>Understanding tone, or expressive delivery</li>
            <li>Simple conversations, like practice partners or companions</li>
          </ul>
          <p>
            The honest answer is to test with real users. Log both audio and any transcript, with
            consent, and measure task completion alongside latency. A pause of 700 ms that gives a
            correct answer is usually better than a 400 ms pause that doesn't.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Pipelines chain VAD, ASR, LLM and TTS. Native models use one audio-in, audio-out model.",
    "Native models can cut latency and keep tone, but give up inspectable text.",
    "The end-of-turn wait is often the largest item in the budget, whichever design you choose.",
    "Fixed-rate models have a hard frame deadline, measured at high percentiles.",
    "Voice sessions are stateful and long, so plan capacity by concurrent sessions.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main advantage of a pipeline over a native speech-to-speech model?",
      options: [
        "It always has lower latency",
        "It exposes text you can inspect, guard and route",
        "It preserves tone of voice",
        "It uses only one model",
      ],
      answer: 1,
      explain: "Having text between stages makes logging, guardrails, tools and component swaps much easier.",
    },
    {
      kind: "mcq",
      q: "A native voice server reaches full capacity. What's the best way to handle new sessions?",
      options: [
        "Queue their audio frames",
        "Reject or redirect them, so current sessions keep their frame deadlines",
        "Lower the sample rate for everyone",
        "Drop every other frame",
      ],
      answer: 1,
      explain: "Late audio has no value. Admission control protects the sessions already running.",
    },
    {
      kind: "text",
      q: "A model runs at 25 frames per second. What is the frame budget in milliseconds?",
      format: "**",
      accept: ["40", "40 ms"],
      explain: "1,000 ÷ 25 = 40 ms.",
    },
    {
      kind: "text",
      q: "A step takes 10 ms and the frame budget is 80 ms. Ignoring batching and overhead, how many sessions can one GPU run in sequence per frame?",
      format: "*",
      accept: ["8"],
      explain: "80 ÷ 10 = 8 sessions, which leaves no headroom at all.",
    },
    {
      kind: "text",
      q: "A pipeline has an end-of-turn wait of 300 ms, ASR of 100 ms, LLM of 200 ms, TTS of 100 ms and network of 100 ms. What's the total, in ms?",
      format: "***",
      accept: ["800", "800 ms"],
      explain: "300 + 100 + 200 + 100 + 100 = 800 ms.",
    },
  ],
};

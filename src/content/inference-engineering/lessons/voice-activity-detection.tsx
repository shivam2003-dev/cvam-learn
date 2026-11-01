import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain what voice activity detection does and why every speech pipeline needs it",
    "Tune threshold, silence and padding settings and predict their effect",
    "Calculate how much processing and latency a VAD saves or adds",
    "Decide where VAD should run in a real-time system",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            A microphone never stops sending data. Most of what it sends in a typical call is not
            useful: pauses, breathing, keyboard noise, a fan in the room. Speech models are
            expensive, so feeding them all of it wastes GPU time. Worse, some speech recognition
            models invent words when given silence, so a quiet stretch can turn into text nobody
            said.
          </p>
          <p>
            <strong>Voice activity detection</strong> (VAD) answers one simple question for each
            short slice of audio: is someone speaking right now? Think of it as a doorman for your
            speech models. It lets speech in and keeps everything else out.
          </p>
          <p>VAD does three separate jobs in a pipeline:</p>
          <ul>
            <li>
              <strong>Filtering:</strong> drop non-speech audio before the expensive speech
              recognition stage.
            </li>
            <li>
              <strong>Endpointing:</strong> decide that the speaker has finished, so the system can
              start responding.
            </li>
            <li>
              <strong>Barge-in detection:</strong> notice the user talking while the assistant is
              speaking, so playback can stop.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "How a VAD works",
      body: (
        <>
          <p>
            A VAD cuts audio into short <strong>frames</strong> and gives each one a score. Older
            detectors used hand-built statistics about energy and frequency. WebRTC's classic VAD
            is one example, based on Gaussian mixture models. It is extremely cheap, but it can
            mistake loud noise for speech. Newer detectors such as Silero VAD use a very small
            neural network. They handle noisy rooms far better and still run comfortably on a CPU.
          </p>
          <Table
            head={["", "Classic statistical VAD", "Small neural VAD"]}
            rows={[
              ["Output", "Yes or no per frame", "Probability per frame"],
              ["Handles noise", "Weakly", "Much better"],
              ["CPU cost", "Almost nothing", "Small, but measurable"],
              ["Hardware", "CPU", "CPU, no GPU required"],
            ]}
          />
          <p>
            Frames are short. Silero VAD's recent versions take 512 samples at 16 kHz, which is
            32 ms of audio:
          </p>
          <Formula>frame length = samples ÷ sample rate = 512 ÷ 16,000 = 0.032 s</Formula>
          <p>
            Scores for single frames flicker, so raw scores can't be used directly. A small state
            machine smooths them into segments. It usually has two thresholds. A frame must score
            above the higher one to start speech, and must drop below the lower one to count as
            silence. The gap between them is called <strong>hysteresis</strong>, and it stops the
            state from flipping back and forth around a single value.
          </p>
        </>
      ),
    },
    {
      id: "settings",
      title: "The settings that matter",
      body: (
        <>
          <p>Four settings control most of the behavior you will notice in production:</p>
          <Table
            head={["Setting", "Too low", "Too high"]}
            rows={[
              ["Speech threshold", "Noise triggers the pipeline", "Quiet speakers get missed"],
              ["Minimum speech length", "Coughs and clicks count as speech", "Short replies like 'yes' are dropped"],
              ["Minimum silence length", "Sentences are cut at natural pauses", "Replies feel slow to begin"],
              ["Speech padding", "First and last sounds are clipped", "Extra silence reaches the model"],
            ]}
          />
          <p>Here is a batch example using the Silero VAD Python package:</p>
          <pre>
            <code>{`from silero_vad import load_silero_vad, read_audio, get_speech_timestamps

model = load_silero_vad()
wav = read_audio("call.wav", sampling_rate=16000)

segments = get_speech_timestamps(
    wav,
    model,
    threshold=0.5,
    min_speech_duration_ms=250,
    min_silence_duration_ms=500,
    speech_pad_ms=200,
    return_seconds=True,
)
print(segments)  # a list of dicts with 'start' and 'end' in seconds`}</code>
          </pre>
          <Callout tone="warn">
            Padding is not optional. Words often begin softly, and a VAD needs a few frames to
            react. In a live stream, keep a short rolling buffer of recent audio, so that when
            speech is detected you can send what came just before it. Otherwise the first
            consonant disappears and transcripts start with the wrong word.
          </Callout>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "Worked example: what it saves",
      body: (
        <>
          <p>
            Take a 60-minute call recording. Standard speech audio is 16 kHz, 16-bit, mono, which
            is 2 bytes per sample:
          </p>
          <pre>
            <code>{`16,000 samples/s × 2 bytes = 32,000 bytes/s
32,000 × 3,600 s = 115,200,000 bytes ≈ 115 MB`}</code>
          </pre>
          <p>
            Suppose speech fills 40% of the recording, and your speech recognition service runs
            at 20 times real time. Both figures are illustrative.
          </p>
          <pre>
            <code>{`Without VAD: 60 min ÷ 20 = 3.0 min of GPU time
With VAD:    60 × 0.40 = 24 min of speech
             24 min ÷ 20 = 1.2 min of GPU time
Saving:      1.8 min, or 60%`}</code>
          </pre>
          <Formula>saved GPU time = total time × (1 − speech fraction)</Formula>
          <p>
            The VAD also has a cost, but it's tiny. It runs on a CPU, and a small share of one core
            can usually keep up with a stream. Check that on your own hardware before planning
            capacity for many streams.
          </p>
        </>
      ),
    },
    {
      id: "latency",
      title: "Endpointing is a latency decision",
      body: (
        <>
          <p>
            In a voice agent, the VAD has to wait to be sure the user has stopped. That wait is
            added directly to response time. With a 500 ms minimum silence, the assistant can't
            start for at least 500 ms after the last word, however fast the other models are. At
            32 ms per frame, that's about 16 frames of waiting:
          </p>
          <Formula>500 ms ÷ 32 ms per frame ≈ 15.6, so 16 frames</Formula>
          <p>
            Lowering this to 200 ms feels snappy, but people pause while thinking. The assistant
            will start talking over them, which feels worse than a slow reply. No single value is
            right. A quick question and a dictated address need different windows.
          </p>
          <p>Two techniques ease the tradeoff:</p>
          <ul>
            <li>
              <strong>Semantic end-of-turn detection:</strong> a small model looks at the
              transcript or audio and judges whether the sentence sounds finished. "My number is
              four one five" clearly isn't. The silence window can then stretch or shrink per turn.
            </li>
            <li>
              <strong>Speculative processing:</strong> start the language model early, at a short
              pause. Keep the result if the user really stopped, and throw it away if they
              continue. You pay some wasted compute in exchange for lower latency.
            </li>
          </ul>
          <Callout tone="tip" title="Where to run it">
            Running VAD on the client saves bandwidth and reacts instantly, which is useful for
            barge-in. Running it on the server gives you one consistent version and full logs.
            Many systems do both: a light client check, then a server decision. Log the frame
            scores for a sample of calls, since that's how you debug complaints about clipped
            words or slow replies.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "VAD marks where speech begins and ends so expensive models only see useful audio.",
    "It filters audio, endpoints turns and detects barge-in, and each job has different needs.",
    "Thresholds, minimum durations and padding turn noisy frame scores into clean segments.",
    "The silence window adds directly to response latency, so it is a user experience decision.",
    "Small neural VADs run on CPU and handle noise far better than classic statistical ones.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Users complain that the first word of each transcript is often wrong or missing. Which fix is most likely to help?",
      options: [
        "Increase the minimum silence length",
        "Add speech padding with a rolling pre-speech buffer",
        "Raise the speech threshold",
        "Move the VAD to a GPU",
      ],
      answer: 1,
      explain: "The VAD reacts a few frames late. Padding sends the audio just before detection, so the start of the word survives.",
    },
    {
      kind: "mcq",
      q: "Why does a VAD usually use two thresholds instead of one?",
      options: [
        "To support stereo audio",
        "To stop the state flipping when scores hover around one value",
        "To reduce the model's size",
        "To detect the speaker's language",
      ],
      answer: 1,
      explain: "This gap is hysteresis. It keeps segments stable when frame scores flicker.",
    },
    {
      kind: "mcq",
      q: "Lowering the minimum silence length from 800 ms to 200 ms is most likely to cause what problem?",
      options: [
        "The assistant interrupts users who pause mid-sentence",
        "GPU memory runs out",
        "Audio sample rate drops",
        "The first consonant is always lost",
      ],
      answer: 0,
      explain: "A short window treats natural thinking pauses as the end of a turn.",
    },
    {
      kind: "text",
      q: "A two-hour recording contains 25% speech. In minutes, how much audio reaches speech recognition after VAD?",
      format: "**",
      accept: ["30", "30 minutes", "30 min"],
      explain: "120 minutes × 0.25 = 30 minutes.",
    },
    {
      kind: "text",
      q: "At 16 kHz, how many milliseconds of audio do 480 samples hold?",
      format: "**",
      accept: ["30", "30 ms"],
      explain: "480 ÷ 16,000 = 0.03 s, which is 30 ms.",
    },
  ],
};

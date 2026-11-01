import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Trace audio through an automatic speech recognition model, from waveform to text",
    "Compare batch and streaming transcription and their serving needs",
    "Calculate word error rate and real-time capacity",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Most software can't do anything with raw sound, but it can search, summarize and reason
            over text. <strong>Automatic speech recognition</strong> (ASR) converts spoken audio
            into text. It powers meeting notes, captions, call analytics and the input side of every
            voice agent.
          </p>
          <p>
            ASR is harder to serve than it looks. Audio arrives as a continuous stream rather than
            neat requests. A person may speak for one second or one hour. In a live call, words must
            appear while they're being said, and the system can't wait until the end to correct
            itself. Different use cases therefore need quite different serving designs.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "From waveform to words",
      body: (
        <>
          <p>
            Audio is usually resampled to 16 kHz mono, then turned into a{" "}
            <strong>log-Mel spectrogram</strong>. That's a kind of image: time runs along one axis,
            frequency along the other, and brightness shows energy. Frequencies are spaced to match
            human hearing, and it's a compact input for a neural network.
          </p>
          <p>From there, two designs are common.</p>
          <Table
            head={["", "Encoder-decoder", "CTC or transducer"]}
            rows={[
              ["Example", "Whisper", "Conformer-style streaming models"],
              ["How it outputs", "Generates text tokens one at a time", "Emits labels aligned with audio frames"],
              ["Natural fit", "Batch and near-real-time", "Low-latency streaming"],
              ["Serving cost", "Encoder pass, then a decoder loop", "Mostly one pass over the audio"],
            ]}
          />
          <p>
            Whisper shows the encoder-decoder pattern clearly. It takes fixed 30-second windows.
            The spectrogram uses a 10 ms step, so each window is 3,000 frames. The encoder reads the
            window once, and the decoder then generates text with cross-attention, much like the
            encoder-decoder models covered earlier. That makes the encoder a fixed cost per window,
            and the decoder a cost that depends on how many words were spoken.
          </p>
          <p>
            A <strong>CTC</strong> (connectionist temporal classification) model works differently.
            It predicts a label or a blank for each audio frame, then collapses repeats and blanks
            into text. There's no long decoder loop, which suits streaming.
          </p>
          <p>
            Long recordings are cut into overlapping chunks, ideally at silences found by a VAD, so
            words aren't split across chunks. The overlaps are then merged.
          </p>
          <Callout tone="warn">
            Whisper-style models may produce believable text during silence or music. Running a VAD
            first is the standard defense. Without one, you pay for the compute and also get text
            that was never spoken.
          </Callout>
        </>
      ),
    },
    {
      id: "batch",
      title: "Batch transcription",
      body: (
        <>
          <p>
            In batch mode, the whole file is available up front. Latency matters less, so you can
            cut a recording into many chunks and run them through the GPU together. Throughput is
            usually measured in real-time speed, the ratio of audio duration to processing time.
          </p>
          <Formula>speed = seconds of audio ÷ seconds of processing</Formula>
          <Callout tone="note">
            "Real-time factor" is used both ways. Some people mean processing divided by audio,
            where lower is better. Others mean audio divided by processing, often written RTFx,
            where higher is better. Check which one a benchmark uses.
          </Callout>
          <p>Here's a batch job using faster-whisper, a CTranslate2 reimplementation of Whisper:</p>
          <pre>
            <code>{`from faster_whisper import WhisperModel

model = WhisperModel("large-v3", device="cuda", compute_type="float16")

segments, info = model.transcribe(
    "call.wav",
    language="en",
    beam_size=5,
    vad_filter=True,
)
print(info.language, info.duration)

# segments is a generator: transcription runs as you iterate
for s in segments:
    print(f"[{s.start:.2f} -> {s.end:.2f}] {s.text}")`}</code>
          </pre>
          <p>
            Two settings here affect cost directly. <code>beam_size</code> tracks several candidate
            transcripts at once, which usually helps accuracy but takes more compute. Setting it
            to 1 is faster. <code>compute_type</code> sets numeric precision, and quantized options
            such as <code>int8</code> use less memory.
          </p>
        </>
      ),
    },
    {
      id: "streaming",
      title: "Streaming transcription",
      body: (
        <>
          <p>
            In streaming mode, audio arrives in small chunks over a connection, usually a WebSocket
            or WebRTC. The server returns two kinds of result:
          </p>
          <ul>
            <li>
              <strong>Partial results:</strong> a fast guess that may still change. "I want to
              rec..." might become "recognize".
            </li>
            <li>
              <strong>Final results:</strong> stable text that won't change, ready to send to a
              language model.
            </li>
          </ul>
          <p>
            Streaming is a hard real-time problem. Each second of audio must be processed in under
            one second on average, or a backlog builds and latency climbs without limit. Unlike a
            chat request, a stream also holds resources for its entire length. Connections usually
            need sticky routing, because the model's state for that stream lives on one server.
          </p>
          <p>Capacity follows from time per chunk. In this illustrative setup:</p>
          <pre>
            <code>{`Chunk length:          1,000 ms of audio
Time to process chunk:   100 ms of GPU
Utilization per stream: 100 ÷ 1,000 = 10%

Hard limit:   100% ÷ 10% = 10 streams
Target of 70% busy: 70% ÷ 10% = 7 streams`}</code>
          </pre>
          <Formula>streams ≈ target utilization ÷ (chunk compute ÷ chunk length)</Formula>
          <p>
            Keep headroom. If a GPU stays near 100% busy, one slow chunk delays everything behind
            it. Batching chunks from many streams helps, but waiting to fill a batch adds latency,
            the same tension you saw with text models.
          </p>
        </>
      ),
    },
    {
      id: "wer",
      title: "Measuring accuracy",
      body: (
        <>
          <p>
            The usual metric is <strong>word error rate</strong> (WER). Align the transcript with a
            correct reference, then count three error types.
          </p>
          <Formula>WER = (substitutions + deletions + insertions) ÷ reference words</Formula>
          <p>Say a reference has 200 words, and the model output has these errors:</p>
          <pre>
            <code>{`Substitutions: 6
Deletions:     3
Insertions:    1

WER = (6 + 3 + 1) ÷ 200 = 10 ÷ 200 = 0.05 = 5%`}</code>
          </pre>
          <p>
            Normalize text first, or "twenty five" and "25" will count as errors. Also, WER treats
            all words alike. Getting an account number wrong matters far more than missing "um", so
            test the terms your product depends on. Evaluate on your own audio as well. Phone
            calls, accents and background noise can behave very differently from a clean benchmark.
          </p>
          <Callout tone="tip">
            Keep a set of real, hand-corrected recordings for your product. Run each new model,
            chunk size or setting against it, and compare error rate and speed together. A faster
            config that loses the names of your products isn't really faster.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ASR models turn audio into a spectrogram, then into text.",
    "Encoder-decoder models suit batch work, while CTC and transducer models suit streaming.",
    "Batch work is scored on throughput. Streaming must stay faster than real time.",
    "Each stream holds resources for its whole length and needs sticky routing.",
    "WER counts substitutions, deletions and insertions against reference words.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What happens if a streaming ASR server takes longer than one second to process each second of audio?",
      options: [
        "Accuracy improves",
        "A backlog grows and latency keeps climbing",
        "The GPU frees memory",
        "The audio sample rate rises",
      ],
      answer: 1,
      explain: "Audio arrives at a fixed rate. If processing is slower than that rate, the delay grows for as long as the stream runs.",
    },
    {
      kind: "mcq",
      q: "Why are streaming connections usually routed to the same server for their whole length?",
      options: [
        "Load balancers can't split audio",
        "The stream's model state lives on that server",
        "Audio is encrypted per server",
        "GPU drivers require it",
      ],
      answer: 1,
      explain: "A stream keeps state between chunks. Moving it to another server would lose that context.",
    },
    {
      kind: "text",
      q: "A reference transcript has 400 words. The model makes 10 substitutions, 4 deletions and 2 insertions. What is the WER as a percentage?",
      format: "*",
      accept: ["4", "4%", "4.0", "4 percent"],
      explain: "(10 + 4 + 2) ÷ 400 = 16 ÷ 400 = 0.04, or 4%.",
    },
    {
      kind: "text",
      q: "Processing a 500 ms chunk takes 25 ms of GPU time. With a target of 50% utilization, how many streams fit on the GPU?",
      format: "**",
      accept: ["10"],
      explain: "Each stream uses 25 ÷ 500 = 5% of the GPU. 50% ÷ 5% = 10 streams.",
    },
  ],
};

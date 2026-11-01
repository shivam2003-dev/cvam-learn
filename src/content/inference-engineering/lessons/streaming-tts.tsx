import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain how streaming reduces perceived TTS latency",
    "Calculate the buffer needed to avoid playback gaps",
    "Chunk language model output into text that synthesizes well",
    "Handle interruptions cleanly in a live conversation",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            If you generate a 30-second reply at 10 times real time, the full clip takes 3 seconds.
            Three seconds of dead air on a phone call feels broken. Yet the listener never needs all
            30 seconds at once. They only need the next moment of audio.
          </p>
          <p>
            <strong>Streaming TTS</strong> sends audio as it's produced, so playback starts long
            before synthesis ends. In that example, the first half-second of audio might exist after
            50 ms. The total work hasn't changed, only when the listener hears the first sound.
          </p>
          <p>
            It works like streaming a film. Your player doesn't download the whole movie first. It
            keeps a small buffer ahead of the playhead, and as long as the download outruns
            playback, you never notice.
          </p>
          <p>Two metrics matter here:</p>
          <Table
            head={["Metric", "Meaning", "If it's bad"]}
            rows={[
              ["Time to first byte", "Text received to first audio sent", "An awkward silence"],
              ["Real-time speed", "Seconds of audio per second of compute", "Gaps during playback"],
            ]}
          />
          <p>
            Time to first byte is the speech version of time to first token. Real-time speed is
            closer to tokens per second, but with one crucial difference: it has a hard floor. A
            reader can tolerate text slowing down. A listener can't tolerate audio stopping.
          </p>
        </>
      ),
    },
    {
      id: "buffers",
      title: "The buffer math",
      body: (
        <>
          <p>
            Let speed be <code>s</code>, in seconds of audio per second of compute. At or above 1,
            generation keeps up with playback. Below 1, playback will catch up with generation and
            the audio stops. This is a <strong>buffer underrun</strong>, which listeners hear as a
            stutter.
          </p>
          <p>If speed falls under 1, you can only avoid gaps by delaying the start:</p>
          <Formula>start delay ≥ audio length × (1 ÷ s − 1)</Formula>
          <p>Say a shared GPU drops to 0.8 times real time for a 10-second sentence:</p>
          <pre>
            <code>{`Generation time: 10 ÷ 0.8 = 12.5 s
Playback time:   10 s
Required delay:  12.5 − 10 = 2.5 s
Check:           10 × (1 ÷ 0.8 − 1) = 10 × 0.25 = 2.5 s`}</code>
          </pre>
          <p>
            A 2.5-second wait defeats the point, so the real goal is to keep speed comfortably above
            1. A small buffer exists to absorb jitter, not to hide a slow model. Jitter means
            uneven timing from the network or the GPU.
          </p>
          <p>
            Buffer size is a direct tradeoff. A larger one survives more jitter but adds the same
            amount of delay before anything is heard. For interactive voice, the client buffer is
            often a small fraction of a second. For audiobook-style playback, a few seconds is fine.
          </p>
        </>
      ),
    },
    {
      id: "chunking",
      title: "Chunking text from an LLM",
      body: (
        <>
          <p>
            In a voice agent, the text itself arrives as a stream of tokens. TTS needs some
            sentence context to sound natural, because intonation depends on what comes next. A
            question rises at its end, for example. Send single tokens and the speech will sound
            robotic. Wait for a whole paragraph and the delay returns. The usual compromise is to
            collect tokens until a sentence or clause ends.
          </p>
          <pre>
            <code>{`import re

SENTENCE_END = re.compile(r"[.!?]\\s")

async def sentences(token_stream, min_chars=30):
    """Group LLM tokens into chunks for TTS."""
    buffer = ""
    async for token in token_stream:
        buffer += token
        match = SENTENCE_END.search(buffer, min_chars)
        if match:
            yield buffer[: match.end()].strip()
            buffer = buffer[match.end():]
    if buffer.strip():
        yield buffer.strip()`}</code>
          </pre>
          <p>
            <code>min_chars</code> stops very short fragments and many abbreviations from being
            sent on their own, but a splitter like this will still break at some of them. A real
            one also handles decimals and lists.
          </p>
          <p>This wait has a cost you can calculate. With illustrative numbers:</p>
          <pre>
            <code>{`First sentence:     20 tokens
LLM output speed:   40 tokens/s
Wait for sentence:  20 ÷ 40 = 0.5 s
TTS first byte:     0.1 s
Audio starts:       0.5 + 0.1 = 0.6 s after the LLM's first token`}</code>
          </pre>
          <p>
            Short first sentences start audio sooner. That's why voice prompts often ask the model
            to open with a brief phrase. Flushing at a comma can also help, but only if the model's
            phrasing still sounds right.
          </p>
        </>
      ),
    },
    {
      id: "transport",
      title: "Getting audio to the listener",
      body: (
        <>
          <p>
            Audio travels in small frames. At 24 kHz, 16-bit mono, a 20 ms frame of raw PCM holds:
          </p>
          <pre>
            <code>{`24,000 × 0.020 = 480 samples
480 × 2 bytes = 960 bytes`}</code>
          </pre>
          <p>That's 48,000 bytes per second, or 384 kbps, for one stream.</p>
          <Table
            head={["Transport", "Good for", "Keep in mind"]}
            rows={[
              ["HTTP chunked", "Simple one-way playback", "Runs over TCP, so one lost packet delays the rest"],
              ["WebSocket", "Server apps and telephony bridges", "Also TCP, but easy to run in both directions"],
              ["WebRTC", "Browser and mobile real-time voice", "Built for live media, with more moving parts"],
            ]}
          />
          <p>
            Compression helps on weak networks. Opus is the common choice, and for speech it can
            reduce bitrate to a small fraction of raw PCM. Encoding does add a small CPU cost per
            stream, and telephony usually dictates its own format, so check your provider's
            requirements.
          </p>
          <p>
            On the serving side, a new stream's first chunk should run ahead of later chunks for
            streams that already have audio buffered. That one rule protects time to first byte
            while streams continue steadily, and it's a good first scheduling policy.
          </p>
        </>
      ),
    },
    {
      id: "barge-in",
      title: "Stopping cleanly",
      body: (
        <>
          <p>
            People interrupt. When the VAD hears the user during playback, three things must happen
            fast:
          </p>
          <ol>
            <li>Stop playback and clear the client's audio buffer.</li>
            <li>Cancel in-flight synthesis and LLM generation to free compute.</li>
            <li>Update the conversation with only what the user actually heard.</li>
          </ol>
          <p>
            That third step is easy to forget. If the model thinks it said a whole paragraph but the
            user heard one sentence, the next reply can refer to things the user never heard. To
            fix it, track how much audio played and map that time back to the text. Word-level
            timestamps from the TTS model make this accurate.
          </p>
          <Callout tone="warn">
            Generating far ahead of playback looks efficient, but on interruption all that extra
            audio is wasted. Keep the server's lead small and steady. Cancellation should also
            reach the model itself. Closing a socket doesn't always stop a running job.
          </Callout>
          <p>
            One more quality risk: chunks generated separately may not join smoothly, and voice
            pitch or pace can shift at the boundary. Many streaming models accept previous text or
            state for context, which helps. Listen to the joins as well as the sentences.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Streaming cuts perceived latency without reducing total compute.",
    "Generation must stay faster than playback, or the audio stops.",
    "Buffers absorb jitter, but each millisecond of buffer adds delay.",
    "Chunk LLM output by sentence or clause to balance speed and natural speech.",
    "On interruption, stop playback, cancel work and record what was actually heard.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does streaming change about TTS?",
      options: [
        "It reduces total compute",
        "It starts playback earlier, while total work stays about the same",
        "It removes the need for a vocoder",
        "It raises the audio sample rate",
      ],
      answer: 1,
      explain: "The same audio is produced overall. The listener simply hears the beginning much sooner.",
    },
    {
      kind: "mcq",
      q: "After a barge-in, why record how much audio the user heard?",
      options: [
        "To bill the right amount",
        "So the conversation history reflects what was really delivered",
        "To compress later replies",
        "To retrain the voice",
      ],
      answer: 1,
      explain: "If history holds unheard text, the model may refer to things the user never heard.",
    },
    {
      kind: "mcq",
      q: "Why not send each LLM token straight to the TTS model?",
      options: [
        "Tokens are too large",
        "Natural intonation depends on surrounding sentence context",
        "TTS models only accept 1,000 characters",
        "It would violate the WebSocket protocol",
      ],
      answer: 1,
      explain: "Pitch and rhythm depend on what comes next, so TTS needs at least a phrase of text.",
    },
    {
      kind: "text",
      q: "A model runs at 0.5 times real time for 4 seconds of audio. What is the minimum start delay, in seconds, to avoid a gap?",
      format: "*",
      accept: ["4", "4 s", "4 seconds"],
      explain: "4 × (1 ÷ 0.5 − 1) = 4 × 1 = 4 seconds. Generation takes 8 seconds and playback takes 4.",
    },
    {
      kind: "text",
      q: "How many bytes does a 20 ms frame of 16 kHz, 16-bit mono PCM hold?",
      format: "***",
      accept: ["640"],
      explain: "16,000 × 0.020 = 320 samples, and 320 × 2 bytes = 640 bytes.",
    },
  ],
};

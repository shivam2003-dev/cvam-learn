import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe each stage of a text-to-speech pipeline",
    "Explain why text normalization causes many production bugs",
    "Size a TTS service using audio bytes, speaking rate and real-time speed",
    "Reduce cost with caching and sensible sentence splitting",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Language models write text, but plenty of products need to talk: phone agents, screen
            readers, narration, in-car assistants. <strong>Text-to-speech</strong> (TTS) turns
            written text into audio that a person can comfortably listen to.
          </p>
          <p>
            The output format is what makes this unusual. A language model produces a few dozen
            tokens per second. A TTS model has to produce thousands of audio samples per second, all
            of which must be smooth, because the human ear catches small glitches easily. Its
            output also has a real-world clock. Once playback starts, the next sample has to be
            ready when the speaker needs it.
          </p>
          <p>
            Think of a TTS system as a stage actor. First it works out what the script actually
            says. Then it plans rhythm, stress and pauses. Finally it produces the sound. Each of
            those maps to a stage in the pipeline.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "The stages",
      body: (
        <>
          <Table
            head={["Stage", "Input", "Output", "Runs on"]}
            rows={[
              ["Text normalization", "Raw text", "Spoken-form words", "CPU"],
              ["Phonemization", "Words", "Phonemes, the units of sound", "CPU"],
              ["Acoustic model", "Phonemes and voice", "Spectrogram or audio codes", "GPU or CPU"],
              ["Vocoder", "Spectrogram or codes", "Waveform", "GPU or CPU"],
            ]}
          />
          <p>
            <strong>Text normalization</strong> rewrites text the way it should be said. "$3.50"
            becomes "three dollars and fifty cents". <strong>Phonemization</strong> converts those
            words into sound units, since English spelling is a poor guide to pronunciation.
          </p>
          <p>
            The <strong>acoustic model</strong> predicts how the audio should look over time,
            including pitch, timing and voice identity. The classic output is a Mel spectrogram. The{" "}
            <strong>vocoder</strong> turns that into an actual waveform.
          </p>
          <p>
            Newer models blur these lines. Some generate audio directly from text in one network.
            Others use a language-model-style architecture to produce tokens for a neural audio
            codec, then decode those tokens into sound. Some of these skip phonemes completely.
            The serving questions stay the same, though: how fast does audio come out, and how
            much hardware does it take?
          </p>
          <p>
            Here is a small example with Kokoro, an open-weight model with about 82 million
            parameters that produces 24 kHz audio:
          </p>
          <pre>
            <code>{`import soundfile as sf
from kokoro import KPipeline

pipeline = KPipeline(lang_code="a")  # "a" means American English
text = "Your order ships on Tuesday. It should arrive by Friday."

for i, (graphemes, phonemes, audio) in enumerate(
    pipeline(text, voice="af_heart")
):
    print(graphemes, phonemes)
    sf.write(f"part_{i}.wav", audio, 24000)`}</code>
          </pre>
          <p>
            Note that it yields audio piece by piece. Splitting text into smaller units is both a
            memory safeguard and the starting point for streaming, which the next lesson covers.
          </p>
        </>
      ),
    },
    {
      id: "normalization",
      title: "Normalization: the quiet source of bugs",
      body: (
        <>
          <p>
            The same characters can be read several ways, and only context tells you which is
            right.
          </p>
          <Table
            head={["Written", "Could be read as"]}
            rows={[
              ["1995", "'nineteen ninety-five' (year) or 'one thousand nine hundred ninety-five'"],
              ["Dr.", "'doctor' or 'drive'"],
              ["3/4", "'three quarters', 'March fourth' or 'April third'"],
              ["read", "Rhymes with 'reed' or 'red', depending on tense"],
            ]}
          />
          <p>
            This matters more for LLM output, which may contain Markdown, URLs, code or tables.
            Nobody wants to hear "asterisk asterisk important asterisk asterisk". Ask the model to
            write for speech and clean its output before synthesis.
          </p>
          <Callout tone="warn">
            Listen to your domain's real content before launch: order numbers, currency, addresses,
            drug names. Many models also accept pronunciation hints. Write a test list of hard
            phrases and rerun it for each new model or voice.
          </Callout>
        </>
      ),
    },
    {
      id: "sizing",
      title: "Worked example: sizing a service",
      body: (
        <>
          <p>
            Start with raw audio size. At 24 kHz and 16 bits (2 bytes) per sample, mono:
          </p>
          <Formula>bytes per second = sample rate × bytes per sample × channels</Formula>
          <pre>
            <code>{`24,000 × 2 × 1 = 48,000 bytes/s
One minute: 48,000 × 60 = 2,880,000 bytes ≈ 2.9 MB`}</code>
          </pre>
          <p>
            Next, length. A natural speaking rate in English is often about 150 words per minute, or
            2.5 words per second. A 300-word answer is 120 seconds of speech:
          </p>
          <pre>
            <code>{`300 words ÷ 2.5 words/s = 120 s of audio`}</code>
          </pre>
          <p>
            Now throughput. Measure real-time speed: seconds of audio made per second of compute.
            Suppose your model reaches 20 times real time on one GPU. This figure is illustrative,
            and yours depends on the model and hardware.
          </p>
          <pre>
            <code>{`Generation time: 120 s ÷ 20 = 6 s
Max real-time streams: about 20
At 70% target utilization: 20 × 0.70 = 14 streams`}</code>
          </pre>
          <p>
            Note the limit: 20 is a ceiling for steady output. It assumes the GPU never sits idle
            and that streams can share compute cleanly. Short bursts and overlap can both push
            latency up well before you reach it.
          </p>
        </>
      ),
    },
    {
      id: "reducing-cost",
      title: "Getting more from your hardware",
      body: (
        <>
          <ul>
            <li>
              <strong>Cache audio.</strong> Greetings and common prompts repeat constantly. Use a
              key of normalized text, voice, model version, speed and format. Serving a cached
              phrase takes almost no compute.
            </li>
            <li>
              <strong>Split into sentences.</strong> Models often behave better, and use less
              memory, on short inputs. Splitting at sentence boundaries also keeps intonation
              natural, whereas a split mid-phrase sounds wrong.
            </li>
            <li>
              <strong>Batch carefully.</strong> Batching sentences of similar length uses a GPU
              well for offline narration. For live speech, keep batches small to protect latency.
            </li>
            <li>
              <strong>Consider CPU.</strong> Small models can reach faster than real time on a
              modern CPU. For low volumes, that may be far cheaper than keeping a GPU warm.
            </li>
          </ul>
          <Callout tone="note" title="Voice cloning">
            Some TTS models can copy a voice from a short clip. Get clear consent from the voice's
            owner, and treat cloned voices as sensitive data. It's a legal and safety concern as
            much as a technical one, and rules vary by region.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "TTS moves from text to spoken form, then to sounds, then to a spectrogram or codes, then to a waveform.",
    "Text normalization needs context, and errors here are obvious to listeners.",
    "Measure real-time speed: seconds of audio per second of compute.",
    "Size capacity from speaking rate and real-time speed, then keep headroom.",
    "Caching repeated phrases is often the cheapest speedup you can get.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which stage decides whether 'Dr.' should be spoken as 'doctor' or 'drive'?",
      options: ["Vocoder", "Text normalization", "Acoustic model", "Audio codec"],
      answer: 1,
      explain: "Text normalization turns written forms into spoken words, using context.",
    },
    {
      kind: "mcq",
      q: "In a classic pipeline, what does the vocoder do?",
      options: [
        "Splits text into sentences",
        "Turns a spectrogram into a waveform",
        "Converts words to phonemes",
        "Detects speech in audio",
      ],
      answer: 1,
      explain: "The acoustic model predicts a spectrogram, and the vocoder turns it into playable audio.",
    },
    {
      kind: "mcq",
      q: "Which is the best cache key for generated audio?",
      options: [
        "The user's ID",
        "The normalized text, voice, model version, speed and format",
        "The request timestamp",
        "The first word of the text",
      ],
      answer: 1,
      explain: "Everything that changes the audio must be in the key, or the cache may return the wrong result.",
    },
    {
      kind: "text",
      q: "At 2.5 words per second, how many seconds of audio does a 150-word answer produce?",
      format: "**",
      accept: ["60", "60 s", "60 seconds"],
      explain: "150 ÷ 2.5 = 60 seconds.",
    },
    {
      kind: "text",
      q: "How many bytes per second does 16 kHz, 16-bit mono PCM audio use?",
      format: "*****",
      accept: ["32000", "32,000"],
      explain: "16,000 samples × 2 bytes × 1 channel = 32,000 bytes per second.",
    },
  ],
};

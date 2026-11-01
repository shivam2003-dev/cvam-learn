import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Describe how speech-to-text and text-to-speech work at a practical level",
    "Calculate word error rate and raw audio size",
    "Lay out a voice assistant pipeline and its latency budget",
    "List the design problems unique to voice: interruptions, silence, accents and consent",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: people talk, and typing is a barrier",
      body: (
        <>
          <p>
            Typing is a poor fit for drivers, call centres, field workers, people with limited
            vision or mobility, and anyone with their hands full. Meetings and phone calls also
            produce huge amounts of speech that nobody can search. Voice features open both doors:
            they turn spoken words into text you can process, and turn text into speech users can
            hear.
          </p>
          <p>
            Two technologies do the heavy lifting. <strong>Speech-to-text</strong> (STT, also
            called automatic speech recognition or ASR) converts audio into a transcript.{" "}
            <strong>Text-to-speech</strong> (TTS) converts text into audio. Put an LLM between them
            and you have a voice assistant. Think of it as a translator at each end of a phone
            line, with the language model in the middle doing the thinking.
          </p>
        </>
      ),
    },
    {
      id: "audio-basics",
      title: "What audio is, in numbers",
      body: (
        <>
          <p>
            Sound is a wave. A microphone measures it many times a second. The number of
            measurements per second is the <strong>sample rate</strong>, and the size of each
            measurement is the <strong>bit depth</strong>. Speech models commonly work with audio
            sampled at 16,000 samples per second, called 16 kHz, because speech does not need the
            full range of music.
          </p>
          <Formula>bytes per second = sample rate × bytes per sample × channels</Formula>
          <pre>
            <code>{`16 kHz, 16-bit (2 bytes), mono (1 channel):
16,000 × 2 × 1 = 32,000 bytes per second
1 minute = 32,000 × 60 = 1,920,000 bytes  (about 1.9 MB uncompressed)`}</code>
          </pre>
          <p>
            Compressed formats such as MP3 or Opus are much smaller. Always check which formats and
            limits your provider accepts. Sending 44.1 kHz stereo when 16 kHz mono would do wastes
            bandwidth and upload time without improving accuracy much.
          </p>
        </>
      ),
    },
    {
      id: "stt",
      title: "Speech-to-text and how to measure it",
      body: (
        <>
          <p>
            Modern STT models, such as the open-source Whisper family and hosted services from
            cloud providers, take audio in and return text, often with timestamps and
            optionally a speaker label for each segment (<strong>diarization</strong>). Two modes
            matter. <strong>Batch</strong> transcribes a finished file. <strong>Streaming</strong>{" "}
            returns partial text while the person is still talking, which a live assistant needs.
          </p>
          <pre>
            <code>{`import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

with open("call.mp3", "rb") as audio:
    result = client.audio.transcriptions.create(
        model=os.environ["STT_MODEL"],     # a current transcription model
        file=audio,
    )
print(result.text)`}</code>
          </pre>
          <p>That snippet is illustrative. Other providers have similar calls with different names.</p>
          <p>
            Accuracy is measured with <strong>word error rate (WER)</strong>. Align the transcript
            to a human-written reference and count three kinds of mistakes: substitutions (S, wrong
            word), deletions (D, missing word) and insertions (I, extra word).
          </p>
          <Formula>WER = (S + D + I) ÷ number of words in the reference</Formula>
          <pre>
            <code>{`Reference: 20 words. Transcript has 2 wrong words, 1 missing, 1 extra.
WER = (2 + 1 + 1) / 20 = 4 / 20 = 0.20 = 20%`}</code>
          </pre>
          <p>
            Lower is better. WER can pass 100 percent if there are many insertions. Test on audio
            that looks like yours: accents, phone-line quality, background noise, jargon and names
            all raise error rates. A published number on clean audiobook speech tells you little
            about a noisy call centre. For domain terms, many services accept a vocabulary hint or
            a prompt listing expected names and product words.
          </p>
        </>
      ),
    },
    {
      id: "tts",
      title: "Text-to-speech",
      body: (
        <>
          <p>
            TTS models read text aloud, with a choice of voices and often control over speed and
            style. Neural voices sound natural, but the details that make speech sound right are
            easy to miss in text: numbers, dates, abbreviations and URLs. A system that reads the
            text 3/4 as three slash four sounds broken. Normalise your text first, so it says
            three quarters, or March fourth, as intended.
          </p>
          <pre>
            <code>{`speech = client.audio.speech.create(
    model=os.environ["TTS_MODEL"],
    voice=os.environ["TTS_VOICE"],         # voice names vary by provider
    input="Your order ships on Tuesday.",
)
with open("reply.mp3", "wb") as f:
    f.write(speech.content)`}</code>
          </pre>
          <p>
            Prefer streaming TTS for live conversation: start playing audio as the first sentence is
            ready rather than waiting for the whole reply. Cloning someone&apos;s voice raises consent
            and fraud concerns, so only use a voice you have permission to use, and tell listeners
            when a voice is synthetic.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "Building a voice assistant",
      body: (
        <>
          <p>The classic pipeline chains three stages:</p>
          <pre>
            <code>{`mic -> VAD -> STT -> LLM -> TTS -> speaker
        (detect   (words)  (reply)  (audio)
         speech)`}</code>
          </pre>
          <p>
            <strong>VAD</strong>, voice activity detection, decides when the user starts and stops
            talking. Some providers also offer speech-to-speech models that take audio in and give
            audio out directly, which can cut delay and keep tone, at the price of less control over
            each stage. Latency is the big design problem, since people notice pauses in
            conversation quickly. Add up the stages (illustrative):
          </p>
          <Table
            head={["Stage", "Time to useful output"]}
            rows={[
              ["End-of-speech detection + STT final text", "300 ms"],
              ["LLM time to first token", "500 ms"],
              ["TTS time to first audio", "200 ms"],
              ["Total before the user hears anything", "1,000 ms"],
            ]}
          />
          <p>
            Streaming each stage into the next, so TTS starts on the first sentence while the LLM is
            still writing, is the biggest win. Voice design also needs answers to questions text
            never asks:
          </p>
          <ul>
            <li>
              <strong>Interruptions (barge-in):</strong> stop speaking when the user talks over
              you.
            </li>
            <li>
              <strong>Silence and noise:</strong> tune VAD so a cough does not trigger a reply and a
              pause to think does not end the turn.
            </li>
            <li>
              <strong>Short answers:</strong> speech cannot be skimmed, so replies must be shorter
              than a chat response.
            </li>
            <li>
              <strong>Confirmation:</strong> read back names, numbers and addresses, since STT
              errors there are costly.
            </li>
          </ul>
          <Callout tone="warn">
            Recordings are personal data and some are biometric. Tell people they are being recorded,
            obtain consent where the law requires it, and limit how long audio and transcripts are
            stored. Rules on call recording differ by region.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "STT turns audio into text and TTS turns text into audio. An LLM in the middle makes a voice assistant.",
    "Raw audio size is sample rate × bytes per sample × channels × seconds.",
    "Word error rate is (substitutions + deletions + insertions) divided by reference words. Test on audio like yours.",
    "Stream every stage and add up the latency budget, since people notice pauses.",
    "Plan for interruptions, noise, short replies, confirmation and consent.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does a voice activity detector (VAD) do?",
      options: [
        "Converts text to speech",
        "Chooses which LLM to use",
        "Compresses audio to MP3",
        "Detects when the user starts and stops speaking",
      ],
      answer: 3,
      explain: "VAD marks speech boundaries, so the system knows when to start transcribing and when the user has finished.",
    },
    {
      kind: "mcq",
      q: "Why test STT on your own audio rather than relying on a published accuracy number?",
      options: [
        "Published numbers are always wrong",
        "Accents, noise, line quality and jargon change error rates a lot",
        "STT only works on your own audio",
        "Testing is free of charge",
      ],
      answer: 1,
      explain: "Accuracy depends heavily on audio conditions and vocabulary, which differ from clean benchmark recordings.",
    },
    {
      kind: "text",
      q: "A reference has 50 words. The transcript has 3 substitutions, 1 deletion and 1 insertion. What is the word error rate as a decimal?",
      format: "***",
      accept: ["0.1", ".1", "0.10", "10%"],
      explain: "WER = (3 + 1 + 1) / 50 = 5 / 50 = 0.1, or 10%.",
    },
    {
      kind: "text",
      q: "How many bytes are in 10 seconds of uncompressed 16 kHz, 16-bit, mono audio?",
      format: "******",
      accept: ["320000", "320,000"],
      explain: "16,000 samples × 2 bytes × 1 channel × 10 seconds = 320,000 bytes.",
    },
  ],
};

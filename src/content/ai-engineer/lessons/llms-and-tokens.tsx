import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain next-token prediction and the generation loop",
    "Describe how tokenization splits text and why token counts differ from word counts",
    "Estimate the cost of a request from token counts and prices",
    "Predict common behaviours that come from tokens, such as miscounting letters",
  ],
  tasks: [
    {
      id: "next-token",
      title: "A model that predicts the next piece of text",
      body: (
        <>
          <p>
            A large language model does one basic thing: given some text, it predicts what comes
            next. That is the entire job. Everything else you see, such as answering questions,
            writing code or following instructions, comes from doing this one step extremely well,
            many times in a row.
          </p>
          <p>
            Think of the autocomplete on your phone, scaled up enormously. The phone suggests a
            word from the last few words. An LLM has seen vast amounts of text during training and
            can take thousands of earlier pieces into account, so its guesses can be coherent over
            whole pages.
          </p>
          <p>
            The model does not return one fixed answer. It returns a <strong>probability
            distribution</strong>: a score for every possible next piece. For the text{" "}
            <code>The capital of France is</code> it might give a very high chance to one option
            and tiny chances to thousands of others. A separate step then picks one. How it picks
            is the subject of the lesson on sampling parameters.
          </p>
        </>
      ),
    },
    {
      id: "loop",
      title: "The generation loop",
      body: (
        <>
          <p>
            A reply is built one piece at a time. The loop is called{" "}
            <strong>autoregressive</strong> generation, because each output becomes part of the
            next input.
          </p>
          <ol>
            <li>Take the prompt and turn it into tokens.</li>
            <li>Run the model to get probabilities for the next token.</li>
            <li>Pick one token from those probabilities.</li>
            <li>Append it to the text so far.</li>
            <li>Repeat until the model emits a stop token or hits the length limit.</li>
          </ol>
          <p>
            Two consequences matter in practice. First, long answers take longer, because each
            token needs its own step. Second, the model cannot go back and edit an earlier token.
            If it starts a sentence badly, it continues from there. This is one reason asking a
            model to plan before answering can improve quality.
          </p>
        </>
      ),
    },
    {
      id: "tokens",
      title: "What a token is",
      body: (
        <>
          <p>
            Models do not read letters or whole words. They read <strong>tokens</strong>, which are
            chunks of text from a fixed vocabulary. A token might be a whole common word, part of a
            rarer word, a punctuation mark, or a piece of whitespace.
          </p>
          <p>
            Most modern models build their vocabulary with a method in the family of byte-pair
            encoding. The idea is to start from small units and repeatedly merge the pairs that
            appear most often in a large text sample. Frequent words end up as one token. Rare
            words are split into several pieces. Anything can still be represented, because the
            smallest units are always available.
          </p>
          <p>
            Here is an illustrative split. Real tokenizers differ, so do not treat this as exact.
          </p>
          <pre>
            <code>{`"unbelievable"   ->  "un" + "believ" + "able"      (3 tokens, illustrative)
"the"            ->  "the"                          (1 token)
"  indentation"  ->  "  " + "indent" + "ation"      (3 tokens, illustrative)`}</code>
          </pre>
          <p>
            Each token is then mapped to an integer ID, and the model works with those numbers.
            Different model families use different tokenizers, so the same sentence can have
            different token counts in different models. Always count with the tokenizer that
            matches the model you call, or use the count the API reports back.
          </p>
        </>
      ),
    },
    {
      id: "counting",
      title: "Counting tokens",
      body: (
        <>
          <p>
            For English prose, a rough rule is that one token is about four characters, or about
            three quarters of a word. So 1,000 tokens is roughly 750 words. This is only an
            approximation. Code, numbers, non-English text and unusual formatting often use more
            tokens per word.
          </p>
          <p>
            A quick sum: a 3,000-word article is about 3,000 ÷ 0.75 = 4,000 tokens. That is an
            estimate, not a measurement. To measure, use a tokenizer library. The{" "}
            <code>tiktoken</code> package is a real example that implements several widely used
            encodings:
          </p>
          <pre>
            <code>{`import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
text = "Tokens are not words."
ids = enc.encode(text)

print(len(ids))          # number of tokens
print(enc.decode(ids))   # round-trips back to the original text`}</code>
          </pre>
          <p>
            That encoding matches some models and not others, so treat the count as an estimate
            for a model that uses a different tokenizer. For billing and limits, the number
            returned in the API response is the one that counts.
          </p>
          <Table
            head={["Content", "Tokens per word, roughly", "Why"]}
            rows={[
              ["Plain English", "Close to 1.3", "Common words are single tokens"],
              ["Source code", "Often higher", "Symbols, indentation and identifiers split up"],
              ["Numbers and IDs", "Often higher", "Digit strings split into several pieces"],
              ["Non-English text", "Varies, often higher", "Vocabularies favour the languages in their training data"],
            ]}
          />
        </>
      ),
    },
    {
      id: "cost",
      title: "Why token counts drive cost",
      body: (
        <>
          <p>
            Providers bill per token, usually with a separate price for input tokens (your prompt)
            and output tokens (the reply). Output tokens usually cost more, because each one needs
            its own pass through the model.
          </p>
          <Formula>cost = input tokens × input price + output tokens × output price</Formula>
          <p>
            Work an example with made-up prices: 2 dollars per million input tokens and 10 dollars
            per million output tokens. A request sends 3,000 input tokens and receives 500.
          </p>
          <pre>
            <code>{`input : 3,000 x 2  / 1,000,000 = 0.006 dollars
output:   500 x 10 / 1,000,000 = 0.005 dollars
total                          = 0.011 dollars per request

100,000 requests a day -> 0.011 x 100,000 = 1,100 dollars a day`}</code>
          </pre>
          <p>
            Notice that the smaller output is almost as expensive as the larger input. Notice
            also how quickly a small per-call cost scales. Real prices differ by model and change
            over time, so check your provider's pricing page before budgeting.
          </p>
          <Callout tone="tip">
            Three cheap wins: trim unneeded text from the prompt, set a sensible output limit, and
            send simple tasks to a smaller model.
          </Callout>
        </>
      ),
    },
    {
      id: "quirks",
      title: "Quirks that come from tokens",
      body: (
        <>
          <p>
            Because the model sees tokens and not characters, some tasks that look trivial are
            awkward. Counting the letters in a word, reversing a string or checking exact
            character positions can fail, since the word may be one or two tokens and the
            individual letters are not directly visible. When you need exact character work, do it
            in code and let the model handle the language part.
          </p>
          <p>
            Arithmetic on long numbers is also shaky for similar reasons. Give the model a
            calculator tool instead. You will see how in the lessons on tools and function calling.
          </p>
          <Callout tone="note">
            Whitespace and formatting count too. A heavily indented JSON blob can cost noticeably
            more than a compact one. Compact data is cheaper and often just as clear to the model.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An LLM predicts a probability distribution over the next token, then one token is picked.",
    "Generation is a loop: each chosen token is appended and fed back in.",
    "Tokens are subword chunks, and different models use different tokenizers.",
    "About 1,000 tokens is roughly 750 English words, but code and non-English text often cost more.",
    "Cost equals input tokens times input price plus output tokens times output price.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does an LLM produce at each step of generation?",
      options: [
        "A full finished paragraph",
        "A database query",
        "A probability for every possible next token",
        "A random number only",
      ],
      answer: 2,
      explain: "The model scores every token in its vocabulary, and a sampling step picks one.",
    },
    {
      kind: "mcq",
      q: "Why might a model miscount the letters in a word?",
      options: [
        "It sees tokens, not individual characters",
        "It cannot read English",
        "Letters are not stored on computers",
        "The temperature was too low",
      ],
      answer: 0,
      explain: "A word may be one or two tokens, so the letters are not directly visible to the model.",
    },
    {
      kind: "text",
      q: "What is the name for the chunks of text that models read and write, often smaller than a word? One word.",
      format: "*****",
      accept: ["token", "tokens"],
      explain: "Tokens are vocabulary chunks such as words, word pieces, punctuation or whitespace.",
    },
    {
      kind: "text",
      q: "A prompt has 6,000 input tokens at an illustrative 2 dollars per million input tokens. What does the input cost, in dollars?",
      format: "*****",
      accept: ["0.012", ".012", "$0.012", "0.012 dollars"],
      explain: "6,000 × 2 ÷ 1,000,000 = 0.012 dollars.",
    },
    {
      kind: "text",
      q: "Using the rule of about 0.75 words per token, roughly how many tokens is a 1,500-word document?",
      format: "****",
      accept: ["2000", "2,000", "about 2000", "about 2,000"],
      explain: "1,500 ÷ 0.75 = 2,000 tokens, as an estimate.",
    },
  ],
};

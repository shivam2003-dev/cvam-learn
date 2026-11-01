import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain how a model can read an image or video as a sequence of tokens",
    "Send an image to a vision-capable model and ask a precise question",
    "Estimate patch counts and frame counts for images and video",
    "Describe how image generation works and the limits of both directions",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: real data is not only text",
      body: (
        <>
          <p>
            A lot of what businesses hold is not clean text. It is scanned invoices, screenshots,
            photos of damaged goods, charts in slide decks, whiteboard pictures and recorded
            meetings. A text-only model cannot see any of it. For years you stitched together an
            OCR tool, an object detector and a language model, with glue code between each.
          </p>
          <p>
            A <strong>multimodal</strong> model accepts more than one kind of input, such as text
            plus images, and sometimes audio or video. You send a picture and a question in the
            same request and get text back. Some models also produce images. The idea is the same
            as asking a colleague, here is a photo, what is wrong with this wiring?
          </p>
        </>
      ),
    },
    {
      id: "how",
      title: "How a model reads an image",
      body: (
        <>
          <p>
            A language model works on tokens, so an image must become something token-like. In many
            vision-language models, an image is cut into a grid of small square <strong>patches</strong>.
            A vision encoder turns each patch into a vector. Those vectors are then fed to the
            language model beside the text tokens, and attention treats them like any other
            part of the context.
          </p>
          <p>The patch count follows simple arithmetic.</p>
          <Formula>patches = (width ÷ patch size) × (height ÷ patch size)</Formula>
          <pre>
            <code>{`A 448 x 448 image with 14 x 14 pixel patches (illustrative values):
(448 / 14) × (448 / 14) = 32 × 32 = 1,024 patches

A 896 x 896 image with the same patch size:
64 × 64 = 4,096 patches   (4x the pixels -> 4x the patches)`}</code>
          </pre>
          <p>
            Patch sizes and how providers convert images into tokens differ, and many resize or tile
            large images first. The takeaway holds everywhere: <strong>images use context and
            cost money</strong>, and bigger images cost more. Check your provider's documentation
            for how it counts image tokens and for supported formats and size limits.
          </p>
          <p>
            <strong>Video</strong> is usually treated as a series of still frames, sometimes plus
            the audio track transcribed to text. A 60-second clip sampled at 1 frame per second
            is 60 images. At an illustrative 800 tokens per frame that is 48,000 tokens before you
            have asked anything, so sampling rate is your main cost dial.
          </p>
        </>
      ),
    },
    {
      id: "calling",
      title: "Calling a vision model",
      body: (
        <>
          <p>
            Most provider APIs let a message contain a list of parts. A part can be text or an
            image, sent as base64 data or sometimes as a link. This example is illustrative:
            check your SDK for the current shape and use a current model name from the docs.
          </p>
          <pre>
            <code>{`import base64, os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

with open("invoice.png", "rb") as f:
    image_b64 = base64.standard_b64encode(f.read()).decode()

response = client.messages.create(
    model=os.environ["VISION_MODEL"],        # a current vision-capable model
    max_tokens=500,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image",
             "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text",
             "text": "Extract the invoice number, date and total as JSON. "
                     "If a field is unreadable, use null."},
        ],
    }],
)
print(response.content[0].text)`}</code>
          </pre>
          <p>Three habits make results better:</p>
          <ul>
            <li>
              <strong>Ask a specific question.</strong> Describe this image gets a vague answer.
              List every line item with quantity and price gets something you can parse.
            </li>
            <li>
              <strong>Allow it to say it cannot read.</strong> Tell the model to return null for
              unclear fields, so it does not guess.
            </li>
            <li>
              <strong>Send enough resolution.</strong> Small print in a downscaled image is simply
              gone. Crop to the region that matters rather than sending a whole page.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "generation",
      title: "Generating images",
      body: (
        <>
          <p>
            Most current image generators are <strong>diffusion models</strong>. During training the
            model sees real images with noise added in many amounts and learns to remove a little
            noise. To create a new image it starts from pure random noise and removes noise step by
            step, guided by your text prompt, until a picture appears. Think of a sculptor
            revealing a shape in a block, except the block is static and the text says what to look
            for.
          </p>
          <p>
            A few points that matter when building: generation is slower and costlier than text,
            results vary with the random seed, and prompts that are specific (subject, style,
            composition, lighting) beat vague ones. Text inside generated images is improving but is
            still a common weak spot, so verify it. Check each provider's terms on commercial use
            and on content they restrict.
          </p>
        </>
      ),
    },
    {
      id: "uses",
      title: "Use cases and limits",
      body: (
        <>
          <Table
            head={["Use case", "What the model does", "Watch for"]}
            rows={[
              ["Document extraction", "Reads invoices, forms, receipts into fields", "Misread digits; validate totals in code"],
              ["Chart and slide questions", "Explains trends in a figure", "Wrong reading of exact values"],
              ["UI screenshot analysis", "Describes screens, finds bugs, drives tests", "Small text and dense layouts"],
              ["Alt text and accessibility", "Describes images for screen readers", "Missing context only the page owner knows"],
              ["Visual inspection", "Flags damage or defects in photos", "Needs your own test set before trust"],
              ["Video summary", "Summarises a sampled clip", "Events between sampled frames are invisible"],
            ]}
          />
          <p>
            Vision models make mistakes that look confident. Counting many small objects, judging
            exact positions, reading blurry or rotated text, and noticing subtle differences
            between two images are common weak points. They also share the text risks: an image
            can carry instructions written in it, which is a form of prompt injection.
          </p>
          <Callout tone="warn">
            Images often hold faces, addresses, licence plates and screens full of private data.
            Apply the same privacy rules as for text: minimise what you send, check the provider's
            retention terms, and get consent where the law requires it.
          </Callout>
          <Callout tone="tip">
            Check what you can in code. If a model extracts line items and a total from an invoice,
            add the items yourself and compare to the total. A mismatch flags a misread.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Multimodal models take images, and sometimes audio or video, alongside text in one request.",
    "Images become patch vectors, and patch count is (width ÷ patch size) × (height ÷ patch size).",
    "Video is sampled frames, so sampling rate drives both cost and what the model can miss.",
    "Ask specific questions, let the model say it cannot read, and validate extracted values in code.",
    "Diffusion models generate images by removing noise step by step, guided by text.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "How does a diffusion model produce an image?",
      options: [
        "It looks up a matching photo in a database",
        "It copies the nearest training image",
        "It draws pixels left to right like text",
        "It starts from noise and removes it step by step, guided by the prompt",
      ],
      answer: 3,
      explain: "Diffusion generation is iterative denoising, steered by the text prompt.",
    },
    {
      kind: "mcq",
      q: "A vision model extracts an invoice total of 540 from a photo. What is the best safeguard?",
      options: [
        "Trust it, since vision models do not make mistakes",
        "Add up the extracted line items in code and compare to the total",
        "Ask the same question with a higher temperature",
        "Remove the image and re-ask",
      ],
      answer: 1,
      explain: "A deterministic cross-check catches misread digits, which are a common vision failure.",
    },
    {
      kind: "text",
      q: "An image is 280 by 280 pixels and is cut into 14 by 14 pixel patches. How many patches does it produce?",
      format: "***",
      accept: ["400"],
      explain: "(280 / 14) × (280 / 14) = 20 × 20 = 400.",
    },
    {
      kind: "text",
      q: "A 30-second video is sampled at 2 frames per second. How many frames does the model receive?",
      format: "**",
      accept: ["60"],
      explain: "30 seconds × 2 frames per second = 60 frames.",
    },
  ],
};

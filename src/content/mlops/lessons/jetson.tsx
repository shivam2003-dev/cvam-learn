import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Describe what makes an NVIDIA Jetson different from a server GPU",
    "Build and run a containerized model on Jetson",
    "Speed up inference with TensorRT and choose a power mode",
    "Estimate pipeline capacity with headroom for thermal limits",
  ],
  tasks: [
    {
      id: "why-jetson",
      title: "When a phone is too small and a server is too far",
      body: (
        <>
          <p>
            A factory wants to inspect parts on a conveyor belt using four cameras. Sending that
            video to the cloud would use a lot of bandwidth, add delay, and stop the line whenever the
            network fails. A rack server on the factory floor is loud, hot and hard to maintain. What
            it needs is a GPU the size of a paperback, running inside a sealed box.
          </p>
          <p>
            That is what <strong>NVIDIA Jetson</strong> is: a small computer with Arm CPU cores, an
            NVIDIA GPU, video hardware and memory, all on one module. Think of it as a food truck
            next to a restaurant kitchen. It has less space and fewer burners, but it uses the same
            kind of cooking techniques, and it parks right where the customers are.
          </p>
          <Table
            head={["", "Phone", "Jetson", "Server GPU"]}
            rows={[
              ["Typical power", "A few watts", "Tens of watts", "Hundreds of watts"],
              ["CPU", "Arm", "Arm", "Usually x86"],
              ["GPU software", "Vendor delegates", "CUDA", "CUDA"],
              ["Memory", "Shared", "Shared with the CPU", "Dedicated"],
              ["Common jobs", "App features", "Cameras, robots, kiosks", "Training, large models"],
            ]}
          />
          <p>
            The range runs from entry-level Nano modules up to high-end AGX modules, with several
            generations in the field, such as Xavier and Orin. Specs, prices and availability change
            often, so size your project from the current datasheets.
          </p>
          <p>Three differences from a server shape everything else:</p>
          <ul>
            <li>
              <strong>Arm64:</strong> x86 container images will not run. You need arm64 builds.
            </li>
            <li>
              <strong>Unified memory:</strong> the CPU and GPU share one memory pool. Copies between
              them can be avoided, but your OS, app and model all compete for the same space.
            </li>
            <li>
              <strong>Power and heat limits:</strong> sustained speed depends on your enclosure and
              cooling, not just on the chip.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "software-stack",
      title: "JetPack and containers",
      body: (
        <>
          <p>
            <strong>JetPack</strong> is NVIDIA's software bundle for Jetson. It includes Jetson Linux
            (the OS and drivers, also known as L4T), CUDA, TensorRT and other libraries for vision and
            video. The JetPack version decides which CUDA version you get, so it's the first thing to
            check.
          </p>
          <Callout tone="warn">
            Generic PyTorch or ONNX Runtime GPU packages may not work on Jetson. Use builds made for
            your JetPack version. A mismatch can give you import errors or, worse, a quiet fallback
            to the CPU.
          </Callout>
          <p>
            Containers keep deployments repeatable. Build for arm64 from your laptop or CI runner,
            using a Jetson-compatible base image, then run it with the NVIDIA runtime so that the
            container can reach the GPU:
          </p>
          <pre>
            <code>{`# On a CI runner or workstation
docker buildx build --platform linux/arm64 \\
  -t my-registry/detector:1.2 --push .

# On the Jetson
sudo docker run -d --restart unless-stopped \\
  --runtime nvidia \\
  --network host \\
  -v /opt/models:/models \\
  --device /dev/video0 \\
  my-registry/detector:1.2`}</code>
          </pre>
          <p>
            The <code>--restart unless-stopped</code> flag matters here. Edge devices lose power and
            get rebooted with nobody around, so the service has to come back by itself.
          </p>
        </>
      ),
    },
    {
      id: "inference",
      title: "Speeding up inference",
      body: (
        <>
          <p>
            <strong>TensorRT</strong> is NVIDIA's inference optimizer. It takes a trained model and
            compiles it for your specific GPU. It fuses layers, picks fast kernels, and can use
            16-bit floats. A common route is to export to ONNX, an open model format, then run it
            through ONNX Runtime with TensorRT as the execution provider:
          </p>
          <pre>
            <code>{`import onnxruntime as ort

session = ort.InferenceSession(
    "/models/detector.onnx",
    providers=[
        "TensorrtExecutionProvider",
        "CUDAExecutionProvider",
        "CPUExecutionProvider",
    ],
)

print(session.get_providers())  # confirm what really loaded
outputs = session.run(None, {"images": frame_batch})`}</code>
          </pre>
          <p>
            ONNX Runtime tries the providers in order, so printing the active list is a simple way
            to catch a quiet fallback. Your build must include those providers. Also expect the first
            run to be slow, as TensorRT builds its engine then. Cache that engine so a restart
            doesn't repeat the wait.
          </p>
          <p>
            Video is often the real bottleneck. Decoding streams in software can take up all your
            CPU cores. Jetson has dedicated hardware for video decoding, and NVIDIA's DeepStream
            SDK, built on GStreamer, wires decoders and models into a pipeline.
          </p>
          <Table
            head={["Tool", "Use it to"]}
            rows={[
              [<code key="q">nvpmodel -q</code>, "Show the current power mode"],
              [<code key="m">nvpmodel -m 0</code>, "Switch power mode (numbers vary by module)"],
              [<code key="c">jetson_clocks</code>, "Pin clocks at the maximum for the current mode"],
              [<code key="t">tegrastats</code>, "Print live CPU, GPU, memory and temperature data"],
              [<code key="j">jtop</code>, "Terminal dashboard, from the jetson-stats package"],
            ]}
          />
          <Callout tone="tip">
            Benchmark in the real power mode and the real enclosure, after the device has warmed up
            for at least 20 minutes. Numbers from an open bench with a fan can flatter you badly.
          </Callout>
        </>
      ),
    },
    {
      id: "capacity",
      title: "Sizing the pipeline",
      body: (
        <>
          <p>
            Back to the factory, with illustrative numbers. Four cameras at 30 frames per second give
            120 frames per second. Measured work per frame is 6 ms of inference and 2 ms of pre- and
            post-processing.
          </p>
          <Formula>utilization = arrival rate × time per frame</Formula>
          <pre>
            <code>{`Demand:      4 × 30 = 120 frames/s
Time:        6 + 2 = 8 ms per frame
Capacity:    1,000 ÷ 8 = 125 frames/s
Utilization: 120 × 0.008 = 0.96, or 96%`}</code>
          </pre>
          <p>
            It fits, but only just. Now the enclosure warms up and the device lowers its clocks by
            20%. If all of the work scales with clock speed, 8 ms becomes 8 ÷ 0.8 = 10 ms per frame.
            Capacity falls to 100 frames per second, below the 120 arriving, so frames queue up and
            have to be dropped.
          </p>
          <p>You have several options, ordered roughly by cost:</p>
          <ul>
            <li>Lower the input resolution, or use a smaller model.</li>
            <li>Process every second frame, if the task allows it.</li>
            <li>Batch frames from all cameras, which raises throughput but adds some latency.</li>
            <li>Improve the cooling, or raise the power mode.</li>
            <li>Move to a larger module.</li>
          </ul>
          <p>
            A sensible target is around 60% to 70% utilization under realistic heat. That leaves
            room for spikes and throttling. Check memory the same way: subtract the OS, your app and
            video buffers from the shared pool before counting what the model can use.
          </p>
          <Callout tone="note">
            Queues on the edge should stay short. For live video, a fresh frame is worth more than
            an old one, so drop the oldest frames instead of letting latency build up.
          </Callout>
        </>
      ),
    },
    {
      id: "fleet",
      title: "Running a fleet",
      body: (
        <>
          <p>
            One Jetson is a project. A hundred Jetsons in shops and vehicles is an operations
            problem. Nobody can walk over and press a button, so plan for failure from the start.
          </p>
          <Table
            head={["Problem", "Practice"]}
            rows={[
              ["Bad update bricks a device", "Staged rollouts, rollback, A/B root filesystem"],
              ["Network drops", "Buffer metrics locally and upload when back online"],
              ["Process hangs", "Health checks, restart policies, hardware watchdog"],
              ["Silent quality loss", "Upload a sample of frames and predictions for review"],
              ["Stolen device", "Disk encryption, secure boot, short-lived credentials"],
              ["Heat or storage failure", "Report temperature, throttling and disk health"],
            ]}
          />
          <p>
            Track the model version, JetPack version and container tag per device. When a problem
            appears on only some units, that record is often the quickest route to the cause.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Jetson puts Arm CPUs, an NVIDIA GPU and video hardware on one low-power module.",
    "Use arm64 containers and libraries built for your JetPack version.",
    "TensorRT speeds up inference, and hardware decoders keep video from swallowing the CPU.",
    "Size for sustained performance in the real enclosure, with headroom for throttling.",
    "Fleets need staged updates, rollback, offline buffering and remote health data.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Your x86 container image fails to start on a Jetson. What is the most likely cause?",
      options: [
        "Jetson uses Arm CPUs, so it needs an arm64 image",
        "Jetson cannot run Docker",
        "The image is missing a GPU driver for Windows",
        "Jetson only runs Python 2",
      ],
      answer: 0,
      explain: "Jetson modules use Arm CPUs, so build for linux/arm64.",
    },
    {
      kind: "mcq",
      q: "What does unified memory mean on Jetson?",
      options: [
        "Each CPU core has its own RAM",
        "The GPU has dedicated memory only",
        "The CPU and GPU share one memory pool",
        "Memory is stored in the cloud",
      ],
      answer: 2,
      explain: "Both processors share the same pool, so the OS, app and model compete for space.",
    },
    {
      kind: "mcq",
      q: "Which command prints live GPU, memory and temperature data?",
      options: ["nvpmodel -q", "tegrastats", "docker buildx", "jetson_clocks"],
      answer: 1,
      explain: "tegrastats streams live utilization, memory and temperature readings.",
    },
    {
      kind: "text",
      q: "Three cameras at 20 frames per second, with 5 ms of work per frame, on a single pipeline. What is the utilization in percent? Digits only.",
      format: "**",
      accept: ["30", "30%"],
      explain: "3 × 20 = 60 frames/s. 60 × 0.005 = 0.30, which is 30%.",
    },
    {
      kind: "text",
      q: "What is the name of NVIDIA's inference optimizer that compiles a model for a specific GPU?",
      format: "********",
      accept: ["tensorrt", "tensor rt"],
      explain: "TensorRT optimizes trained models for NVIDIA GPUs.",
    },
  ],
};

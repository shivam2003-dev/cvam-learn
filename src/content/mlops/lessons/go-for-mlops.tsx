import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Recognize where Go appears in ML infrastructure",
    "Read Go code, including errors, structs and goroutines",
    "Decide when Go is a better fit than Python",
    "Ship a small Go tool as a tiny container image",
  ],
  tasks: [
    {
      id: "problem",
      title: "Why an ML engineer meets Go at all",
      body: (
        <>
          <p>
            You won't train models in Go. Python owns that. But the platform underneath your models
            is largely written in it. Kubernetes, Docker, containerd, Prometheus, Grafana's backend,
            Terraform, Helm and Argo Workflows are all Go projects.
          </p>
          <p>
            So Go reaches you sooner than you'd expect. A pod stuck in a strange state sends you
            into a Kubernetes operator's source. A Prometheus exporter is missing a metric. A
            platform team asks for a small proxy in front of a model server. You'll read Go long
            before you need to write much of it, and reading it is a realistic first goal.
          </p>
          <p>
            Go fits this layer because it compiles to a single <strong>static binary</strong>, a
            standalone program with no interpreter or packages to install. Compare it with shipping
            a Python tool: you must also ship the right Python and every dependency. Go hands you a
            sealed appliance; Python hands you a kit that needs the right parts in the box.
          </p>
          <Table
            head={["Need", "Good fit", "Why"]}
            rows={[
              ["Training and experiments", "Python", "The ML libraries live there"],
              ["Feature engineering", "Python or SQL", "Data tools and fast iteration"],
              ["Model serving in a framework", "Python", "Direct access to the model"],
              ["Kubernetes operators", "Go", "Kubernetes client libraries are native to Go"],
              ["Proxies and sidecars", "Go", "Handles many connections with a small footprint"],
              ["Portable command-line tools", "Go", "One binary, easy cross-compiling"],
            ]}
          />
        </>
      ),
    },
    {
      id: "reading",
      title: "Reading Go: the essentials",
      body: (
        <>
          <p>Three habits explain most of what looks odd to a Python developer.</p>
          <p>
            <strong>Errors are values.</strong> There are no exceptions for ordinary failures. A
            function returns its result and an error, and the caller checks it. That explains the{" "}
            <code>if err != nil</code> blocks you'll see everywhere. It's wordy, but each failure
            path is visible.
          </p>
          <p>
            <strong>Structs and tags.</strong> A struct groups fields. The text in backticks is a{" "}
            <strong>tag</strong>, which tells a library how to map the field. Here it sets JSON
            names:
          </p>
          <pre>
            <code>{`type PredictResponse struct {
	Score        float64 \`json:"score"\`
	ModelVersion string  \`json:"model_version"\`
}`}</code>
          </pre>
          <p>
            A capital first letter means <strong>exported</strong>, or visible to other packages. So{" "}
            <code>Score</code> is public and <code>score</code> would be private.
          </p>
          <p>
            <strong>Goroutines and channels.</strong> A <strong>goroutine</strong> is a lightweight
            task managed by the Go runtime, started with the <code>go</code> keyword. It begins with
            a stack of only a few kilobytes, so a program can run thousands at once. A{" "}
            <strong>channel</strong> is a typed pipe that lets goroutines pass values safely.
          </p>
          <Table
            head={["Syntax", "Meaning"]}
            rows={[
              [<code key="a">x := 5</code>, "Declare and assign, with the type inferred"],
              [<code key="b">defer f.Close()</code>, "Run this when the function returns"],
              [<code key="c">go work()</code>, "Run this function concurrently"],
              [<code key="d">{"ch <- v"}</code>, "Send a value on a channel"],
              [<code key="e">{"v := <-ch"}</code>, "Receive a value from a channel"],
              [<code key="f">ctx context.Context</code>, "Carries deadlines and cancellation"],
            ]}
          />
        </>
      ),
    },
    {
      id: "example",
      title: "Worked example: a concurrent health checker",
      body: (
        <>
          <p>
            Suppose you run many model endpoints and want to probe them all quickly. This complete
            program checks each one at the same time, with a shared two-second deadline:
          </p>
          <pre>
            <code>{`package main

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

func check(ctx context.Context, url string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s returned %d", url, resp.StatusCode)
	}
	return nil
}

func main() {
	urls := []string{
		"http://churn-v1:8080/healthz",
		"http://churn-v2:8080/healthz",
		"http://fraud-v7:8080/healthz",
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	var wg sync.WaitGroup
	for _, url := range urls {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			if err := check(ctx, u); err != nil {
				fmt.Println("DOWN:", err)
				return
			}
			fmt.Println("UP:", u)
		}(url)
	}
	wg.Wait()
}`}</code>
          </pre>
          <p>
            A <code>sync.WaitGroup</code> is a counter: <code>Add</code> raises it,{" "}
            <code>Done</code> lowers it, and <code>Wait</code> blocks until it hits zero. The
            context makes every request stop at the deadline, so one hung server can't stall the
            whole program.
          </p>
          <p>Why does concurrency help? The program spends nearly all its time waiting on the network:</p>
          <Formula>sequential time ≈ endpoints × time per check</Formula>
          <p>
            With an illustrative 200 endpoints at 50 ms each, a one-at-a-time loop takes 200 × 0.05 =
            10 seconds. Running them all concurrently takes about as long as the slowest check, close
            to 50 ms in this ideal case. Python can do this too, with asyncio. Go's advantage is that
            concurrency is built into the language and the result ships as one file.
          </p>
        </>
      ),
    },
    {
      id: "shipping",
      title: "Building and shipping",
      body: (
        <>
          <p>The toolchain is a single command with subcommands:</p>
          <pre>
            <code>{`go mod init example.com/prober   # start a module
go run .                         # compile and run
go test ./...                    # run all tests
go vet ./...                     # catch suspicious code
go build -o prober .             # produce a binary

# Build for a Linux ARM server from any machine
GOOS=linux GOARCH=arm64 go build -o prober .`}</code>
          </pre>
          <p>
            Dependencies are recorded in <code>go.mod</code> (the requirements) and{" "}
            <code>go.sum</code> (checksums that verify them), loosely like a Python project file
            and lockfile. Commit both.
          </p>
          <p>
            A <strong>multi-stage Docker build</strong> compiles in one image and copies only the
            binary into a minimal one:
          </p>
          <pre>
            <code>{`# Use a currently supported Go version
FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /prober .

FROM gcr.io/distroless/static
COPY --from=build /prober /prober
ENTRYPOINT ["/prober"]`}</code>
          </pre>
          <p>
            <code>CGO_ENABLED=0</code> disables linking to C libraries, which gives a fully static
            binary. The final image holds little more than your program, so it's often just
            megabytes. It pulls quickly and leaves fewer packages to patch.
          </p>
          <Callout tone="tip">
            The pattern to learn for Kubernetes work is the <strong>reconcile loop</strong>. An
            operator compares desired state with actual state, then acts to close the gap. Tools
            like Kubebuilder and controller-runtime generate most of the structure. Read an existing
            operator's reconcile function before writing your own.
          </Callout>
          <Callout tone="warn">
            Don't rewrite a Python service in Go for speed alone. In model serving, most time goes
            to the model itself, often in native code on a GPU. A Go wrapper won't make that faster.
            Measure first.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Much ML infrastructure, including Kubernetes and Prometheus, is written in Go.",
    "Go compiles to a single static binary, so tools are easy to ship.",
    "Errors are return values, which explains all the if err != nil checks.",
    "Goroutines make it cheap to handle many waiting tasks at once.",
    "Use Python for models, and Go for platform tools, proxies and operators.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which job is the best fit for Go?",
      options: [
        "Training a transformer",
        "Exploring data in a notebook",
        "Writing a Kubernetes operator",
        "Tuning a scikit-learn model",
      ],
      answer: 2,
      explain: "Kubernetes and its client libraries are written in Go, so operators are a natural fit.",
    },
    {
      kind: "mcq",
      q: "What does CGO_ENABLED=0 do in a Go build?",
      options: [
        "Turns off the garbage collector",
        "Avoids linking C libraries, producing a static binary",
        "Disables goroutines",
        "Removes tests from the build",
      ],
      answer: 1,
      explain: "With cgo off, the binary doesn't depend on a system C library, so it runs on a minimal image.",
    },
    {
      kind: "text",
      q: "A loop checks 500 endpoints one at a time, each taking 20 ms. How many seconds does it take?",
      format: "**",
      accept: ["10", "10s", "10 seconds"],
      explain: "500 × 0.02 = 10 seconds.",
    },
    {
      kind: "text",
      q: "Which Go keyword starts a function running concurrently?",
      format: "**",
      accept: ["go"],
      explain: "The go keyword starts a goroutine.",
    },
  ],
};

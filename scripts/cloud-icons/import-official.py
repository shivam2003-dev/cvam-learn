#!/usr/bin/env python3
"""
Swap the open-source placeholder icons for the official vendor icon packs.

1. Download and unzip the packs yourself (each vendor has its own licence):
     AWS   https://aws.amazon.com/architecture/icons/
     Azure https://learn.microsoft.com/azure/architecture/icons/
     GCP   https://cloud.google.com/icons
     OCI   https://docs.oracle.com/en-us/iaas/Content/General/Reference/graphicsfordiagrams.htm
2. Run (any subset of providers):
     python3 scripts/cloud-icons/import-official.py --aws ~/Downloads/AWS-Icons --azure ~/Downloads/Azure_Public_Service_Icons
   Add --dry-run first to see what would match, and --report to list every miss.
3. Matched files are copied to public/images/cloud-icons/<provider>/<kind>.svg (or .png) and
   recorded in kit/icons.json, which the diagrams read. Unmatched kinds keep their current icon.

Matching is by words in the file name, so it is a best effort: read the report and fix any
wrong match by editing KEYWORDS below or copying the file by hand and editing icons.json.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ICONS = ROOT / "public/images/cloud-icons"
MANIFEST = ROOT / "src/content/courseware/cloud-architecture-diagrams/kit/icons.json"
PROVIDERS = ["aws", "azure", "gcp", "oci"]

# kind -> provider -> alternatives; each alternative is a list of words that must ALL appear in the file name.
KEYWORDS = {
    "dns": {"aws": [["route", "53"]], "azure": [["dns", "zones"], ["dns"]], "gcp": [["cloud", "dns"]], "oci": [["dns"]]},
    "cdn": {"aws": [["cloudfront"]], "azure": [["front", "door"], ["cdn"]], "gcp": [["cloud", "cdn"], ["media", "cdn"]], "oci": [["cdn"], ["waf"]]},
    "waf": {"aws": [["waf"]], "azure": [["web", "application", "firewall"], ["waf"]], "gcp": [["cloud", "armor"]], "oci": [["waf"], ["web", "application", "firewall"]]},
    "ddos": {"aws": [["shield"]], "azure": [["ddos"]], "gcp": [["cloud", "armor"]], "oci": [["ddos"]]},
    "lb": {"aws": [["elastic", "load", "balancing"], ["application", "load", "balancer"]], "azure": [["application", "gateway"], ["load", "balancer"]], "gcp": [["cloud", "load", "balancing"]], "oci": [["load", "balancer"]]},
    "igw": {"aws": [["internet", "gateway"]], "oci": [["internet", "gateway"]]},
    "nat": {"aws": [["nat", "gateway"]], "azure": [["nat"]], "gcp": [["cloud", "nat"]], "oci": [["nat", "gateway"]]},
    "firewall": {"aws": [["network", "firewall"]], "azure": [["firewall"]], "gcp": [["cloud", "ngfw"], ["firewall"]], "oci": [["network", "firewall"], ["firewall"]]},
    "vpn": {"aws": [["site", "to", "site", "vpn"], ["vpn", "gateway"]], "azure": [["virtual", "network", "gateway"], ["vpn"]], "gcp": [["cloud", "vpn"]], "oci": [["vpn"]]},
    "interconnect": {"aws": [["direct", "connect"]], "azure": [["expressroute"]], "gcp": [["cloud", "interconnect"], ["interconnect"]], "oci": [["fastconnect"], ["drg"]]},
    "transit": {"aws": [["transit", "gateway"]], "azure": [["virtual", "wan"], ["virtual", "network", "gateway"]], "gcp": [["network", "connectivity", "center"]], "oci": [["drg"], ["dynamic", "routing"]]},
    "privlink": {"aws": [["privatelink"], ["private", "link"]], "azure": [["private", "link"], ["private", "endpoint"]], "gcp": [["private", "service", "connect"]], "oci": [["service", "gateway"]]},
    "network": {"aws": [["virtual", "private", "cloud"], ["vpc"]], "azure": [["virtual", "networks"], ["virtual", "network"]], "gcp": [["virtual", "private", "cloud"], ["vpc"]], "oci": [["virtual", "cloud", "network"], ["vcn"]]},
    "vm": {"aws": [["ec2"]], "azure": [["virtual", "machine"]], "gcp": [["compute", "engine"]], "oci": [["compute"], ["virtual", "machine"]]},
    "fn": {"aws": [["lambda"]], "azure": [["function", "apps"], ["functions"]], "gcp": [["cloud", "functions"], ["functions"]], "oci": [["functions"]]},
    "container": {"aws": [["fargate"]], "azure": [["container", "apps"]], "gcp": [["cloud", "run"]], "oci": [["container", "instances"], ["container"]]},
    "k8s": {"aws": [["elastic", "kubernetes", "service"], ["eks"]], "azure": [["kubernetes", "services"], ["kubernetes"]], "gcp": [["google", "kubernetes", "engine"], ["kubernetes", "engine"]], "oci": [["kubernetes", "engine"], ["oke"]]},
    "registry": {"aws": [["elastic", "container", "registry"]], "azure": [["container", "registries"]], "gcp": [["artifact", "registry"], ["container", "registry"]], "oci": [["registry"]]},
    "apigw": {"aws": [["api", "gateway"]], "azure": [["api", "management"]], "gcp": [["api", "gateway"]], "oci": [["api", "gateway"]]},
    "queue": {"aws": [["simple", "queue", "service"], ["sqs"]], "azure": [["service", "bus"]], "gcp": [["pub", "sub"], ["pubsub"]], "oci": [["queue"]]},
    "topic": {"aws": [["simple", "notification", "service"], ["sns"]], "azure": [["event", "grid", "topics"], ["event", "grid"]], "gcp": [["pub", "sub"], ["pubsub"]], "oci": [["notifications"]]},
    "eventbus": {"aws": [["eventbridge"]], "azure": [["event", "grid"]], "gcp": [["eventarc"], ["pub", "sub"]], "oci": [["events"]]},
    "workflow": {"aws": [["step", "functions"]], "azure": [["logic", "apps"]], "gcp": [["workflows"]], "oci": [["workflow"]]},
    "stream": {"aws": [["kinesis", "data", "streams"], ["kinesis"]], "azure": [["event", "hubs"]], "gcp": [["pub", "sub"], ["pubsub"]], "oci": [["streaming"]]},
    "notify": {"aws": [["simple", "notification", "service"]], "azure": [["notification", "hubs"]], "gcp": [["pub", "sub"]], "oci": [["email", "delivery"], ["notifications"]]},
    "db": {"aws": [["rds"]], "azure": [["sql", "database"], ["azure", "database", "postgresql"]], "gcp": [["cloud", "sql"]], "oci": [["database", "service"], ["base", "database"]]},
    "nosql": {"aws": [["dynamodb"]], "azure": [["cosmos", "db"]], "gcp": [["firestore"]], "oci": [["nosql"]]},
    "cache": {"aws": [["elasticache"]], "azure": [["cache", "redis"], ["redis"]], "gcp": [["memorystore"]], "oci": [["cache"]]},
    "storage": {"aws": [["simple", "storage", "service"], ["s3"]], "azure": [["storage", "accounts"], ["blob"]], "gcp": [["cloud", "storage"]], "oci": [["object", "storage"]]},
    "lake": {"aws": [["simple", "storage", "service"], ["s3"]], "azure": [["data", "lake", "storage"]], "gcp": [["cloud", "storage"]], "oci": [["object", "storage"]]},
    "etl": {"aws": [["glue"]], "azure": [["data", "factory"]], "gcp": [["dataflow"]], "oci": [["data", "integration"]]},
    "dwh": {"aws": [["redshift"]], "azure": [["synapse"]], "gcp": [["bigquery"]], "oci": [["autonomous", "data", "warehouse"], ["autonomous"]]},
    "catalog": {"aws": [["glue"], ["data", "catalog"]], "azure": [["purview"]], "gcp": [["dataplex"], ["data", "catalog"]], "oci": [["data", "catalog"]]},
    "bi": {"aws": [["quicksight"]], "azure": [["power", "bi"]], "gcp": [["looker"]], "oci": [["analytics", "cloud"], ["analytics"]]},
    "ml": {"aws": [["sagemaker"]], "azure": [["machine", "learning"]], "gcp": [["vertex", "ai"]], "oci": [["data", "science"]]},
    "backup": {"aws": [["backup"]], "azure": [["backup"]], "gcp": [["backup"]], "oci": [["backup"]]},
    "iot": {"aws": [["iot", "core"]], "azure": [["iot", "hub"]], "gcp": [["iot"]], "oci": [["iot"]]},
    "iam": {"aws": [["identity", "and", "access", "management"], ["iam"]], "azure": [["entra", "id"], ["active", "directory"]], "gcp": [["identity", "access", "management"], ["iam"]], "oci": [["iam"], ["identity"]]},
    "auth": {"aws": [["cognito"]], "azure": [["external", "identities"], ["entra", "external"], ["b2c"]], "gcp": [["identity", "platform"]], "oci": [["identity", "domain"], ["identity"]]},
    "kms": {"aws": [["key", "management", "service"], ["kms"]], "azure": [["key", "vaults"], ["key", "vault"]], "gcp": [["key", "management"]], "oci": [["key", "management"], ["vault"]]},
    "secrets": {"aws": [["secrets", "manager"]], "azure": [["key", "vaults"], ["key", "vault"]], "gcp": [["secret", "manager"]], "oci": [["vault"]]},
    "siem": {"aws": [["guardduty"]], "azure": [["sentinel"]], "gcp": [["security", "command", "center"]], "oci": [["cloud", "guard"]]},
    "audit": {"aws": [["cloudtrail"]], "azure": [["activity", "log"]], "gcp": [["cloud", "audit", "logs"], ["logging"]], "oci": [["audit"]]},
    "logs": {"aws": [["cloudwatch"]], "azure": [["log", "analytics"]], "gcp": [["cloud", "logging"], ["logging"]], "oci": [["logging"]]},
    "monitor": {"aws": [["cloudwatch"]], "azure": [["monitor"]], "gcp": [["cloud", "monitoring"], ["monitoring"]], "oci": [["monitoring"]]},
    "policy": {"aws": [["organizations"]], "azure": [["policy"]], "gcp": [["resource", "manager"], ["organization"]], "oci": [["policies"], ["security", "zones"]]},
    "scan": {"aws": [["inspector"]], "azure": [["defender", "for", "cloud"], ["defender"]], "gcp": [["security", "command", "center"]], "oci": [["vulnerability", "scanning"]]},
    "repo": {"aws": [["codecommit"]], "azure": [["repos"]], "gcp": [["source", "repositories"]], "oci": [["devops"]]},
    "build": {"aws": [["codebuild"]], "azure": [["pipelines"]], "gcp": [["cloud", "build"]], "oci": [["devops"]]},
    "pipeline": {"aws": [["codepipeline"]], "azure": [["pipelines"]], "gcp": [["cloud", "deploy"], ["cloud", "build"]], "oci": [["devops"]]},
    "artifact": {"aws": [["codeartifact"]], "azure": [["artifacts"]], "gcp": [["artifact", "registry"]], "oci": [["registry"]]},
    "edgeiot": {"aws": [["greengrass"]], "azure": [["iot", "edge"]], "gcp": [["compute", "engine"]], "oci": [["compute"]]},
}


def words(name: str):
    return [w for w in re.split(r"[^a-z0-9]+", name.lower()) if w]


def collect(pack: Path):
    files = []
    for path in pack.rglob("*"):
        if path.is_file() and path.suffix.lower() in (".svg", ".png"):
            files.append(path)
    return files


def score(path: Path, wanted, provider):
    parts = words(path.stem)
    if "white" in parts or "dark" in parts or "disabled" in parts:
        return None
    if not all(any(token == w or w.startswith(token) for w in parts) for token in wanted):
        return None
    value = 100 if path.suffix.lower() == ".svg" else 40
    value -= len(parts) * 2  # shorter names are usually the plain service icon
    if provider == "aws":
        full = "/".join(p.lower() for p in path.parts)
        if "/arch_" in full or path.stem.lower().startswith("arch_"):
            value += 30
        if "res_" in path.stem.lower():
            value -= 25
        if "64" in parts:
            value += 15
        if "light" in parts:
            value -= 5
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for provider in PROVIDERS:
        parser.add_argument(f"--{provider}", type=Path, help=f"folder with the unzipped official {provider.upper()} icon pack")
    parser.add_argument("--dry-run", action="store_true", help="show matches without copying anything")
    parser.add_argument("--report", action="store_true", help="also list kinds with no match")
    args = parser.parse_args()
    packs = {p: getattr(args, p) for p in PROVIDERS if getattr(args, p)}
    if not packs:
        parser.error("give at least one of --aws --azure --gcp --oci")

    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    copied = missed = 0
    for provider, pack in packs.items():
        if not pack.is_dir():
            print(f"[{provider}] not a folder: {pack}", file=sys.stderr)
            continue
        files = collect(pack)
        print(f"[{provider}] {len(files)} icon files in {pack}")
        for kind, per in KEYWORDS.items():
            best = None
            for wanted in per.get(provider, []):
                for path in files:
                    value = score(path, wanted, provider)
                    if value is not None and (best is None or value > best[0]):
                        best = (value, path)
                if best:
                    break  # earlier alternatives are the more specific names
            if not best:
                missed += 1
                if args.report:
                    print(f"  - {kind:<12} no match")
                continue
            source = best[1]
            target = ICONS / provider / f"{kind}{source.suffix.lower()}"
            print(f"  {kind:<12} <- {source.relative_to(pack)}")
            if not args.dry_run:
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
                manifest.setdefault(provider, {})[kind] = source.suffix.lower().lstrip(".")
            copied += 1
    if not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    print(f"\n{copied} matched, {missed} kept their current icon" + (" (dry run, nothing written)" if args.dry_run else ""))


if __name__ == "__main__":
    main()

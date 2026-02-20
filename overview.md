# Complete File Structure Overview

## Root Structure

```
bedrock-agent-blueprint/
├── agents/              # All agent code (developers own this)
├── shared/              # Common utilities across agents
├── infra/               # Terraform infrastructure (cloud engineer owns this)
├── .github/workflows/   # CI/CD pipelines
├── .gitignore
└── README.md
```

---

## agents/ Folder

Each agent gets its own isolated folder:

```
agents/
├── A1-document-intelligence/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── main.py          # Entry point with @app decorators
│   ├── tools.py         # Business logic functions
│   └── test.py          # Unit tests
│
├── A2-architecture/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── main.py
│   ├── tools.py
│   └── test.py
│
├── A3-cost-estimation/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── main.py
│   ├── tools.py
│   └── test.py
│
... (A4 through A10 follow same pattern)
```

**Key points:**

- Each agent is completely self-contained
- Developer working on A3 never touches A2 files
- Same 5 files in every agent folder (template pattern)

---

## shared/ Folder

Common code used by multiple agents:

```
shared/
├── schemas.py           # I/O data structures (what A1 outputs, A2 expects)
├── aws_clients.py       # Reusable boto3 client setup
├── logging_config.py    # Standard logging format
├── constants.py         # Shared values (regions, model IDs, timeouts)
└── utils.py             # Helper functions (date formatting, validation)
```

**Key points:**

- Agents import from here: `from shared.schemas import RequirementsSchema`
- Changes here affect all agents (coordinate carefully)
- Cloud engineer reviews changes to shared code

---

## infra/ Folder

All Terraform infrastructure code:

```
infra/
├── main.tf              # Provider config, backend (S3 state storage)
├── variables.tf         # Input variables (environment, region, etc.)
├── outputs.tf           # Outputs (agent endpoints, ECR URLs)
│
├── core/
│   ├── ecr.tf           # ECR repositories for all agents
│   ├── memory.tf        # DynamoDB for AgentCore Memory
│   ├── storage.tf       # S3 buckets for artifacts
│   └── networking.tf    # VPC, subnets (if needed)
│
├── agents/
│   ├── A1.tf            # A1 runtime config, IAM role, memory
│   ├── A2.tf            # A2 runtime config, IAM role, memory
│   ├── A3.tf            # A3 runtime config, IAM role, secrets access
│   ... (A4-A10.tf)
│
├── orchestration/
│   ├── workflow.tf      # Agent dependency graph (A1→A2→A3...)
│   └── routing.tf       # Event routing, triggers
│
├── security/
│   ├── iam_roles.tf     # IAM roles per agent
│   ├── secrets.tf       # Secrets Manager resources
│   └── kms.tf           # Encryption keys
│
└── monitoring/
    ├── cloudwatch.tf    # Log groups, dashboards
    └── alarms.tf        # Error rate alerts
```

**Key points:**

- Cloud engineer owns everything here
- Each agent gets its own `.tf` file in `agents/`
- Core infrastructure provisioned once, agent configs added incrementally

---

## .github/workflows/ Folder

CI/CD automation:

```
.github/workflows/
├── agent-deploy.yml     # Triggered on push to agent/* branches
├── infra-deploy.yml     # Triggered on changes to infra/
└── test.yml             # Run tests on all PRs
```

**Key points:**

- `agent-deploy.yml` detects which agent changed, deploys only that one
- `infra-deploy.yml` runs `terraform apply` when infrastructure changes
- Developers don't edit these (cloud engineer sets up once)

---

## How Files Map to Workflow

**Developer creates new agent A11:**

1. Copy `agents/A1-document-intelligence/` → `agents/A11-new-feature/`
2. Edit `main.py`, `tools.py`, `test.py`
3. Push to branch `agent/A11-new-feature`
4. Pipeline builds and deploys to dev

**Cloud engineer provisions infrastructure for A11:**

1. Create `infra/agents/A11.tf` with runtime config, IAM role
2. If A11 needs secrets, add to `infra/security/secrets.tf`
3. Update `infra/orchestration/workflow.tf` to include A11 in chain
4. Run `terraform apply`
5. Tell developer: "A11 infrastructure ready"

**Developer deploys A11 to production:**

1. Merge `agent/A11-new-feature` → `dev` → test
2. Merge `dev` → `main`
3. Pipeline deploys to production AgentCore

---

## What Lives Where

**Business logic:** `agents/*/tools.py`

**Agent configuration:** `agents/*/main.py` (decorators)

**Infrastructure:** `infra/agents/*.tf`

**Shared utilities:** `shared/*.py`

**Deployment automation:** `.github/workflows/*.yml`

**Tests:** `agents/*/test.py`

**Documentation:** `README.md` at root, plus per-agent READMEs

---

## Size and Scope

**Small agents (A1, A4):** ~200-300 lines total across all files

**Medium agents (A3, A8):** ~500-800 lines (more external API calls)

**Large agents (A5, A6):** ~1000+ lines (complex business logic)

**Infrastructure per agent:** ~50-100 lines of Terraform

**Shared code:** ~500 lines total (grows slowly over time)

---

## Key Principle

**Separation of concerns:**

- Developers never touch `infra/`
- Cloud engineer rarely touches `agents/` (only reviews)
- Both coordinate on `shared/` changes
- CI/CD bridges the two (code → infrastructure)

This structure scales from 10 agents to 50+ agents without reorganization.

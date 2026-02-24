# EyeQ MLR Agent

A comprehensive compliance assistant tool that uses LangChain and Anthropic's Claude Sonnet 4 to analyze promotional text for Alcon products (Clareon PanOptix IOL and Total 30 Contact Lens), checking against approved claims and FDA/FTC guidelines.

## Features

### Core Capabilities
- **Command-line interface** for text analysis with streaming responses
- **Real-time compliance analysis** using AI-powered agent system
- **Comprehensive line-by-line analysis** with claim validation and risk detection
- **Modular, reusable prompts** optimized for claim validation, risk detection, and feedback generation
- **FDA/FTC regulatory citations** with working links to specific guidance documents
- **Exhaustive compliance checking** covering claims, disclaimers, regulatory language, consistency, and tone

### Analysis Features
- **Claim Validation**: Identifies approved claims and flags unapproved marketing language
- **Regulatory Compliance**: Detects violations of FDA/FTC guidelines in promotional materials
- **Line-by-Line Review**: Analyzes text exhaustively to catch compliance issues at sentence level
- **Approved Claims Database**: Pre-validated claims for Clareon PanOptix IOL and Total 30 Contact Lens
- **Issue Classifications**: Prioritizes issues by severity (critical, warning, info)

## Purpose

Helps marketing teams identify compliance issues before formal Medical, Legal, and Regulatory (MLR) review, reducing agency revision cycles and ensuring adherence to FDA/FTC guidelines.

## Prerequisites

- **Python 3.11 or 3.12**: Python 3.13 may have compatibility issues. Python 3.11 recommended.
- **pip**: Python's package manager
- **Git**: Optional, for cloning the repository
- **Virtual Environment**: Recommended to isolate dependencies

## Setup Instructions

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd alcon-mlr-agent
```

Or download and extract the project files.

### 2. Install Python

Ensure Python 3.11 is installed:
- **macOS**: `brew install python@3.11`
- **Windows**: Download from [python.org](https://www.python.org/downloads/). Check "Add Python to PATH."
- **Verify**: `python3 --version` (macOS/Linux) or `python --version` (Windows)

### 3. Set Up a Virtual Environment

```bash
python3.11 -m venv venv  # macOS/Linux
python -m venv venv      # Windows
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create `.env` in the project root:
- **macOS/Linux**: `touch .env`
- **Windows**: `echo. > .env`

Add your Anthropic API key:
```
ANTHROPIC_API_KEY=your-api-key-here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/).

### 6. Verify Permissions

- **macOS/Linux**: `chmod -R u+rw .`
- **Windows**: Ensure write access to the project directory

## Running the Project

### Command Line Interface

1. **Navigate to the Project Directory**:
   ```bash
   cd alcon-mlr-agent
   ```

2. **Activate the Virtual Environment**:
   ```bash
  source venv/bin/activate  # macOS/Linux
   venv\Scripts\activate     # Windows
   ```

3. **Run the Analysis**:
   ```bash
   python3 main.py  # macOS/Linux
   python main.py   # Windows
   ```

#### CLI Usage:
1. Enter your prompt in natural language (e.g., "Check this ad for Clareon PanOptix: [paste your text]")
2. The AI will extract the product and promotional text automatically
3. Receive comprehensive compliance analysis with:
   - Summary of findings
   - Approved claims identified
   - Issues detected with suggestions
   - **Regulatory citations with direct links to FDA/FTC guidelines**
   - Tools used in analysis

#### Example Output:
```
--- EyeQ Compliance Feedback for Total 30 Contact Lens ---
Summary: Analysis of promotional text for Total 30 Contact Lens.
Approved Claims:
  - Total 30 Contact Lens provides clear vision for up to 30 days.
Issues:
  - Incomplete Disclosure: Claim lacks specificity about prescriptions.
    Suggestion: Clarify: 'Clear vision for up to 30 days for specific prescriptions.'
    Reference: https://www.fda.gov/regulatory-information/search-fda-guidance-documents
Tools Used: compliance_analysis
```

## Project Structure

```
alcon-mlr-agent/
├── main.py                      # CLI entry point with conversational interface
├── agent_runtime.py             # Agent runtime (LLM, tools, executor, conversation state)
├── tools.py                     # LangChain tools for compliance analysis
├── comprehensive_analyzer.py    # Exhaustive line-by-line compliance analyzer
├── approved_claims.py           # Product details, approved claims, and FDA/FTC guidelines
├── regulatory_citations.py      # FDA/FTC citations and reference link management
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (API keys)
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

### Key Files Explained

- **main.py**: CLI entry point with streaming conversation interface and conversation history
- **agent_runtime.py**: Centralized agent configuration (LLM setup, tools, prompts, ConversationState class)
- **tools.py**: LangChain StructuredTool definitions for compliance analysis functions
- **comprehensive_analyzer.py**: Advanced analyzer with exhaustive claim extraction, validation, and structured reporting
- **approved_claims.py**: Database of approved claims for Clareon PanOptix IOL and Total 30 Contact Lens, plus FDA/FTC guidelines
- **regulatory_citations.py**: Management of FDA/FTC regulatory references with direct links and citation management

## Supported Products

- **Clareon PanOptix IOL**: Trifocal intraocular lens for cataract surgery
- **Total 30 Contact Lens**: Monthly disposable contact lens with water gradient technology

## Supported Input Types

- **Plain text** prompts in the CLI
- **Natural language queries** for compliance analysis

## Troubleshooting

### Module Not Found
Run `pip install -r requirements.txt` to install all dependencies.

### API Key Error
Verify `.env` file exists in the project root and contains `ANTHROPIC_API_KEY=your-key-here`. Ensure the key is valid and has sufficient credits.

### Permission Denied
- **macOS/Linux**: Run `chmod -R u+rw .` to grant write permissions
- **Windows**: Ensure you have write access to the project directory

### Invalid Product
Ensure you're analyzing content for one of the supported products: Clareon PanOptix IOL or Total 30 Contact Lens.

## Development

### Architecture

The project uses a modular architecture:
- **Agent Runtime** (`agent_runtime.py`): Core LLM and tool management
- **Tools** (`tools.py`): LangChain tools for compliance analysis
- **Analyzer** (`comprehensive_analyzer.py`): Core compliance analysis logic
- **CLI** (`main.py`): Command-line interface entry point

### Key Technologies

- **AI/ML**: LangChain, Anthropic Claude Sonnet 4
- **Document Processing**: python-docx, pdfplumber, python-pptx
- **Data**: Pydantic for structured responses




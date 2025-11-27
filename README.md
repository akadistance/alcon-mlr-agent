# EyeQ MLR Agent

A comprehensive compliance assistant tool that uses LangChain and Anthropic's Claude Sonnet 4 to analyze promotional text for Alcon products (Clareon PanOptix IOL and Total 30 Contact Lens), checking against approved claims and FDA/FTC guidelines.

## ✨ Features

### Core Capabilities
- **Command-line interface** for text analysis with streaming responses
- **Web interface** with modern React.js/TypeScript frontend and Flask backend
- **Real-time compliance analysis** using AI-powered agent system
- **Comprehensive analysis** with line-by-line claim validation and risk detection
- **Modular, reusable prompts** optimized for claim validation, risk detection, and feedback generation
- **JSON-based structured output** for programmatic integration

### Advanced Features
- **🆕 OCR Support**: Extract text from images (screenshots, promotional materials) using Tesseract OCR & Claude Vision API
- **🆕 Citation System**: Automatically includes FDA/FTC regulatory citations with working links to specific guidance documents
- **🆕 Document Comparison**: Side-by-side comparison of marketing materials to track compliance improvements
- **🆕 Regulatory Knowledge Base**: Instant access to FDA/FTC guidelines, common scenarios, and best practices
- **🆕 Team Collaboration**: Share analyses, add comments, create review workflows, and export conversations
- **🆕 Comprehensive Analyzer**: Exhaustive line-by-line analysis covering claims, disclaimers, regulatory language, consistency, and tone

### Web Interface Features
- 💬 **ChatGPT-Style UI**: Modern, responsive chat interface with dark mode support
- 📎 **File Upload**: Drag and drop documents or images for instant analysis
- 🔗 **Citations**: Inline references with clickable links to FDA/FTC guidelines
- 📊 **Document Comparison**: Compare two versions of marketing materials
- 📚 **Knowledge Base**: Search regulatory guidelines and compliance scenarios
- 👥 **Collaboration**: Share analyses with team members, add comments, export reports
- 💾 **Auto-Save**: Conversations automatically saved to localStorage
- 🎨 **Theme Toggle**: Switch between light and dark modes (preference saved)

## 🎯 Purpose

Helps marketing teams identify compliance issues before formal Medical, Legal, and Regulatory (MLR) review, reducing agency revision cycles and ensuring adherence to FDA/FTC guidelines.

## Prerequisites

- **Python 3.11 or 3.12**: Python 3.13 may have compatibility issues. Python 3.11 recommended.
- **pip**: Python's package manager
- **Node.js and npm**: For the web interface (Node.js 16+ recommended)
- **Git**: Optional, for cloning the repository
- **Virtual Environment**: Recommended to isolate dependencies
- **Tesseract OCR**: Optional, for image text extraction (see setup instructions below)

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

### 6. (Optional) Setup OCR for Image Analysis

Install Tesseract OCR on your system:
- **Windows**: Download from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
- **macOS**: `brew install tesseract`
- **Linux**: `sudo apt-get install tesseract-ocr`

### 7. Verify Permissions

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

### Web Interface

The web interface consists of a React frontend and Flask backend. Both need to be running:

#### Start the Backend Server

In the project root directory:

```bash
# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Run Flask backend
python web_backend.py
```

The backend will be available at `http://localhost:5000`

#### Start the Frontend

In a new terminal window:

```bash
cd web-interface
npm install  # First time only
npm start
```

The web interface will be available at `http://localhost:3000`

#### Web Interface Usage:
- Upload files: Drag and drop documents (.txt, .docx, .pdf, .pptx) or images (.jpg, .png, .gif, .webp) for OCR
- Chat interface: Type natural language queries about compliance
- Document comparison: Upload two versions to compare compliance differences
- Knowledge base: Search regulatory guidelines and scenarios
- Collaboration: Share analyses, add comments, export reports

## API Endpoints

The Flask backend provides the following REST API endpoints:

### Analysis Endpoints
- `POST /api/analyze` - Analyze promotional text for compliance
- `POST /api/upload` - Upload and extract text from documents/images
- `POST /api/compare` - Compare two documents for compliance differences

### Knowledge Base Endpoints
- `GET /api/knowledge?q=query` - Search the regulatory knowledge base

### Collaboration Endpoints
- `POST /api/share` - Create a shareable link for a conversation
- `GET /api/share/<share_id>` - Retrieve a shared analysis
- `POST /api/share/<share_id>/comment` - Add a comment to a shared analysis
- `POST /api/export/<conversation_id>` - Export conversation (JSON/Markdown)
- `GET /api/collaboration/stats/<conversation_id>` - Get collaboration statistics

### Utility Endpoints
- `GET /api/health` - Health check

## Project Structure

```
alcon-mlr-agent/
├── main.py                          # CLI entry point with conversational interface
├── agent_runtime.py                 # Shared agent runtime (LLM, tools, executor)
├── web_backend.py                   # Flask backend API for web interface
├── tools.py                         # LangChain tools (compliance analysis, comprehensive analysis, save)
├── comprehensive_analyzer.py        # Exhaustive line-by-line compliance analyzer
├── approved_claims.py               # Product details, approved claims, and FDA/FTC guidelines
├── regulatory_citations.py         # FDA/FTC citations and reference link management
├── regulatory_knowledge_base.py    # Searchable regulatory guidance and scenarios
├── document_comparison.py           # Side-by-side document comparison utilities
├── collaboration.py                 # Team collaboration features (sharing, comments, reviews)
├── ocr_utils.py                     # OCR functionality for image text extraction
├── requirements.txt                 # Python dependencies
├── .env                             # Environment variables (API keys)
├── uploads/                         # Uploaded files directory
├── web-interface/                   # React.js/TypeScript frontend application
│   ├── src/
│   │   ├── components/             # React components (ChatInterface, InputArea, etc.)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utility libraries
│   │   └── App.tsx                 # Main application component
│   ├── package.json                # Node.js dependencies
│   └── public/                     # Static assets
└── README.md                        # This file
```

### Key Files Explained

- **main.py**: CLI entry point with streaming conversation interface
- **agent_runtime.py**: Centralized agent configuration (LLM, tools, prompts, ConversationState)
- **web_backend.py**: Flask REST API server for web interface
- **tools.py**: LangChain StructuredTool definitions for compliance analysis
- **comprehensive_analyzer.py**: Advanced analyzer with claim extraction, validation, and structured reporting
- **approved_claims.py**: Database of approved claims for Clareon PanOptix IOL and Total 30 Contact Lens
- **regulatory_citations.py**: Management of FDA/FTC regulatory references with direct links
- **regulatory_knowledge_base.py**: Searchable knowledge base of regulatory scenarios and guidance
- **document_comparison.py**: Utilities for comparing document versions and tracking changes
- **collaboration.py**: Features for sharing analyses, adding comments, and creating review workflows
- **ocr_utils.py**: Image text extraction using Tesseract and Claude Vision API

## Supported Products

- **Clareon PanOptix IOL**: Trifocal intraocular lens for cataract surgery
- **Total 30 Contact Lens**: Monthly disposable contact lens with water gradient technology

## Supported File Formats

- **Text**: `.txt`
- **Documents**: `.docx` (Word), `.pdf`, `.pptx` (PowerPoint)
- **Images**: `.jpg`, `.png`, `.gif`, `.webp` (with OCR)

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

### File Reading Errors
- Ensure file paths are correct and files exist
- For `.docx` files, verify they're not corrupted
- For images, ensure Tesseract OCR is installed if using OCR features

### Backend Connection Issues
- Ensure the Flask backend is running on port 5000
- Check that CORS is properly configured
- Verify the frontend proxy settings in `web-interface/package.json`

### Frontend Build Issues
- Run `npm install` in the `web-interface` directory
- Clear `node_modules` and reinstall if needed: `rm -rf node_modules && npm install`
- Check Node.js version compatibility (16+ recommended)

## Development

### Architecture

The project uses a decoupled architecture:
- **Agent Runtime** (`agent_runtime.py`): Shared between CLI and web interface
- **Tools** (`tools.py`): LangChain tools for compliance analysis
- **Backend** (`web_backend.py`): Flask REST API
- **Frontend** (`web-interface/`): React with TypeScript

### Key Technologies

- **AI/ML**: LangChain, Anthropic Claude Sonnet 4
- **Backend**: Flask, Flask-CORS
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Document Processing**: python-docx, pdfplumber, python-pptx
- **OCR**: pytesseract, Pillow, Anthropic Vision API

## License

[Add license information here]

## Contributing

[Add contributing guidelines here]

## Contact

[Add contact information here]

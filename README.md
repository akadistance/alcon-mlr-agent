EyeQ
A compliance assistant tool that uses LangChain and Anthropic's Claude to analyze promotional text for Alcon products (Clareon PanOptix IOL and Total 30 Contact Lens), checking against approved claims and FDA/FTC guidelines.

✨ **Features:**
- Command-line interface for text analysis
- Support for text input (Word document support available via tools)
- **🆕 OCR Support**: Extract text from images (screenshots, promotional materials) using Tesseract OCR & Claude Vision API
- **🆕 Citation System**: Automatically includes FDA/FTC regulatory citations with working links to specific guidance documents
- **🆕 Document Comparison**: Side-by-side comparison of marketing materials to track compliance improvements
- **🆕 Regulatory Knowledge Base**: Instant access to FDA/FTC guidelines, common scenarios, and best practices
- **🆕 Team Collaboration**: Share analyses, add comments, create review workflows, and export conversations
- Real-time compliance analysis using AI
- Modular, reusable prompts optimized for claim validation, risk detection, and feedback generation
- Clear, actionable feedback aligned with regulatory standards
- JSON-based structured output
- Web interface with React.js for interactive analysis with ChatGPT-style UI

🎯 **Purpose:** Helps marketing teams identify compliance issues before formal Medical, Legal, and Regulatory (MLR) review.

🚀 **Future Plans:** Web interface with React.js and HTML (coming soon)
Prerequisites

Python 3.11 or 3.12: Python 3.13 may have compatibility issues. Python 3.11 recommended.
pip: Python's package manager.
Git: Optional, for cloning the repository.
Virtual Environment: Recommended to isolate dependencies.

Setup Instructions

Clone or Download the Repository:
git clone <repository-url>
cd EyeQ

 Or download and extract the project files.

Install Python: Ensure Python 3.11 is installed: macOS: brew install python@3.11 Windows: Download from python.org. Check "Add Python to PATH." Verify: python3 --version (macOS/Linux) or python --version (Windows).

Set Up a Virtual Environment:
python3.11 -m venv venv  # macOS/Linux
python -m venv venv      # Windows
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows


Install Dependencies:
pip install -r requirements.txt


Configure Environment Variables: Create .env in the project root: macOS: touch .env Windows: echo. > .env Add: ANTHROPIC_API_KEY=your-api-key-here Get your API key from Anthropic.

(Optional) Setup OCR for Image Analysis:
- Install Tesseract OCR on your system
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
- Mac: brew install tesseract
- Linux: sudo apt-get install tesseract-ocr

Verify Permissions: macOS/Linux: chmod -R u+rw . Windows: Ensure write access to the project directory.


Running the Project

## Command Line Interface

Navigate to the Project Directory:
```bash
cd path/to/EyeQ
```

Activate the Virtual Environment:
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

Run the Analysis:
```bash
python3 main.py  # macOS/Linux
python main.py   # Windows
```

### Usage:
1. Enter your prompt in natural language (e.g., "Check this ad for Clareon PanOptix: [paste your text]")
2. Or upload a file: text (.txt), Word (.docx), PDF (.pdf), PowerPoint (.pptx), or images (.jpg, .png, .gif, .webp) for OCR
3. The AI will extract the product and promotional text automatically
4. Receive comprehensive compliance analysis with:
   - Summary of findings
   - Approved claims identified
   - Issues detected with suggestions
   - **Regulatory citations with direct links to FDA/FTC guidelines**
   - Tools used in analysis

Example Output
--- EyeQ Compliance Feedback for Total 30 Contact Lens ---
Summary: Analysis of promotional text for Total 30 Contact Lens.
Approved Claims:
  - Total 30 Contact Lens provides clear vision for up to 30 days.
Issues:
  - Incomplete Disclosure: Claim lacks specificity about prescriptions.
    Suggestion: Clarify: 'Clear vision for up to 30 days for specific prescriptions.'
    Reference: https://www.fda.gov/regulatory-information/search-fda-guidance-documents
  - Missing Safety Information: Lacks instructions for proper use.
    Suggestion: Add: 'Follow proper care instructions to avoid risks.'
    Reference: https://www.fda.gov/regulatory-information/search-fda-guidance-documents
Tools Used: compliance_analysis

## Web Interface

Navigate to the web-interface directory and start the development server:

```bash
cd web-interface
npm install
npm start
```

The web interface will be available at http://localhost:3000

### Web Interface Features:
- 💬 **ChatGPT-Style UI**: Modern, responsive chat interface with dark mode support
- 📎 **File Upload**: Drag and drop documents or images for instant analysis
- 🔗 **Citations**: Inline references with clickable links to FDA/FTC guidelines
- 📊 **Document Comparison**: Compare two versions of marketing materials
- 📚 **Knowledge Base**: Search regulatory guidelines and compliance scenarios
- 👥 **Collaboration**: Share analyses with team members, add comments, export reports
- 💾 **Auto-Save**: Conversations automatically saved to localStorage
- 🎨 **Theme Toggle**: Switch between light and dark modes (preference saved)

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/analyze` - Analyze promotional text for compliance
- `POST /api/upload` - Upload and extract text from documents/images
- `POST /api/compare` - Compare two documents for compliance differences
- `GET /api/knowledge?q=query` - Search the regulatory knowledge base
- `POST /api/share` - Create a shareable link for a conversation
- `GET /api/share/<share_id>` - Retrieve a shared analysis
- `POST /api/share/<share_id>/comment` - Add a comment to a shared analysis
- `POST /api/export/<conversation_id>` - Export conversation (JSON/Markdown)
- `GET /api/collaboration/stats/<conversation_id>` - Get collaboration statistics
- `GET /api/health` - Health check

Project Structure

main.py: Runs the agent, handles input, and outputs feedback.
tools.py: Defines tools for compliance analysis and saving feedback.
approved_claims.py: Stores product details, approved claims, and FDA/FTC guidelines.
regulatory_citations.py: Manages FDA/FTC citations and reference links.
regulatory_knowledge_base.py: Provides searchable regulatory guidance and scenarios.
document_comparison.py: Enables side-by-side document comparison.
collaboration.py: Handles team collaboration features (sharing, comments, reviews).
ocr_utils.py: OCR functionality for image text extraction.
web_backend.py: Flask backend API for the web interface.
.env: Stores the Anthropic API key.
requirements.txt: Lists Python dependencies.
web-interface/: React.js frontend application.
compliance_feedback_*.txt: Generated feedback files.

Troubleshooting

Module Not Found: Run pip install -r requirements.txt.
API Key Error: Verify .env file and API key.
Permission Denied: Check folder write permissions.
Invalid Product: Ensure valid product selection.
File Reading Errors: Use valid .docx files and correct paths.
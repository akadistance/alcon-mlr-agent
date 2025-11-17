Technical Architecture
Overview
EyeQ is a Python-based application that uses LangChain and Anthropic's Claude to analyze promotional text for compliance with approved claims and FDA/FTC guidelines. It accepts text or Word document input, processes it through a compliance analysis tool, and outputs structured feedback.
Components

Input Handling:

Console-based input for pasted text or Word document paths.
python-docx reads .docx files.
Future web interface to handle uploads and text input.


Compliance Analysis:

approved_claims.py: Stores product details, approved claims, and FDA/FTC guideline rules.
tools.py: Defines compliance_analysis tool to check text against claims and guidelines, and save_feedback_to_file to save results.
Uses regular expressions to detect problematic language patterns.


Agent Orchestration:

main.py: Uses LangChain’s ChatAnthropic and AgentExecutor to process input and invoke tools.
Pydantic (ComplianceResponse) ensures structured JSON output.
Modular prompt in main.py guides Claude to analyze from Medical, Legal, and Regulatory perspectives.


Output:

Console output of feedback (summary, approved claims, issues, references).
Saves feedback to timestamped text files.
Future web interface to display feedback interactively.



Workflow

User inputs promotional text or Word document path.
main.py reads input (using read_docx for .docx files).
Agent invokes compliance_analysis tool to check text against approved claims and FDA/FTC guidelines.
Claude processes results and returns structured JSON.
Feedback is formatted and printed to the console.
Feedback is saved to a text file using save_feedback_to_file.

Future Enhancements

Web interface using HTML/CSS/JavaScript for interactive input and feedback display.
Support for PowerPoint (.pptx) files using python-pptx.
Enhanced guideline checks with external FDA/FTC document retrieval (if permitted).

Technical Diagram
[To be added once web interface is implemented]
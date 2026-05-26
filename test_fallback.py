import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

latex_code = r"""%=========================================================
% Praful Chalakh Resume
% One Page ATS Optimized Resume
%=========================================================

\documentclass[letterpaper,9pt]{article}

\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{xcolor}
\usepackage{lmodern}
\usepackage[T1]{fontenc}
\input{glyphtounicode}

\pdfgentounicode=1

\definecolor{heading}{HTML}{0A2A43}

%================ PAGE SETTINGS =================
\addtolength{\oddsidemargin}{-0.7in}
\addtolength{\evensidemargin}{-0.7in}
\addtolength{\textwidth}{1.4in}
\addtolength{\topmargin}{-.85in}
\addtolength{\textheight}{1.8in}

\urlstyle{same}
\raggedright
\setlength{\tabcolsep}{0in}
\setlength{\parskip}{0.3pt}

%================ SECTION STYLE =================
\titleformat{\section}
{\large\bfseries\color{heading}}
{}{0em}{}[\vspace{1pt}\hrule height 0.8pt\vspace{2pt}]

\titlespacing*{\section}{0pt}{4pt}{2pt}

%================ LIST SETTINGS =================
\setlist[itemize]{
leftmargin=0.17in,
itemsep=0.8pt,
topsep=0.8pt,
parsep=0pt,
partopsep=0pt
}

%================ CUSTOM COMMANDS =================
\newcommand{\resumeItem}[1]{
\item \small{#1}
}

\newcommand{\resumeSubheading}[4]{
\vspace{1pt}
\textbf{#1} \hfill \textbf{\small #2} \\
\textit{#3} \hfill \textit{\small #4}
\vspace{1pt}
}

\begin{document}

%=========================================================
% HEADER
%=========================================================

\begin{center}

{\Huge \bfseries Praful Chalakh} \\[2pt]

{\normalsize Software Engineer | Cloud \& DevOps | AWS | Kubernetes | Python} \\[3pt]

Hyderabad, Telangana, India \quad | \quad
8767754506 \quad | \quad
\href{mailto:prafulchalakh224@gmail.com}{prafulchalakh224@gmail.com}

\vspace{2pt}

\href{https://linkedin.com/in/prafulchalakh}{linkedin.com/in/prafulchalakh}
\quad | \quad
\href{https://github.com/Praful224}{github.com/Praful224}
\quad | \quad
\href{https://leetcode.com/Prafulchalakh224}{leetcode.com/Prafulchalakh224}

\end{center}

%=========================================================
% SUMMARY
%=========================================================

\section{Professional Summary}

\small{
Software Engineer with nearly 2 years of enterprise experience in cloud infrastructure, DevOps automation, CI/CD pipelines, backend engineering, and scalable platform workflows. Skilled in Python, AWS, Kubernetes, Docker, Jenkins, GitHub Actions, Terraform, FastAPI, Prometheus, Grafana, and DevSecOps tooling. Experienced in deployment automation, cloud-native systems, observability, production troubleshooting, and infrastructure reliability across large-scale enterprise environments.
}

%=========================================================
% SKILLS
%=========================================================

\section{Technical Skills}

\small{

\textbf{Programming:}
Python, Bash, Shell Scripting, SQL, C++

\vspace{1pt}

\textbf{Backend:}
FastAPI, REST APIs, PostgreSQL, Microservices

\vspace{1pt}

\textbf{Cloud \& DevOps:}
AWS, Azure, Docker, Kubernetes, Helm, ArgoCD, Terraform, Jenkins, GitHub Actions, GitLab CI/CD, Azure DevOps

\vspace{1pt}

\textbf{Monitoring \& DevSecOps:}
Dynatrace, Prometheus, Grafana, ELK Stack, CloudWatch, SonarQube, Trivy

\vspace{1pt}

\textbf{Concepts:}
CI/CD, Cloud-Native Deployments, Infrastructure Automation, Agile/Scrum, SDLC, High Availability

}

%=========================================================
% EXPERIENCE
%=========================================================

\section{Professional Experience}

\resumeSubheading
{Tata Consultancy Services (TCS)}{Nov 2024 -- Present}
{Cloud \& DevOps Engineer}{Hyderabad, Telangana}

\begin{itemize}

\resumeItem{
Provisioned and managed AWS and Azure cloud infrastructure following high-availability and Disaster Recovery (DR) practices for enterprise production applications.
}

\resumeItem{
Built and maintained CI/CD automation workflows using Jenkins, GitHub Actions, GitLab CI/CD, and Azure DevOps for automated build, testing, deployment, and rollback pipelines.
}

\resumeItem{
Automated infrastructure validation, deployment workflows, monitoring tasks, and operational activities using Python and Bash scripting reducing manual effort significantly.
}

\resumeItem{
Worked on Kubernetes deployment environments and managed containerized applications using Docker, Helm charts, and GitOps workflows with ArgoCD.
}

\resumeItem{
Integrated SonarQube and Trivy security validation within CI/CD pipelines improving DevSecOps compliance and deployment security.
}

\resumeItem{
Enhanced observability using Dynatrace, Prometheus, Grafana, ELK Stack, and AWS CloudWatch through dashboards, monitoring, and alerting systems.
}

\resumeItem{
Resolved production incidents, participated in RCA investigations, authored Terraform configurations, and collaborated with development and QA teams within Agile/Scrum SDLC workflows.
}

\end{itemize}

%=========================================================
% PROJECTS
%=========================================================

\section{Projects}

\textbf{JobssVilla -- AI-Powered Job \& Resume Platform}
\begin{itemize}

\resumeItem{
Developing a full-stack AI-powered job and resume platform supporting recruiter workflows, authentication, candidate management, and ATS-friendly resume generation systems.
}

\resumeItem{
Built scalable backend REST APIs using FastAPI and PostgreSQL with Dockerized deployment environments for cloud-native application workflows.
}

\resumeItem{
Implemented dynamic resume generation, code compilation workflows, CI/CD automation, and backend microservices improving platform scalability and deployment reliability.
}

\end{itemize}

\vspace{1pt}

\textbf{Enterprise CI/CD Automation \& Observability Platform}
\begin{itemize}

\resumeItem{
Built CI/CD automation workflows using Jenkins, GitHub Actions, Docker, Kubernetes, and GitLab CI/CD for scalable deployment operations.
}

\resumeItem{
Integrated observability and DevSecOps workflows using Dynatrace, Prometheus, Grafana, ELK Stack, SonarQube, and Trivy improving operational visibility and deployment security.
}

\end{itemize}

%=========================================================
% CODING
%=========================================================

\section{Coding \& Problem Solving}

\begin{itemize}

\resumeItem{
Solved 300+ Data Structures \& Algorithms (DSA) problems across LeetCode and GeeksforGeeks focusing on backend engineering, debugging, and scalable system problem-solving.
}

\resumeItem{
Maintained repositories focused on cloud infrastructure, DevOps automation, backend engineering, and CI/CD workflow implementations.
}

\end{itemize}

%=========================================================
% EDUCATION
%=========================================================

\section{Education}

\resumeSubheading
{Government College of Engineering, Aurangabad}{2020 -- 2024}
{B.Tech in Information Technology}{Aurangabad, Maharashtra}

%=========================================================
% CERTIFICATIONS
%=========================================================

\section{Certifications}

\begin{itemize}

\resumeItem{Microsoft Certified: Azure Security Engineer Associate (AZ-500)}

\resumeItem{AWS Certified CloudOps Engineer -- Associate}

\end{itemize}

\end{document}
"""

def extract_braces(s: str, count: int = 4) -> tuple:
    args = []
    remaining = s
    for _ in range(count):
        start_idx = remaining.find('{')
        if start_idx == -1:
            break
        depth = 0
        end_idx = -1
        for idx in range(start_idx, len(remaining)):
            char = remaining[idx]
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    end_idx = idx
                    break
        if end_idx != -1:
            arg = remaining[start_idx+1:end_idx]
            args.append(arg)
            remaining = remaining[end_idx+1:]
        else:
            break
    return args, remaining

def clean_latex_tags(text: str) -> str:
    # Basic strip of general tags
    text = re.sub(r'\\[a-zA-Z]+\*?(?:{[^}]*})?', '', text)
    text = re.sub(r'\\[a-zA-Z]+\s*', '', text)
    text = text.replace('{', '').replace('}', '').strip()
    return text

def latex_to_html(text: str) -> str:
    text = re.sub(r'(?<!\\)%.*$', '', text, flags=re.MULTILINE)
    text = text.replace(r'\%', '%')
    text = text.replace(r'\_', '_')
    text = text.replace(r'\&', '&')
    text = text.replace(r'\$', '$')
    text = text.replace(r'\{', '{')
    text = text.replace(r'\}', '}')
    text = text.replace('~', ' ')
    text = text.replace(r'\\', '\n')
    text = text.replace('--', '–')
    text = re.sub(r'\s+', ' ', text)
    
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    
    while True:
        new_text = re.sub(r'\\textbf\s*{([^{}]+)}', r'###BOLD_START###\1###BOLD_END###', text)
        if new_text == text:
            break
        text = new_text
        
    while True:
        new_text = re.sub(r'\\textit\s*{([^{}]+)}', r'###ITALIC_START###\1###ITALIC_END###', text)
        if new_text == text:
            break
        text = new_text
        
    while True:
        new_text = re.sub(r'\\small\s*{([^{}]+)}', r'\1', text)
        if new_text == text:
            break
        text = new_text
        
    text = re.sub(r'\\href\s*{[^}]+}\s*{([^}]+)}', r'###BOLD_START###\1###BOLD_END###', text)
    text = re.sub(r'\\[a-zA-Z]+\*?(?:{[^}]*})?', '', text)
    text = re.sub(r'\\[a-zA-Z]+\s*', '', text)
    
    text = text.replace('###BOLD_START###', '<b>').replace('###BOLD_END###', '</b>')
    text = text.replace('###ITALIC_START###', '<i>').replace('###ITALIC_END###', '</i>')
    text = text.replace('\n', '<br/>')
    
    text = text.strip()
    if text.startswith('{') and text.endswith('}'):
        text = text[1:-1].strip()
        
    return text

print("--- TESTING NAME & SUBTITLE EXTRACTION ---")
p1 = re.search(r'{\\(?:Huge|huge)\s*(?:\\bfseries|\\bf)?\s*([^{}]+)}', latex_code, re.IGNORECASE)
if p1:
    print("Name P1:", clean_latex_tags(p1.group(1)))
else:
    p2 = re.search(r'\\(?:Huge|huge)\s*(?:\\bfseries|\\bf)?\s*([^\n\\]+)', latex_code, re.IGNORECASE)
    if p2:
        print("Name P2:", clean_latex_tags(p2.group(1)))

p_title = re.search(r'{\\normalsize\s*([^{}]+)}', latex_code, re.IGNORECASE)
if p_title:
    print("Title:", clean_latex_tags(p_title.group(1)))

# Header block
header_match = re.search(r'\\begin{document}(.*?)(?:\\section)', latex_code, re.DOTALL | re.IGNORECASE)
header_text = header_match.group(1) if header_match else latex_code[:2000]

emails = re.findall(r'[\w.-]+@[\w.-]+\.\w+', header_text)
print("Email:", emails)
phones = re.findall(r'\b\d{10}\b|\+?\b\d{2,4}[-.\s]?\d{7,10}\b', header_text)
print("Phone:", phones)
linkedin = re.search(r'linkedin\.com/[^\s}\\]+', header_text)
if linkedin: print("LinkedIn:", linkedin.group(0))
github = re.search(r'github\.com/[^\s}\\]+', header_text)
if github: print("GitHub:", github.group(0))
leetcode = re.search(r'leetcode\.com/[^\s}\\]+', header_text)
if leetcode: print("LeetCode:", leetcode.group(0))

location = "Hyderabad, Telangana, India"
for line in header_text.splitlines():
    line_clean = clean_latex_tags(line).strip()
    if any(loc in line_clean.lower() for loc in ["telangana", "india", "aurangabad", "hyderabad", "maharashtra"]):
        loc_match = re.search(r'^([^|•]+)', line_clean)
        if loc_match:
            location = loc_match.group(1).strip()
            break
print("Location:", location)

print("\n--- TESTING SECTION SPLITTING ---")
sections = re.split(r'\\section\s*{([^}]+)}', latex_code)
section_dict = {}
for i in range(1, len(sections), 2):
    title = sections[i].strip()
    content = sections[i+1].strip()
    section_dict[title] = content

normalized_sections = {}
for title, content in section_dict.items():
    norm_title = title.replace('\\', '').replace('&', '&').replace('  ', ' ').strip().lower()
    normalized_sections[norm_title] = content
    print(f"Section found: '{norm_title}' (length: {len(content)} characters)")

# Parse skills
print("\n--- SKILLS PARSING ---")
skills_content = normalized_sections.get("technical skills", "")
skills_parts = re.split(r'\\textbf\s*{([^}]+)}:?', skills_content)
skills_entries = []
for idx in range(1, len(skills_parts), 2):
    category = skills_parts[idx].strip()
    value = skills_parts[idx+1].strip()
    value = re.sub(r'\\vspace\s*{[^}]*}', '', value)
    value = value.strip().rstrip('}').strip()
    value = latex_to_html(value)
    skills_entries.append((category, value))
    print(f"Skills category: {category} -> {value}")

# Parse experience
print("\n--- EXPERIENCE PARSING ---")
exp_content = normalized_sections.get("professional experience", "")
subheading_blocks = re.split(r'\\resumeSubheading', exp_content)
for idx, block in enumerate(subheading_blocks[1:]):
    args, remaining = extract_braces(block, 4)
    print(f"Block {idx+1} subheading args: {args}")
    bullets = []
    item_matches = re.finditer(r'\\resumeItem', remaining)
    for match in item_matches:
        start_pos = match.end()
        item_args, _ = extract_braces(remaining[start_pos:], 1)
        if item_args:
            bullets.append(latex_to_html(item_args[0].strip()))
    print(f"  Bullets found: {len(bullets)}")
    for b in bullets[:2]:
        print(f"    - {b}")

# Parse projects
print("\n--- PROJECTS PARSING ---")
projects_content = normalized_sections.get("projects", "")
project_parts = re.split(r'\\textbf\s*{([^}]+)}', projects_content)
for idx in range(1, len(project_parts), 2):
    title = latex_to_html(project_parts[idx].strip())
    content = project_parts[idx+1].strip()
    bullets = []
    item_matches = re.finditer(r'\\resumeItem', content)
    for match in item_matches:
        start_pos = match.end()
        item_args, _ = extract_braces(content[start_pos:], 1)
        if item_args:
            bullets.append(latex_to_html(item_args[0].strip()))
    print(f"Project: {title}")
    print(f"  Bullets found: {len(bullets)}")
    for b in bullets[:2]:
        print(f"    - {b}")

# Test ReportLab building
print("\n--- GENERATING TEST PDF ---")
pdf_path = "test_output.pdf"
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=36,
    leftMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=colors.HexColor('#0A2A43'),
    alignment=1,
    spaceAfter=2
)
subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#475569'),
    alignment=1,
    spaceAfter=4
)
contact_style = ParagraphStyle(
    'DocContact',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=10,
    textColor=colors.HexColor('#475569'),
    alignment=1,
    spaceAfter=6
)
section_heading = ParagraphStyle(
    'SectionHeading',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=colors.HexColor('#0A2A43'),
    spaceBefore=6,
    spaceAfter=2,
    keepWithNext=True
)
body_style = ParagraphStyle(
    'DocBody',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#1E293B'),
    spaceAfter=4
)
bullet_style = ParagraphStyle(
    'DocBullet',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#1E293B'),
    leftIndent=12,
    firstLineIndent=-8,
    spaceAfter=2
)

subheading_left_bold = ParagraphStyle(
    'SubheadLeftBold',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#1E293B')
)
subheading_right_bold = ParagraphStyle(
    'SubheadRightBold',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#1E293B'),
    alignment=2
)
subheading_left_italic = ParagraphStyle(
    'SubheadLeftItalic',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#475569')
)
subheading_right_italic = ParagraphStyle(
    'SubheadRightItalic',
    parent=styles['Normal'],
    fontName='Helvetica-Oblique',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#475569'),
    alignment=2
)

story = []

# Build header
name = "Praful Chalakh"
title_txt = "Software Engineer | Cloud & DevOps | AWS | Kubernetes | Python"
contact_txt = f"{location} • {phones[0] if phones else ''} • {emails[0] if emails else ''}"
social_txt = ""
socials = []
if linkedin: socials.append(linkedin.group(0))
if github: socials.append(github.group(0))
if leetcode: socials.append(leetcode.group(0))
social_txt = " • ".join(socials)

story.append(Paragraph(name, title_style))
story.append(Paragraph(title_txt, subtitle_style))
story.append(Paragraph(contact_txt, contact_style))
if social_txt:
    story.append(Paragraph(social_txt, contact_style))

def make_section_header(title: str):
    header_p = Paragraph(title.upper(), section_heading)
    hr = Table([[""]], colWidths=[540])
    hr.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.8, colors.HexColor('#0A2A43')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    return [header_p, hr, Spacer(1, 3)]

# Add summary
summary_content = normalized_sections.get("professional summary", "")
if summary_content:
    story.extend(make_section_header("Professional Summary"))
    story.append(Paragraph(latex_to_html(summary_content), body_style))
    story.append(Spacer(1, 2))

# Add skills
if skills_entries:
    story.extend(make_section_header("Technical Skills"))
    for category, val in skills_entries:
        story.append(Paragraph(f"<b>{category}:</b> {val}", body_style))
    story.append(Spacer(1, 2))

# Add Experience
exp_content = normalized_sections.get("professional experience", "")
if exp_content:
    story.extend(make_section_header("Professional Experience"))
    for block in subheading_blocks[1:]:
        args, remaining = extract_braces(block, 4)
        if len(args) == 4:
            company, dates, role, loc = args
            role = clean_latex_tags(role)
            # Render two column layout for subheading
            sub_data = [
                [Paragraph(f"<b>{company}</b>", subheading_left_bold), Paragraph(f"<b>{dates}</b>", subheading_right_bold)],
                [Paragraph(f"<i>{role}</i>", subheading_left_italic), Paragraph(f"<i>{loc}</i>", subheading_right_italic)]
            ]
            t = Table(sub_data, colWidths=[380, 160])
            t.setStyle(TableStyle([
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(t)
            story.append(Spacer(1, 2))
            
            # Bullets
            bullets = []
            item_matches = re.finditer(r'\\resumeItem', remaining)
            for match in item_matches:
                start_pos = match.end()
                item_args, _ = extract_braces(remaining[start_pos:], 1)
                if item_args:
                    bullets.append(latex_to_html(item_args[0].strip()))
            for b in bullets:
                story.append(Paragraph(f"• {b}", bullet_style))
            story.append(Spacer(1, 2))

# Add Projects
if projects_content:
    story.extend(make_section_header("Projects"))
    for idx in range(1, len(project_parts), 2):
        proj_title = latex_to_html(project_parts[idx].strip())
        content = project_parts[idx+1].strip()
        
        story.append(Paragraph(f"<b>{proj_title}</b>", body_style))
        
        bullets = []
        item_matches = re.finditer(r'\\resumeItem', content)
        for match in item_matches:
            start_pos = match.end()
            item_args, _ = extract_braces(content[start_pos:], 1)
            if item_args:
                bullets.append(latex_to_html(item_args[0].strip()))
        for b in bullets:
            story.append(Paragraph(f"• {b}", bullet_style))
        story.append(Spacer(1, 2))

# Add Coding
coding_content = normalized_sections.get("coding & problem solving", "")
if coding_content:
    story.extend(make_section_header("Coding & Problem Solving"))
    bullets = []
    item_matches = re.finditer(r'\\resumeItem|\\item', coding_content)
    for match in item_matches:
        start_pos = match.end()
        item_args, _ = extract_braces(coding_content[start_pos:], 1)
        if item_args:
            bullets.append(latex_to_html(item_args[0].strip()))
    for b in bullets:
        story.append(Paragraph(f"• {b}", bullet_style))
    story.append(Spacer(1, 2))

# Add Education
edu_content = normalized_sections.get("education", "")
if edu_content:
    story.extend(make_section_header("Education"))
    edu_blocks = re.split(r'\\resumeSubheading', edu_content)
    for block in edu_blocks[1:]:
        args, _ = extract_braces(block, 4)
        if len(args) == 4:
            school, dates, degree, loc = args
            sub_data = [
                [Paragraph(f"<b>{school}</b>", subheading_left_bold), Paragraph(f"<b>{dates}</b>", subheading_right_bold)],
                [Paragraph(f"<i>{degree}</i>", subheading_left_italic), Paragraph(f"<i>{loc}</i>", subheading_right_italic)]
            ]
            t = Table(sub_data, colWidths=[380, 160])
            t.setStyle(TableStyle([
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(t)
            story.append(Spacer(1, 2))

# Add Certifications
cert_content = normalized_sections.get("certifications", "")
if cert_content:
    story.extend(make_section_header("Certifications"))
    bullets = []
    item_matches = re.finditer(r'\\resumeItem|\\item', cert_content)
    for match in item_matches:
        start_pos = match.end()
        item_args, _ = extract_braces(cert_content[start_pos:], 1)
        if item_args:
            bullets.append(latex_to_html(item_args[0].strip()))
    for b in bullets:
        story.append(Paragraph(f"• {b}", bullet_style))

doc.build(story)
print("PDF SUCCESSFULLY COMPILED!")

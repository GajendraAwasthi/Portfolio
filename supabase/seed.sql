-- =========================================================
-- GAJENDRA AWASTHI PORTFOLIO - INITIAL SEED DATA
-- Run this script in your Supabase SQL Editor after schema.sql
-- =========================================================

-- Clean existing data
TRUNCATE TABLE site_settings, profile, about_cards, stats, education, experience, skills, certifications, projects, videos, terminal_commands;

-- 1. Initial Admin User
INSERT INTO admin_users (username, email, password_hash)
VALUES (
    'admin',
    'gajendraawasthi456@gmail.com',
    '$2b$10$o4U0JGEvS4hz1IwY.H/qyuU5QX.hxW/iyRzDlDBhw/G.BqPFzhLvO'
)
ON CONFLICT (username) DO NOTHING;

-- 2. Site Settings
INSERT INTO site_settings (
    id, meta_title, meta_description, meta_keywords, og_image, favicon,
    theme_color, enable_audio_easter_egg, mobile_audio_src, desktop_audio_src,
    attention_title_blink, footer_owner, footer_tagline, footer_subtext, last_updated_text
) VALUES (
    'default',
    'Gajendra Awasthi | Cybersecurity, Development & Creative Portfolio',
    'Official portfolio of Gajendra Awasthi from Dhangadhi, Nepal — CS student at NAST College (Pokhara University), cybersecurity enthusiast, developer, content creator, and graphics designer.',
    'Gajendra Awasthi, Gajendra Awasthi portfolio, Gajendra Awasthi Nepal, Dhangadhi Nepal, NAST College, NAST COLLEGE Pokhara University, Pokhara University BCA, Mount Saipal English School, CS student Nepal, cybersecurity enthusiast, ethical hacking, penetration testing, IoT security, web development, aspiring full stack developer, content creator, graphics designer, UI UX design, Adobe Photoshop, Canva, Figma, HTML CSS, JavaScript, C programming, Java, TryHackMe, freelancer Nepal, technology portfolio',
    'https://media.licdn.com/dms/image/v2/D5603AQHDWKHexhigrg/profile-displayphoto-crop_800_800/B56ZsOE0OAI0AQ-/0/1765467703110?e=1775692800&v=beta&t=bPmGJmmNjahlYV2Y232mP48Q7GZOXQZL4oLkjp8ioQs',
    'https://media.licdn.com/dms/image/v2/D5603AQHDWKHexhigrg/profile-displayphoto-crop_800_800/B56ZsOE0OAI0AQ-/0/1765467703110?e=1775692800&v=beta&t=bPmGJmmNjahlYV2Y232mP48Q7GZOXQZL4oLkjp8ioQs',
    '#1e3a8a',
    true,
    '/src/tismarmobile.MP3',
    '/src/tesmardesktop.MP3',
    true,
    'Gajendra Awasthi',
    'Let''s Create Something Extraordinary Together',
    'Always excited to discuss new projects, innovative ideas, and collaboration opportunities.',
    'March 2026 | Next.js + Supabase CMS Edition'
);

-- 3. Profile
INSERT INTO profile (
    id, name, surname_gradient, avatar_url, headline_typing, description, resume_url, contact_email, social_links, cta_buttons
) VALUES (
    'default',
    'Gajendra',
    'Awasthi',
    'https://i.postimg.cc/bw9X1Z98/Forest-Modern-Minimal-Music-Album-Cover-(2).png',
    '["CS Student", "Content Creator", "Graphics Designer", "Tech Enthusiast", "Cyber Security Enthusiast"]'::jsonb,
    'A visionary Cybersecurity Pioneer and aspiring developer passionate about building secure systems, creating innovative solutions, and exploring emerging technologies.',
    '/src/CV_GajendraAwasthi.pdf',
    'gajendraawasthi456@gmail.com',
    '{
        "linkedin": "https://www.linkedin.com/in/gajendra-awasthi-np/",
        "github": "https://github.com/GajendraAwasthi",
        "tryhackme": "https://tryhackme.com/p/gajendraawasthi",
        "facebook": "https://www.facebook.com/sanuawasthi123",
        "email": "gajendraawasthi456@gmail.com"
    }'::jsonb,
    '{
        "viewWorkText": "View My Work",
        "viewWorkTarget": "projects",
        "terminalButtonText": "Use Terminal",
        "resumeButtonText": "Download CV"
    }'::jsonb
);

-- 4. About Cards
INSERT INTO about_cards (id, icon, title, description, order_index, is_active) VALUES
('about-1', '🔐', 'Cybersecurity Visionary', 'Pioneering secure system design with expertise in IoT security, ethical hacking, penetration testing, and advanced threat mitigation strategies.', 1, true),
('about-2', '💻', 'Aspiring Developer', 'Learning and building web applications with focus on clean code, best practices, and creating scalable solutions for real-world problems.', 2, true),
('about-3', '🎨', 'Creative Designer', 'Crafting visually stunning interfaces with expertise in UI/UX, graphic design, and brand identity using industry-leading design tools.', 3, true);

-- 5. Stats
INSERT INTO stats (id, target_number, suffix, label, order_index, is_active) VALUES
('stat-1', 20, '+', 'Technical Skills', 1, true),
('stat-2', 60, '+', 'Projects Delivered', 2, true),
('stat-3', 13, '', 'Certifications', 3, true),
('stat-4', 2, '', 'Years Experience', 4, true);

-- 6. Education
INSERT INTO education (id, degree, institution, timeline, stream, description, order_index, is_active) VALUES
('edu-1', 'Bachelor of Computer Applications', 'NAST COLLEGE, Pokhara University', '2024 - Present', NULL, 'Pursuing comprehensive degree with focus on practical development, emerging technologies, and cybersecurity fundamentals. Currently maintaining excellent academic performance.', 1, true),
('edu-2', 'Higher Secondary School (+2)', 'NAST Secondary School, NEB Board', '2022 - 2024', 'Management + Computer Science', 'Completed secondary education with strong foundation in management studies and computer science with excellent academic performance.', 2, true),
('edu-3', 'School Education (SEE)', 'Mount Saipal English School', '2006 - 2021', NULL, 'Completed primary and lower secondary education with holistic development approach and strong academic foundation across all subjects.', 3, true);

-- 7. Experience
INSERT INTO experience (id, role, company, duration, description, order_index, is_active) VALUES
('exp-1', 'College Representative', 'Code For Change Far West', 'Jun 2026 - Present', 'Leading tech education initiatives and championing community development projects to foster innovation through technology.', 1, true),
('exp-2', 'Executive Member', 'NAST IT CLUB', 'Oct 2025 - Present', 'Spearheading tech initiatives, organizing educational workshops, and cultivating a community of technology enthusiasts and innovators.', 2, true),
('exp-3', 'Graphic Designer', 'Freelancer', 'Feb 2024 - Present', 'Delivered exceptional creative design solutions including logo design, social media graphics, and brand identity development for diverse clients.', 3, true);

-- 8. Skills
INSERT INTO skills (id, name, percentage, category, order_index, is_active) VALUES
('sk-1', 'HTML/CSS', 90, 'Programming', 1, true),
('sk-2', 'JavaScript', 80, 'Programming', 2, true),
('sk-3', 'C Programming', 85, 'Programming', 3, true),
('sk-4', 'Java', 75, 'Programming', 4, true),
('sk-5', 'Adobe Photoshop', 88, 'Design Tools', 5, true),
('sk-6', 'Figma', 85, 'Design Tools', 6, true),
('sk-7', 'Canva', 92, 'Design Tools', 7, true),
('sk-8', 'VS Code', 90, 'Design Tools', 8, true),
('sk-9', 'Communication', 90, 'Soft Skills', 9, true),
('sk-10', 'Teamwork', 92, 'Soft Skills', 10, true),
('sk-11', 'Time Management', 88, 'Soft Skills', 11, true),
('sk-12', 'Critical Thinking', 85, 'Soft Skills', 12, true);

-- 9. Certifications
INSERT INTO certifications (id, title, image_url, issuer, order_index, is_active) VALUES
('cert-1', 'Field Guide to Human-Centered Design Certificate', '/src/cert-01-field-guide.jpg', 'Acumen Academy', 1, true),
('cert-2', 'AI Skills for Students Certificate', '/src/cert-02-ai-skills.jpg', 'Educational Partner', 2, true),
('cert-3', 'Canva Essentials Certificate', '/src/cert-03-canva-essentials.jpg', 'Canva Design School', 3, true),
('cert-4', 'Scale Creative Campaigns Certificate', '/src/cert-04-creative-campaigns.jpg', 'Creative Hub', 4, true),
('cert-5', 'TryHackMe Cybersecurity Certificate', '/src/cert-05-tryhackme.jpg', 'TryHackMe', 5, true),
('cert-6', 'CFC YHILL Certificate', '/src/cert-06-cfc-yhill.png', 'Code For Change', 6, true),
('cert-7', 'Professional Achievement Certificate', '/src/cert-07-cert.jpg', 'Educational Institution', 7, true),
('cert-8', 'Technology Workshop Certificate', '/src/cert-08-certificate.jpg', 'Tech Community', 8, true),
('cert-9', 'CCSC Cybersecurity Certificate', '/src/cert-09-ccsc.jpg', 'CCSC Nepal', 9, true),
('cert-10', 'Hacktoberfest Open Source Badge', '/src/cert-10-hacktoberfest.png', 'DigitalOcean & GitHub', 10, true),
('cert-11', 'Computer Basics Online Certification', '/src/cert-11-computer-basics.png', 'Online Academy', 11, true),
('cert-12', 'Udemy Hack Network PCs Certificate', '/src/cert-12-udemy-hack-network.jpg', 'Udemy', 12, true),
('cert-13', 'Udemy Hack Network PCs Certificate (Advanced)', '/src/cert-13-udemy-hack-network-alt.jpg', 'Udemy', 13, true);

-- 10. Projects
INSERT INTO projects (id, title, description, team, tags, github_url, live_url, order_index, is_active) VALUES
('proj-1', 'GRAB X AI', 'An intelligent command-line AI chatbot developed in C. Seamlessly integrates with Gemini AI API for smart conversations, maintains persistent chat history, and includes secure password-protected authentication system.', 'Gajendra Awasthi, Bibhu Shrestha, Asmita Bista, Rejina Pujara', '["C Programming", "AI Integration", "API Development", "Authentication"]'::jsonb, 'https://github.com/GajendraAwasthi/Grab-X-AI', '', 1, true);

-- 11. Videos
INSERT INTO videos (id, title, description, youtube_url, embed_id, order_index, is_active) VALUES
('vid-1', 'Git & GitHub Complete Tutorial 🔥 From Zero to Pro | Full Practical Tutorial ✔️', 'Hands-on Practice with Git & GitHub content focused on practical learning and clear explanations.', 'https://www.youtube.com/watch?v=BQjqaXrI2V4', 'BQjqaXrI2V4', 1, true),
('vid-2', 'Make Your Project Live Using GitHub || Nepali Students Guide 🔥', 'Nepali students guide to deploying projects using GitHub Pages and version control.', 'https://www.youtube.com/watch?v=sqKXZwkwJJQ', 'sqKXZwkwJJQ', 2, true);

-- 12. Terminal Commands
INSERT INTO terminal_commands (id, command, output, description, order_index, is_active) VALUES
('cmd-1', 'help', '📋 Available Commands:\n├── about        - Learn about me\n├── skills       - View technical skills\n├── projects     - See my projects\n├── experience   - Professional background\n├── education    - Educational history\n├── contact      - Get in touch\n├── download     - Download CV\n├── clear        - Clear terminal\n└── help         - Show this menu', 'List all available terminal commands', 1, true),
('cmd-2', 'about', '👤 Gajendra Awasthi\nCybersecurity Pioneer & Tech Professional\n\n📚 BCA Student at Pokhara University\n📍 Dhangadhi, Nepal\n\nPassionate about: Building secure systems, innovative solutions & emerging technologies.\nExpertise: Cybersecurity, Web Development, Graphic Design', 'Brief bio and background information', 2, true),
('cmd-3', 'skills', '⚙️  Technical Skills\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n💻 Programming:\n  • HTML/CSS: ████████████░░ 90%\n  • JavaScript: ███████████░░░ 80%\n  • C Programming: ████████████░░ 85%\n  • Java: ███████████░░░ 75%\n\n🎨 Design Tools:\n  • Photoshop: ████████████░░ 88%\n  • Figma: ████████████░░ 85%\n  • Canva: █████████████░ 92%\n  • VS Code: ████████████░░ 90%', 'Technical skills and proficiency overview', 3, true),
('cmd-4', 'projects', '🚀 Featured Projects\n━━━━━━━━━━━━━━━━━━━━━━━━\n\nGRAB X AI - Command-line AI Chatbot\n   Technology: C, Gemini AI API\n   Features: Chat history, Authentication\n   GitHub: github.com/GajendraAwasthi/Grab-X-AI\n\n60+ Other Projects Completed', 'Highlight key projects and repositories', 4, true),
('cmd-5', 'experience', '💼 Professional Experience\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCode For Change Far West - College Representative (Current)\nNAST IT CLUB - Executive Member (Current)\nFreelancer - Graphic Designer (Current)', 'Professional experience and leadership roles', 5, true),
('cmd-6', 'education', '🎓 Educational Background\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nBachelor of Computer Applications (BCA)\nNAST COLLEGE, Pokhara University (2024-Present)\n\nHigher Secondary School (+2)\nNAST Secondary School, NEB Board (2022-2024)\nStream: Management + Computer Science\n\nSchool Education (SEE)\nMount Saipal English School (2006-2021)', 'Academic background and institutions', 6, true),
('cmd-7', 'contact', '📞 Contact Information\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n📧 Email: gajendraawasthi456@gmail.com\n🔗 LinkedIn: linkedin.com/in/gajendra-awasthi-np/\n💻 GitHub: github.com/GajendraAwasthi\n🛡️  TryHackMe: tryhackme.com/p/gajendraawasthi\n👤 Facebook: facebook.com/sanuawasthi123', 'Direct contact links and profiles', 7, true);

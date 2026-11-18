export const BIO = {
    name: "Abdur Rahman Rafi",
    role: "AI & ML Enthusiast | Web Developer | Cybersecurity Enthusiast",
    location: "Dhaka, Bangladesh",
    address: "Dhaka, Bangladesh",
    summary: "Software Developer and Cybersecurity Enthusiast with experience in building secure web applications, AI-powered systems, and enterprise-grade digital solutions.",
    detailed: `Skilled in React, Node.js, Python, Linux, and network security fundamentals, with a proven ability to combine development expertise and security best practices to deliver reliable, user-focused applications.`,
};

export const ASCII_ART = `
      :::::::::      :::     :::::::::: ::::::::::: 
     :+:    :+:   :+: :+:   :+:            :+:      
    +:+    +:+  +:+   +:+  +:+            +:+       
   +#++:++#:  +#++:++#++: +#++:++#       +#+        
  +#+    +#+ +#+     +#+ +#+            +#+         
 #+#    #+# #+#     #+# #+#            #+#          
###    ### ###     ### ###        ###########       
`;

export const SKILLS = [
    { category: "Languages & Frameworks", items: ["JavaScript (ES6+)", "Python", "React.js", "Next.js", "Node.js", "Express.js", "Flask", "Tailwind CSS", "C/C++", "Java", "HTML5/CSS3"] },
    { category: "Databases & Backend", items: ["MySQL", "MongoDB", "Supabase", "PostgreSQL", "RESTful APIs", "Database Design", "JSON Web Tokens (JWT)"] },
    { category: "Security & Systems", items: ["Linux (Ubuntu/Debian)", "Server Hardening", "Vulnerability Assessment", "Penetration Testing", "OWASP Top 10", "Network Administration", "OpenVPN"] },
    { category: "Developer Tools & Core", items: ["Git/GitHub", "Docker", "Postman", "Agile/Scrum", "OOP", "Data Structures & Algorithms", "Problem Solving"] }
];

export const CERTIFICATIONS = [
    {
        title: "Introduction to Cybersecurity",
        issuer: "Cisco Networking Academy",
        date: "2024",
        color: "#3b82f6",
        link: "#",
        icon: "🛡️"
    },
    {
        title: "Python for Data Science & AI",
        issuer: "IBM / Coursera",
        date: "2024",
        color: "#8b5cf6",
        link: "#",
        icon: "🤖"
    },
    {
        title: "Responsive Web Design",
        issuer: "freeCodeCamp",
        date: "2023",
        color: "#06b6d4",
        link: "#",
        icon: "🌐"
    },
    {
        title: "Linux Essentials",
        issuer: "NDG / Cisco",
        date: "2023",
        color: "#10b981",
        link: "#",
        icon: "🐧"
    },
    {
        title: "Machine Learning Specialization",
        issuer: "DeepLearning.AI / Coursera",
        date: "2024",
        color: "#f59e0b",
        link: "#",
        icon: "🧠"
    },
    {
        title: "JavaScript Algorithms & Data Structures",
        issuer: "freeCodeCamp",
        date: "2023",
        color: "#ec4899",
        link: "#",
        icon: "⚡"
    },
];

export const EXPERIENCE = [
    {
        role: "Cybersecurity Analyst & Systems Intern",
        company: "CodemanBD",
        duration: "Jan 2024 – Present",
        description: [
            "Executed web application penetration tests and vulnerability assessments, remediating 15+ high-risk security flaws.",
            "Reduced unauthorized network intrusion attempts by 80% via OpenVPN deployment, firewall policies, and Linux server hardening.",
            "Authored comprehensive vulnerability audit reports, detailing exploit vectors and implementing remediation patches."
        ]
    },
    {
        role: "Frontend Web Developer",
        company: "Webbattalion",
        duration: "Jan 2023 – July 2023",
        description: [
            "Engineered responsive, cross-browser web interfaces using React.js, Tailwind CSS, and JavaScript, boosting load efficiency by 35%.",
            "Spearheaded modular component architectures and integrated RESTful APIs across 5+ client modules, maintaining 99.9% uptime.",
            "Optimized asynchronous state workflows and cross-browser rendering to deliver seamless mobile and desktop experiences."
        ]
    },
    {
        role: "Former President & Lead Web Developer",
        company: "BAFSK Math Club",
        duration: "Jan 2021 – Jan 2025",
        description: [
            "Architected and deployed the official Math Club portal using React and Tailwind CSS, scaling to support 1,200+ active student members.",
            "Integrated Supabase authentication and Role-Based Access Control (RBAC), securing 500+ student profiles and contest entries.",
            "Engineered a Python/Flask and MySQL event management microservice, automating live competition scoring and real-time judge feedback."
        ]
    }
];

export const EDUCATION = [
    {
        degree: "B.Sc. in Computer Science and Engineering",
        institution: "United International University",
        duration: "2022 – Present (10th Trimester)",
        description: "Enrolled | Focus on AI, Web Technologies, and Security Fundamentals"
    },
    {
        degree: "Higher Secondary Certificate (HSC)",
        institution: "BAF Shaheen College Kurmitola",
        duration: "2021",
        description: "GPA: 5.00 / 5.00"
    }
];

export const PROJECTS = [
    {
        title: "BAFSK Math Club Portal",
        description: "Developed an end-to-end portal managing academic registrations, event scheduling, and real-time announcements for 1,200+ members.",
        tech: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        link: "https://github.com/Abdur-Rahman-Rafi/bafsk-math-club"
    },
    {
        title: "UIU CGPA & Scholarship Calculator",
        description: "Developed an algorithmic GPA prediction tool with real-time academic grading logic, serving 800+ university students.",
        tech: ["React", "JavaScript", "Tailwind CSS"],
        link: "https://github.com/Abdur-Rahman-Rafi/uiu-cgpa-calculator"
    },
    {
        title: "Spinal Abnormality Detection",
        description: "Designed an AI diagnostic pipeline using TensorFlow and Scikit-learn to classify MRI biomechanical features with 86% predictive accuracy.",
        tech: ["Python", "TensorFlow", "Scikit-learn", "Machine Learning"],
        link: "https://github.com/Abdur-Rahman-Rafi/spinal-abnormality-detection"
    },
    {
        title: "Prescribo",
        description: "Built a digital e-prescription platform with role-based access for doctors and patients, incorporating encrypted medical record storage.",
        tech: ["React", "Node.js", "Express.js", "MongoDB"],
        link: "https://github.com/Abdur-Rahman-Rafi/prescribo"
    },
    {
        title: "BiteMap",
        description: "Created a table reservation system featuring dynamic seating layouts, real-time availability tracking, and automated booking confirmations.",
        tech: ["React", "Node.js", "MongoDB", "REST APIs"],
        link: "https://github.com/Abdur-Rahman-Rafi/bitemap"
    },
    {
        title: "EduSync",
        description: "Engineered a full-stack campus web ecosystem integrating marketplace, food delivery, and tutoring modules with secure JWT authentication and REST APIs.",
        tech: ["Next.js", "MongoDB", "Express.js", "Tailwind CSS"],
        link: "https://github.com/Abdur-Rahman-Rafi/edusync"
    },
    {
        title: "NewsHub",
        description: "Implemented a live campus notification service aggregating departmental feeds via REST APIs with category-based filtering.",
        tech: ["React", "Node.js", "MongoDB", "News APIs"],
        link: "https://github.com/Abdur-Rahman-Rafi/newshub"
    }
];

export const CONTACT = {
    phone: "+880 1700-000000",
    contactNo: "+880 1700-000000",
    address: "Dhaka, Bangladesh",
    email: "arafi223437@bscse.uiu.ac.bd",
    github: "https://github.com/Abdur-Rahman-Rafi",
    linkedin: "https://www.linkedin.com/in/rafi1438/",
    facebook: "https://www.facebook.com/ma.rahmanii",
};



export const BOOT_LOGS = [
    "[ OK ] Initializing BIOS...",
    "[ OK ] Loading Kernel v5.10.0-hacker",
    "[ OK ] Establishing Secure Neural Link...",
    "[ OK ] Synchronizing Particle Grid...",
    "[ OK ] Loading 3D Terminal Assets...",
    "[ WARN ] Firewall bypassed. Intruder detected.",
    "[ OK ] Access granted. Entering RAFI_SYSTEM.",
    "READY FOR INPUT."
];

export const RESEARCH_PAPERS = [
    {
        title: "Spinal Abnormality Detection Using Advanced Machine Learning Models",
        status: "Published",
        venue: "IEEE International Conference on Machine Learning",
        date: "2024",
        link: "#",
        description: "A comprehensive study on utilizing predictive modeling and deep learning techniques to accurately identify spinal abnormalities from medical imaging data."
    },
    {
        title: "A Novel Approach to Secure VPN Configurations in Linux Environments",
        status: "Unpublished",
        venue: "N/A",
        date: "2024",
        link: "#",
        description: "Exploring advanced server hardening and secure VPN deployment strategies to mitigate unauthorized access attempts effectively."
    }
];

export const DEFAULT_CV_PROFILES = [
    {
        id: "software",
        name: "Software & Web Engineering",
        badge: "Tech / Software",
        role: "Full-Stack Software Developer",
        summary: "Results-driven Software Developer with expertise in React, Node.js, Python, and RESTful architectures. Proven track record engineering responsive web applications, secure authentication workflows, and scalable database schemas. Experienced in end-to-end development, Agile methodologies, and writing clean, maintainable, production-ready code.",
        skillsCategories: ["Languages & Frameworks", "Databases & Backend", "Developer Tools & Core"],
        featuredProjectTitles: ["EduSync", "Prescribo", "BAFSK Math Club Portal"],
        featuredExperienceRoles: ["Frontend Web Developer", "Former President & Lead Web Developer", "Cybersecurity Analyst & Systems Intern"],
        customKeywords: "React, Node.js, Next.js, Python, REST APIs, Git, Tailwind CSS, MongoDB, Full-Stack Architecture, CI/CD, Agile"
    },
    {
        id: "banking",
        name: "Banking & Enterprise IT",
        badge: "Bank / Enterprise",
        role: "IT Officer / Enterprise Systems Specialist",
        summary: "Computer Science graduate specializing in database management (MySQL, MongoDB), enterprise network security, and structured application development. Experienced in handling data-driven workflows, system reliability, user authentication, and server uptime. Strong analytical acumen with proven organizational leadership experience.",
        skillsCategories: ["Databases & Backend", "Security & Systems", "Languages & Frameworks", "Developer Tools & Core"],
        featuredProjectTitles: ["UIU CGPA & Scholarship Calculator", "BAFSK Math Club Portal", "EduSync"],
        featuredExperienceRoles: ["Former President & Lead Web Developer", "Cybersecurity Analyst & Systems Intern", "Frontend Web Developer"],
        customKeywords: "Database Management, MySQL, Network Administration, Linux Security, System Auditing, Problem Solving, Leadership, SQL"
    },
    {
        id: "cybersecurity",
        name: "Cybersecurity & Systems",
        badge: "Security / Infra",
        role: "Cybersecurity Analyst & Systems Specialist",
        summary: "Security-focused technologist with hands-on experience in vulnerability assessment, penetration testing, and Linux server hardening. Cisco certified in Cybersecurity with practical expertise in remediating OWASP web vulnerabilities, securing VPN infrastructure, and implementing defense-in-depth protocols.",
        skillsCategories: ["Security & Systems", "Developer Tools & Core", "Languages & Frameworks"],
        featuredProjectTitles: ["BAFSK Math Club Portal", "Prescribo", "Spinal Abnormality Detection"],
        featuredExperienceRoles: ["Cybersecurity Analyst & Systems Intern", "Former President & Lead Web Developer", "Frontend Web Developer"],
        customKeywords: "Vulnerability Assessment, Penetration Testing, Linux Hardening, Network Security, Cisco Certified, OpenVPN, OWASP Top 10"
    },
    {
        id: "general",
        name: "General & Corporate Management",
        badge: "Corporate / General",
        role: "Management Trainee / Operations & Project Specialist",
        summary: "Dynamic and analytical Computer Science graduate with proven leadership, organizational management, and public communication experience as Student Club President. Experienced in coordinating cross-functional teams, overseeing digital operations, optimizing administrative workflows, and driving data-informed decisions. Adept at bridging technical systems with core business operations in corporate environments.",
        skillsCategories: ["Developer Tools & Core", "Databases & Backend", "Languages & Frameworks"],
        featuredProjectTitles: ["UIU CGPA & Scholarship Calculator", "BAFSK Math Club Portal", "EduSync"],
        featuredExperienceRoles: ["Former President & Lead Web Developer", "Frontend Web Developer", "Cybersecurity Analyst & Systems Intern"],
        customKeywords: "Project Management, Operations, Leadership, Team Coordination, Data Analysis, Strategic Planning, Public Speaking, Problem Solving"
    },
    {
        id: "internship",
        name: "IT & Technology Internship",
        badge: "Internship / Trainee",
        role: "Software Engineering & IT Intern",
        summary: "Energetic Computer Science undergraduate at United International University with a strong academic foundation and practical experience in full-stack web development, Python, relational databases, and system security fundamentals. Quick learner and former student organization President with demonstrated teamwork and problem-solving abilities. Eager to contribute to real-world engineering challenges, learn from senior mentors, and accelerate team goals as a dedicated intern.",
        skillsCategories: ["Languages & Frameworks", "Databases & Backend", "Security & Systems", "Developer Tools & Core"],
        featuredProjectTitles: ["EduSync", "BAFSK Math Club Portal", "UIU CGPA & Scholarship Calculator"],
        featuredExperienceRoles: ["Frontend Web Developer", "Cybersecurity Analyst & Systems Intern", "Former President & Lead Web Developer"],
        customKeywords: "Software Engineering Intern, IT Intern, Fast Learner, Problem Solving, Computer Science Student, Teamwork, Adaptability, Academic Excellence"
    }
];


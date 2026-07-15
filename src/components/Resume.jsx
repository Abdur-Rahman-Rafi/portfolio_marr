import React from 'react';
import { BIO as FALLBACK_BIO, SKILLS as FALLBACK_SKILLS, PROJECTS as FALLBACK_PROJECTS, CONTACT as FALLBACK_CONTACT, EXPERIENCE as FALLBACK_EXPERIENCE, EDUCATION as FALLBACK_EDUCATION } from '../constants/content';
import { Download, X, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Resume = ({ 
    onClose,
    bio: BIO = FALLBACK_BIO,
    skills: SKILLS = FALLBACK_SKILLS,
    projects: PROJECTS = FALLBACK_PROJECTS,
    contact: CONTACT = FALLBACK_CONTACT,
    experience: EXPERIENCE = FALLBACK_EXPERIENCE,
    education: EDUCATION = FALLBACK_EDUCATION
}) => {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handlePrint = async () => {
        setIsGenerating(true);
        const element = document.getElementById('resume-pdf-content');
        
        // Hide UI elements during generation just in case
        const opt = {
            margin: 0,
            filename: `${BIO?.name?.replace(/\s+/g, '_') || 'Resume'}_CV.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!BIO || !EXPERIENCE || !EDUCATION) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white text-red-600 font-bold">
                DATA LOADING ERROR: CONTENT MISSING
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] overflow-y-auto font-sans print:static print:bg-white print:h-auto print:overflow-visible resume-modal-wrapper">
            {/* Fixed Backdrop */}
            <div
                className="fixed inset-0 bg-gray-100/50 backdrop-blur-sm print:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Scrollable Container */}
            <div className="relative min-h-full flex justify-center py-8 z-10 pointer-events-none print:p-0 print:block">
                {/* Control Bar - Hidden when printing */}
                <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50 pointer-events-auto d-print-none">
                    <style>{`
                        @page { margin: 0; }
                        @media print {
                            .print\\:hidden, .d-print-none { display: none !important; }
                        }
                    `}</style>
                    <button
                        onClick={handlePrint}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-black transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {isGenerating ? 'Generating...' : 'Save PDF'}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-200 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors shadow-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Resume Content - A4 Format simulation */}
                <div
                    id="resume-pdf-content"
                    onClick={(e) => e.stopPropagation()}
                    className="resume-paper w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl print:shadow-none print:m-0 print:w-full print:h-[297mm] print:p-[10mm] print:overflow-hidden isolate pointer-events-auto"
                    style={{ color: 'black', backgroundColor: '#ffffff', opacity: 1, zIndex: 10 }} // Ensure z-index is explicit
                >
                    {/* Header */}
                    <header className="border-b-[3px] border-gray-900 pb-6 mb-8 print:pb-3 print:mb-4">
                        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-gray-900 mb-2 print:text-3xl print:mb-1">{BIO?.name || "Name"}</h1>
                        <p className="text-xl font-medium text-gray-600 mb-4 print:text-lg print:mb-2">{BIO?.role || "Role"}</p>
                        <div className="flex flex-wrap text-sm text-gray-600 gap-y-2 gap-x-4 font-medium print:text-xs print:gap-x-3">
                            <span className="flex items-center gap-1">{BIO?.location}</span>
                            <span>|</span>
                            <a href={`mailto:${CONTACT?.email}`} className="text-blue-700 hover:underline">{CONTACT?.email}</a>
                            <span>|</span>
                            <a href={CONTACT?.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">LinkedIn</a>
                            <span>|</span>
                            <a href={CONTACT?.github} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">GitHub</a>
                        </div>
                    </header>

                    {/* Summary */}
                    <section className="mb-8 print:mb-4">
                        <h3 className="text-md font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-3 print:pb-0 print:mb-2 print:text-sm">Professional Summary</h3>
                        <p className="text-gray-800 leading-relaxed text-sm text-justify print:text-xs">
                            {BIO?.summary} {BIO?.detailed?.replace(/\n/g, ' ')}
                        </p>
                    </section>

                    {/* Skills */}
                    <section className="mb-8 print:mb-4">
                        <h3 className="text-md font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-3 print:pb-0 print:mb-2 print:text-sm">Technical Skills</h3>
                        <div className="grid grid-cols-1 gap-y-2 text-sm print:text-xs print:gap-y-1">
                            {SKILLS?.map((skillGroup, index) => (
                                <div key={index} className="grid grid-cols-[120px_1fr] items-baseline print:grid-cols-[100px_1fr]">
                                    <span className="font-bold text-gray-900">{skillGroup.category}</span>
                                    <span className="text-gray-700">{skillGroup.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="mb-6 print:mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-3 print:mb-2 print:pb-0">Experience</h3>
                        {EXPERIENCE?.map((exp, index) => (
                            <div key={index} className="mb-5 last:mb-0 break-inside-avoid print:mb-3">
                                <div className="flex justify-between items-baseline mb-1 flex-wrap">
                                    <h4 className="font-bold text-gray-900 text-md print:text-sm">{exp.role}</h4>
                                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-2 print:text-xs">{exp.duration}</span>
                                </div>
                                <div className="text-sm font-medium text-blue-800 mb-2 italic print:mb-1 print:text-xs">{exp.company}</div>
                                <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed print:text-xs print:space-y-0.5">
                                    {exp.description?.map((desc, i) => (
                                        <li key={i} className="pl-1">{desc}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>

                    {/* Projects */}
                    <section className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-3">Featured Projects</h3>
                        {PROJECTS?.map((project, index) => (
                            <div key={index} className="mb-4 last:mb-0 break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{project.title}</h4>
                                    <div className="hidden sm:block text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{project.tech.join(' • ')}</div>
                                </div>
                                <p className="text-sm text-gray-700 mb-1 leading-relaxed">{project.description}</p>
                                <div className="sm:hidden text-xs text-gray-500 font-mono mt-1 mb-1">{project.tech.join(' • ')}</div>
                                {project.link !== '#' && (
                                    <a href={project.link} className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium">View Project &rarr;</a>
                                )}
                            </div>
                        ))}
                    </section>

                    {/* Education */}
                    <section className="mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-3">Education</h3>
                        {EDUCATION?.map((edu, index) => (
                            <div key={index} className="flex justify-between items-start mb-3 last:mb-0 break-inside-avoid">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{edu.institution}</h4>
                                    <p className="text-sm text-gray-700">{edu.degree}</p>
                                    {edu.description && <p className="text-xs text-gray-500 mt-0.5">{edu.description}</p>}
                                </div>
                                <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-4">{edu.duration}</span>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Precise Print Styles */}

            </div>
        </div>
    );
};

export default Resume;

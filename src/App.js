import React, { useState, useRef } from 'react';
import { Download, Sparkles, User, Briefcase, GraduationCap, Award, Mail, Phone, MapPin, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AIResumeBuilder() {
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [{ company: '', position: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '', details: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '' }]
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const resumeRef = useRef(null);

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleArrayItemChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section) => {
    const templates = {
      experience: { company: '', position: '', duration: '', description: '' },
      education: { institution: '', degree: '', year: '', details: '' },
      skills: '',
      projects: { title: '', description: '', technologies: '' }
    };
    
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], templates[section]]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = (field, value) => {
    const suggestions = {
      summary: [
        "Results-driven professional with expertise in modern web technologies",
        "Innovative developer skilled in building scalable applications",
        "Detail-oriented engineer passionate about creating user-centric solutions"
      ],
      description: [
        "Developed and maintained responsive web applications using React and Node.js",
        "Collaborated with cross-functional teams to deliver high-quality software solutions",
        "Implemented CI/CD pipelines reducing deployment time by 40%",
        "Optimized application performance resulting in 50% faster load times"
      ],
      skills: [
        "React.js, Node.js, JavaScript, TypeScript",
        "Python, Django, FastAPI, PostgreSQL",
        "AWS, Docker, Kubernetes, CI/CD",
        "Git, Agile, Scrum, REST APIs"
      ]
    };

    const relevantSuggestions = suggestions[field] || [];
    setAiSuggestions(relevantSuggestions);
  };

  const applySuggestion = (suggestion, field, section, index = null) => {
    if (section === 'personalInfo') {
      handlePersonalInfoChange(field, suggestion);
    } else if (index !== null) {
      handleArrayItemChange(section, index, field, suggestion);
    }
    setAiSuggestions([]);
  };

  const exportToPDF = async () => {
    const element = resumeRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save('resume.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-indigo-600" />
            AI Resume Builder
          </h1>
          <p className="text-gray-600">Create ATS-friendly resumes with AI-powered suggestions</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['personal', 'experience', 'education', 'skills', 'projects'].map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    activeSection === section
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                    <textarea
                      value={formData.personalInfo.summary}
                      onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                      onFocus={() => generateAISuggestions('summary')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24"
                      placeholder="Brief professional summary..."
                    />
                    {aiSuggestions.length > 0 && (
                      <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs font-medium text-indigo-900 mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> AI Suggestions:
                        </p>
                        {aiSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => applySuggestion(suggestion, 'summary', 'personalInfo')}
                            className="block w-full text-left text-sm text-gray-700 hover:bg-indigo-100 p-2 rounded mb-1"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">Experience {index + 1}</h3>
                        {formData.experience.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('experience', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Company Name"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleArrayItemChange('experience', index, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Position"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleArrayItemChange('experience', index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Jan 2020 - Present"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
                          onFocus={() => generateAISuggestions('description')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                          placeholder="Key responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('experience')}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Experience
                  </button>
                </div>
              )}

              {activeSection === 'education' && (
                <div className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">Education {index + 1}</h3>
                        {formData.education.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('education', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Institution Name"
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Degree / Certification"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => handleArrayItemChange('education', index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Year"
                        />
                        <textarea
                          value={edu.details}
                          onChange={(e) => handleArrayItemChange('education', index, 'details', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-16"
                          placeholder="Additional details (GPA, honors, etc.)"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('education')}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Education
                  </button>
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="space-y-4">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayItemChange('skills', index, null, e.target.value)}
                        onFocus={() => generateAISuggestions('skills')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., React.js, Python, AWS"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('skills', index)}
                          className="px-3 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('skills')}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Skill
                  </button>
                  {aiSuggestions.length > 0 && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs font-medium text-indigo-900 mb-2 flex items-center gap-1">
                        <Sparkles size={12} /> Popular Skill Sets:
                      </p>
                      {aiSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const skills = suggestion.split(',').map(s => s.trim());
                            setFormData(prev => ({ ...prev, skills }));
                            setAiSuggestions([]);
                          }}
                          className="block w-full text-left text-sm text-gray-700 hover:bg-indigo-100 p-2 rounded mb-1"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="space-y-6">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">Project {index + 1}</h3>
                        {formData.projects.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('projects', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => handleArrayItemChange('projects', index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Project Title"
                        />
                        <textarea
                          value={project.description}
                          onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                          placeholder="Project description and key achievements..."
                        />
                        <input
                          type="text"
                          value={project.technologies}
                          onChange={(e) => handleArrayItemChange('projects', index, 'technologies', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Technologies used (e.g., React, Node.js)"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('projects')}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Preview</h2>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>

            <div ref={resumeRef} className="bg-white p-8 border border-gray-200 rounded-lg">
              {/* Header */}
              <div className="text-center border-b-2 border-indigo-600 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formData.personalInfo.name || 'Your Name'}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  {formData.personalInfo.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={14} /> {formData.personalInfo.email}
                    </span>
                  )}
                  {formData.personalInfo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {formData.personalInfo.phone}
                    </span>
                  )}
                  {formData.personalInfo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {formData.personalInfo.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {formData.personalInfo.summary && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <User size={18} /> PROFESSIONAL SUMMARY
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">{formData.personalInfo.summary}</p>
                </div>
              )}

              {/* Experience */}
              {formData.experience.some(exp => exp.company || exp.position) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Briefcase size={18} /> EXPERIENCE
                  </h2>
                  {formData.experience.map((exp, index) => (
                    (exp.company || exp.position) && (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900">{exp.position || 'Position'}</h3>
                          <span className="text-sm text-gray-600">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 italic">{exp.company}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Education */}
              {formData.education.some(edu => edu.institution || edu.degree) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <GraduationCap size={18} /> EDUCATION
                  </h2>
                  {formData.education.map((edu, index) => (
                    (edu.institution || edu.degree) && (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                          <span className="text-sm text-gray-600">{edu.year}</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">{edu.institution}</p>
                        {edu.details && <p className="text-sm text-gray-700 mt-1">{edu.details}</p>}
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Skills */}
              {formData.skills.some(skill => skill.trim()) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Award size={18} /> SKILLS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.filter(skill => skill.trim()).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {formData.projects.some(proj => proj.title) && (
                <div>
                  <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Award size={18} /> PROJECTS
                  </h2>
                  {formData.projects.map((project, index) => (
                    project.title && (
                      <div key={index} className="mb-4">
                        <h3 className="font-bold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-700 mb-1 leading-relaxed">{project.description}</p>
                        {project.technologies && (
                          <p className="text-sm text-indigo-700 italic">Technologies: {project.technologies}</p>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
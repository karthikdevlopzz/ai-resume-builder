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
  const [targetRole, setTargetRole] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [atsScore, setAtsScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
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

  const roleBasedKeywords = {
    'Software Engineer': ['algorithms', 'data structures', 'scalable', 'optimized', 'API', 'microservices', 'testing', 'debugging'],
    'Frontend Developer': ['responsive', 'UI/UX', 'accessibility', 'React', 'TypeScript', 'performance optimization', 'cross-browser'],
    'Backend Developer': ['database', 'API design', 'security', 'scalability', 'cloud', 'serverless', 'authentication'],
    'Full Stack Developer': ['end-to-end', 'full-stack', 'deployment', 'CI/CD', 'database design', 'RESTful', 'integration'],
    'Data Scientist': ['machine learning', 'statistical analysis', 'Python', 'data visualization', 'predictive models', 'SQL', 'TensorFlow'],
    'Product Manager': ['roadmap', 'stakeholder', 'metrics', 'user research', 'agile', 'prioritization', 'cross-functional'],
    'DevOps Engineer': ['automation', 'CI/CD', 'containerization', 'monitoring', 'infrastructure', 'Kubernetes', 'cloud'],
  };

  const calculateATSScore = () => {
    if (!targetRole) return 0;
    const keywords = roleBasedKeywords[targetRole] || [];
    const resumeText = JSON.stringify(formData).toLowerCase();
    const matchedKeywords = keywords.filter(kw => resumeText.includes(kw.toLowerCase()));
    const score = Math.min(100, Math.round((matchedKeywords.length / keywords.length) * 100));
    
    const newFeedback = [];
    if (score < 60) newFeedback.push('⚠️ Add more role-specific keywords');
    if (formData.personalInfo.summary.split(' ').length < 30) newFeedback.push('⚠️ Summary should be 30-50 words');
    if (formData.skills.filter(s => s.trim()).length < 5) newFeedback.push('⚠️ Add at least 8-12 skills');
    if (!formData.experience.some(e => e.description.includes('%') || /\d+/.test(e.description))) {
      newFeedback.push('💡 Add quantifiable achievements (numbers, percentages)');
    }
    
    setFeedback(newFeedback);
    return score;
  };

  const generateAISuggestions = (field, value) => {
    const roleSuggestions = {
      'Software Engineer': {
        summary: [
          "Software Engineer with 3+ years building scalable systems using modern frameworks and microservices architecture",
          "Results-driven engineer specializing in algorithm optimization and distributed systems design"
        ],
        description: [
          "Architected and deployed microservices handling 10M+ requests daily with 99.9% uptime",
          "Optimized database queries reducing response time by 60% and improving system throughput",
          "Led code reviews and mentored 5 junior developers in best practices and clean code principles"
        ]
      },
      'Frontend Developer': {
        summary: [
          "Frontend Developer specializing in React and TypeScript, creating responsive and accessible web applications",
          "UI-focused engineer with expertise in performance optimization and modern design systems"
        ],
        description: [
          "Built responsive React applications serving 500K+ users with 95+ Lighthouse scores",
          "Implemented design system components reducing development time by 40%",
          "Enhanced accessibility compliance achieving WCAG 2.1 AA standards across all products"
        ]
      },
      'Data Scientist': {
        summary: [
          "Data Scientist with expertise in machine learning and predictive analytics, delivering data-driven insights",
          "ML engineer specializing in NLP and computer vision with Python and TensorFlow"
        ],
        description: [
          "Developed predictive models improving forecast accuracy by 35% using ensemble methods",
          "Built recommendation system increasing user engagement by 25% using collaborative filtering",
          "Automated data pipelines processing 10TB+ data daily with Apache Spark"
        ]
      }
    };

    const defaultSuggestions = {
      summary: [
        "Results-driven professional with expertise in modern technologies and proven track record of success",
        "Innovative problem-solver skilled in delivering high-impact solutions and exceeding goals"
      ],
      description: [
        "Collaborated with cross-functional teams to deliver projects 20% ahead of schedule",
        "Implemented automation reducing manual work by 50% and improving efficiency",
        "Led initiatives resulting in 30% improvement in key performance metrics"
      ],
      skills: [
        "React.js, Node.js, JavaScript, TypeScript, Git, Agile",
        "Python, Django, PostgreSQL, Docker, AWS, CI/CD"
      ]
    };

    const suggestions = targetRole && roleSuggestions[targetRole] 
      ? roleSuggestions[targetRole] 
      : defaultSuggestions;
    
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What role are you applying for?</h2>
              <p className="text-gray-600">Choose your target position to get AI-powered, role-specific suggestions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.keys(roleBasedKeywords).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setTargetRole(role);
                    setShowRoleModal(false);
                  }}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">{role}</div>
                  <div className="text-sm text-gray-500">Get tailored suggestions</div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 pt-6">
          <div className="inline-block mb-4">
            <div className="flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur-md px-6 py-3 rounded-full border border-white border-opacity-20">
              <Sparkles className="text-yellow-400" size={24} />
              <span className="text-white font-semibold">AI-Powered</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Resume Builder
          </h1>
          <p className="text-gray-300 text-lg">Create ATS-optimized resumes that get you hired</p>
          
          {targetRole && (
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-500 bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-400 border-opacity-30">
              <span className="text-indigo-200 text-sm">Target Role:</span>
              <span className="text-white font-semibold">{targetRole}</span>
              <button 
                onClick={() => setShowRoleModal(true)}
                className="ml-2 text-indigo-300 hover:text-white text-xs underline"
              >
                Change
              </button>
            </div>
          )}
        </header>

        {/* ATS Score Card */}
        {targetRole && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">ATS Compatibility Score</h3>
                <p className="text-indigo-100 text-sm">How well your resume matches {targetRole} requirements</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-1">{atsScore}%</div>
                <div className="text-indigo-100 text-sm">
                  {atsScore >= 80 ? '✨ Excellent' : atsScore >= 60 ? '👍 Good' : '⚠️ Needs Work'}
                </div>
              </div>
            </div>
            {feedback.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="space-y-2">
                  {feedback.map((item, idx) => (
                    <div key={idx} className="text-white text-sm bg-white bg-opacity-10 px-3 py-2 rounded-lg">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setAtsScore(calculateATSScore())}
              className="mt-4 w-full bg-white text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition"
            >
              Recalculate Score
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['personal', 'experience', 'education', 'skills', 'projects'].map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeSection === section
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
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
                      <div className="mt-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm">
                        <p className="text-xs font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                          <Sparkles size={16} className="text-indigo-600" /> 
                          AI Suggestions for {targetRole || 'Your Role'}:
                        </p>
                        {aiSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => applySuggestion(suggestion, 'summary', 'personalInfo')}
                            className="block w-full text-left text-sm text-gray-700 hover:bg-white p-3 rounded-lg mb-2 transition-all border border-transparent hover:border-indigo-300 hover:shadow-md"
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
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="text-indigo-600" />
                Live Preview
              </h2>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download size={18} />
                Export PDF
              </button>
            </div>

            <div ref={resumeRef} className="bg-white p-8 border-2 border-gray-200 rounded-xl shadow-inner">
              {/* Header */}
              <div className="text-center border-b-4 border-gradient-to-r from-indigo-600 to-purple-600 pb-4 mb-6" style={{borderImage: 'linear-gradient(to right, #4f46e5, #9333ea) 1'}}>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {formData.personalInfo.name || 'Your Name'}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  {formData.personalInfo.email && (
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <Mail size={14} className="text-indigo-600" /> {formData.personalInfo.email}
                    </span>
                  )}
                  {formData.personalInfo.phone && (
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <Phone size={14} className="text-indigo-600" /> {formData.personalInfo.phone}
                    </span>
                  )}
                  {formData.personalInfo.location && (
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                      <MapPin size={14} className="text-indigo-600" /> {formData.personalInfo.location}
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
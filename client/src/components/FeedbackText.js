import { useState, useEffect } from 'react';
import { Download, Play, AlertCircle, CheckCircle, Info, ChevronDown, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import Sidebar from './reusable/Sidebar';

export default function WrittenCommunicationFeedbackReport() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [expandedError, setExpandedError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get analysis result from navigation state
  useEffect(() => {
    if (location.state?.analysisResult) {
      setAnalysisData(location.state.analysisResult);
      setLoading(false);
    } else {
      console.error('No analysis data received');
      setLoading(false);
    }
  }, [location.state]);

  // Function to get score color based on value (0-10 scale)
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-300';
    if (score >= 8) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 6) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    if (score >= 4) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gradient-to-r from-red-500 to-rose-500';
  };

  // Function to get border color based on score
  const getBorderColor = (score) => {
    if (score === null || score === undefined) return 'border-gray-300';
    if (score >= 8) return 'border-green-200';
    if (score >= 6) return 'border-yellow-200';
    if (score >= 4) return 'border-orange-200';
    return 'border-red-200';
  };

  // Function to get score label
  const getScoreLabel = (score) => {
    if (score === null || score === undefined) return 'Not Analyzed';
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Work';
  };

  // Get grammar and spelling errors
  const getGrammarSpellingErrors = () => {
    return analysisData?.analysis?.categories?.grammar_spelling?.detailed_errors?.all_errors || [];
  };

  // Function to highlight error in context
  const highlightErrorInContext = (error) => {
    if (!error.context || error.offset === undefined || error.length === undefined) {
      return error.context;
    }

    const before = error.context.slice(0, error.offset);
    const errorText = error.context.slice(error.offset, error.offset + error.length);
    const after = error.context.slice(error.offset + error.length);

    return (
      <>
        {before}
        <mark className="bg-red-200 text-red-900 px-1 rounded border border-red-300 font-medium">
          {errorText}
        </mark>
        {after}
      </>
    );
  };

  // Function to handle report download in TXT format
  const handleDownloadTxt = () => {
    if (!analysisData) return;

    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    downloadFile(blob, 'written_communication_analysis_report.txt');
    setDownloadDropdown(false);
  };

  // Function to handle report download in PDF format
  const handleDownloadPdf = async () => {
    if (!analysisData) return;

    try {
      const reportContent = generateReportContent();
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Written Communication Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { color: #5B67CA; border-bottom: 2px solid #5B67CA; padding-bottom: 10px; }
              h2 { color: #374151; margin-top: 25px; }
              .section { margin: 20px 0; }
              .score { background: #f8f9fa; padding: 10px; border-left: 4px solid #5B67CA; }
              ul { margin: 10px 0; }
              li { margin: 5px 0; }
              .footer { margin-top: 40px; font-size: 12px; color: #6B7280; text-align: center; }
              .error { background: #fef2f2; padding: 10px; margin: 10px 0; border-left: 4px solid #dc2626; }
              .suggestion { color: #059669; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>EXPRESSLY - WRITTEN COMMUNICATION ANALYSIS FEEDBACK REPORT</h1>
            <div class="section">
              <p><strong>Analyzed:</strong> ${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString()}</p>
              <p><strong>Overall Score:</strong> ${analysisData.analysis?.overall_score ?? 'N/A'}/10</p>
              <p><strong>Quality Label:</strong> ${analysisData.analysis?.quality_label ?? 'UNKNOWN'}</p>
              ${analysisData.metadata?.wordCount ? `<p><strong>Word Count:</strong> ${analysisData.metadata.wordCount}</p>` : ''}
              ${analysisData.metadata?.fileName ? `<p><strong>File:</strong> ${analysisData.metadata.fileName}</p>` : ''}
            </div>
            ${generateHTMLReportContent()}
            <div class="footer">
              Generated by Expressly on ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error generating PDF:', error);
      handleDownloadTxt();
    }
    setDownloadDropdown(false);
  };

  // Function to handle report download in DOCX format
  const handleDownloadDocx = async () => {
    if (!analysisData) return;

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "EXPRESSLY - WRITTEN COMMUNICATION ANALYSIS FEEDBACK REPORT",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            
            // Analysis information
            new Paragraph({
              children: [
                new TextRun({
                  text: "Analyzed: ",
                  bold: true
                }),
                new TextRun({
                  text: `${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString()}`
                })
              ],
              spacing: { after: 200 }
            }),
            
            // Overall Score
            new Paragraph({
              children: [
                new TextRun({
                  text: "Overall Score: ",
                  bold: true
                }),
                new TextRun({
                  text: `${analysisData.analysis?.overall_score ?? 'N/A'}/10`
                })
              ],
              spacing: { after: 200 }
            }),
            
            // Quality Label
            new Paragraph({
              children: [
                new TextRun({
                  text: "Quality Label: ",
                  bold: true
                }),
                new TextRun({
                  text: `${analysisData.analysis?.quality_label ?? 'UNKNOWN'}`
                })
              ],
              spacing: { after: 400 }
            }),
            
            // Detailed Metrics Heading
            new Paragraph({
              text: "DETAILED METRICS",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 }
            }),
            
            // Metrics - Extract from categories
            ...Object.entries(analysisData.analysis?.categories || {}).map(([category, data]) => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${formatCategoryName(category)}: ${data.score}/10 - ${getScoreLabel(data.score)}`
                  })
                ],
                spacing: { after: 100 }
              })
            ),
            
            // Grammar & Spelling Errors
            ...(getGrammarSpellingErrors().length > 0 ? [
              new Paragraph({
                text: "GRAMMAR & SPELLING ERRORS",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
              }),
              ...getGrammarSpellingErrors().map(error => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${error.category}: ${error.message}`,
                      bold: true
                    })
                  ],
                  spacing: { after: 100 }
                })
              )
            ] : []),
            
            // Performance Summary Heading
            new Paragraph({
              text: "PERFORMANCE SUMMARY",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 }
            }),
            
            // Strengths (from suggestions or high scores)
            new Paragraph({
              children: [
                new TextRun({
                  text: "Strengths:",
                  bold: true
                })
              ],
              spacing: { after: 100 }
            }),
            ...getStrengths().map(strength => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${strength}`
                  })
                ],
                spacing: { after: 100 }
              })
            ),
            
            // Areas for Improvement
            new Paragraph({
              children: [
                new TextRun({
                  text: "Areas for Improvement:",
                  bold: true
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            ...(analysisData.key_improvement_areas?.map(area => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${area}`
                  })
                ],
                spacing: { after: 100 }
              })
            ) || [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• Focus on improving writing clarity and structure"
                  })
                ],
                spacing: { after: 100 }
              })
            ]),
            
            // Recommendations
            new Paragraph({
              children: [
                new TextRun({
                  text: "Recommendations:",
                  bold: true
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            ...(analysisData.suggestions?.map(suggestion => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${suggestion.replace(/[🔗📝**]/g, '').trim()}`
                  })
                ],
                spacing: { after: 100 }
              })
            ) || [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "• Keep practicing and reviewing your writing"
                  })
                ],
                spacing: { after: 100 }
              })
            ]),
            
            // Footer
            new Paragraph({
              text: `Generated by Expressly on ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { before: 600 }
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      downloadFile(blob, 'written_communication_analysis_report.docx');
      
    } catch (error) {
      console.error('Error generating DOCX:', error);
      const reportContent = generateReportContent();
      const blob = new Blob([reportContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      downloadFile(blob, 'written_communication_analysis_report.docx');
    }
    setDownloadDropdown(false);
  };

  // Helper function to generate report content
  const generateReportContent = () => {
    const categories = analysisData.analysis?.categories || {};
    const grammarErrors = getGrammarSpellingErrors();
    
    return `
EXPRESSLY - WRITTEN COMMUNICATION ANALYSIS FEEDBACK REPORT

Analyzed: ${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString()}
Overall Score: ${analysisData.analysis?.overall_score ?? 'N/A'}/10
Quality Label: ${analysisData.analysis?.quality_label ?? 'UNKNOWN'}
${analysisData.metadata?.wordCount ? `Word Count: ${analysisData.metadata.wordCount}` : ''}
${analysisData.metadata?.fileName ? `File: ${analysisData.metadata.fileName}` : ''}

DETAILED METRICS:
${Object.entries(categories).map(([category, data]) => 
  `- ${formatCategoryName(category)}: ${data.score}/10 - ${getScoreLabel(data.score)}`
).join('\n')}

${grammarErrors.length > 0 ? `
GRAMMAR & SPELLING ERRORS (${grammarErrors.length} found):
${grammarErrors.map((error, index) => 
  `Error ${index + 1}: [${error.category}]
   Message: ${error.message}
   Context: ${error.context}
   ${error.suggestions?.length ? `Suggestion: Use "${error.suggestions.join(', ')}"` : ''}
`).join('\n')}
` : ''}

PERFORMANCE SUMMARY:
Strengths:
${getStrengths().map(strength => `  • ${strength}`).join('\n')}

Areas for Improvement:
${analysisData.key_improvement_areas?.map(area => `  • ${area}`).join('\n') || '  • Focus on improving writing clarity and structure'}

Recommendations:
${analysisData.suggestions?.map(suggestion => `  • ${suggestion.replace(/[🔗📝**]/g, '').trim()}`).join('\n') || '  • Keep practicing and reviewing your writing'}

DETAILED FEEDBACK:
${Object.entries(categories).map(([category, data]) => 
  data.improvement_tips?.length ? 
    `${formatCategoryName(category)} Analysis:\n${data.improvement_tips.map(tip => `  • ${tip}`).join('\n')}` : 
    ''
).filter(Boolean).join('\n\n')}
    `.trim();
  };

  // Helper function to generate HTML content for PDF
  const generateHTMLReportContent = () => {
    const categories = analysisData.analysis?.categories || {};
    const grammarErrors = getGrammarSpellingErrors();
    
    return `
      <div class="section">
        <h2>DETAILED METRICS</h2>
        <ul>
          ${Object.entries(categories).map(([category, data]) => 
            `<li>${formatCategoryName(category)}: ${data.score}/10 - ${getScoreLabel(data.score)}</li>`
          ).join('')}
        </ul>
      </div>

      ${grammarErrors.length > 0 ? `
      <div class="section">
        <h2>GRAMMAR & SPELLING ERRORS (${grammarErrors.length} found)</h2>
        ${grammarErrors.map((error, index) => `
          <div class="error">
            <strong>Error ${index + 1}: [${error.category}]</strong><br>
            <strong>Message:</strong> ${error.message}<br>
            <strong>Context:</strong> ${error.context}<br>
            ${error.suggestions?.length ? `<strong class="suggestion">Suggestion:</strong> Use "${error.suggestions.join(', ')}"` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="section">
        <h2>PERFORMANCE SUMMARY</h2>
        <h3>Strengths:</h3>
        <ul>
          ${getStrengths().map(strength => `<li>${strength}</li>`).join('')}
        </ul>

        <h3>Areas for Improvement:</h3>
        <ul>
          ${analysisData.key_improvement_areas?.map(area => `<li>${area}</li>`).join('') || '<li>Focus on improving writing clarity and structure</li>'}
        </ul>

        <h3>Recommendations:</h3>
        <ul>
          ${analysisData.suggestions?.map(suggestion => `<li>${suggestion.replace(/[🔗📝**]/g, '').trim()}</li>`).join('') || '<li>Keep practicing and reviewing your writing</li>'}
        </ul>
      </div>

      <div class="section">
        <h2>DETAILED FEEDBACK</h2>
        ${Object.entries(categories).map(([category, data]) => 
          data.improvement_tips?.length ? 
            `<h3>${formatCategoryName(category)} Analysis:</h3><ul>${data.improvement_tips.map(tip => `<li>${tip}</li>`).join('')}</ul>` : 
            ''
        ).filter(Boolean).join('')}
      </div>
    `;
  };

  // Helper function to download files
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Helper function to format category names
  const formatCategoryName = (category) => {
    const nameMap = {
      'grammar_spelling': 'Grammar & Spelling',
      'coherence': 'Coherence & Flow',
      'readability': 'Readability',
      'structure': 'Sentence Structure'
    };
    return nameMap[category] || category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Helper function to extract strengths from analysis data
  const getStrengths = () => {
    const strengths = [];
    const categories = analysisData.analysis?.categories || {};
    
    // Add strengths based on high scores
    Object.entries(categories).forEach(([category, data]) => {
      if (data.score >= 7) {
        strengths.push(`Strong ${formatCategoryName(category).toLowerCase()} (${data.score}/10)`);
      }
    });

    // Add quality label if it's positive
    if (analysisData.analysis?.quality_label && ['Excellent', 'Good'].includes(analysisData.analysis.quality_label)) {
      strengths.push(`Overall ${analysisData.analysis.quality_label.toLowerCase()} writing quality`);
    }

    return strengths.length > 0 ? strengths : ['Good foundation in writing basics'];
  };

  // Function to handle navigation to practice page
  const navigateToPractice = () => {
    navigate('/practiceWritten');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#5B67CA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your analysis report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Analysis Data</h2>
            <p className="text-gray-600 mb-6">Unable to load analysis results. Please try again.</p>
            <button 
              onClick={() => navigate('/written-communication')}
              className="bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] hover:from-[#4a56b9] hover:to-[#7c3aed] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Analyze New Text
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from analysis result
  const overallScore = analysisData.analysis?.overall_score ?? 0;
  const qualityLabel = analysisData.analysis?.quality_label ?? 'Unknown';
  const categories = analysisData.analysis?.categories || {};
  const grammarErrors = getGrammarSpellingErrors();
  const createdAt = new Date();

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] bg-clip-text text-transparent mb-2">
                  Written Communication Analysis Report
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="text-lg">📅</span>
                    {createdAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-lg">⏰</span>
                    {createdAt.toLocaleTimeString()}
                  </span>
                  {analysisData.metadata?.wordCount && (
                    <span className="flex items-center gap-1">
                      <span className="text-lg">📝</span>
                      {analysisData.metadata.wordCount} words
                    </span>
                  )}
                  {analysisData.metadata?.fileName && (
                    <span className="flex items-center gap-1">
                      <span className="text-lg">📄</span>
                      {analysisData.metadata.fileName}
                    </span>
                  )}
                </div>
              </div>
              <div className={`mt-4 lg:mt-0 px-4 py-2 rounded-full text-sm font-semibold border ${
                overallScore >= 8 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                  : overallScore >= 6
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200'
                  : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200'
              }`}>
                {qualityLabel}
              </div>
            </div>
          </div>
          
          <main className="space-y-8">
            {/* Overall Score */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Overall Performance</h2>
                  <p className="text-gray-600 mb-4">Comprehensive analysis of your written communication</p>
                </div>
                <div className="flex flex-col items-center mt-6 lg:mt-0">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E6E6E6"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="3"
                        strokeDasharray={`${overallScore * 10}, 100`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#5B67CA" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-gray-800">{overallScore}/10</span>
                      <span className="text-sm text-gray-500 mt-1">Overall Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Score Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {Object.entries(categories).map(([category, data]) => (
                <ScoreCard 
                  key={category}
                  title={formatCategoryName(category)} 
                  score={data.score} 
                  feedback={data.improvement_tips?.[0]}
                  color={getScoreColor(data.score)}
                  borderColor={getBorderColor(data.score)}
                  status={getScoreLabel(data.score)}
                />
              ))}
            </div>

            {/* Grammar & Spelling Errors Section */}
            {grammarErrors.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Grammar & Spelling Errors</h2>
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-200">
                    {grammarErrors.length} {grammarErrors.length === 1 ? 'Error' : 'Errors'} Found
                  </div>
                </div>
                
                <div className="space-y-4">
                  {grammarErrors.map((error, index) => (
                    <ErrorCard
                      key={index}
                      error={error}
                      index={index}
                      isExpanded={expandedError === index}
                      onToggle={() => setExpandedError(expandedError === index ? null : index)}
                      highlightError={highlightErrorInContext}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Performance Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Insights</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Strengths & Areas for Improvement */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center mb-4">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Key Strengths
                    </h3>
                    <ul className="text-green-700 space-y-2">
                      {getStrengths().map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-base">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-800 flex items-center mb-4">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Areas for Improvement
                    </h3>
                    <ul className="text-yellow-700 space-y-2">
                      {analysisData.key_improvement_areas?.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span className="text-base">{area}</span>
                        </li>
                      )) || (
                        <li className="text-yellow-600 italic text-base">Focus on improving overall writing quality</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Recommendations & Detailed Feedback */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Recommendations</h3>
                    <ul className="text-blue-700 space-y-2">
                      {analysisData.suggestions?.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-base">{suggestion.replace(/[🔗📝**]/g, '').trim()}</span>
                        </li>
                      )) || (
                        <li className="text-blue-600 italic text-base">Keep practicing and reviewing your writing</li>
                      )}
                    </ul>
                  </div>

                  {/* Category-specific detailed feedback */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">Detailed Observations</h3>
                    <div className="space-y-4">
                      {Object.entries(categories).map(([category, data]) => (
                        data.improvement_tips?.length > 0 && (
                          <div key={category}>
                            <h4 className="font-semibold text-purple-700 mb-2">{formatCategoryName(category)}</h4>
                            <ul className="text-purple-600 space-y-1">
                              {data.improvement_tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-purple-400 mr-2">•</span>
                                  <span className="text-base">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-end pt-4">
              <div className="relative">
                <button 
                  onClick={() => setDownloadDropdown(!downloadDropdown)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
                >
                  <Download size={18} />
                  Download Report
                  <ChevronDown size={16} className={`transition-transform ${downloadDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {downloadDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <button 
                      onClick={handleDownloadTxt}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📄 Download as TXT
                    </button>
                    <button 
                      onClick={handleDownloadPdf}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📊 Download as PDF
                    </button>
                    <button 
                      onClick={handleDownloadDocx}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📝 Download as DOCX
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                onClick={navigateToPractice}
                className="flex items-center gap-2 bg-gradient-to-r from-[#5B67CA] to-[#8B5CF6] hover:from-[#4a56b9] hover:to-[#7c3aed] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play size={18} />
                Start Practice Session
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Enhanced Score Card Component with thinner colored borders
function ScoreCard({ title, score, feedback, color, borderColor, status }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border ${borderColor} hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#5B67CA] transition-colors">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          status === 'Excellent' ? 'bg-green-100 text-green-800 border-green-200' :
          status === 'Good' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          status === 'Fair' ? 'bg-orange-100 text-orange-800 border-orange-200' :
          status === 'Not Analyzed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
          'bg-red-100 text-red-800 border-red-200'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
          style={{ width: `${(score || 0) * 10}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-gray-800">{score}/10</span>
        <div className="text-sm text-gray-500 font-medium">
          Performance Score
        </div>
      </div>
      
      {feedback && (
        <p className="text-base text-gray-600 border-t border-gray-200 pt-4 mt-4">
          {feedback}
        </p>
      )}
    </div>
  );
}

// New Error Card Component for displaying grammar and spelling errors
function ErrorCard({ error, index, isExpanded, onToggle, highlightError }) {
  return (
    <div className="border border-red-200 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors duration-200">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-red-100/50 rounded-xl transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-red-800 text-base">
              Error {index + 1}: {error.category}
            </h4>
            <p className="text-red-600 text-sm mt-1">
              {error.message}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-red-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <h5 className="font-medium text-gray-700 text-sm mb-2">Context:</h5>
            <p className="text-gray-600 text-sm leading-relaxed font-mono bg-gray-50 p-2 rounded border">
              {highlightError(error)}
            </p>
          </div>
          
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <h5 className="font-medium text-green-700 text-sm mb-2">Suggestion:</h5>
              <p className="text-green-600 text-sm">
                Use: <span className="font-semibold">"{error.suggestions.join(', ')}"</span>
              </p>
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500">
            <Info className="w-3 h-3 mr-1" />
            Length: {error.length} characters • Offset: {error.offset}
          </div>
        </div>
      )}
    </div>
  );
}
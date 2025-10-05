const OpenAI = require('openai');

// ======================================
// PHASE 4: AI QUESTION GENERATION SERVICE
// ======================================
// Features: OpenAI integration, Quiz Bowl prompt engineering, quality validation

class AIQuestionGenerator {
  constructor() {
    this.openai = null;
    this.isConfigured = false;
    this.requestCount = 0;
    this.dailyRequestLimit = 100;
    
    // Initialize OpenAI if API key is available
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
          timeout: 60000, // 60 seconds timeout
          maxRetries: 2,  // Retry failed requests up to 2 times
        });
        this.isConfigured = true;
        console.log('✅ AI Question Generator: OpenAI configured successfully');
      } catch (error) {
        console.warn('⚠️  AI Question Generator: OpenAI configuration failed:', error.message);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️  AI Question Generator: OpenAI API key not configured (set OPENAI_API_KEY)');
    }
  }

  // Category-specific prompts for Quiz Bowl questions
  getCategoryPrompt(category, difficulty = 'medium') {
    const prompts = {
      'Literature': {
        easy: 'Generate a Quiz Bowl toss-up question about well-known classic literature, famous authors, or popular novels. Focus on widely recognized works and authors.',
        medium: 'Generate a Quiz Bowl toss-up question about literature covering novels, poetry, short stories, or literary movements. Include specific details about plot, characters, or literary techniques.',
        hard: 'Generate a Quiz Bowl toss-up question about advanced literature topics including obscure works, literary criticism, minor characters, or complex literary analysis.'
      },
      'Science': {
        easy: 'Generate a Quiz Bowl toss-up question about basic science concepts in biology, chemistry, or physics. Focus on fundamental principles and well-known scientific facts.',
        medium: 'Generate a Quiz Bowl toss-up question about intermediate science topics including scientific discoveries, processes, or notable scientists and their contributions.',
        hard: 'Generate a Quiz Bowl toss-up question about advanced science covering complex theories, recent research, or detailed scientific processes and mechanisms.'
      },
      'History': {
        easy: 'Generate a Quiz Bowl toss-up question about major historical events, well-known historical figures, or important dates in world or US history.',
        medium: 'Generate a Quiz Bowl toss-up question about historical topics including wars, political movements, cultural developments, or significant historical figures and their achievements.',
        hard: 'Generate a Quiz Bowl toss-up question about detailed historical events, lesser-known historical figures, or complex political and social movements throughout history.'
      },
      'Geography': {
        easy: 'Generate a Quiz Bowl toss-up question about basic geography including countries, capitals, major landmarks, or well-known geographical features.',
        medium: 'Generate a Quiz Bowl toss-up question about geography covering regions, physical features, cities, or geographical phenomena and processes.',
        hard: 'Generate a Quiz Bowl toss-up question about advanced geography including detailed topography, geological processes, or lesser-known geographical locations and features.'
      },
      'Fine Arts': {
        easy: 'Generate a Quiz Bowl toss-up question about well-known artists, famous artworks, basic musical concepts, or popular cultural works.',
        medium: 'Generate a Quiz Bowl toss-up question about fine arts including painting, sculpture, music, theater, or dance, covering artists, techniques, and major works.',
        hard: 'Generate a Quiz Bowl toss-up question about advanced fine arts topics including art history, complex musical theory, or detailed analysis of artistic movements and techniques.'
      }
    };

    return prompts[category]?.[difficulty] || prompts[category]?.['medium'] || 
           'Generate a Quiz Bowl toss-up question about the specified category.';
  }

  // Format prompt for OpenAI API
  formatPrompt(category, difficulty = 'medium') {
    const categoryPrompt = this.getCategoryPrompt(category, difficulty);
    
    return `${categoryPrompt}

Format the question exactly as follows:
- Question: Write a clear, informative toss-up question (50-150 words) that builds in difficulty and provides multiple clues
- Answer: Provide the primary answer
- Acceptable answers: List alternative acceptable answers (if any)
- Category: ${category}
- Difficulty: ${difficulty}

Quiz Bowl question guidelines:
1. Start with harder clues and progress to easier ones
2. Provide multiple pathways to the answer
3. Include specific details and facts
4. End with the most recognizable clue
5. Avoid yes/no questions
6. Make it answerable by knowledgeable students

Example format:
Question: This author's novels often feature unreliable narrators and themes of moral ambiguity. Born in 1962, his works include "The Sense of an Ending" which won the 2011 Man Booker Prize. His earlier novels include "Flaubert's Parrot" and "A History of the World in 10½ Chapters." For 10 points, name this British author known for his postmodern literary style.
Answer: Julian Barnes
Acceptable answers: Julian Patrick Barnes
Category: Literature
Difficulty: medium`;
  }

  // Validate generated question quality
  validateQuestion(questionData) {
    const validation = {
      isValid: true,
      score: 100,
      issues: []
    };

    // Check required fields
    const requiredFields = ['question', 'answer', 'category', 'difficulty'];
    for (const field of requiredFields) {
      if (!questionData[field] || questionData[field].trim() === '') {
        validation.isValid = false;
        validation.issues.push(`Missing required field: ${field}`);
        validation.score -= 25;
      }
    }

    // Validate question length
    if (questionData.question) {
      const wordCount = questionData.question.split(' ').length;
      if (wordCount < 20) {
        validation.issues.push('Question too short (minimum 20 words)');
        validation.score -= 15;
      } else if (wordCount > 200) {
        validation.issues.push('Question too long (maximum 200 words)');
        validation.score -= 10;
      }
    }

    // Validate answer format
    if (questionData.answer) {
      if (questionData.answer.length < 2) {
        validation.issues.push('Answer too short');
        validation.score -= 20;
      }
      if (questionData.answer.length > 100) {
        validation.issues.push('Answer too long');
        validation.score -= 10;
      }
    }

    // Check for Quiz Bowl format indicators
    if (questionData.question && !questionData.question.includes('For 10 points')) {
      validation.issues.push('Missing "For 10 points" phrase');
      validation.score -= 5;
    }

    return validation;
  }

  // Parse OpenAI response into structured question data
  parseQuestionResponse(responseText) {
    try {
      const lines = responseText.split('\n').filter(line => line.trim());
      const questionData = {};

      for (const line of lines) {
        if (line.toLowerCase().startsWith('question:')) {
          questionData.question = line.substring(9).trim();
        } else if (line.toLowerCase().startsWith('answer:')) {
          questionData.answer = line.substring(7).trim();
        } else if (line.toLowerCase().startsWith('acceptable answers:')) {
          const acceptableText = line.substring(19).trim();
          questionData.acceptableAnswers = acceptableText ? acceptableText.split(',').map(a => a.trim()) : [];
        } else if (line.toLowerCase().startsWith('category:')) {
          questionData.category = line.substring(9).trim();
        } else if (line.toLowerCase().startsWith('difficulty:')) {
          questionData.difficulty = line.substring(11).trim();
        }
      }

      // Set defaults if missing
      questionData.acceptableAnswers = questionData.acceptableAnswers || [];
      questionData.isActive = true;
      questionData.source = 'AI_GENERATED';
      questionData.generatedAt = new Date().toISOString();
      questionData.qualityScore = 0; // Will be set by validation

      return questionData;
    } catch (error) {
      console.error('Error parsing question response:', error);
      return null;
    }
  }

  // Generate a single question using OpenAI
  async generateQuestion(category, difficulty = 'medium') {
    if (!this.isConfigured) {
      // Fallback to mock generation for development/testing
      console.log('⚠️  OpenAI not configured, using mock generation');
      return this.generateMockQuestion(category, difficulty);
    }

    // Check rate limits
    if (this.requestCount >= this.dailyRequestLimit) {
      throw new Error('Daily request limit reached. Please try again tomorrow.');
    }

    try {
      const prompt = this.formatPrompt(category, difficulty);
      this.requestCount++;

      console.log(`🤖 Generating question for ${category} (${difficulty}) - Request ${this.requestCount}`);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert Quiz Bowl question writer. Generate high-quality, educational toss-up questions following standard Quiz Bowl format and difficulty progression."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      const questionData = this.parseQuestionResponse(responseText);

      if (!questionData) {
        throw new Error('Failed to parse AI response into question format');
      }

      // Validate the question
      const validation = this.validateQuestion(questionData);
      questionData.qualityScore = validation.score;
      questionData.validationIssues = validation.issues;

      console.log(`✅ Question generated with quality score: ${validation.score}/100`);
      
      return {
        success: true,
        question: questionData,
        validation: validation,
        usage: {
          requestCount: this.requestCount,
          dailyLimit: this.dailyRequestLimit
        }
      };

    } catch (error) {
      console.error('AI Question Generation Error:', error);
      
      // Fallback to mock generation on connection errors
      if (error.message.includes('Connection error') || error.message.includes('ETIMEDOUT')) {
        console.log('🔄 Connection failed, falling back to mock generation');
        return this.generateMockQuestion(category, difficulty);
      }
      
      return {
        success: false,
        error: error.message,
        usage: {
          requestCount: this.requestCount,
          dailyLimit: this.dailyRequestLimit
        }
      };
    }
  }

  // Mock question generation for development/fallback
  generateMockQuestion(category, difficulty = 'medium') {
    const mockQuestions = {
      'Literature': {
        easy: {
          question: 'This author wrote "Pride and Prejudice" and "Sense and Sensibility." For 10 points, name this English novelist.',
          answer: 'Jane Austen'
        },
        medium: {
          question: 'In this novel, Elizabeth Bennet navigates social expectations while dealing with the proud Mr. Darcy. The story explores themes of class, marriage, and first impressions. For 10 points, name this 1813 novel by Jane Austen.',
          answer: 'Pride and Prejudice'
        },
        hard: {
          question: 'This character\'s prejudice against Wickham is revealed when she learns of his attempted elopement with Lydia. Her initial dislike of Darcy stems from his apparent pride and his interference in Jane\'s relationship with Bingley. For 10 points, name this protagonist of "Pride and Prejudice."',
          answer: 'Elizabeth Bennet'
        }
      },
      'Science': {
        easy: {
          question: 'This force pulls objects toward the center of the Earth. Isaac Newton described it in his law of universal gravitation. For 10 points, name this fundamental force.',
          answer: 'Gravity'
        },
        medium: {
          question: 'This scientist formulated three laws of motion and the law of universal gravitation. His "Principia" laid the groundwork for classical mechanics. For 10 points, name this English physicist and mathematician.',
          answer: 'Isaac Newton'
        },
        hard: {
          question: 'This law states that the force between two masses is proportional to the product of their masses and inversely proportional to the square of the distance between them. For 10 points, name this law formulated by Newton.',
          answer: 'Law of Universal Gravitation'
        }
      },
      'History': {
        easy: {
          question: 'This war was fought between the North and South in America from 1861 to 1865. Abraham Lincoln was president during this conflict. For 10 points, name this war.',
          answer: 'Civil War (or American Civil War)'
        },
        medium: {
          question: 'This president issued the Emancipation Proclamation in 1863 and was assassinated by John Wilkes Booth in 1865. For 10 points, name this 16th President of the United States.',
          answer: 'Abraham Lincoln'
        },
        hard: {
          question: 'This 1863 battle is considered the turning point of the Civil War. Fought in Pennsylvania, it ended Lee\'s invasion of the North and was followed by Lincoln\'s famous address. For 10 points, name this battle.',
          answer: 'Battle of Gettysburg'
        }
      },
      'Geography': {
        easy: {
          question: 'This river is the longest in the world and flows through Egypt. For 10 points, name this African river.',
          answer: 'Nile River'
        },
        medium: {
          question: 'This mountain range stretches across seven countries in South America and contains the highest peak in the Western Hemisphere. For 10 points, name this mountain range.',
          answer: 'Andes Mountains'
        },
        hard: {
          question: 'This stratovolcano in the Andes is the highest peak in both the Western and Southern Hemispheres at 22,838 feet. Located in Argentina, it was first climbed in 1897. For 10 points, name this mountain.',
          answer: 'Aconcagua'
        }
      },
      'Fine Arts': {
        easy: {
          question: 'This Italian artist painted the ceiling of the Sistine Chapel and sculpted the statue of David. For 10 points, name this Renaissance master.',
          answer: 'Michelangelo'
        },
        medium: {
          question: 'This painting by Leonardo da Vinci depicts a woman with an enigmatic smile. Housed in the Louvre, it is perhaps the most famous painting in the world. For 10 points, name this artwork.',
          answer: 'Mona Lisa'
        },
        hard: {
          question: 'This painting technique involves applying wet plaster to walls and painting on it while still damp. Michelangelo used this technique for the Sistine Chapel ceiling. For 10 points, name this painting method.',
          answer: 'Fresco'
        }
      }
    };

    const categoryQuestions = mockQuestions[category] || mockQuestions['Literature'];
    const difficultyQuestion = categoryQuestions[difficulty] || categoryQuestions['medium'];

    const questionData = {
      id: `mock_${Date.now()}`,
      question: difficultyQuestion.question,
      answer: difficultyQuestion.answer,
      category: category,
      difficulty: difficulty,
      source: 'Mock Generator (OpenAI connection unavailable)',
      created: new Date().toISOString(),
      qualityScore: 85,
      validationIssues: ['Generated by mock system due to API connection issues']
    };

    console.log(`🎭 Generated mock question for ${category} (${difficulty})`);

    return {
      success: true,
      question: questionData,
      validation: { score: 85, issues: ['Mock generation used'] },
      usage: {
        requestCount: this.requestCount,
        dailyLimit: this.dailyRequestLimit
      },
      isMock: true
    };
  }

  // Generate multiple questions in batch
  async generateBatch(requests) {
    if (!this.isConfigured) {
      throw new Error('AI Question Generator not configured.');
    }

    const results = [];
    const maxBatchSize = 5; // Limit concurrent requests

    // Process in chunks to avoid rate limits
    for (let i = 0; i < requests.length; i += maxBatchSize) {
      const chunk = requests.slice(i, i + maxBatchSize);
      const chunkPromises = chunk.map(req => 
        this.generateQuestion(req.category, req.difficulty)
      );

      try {
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
        
        // Add delay between batches to respect rate limits
        if (i + maxBatchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Batch generation error:', error);
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Get generation statistics
  getStats() {
    return {
      configured: this.isConfigured,
      requestCount: this.requestCount,
      dailyLimit: this.dailyRequestLimit,
      remaining: this.dailyRequestLimit - this.requestCount
    };
  }

  // Reset daily request count (for testing or new day)
  resetDailyCount() {
    this.requestCount = 0;
    console.log('Daily request count reset');
  }
}

// Export singleton instance
module.exports = new AIQuestionGenerator();
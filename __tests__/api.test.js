const request = require('supertest');

// Since we can't easily import the app, we'll test the actual running server
const baseUrl = 'http://localhost:3001';

describe('QuizBowlHub API - Phase 2 Tests', () => {
  
  describe('Health Endpoints', () => {
    test('GET /health should return OK status', async () => {
      const response = await request(baseUrl)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('QuizBowlHub API is running');
      expect(response.body.timestamp).toBeDefined();
    });

    test('GET /api/health/detailed should return comprehensive status', async () => {
      const response = await request(baseUrl)
        .get('/api/health/detailed')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.endpoints).toBeDefined();
    });

    test('GET /api/metrics should return system metrics', async () => {
      const response = await request(baseUrl)
        .get('/api/metrics')
        .expect(200);
      
      expect(response.body.requestCount).toBeGreaterThan(0);
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.memoryUsage).toBeDefined();
    });
  });

  describe('Question API Endpoints', () => {
    test('GET /api/questions should return questions list', async () => {
      const response = await request(baseUrl)
        .get('/api/questions')
        .expect(200);
      
      expect(response.body.questions).toBeDefined();
      expect(Array.isArray(response.body.questions)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.questions[0]).toHaveProperty('id');
      expect(response.body.questions[0]).toHaveProperty('category');
      expect(response.body.questions[0]).toHaveProperty('difficulty');
      expect(response.body.questions[0]).toHaveProperty('text');
      expect(response.body.questions[0]).toHaveProperty('answer');
    });

    test('GET /api/questions with category filter', async () => {
      const response = await request(baseUrl)
        .get('/api/questions?category=LITERATURE')
        .expect(200);
      
      expect(response.body.questions).toBeDefined();
      response.body.questions.forEach(question => {
        expect(question.category).toBe('LITERATURE');
      });
    });

    test('GET /api/questions with difficulty filter', async () => {
      const response = await request(baseUrl)
        .get('/api/questions?difficulty=EASY')
        .expect(200);
      
      expect(response.body.questions).toBeDefined();
      response.body.questions.forEach(question => {
        expect(question.difficulty).toBe('EASY');
      });
    });

    test('GET /api/questions/random should return random questions', async () => {
      const response = await request(baseUrl)
        .get('/api/questions/random?count=3')
        .expect(200);
      
      expect(response.body.questions).toBeDefined();
      expect(response.body.questions.length).toBeLessThanOrEqual(3);
      expect(response.body.totalAvailable).toBeGreaterThan(0);
      expect(response.body.requested).toBe(3);
    });

    test('GET /api/questions/metadata should return categories and stats', async () => {
      const response = await request(baseUrl)
        .get('/api/questions/metadata')
        .expect(200);
      
      expect(response.body.categories).toBeDefined();
      expect(response.body.difficulties).toBeDefined();
      expect(response.body.categoryStats).toBeDefined();
      expect(response.body.totalQuestions).toBeGreaterThan(0);
      expect(response.body.categories).toContain('LITERATURE');
      expect(response.body.categories).toContain('SCIENCE');
      expect(response.body.difficulties).toContain('EASY');
      expect(response.body.difficulties).toContain('MEDIUM');
      expect(response.body.difficulties).toContain('HARD');
    });
  });

  describe('Authentication Pages', () => {
    test('GET / should return homepage', async () => {
      const response = await request(baseUrl)
        .get('/')
        .expect(200);
      
      expect(response.type).toBe('text/html');
    });

    test('GET /login should return login page', async () => {
      const response = await request(baseUrl)
        .get('/login')
        .expect(200);
      
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Sign in to QuizBowlHub');
    });

    test('GET /register should return register page', async () => {
      const response = await request(baseUrl)
        .get('/register')
        .expect(200);
      
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Create your account');
    });

    test('GET /dashboard should return dashboard page', async () => {
      const response = await request(baseUrl)
        .get('/dashboard?user=test@example.com&role=STUDENT')
        .expect(200);
      
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Welcome to QuizBowlHub');
    });
  });

  describe('Practice Session', () => {
    test('GET /practice should return practice session page', async () => {
      const response = await request(baseUrl)
        .get('/practice?user=test@example.com&role=STUDENT')
        .expect(200);
      
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Practice Session Setup');
      expect(response.text).toContain('Enhanced Practice');
    });
  });

  describe('Admin Interface', () => {
    test('GET /admin/questions should return admin page for authorized users', async () => {
      const response = await request(baseUrl)
        .get('/admin/questions?user=admin@example.com&role=ADMIN')
        .expect(200);
      
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Question Management');
    });

    test('GET /admin/questions should redirect unauthorized users', async () => {
      const response = await request(baseUrl)
        .get('/admin/questions?user=student@example.com&role=STUDENT')
        .expect(302);
      
      expect(response.headers.location).toContain('/dashboard');
    });
  });

  describe('Question Management API (Admin Only)', () => {
    test('POST /api/questions should create question for ADMIN', async () => {
      const newQuestion = {
        category: 'SCIENCE',
        difficulty: 'MEDIUM',
        text: 'What is the chemical symbol for water?',
        answer: 'H2O',
        acceptableAnswers: ['h2o', 'water']
      };

      const response = await request(baseUrl)
        .post('/api/questions?user=admin@example.com&role=ADMIN')
        .send(newQuestion)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.question).toBeDefined();
      expect(response.body.question.text).toBe(newQuestion.text);
      expect(response.body.question.approved).toBe(true);
    });

    test('POST /api/questions should reject unauthorized users', async () => {
      const newQuestion = {
        category: 'SCIENCE',
        difficulty: 'MEDIUM',
        text: 'Test question',
        answer: 'Test answer'
      };

      const response = await request(baseUrl)
        .post('/api/questions?user=student@example.com&role=STUDENT')
        .send(newQuestion)
        .expect(403);
      
      expect(response.body.error).toContain('Insufficient permissions');
    });

    test('POST /api/questions should validate required fields', async () => {
      const incompleteQuestion = {
        category: 'SCIENCE'
        // Missing required fields
      };

      const response = await request(baseUrl)
        .post('/api/questions?user=admin@example.com&role=ADMIN')
        .send(incompleteQuestion)
        .expect(400);
      
      expect(response.body.error).toContain('Missing required fields');
    });
  });

});
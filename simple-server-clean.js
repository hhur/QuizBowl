const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Request tracking
let requestCount = 0;
let sessionCount = 0;
const startTime = Date.now();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request tracking middleware
app.use((req, res, next) => {
  requestCount++;
  next();
});

// Extended question database for Phase 2
const questions = [
    // Literature Questions
    { id: 1, category: "LITERATURE", difficulty: "EASY", text: "This American author wrote 'To Kill a Mockingbird', a novel exploring racial injustice in the Deep South.", answer: "Harper Lee", acceptableAnswers: ["harper lee", "lee"] },
    { id: 2, category: "LITERATURE", difficulty: "MEDIUM", text: "This Shakespeare play features the characters Iago, Desdemona, and a Moorish general.", answer: "Othello", acceptableAnswers: ["othello"] },
    { id: 3, category: "LITERATURE", difficulty: "HARD", text: "This Russian author wrote 'Crime and Punishment' and 'The Brothers Karamazov'.", answer: "Fyodor Dostoevsky", acceptableAnswers: ["fyodor dostoevsky", "dostoevsky"] },
    { id: 4, category: "LITERATURE", difficulty: "EASY", text: "This British author created the characters Sherlock Holmes and Dr. Watson.", answer: "Arthur Conan Doyle", acceptableAnswers: ["arthur conan doyle", "conan doyle", "doyle"] },
    { id: 5, category: "LITERATURE", difficulty: "MEDIUM", text: "This epic poem by Homer tells the story of Odysseus's journey home from Troy.", answer: "The Odyssey", acceptableAnswers: ["the odyssey", "odyssey"] },
    
    // Science Questions
    { id: 6, category: "SCIENCE", difficulty: "EASY", text: "This element with atomic number 79 has been valued by humans for thousands of years and is often used in jewelry.", answer: "Gold", acceptableAnswers: ["gold", "au"] },
    { id: 7, category: "SCIENCE", difficulty: "MEDIUM", text: "This scientist formulated three laws of planetary motion, describing elliptical orbits around the sun.", answer: "Johannes Kepler", acceptableAnswers: ["johannes kepler", "kepler"] },
    { id: 8, category: "SCIENCE", difficulty: "HARD", text: "This fundamental particle was theorized by Peter Higgs and finally detected at CERN in 2012.", answer: "Higgs Boson", acceptableAnswers: ["higgs boson", "higgs particle"] },
    { id: 9, category: "SCIENCE", difficulty: "EASY", text: "This gas makes up approximately 78% of Earth's atmosphere.", answer: "Nitrogen", acceptableAnswers: ["nitrogen", "n2"] },
    { id: 10, category: "SCIENCE", difficulty: "MEDIUM", text: "This process by which plants convert sunlight into chemical energy is essential for most life on Earth.", answer: "Photosynthesis", acceptableAnswers: ["photosynthesis"] },
    
    // History Questions
    { id: 11, category: "HISTORY", difficulty: "MEDIUM", text: "This ancient wonder of the world, located in Alexandria, was one of the tallest man-made structures for many centuries.", answer: "Lighthouse of Alexandria", acceptableAnswers: ["lighthouse of alexandria", "pharos of alexandria", "pharos", "lighthouse"] },
    { id: 12, category: "HISTORY", difficulty: "EASY", text: "This war began in 1914 and was initially called 'The Great War'.", answer: "World War I", acceptableAnswers: ["world war i", "world war 1", "wwi", "first world war"] },
    { id: 13, category: "HISTORY", difficulty: "HARD", text: "This treaty ended World War I and imposed harsh penalties on Germany.", answer: "Treaty of Versailles", acceptableAnswers: ["treaty of versailles", "versailles treaty"] },
    { id: 14, category: "HISTORY", difficulty: "MEDIUM", text: "This Egyptian queen was the last pharaoh of Egypt and had relationships with Julius Caesar and Mark Antony.", answer: "Cleopatra VII", acceptableAnswers: ["cleopatra vii", "cleopatra"] },
    { id: 15, category: "HISTORY", difficulty: "EASY", text: "This wall separated East and West Berlin from 1961 to 1989.", answer: "Berlin Wall", acceptableAnswers: ["berlin wall", "the berlin wall"] },
    
    // Geography Questions
    { id: 16, category: "GEOGRAPHY", difficulty: "EASY", text: "This is the largest continent by both area and population, containing countries like China and India.", answer: "Asia", acceptableAnswers: ["asia"] },
    { id: 17, category: "GEOGRAPHY", difficulty: "MEDIUM", text: "This river is the longest in the world, flowing through northeastern Africa.", answer: "Nile River", acceptableAnswers: ["nile river", "nile", "the nile"] },
    { id: 18, category: "GEOGRAPHY", difficulty: "HARD", text: "This landlocked country is completely surrounded by South Africa.", answer: "Lesotho", acceptableAnswers: ["lesotho"] },
    { id: 19, category: "GEOGRAPHY", difficulty: "EASY", text: "This mountain range contains Mount Everest, the world's highest peak.", answer: "Himalayas", acceptableAnswers: ["himalayas", "himalaya mountains"] },
    { id: 20, category: "GEOGRAPHY", difficulty: "MEDIUM", text: "This strait separates Europe and Africa at their closest point.", answer: "Strait of Gibraltar", acceptableAnswers: ["strait of gibraltar", "gibraltar strait"] },
    
    // Fine Arts Questions
    { id: 21, category: "FINE_ARTS", difficulty: "EASY", text: "This Dutch post-impressionist painted 'Starry Night' and cut off his own ear.", answer: "Vincent van Gogh", acceptableAnswers: ["vincent van gogh", "van gogh"] },
    { id: 22, category: "FINE_ARTS", difficulty: "MEDIUM", text: "This Italian Renaissance artist painted the ceiling of the Sistine Chapel.", answer: "Michelangelo", acceptableAnswers: ["michelangelo", "michelangelo buonarroti"] },
    { id: 23, category: "FINE_ARTS", difficulty: "HARD", text: "This Spanish artist co-founded the Cubist movement and painted 'Guernica'.", answer: "Pablo Picasso", acceptableAnswers: ["pablo picasso", "picasso"] },
    { id: 24, category: "FINE_ARTS", difficulty: "EASY", text: "This famous sculpture by Rodin depicts a man in deep thought.", answer: "The Thinker", acceptableAnswers: ["the thinker", "thinker"] },
    { id: 25, category: "FINE_ARTS", difficulty: "MEDIUM", text: "This composer wrote 'The Four Seasons' and was known as 'The Red Priest'.", answer: "Antonio Vivaldi", acceptableAnswers: ["antonio vivaldi", "vivaldi"] }
];

// Serve homepage
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'homepage-preview.html');
  res.sendFile(htmlPath);
});

// Serve login page
app.get('/login', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - QuizBowlHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in to QuizBowlHub</h2>
                <p class="mt-2 text-sm text-gray-600">Access your quiz bowl practice and competitions</p>
            </div>
            <form class="mt-8 space-y-6" onsubmit="handleLogin(event)">
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                        <input id="email" name="email" type="email" required 
                               class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Enter your email">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" required 
                               class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Enter your password">
                    </div>
                </div>
                <div>
                    <button type="submit" 
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Sign in
                    </button>
                </div>
                <div class="text-center">
                    <a href="/register" class="text-blue-600 hover:text-blue-500">Don't have an account? Sign up</a> |
                    <a href="/" class="text-blue-600 hover:text-blue-500">Back to Home</a>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        function handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Demo authentication - accept any credentials
            const role = email.includes('admin') ? 'ADMIN' : 
                         email.includes('moderator') ? 'MODERATOR' :
                         email.includes('coach') ? 'COACH' : 'STUDENT';
            
            alert('Login successful! (Demo mode)\\nEmail: ' + email + '\\nRole: ' + role);
            window.location.href = '/dashboard?user=' + encodeURIComponent(email) + '&role=' + role;
        }
    </script>
</body>
</html>
  `);
});

// Serve register page
app.get('/register', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - QuizBowlHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                <p class="mt-2 text-sm text-gray-600">Join the QuizBowlHub community</p>
            </div>
            <form class="mt-8 space-y-6" onsubmit="handleRegister(event)">
                <div class="space-y-4">
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input id="name" name="name" type="text" required 
                               class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Enter your full name">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                        <input id="email" name="email" type="email" required 
                               class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Enter your email">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" required 
                               class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                               placeholder="Create a password">
                    </div>
                    <div>
                        <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                        <select id="role" name="role" required 
                                class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">Select your role</option>
                            <option value="STUDENT">Student</option>
                            <option value="COACH">Coach</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
                <div>
                    <button type="submit" 
                            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Create Account
                    </button>
                </div>
                <div class="text-center">
                    <a href="/login" class="text-blue-600 hover:text-blue-500">Already have an account? Sign in</a> |
                    <a href="/" class="text-blue-600 hover:text-blue-500">Back to Home</a>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        function handleRegister(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            alert('Account created successfully! (Demo mode)\\nName: ' + name + '\\nEmail: ' + email + '\\nRole: ' + role);
            window.location.href = '/dashboard?user=' + encodeURIComponent(email) + '&role=' + role;
        }
    </script>
</body>
</html>
  `);
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
  const user = req.query.user || 'demo@example.com';
  const role = req.query.role || 'STUDENT';
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - QuizBowlHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gray-100">
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">QuizBowlHub</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-700">Welcome, ${user}</span>
                        <a href="/" class="text-blue-600 hover:text-blue-500">Logout</a>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to QuizBowlHub!</h1>
                        <p class="text-xl text-gray-600 mb-8">Your role: <span class="font-semibold text-blue-600">${role}</span></p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Practice Sessions</h3>
                                <p class="text-gray-600 mb-4">Improve your skills with customizable practice questions</p>
                                <button onclick="startPractice()" 
                                        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Start Practice
                                </button>
                            </div>
                            
                            ${role === 'MODERATOR' || role === 'ADMIN' ? `
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Question Management</h3>
                                <p class="text-gray-600 mb-4">Add, edit, and manage quiz bowl questions</p>
                                <a href="/admin/questions?user=${encodeURIComponent(user)}&role=${role}" 
                                   class="block w-full px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700 transition-colors">
                                    Manage Questions
                                </a>
                            </div>
                            ` : ''}
                            
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                                <p class="text-gray-600 mb-4">Team competitions and tournaments</p>
                                <button class="w-full px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed">
                                    Phase 3 Feature
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function startPractice() {
            window.location.href = '/practice?user=${encodeURIComponent(user)}&role=${role}';
        }
    </script>
</body>
</html>
  `);
});

// PHASE 2: Question Management API
// Get questions with filtering
app.get('/api/questions', (req, res) => {
  const { category, difficulty, search, limit = 20, offset = 0 } = req.query;
  
  let filtered = questions;
  
  // Filter by category
  if (category && category !== 'ALL') {
    filtered = filtered.filter(q => q.category === category);
  }
  
  // Filter by difficulty
  if (difficulty && difficulty !== 'ALL') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }
  
  // Search in text and answer
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(q => 
      q.text.toLowerCase().includes(searchLower) ||
      q.answer.toLowerCase().includes(searchLower) ||
      q.category.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
  const total = filtered.length;
  const paginatedQuestions = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    questions: paginatedQuestions,
    total,
    offset: parseInt(offset),
    limit: parseInt(limit),
    filters: { category, difficulty, search }
  });
});

// Get random questions for practice
app.get('/api/questions/random', (req, res) => {
  const { category, difficulty, count = 5 } = req.query;
  
  let available = questions;
  
  // Apply filters
  if (category && category !== 'ALL') {
    available = available.filter(q => q.category === category);
  }
  if (difficulty && difficulty !== 'ALL') {
    available = available.filter(q => q.difficulty === difficulty);
  }
  
  if (available.length === 0) {
    return res.status(404).json({ error: 'No questions found matching criteria' });
  }
  
  // Shuffle and select
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(parseInt(count), available.length));
  
  res.json({ 
    questions: selected,
    totalAvailable: available.length,
    requested: parseInt(count),
    filters: { category, difficulty }
  });
});

// Get question categories and difficulties
app.get('/api/questions/metadata', (req, res) => {
  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties = [...new Set(questions.map(q => q.difficulty))];
  
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: questions.filter(q => q.category === cat).length,
    difficulties: [...new Set(questions.filter(q => q.category === cat).map(q => q.difficulty))]
  }));
  
  res.json({
    categories,
    difficulties,
    categoryStats,
    totalQuestions: questions.length
  });
});

// Create new question (MODERATOR+ only)
app.post('/api/questions', express.json(), (req, res) => {
  const { role } = req.query;
  
  // Check permissions
  if (!['MODERATOR', 'ADMIN'].includes(role)) {
    return res.status(403).json({ error: 'Insufficient permissions. Moderator or Admin role required.' });
  }
  
  const { text, answer, category, difficulty, acceptableAnswers } = req.body;
  
  // Validation
  if (!text || !answer || !category || !difficulty) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['text', 'answer', 'category', 'difficulty']
    });
  }
  
  // Create new question
  const newQuestion = {
    id: Math.max(...questions.map(q => q.id)) + 1,
    text: text.trim(),
    answer: answer.trim(),
    category: category.toUpperCase(),
    difficulty: difficulty.toUpperCase(),
    acceptableAnswers: acceptableAnswers || [answer.toLowerCase().trim()],
    createdAt: new Date().toISOString(),
    approved: role === 'ADMIN',
    createdBy: req.query.user || 'system'
  };
  
  questions.push(newQuestion);
  
  res.status(201).json({ 
    success: true, 
    question: newQuestion,
    message: role === 'ADMIN' ? 'Question created and approved' : 'Question created, pending approval'
  });
});

// Update question (MODERATOR+ only)
app.put('/api/questions/:id', express.json(), (req, res) => {
  const { role } = req.query;
  const questionId = parseInt(req.params.id);
  
  // Check permissions
  if (!['MODERATOR', 'ADMIN'].includes(role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  const questionIndex = questions.findIndex(q => q.id === questionId);
  if (questionIndex === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const { text, answer, category, difficulty, acceptableAnswers, approved } = req.body;
  const question = questions[questionIndex];
  
  // Update fields
  if (text) question.text = text.trim();
  if (answer) question.answer = answer.trim();
  if (category) question.category = category.toUpperCase();
  if (difficulty) question.difficulty = difficulty.toUpperCase();
  if (acceptableAnswers) question.acceptableAnswers = acceptableAnswers;
  if (role === 'ADMIN' && typeof approved === 'boolean') question.approved = approved;
  
  question.updatedAt = new Date().toISOString();
  question.updatedBy = req.query.user || 'system';
  
  res.json({ 
    success: true, 
    question,
    message: 'Question updated successfully'
  });
});

// Delete question (ADMIN only)
app.delete('/api/questions/:id', (req, res) => {
  const { role } = req.query;
  const questionId = parseInt(req.params.id);
  
  // Check permissions
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin role required for deletion' });
  }
  
  const questionIndex = questions.findIndex(q => q.id === questionId);
  if (questionIndex === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const deletedQuestion = questions.splice(questionIndex, 1)[0];
  
  res.json({ 
    success: true, 
    message: 'Question deleted successfully',
    deletedQuestion
  });
});

// Serve enhanced practice session page
app.get('/practice', (req, res) => {
  const user = req.query.user || 'demo@example.com';
  const role = req.query.role || 'STUDENT';
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Practice Session - QuizBowlHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">QuizBowlHub - Enhanced Practice</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-700">${user}</span>
                        <a href="/dashboard?user=${encodeURIComponent(user)}&role=${role}" class="text-blue-600 hover:text-blue-500">Dashboard</a>
                        ${(role === 'MODERATOR' || role === 'ADMIN') ? 
                          `<a href="/admin/questions?user=${encodeURIComponent(user)}&role=${role}" class="text-green-600 hover:text-green-500">Manage Questions</a>` : ''
                        }
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Practice Setup Panel -->
        <div id="setupPanel" class="max-w-4xl mx-auto py-6 px-4">
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Practice Session Setup</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select id="categorySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="ALL">All Categories</option>
                            <option value="LITERATURE">Literature</option>
                            <option value="SCIENCE">Science</option>
                            <option value="HISTORY">History</option>
                            <option value="GEOGRAPHY">Geography</option>
                            <option value="FINE_ARTS">Fine Arts</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                        <select id="difficultySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="ALL">All Difficulties</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Question Count</label>
                        <select id="countSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="5">5 Questions</option>
                            <option value="10">10 Questions</option>
                            <option value="15">15 Questions</option>
                            <option value="20">20 Questions</option>
                        </select>
                    </div>
                </div>
                <div class="text-center">
                    <button onclick="startPracticeSession()" 
                            class="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                        Start Practice Session
                    </button>
                </div>
                <div id="questionStats" class="mt-4 text-center text-sm text-gray-600"></div>
            </div>
        </div>
        
        <!-- Practice Session Panel -->
        <div id="practicePanel" class="hidden max-w-4xl mx-auto py-6 px-4">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">Practice Session</h2>
                    <div class="flex justify-center space-x-4 text-sm">
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Question <span id="currentQ">1</span> of <span id="totalQ">5</span></span>
                        <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full">Score: <span id="score">0</span></span>
                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Time: <span id="timer">30</span>s</span>
                    </div>
                </div>
                
                <div id="questionContainer" class="mb-6">
                    <div class="text-center mb-4">
                        <span id="category" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"></span>
                        <span id="difficulty" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm ml-2"></span>
                    </div>
                    <h3 id="questionText" class="text-lg font-medium text-gray-900 mb-4 text-center leading-relaxed min-h-[4rem]"></h3>
                    <div id="answerInput" class="text-center">
                        <input type="text" id="userAnswer" placeholder="Type your answer here..." 
                               class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                               onkeypress="handleEnter(event)">
                        <button onclick="submitAnswer()" 
                                class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Submit Answer
                        </button>
                    </div>
                </div>
                
                <div id="feedback" class="hidden mb-4 p-4 rounded-lg"></div>
                <div id="nextButton" class="hidden text-center">
                    <button onclick="nextQuestion()" 
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Next Question
                    </button>
                </div>
                
                <div id="gameOver" class="hidden text-center">
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Practice Complete!</h3>
                    <div class="mb-4">
                        <p class="text-lg text-gray-600 mb-2">Final Score: <span id="finalScore" class="font-bold text-2xl text-green-600"></span></p>
                        <p class="text-sm text-gray-500">Category: <span id="finalCategory"></span> | Difficulty: <span id="finalDifficulty"></span></p>
                    </div>
                    <div class="space-x-4">
                        <button onclick="restartSetup()" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            New Practice Session
                        </button>
                        <a href="/dashboard?user=${encodeURIComponent(user)}&role=${role}" 
                           class="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let practiceQuestions = [];
        let currentQuestion = 0;
        let score = 0;
        let timeLeft = 30;
        let timer;
        let answered = false;
        let sessionSettings = {};
        
        // Load available questions and update stats
        async function loadQuestionStats() {
            try {
                const category = document.getElementById('categorySelect').value;
                const difficulty = document.getElementById('difficultySelect').value;
                const count = document.getElementById('countSelect').value;
                
                const response = await fetch(\`/api/questions/random?category=\${category}&difficulty=\${difficulty}&count=\${count}\`);
                const data = await response.json();
                
                document.getElementById('questionStats').innerHTML = 
                    \`Available questions: \${data.totalAvailable} | Requesting: \${count}\`;
                
            } catch (error) {
                console.error('Failed to load question stats:', error);
            }
        }
        
        // Start practice session with selected settings
        async function startPracticeSession() {
            const category = document.getElementById('categorySelect').value;
            const difficulty = document.getElementById('difficultySelect').value;
            const count = document.getElementById('countSelect').value;
            
            sessionSettings = { category, difficulty, count };
            
            try {
                const response = await fetch(\`/api/questions/random?category=\${category}&difficulty=\${difficulty}&count=\${count}\`);
                const data = await response.json();
                
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }
                
                practiceQuestions = data.questions;
                document.getElementById('totalQ').textContent = practiceQuestions.length;
                
                // Hide setup, show practice
                document.getElementById('setupPanel').classList.add('hidden');
                document.getElementById('practicePanel').classList.remove('hidden');
                
                // Start first question
                currentQuestion = 0;
                score = 0;
                loadQuestion();
                
            } catch (error) {
                alert('Failed to load questions: ' + error.message);
            }
        }
        
        function loadQuestion() {
            if (currentQuestion >= practiceQuestions.length) {
                endGame();
                return;
            }
            
            const q = practiceQuestions[currentQuestion];
            document.getElementById('category').textContent = q.category.replace('_', ' ');
            document.getElementById('difficulty').textContent = q.difficulty;
            document.getElementById('questionText').textContent = q.text;
            document.getElementById('currentQ').textContent = currentQuestion + 1;
            document.getElementById('userAnswer').value = '';
            document.getElementById('userAnswer').focus();
            
            timeLeft = 30;
            answered = false;
            document.getElementById('feedback').classList.add('hidden');
            document.getElementById('nextButton').classList.add('hidden');
            document.getElementById('answerInput').classList.remove('hidden');
            
            startTimer();
        }
        
        function startTimer() {
            timer = setInterval(() => {
                timeLeft--;
                document.getElementById('timer').textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    if (!answered) {
                        showFeedback(false, "Time's up!");
                    }
                }
            }, 1000);
        }
        
        function submitAnswer() {
            if (answered) return;
            
            answered = true;
            clearInterval(timer);
            
            const userAnswer = document.getElementById('userAnswer').value.toLowerCase().trim();
            const q = practiceQuestions[currentQuestion];
            const isCorrect = q.acceptableAnswers.some(answer => userAnswer.includes(answer));
            
            if (isCorrect) {
                score++;
                document.getElementById('score').textContent = score;
                showFeedback(true, \`Correct! The answer is: \${q.answer}\`);
            } else {
                showFeedback(false, \`Incorrect. The correct answer is: \${q.answer}\`);
            }
        }
        
        function showFeedback(isCorrect, message) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = message;
            feedback.className = isCorrect ? 
                'block p-4 rounded-lg bg-green-100 border border-green-200 text-green-800' :
                'block p-4 rounded-lg bg-red-100 border border-red-200 text-red-800';
            
            document.getElementById('answerInput').classList.add('hidden');
            
            if (currentQuestion < practiceQuestions.length - 1) {
                document.getElementById('nextButton').classList.remove('hidden');
            } else {
                setTimeout(endGame, 2000);
            }
        }
        
        function nextQuestion() {
            currentQuestion++;
            loadQuestion();
        }
        
        function endGame() {
            document.getElementById('questionContainer').classList.add('hidden');
            document.getElementById('feedback').classList.add('hidden');
            document.getElementById('finalScore').textContent = \`\${score} / \${practiceQuestions.length}\`;
            document.getElementById('finalCategory').textContent = sessionSettings.category.replace('_', ' ');
            document.getElementById('finalDifficulty').textContent = sessionSettings.difficulty;
            document.getElementById('gameOver').classList.remove('hidden');
        }
        
        function restartSetup() {
            document.getElementById('practicePanel').classList.add('hidden');
            document.getElementById('setupPanel').classList.remove('hidden');
            document.getElementById('questionContainer').classList.remove('hidden');
            document.getElementById('gameOver').classList.add('hidden');
        }
        
        function handleEnter(event) {
            if (event.key === 'Enter') {
                submitAnswer();
            }
        }
        
        // Initialize
        document.getElementById('categorySelect').addEventListener('change', loadQuestionStats);
        document.getElementById('difficultySelect').addEventListener('change', loadQuestionStats);
        document.getElementById('countSelect').addEventListener('change', loadQuestionStats);
        
        // Load initial stats
        loadQuestionStats();
    </script>
</body>
</html>
  `);
});

// Question Management Admin Interface
app.get('/admin/questions', (req, res) => {
  const user = req.query.user || 'admin@example.com';
  const role = req.query.role || 'ADMIN';
  
  if (!['MODERATOR', 'ADMIN'].includes(role)) {
    return res.redirect('/dashboard?error=insufficient_permissions');
  }
  
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Question Management - QuizBowlHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-semibold text-gray-900">QuizBowlHub - Question Management</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-700">${user} (${role})</span>
                        <a href="/practice?user=${encodeURIComponent(user)}&role=${role}" class="text-blue-600 hover:text-blue-500">Practice</a>
                        <a href="/dashboard?user=${encodeURIComponent(user)}&role=${role}" class="text-green-600 hover:text-green-500">Dashboard</a>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="max-w-7xl mx-auto py-6 px-4">
            <!-- Question Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-900">Total Questions</h3>
                    <p id="totalCount" class="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-900">Literature</h3>
                    <p id="literatureCount" class="text-3xl font-bold text-green-600">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-900">Science</h3>
                    <p id="scienceCount" class="text-3xl font-bold text-purple-600">0</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-900">History</h3>
                    <p id="historyCount" class="text-3xl font-bold text-red-600">0</p>
                </div>
            </div>
            
            <!-- Add New Question Form -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Add New Question</h2>
                <form id="questionForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="newCategory" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Category</option>
                                <option value="LITERATURE">Literature</option>
                                <option value="SCIENCE">Science</option>
                                <option value="HISTORY">History</option>
                                <option value="GEOGRAPHY">Geography</option>
                                <option value="FINE_ARTS">Fine Arts</option>
                                <option value="MYTHOLOGY">Mythology</option>
                                <option value="PHILOSOPHY">Philosophy</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <select id="newDifficulty" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Difficulty</option>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                        <textarea id="newText" required rows="3" 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter the question text..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                        <input type="text" id="newAnswer" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="Enter the correct answer">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Acceptable Answers (comma-separated)</label>
                        <input type="text" id="newAcceptableAnswers" 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="e.g., shakespeare, william shakespeare">
                    </div>
                    <div class="text-center">
                        <button type="submit" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Add Question
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Question List -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-900">Question Database</h2>
                    <div class="flex space-x-4">
                        <select id="filterCategory" class="px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="ALL">All Categories</option>
                            <option value="LITERATURE">Literature</option>
                            <option value="SCIENCE">Science</option>
                            <option value="HISTORY">History</option>
                            <option value="GEOGRAPHY">Geography</option>
                            <option value="FINE_ARTS">Fine Arts</option>
                        </select>
                        <select id="filterDifficulty" class="px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="ALL">All Difficulties</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                        <input type="text" id="searchText" placeholder="Search questions..." 
                               class="px-3 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>
                <div id="questionsList" class="space-y-4"></div>
            </div>
        </div>
    </div>
    
    <script>
        const userRole = '${role}';
        const userName = '${user}';
        
        // Load questions and statistics
        async function loadQuestions() {
            try {
                const category = document.getElementById('filterCategory').value;
                const difficulty = document.getElementById('filterDifficulty').value;
                const search = document.getElementById('searchText').value;
                
                const params = new URLSearchParams();
                if (category !== 'ALL') params.append('category', category);
                if (difficulty !== 'ALL') params.append('difficulty', difficulty);
                if (search) params.append('search', search);
                params.append('limit', '50');
                
                const response = await fetch('/api/questions?' + params);
                const data = await response.json();
                
                displayQuestions(data.questions);
                
                // Load metadata for stats
                const metaResponse = await fetch('/api/questions/metadata');
                const metaData = await metaResponse.json();
                updateStats(metaData);
                
            } catch (error) {
                console.error('Failed to load questions:', error);
            }
        }
        
        function displayQuestions(questions) {
            const container = document.getElementById('questionsList');
            
            if (questions.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">No questions found matching your criteria.</p>';
                return;
            }
            
            container.innerHTML = questions.map(q => \`
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex space-x-2">
                            <span class="bg-\${getCategoryColor(q.category)}-100 text-\${getCategoryColor(q.category)}-800 px-2 py-1 rounded text-xs font-semibold">
                                \${q.category.replace('_', ' ')}
                            </span>
                            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                                \${q.difficulty}
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            \${userRole === 'ADMIN' ? \`<button onclick="deleteQuestion(\${q.id})" class="text-red-600 hover:text-red-500 text-sm">Delete</button>\` : ''}
                        </div>
                    </div>
                    <p class="text-gray-900 mb-2">\${q.text}</p>
                    <p class="text-sm text-gray-600"><strong>Answer:</strong> \${q.answer}</p>
                    \${q.acceptableAnswers && q.acceptableAnswers.length > 1 ? 
                        \`<p class="text-sm text-gray-500">Acceptable: \${q.acceptableAnswers.join(', ')}</p>\` : ''
                    }
                </div>
            \`).join('');
        }
        
        function getCategoryColor(category) {
            const colors = {
                'LITERATURE': 'green',
                'SCIENCE': 'purple',
                'HISTORY': 'red',
                'GEOGRAPHY': 'blue',
                'FINE_ARTS': 'pink',
                'MYTHOLOGY': 'yellow',
                'PHILOSOPHY': 'indigo'
            };
            return colors[category] || 'gray';
        }
        
        function updateStats(metadata) {
            document.getElementById('totalCount').textContent = metadata.totalQuestions;
            
            const categoryStats = metadata.categoryStats.reduce((acc, cat) => {
                acc[cat.name] = cat.count;
                return acc;
            }, {});
            
            document.getElementById('literatureCount').textContent = categoryStats.LITERATURE || 0;
            document.getElementById('scienceCount').textContent = categoryStats.SCIENCE || 0;
            document.getElementById('historyCount').textContent = categoryStats.HISTORY || 0;
        }
        
        // Add new question
        document.getElementById('questionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const questionData = {
                category: document.getElementById('newCategory').value,
                difficulty: document.getElementById('newDifficulty').value,
                text: document.getElementById('newText').value,
                answer: document.getElementById('newAnswer').value,
                acceptableAnswers: document.getElementById('newAcceptableAnswers').value
                    .split(',').map(s => s.trim().toLowerCase()).filter(s => s)
            };
            
            if (!questionData.acceptableAnswers.length) {
                questionData.acceptableAnswers = [questionData.answer.toLowerCase()];
            }
            
            try {
                const response = await fetch('/api/questions?user=' + encodeURIComponent(userName) + '&role=' + userRole, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(questionData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Question added successfully!');
                    document.getElementById('questionForm').reset();
                    loadQuestions();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to add question: ' + error.message);
            }
        });
        
        // Delete question
        async function deleteQuestion(id) {
            if (!confirm('Are you sure you want to delete this question?')) return;
            
            try {
                const response = await fetch(\`/api/questions/\${id}?user=\${encodeURIComponent(userName)}&role=\${userRole}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Question deleted successfully!');
                    loadQuestions();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to delete question: ' + error.message);
            }
        }
        
        // Event listeners
        document.getElementById('filterCategory').addEventListener('change', loadQuestions);
        document.getElementById('filterDifficulty').addEventListener('change', loadQuestions);
        document.getElementById('searchText').addEventListener('input', 
            debounce(() => loadQuestions(), 500)
        );
        
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Initialize
        loadQuestions();
    </script>
</body>
</html>
  `);
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QuizBowlHub API is running',
    timestamp: new Date().toISOString()
  });
});

// Comprehensive health check
app.get('/api/health/detailed', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    services: {
      database: 'simulated',
      cache: 'memory',
      authentication: 'functional',
      practice: 'operational'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: ['/login', '/register', '/dashboard'],
      practice: '/practice',
      health: ['/health', '/api/health/detailed'],
      questions: '/api/questions'
    }
  };
  
  res.json(healthStatus);
});

// System metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    requestCount,
    activeConnections: 1,
    sessionCount,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    memoryUsage: process.memoryUsage(),
    lastRequest: new Date().toISOString()
  });
});

// Simple API test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful' });
});

app.listen(PORT, () => {
  console.log(`🚀 QuizBowlHub server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏠 Homepage: http://localhost:${PORT}`);
  console.log(`🎯 Phase 2 Enhanced Practice: http://localhost:${PORT}/practice`);
  console.log(`⚙️  Question Management: http://localhost:${PORT}/admin/questions`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/questions`);
});
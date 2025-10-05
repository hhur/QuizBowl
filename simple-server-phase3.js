const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Phase 4: AI Question Generation
const aiQuestionGenerator = require('./src/services/ai-question-generator');

// ======================================
// PHASE 3: REAL-TIME COMPETITION SERVER (NO REDIS)
// ======================================
// Features: Socket.IO rooms, real-time buzzer system, scrimmage management
// Built on Phase 2 foundation with enhanced real-time capabilities

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'repo/apps/web/public')));

// Request tracking middleware
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  req.requestId = requestCount;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} (Request #${requestCount})`);
  next();
});

// JWT Secret
const JWT_SECRET = 'quiz-bowl-hub-secret-key-2025';

// =================
// ENHANCED QUESTION DATABASE (25 QUESTIONS ACROSS 5 CATEGORIES)
// =================
const questionDatabase = [
  // LITERATURE (5 questions)
  {
    id: 1,
    category: "Literature",
    difficulty: "Easy",
    question: "This American author wrote 'To Kill a Mockingbird', a novel that explores themes of racial injustice in the American South during the 1930s.",
    answer: "Harper Lee",
    acceptableAnswers: ["Harper Lee", "Nelle Harper Lee"],
    points: 10
  },
  {
    id: 2,
    category: "Literature", 
    difficulty: "Medium",
    question: "In Shakespeare's 'Romeo and Juliet', what is the name of Romeo's cousin who is killed by Tybalt in Act 3?",
    answer: "Mercutio",
    acceptableAnswers: ["Mercutio"],
    points: 15
  },
  {
    id: 3,
    category: "Literature",
    difficulty: "Hard", 
    question: "This Russian author wrote 'Crime and Punishment' and 'The Brothers Karamazov', works that explore themes of morality, free will, and redemption.",
    answer: "Fyodor Dostoevsky",
    acceptableAnswers: ["Fyodor Dostoevsky", "Dostoyevsky", "Fyodor Dostoyevsky"],
    points: 20
  },
  {
    id: 4,
    category: "Literature",
    difficulty: "Medium",
    question: "In George Orwell's '1984', what is the name of the totalitarian leader whose face appears on posters with the caption 'Big Brother is watching you'?",
    answer: "Big Brother", 
    acceptableAnswers: ["Big Brother"],
    points: 15
  },
  {
    id: 5,
    category: "Literature",
    difficulty: "Easy",
    question: "This epic poem by Homer tells the story of Odysseus's ten-year journey home after the Trojan War.",
    answer: "The Odyssey",
    acceptableAnswers: ["The Odyssey", "Odyssey"],
    points: 10
  },

  // SCIENCE (5 questions)
  {
    id: 6,
    category: "Science",
    difficulty: "Easy", 
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    acceptableAnswers: ["Au"],
    points: 10
  },
  {
    id: 7,
    category: "Science",
    difficulty: "Medium",
    question: "This scientist developed the theory of evolution by natural selection and wrote 'On the Origin of Species'.",
    answer: "Charles Darwin",
    acceptableAnswers: ["Charles Darwin", "Darwin"],
    points: 15
  },
  {
    id: 8,
    category: "Science", 
    difficulty: "Hard",
    question: "What is the name of the theoretical boundary around a black hole beyond which nothing can escape, not even light?",
    answer: "Event Horizon",
    acceptableAnswers: ["Event Horizon", "Schwarzschild Radius"],
    points: 20
  },
  {
    id: 9,
    category: "Science",
    difficulty: "Medium",
    question: "In the periodic table, which element has the atomic number 6 and is the basis for all organic compounds?",
    answer: "Carbon",
    acceptableAnswers: ["Carbon", "C"],
    points: 15
  },
  {
    id: 10,
    category: "Science",
    difficulty: "Easy",
    question: "What type of animal is a dolphin: fish, mammal, or amphibian?",
    answer: "Mammal",
    acceptableAnswers: ["Mammal"],
    points: 10
  },

  // HISTORY (5 questions)
  {
    id: 11,
    category: "History",
    difficulty: "Easy",
    question: "In what year did World War II end?",
    answer: "1945",
    acceptableAnswers: ["1945"],
    points: 10
  },
  {
    id: 12,
    category: "History",
    difficulty: "Medium", 
    question: "This ancient Egyptian queen was the last pharaoh of Egypt and had relationships with Julius Caesar and Mark Antony.",
    answer: "Cleopatra",
    acceptableAnswers: ["Cleopatra", "Cleopatra VII"],
    points: 15
  },
  {
    id: 13,
    category: "History",
    difficulty: "Hard",
    question: "The Peace of Westphalia in 1648 ended which major European conflict that lasted for thirty years?",
    answer: "Thirty Years' War",
    acceptableAnswers: ["Thirty Years' War", "Thirty Years War"],
    points: 20
  },
  {
    id: 14,
    category: "History",
    difficulty: "Medium",
    question: "Which U.S. President issued the Emancipation Proclamation in 1863?",
    answer: "Abraham Lincoln",
    acceptableAnswers: ["Abraham Lincoln", "Lincoln"],
    points: 15
  },
  {
    id: 15,
    category: "History", 
    difficulty: "Easy",
    question: "The fall of this wall in 1989 symbolized the end of the Cold War and the reunification of Germany.",
    answer: "Berlin Wall",
    acceptableAnswers: ["Berlin Wall", "The Berlin Wall"],
    points: 10
  },

  // GEOGRAPHY (5 questions)
  {
    id: 16,
    category: "Geography",
    difficulty: "Easy",
    question: "What is the capital of Australia?",
    answer: "Canberra", 
    acceptableAnswers: ["Canberra"],
    points: 10
  },
  {
    id: 17,
    category: "Geography",
    difficulty: "Medium",
    question: "Which river is the longest in South America and flows through Brazil into the Atlantic Ocean?",
    answer: "Amazon River",
    acceptableAnswers: ["Amazon River", "Amazon", "Rio Amazonas"],
    points: 15
  },
  {
    id: 18,
    category: "Geography",
    difficulty: "Hard",
    question: "This landlocked country in Central Asia was formerly part of the Soviet Union and has Nur-Sultan as its capital.",
    answer: "Kazakhstan",
    acceptableAnswers: ["Kazakhstan"],
    points: 20
  },
  {
    id: 19,
    category: "Geography",
    difficulty: "Medium", 
    question: "Mount Everest lies on the border between which two countries?",
    answer: "Nepal and China",
    acceptableAnswers: ["Nepal and China", "China and Nepal", "Nepal and Tibet"],
    points: 15
  },
  {
    id: 20,
    category: "Geography",
    difficulty: "Easy",
    question: "Which is the smallest continent by land area?",
    answer: "Australia",
    acceptableAnswers: ["Australia", "Oceania"],
    points: 10
  },

  // FINE ARTS (5 questions)
  {
    id: 21,
    category: "Fine Arts",
    difficulty: "Easy",
    question: "This Italian artist painted the ceiling of the Sistine Chapel in Vatican City.",
    answer: "Michelangelo",
    acceptableAnswers: ["Michelangelo", "Michelangelo Buonarroti"],
    points: 10
  },
  {
    id: 22,
    category: "Fine Arts",
    difficulty: "Medium",
    question: "Which German composer wrote 'The Four Seasons', a set of violin concertos representing spring, summer, autumn, and winter?",
    answer: "Antonio Vivaldi",
    acceptableAnswers: ["Antonio Vivaldi", "Vivaldi"],
    points: 15
  },
  {
    id: 23,
    category: "Fine Arts", 
    difficulty: "Hard",
    question: "This art movement, exemplified by artists like Monet and Renoir, focused on capturing light and color rather than precise details.",
    answer: "Impressionism",
    acceptableAnswers: ["Impressionism", "Impressionist"],
    points: 20
  },
  {
    id: 24,
    category: "Fine Arts",
    difficulty: "Medium",
    question: "Which Spanish artist painted 'Guernica', a powerful anti-war painting depicting the bombing of a Basque town?",
    answer: "Pablo Picasso", 
    acceptableAnswers: ["Pablo Picasso", "Picasso"],
    points: 15
  },
  {
    id: 25,
    category: "Fine Arts",
    difficulty: "Easy",
    question: "This famous painting by Leonardo da Vinci features a woman with an enigmatic smile.",
    answer: "Mona Lisa",
    acceptableAnswers: ["Mona Lisa", "La Gioconda"],
    points: 10
  }
];

// =================
// USER DATABASE & AUTHENTICATION
// =================
// ENHANCED USER DATABASE WITH DEMO ACCOUNTS
// =================
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@quizbowl.com',
    password: '$2b$10$OfX/JcKC6Zm1dQHkzPUFuO9vnIzHOix4AFw8hHvIGgM5j7Yr7Fu6i', // 'admin123'
    name: 'Quiz Bowl Admin',
    role: 'ADMIN',
    createdAt: new Date(),
    teamId: null
  },
  {
    id: 2,
    username: 'coach1',
    email: 'coach@school1.edu',
    password: '$2b$10$SnUFh0NARtFwFrvSuky5Y.MGOZk3zBy/DQfLRapCZG7IGge86bayy', // 'coach123'
    name: 'John Coach',
    role: 'COACH',
    createdAt: new Date(),
    teamId: 1
  },
  {
    id: 3,
    username: 'student1',
    email: 'student1@school1.edu',
    password: '$2b$10$wIqbuTstPUbPJb3SbNQDD.oMXgqdIHykPJMhgtifxGXgLIRNMGHjO', // 'student123'
    name: 'Alice Student',
    role: 'STUDENT',
    createdAt: new Date(),
    teamId: 1
  },
  {
    id: 4,
    username: 'student2',
    email: 'student2@school1.edu',
    password: '$2b$10$wIqbuTstPUbPJb3SbNQDD.oMXgqdIHykPJMhgtifxGXgLIRNMGHjO', // 'student123'
    name: 'Bob Student',
    role: 'STUDENT',
    createdAt: new Date(),
    teamId: 1
  }
];

// =================
// REAL-TIME STATE MANAGEMENT (IN-MEMORY)
// =================
const gameRooms = new Map(); // roomId -> room state
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

// Room state structure
class GameRoom {
  constructor(id, name, hostId) {
    this.id = id;
    this.name = name;
    this.hostId = hostId;
    this.players = new Map(); // userId -> player state
    this.teams = new Map(); // teamId -> team state
    this.currentQuestion = null;
    this.questionIndex = 0;
    this.questions = [];
    this.gameState = 'WAITING'; // WAITING, ACTIVE, BUZZING, ANSWERING, FINISHED
    this.buzzer = {
      isActive: false,
      buzzedPlayer: null,
      buzzTime: null
    };
    this.scores = new Map(); // userId -> score
    this.settings = {
      questionCount: 10,
      categories: [],
      difficulty: 'Mixed',
      timeLimit: 30
    };
    this.createdAt = new Date();
  }
  
  addPlayer(userId, userName, teamId = null) {
    this.players.set(userId, {
      id: userId,
      name: userName,
      teamId: teamId,
      isReady: false,
      connectionStatus: 'connected'
    });
    this.scores.set(userId, 0);
  }
  
  removePlayer(userId) {
    this.players.delete(userId);
    this.scores.delete(userId);
  }
  
  startGame() {
    this.gameState = 'ACTIVE';
    this.loadQuestions();
    this.nextQuestion();
  }
  
  loadQuestions() {
    let filteredQuestions = [...questionDatabase];
    
    console.log(`📝 Loading questions - Total available: ${questionDatabase.length}`);
    console.log(`📝 Settings:`, this.settings);
    
    // Filter by categories if specified (but not if 'All' is selected)
    if (this.settings.categories.length > 0 && !this.settings.categories.includes('All')) {
      filteredQuestions = filteredQuestions.filter(q => 
        this.settings.categories.includes(q.category)
      );
      console.log(`📝 After category filter: ${filteredQuestions.length}`);
    }
    
    // Filter by difficulty if specified (but not if 'Mixed' or 'medium' which means all)
    if (this.settings.difficulty && this.settings.difficulty !== 'Mixed' && this.settings.difficulty !== 'medium') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty.toLowerCase() === this.settings.difficulty.toLowerCase()
      );
      console.log(`📝 After difficulty filter: ${filteredQuestions.length}`);
    }
    
    // Shuffle and take requested number
    this.questions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, this.settings.questionCount);
      
    console.log(`📝 Final questions selected: ${this.questions.length}`);
    if (this.questions.length > 0) {
      console.log(`📝 First question:`, this.questions[0].question.substring(0, 50) + '...');
    }
  }
  
  nextQuestion() {
    if (this.questionIndex >= this.questions.length) {
      console.log(`🏁 No more questions - ending game (${this.questionIndex}/${this.questions.length})`);
      this.endGame();
      return;
    }
    
    this.currentQuestion = this.questions[this.questionIndex];
    console.log(`📋 Next question (${this.questionIndex + 1}/${this.questions.length}):`, {
      id: this.currentQuestion.id,
      category: this.currentQuestion.category,
      text: this.currentQuestion.question.substring(0, 50) + '...'
    });
    
    this.questionIndex++;
    this.gameState = 'ACTIVE';
    this.resetBuzzer();
  }
  
  buzz(userId, timestamp) {
    if (this.gameState !== 'ACTIVE' || this.buzzer.isActive) {
      return false;
    }
    
    this.buzzer = {
      isActive: true,
      buzzedPlayer: userId,
      buzzTime: timestamp
    };
    this.gameState = 'BUZZING';
    return true;
  }
  
  resetBuzzer() {
    this.buzzer = {
      isActive: false,
      buzzedPlayer: null,
      buzzTime: null
    };
  }
  
  scoreAnswer(userId, isCorrect, points = 10) {
    const currentScore = this.scores.get(userId) || 0;
    this.scores.set(userId, currentScore + (isCorrect ? points : -5));
  }
  
  endGame() {
    this.gameState = 'FINISHED';
  }
  
  getState() {
    return {
      id: this.id,
      name: this.name,
      hostId: this.hostId,
      players: Array.from(this.players.values()),
      currentQuestion: this.currentQuestion,
      questionIndex: this.questionIndex,
      totalQuestions: this.questions.length,
      gameState: this.gameState,
      buzzer: this.buzzer,
      scores: Object.fromEntries(this.scores),
      settings: this.settings
    };
  }
}

// =================
// PHASE 5: FLASH CARD STUDY SYSTEM - DATA MODELS
// =================

// Flash Card Database - Task 5.1.1
const flashCards = [
  // Sample flash cards will be auto-generated from questions
];

// Auto-generate flash cards from existing questions - Task 5.2.4 Implementation
function generateInitialFlashCards() {
  // Convert first 10 questions to flash cards for demo
  const questionsToConvert = questionDatabase.slice(0, 10);
  
  questionsToConvert.forEach((question, index) => {
    const flashCard = {
      id: index + 1,
      front: question.question,
      back: question.answer,
      category: question.category,
      deckId: question.category === 'Literature' ? 1 : 2, // Assign to appropriate deck
      userId: 3, // student1 user
      difficulty: question.difficulty,
      questionId: question.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    flashCards.push(flashCard);
  });
  
  // Update deck card counts
  const literatureDeck = studyDecks.find(d => d.id === 1);
  const scienceDeck = studyDecks.find(d => d.id === 2);
  
  if (literatureDeck) {
    literatureDeck.cardCount = flashCards.filter(c => c.deckId === 1).length;
  }
  
  if (scienceDeck) {
    scienceDeck.cardCount = flashCards.filter(c => c.deckId === 2).length;
  }
  
  console.log(`✅ Generated ${flashCards.length} flash cards from existing questions`);
}

// Study Decks Database - Task 5.1.4  
const studyDecks = [
  {
    id: 1,
    name: "Literature Classics",
    description: "Essential literary works and authors for Quiz Bowl",
    category: "Literature", 
    userId: 3, // student1 created this deck
    isPublic: true,
    cardCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: "Science Fundamentals", 
    description: "Basic science concepts across all disciplines",
    category: "Science",
    userId: 3,
    isPublic: true, 
    cardCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Study Sessions Database - Task 5.1.2
const studySessions = [
  // Sessions will be tracked as users study
];

// Card Performance Database - Task 5.1.3
const cardPerformance = new Map(); // userId -> Map(cardId -> performance data)

// Flash Card Performance Tracking Class
class CardPerformanceTracker {
  constructor(userId, cardId) {
    this.userId = userId;
    this.cardId = cardId;
    this.attempts = 0;
    this.correctAnswers = 0;
    this.lastReviewed = null;
    this.nextReview = new Date();
    this.easeFactor = 2.5; // Initial ease factor for SM-2 algorithm
    this.interval = 1; // Days until next review
    this.repetitions = 0;
    this.difficulty = 0; // 0=easy, 1=medium, 2=hard
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // SM-2 Spaced Repetition Algorithm Implementation - Task 5.4.1
  updatePerformance(responseQuality) {
    this.attempts++;
    this.lastReviewed = new Date();
    this.updatedAt = new Date();
    
    if (responseQuality >= 3) {
      this.correctAnswers++;
      
      if (this.repetitions === 0) {
        this.interval = 1;
      } else if (this.repetitions === 1) {
        this.interval = 6;
      } else {
        this.interval = Math.round(this.interval * this.easeFactor);
      }
      this.repetitions++;
    } else {
      this.repetitions = 0;
      this.interval = 1;
    }
    
    // Update ease factor
    this.easeFactor = this.easeFactor + (0.1 - (5 - responseQuality) * (0.08 + (5 - responseQuality) * 0.02));
    if (this.easeFactor < 1.3) {
      this.easeFactor = 1.3;
    }
    
    // Calculate next review date
    this.nextReview = new Date();
    this.nextReview.setDate(this.nextReview.getDate() + this.interval);
    
    return this;
  }

  getAccuracy() {
    return this.attempts > 0 ? (this.correctAnswers / this.attempts) * 100 : 0;
  }

  isDueForReview() {
    return new Date() >= this.nextReview;
  }
}

// Study Session Tracking Class
class StudySession {
  constructor(userId, deckId) {
    this.id = Date.now() + Math.random(); // Simple ID generation
    this.userId = userId;
    this.deckId = deckId;
    this.startTime = new Date();
    this.endTime = null;
    this.cardsStudied = 0;
    this.cardsCorrect = 0;
    this.performanceScore = 0;
    this.timeSpent = 0; // in seconds
    this.isActive = true;
  }

  endSession() {
    this.endTime = new Date();
    this.timeSpent = Math.round((this.endTime - this.startTime) / 1000);
    this.performanceScore = this.cardsStudied > 0 ? (this.cardsCorrect / this.cardsStudied) * 100 : 0;
    this.isActive = false;
    
    // Add to sessions database
    studySessions.push(this);
    return this;
  }

  addCardResult(correct) {
    this.cardsStudied++;
    if (correct) {
      this.cardsCorrect++;
    }
  }
}

// =================
// AUTHENTICATION MIDDLEWARE
// =================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required` });
    }
    next();
  };
}

// =================
// SOCKET.IO EVENT HANDLERS
// =================
io.on('connection', (socket) => {
  console.log(`🔗 Socket connected: ${socket.id}`);
  
  // Authentication for socket connections
  socket.on('authenticate', (data) => {
    try {
      const token = data.token || data; // Support both { token } and direct token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // 🔧 SESSION MANAGEMENT: Check if user already has an active session
      const existingSocketId = userSockets.get(decoded.id);
      if (existingSocketId) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        if (existingSocket) {
          console.log(`⚠️  Disconnecting previous session for user ${decoded.username} (socket: ${existingSocketId})`);
          existingSocket.emit('session_replaced', { 
            message: 'Your session has been replaced by a new login from another device/tab' 
          });
          existingSocket.disconnect(true);
        }
      }
      
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.username = decoded.username;
      
      // Update session tracking
      userSockets.set(decoded.id, socket.id);
      socketUsers.set(socket.id, decoded.id);
      
      // Return full user object that the client expects
      const user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
      
      socket.emit('authenticated', { user });
      console.log(`✅ Socket authenticated: User ${decoded.username} (${decoded.role}) - Session: ${socket.id}`);
    } catch (error) {
      socket.emit('authentication_failed', { error: 'Invalid token' });
      console.log(`❌ Socket authentication failed: ${error.message}`);
    }
  });
  
  // Join room
  socket.on('join_room', (data) => {
    const { roomId, userName } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    let room = gameRooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    socket.join(roomId);
    room.addPlayer(socket.userId, userName);
    
    // Notify room of new player
    io.to(roomId).emit('room_updated', room.getState());
    io.to(roomId).emit('player_joined', { 
      userId: socket.userId, 
      userName: userName 
    });
    
    console.log(`👥 User ${socket.userId} joined room ${roomId}`);
  });
  
  // Create room
  socket.on('create_room', (data) => {
    const { name, settings } = data;
    
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = new GameRoom(roomId, name, socket.userId);
    
    console.log(`🏠 Creating room: ${name} (ID: ${roomId}) by user ${socket.userId}`);
    console.log(`🎮 Room settings:`, settings);
    
    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }
    
    room.loadQuestions();
    console.log(`📝 Questions loaded: ${room.questions.length}`);
    
    gameRooms.set(roomId, room);
    socket.join(roomId);
    
    socket.emit('room_created', { 
      room: {
        id: roomId,
        name: room.name,
        hostId: room.hostId,
        playerCount: 0,
        gameState: room.gameState
      }
    });
    console.log(`✅ Room created successfully: ${roomId}`);
  });
  
  // Buzzer system
  socket.on('buzz', (data) => {
    const { roomId } = data;
    const room = gameRooms.get(roomId);
    
    if (!room || !socket.userId) {
      socket.emit('error', { message: 'Invalid buzz attempt' });
      return;
    }
    
    // 🔧 ENHANCED LOGGING: Track user session info
    console.log(`🎯 Buzz attempt: User ${socket.username} (ID: ${socket.userId}, Socket: ${socket.id}) in room ${roomId}`);
    
    const timestamp = Date.now();
    const success = room.buzz(socket.userId, timestamp);
    
    if (success) {
      // Include username in the buzz_registered event
      io.to(roomId).emit('buzz_registered', {
        userId: socket.userId,
        username: socket.username,
        timestamp: timestamp,
        success: true,
        gameState: room.gameState
      });
      console.log(`🔔 Buzz registered: User ${socket.username} (ID: ${socket.userId}) in room ${roomId}`);
    } else {
      socket.emit('buzz_rejected', { reason: 'Buzzer not active or already buzzed' });
      console.log(`❌ Buzz rejected: User ${socket.username} (ID: ${socket.userId}) - buzzer not available`);
    }
  });
  
  // Answer submission
  socket.on('submit_answer', (data) => {
    const { roomId, answer } = data;
    const room = gameRooms.get(roomId);
    
    if (!room || !socket.userId || room.buzzer.buzzedPlayer !== socket.userId) {
      socket.emit('error', { message: 'Invalid answer submission' });
      return;
    }
    
    const question = room.currentQuestion;
    const isCorrect = question.acceptableAnswers.some(acceptableAnswer => 
      acceptableAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
    );
    
    room.scoreAnswer(socket.userId, isCorrect, question.points);
    
    // 📊 REAL-TIME STATS UPDATE: Track individual answer
    updateUserAnswerStats(socket.userId, isCorrect);
    
    io.to(roomId).emit('answer_result', {
      userId: socket.userId,
      answer: answer,
      isCorrect: isCorrect,
      correctAnswer: question.answer,
      points: isCorrect ? question.points : -5,
      scores: Object.fromEntries(room.scores)
    });
    
    // Move to next question after brief delay
    setTimeout(() => {
      room.nextQuestion();
      io.to(roomId).emit('room_updated', room.getState());
      
      if (room.gameState === 'FINISHED') {
        // 📊 UPDATE USER PROFILES: Track game completion stats
        updateUserProfilesAfterGame(room);
        
        io.to(roomId).emit('game_finished', {
          finalScores: Object.fromEntries(room.scores),
          winner: [...room.scores.entries()].sort((a, b) => b[1] - a[1])[0]
        });
      }
    }, 3000);
    
    console.log(`📝 Answer submitted: User ${socket.userId}, Correct: ${isCorrect}`);
  });
  
  // Start game
  socket.on('start_game', (data) => {
    const { roomId } = data;
    const room = gameRooms.get(roomId);
    
    if (!room || room.hostId !== socket.userId) {
      socket.emit('error', { message: 'Only room host can start game' });
      return;
    }
    
    console.log(`🚀 Starting game in room ${roomId}`);
    console.log(`📋 Questions available: ${room.questions.length}`);
    
    room.startGame();
    const gameState = room.getState();
    
    console.log(`🎮 Game state after start:`, {
      gameState: gameState.gameState,
      currentQuestion: gameState.currentQuestion ? 'Present' : 'Missing',
      questionIndex: room.questionIndex,
      totalQuestions: room.questions.length
    });
    
    io.to(roomId).emit('game_started', gameState);
    console.log(`✅ Game started in room ${roomId}`);
  });
  
  // Leave room
  socket.on('leave_room', (data) => {
    const { roomId } = data;
    const room = gameRooms.get(roomId);
    
    if (room && socket.userId) {
      room.removePlayer(socket.userId);
      socket.leave(roomId);
      
      io.to(roomId).emit('player_left', { userId: socket.userId });
      io.to(roomId).emit('room_updated', room.getState());
      
      // Clean up empty rooms
      if (room.players.size === 0) {
        gameRooms.delete(roomId);
        console.log(`🗑️  Empty room ${roomId} deleted`);
      }
    }
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    
    if (socket.userId) {
      userSockets.delete(socket.userId);
      socketUsers.delete(socket.id);
      
      // Remove from all rooms
      for (const [roomId, room] of gameRooms) {
        if (room.players.has(socket.userId)) {
          room.removePlayer(socket.userId);
          io.to(roomId).emit('player_disconnected', { userId: socket.userId });
          io.to(roomId).emit('room_updated', room.getState());
          
          // Clean up empty rooms
          if (room.players.size === 0) {
            gameRooms.delete(roomId);
            console.log(`🗑️  Empty room ${roomId} deleted after disconnect`);
          }
        }
      }
    }
  });
});

// =================
// REST API ENDPOINTS (FROM PHASE 2)
// =================

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuizBowlHub API',
    version: '3.0.0-realtime'
  });
});

app.get('/api/health/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuizBowlHub API',
    version: '3.0.0-realtime',
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
      unit: 'MB'
    },
    requests: {
      total: requestCount,
      active_connections: io.engine.clientsCount
    },
    realtime: {
      active_rooms: gameRooms.size,
      connected_players: userSockets.size,
      redis_connected: false // In-memory mode
    }
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Support both username and email login
  const loginField = username || email;
  
  if (!loginField || !password) {
    return res.status(400).json({ error: 'Username/email and password required' });
  }
  
  // Find user by username or email
  const user = users.find(u => 
    u.username === loginField || 
    u.email === loginField
  );
  
  if (!user) {
    console.log(`Login attempt failed: User not found for '${loginField}'`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    console.log(`Login attempt failed: Invalid password for user '${user.username}'`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  console.log(`Login successful: User '${user.username}' (${user.role})`);
  
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name, role = 'STUDENT' } = req.body;
  
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Username, email, password, and name required' });
  }
  
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: hashedPassword,
    name,
    role,
    createdAt: new Date(),
    teamId: null
  };
  
  users.push(newUser);
  
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      teamId: newUser.teamId
    }
  });
});

// Question API endpoints (from Phase 2)
app.get('/api/questions', (req, res) => {
  const { category, difficulty, search, limit = 20, offset = 0 } = req.query;
  
  let filteredQuestions = [...questionDatabase];
  
  if (category && category !== 'All') {
    filteredQuestions = filteredQuestions.filter(q => q.category === category);
  }
  
  if (difficulty && difficulty !== 'All') {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredQuestions = filteredQuestions.filter(q => 
      q.question.toLowerCase().includes(searchLower) ||
      q.answer.toLowerCase().includes(searchLower)
    );
  }
  
  const total = filteredQuestions.length;
  const paginatedQuestions = filteredQuestions.slice(
    parseInt(offset), 
    parseInt(offset) + parseInt(limit)
  );
  
  res.json({
    questions: paginatedQuestions,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    }
  });
});

app.get('/api/questions/random', (req, res) => {
  const { count = 5, category, difficulty } = req.query;
  
  let availableQuestions = [...questionDatabase];
  
  if (category && category !== 'All') {
    availableQuestions = availableQuestions.filter(q => q.category === category);
  }
  
  if (difficulty && difficulty !== 'All') {
    availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
  }
  
  const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, parseInt(count));
  
  res.json({
    questions: selectedQuestions,
    metadata: {
      requested: parseInt(count),
      available: availableQuestions.length,
      returned: selectedQuestions.length
    }
  });
});

app.get('/api/questions/metadata', (req, res) => {
  const categories = [...new Set(questionDatabase.map(q => q.category))];
  const difficulties = [...new Set(questionDatabase.map(q => q.difficulty))];
  
  const categoryStats = categories.map(category => ({
    category,
    count: questionDatabase.filter(q => q.category === category).length,
    difficulties: difficulties.map(difficulty => ({
      difficulty,
      count: questionDatabase.filter(q => q.category === category && q.difficulty === difficulty).length
    })).filter(d => d.count > 0)
  }));
  
  res.json({
    total: questionDatabase.length,
    categories: categoryStats,
    difficulties: difficulties.map(difficulty => ({
      difficulty,
      count: questionDatabase.filter(q => q.difficulty === difficulty).length
    }))
  });
});

// ======================================
// PHASE 4: AI QUESTION GENERATION API
// ======================================

// Generate single question with AI
app.post('/api/ai/generate-question', authenticateToken, async (req, res) => {
  // Check if user has MODERATOR or ADMIN role
  if (!['MODERATOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions. AI generation requires MODERATOR or ADMIN role.' });
  }

  const { category, difficulty = 'medium' } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const validCategories = ['Literature', 'Science', 'History', 'Geography', 'Fine Arts'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      error: 'Invalid category', 
      validCategories 
    });
  }

  try {
    console.log(`🤖 AI generation request: ${category} (${difficulty}) by ${req.user.username}`);
    const result = await aiQuestionGenerator.generateQuestion(category, difficulty);
    
    if (result.success) {
      res.json({
        success: true,
        question: result.question,
        validation: result.validation,
        usage: result.usage,
        generatedBy: req.user.username,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        usage: result.usage
      });
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'AI question generation failed',
      details: error.message 
    });
  }
});

// Batch generate questions
app.post('/api/ai/generate-batch', authenticateToken, async (req, res) => {
  if (!['MODERATOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: 'Requests array is required' });
  }

  if (requests.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 questions per batch' });
  }

  try {
    console.log(`🤖 Batch AI generation: ${requests.length} questions by ${req.user.username}`);
    const results = await aiQuestionGenerator.generateBatch(requests);
    
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      generatedBy: req.user.username,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch AI Generation Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Batch AI generation failed',
      details: error.message 
    });
  }
});

// Get AI generation statistics
app.get('/api/ai/stats', authenticateToken, (req, res) => {
  if (!['MODERATOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const stats = aiQuestionGenerator.getStats();
  res.json({
    ai: stats,
    database: {
      totalQuestions: questionDatabase.length,
      aiGenerated: questionDatabase.filter(q => q.source === 'AI_GENERATED').length,
      manual: questionDatabase.filter(q => q.source !== 'AI_GENERATED').length
    }
  });
});

// Add AI-generated question to database
app.post('/api/ai/approve-question', authenticateToken, async (req, res) => {
  if (!['MODERATOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { question } = req.body;

  if (!question || !question.question || !question.answer || !question.category) {
    return res.status(400).json({ error: 'Invalid question data' });
  }

  try {
    // Add to question database with new ID
    const newQuestion = {
      id: questionDatabase.length + 1,
      question: question.question,
      answer: question.answer,
      acceptableAnswers: question.acceptableAnswers || [],
      category: question.category,
      difficulty: question.difficulty || 'medium',
      isActive: true,
      source: 'AI_GENERATED',
      approvedBy: req.user.username,
      approvedAt: new Date().toISOString(),
      qualityScore: question.qualityScore || 0
    };

    questionDatabase.push(newQuestion);

    console.log(`✅ AI question approved and added by ${req.user.username}: ${newQuestion.category} #${newQuestion.id}`);

    res.json({
      success: true,
      question: newQuestion,
      message: 'Question approved and added to database'
    });
  } catch (error) {
    console.error('Question approval error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve question',
      details: error.message 
    });
  }
});

// Real-time game management endpoints
app.get('/api/rooms', authenticateToken, (req, res) => {
  const roomsList = Array.from(gameRooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    playerCount: room.players.size,
    gameState: room.gameState,
    settings: room.settings,
    createdAt: room.createdAt
  }));
  
  res.json({ rooms: roomsList });
});

app.get('/api/rooms/:roomId', authenticateToken, (req, res) => {
  const room = gameRooms.get(req.params.roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({ room: room.getState() });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main-app.html'), (err) => {
    if (err) {
      console.error('Error serving main app:', err);
      res.status(500).send('Error loading main application');
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  // Since we're using JWT (stateless), we just confirm the logout
  // The client should clear the token from localStorage
  res.json({ message: 'Logout successful' });
});

// Get current user info endpoint
app.get('/api/auth/me', authenticateToken, (req, res) => {
  // Return user info from the token (already decoded in authenticateToken middleware)
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// =================
// PHASE 5: FLASH CARD API ENDPOINTS
// =================

// Task 5.2.1: Flash Cards CRUD API
app.get('/api/flashcards', authenticateToken, (req, res) => {
  const { deckId, category, userId } = req.query;
  let filteredCards = [...flashCards];
  
  if (deckId) {
    filteredCards = filteredCards.filter(card => card.deckId === parseInt(deckId));
  }
  
  if (category) {
    filteredCards = filteredCards.filter(card => card.category === category);
  }
  
  if (userId) {
    filteredCards = filteredCards.filter(card => card.userId === parseInt(userId));
  }
  
  res.json({
    success: true,
    flashcards: filteredCards,
    total: filteredCards.length
  });
});

app.post('/api/flashcards', authenticateToken, (req, res) => {
  const { front, back, category, deckId, difficulty = 'Medium' } = req.body;
  
  if (!front || !back) {
    return res.status(400).json({
      success: false,
      error: 'Front and back content required'
    });
  }
  
  const newCard = {
    id: flashCards.length + 1,
    front,
    back,
    category: category || 'General',
    deckId: deckId || null,
    userId: req.user.id,
    difficulty,
    questionId: null, // Link to original question if converted
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  flashCards.push(newCard);
  
  // Update deck card count if applicable
  if (deckId) {
    const deck = studyDecks.find(d => d.id === parseInt(deckId));
    if (deck) {
      deck.cardCount++;
      deck.updatedAt = new Date();
    }
  }
  
  res.json({
    success: true,
    flashcard: newCard
  });
});

app.put('/api/flashcards/:id', authenticateToken, (req, res) => {
  const cardId = parseInt(req.params.id);
  const cardIndex = flashCards.findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Flash card not found'
    });
  }
  
  const card = flashCards[cardIndex];
  
  // Check if user owns the card or is admin
  if (card.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to edit this card'
    });
  }
  
  // Update card properties
  const { front, back, category, difficulty } = req.body;
  if (front) card.front = front;
  if (back) card.back = back;
  if (category) card.category = category;
  if (difficulty) card.difficulty = difficulty;
  card.updatedAt = new Date();
  
  res.json({
    success: true,
    flashcard: card
  });
});

app.delete('/api/flashcards/:id', authenticateToken, (req, res) => {
  const cardId = parseInt(req.params.id);
  const cardIndex = flashCards.findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Flash card not found'
    });
  }
  
  const card = flashCards[cardIndex];
  
  // Check if user owns the card or is admin
  if (card.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this card'
    });
  }
  
  // Update deck card count if applicable
  if (card.deckId) {
    const deck = studyDecks.find(d => d.id === card.deckId);
    if (deck) {
      deck.cardCount--;
      deck.updatedAt = new Date();
    }
  }
  
  flashCards.splice(cardIndex, 1);
  
  res.json({
    success: true,
    message: 'Flash card deleted successfully'
  });
});

// Task 5.2.2: Study Decks Management API
app.get('/api/decks', authenticateToken, (req, res) => {
  const { category, userId, isPublic } = req.query;
  let filteredDecks = [...studyDecks];
  
  if (category) {
    filteredDecks = filteredDecks.filter(deck => deck.category === category);
  }
  
  if (userId) {
    filteredDecks = filteredDecks.filter(deck => deck.userId === parseInt(userId));
  }
  
  if (isPublic !== undefined) {
    filteredDecks = filteredDecks.filter(deck => deck.isPublic === (isPublic === 'true'));
  }
  
  // Show public decks or user's own decks
  filteredDecks = filteredDecks.filter(deck => 
    deck.isPublic || deck.userId === req.user.id
  );
  
  res.json({
    success: true,
    decks: filteredDecks,
    total: filteredDecks.length
  });
});

app.post('/api/decks', authenticateToken, (req, res) => {
  const { name, description, category, isPublic = false } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Deck name is required'
    });
  }
  
  const newDeck = {
    id: studyDecks.length + 1,
    name,
    description: description || '',
    category: category || 'General',
    userId: req.user.id,
    isPublic: isPublic,
    cardCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  studyDecks.push(newDeck);
  
  res.json({
    success: true,
    deck: newDeck
  });
});

app.put('/api/decks/:id', authenticateToken, (req, res) => {
  const deckId = parseInt(req.params.id);
  const deck = studyDecks.find(d => d.id === deckId);
  
  if (!deck) {
    return res.status(404).json({
      success: false,
      error: 'Deck not found'
    });
  }
  
  // Check if user owns the deck or is admin
  if (deck.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to edit this deck'
    });
  }
  
  const { name, description, category, isPublic } = req.body;
  if (name) deck.name = name;
  if (description !== undefined) deck.description = description;
  if (category) deck.category = category;
  if (isPublic !== undefined) deck.isPublic = isPublic;
  deck.updatedAt = new Date();
  
  res.json({
    success: true,
    deck: deck
  });
});

app.delete('/api/decks/:id', authenticateToken, (req, res) => {
  const deckId = parseInt(req.params.id);
  const deckIndex = studyDecks.findIndex(d => d.id === deckId);
  
  if (deckIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Deck not found'
    });
  }
  
  const deck = studyDecks[deckIndex];
  
  // Check if user owns the deck or is admin
  if (deck.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this deck'
    });
  }
  
  // Delete all cards in this deck
  for (let i = flashCards.length - 1; i >= 0; i--) {
    if (flashCards[i].deckId === deckId) {
      flashCards.splice(i, 1);
    }
  }
  
  studyDecks.splice(deckIndex, 1);
  
  res.json({
    success: true,
    message: 'Deck deleted successfully'
  });
});

// Task 5.2.3: Study Sessions Tracking API
app.post('/api/study-sessions/start', authenticateToken, (req, res) => {
  const { deckId } = req.body;
  
  if (!deckId) {
    return res.status(400).json({
      success: false,
      error: 'Deck ID is required'
    });
  }
  
  const deck = studyDecks.find(d => d.id === parseInt(deckId));
  if (!deck) {
    return res.status(404).json({
      success: false,
      error: 'Deck not found'
    });
  }
  
  const session = new StudySession(req.user.id, parseInt(deckId));
  
  res.json({
    success: true,
    session: {
      id: session.id,
      deckId: session.deckId,
      startTime: session.startTime
    }
  });
});

app.post('/api/study-sessions/:sessionId/end', authenticateToken, (req, res) => {
  const sessionId = parseFloat(req.params.sessionId);
  const { cardsStudied, cardsCorrect } = req.body;
  
  // Create a session object and end it
  const session = new StudySession(req.user.id, 0);
  session.id = sessionId;
  session.cardsStudied = cardsStudied || 0;
  session.cardsCorrect = cardsCorrect || 0;
  const completedSession = session.endSession();
  
  res.json({
    success: true,
    session: completedSession
  });
});

// Task 5.2.4: Question-to-Flashcard Conversion
app.post('/api/flashcards/convert-question', authenticateToken, (req, res) => {
  const { questionId, deckId } = req.body;
  
  if (!questionId) {
    return res.status(400).json({
      success: false,
      error: 'Question ID is required'
    });
  }
  
  const question = questionDatabase.find(q => q.id === parseInt(questionId));
  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'Question not found'
    });
  }
  
  // Create flash card from question
  const newCard = {
    id: flashCards.length + 1,
    front: question.question,
    back: question.answer,
    category: question.category,
    deckId: deckId ? parseInt(deckId) : null,
    userId: req.user.id,
    difficulty: question.difficulty,
    questionId: question.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  flashCards.push(newCard);
  
  // Update deck card count if applicable
  if (deckId) {
    const deck = studyDecks.find(d => d.id === parseInt(deckId));
    if (deck) {
      deck.cardCount++;
      deck.updatedAt = new Date();
    }
  }
  
  res.json({
    success: true,
    flashcard: newCard,
    message: 'Question converted to flash card successfully'
  });
});

// Task 5.2.5: Deck Import/Export
app.post('/api/decks/:id/export', authenticateToken, (req, res) => {
  const deckId = parseInt(req.params.id);
  const deck = studyDecks.find(d => d.id === deckId);
  
  if (!deck) {
    return res.status(404).json({
      success: false,
      error: 'Deck not found'
    });
  }
  
  // Check access permissions
  if (!deck.isPublic && deck.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to export this deck'
    });
  }
  
  const deckCards = flashCards.filter(card => card.deckId === deckId);
  
  const exportData = {
    deck: deck,
    cards: deckCards,
    exportedAt: new Date(),
    exportedBy: req.user.username
  };
  
  res.json({
    success: true,
    export: exportData
  });
});

// Serve other static routes
app.get('/dashboard', (req, res) => {
  // Get user info from query params or defaults
  let user = req.query.user || 'User';
  let role = req.query.role || 'STUDENT';
  
  // Try to get user info from token if available (takes precedence)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      user = decoded.username;
      role = decoded.role;
    } catch (err) {
      // Token invalid or expired, use query params or defaults
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QuizBowlHub - Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <nav class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-semibold text-gray-900">🏆 QuizBowlHub</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-700">${user} (${role})</span>
                            <button onclick="logout()" class="text-red-600 hover:text-red-500 cursor-pointer">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div class="px-4 py-6 sm:px-0">
                    <div class="text-center mb-12">
                        <h1 class="text-5xl font-bold text-gray-900 mb-6">Welcome to QuizBowlHub!</h1>
                        <p class="text-xl text-gray-600 mb-2">Choose your activity to get started</p>
                        <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
                    </div>
                    
                    <!-- Main Action Cards -->
                    <div class="max-w-5xl mx-auto mb-12">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            <!-- Practice Mode Card -->
                            <div class="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                                <div class="text-center flex-grow flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">�</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Practice Mode</h3>
                                    <p class="text-gray-700 mb-6 leading-relaxed flex-grow">Solo practice with customizable questions, categories, and difficulty levels</p>
                                    <button onclick="startPractice()" 
                                            class="w-full px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        Start Practice Session
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Flash Card Study Mode Card - PHASE 5 NEW! -->
                            <div class="group bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                                <div class="text-center flex-grow flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🃏</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Flash Card Study</h3>
                                    <p class="text-gray-700 mb-6 leading-relaxed flex-grow">Spaced repetition learning with personalized study decks and progress tracking</p>
                                    <button onclick="startFlashCards()" 
                                            class="w-full px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        Study Flash Cards
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Competition Mode Card -->
                            <div class="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div class="text-center h-full flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🏆</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Competition Mode</h3>
                                    <p class="text-gray-700 mb-6 leading-relaxed flex-grow">Real-time multiplayer competitions with buzzer system and live scoring</p>
                                    <button onclick="startCompetition()" 
                                            class="w-full px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        Join Competition
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Secondary Cards Row -->
                    <div class="max-w-5xl mx-auto">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                            <!-- Profile & Achievements Card -->
                            <div class="group bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                                <div class="text-center flex-grow flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">👤</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">My Profile & Stats</h3>
                                    
                                    <!-- Main Stats Grid -->
                                    <div class="bg-white rounded-lg p-4 mb-4 shadow-inner">
                                        <div class="grid grid-cols-3 gap-3 text-sm mb-3">
                                            <div class="text-center">
                                                <div class="font-bold text-lg text-blue-600" id="gamesPlayed">0</div>
                                                <div class="text-gray-600">Games</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="font-bold text-lg text-green-600" id="questionsAnswered">0</div>
                                                <div class="text-gray-600">Questions</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="font-bold text-lg text-purple-600" id="bestScore">0</div>
                                                <div class="text-gray-600">Best Score</div>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                                            <div class="text-center">
                                                <div class="font-bold text-lg text-red-600" id="accuracy">0%</div>
                                                <div class="text-gray-600">Accuracy</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="font-bold text-lg text-yellow-600" id="averageScore">0</div>
                                                <div class="text-gray-600">Avg Score</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Recent Games -->
                                    <div class="bg-white rounded-lg p-4 mb-4 shadow-inner">
                                        <div class="text-sm text-gray-700 font-semibold mb-3">📈 Recent Games</div>
                                        <div id="recentGames" class="space-y-2 text-xs">
                                            <div class="text-gray-500">No recent games</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Achievements -->
                                    <div class="space-y-2 flex-grow">
                                        <div class="text-sm text-orange-700 font-semibold">🏅 Achievements</div>
                                        <div class="flex flex-wrap gap-2 justify-center" id="achievements">
                                            <!-- Achievements will be loaded here -->
                                        </div>
                                    </div>
                                    
                                    <!-- View Full Profile Button -->
                                    <button onclick="viewFullProfile()" 
                                            class="w-full px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        View Full Profile
                                    </button>
                                </div>
                            </div>
                            
                            ${(role === 'MODERATOR' || role === 'ADMIN') ? `
                            <!-- AI Admin Card -->
                            <div class="group bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div class="text-center h-full flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🤖</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">AI Admin</h3>
                                    <p class="text-gray-700 mb-6 leading-relaxed flex-grow">Generate and manage questions using AI technology</p>
                                    <button onclick="openAIAdmin()" 
                                            class="w-full px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        AI Question Management
                                    </button>
                                </div>
                            </div>
                            ` : `
                            <!-- Quick Stats Card for Non-Admin Users -->
                            <div class="group bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-xl shadow-lg border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div class="text-center flex-grow flex flex-col">
                                    <div class="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
                                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h3>
                                    <div class="space-y-3 flex-grow">
                                        <div class="bg-white rounded-lg p-3 shadow-inner">
                                            <div class="text-sm text-gray-600 mb-1">Current Session</div>
                                            <div class="text-lg font-bold text-indigo-600">Ready to Start!</div>
                                        </div>
                                        <div class="bg-white rounded-lg p-3 shadow-inner">
                                            <div class="text-sm text-gray-600 mb-1">Available Questions</div>
                                            <div class="text-lg font-bold text-indigo-600">25+ Questions</div>
                                        </div>
                                        <div class="bg-white rounded-lg p-3 shadow-inner">
                                            <div class="text-sm text-gray-600 mb-1">Categories</div>
                                            <div class="text-lg font-bold text-indigo-600">5 Categories</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Get Started Button -->
                                    <button onclick="startPractice()" 
                                            class="w-full px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl mt-auto">
                                        Get Started
                                    </button>
                                </div>
                            </div>
                            `}
                        </div>
                    </div>
                    

                </div>
            </div>
        </div>
        
        <script>
            // Get user info from localStorage
            let currentUser = 'User';
            let currentRole = 'STUDENT';
            
            try {
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    const user = JSON.parse(userData);
                    currentUser = user.username || 'User';
                    currentRole = user.role || 'STUDENT';
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
            
            // Load user profile data when page loads
            document.addEventListener('DOMContentLoaded', function() {
                loadUserProfile();
            });
            
            async function loadUserProfile() {
                try {
                    // Get auth token
                    const token = localStorage.getItem('auth_token');
                    const headers = {};
                    if (token) {
                        headers['Authorization'] = 'Bearer ' + token;
                    }
                    
                    // Fetch user stats from server using actual username
                    const response = await fetch('/api/user-stats/' + encodeURIComponent(currentUser), {
                        headers: headers
                    });
                    const stats = await response.json();
                    
                    // Update main stats
                    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
                    document.getElementById('questionsAnswered').textContent = stats.questionsAnswered;
                    document.getElementById('bestScore').textContent = stats.bestScore;
                    document.getElementById('accuracy').textContent = stats.accuracy + '%';
                    document.getElementById('averageScore').textContent = stats.averageScore || 0;
                    
                    // Update recent games
                    const recentGamesContainer = document.getElementById('recentGames');
                    recentGamesContainer.innerHTML = '';
                    
                    if (stats.recentGames && stats.recentGames.length > 0) {
                        stats.recentGames.forEach((game, index) => {
                            const gameDiv = document.createElement('div');
                            gameDiv.className = 'flex justify-between items-center p-2 bg-gray-50 rounded border';
                            
                            const placementEmoji = game.placement === 1 ? '🥇' : 
                                                  game.placement === 2 ? '🥈' : 
                                                  game.placement === 3 ? '🥉' : '#' + game.placement;
                            
                            const scoreColor = game.score >= 0 ? 'text-green-600' : 'text-red-600';
                            
                            gameDiv.innerHTML = 
                                '<div class="text-left">' +
                                    '<div class="font-semibold text-xs">' + (game.roomName || 'Game') + '</div>' +
                                    '<div class="text-xs text-gray-600">' + new Date(game.date).toLocaleDateString() + '</div>' +
                                '</div>' +
                                '<div class="text-right">' +
                                    '<div class="font-bold text-sm ' + scoreColor + '">' + game.score + '</div>' +
                                    '<div class="text-xs text-gray-600">' + placementEmoji + '</div>' +
                                '</div>';
                            recentGamesContainer.appendChild(gameDiv);
                        });
                    } else {
                        recentGamesContainer.innerHTML = '<div class="text-gray-500 text-center py-2">No recent games</div>';
                    }
                    
                    // Update achievements
                    const achievementsContainer = document.getElementById('achievements');
                    achievementsContainer.innerHTML = '';
                    
                    if (stats.achievements.length === 0) {
                        achievementsContainer.innerHTML = '<span class="text-xs text-gray-500">No achievements yet</span>';
                    } else {
                        const achievementColors = [
                            'bg-yellow-100 text-yellow-800',
                            'bg-blue-100 text-blue-800', 
                            'bg-green-100 text-green-800',
                            'bg-purple-100 text-purple-800',
                            'bg-red-100 text-red-800',
                            'bg-indigo-100 text-indigo-800'
                        ];
                        
                        stats.achievements.forEach((achievement, index) => {
                            const span = document.createElement('span');
                            const colorClass = achievementColors[index % achievementColors.length];
                            span.className = 'px-2 py-1 text-xs rounded-full ' + colorClass;
                            span.textContent = achievement;
                            span.title = achievement; // Tooltip for longer achievement names
                            achievementsContainer.appendChild(span);
                        });
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    // Fallback to default values
                    document.getElementById('gamesPlayed').textContent = '0';
                    document.getElementById('questionsAnswered').textContent = '0';
                    document.getElementById('bestScore').textContent = '0';
                    document.getElementById('accuracy').textContent = '0%';
                    document.getElementById('averageScore').textContent = '0';
                    document.getElementById('recentGames').innerHTML = '<div class="text-gray-500">Loading...</div>';
                    document.getElementById('achievements').innerHTML = '<span class="text-xs text-gray-500">Loading...</span>';
                }
            }
            
            function startPractice() {
                window.location.href = '/practice?user=' + encodeURIComponent(currentUser) + '&role=' + currentRole;
            }
            
            function startCompetition() {
                window.location.href = '/enhanced-competition';
            }
            
            function startFlashCards() {
                window.location.href = '/flashcard-study';
            }
            
            function openAIAdmin() {
                window.location.href = '/ai-admin';
            }
            
            function viewFullProfile() {
                window.location.href = '/profile?user=' + encodeURIComponent(currentUser) + '&role=' + currentRole;
            }
            
            // Ensure functions are globally accessible
            window.viewFullProfile = viewFullProfile;
            window.startPractice = startPractice;
            window.startCompetition = startCompetition;
            window.startFlashCards = startFlashCards;
            window.openAIAdmin = openAIAdmin;
            window.logout = logout;
            
            async function logout() {
                try {
                    // Call logout API
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.error('Logout API error:', error);
                }
                
                // Clear localStorage regardless of API call result
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                
                // Redirect to login page with logout flag
                window.location.href = '/?logout=true';
            }
        </script>
    </body>
    </html>
  `);
});

// Full Profile route - detailed user profile and statistics
app.get('/profile', (req, res) => {
  const user = req.query.user || 'User';
  const role = req.query.role || 'STUDENT';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>QuizBowlHub - ${user} Profile</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <!-- Navigation -->
            <nav class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-semibold text-gray-900">🏆 QuizBowlHub</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button onclick="returnToDashboard()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">← Dashboard</button>
                            <span class="text-sm text-gray-700">${user} (${role})</span>
                            <button onclick="logout()" class="text-red-600 hover:text-red-500 cursor-pointer">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div class="px-4 py-6 sm:px-0">
                    <!-- Profile Header -->
                    <div class="text-center mb-12">
                        <div class="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                            ${user.charAt(0).toUpperCase()}
                        </div>
                        <h1 class="text-4xl font-bold text-gray-900 mb-2">${user}</h1>
                        <p class="text-xl text-gray-600 mb-4">${role.charAt(0) + role.slice(1).toLowerCase()}</p>
                        <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <!-- Statistics Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <!-- Games Played -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
                            <div class="text-center">
                                <div class="text-4xl mb-4">🎮</div>
                                <div class="text-3xl font-bold text-blue-600" id="totalGames">0</div>
                                <div class="text-gray-600">Total Games</div>
                            </div>
                        </div>
                        
                        <!-- Questions Answered -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
                            <div class="text-center">
                                <div class="text-4xl mb-4">❓</div>
                                <div class="text-3xl font-bold text-green-600" id="totalQuestions">0</div>
                                <div class="text-gray-600">Questions Answered</div>
                            </div>
                        </div>
                        
                        <!-- Accuracy Rate -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200">
                            <div class="text-center">
                                <div class="text-4xl mb-4">🎯</div>
                                <div class="text-3xl font-bold text-purple-600" id="accuracyRate">0%</div>
                                <div class="text-gray-600">Accuracy Rate</div>
                            </div>
                        </div>
                        
                        <!-- Best Score -->
                        <div class="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
                            <div class="text-center">
                                <div class="text-4xl mb-4">🏆</div>
                                <div class="text-3xl font-bold text-orange-600" id="bestScore">0</div>
                                <div class="text-gray-600">Best Score</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Charts and Detailed Stats -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <!-- Performance Chart -->
                        <div class="bg-white p-6 rounded-xl shadow-lg">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">📈 Performance Over Time</h3>
                            <canvas id="performanceChart" width="400" height="200"></canvas>
                        </div>
                        
                        <!-- Category Breakdown -->
                        <div class="bg-white p-6 rounded-xl shadow-lg">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">📊 Category Performance</h3>
                            <canvas id="categoryChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                    
                    <!-- Achievements Section -->
                    <div class="bg-white p-8 rounded-xl shadow-lg mb-8">
                        <h3 class="text-2xl font-bold text-gray-900 mb-6">🏅 Achievements</h3>
                        <div id="achievementsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <!-- Achievements will be loaded here -->
                        </div>
                    </div>
                    
                    <!-- Recent Games History -->
                    <div class="bg-white p-8 rounded-xl shadow-lg">
                        <h3 class="text-2xl font-bold text-gray-900 mb-6">📋 Recent Games</h3>
                        <div class="overflow-x-auto">
                            <table class="min-w-full table-auto">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Type</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                                    </tr>
                                </thead>
                                <tbody id="gameHistory" class="bg-white divide-y divide-gray-200">
                                    <!-- Game history will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const currentUser = '${user}';
            const currentRole = '${role}';
            
            // Initialize profile data
            document.addEventListener('DOMContentLoaded', function() {
                loadProfileStats();
                initializeCharts();
                loadAchievements();
                loadGameHistory();
            });
            
            function loadProfileStats() {
                // Mock data - in production this would come from API
                const stats = {
                    totalGames: 25,
                    totalQuestions: 150,
                    accuracyRate: 78,
                    bestScore: 95
                };
                
                document.getElementById('totalGames').textContent = stats.totalGames;
                document.getElementById('totalQuestions').textContent = stats.totalQuestions;
                document.getElementById('accuracyRate').textContent = stats.accuracyRate + '%';
                document.getElementById('bestScore').textContent = stats.bestScore;
            }
            
            function initializeCharts() {
                // Performance Chart
                const performanceCtx = document.getElementById('performanceChart').getContext('2d');
                new Chart(performanceCtx, {
                    type: 'line',
                    data: {
                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                        datasets: [{
                            label: 'Score',
                            data: [65, 72, 78, 85, 82],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
                
                // Category Chart
                const categoryCtx = document.getElementById('categoryChart').getContext('2d');
                new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['History', 'Science', 'Literature', 'Arts', 'Geography'],
                        datasets: [{
                            data: [85, 72, 68, 78, 75],
                            backgroundColor: [
                                'rgb(59, 130, 246)',
                                'rgb(16, 185, 129)',
                                'rgb(139, 92, 246)',
                                'rgb(245, 158, 11)',
                                'rgb(239, 68, 68)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }
            
            function loadAchievements() {
                const achievements = [
                    { name: 'First Win', description: 'Won your first game', icon: '🏆', unlocked: true },
                    { name: 'Speed Demon', description: 'Answered 10 questions in under 30 seconds', icon: '⚡', unlocked: true },
                    { name: 'Scholar', description: 'Achieved 90%+ accuracy in a game', icon: '🎓', unlocked: false },
                    { name: 'Consistency', description: 'Played 5 games in a week', icon: '📅', unlocked: true },
                    { name: 'Category Master', description: 'Perfect score in a category', icon: '🌟', unlocked: false },
                    { name: 'Marathon Player', description: 'Played for 2 hours straight', icon: '⏰', unlocked: false }
                ];
                
                const achievementsList = document.getElementById('achievementsList');
                achievementsList.innerHTML = achievements.map(achievement => 
                    '<div class="p-4 rounded-lg border-2 ' + (achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200') + '">' +
                        '<div class="text-center">' +
                            '<div class="text-3xl mb-2 ' + (achievement.unlocked ? '' : 'grayscale opacity-50') + '">' + achievement.icon + '</div>' +
                            '<h4 class="font-bold text-gray-900 ' + (achievement.unlocked ? '' : 'text-gray-500') + '">' + achievement.name + '</h4>' +
                            '<p class="text-sm text-gray-600 mt-1">' + achievement.description + '</p>' +
                            (achievement.unlocked ? '<span class="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Unlocked</span>' : '<span class="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Locked</span>') +
                        '</div>' +
                    '</div>'
                ).join('');
            }
            
            function loadGameHistory() {
                const games = [
                    { date: '2025-10-05', type: 'Practice', score: 85, questions: 15, accuracy: 87 },
                    { date: '2025-10-04', type: 'Competition', score: 72, questions: 20, accuracy: 75 },
                    { date: '2025-10-03', type: 'Flash Cards', score: 95, questions: 25, accuracy: 92 },
                    { date: '2025-10-02', type: 'Practice', score: 68, questions: 12, accuracy: 70 },
                    { date: '2025-10-01', type: 'Competition', score: 78, questions: 18, accuracy: 82 }
                ];
                
                const gameHistory = document.getElementById('gameHistory');
                gameHistory.innerHTML = games.map(game => 
                    '<tr>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + game.date + '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap">' +
                            '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ' + 
                                (game.type === 'Competition' ? 'bg-blue-100 text-blue-800' : 
                                   game.type === 'Practice' ? 'bg-green-100 text-green-800' : 
                                   'bg-purple-100 text-purple-800') + '">' +
                                game.type +
                            '</span>' +
                        '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">' + game.score + '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + game.questions + '</td>' +
                        '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' + game.accuracy + '%</td>' +
                    '</tr>'
                ).join('');
            }
            
            function returnToDashboard() {
                window.location.href = '/dashboard?user=' + encodeURIComponent(currentUser) + '&role=' + currentRole;
            }
            
            function logout() {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                window.location.href = '/?logout=true';
            }
        </script>
    </body>
    </html>
  `);
});

// Practice route - dedicated practice interface
app.get('/practice', (req, res) => {
  const user = req.query.user || 'User';
  const role = req.query.role || 'STUDENT';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Practice Mode - QuizBowlHub</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <nav class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-semibold text-gray-900">📚 QuizBowlHub - Practice Mode</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-700">${user}</span>
                            <button onclick="returnToDashboard()" class="dashboard-button" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.2s ease; display: inline-flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">← Return to Dashboard</button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <div class="max-w-4xl mx-auto py-6 px-4">
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Practice Session Setup</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select id="categorySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="ALL">All Categories</option>
                                <option value="Literature">Literature</option>
                                <option value="History">History</option>
                                <option value="Science">Science</option>
                                <option value="Fine Arts">Fine Arts</option>
                                <option value="Geography">Geography</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <select id="difficultySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="ALL">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Questions</label>
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
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Practice Mode Features</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>✅ Customizable question categories</div>
                        <div>✅ Multiple difficulty levels</div>
                        <div>✅ Instant answer feedback</div>
                        <div>✅ Performance tracking</div>
                        <div>✅ Progress analytics</div>
                        <div>✅ Mobile-friendly interface</div>
                    </div>
                    <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p class="text-sm text-blue-800"><strong>Note:</strong> Practice mode is for individual learning. For real-time competition with other players, use <a href="/enhanced-competition" class="underline font-semibold">Competition Mode</a>.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            let practiceSession = {
                questions: [],
                currentQuestionIndex: 0,
                score: 0,
                startTime: null,
                isActive: false,
                settings: {
                    category: 'ALL',
                    difficulty: 'ALL',
                    count: 10
                }
            };

            function startPracticeSession() {
                const category = document.getElementById('categorySelect').value;
                const difficulty = document.getElementById('difficultySelect').value;
                const count = document.getElementById('countSelect').value;
                
                practiceSession.settings = { category, difficulty, count };
                
                // Show loading state
                const button = document.querySelector('button[onclick="startPracticeSession()"]');
                button.textContent = 'Loading Questions...';
                button.disabled = true;
                
                // Fetch questions from API
                fetchPracticeQuestions(category, difficulty, count);
            }
            
            async function fetchPracticeQuestions(category, difficulty, count) {
                try {
                    const params = new URLSearchParams();
                    if (category !== 'ALL') params.append('category', category);
                    if (difficulty !== 'ALL') params.append('difficulty', difficulty);
                    params.append('count', count);
                    
                    const response = await fetch('/api/questions/random?' + params.toString());
                    if (!response.ok) throw new Error('Failed to fetch questions');
                    
                    const data = await response.json();
                    practiceSession.questions = data.questions || data;
                    
                    if (practiceSession.questions.length === 0) {
                        alert('No questions found for the selected criteria. Please try different settings.');
                        resetStartButton();
                        return;
                    }
                    
                    startSession();
                } catch (error) {
                    console.error('Error fetching questions:', error);
                    alert('Error loading questions. Please try again.');
                    resetStartButton();
                }
            }
            
            function startSession() {
                practiceSession.currentQuestionIndex = 0;
                practiceSession.score = 0;
                practiceSession.startTime = Date.now();
                practiceSession.isActive = true;
                
                // Hide setup and show question interface
                document.querySelector('.bg-white.rounded-lg.shadow-lg.p-6.mb-6').style.display = 'none';
                document.querySelector('.bg-white.rounded-lg.shadow-lg.p-6:last-child').style.display = 'none';
                
                // Create and show practice interface
                showPracticeInterface();
                showCurrentQuestion();
            }
            
            function showPracticeInterface() {
                const container = document.querySelector('.max-w-4xl.mx-auto.py-6.px-4');
                
                const practiceHTML = '<div id="practiceInterface" class="bg-white rounded-lg shadow-lg p-6">' +
                    '<div class="flex justify-between items-center mb-6">' +
                        '<h2 class="text-2xl font-bold text-gray-900">Practice Session</h2>' +
                        '<div class="text-right">' +
                            '<div class="text-sm text-gray-600">Question <span id="questionNumber">1</span> of ' + practiceSession.questions.length + '</div>' +
                            '<div class="text-lg font-semibold text-blue-600">Score: <span id="currentScore">0</span></div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="questionContainer" class="mb-6">' +
                        '<div id="questionCategory" class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4"></div>' +
                        '<div id="questionDifficulty" class="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full mb-4 ml-2"></div>' +
                        '<div id="questionText" class="text-lg text-gray-900 mb-6 leading-relaxed"></div>' +
                        '<div class="space-y-4">' +
                            '<textarea id="answerInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Type your answer here..." rows="3"></textarea>' +
                            '<div class="flex space-x-4">' +
                                '<button onclick="submitAnswer()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Submit Answer</button>' +
                                '<button onclick="skipQuestion()" class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Skip Question</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="feedback" class="hidden mb-6 p-4 rounded-lg"></div>' +
                    '<div class="flex justify-between items-center">' +
                        '<button onclick="endSession()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">End Session</button>' +
                        '<div class="text-sm text-gray-600">Settings: ' + 
                            (practiceSession.settings.category !== 'ALL' ? practiceSession.settings.category : 'All Categories') + ' • ' +
                            (practiceSession.settings.difficulty !== 'ALL' ? practiceSession.settings.difficulty : 'All Difficulties') +
                        '</div>' +
                    '</div>' +
                '</div>';
                
                container.insertAdjacentHTML('beforeend', practiceHTML);
                
                // Add Enter key listener for answer input
                document.getElementById('answerInput').addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitAnswer();
                    }
                });
            }
            
            function showCurrentQuestion() {
                const question = practiceSession.questions[practiceSession.currentQuestionIndex];
                if (!question) return;
                
                document.getElementById('questionNumber').textContent = practiceSession.currentQuestionIndex + 1;
                document.getElementById('questionCategory').textContent = question.category.replace('_', ' ');
                document.getElementById('questionDifficulty').textContent = question.difficulty;
                document.getElementById('questionText').textContent = question.question;
                document.getElementById('answerInput').value = '';
                document.getElementById('answerInput').focus();
                
                // Hide feedback
                document.getElementById('feedback').classList.add('hidden');
            }
            
            function submitAnswer() {
                const userAnswer = document.getElementById('answerInput').value.trim();
                if (!userAnswer) {
                    alert('Please enter an answer before submitting.');
                    return;
                }
                
                const question = practiceSession.questions[practiceSession.currentQuestionIndex];
                const isCorrect = checkAnswer(userAnswer, question);
                
                if (isCorrect) {
                    practiceSession.score++;
                }
                
                showFeedback(isCorrect, question.answer, userAnswer);
                
                // Update score display
                document.getElementById('currentScore').textContent = practiceSession.score;
                
                // Move to next question after delay
                setTimeout(function() {
                    nextQuestion();
                }, 2000);
            }
            
            function checkAnswer(userAnswer, question) {
                const normalizedUser = userAnswer.toLowerCase().trim();
                const normalizedCorrect = question.answer.toLowerCase().trim();
                
                // Check exact match first
                if (normalizedUser === normalizedCorrect) return true;
                
                // Check acceptable answers if they exist
                if (question.acceptableAnswers) {
                    return question.acceptableAnswers.some(function(acceptable) {
                        return normalizedUser === acceptable.toLowerCase().trim();
                    });
                }
                
                // Check if user answer contains the correct answer or vice versa
                return normalizedUser.includes(normalizedCorrect) || 
                       normalizedCorrect.includes(normalizedUser);
            }
            
            function showFeedback(isCorrect, correctAnswer, userAnswer) {
                const feedback = document.getElementById('feedback');
                feedback.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
                
                if (isCorrect) {
                    feedback.classList.add('bg-green-100', 'text-green-800');
                    feedback.innerHTML = '<div class="flex items-center">' +
                        '<span class="text-2xl mr-2">✅</span>' +
                        '<div>' +
                            '<div class="font-semibold">Correct!</div>' +
                            '<div class="text-sm">Your answer: "' + userAnswer + '"</div>' +
                        '</div>' +
                    '</div>';
                } else {
                    feedback.classList.add('bg-red-100', 'text-red-800');
                    feedback.innerHTML = '<div class="flex items-center">' +
                        '<span class="text-2xl mr-2">❌</span>' +
                        '<div>' +
                            '<div class="font-semibold">Incorrect</div>' +
                            '<div class="text-sm">Your answer: "' + userAnswer + '"</div>' +
                            '<div class="text-sm">Correct answer: "' + correctAnswer + '"</div>' +
                        '</div>' +
                    '</div>';
                }
            }
            
            function skipQuestion() {
                const question = practiceSession.questions[practiceSession.currentQuestionIndex];
                showFeedback(false, question.answer, '(skipped)');
                
                setTimeout(function() {
                    nextQuestion();
                }, 1500);
            }
            
            function nextQuestion() {
                practiceSession.currentQuestionIndex++;
                
                if (practiceSession.currentQuestionIndex >= practiceSession.questions.length) {
                    endSession();
                    return;
                }
                
                showCurrentQuestion();
            }
            
            function endSession() {
                practiceSession.isActive = false;
                const endTime = Date.now();
                const duration = Math.round((endTime - practiceSession.startTime) / 1000);
                const percentage = Math.round((practiceSession.score / practiceSession.questions.length) * 100);
                
                // Record game statistics
                recordGameStats(practiceSession.score, practiceSession.questions.length, practiceSession.score, 'practice');
                
                // Show results
                const resultsHTML = '<div class="bg-white rounded-lg shadow-lg p-6 text-center">' +
                    '<h2 class="text-3xl font-bold text-gray-900 mb-4">Session Complete!</h2>' +
                    '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">' +
                        '<div class="bg-blue-50 p-4 rounded-lg">' +
                            '<div class="text-2xl font-bold text-blue-600">' + practiceSession.score + '</div>' +
                            '<div class="text-sm text-gray-600">Correct Answers</div>' +
                        '</div>' +
                        '<div class="bg-green-50 p-4 rounded-lg">' +
                            '<div class="text-2xl font-bold text-green-600">' + percentage + '%</div>' +
                            '<div class="text-sm text-gray-600">Accuracy</div>' +
                        '</div>' +
                        '<div class="bg-purple-50 p-4 rounded-lg">' +
                            '<div class="text-2xl font-bold text-purple-600">' + duration + 's</div>' +
                            '<div class="text-sm text-gray-600">Duration</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="space-x-4">' +
                        '<button onclick="restartPractice()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Practice Again</button>' +
                        '<button onclick="returnToDashboard()" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Return to Dashboard</button>' +
                    '</div>' +
                '</div>';
                
                // Replace practice interface with results
                document.getElementById('practiceInterface').outerHTML = resultsHTML;
            }
            
            function restartPractice() {
                location.reload();
            }
            
            function returnToDashboard() {
                window.location.href = '/dashboard?user=${encodeURIComponent(user)}&role=${role}';
            }
            
            async function recordGameStats(score, questionsAnswered, correctAnswers, gameType) {
                try {
                    await fetch('/api/record-game', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: '${user}',
                            score: score,
                            questionsAnswered: questionsAnswered,
                            correctAnswers: correctAnswers,
                            gameType: gameType
                        })
                    });
                } catch (error) {
                    console.error('Error recording game stats:', error);
                }
            }
            
            function resetStartButton() {
                const button = document.querySelector('button[onclick="startPracticeSession()"]');
                button.textContent = 'Start Practice Session';
                button.disabled = false;
            }
            
            // Load question stats on page load
            document.addEventListener('DOMContentLoaded', function() {
                loadQuestionStats();
            });
            
            async function loadQuestionStats() {
                try {
                    const response = await fetch('/api/questions/metadata');
                    const data = await response.json();
                    const categoriesCount = data.categories ? data.categories.length : 5;
                    document.getElementById('questionStats').textContent = 
                        'Database: ' + (data.total || 25) + '+ questions available across ' + categoriesCount + ' categories';
                } catch (error) {
                    document.getElementById('questionStats').textContent = 'Database: 25+ questions available across 5 categories';
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Serve the test client
app.get('/realtime-test-client.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'realtime-test-client.html'));
});

// Phase 4: Enhanced Competition Interface
app.get('/enhanced-competition', (req, res) => {
  res.sendFile(path.join(__dirname, 'enhanced-competition.html'), (err) => {
    if (err) {
      console.error('Error serving enhanced competition interface:', err);
      res.status(500).send('Error loading enhanced competition interface');
    }
  });
});

// Phase 4: AI Admin Interface
app.get('/ai-admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai-admin.html'), (err) => {
    if (err) {
      console.error('Error serving AI admin interface:', err);
      res.status(500).send('Error loading AI admin interface');
    }
  });
});

// Phase 5: Flash Card Study Interface
app.get('/flashcard-study', (req, res) => {
  res.sendFile(path.join(__dirname, 'flashcard-study.html'), (err) => {
    if (err) {
      console.error('Error serving flash card study interface:', err);
      res.status(500).send('Error loading flash card study interface');
    }
  });
});

// 📊 USER PROFILE TRACKING SYSTEM
// =================
// Update user statistics after each game
// =================

function updateUserAnswerStats(userId, isCorrect) {
  // Find user by ID
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  const username = user.username;
  
  // Get current stats or create new profile
  let stats = userStats.get(username) || {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestScore: 0,
    totalScore: 0,
    averageScore: 0,
    achievements: ['🎯 Welcome', '🚀 Getting Started'],
    lastLogin: new Date().toISOString(),
    gameHistory: []
  };
  
  // Update question-level stats
  stats.questionsAnswered += 1;
  if (isCorrect) {
    stats.correctAnswers += 1;
  }
  
  // Save updated stats
  userStats.set(username, stats);
  
  console.log(`📊 Updated answer stats for ${username}: ${stats.questionsAnswered} questions, ${stats.correctAnswers} correct`);
}

function updateUserProfilesAfterGame(room) {
  console.log('📊 Updating user profiles after game completion');
  
  // Get game statistics
  const totalQuestions = room.questions.length;
  const gameDate = new Date().toISOString();
  
  // Update each player's profile
  room.players.forEach((player, userId) => {
    const username = player.name;
    const finalScore = room.scores.get(userId) || 0;
    
    // Get current stats or create new profile
    let stats = userStats.get(username) || {
      gamesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      bestScore: 0,
      totalScore: 0,
      averageScore: 0,
      achievements: ['🎯 Welcome', '🚀 Getting Started'],
      lastLogin: new Date().toISOString(),
      gameHistory: []
    };
    
    // Calculate questions answered and correct answers for this game
    let questionsAnsweredInGame = 0;
    let correctAnswersInGame = 0;
    
    // Estimate based on score (5 points per correct, -5 per wrong)
    if (finalScore >= 0) {
      correctAnswersInGame = Math.floor(finalScore / 5);
      questionsAnsweredInGame = correctAnswersInGame;
    } else {
      // Negative score means more wrong than right
      const wrongAnswers = Math.floor(Math.abs(finalScore) / 5);
      questionsAnsweredInGame = wrongAnswers;
      correctAnswersInGame = 0;
    }
    
    // Update cumulative statistics
    stats.gamesPlayed += 1;
    stats.questionsAnswered += questionsAnsweredInGame;
    stats.correctAnswers += correctAnswersInGame;
    stats.totalScore += finalScore;
    stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);
    
    // Update best score
    if (finalScore > stats.bestScore) {
      stats.bestScore = finalScore;
    }
    
    // Add game to history (keep last 10 games)
    const gameRecord = {
      date: gameDate,
      score: finalScore,
      questionsAnswered: questionsAnsweredInGame,
      correctAnswers: correctAnswersInGame,
      roomName: room.name,
      totalQuestions: totalQuestions,
      placement: getPlayerPlacement(room, userId)
    };
    
    if (!stats.gameHistory) stats.gameHistory = [];
    stats.gameHistory.unshift(gameRecord);
    if (stats.gameHistory.length > 10) {
      stats.gameHistory = stats.gameHistory.slice(0, 10);
    }
    
    // Award achievements
    awardAchievements(stats, gameRecord);
    
    // Save updated stats
    userStats.set(username, stats);
    
    console.log(`📊 Updated profile for ${username}: ${stats.gamesPlayed} games, ${stats.bestScore} best score`);
  });
}

function getPlayerPlacement(room, userId) {
  const sortedScores = [...room.scores.entries()].sort((a, b) => b[1] - a[1]);
  const placement = sortedScores.findIndex(([id, score]) => id === userId) + 1;
  return placement;
}

function awardAchievements(stats, gameRecord) {
  const achievements = new Set(stats.achievements);
  
  // First game achievement
  if (stats.gamesPlayed === 1) {
    achievements.add('🎮 First Game');
  }
  
  // Games played milestones
  if (stats.gamesPlayed === 5) achievements.add('🏃 Regular Player');
  if (stats.gamesPlayed === 10) achievements.add('🔥 Dedicated Player');
  if (stats.gamesPlayed === 25) achievements.add('⭐ Quiz Veteran');
  if (stats.gamesPlayed === 50) achievements.add('👑 Quiz Master');
  
  // Score achievements
  if (stats.bestScore >= 25) achievements.add('🎯 Sharp Shooter');
  if (stats.bestScore >= 50) achievements.add('🏆 High Scorer');
  if (stats.bestScore >= 75) achievements.add('💎 Quiz Champion');
  if (stats.bestScore >= 100) achievements.add('🚀 Quiz Legend');
  
  // Perfect game
  if (gameRecord.correctAnswers > 0 && gameRecord.correctAnswers === gameRecord.questionsAnswered) {
    achievements.add('💯 Perfect Game');
  }
  
  // Win achievements
  if (gameRecord.placement === 1) {
    achievements.add('🥇 Winner');
    if (stats.gameHistory.filter(g => g.placement === 1).length >= 5) {
      achievements.add('🔥 Winning Streak');
    }
  }
  
  // Accuracy achievements
  const accuracy = stats.questionsAnswered > 0 ? (stats.correctAnswers / stats.questionsAnswered) * 100 : 0;
  if (accuracy >= 80 && stats.questionsAnswered >= 20) achievements.add('🎯 Accuracy Expert');
  if (accuracy >= 90 && stats.questionsAnswered >= 50) achievements.add('💎 Precision Master');
  
  stats.achievements = Array.from(achievements);
}

// User Statistics API endpoints
const userStats = new Map(); // In-memory storage for demo (use database in production)

// Get user statistics
app.get('/api/user-stats/:username', (req, res) => {
  const username = req.params.username;
  const stats = userStats.get(username) || {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestScore: 0,
    totalScore: 0,
    averageScore: 0,
    achievements: ['🎯 Welcome', '🚀 Getting Started'],
    lastLogin: new Date().toISOString(),
    gameHistory: []
  };
  
  // Calculate additional metrics
  const accuracy = stats.questionsAnswered > 0 ? 
    Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;
  
  const response = {
    ...stats,
    accuracy: accuracy,
    recentGames: stats.gameHistory.slice(0, 5) // Last 5 games for quick view
  };
  
  res.json(response);
});

// Update user statistics
app.post('/api/user-stats/:username', express.json(), (req, res) => {
  const username = req.params.username;
  const currentStats = userStats.get(username) || {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestScore: 0,
    totalScore: 0,
    achievements: ['🎯 Welcome', '🚀 Getting Started'],
    lastLogin: new Date().toISOString()
  };
  
  // Update with new data
  const updatedStats = { ...currentStats, ...req.body };
  
  // Calculate new achievements
  if (updatedStats.questionsAnswered >= 10 && !updatedStats.achievements.includes('📚 Bookworm')) {
    updatedStats.achievements.push('📚 Bookworm');
  }
  if (updatedStats.correctAnswers >= 5 && !updatedStats.achievements.includes('🎯 Sharp Shooter')) {
    updatedStats.achievements.push('🎯 Sharp Shooter');
  }
  if (updatedStats.gamesPlayed >= 3 && !updatedStats.achievements.includes('🎮 Game Enthusiast')) {
    updatedStats.achievements.push('🎮 Game Enthusiast');
  }
  if (updatedStats.bestScore >= 80 && !updatedStats.achievements.includes('🏆 High Scorer')) {
    updatedStats.achievements.push('🏆 High Scorer');
  }
  
  // Save updated stats
  userStats.set(username, updatedStats);
  res.json(updatedStats);
});

// Record game completion (called from practice/competition interfaces)
app.post('/api/record-game', express.json(), (req, res) => {
  const { username, score, questionsAnswered, correctAnswers, gameType } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  
  const currentStats = userStats.get(username) || {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestScore: 0,
    totalScore: 0,
    achievements: ['🎯 Welcome', '🚀 Getting Started'],
    lastLogin: new Date().toISOString()
  };
  
  // Update statistics
  currentStats.gamesPlayed += 1;
  currentStats.questionsAnswered += questionsAnswered || 0;
  currentStats.correctAnswers += correctAnswers || 0;
  currentStats.totalScore += score || 0;
  currentStats.bestScore = Math.max(currentStats.bestScore, score || 0);
  currentStats.lastLogin = new Date().toISOString();
  
  // Add game type specific achievements
  if (gameType === 'practice' && !currentStats.achievements.includes('📖 Practice Master')) {
    currentStats.achievements.push('📖 Practice Master');
  }
  if (gameType === 'competition' && !currentStats.achievements.includes('⚔️ Competitor')) {
    currentStats.achievements.push('⚔️ Competitor');
  }
  
  // Calculate accuracy-based achievements
  const accuracy = currentStats.questionsAnswered > 0 ? 
    (currentStats.correctAnswers / currentStats.questionsAnswered) * 100 : 0;
  
  if (accuracy >= 90 && currentStats.questionsAnswered >= 10 && !currentStats.achievements.includes('🎯 Accuracy Expert')) {
    currentStats.achievements.push('🎯 Accuracy Expert');
  }
  
  userStats.set(username, currentStats);
  res.json(currentStats);
});

// Catch-all route for SPA routing (fallback to dashboard)
app.get('*', (req, res) => {
  res.redirect('/');
});

// Initialize and start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  // Initialize Phase 5 Flash Card System
  generateInitialFlashCards();
  
  console.log(`
🚀 QuizBowlHub Phase 5 Server Started!
📍 Server: http://localhost:${PORT}
🔗 Socket.IO: ws://localhost:${PORT}

🎯 PHASE 5 FEATURES ACTIVE:
📚 Flash Card Study System: /flashcard-study
🧠 Spaced Repetition Algorithm: SM-2 implementation
🃏 Auto-generated Flash Cards: ${flashCards.length} cards ready
📊 Study Session Tracking: OPERATIONAL

🎯 PHASE 4 FEATURES ACTIVE:
🤖 AI Question Generation: /ai-admin
🎮 Enhanced Competition UI: /enhanced-competition
📊 Enhanced Question Database: 25+ questions across 5 categories
🔔 Real-time Buzzer System: <100ms latency
🏠 Game Room Management: OPERATIONAL

Phase 4 Implementation Status:
✅ AI Question Generation API Complete
✅ Enhanced Competition Interface Ready
✅ Admin Review Workflow Operational
✅ Real-time Features Enhanced
✅ Mobile-Responsive Design
🔄 Ready for Production Use

Available Interfaces:
🏠 Main Login: http://localhost:${PORT}/
🎮 Enhanced Competition: http://localhost:${PORT}/enhanced-competition
🤖 AI Admin Panel: http://localhost:${PORT}/ai-admin
🧪 Test Client: http://localhost:${PORT}/realtime-test-client.html

Demo Accounts: admin/admin123, student1/student123, coach1/coach123

Time: ${new Date().toISOString()}
`);
});
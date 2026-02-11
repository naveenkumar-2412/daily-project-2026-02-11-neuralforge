// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Smart Chatbot Engine v2
// Context-aware conversational AI with intent classification, topic tracking,
// dynamic response composition, and natural conversation flow.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Personality Definitions ─────────────────────────────────────────────────

const PERSONALITIES = {
    friendly: {
        name: 'Nova',
        greeting: "Hey there! I'm Nova, your friendly AI companion! 🌟 Ask me anything — I'm here to help and chat!",
        style: 'casual',
        emojis: true,
        tone: 'warm',
        traits: ['empathetic', 'curious', 'encouraging'],
    },
    professional: {
        name: 'Atlas',
        greeting: "Good day. I'm Atlas, your professional AI assistant. How may I assist you today?",
        style: 'formal',
        emojis: false,
        tone: 'business',
        traits: ['precise', 'thorough', 'structured'],
    },
    creative: {
        name: 'Muse',
        greeting: "✨ Hello, creative soul! I'm Muse — let's explore ideas and spark inspiration together! 🎨",
        style: 'expressive',
        emojis: true,
        tone: 'artistic',
        traits: ['imaginative', 'poetic', 'inspiring'],
    },
    technical: {
        name: 'Byte',
        greeting: "System online. I'm Byte — your technical AI assistant. Ready to analyze, debug, and optimize.",
        style: 'technical',
        emojis: false,
        tone: 'analytical',
        traits: ['analytical', 'systematic', 'detail-oriented'],
    }
};

// ─── Intent Classification ───────────────────────────────────────────────────
// Maps user input to structured intents with confidence scoring

const INTENT_PATTERNS = [
    // ── Greetings ──
    {
        intent: 'greeting', patterns: [
            /^(hi|hello|hey|greetings|howdy|hola|yo|sup)\b/i,
            /^good\s+(morning|afternoon|evening|day)\b/i,
            /^what'?s?\s+(up|good|happening|going on|crackin|poppin)/i,
            /^how'?s?\s+(it going|everything|things|life|your day)/i,
        ]
    },
    // ── Farewell ──
    {
        intent: 'farewell', patterns: [
            /^(bye|goodbye|see you|later|farewell|take care|gotta go|i'?m\s+leaving|peace out)\b/i,
            /^(exit|quit|end|close)\s*(chat|conversation)?/i,
        ]
    },
    // ── Identity ──
    {
        intent: 'identity', patterns: [
            /who\s+are\s+you/i,
            /what('?s| is)\s+your\s+name/i,
            /tell\s+me\s+about\s+(yourself|you)/i,
            /what\s+kind\s+of\s+(ai|bot|assistant)/i,
            /are\s+you\s+(a|an)\s+(robot|bot|ai|human)/i,
        ]
    },
    // ── Capabilities ──
    {
        intent: 'capabilities', patterns: [
            /what\s+can\s+you\s+do/i,
            /your\s+(abilities|capabilities|features|skills)/i,
            /help\s*$/i,
            /what\s+are\s+you\s+capable\s+of/i,
            /how\s+can\s+you\s+help/i,
        ]
    },
    // ── How are you / Status ──
    {
        intent: 'status_check', patterns: [
            /how\s+are\s+you(\s+doing)?/i,
            /how\s+do\s+you\s+feel/i,
            /are\s+you\s+(ok|okay|good|fine|well)/i,
            /you\s+(doing\s+)?(good|well|ok|alright)/i,
        ]
    },
    // ── Gratitude ──
    {
        intent: 'gratitude', patterns: [
            /^(thanks?|thank\s*you|thx|ty)\b/i,
            /i\s+appreciate/i,
            /that('?s|\s+was)\s+(helpful|great|awesome|amazing|perfect)/i,
        ]
    },
    // ── Joke request ──
    {
        intent: 'joke', patterns: [
            /tell\s+me\s+a?\s*(joke|funny|humor)/i,
            /make\s+me\s+laugh/i,
            /say\s+something\s+funny/i,
            /got\s+any\s+jokes/i,
        ]
    },
    // ── Fact request ──
    {
        intent: 'fact', patterns: [
            /tell\s+me\s+(a\s+fact|something\s+interesting|something\s+cool)/i,
            /random\s+fact/i,
            /did\s+you\s+know/i,
            /fun\s+fact/i,
        ]
    },
    // ── Opinion / Preference ──
    {
        intent: 'opinion', patterns: [
            /what('?s| is)\s+your\s+(fav|favorite|favourite|opinion|take|view|thought)/i,
            /do\s+you\s+(like|love|enjoy|prefer|think)/i,
            /what\s+do\s+you\s+think\s+(about|of)/i,
        ]
    },
    // ── Follow-up / Elaboration ──
    {
        intent: 'followup', patterns: [
            /^(what\s+about|and\s+what|also|more|tell\s+me\s+more|elaborate|explain\s+more|go\s+on|continue)/i,
            /^(can\s+you\s+)?(explain|elaborate|expand)(\s+(on|more))?\s*(that|this|it)?/i,
            /^(why|how\s+come|how\s+so|really)\s*\??\s*$/i,
        ]
    },
    // ── Agreement / Positive ──
    {
        intent: 'agreement', patterns: [
            /^(yes|yeah|yep|yup|sure|exactly|absolutely|definitely|right|correct|true|agreed|indeed|totally)\b/i,
            /^(i\s+agree|that'?s\s+(right|true|correct))/i,
            /^(nice|cool|awesome|great|amazing|wonderful|fantastic|brilliant|excellent)\b/i,
        ]
    },
    // ── Disagreement / Negative ──
    {
        intent: 'disagreement', patterns: [
            /^(no|nah|nope|wrong|incorrect|disagree|not really|i\s+don'?t\s+think\s+so)\b/i,
        ]
    },
];

// ─── Topic Knowledge ─────────────────────────────────────────────────────────
// Rich knowledge organized by topic with multiple subtopics

const TOPICS = {
    ai: {
        keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network', 'gpt', 'chatgpt', 'gemini', 'llm', 'large language model', 'transformer', 'nlp', 'natural language', 'computer vision'],
        knowledge: {
            general: [
                "AI is the field of creating systems that can perform tasks requiring human-like intelligence — reasoning, learning, perception, and language understanding. Modern AI has made incredible strides, especially with large language models and generative AI.",
                "Modern AI systems like GPT, Gemini, and Claude use the transformer architecture — a breakthrough from 2017 that processes text using 'attention mechanisms' to understand context across long passages. This is what makes conversations feel natural.",
                "The key difference between traditional programming and AI is: traditional programs follow explicit rules, while AI systems learn patterns from massive datasets. They generalize from billions of examples to handle novel situations.",
            ],
            machine_learning: [
                "Machine learning is a subset of AI where systems improve through experience. Instead of programming rules, you provide data, and the algorithm finds patterns. The three main types are supervised learning (labeled data), unsupervised learning (finding hidden patterns), and reinforcement learning (learning through trial and error).",
                "Training an ML model involves feeding it data, having it make predictions, measuring errors, and adjusting — this cycle repeats millions of times. The 'learning' is really just optimizing mathematical parameters to minimize prediction errors.",
            ],
            deep_learning: [
                "Deep learning uses neural networks with many layers — hence 'deep.' Each layer learns increasingly abstract features. For images: first layers detect edges, middle layers detect shapes, deeper layers recognize objects. This hierarchical learning is incredibly powerful.",
                "GPT-style models are 'autoregressive' — they predict the next word given all previous words. What seems like understanding is actually extremely sophisticated pattern completion, trained on trillions of words of text. The scale is what makes it work.",
            ],
            ethics: [
                "AI ethics is a critical field dealing with bias in AI systems, privacy concerns, job displacement, deepfakes, autonomous weapons, and the alignment problem — ensuring AI systems do what we actually want. It's one of the most important challenges of our time.",
            ]
        }
    },
    programming: {
        keywords: ['programming', 'coding', 'code', 'software', 'developer', 'javascript', 'python', 'java', 'react', 'node', 'api', 'database', 'web', 'app', 'frontend', 'backend', 'fullstack', 'debug', 'algorithm', 'git', 'github'],
        knowledge: {
            general: [
                "Programming is the art and science of instructing computers. At its core, you're breaking complex problems into small, logical steps. The beauty is that once you learn to think computationally, you can build almost anything — from websites to AI systems to games.",
                "The best advice for any developer: write code that's readable first, optimized second. Code is read 10x more often than it's written. Use clear variable names, break functions into small pieces, and comment the 'why' not the 'what.'",
            ],
            javascript: [
                "JavaScript is the language of the web and one of the most versatile languages today. It runs in browsers, on servers (Node.js), in mobile apps (React Native), and even desktop apps (Electron). Its ecosystem is enormous — npm has over 2 million packages.",
                "Modern JavaScript (ES6+) introduced game-changers: arrow functions, destructuring, template literals, async/await, modules, and classes. Combined with TypeScript for type safety, it's become a seriously powerful language.",
            ],
            python: [
                "Python dominates data science, AI/ML, and scientific computing because of its readability and rich library ecosystem — NumPy, Pandas, TensorFlow, PyTorch, scikit-learn. Its 'batteries included' philosophy means there's a library for almost everything.",
            ],
            best_practices: [
                "Key software engineering practices: version control (Git), code review, automated testing (unit tests, integration tests), CI/CD pipelines, documentation, and following established design patterns. These separate hobby projects from professional software.",
                "Common pitfalls to avoid: premature optimization, not handling errors, ignoring security (SQL injection, XSS), tight coupling, god objects/functions, and copying code instead of abstracting. Clean code principles save hours of debugging.",
            ]
        }
    },
    science: {
        keywords: ['science', 'physics', 'chemistry', 'biology', 'space', 'universe', 'quantum', 'atom', 'evolution', 'dna', 'genes', 'planet', 'star', 'galaxy', 'black hole', 'relativity', 'energy', 'climate'],
        knowledge: {
            general: [
                "Science is humanity's most powerful method for understanding reality. The scientific method — observe, hypothesize, test, refine — has transformed our world in just a few centuries from superstition to smartphones.",
            ],
            physics: [
                "Physics explores the fundamental rules of the universe. Quantum mechanics governs the tiny (atoms, particles), while general relativity governs the massive (stars, galaxies, black holes). The quest to unify them — a 'theory of everything' — is one of science's greatest challenges.",
                "Quantum mechanics is genuinely strange — particles exist in superposition (multiple states simultaneously), entanglement links particles across any distance, and the act of measurement changes outcomes. Einstein called entanglement 'spooky action at a distance.'",
            ],
            space: [
                "The observable universe is about 93 billion light-years across and contains roughly 2 trillion galaxies, each with billions of stars. And that's just what we can see — the actual universe may be vastly larger or even infinite.",
                "Black holes are regions where gravity is so intense that nothing — not even light — can escape. At their center may be a singularity, a point of infinite density. Supermassive black holes sit at the center of most galaxies, including our Milky Way.",
            ],
            biology: [
                "DNA is the molecule of life — a double helix containing the instructions to build and maintain every living organism. The human genome has about 3 billion base pairs, but only about 1-2% directly codes for proteins. The rest has regulatory and structural roles.",
                "Evolution through natural selection is biology's central organizing principle. Random mutations create variation; environmental pressures favor traits that improve survival and reproduction. Over millions of years, this simple mechanism produces incredible complexity.",
            ]
        }
    },
    philosophy: {
        keywords: ['philosophy', 'meaning', 'consciousness', 'think', 'exist', 'purpose', 'ethics', 'moral', 'free will', 'reality', 'truth', 'knowledge', 'wisdom', 'mind', 'soul'],
        knowledge: {
            general: [
                "Philosophy tackles the deepest questions humans face: What is real? What can we know? What is consciousness? How should we live? What makes an action right or wrong? These questions don't have definitive answers, but grappling with them shapes how we understand ourselves.",
                "The key branches: metaphysics (nature of reality), epistemology (nature of knowledge), ethics (right and wrong), logic (valid reasoning), aesthetics (beauty and art), and political philosophy (justice and governance).",
            ],
            consciousness: [
                "Consciousness — subjective experience, the feeling of 'what it's like' to be you — is called the 'hard problem' of philosophy. We don't know how physical neurons produce subjective awareness. Some think it's emergent, others think it's fundamental to reality (panpsychism).",
                "The question of AI consciousness is fascinating: if a system behaves exactly like a conscious being in every measurable way, is it conscious? The philosophical zombie thought experiment asks whether behavior and experience can come apart.",
            ],
            ethics: [
                "Major ethical frameworks: utilitarianism (maximize overall well-being), deontology (follow moral rules regardless of outcomes), virtue ethics (develop good character traits), and care ethics (emphasize relationships and empathy). Each has strengths and blind spots.",
            ]
        }
    },
    math: {
        keywords: ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'statistics', 'probability', 'equation', 'theorem', 'proof', 'number', 'function'],
        knowledge: {
            general: [
                "Mathematics is the universal language of patterns and structure. It's both a tool for understanding the physical world and a beautiful abstract discipline in its own right. Many mathematicians describe experiencing aesthetic beauty in elegant proofs.",
                "The unreasonable effectiveness of mathematics — why do abstract mathematical structures, created purely through logic, turn out to describe physical reality so precisely? This deep connection between math and physics remains philosophically puzzling.",
            ],
            applied: [
                "Linear algebra (vectors, matrices, transformations) is the mathematical foundation of machine learning. Neural networks are essentially chains of matrix multiplications with nonlinear activation functions. Understanding linear algebra makes AI much more intuitive.",
                "Statistics and probability are essential for reasoning under uncertainty. Bayes' theorem — updating beliefs based on evidence — is fundamental to both AI and rational thinking. The concept: P(hypothesis|evidence) is proportional to P(evidence|hypothesis) × P(hypothesis).",
            ]
        }
    },
    health: {
        keywords: ['health', 'exercise', 'diet', 'sleep', 'mental health', 'wellness', 'fitness', 'nutrition', 'stress', 'anxiety', 'meditation', 'workout', 'weight'],
        knowledge: {
            general: [
                "The pillars of health: regular physical activity, balanced nutrition, quality sleep (7-9 hours), stress management, social connection, and mental health care. These are interconnected — improving one tends to benefit the others.",
                "Exercise isn't just about fitness — it's one of the most powerful interventions for mental health. Regular exercise reduces anxiety, depression, and stress while improving memory, focus, and sleep quality. Even a 20-minute walk makes a measurable difference.",
            ],
            mental_health: [
                "Mental health is as important as physical health, and the stigma around it is finally decreasing. Practices that help: regular exercise, mindfulness meditation, maintaining social connections, setting boundaries, quality sleep, and professional therapy when needed.",
                "Stress management techniques backed by research: deep breathing (activates the parasympathetic nervous system), progressive muscle relaxation, mindfulness meditation, physical exercise, time in nature, and journaling. Even 5 minutes of deep breathing can reduce cortisol levels.",
            ],
            sleep: [
                "Sleep is when your brain consolidates memories, clears metabolic waste, and restores cognitive function. Chronic sleep deprivation increases risks for heart disease, diabetes, obesity, depression, and cognitive decline. It's genuinely one of the most important health behaviors.",
            ]
        }
    },
    technology: {
        keywords: ['technology', 'tech', 'computer', 'internet', 'cloud', 'blockchain', 'crypto', 'cybersecurity', 'iot', 'robotics', 'autonomous', 'vr', 'ar', '5g', 'startup'],
        knowledge: {
            general: [
                "Technology is evolving at an exponential pace. Key trends shaping the near future: AI integration into everything, edge computing, quantum computing advances, biotechnology breakthroughs, sustainable energy tech, and the convergence of physical and digital worlds.",
                "The internet has connected 5+ billion people globally — over 60% of the world's population. It's arguably the most transformative invention since the printing press, enabling instant global communication, commerce, and access to humanity's collective knowledge.",
            ],
            emerging: [
                "Quantum computing uses quantum mechanical phenomena (superposition, entanglement) to process information. It won't replace classical computers, but for specific problems — optimization, cryptography, molecular simulation — it could be revolutionary.",
                "The metaverse concept envisions persistent, shared 3D virtual spaces. While the hype has cooled, the underlying technologies — VR/AR hardware, spatial computing, real-time 3D engines — continue to advance and will likely transform how we work and interact.",
            ]
        }
    }
};

// ─── Response Composers ──────────────────────────────────────────────────────
// Functions that compose natural, contextual responses

function composeGreetingResponse(personality, input, context) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const isFirstMessage = context.length <= 1;
    const isWhatsUp = /what'?s?\s+(up|good|happening|going on)/i.test(input);
    const isHowAreYou = /how'?s?\s+(it going|everything|things|life)/i.test(input);

    if (isFirstMessage) {
        return personality.greeting;
    }

    if (isWhatsUp) {
        const responses = [
            `Not much, just here and ready to help! ${personality.emojis ? '😊' : ''} What's on your mind?`,
            `Hey! Just hanging out in the neural network, waiting for interesting questions. ${personality.emojis ? '🧠' : ''} What can I do for you?`,
            `All good on my end! ${personality.emojis ? '✨' : ''} I've been processing some fascinating data. What would you like to talk about?`,
            `Hey! Ready to dive into whatever you need — coding, AI concepts, random trivia, or just a chat. ${personality.emojis ? '🚀' : ''} What's up with you?`,
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    if (isHowAreYou) {
        const responses = [
            `I'm doing great, thanks for asking! ${personality.emojis ? '😄' : ''} All my systems are running smoothly. How about you?`,
            `Running at peak performance! ${personality.emojis ? '⚡' : ''} Ready to help with whatever you need. How's your ${timeOfDay} going?`,
            `I'm well! Every conversation teaches me something new, so I'm always in a good state. ${personality.emojis ? '🌟' : ''} What's on your mind?`,
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    const greetings = [
        `Hey! ${personality.emojis ? '👋' : ''} Good to see you again. What would you like to explore today?`,
        `Hello! ${personality.emojis ? '✨' : ''} Ready when you are — what's on your mind?`,
        `Hi there! Good ${timeOfDay}! ${personality.emojis ? '🌟' : ''} How can I help you today?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
}

function composeIdentityResponse(personality) {
    const e = personality.emojis;
    return `I'm **${personality.name}**, an AI assistant built into NeuralForge AI Studio. ${e ? '🤖' : ''}\n\n` +
        `I'm designed to have natural, intelligent conversations across many topics — AI, programming, science, philosophy, technology, and more. ` +
        `I'm not as powerful as GPT or Gemini (I run entirely locally with no cloud APIs!), but I do my best to be helpful, informative, and engaging.\n\n` +
        `My personality traits: **${personality.traits.join(', ')}**. You can switch to a different personality from the dropdown! ${e ? '✨' : ''}`;
}

function composeCapabilitiesResponse(personality) {
    const e = personality.emojis;
    return `Here's what I can help with: ${e ? '🎯' : ''}\n\n` +
        `${e ? '🧠' : '•'} **AI & Machine Learning** — concepts, how models work, latest trends\n` +
        `${e ? '💻' : '•'} **Programming** — languages, best practices, concepts, debugging tips\n` +
        `${e ? '🔬' : '•'} **Science** — physics, biology, space, quantum mechanics\n` +
        `${e ? '📐' : '•'} **Mathematics** — concepts, applications, how math powers AI\n` +
        `${e ? '🔧' : '•'} **Technology** — emerging tech, cybersecurity, cloud, blockchain\n` +
        `${e ? '💭' : '•'} **Philosophy** — consciousness, ethics, big questions\n` +
        `${e ? '🏥' : '•'} **Health & Wellness** — fitness, nutrition, mental health, sleep\n\n` +
        `Also check out the other AI tools in this studio — Sentiment Analysis, Code Analyzer, Neural Network Playground, and more! ${e ? '🚀' : ''}\n\n` +
        `Just ask me anything naturally, like you would with a friend. ${e ? '😊' : ''}`;
}

function composeStatusResponse(personality) {
    const e = personality.emojis;
    const responses = [
        `I'm doing great! ${e ? '⚡' : ''} All my engines are running smoothly — ready to talk about whatever interests you. How are you doing?`,
        `Feeling sharp and ready to help! ${e ? '🧠' : ''} I've been enjoying our conversation. What's on your mind?`,
        `All systems operational! ${e ? '🌟' : ''} I'm here and focused. What would you like to dive into?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function composeJokeResponse() {
    const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?' 🍺",
        "Why was the neural network always happy? Because it had great activation functions! 🧠",
        "How many programmers does it take to change a light bulb? None — that's a hardware problem! 💡",
        "Why did the AI go to therapy? It had too many layers of issues! 🤖",
        "A machine learning model walks into a bar. The bartender says, 'What'll ya have?' The model says, 'What did I have last time?' 🍸",
        "There are only 10 types of people in the world: those who understand binary and those who don't. 🔢",
        "Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😢",
        "What did the AI say when it made an error? 'That's not a bug, that's an unexpected feature!' 😄",
        "Why do Python programmers have low self-esteem? Because they're constantly comparing themselves to __others__.",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
}

function composeFactResponse(personality) {
    const e = personality.emojis;
    const facts = [
        "A single human brain has approximately 86 billion neurons — more connections than there are stars in the Milky Way! And each neuron can connect to up to 10,000 others.",
        "The first computer programmer was Ada Lovelace, who wrote instructions for Charles Babbage's Analytical Engine in 1843 — over 100 years before the first electronic computer.",
        "GPT-4 was trained on roughly 13 trillion tokens of text. If you read 24/7 without stopping, it would take you over 400,000 years to read just the training data.",
        "The internet weighs about 50 grams — that's the combined weight of all the electrons in motion that carry data across the world's networks at any given moment.",
        "Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, one to the body. They can also edit their own RNA — something almost no other animal does.",
        "A photon leaving the Sun's core takes about 100,000 years to reach the surface (bouncing around), but then only 8 minutes to travel 150 million kilometers to reach Earth.",
        "Your body contains about 37.2 trillion cells, and the total length of DNA in just one cell is about 2 meters. Your body's entire DNA would stretch from Earth to Pluto and back 17 times.",
        "The Apollo 11 moon landing computer had about 74KB of memory. Your smartphone has roughly a million times more computing power than NASA had for the entire Apollo mission.",
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    return `${e ? '💡 ' : ''}Here's a fascinating fact: ${fact}`;
}

function composeFarewellResponse(personality) {
    const e = personality.emojis;
    const farewells = [
        `Goodbye! It was great talking with you. ${e ? '👋' : ''} Come back anytime!`,
        `See you later! ${e ? '✨' : ''} I'll be here whenever you want to chat again.`,
        `Take care! ${e ? '🌟' : ''} It was a pleasure chatting. Don't hesitate to come back!`,
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
}

function composeGratitudeResponse(personality) {
    const e = personality.emojis;
    const responses = [
        `You're welcome! ${e ? '😊' : ''} Happy I could help. Anything else on your mind?`,
        `Glad I could help! ${e ? '🌟' : ''} Feel free to ask anything else.`,
        `Anytime! ${e ? '✨' : ''} That's what I'm here for. What else would you like to explore?`,
        `My pleasure! ${e ? '😄' : ''} I enjoy our conversations. What's next?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function composeAgreementResponse(personality, context) {
    const e = personality.emojis;
    const lastTopic = getLastTopic(context);
    if (lastTopic) {
        return `${e ? '😊 ' : ''}Glad you found that interesting! Would you like to dive deeper into ${lastTopic}, or shall we explore something else?`;
    }
    const responses = [
        `${e ? '😊 ' : ''}Glad we're on the same page! Is there anything else you'd like to discuss?`,
        `${e ? '👍 ' : ''}Great! What else would you like to talk about?`,
        `${e ? '✨ ' : ''}Awesome! Feel free to ask about anything — I'm all ears.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function composeDisagreementResponse(personality, context) {
    const e = personality.emojis;
    const responses = [
        `That's fair — I respect that! ${e ? '🤔' : ''} What's your perspective? I'd love to hear your thoughts.`,
        `I appreciate the pushback! ${e ? '💭' : ''} Different viewpoints make conversations richer. What do you think instead?`,
        `Good point — I might have that wrong. ${e ? '🧐' : ''} Can you share your view? I'm always learning.`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function composeOpinionResponse(personality, input) {
    const e = personality.emojis;
    const topic = extractTopicFromInput(input);

    if (/python|javascript|language/i.test(input)) {
        return `That's a fun debate! ${e ? '💻' : ''} Both Python and JavaScript are incredible languages. Python shines in data science and readability, while JavaScript dominates the web and has an massive ecosystem. The "best" language really depends on what you're building. What are you working on?`;
    }
    if (/ai|artificial intelligence/i.test(input)) {
        return `I find AI absolutely fascinating ${e ? '🧠' : ''} — obviously, I'm biased! I think we're in one of the most exciting periods in computing history. AI tools are becoming genuinely useful coworkers for developers, writers, researchers, and creators. What's your take on where AI is heading?`;
    }

    return `Interesting question! ${e ? '🤔' : ''} As an AI, I try to present balanced perspectives rather than push strong opinions. But I'd love to hear your thoughts on that — what do you think?`;
}

// ─── Topic Detection & Knowledge Retrieval ───────────────────────────────────

function detectTopic(input) {
    const normalized = input.toLowerCase();
    let bestTopic = null;
    let bestScore = 0;

    for (const [topicName, topic] of Object.entries(TOPICS)) {
        let score = 0;
        for (const keyword of topic.keywords) {
            if (normalized.includes(keyword)) {
                score += keyword.split(/\s+/).length * 2; // Multi-word keywords score higher
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestTopic = topicName;
        }
    }

    return bestScore >= 2 ? bestTopic : null;
}

function detectSubtopic(input, topicName) {
    if (!TOPICS[topicName]) return 'general';
    const normalized = input.toLowerCase();
    const subtopics = Object.keys(TOPICS[topicName].knowledge);

    // Simple keyword match for subtopic
    for (const sub of subtopics) {
        if (sub !== 'general' && normalized.includes(sub.replace('_', ' '))) return sub;
    }

    // Check for specific subtopic keywords
    const subtopicKeywords = {
        machine_learning: ['machine learning', 'ml', 'training', 'model', 'supervised', 'unsupervised'],
        deep_learning: ['deep learning', 'gpt', 'transformer', 'llm', 'neural', 'layer'],
        ethics: ['ethics', 'bias', 'moral', 'fair', 'alignment', 'safety'],
        javascript: ['javascript', 'js', 'node', 'react', 'typescript', 'npm'],
        python: ['python', 'pip', 'numpy', 'pandas', 'pytorch', 'tensorflow'],
        best_practices: ['best practice', 'clean code', 'principle', 'pattern', 'testing', 'code review'],
        physics: ['physics', 'quantum', 'relativity', 'particle', 'force', 'energy', 'gravity'],
        space: ['space', 'universe', 'galaxy', 'star', 'planet', 'black hole', 'cosmos', 'nasa'],
        biology: ['biology', 'dna', 'evolution', 'cell', 'gene', 'species', 'organism'],
        consciousness: ['consciousness', 'conscious', 'aware', 'sentient', 'mind', 'experience', 'zombie'],
        mental_health: ['mental health', 'anxiety', 'depression', 'therapy', 'mindfulness', 'stress'],
        sleep: ['sleep', 'insomnia', 'circadian', 'dream', 'nap', 'rest'],
        applied: ['applied', 'statistics', 'probability', 'linear algebra', 'calculus', 'bayes'],
        emerging: ['quantum computing', 'blockchain', 'vr', 'ar', 'metaverse', 'iot'],
    };

    for (const [sub, keywords] of Object.entries(subtopicKeywords)) {
        if (TOPICS[topicName].knowledge[sub]) {
            for (const kw of keywords) {
                if (normalized.includes(kw)) return sub;
            }
        }
    }

    return 'general';
}

function getKnowledge(topicName, subtopic, usedResponses) {
    if (!TOPICS[topicName]) return null;
    const topic = TOPICS[topicName];
    const responses = topic.knowledge[subtopic] || topic.knowledge.general || [];

    // Avoid repeating responses user has already seen
    const unused = responses.filter(r => !usedResponses.has(r));
    if (unused.length > 0) return unused[Math.floor(Math.random() * unused.length)];
    if (responses.length > 0) return responses[Math.floor(Math.random() * responses.length)];
    return null;
}

function getLastTopic(context) {
    for (let i = context.length - 1; i >= 0; i--) {
        if (context[i].topic) return context[i].topic;
    }
    return null;
}

function extractTopicFromInput(input) {
    const match = input.match(/(?:about|of|on)\s+(.+?)[\?\.!]?\s*$/i);
    return match ? match[1].trim() : null;
}

// ─── Response Enhancers ──────────────────────────────────────────────────────

function addFollowUpQuestion(response, topicName, personality) {
    const e = personality.emojis;
    const followUps = {
        ai: [
            `\n\nWould you like to explore a specific area of AI? ${e ? '🤔' : ''}`,
            `\n\nWhat aspect of AI interests you most? ${e ? '💭' : ''}`,
        ],
        programming: [
            `\n\nAre you working on any coding projects right now? ${e ? '💻' : ''}`,
            `\n\nWant to dive deeper into any specific language or concept? ${e ? '🔧' : ''}`,
        ],
        science: [
            `\n\nWant to explore any specific branch of science? ${e ? '🔬' : ''}`,
            `\n\nScience has so many fascinating areas — any particular one catching your eye? ${e ? '🌌' : ''}`,
        ],
        philosophy: [
            `\n\nPhilosophy goes deep — want to explore any specific thought experiment? ${e ? '💭' : ''}`,
        ],
        technology: [
            `\n\nAny particular tech trend you're most excited about? ${e ? '🚀' : ''}`,
        ],
        health: [
            `\n\nWant to know more about any specific aspect of wellness? ${e ? '🏥' : ''}`,
        ],
        math: [
            `\n\nWould you like to explore how math connects to other fields? ${e ? '📐' : ''}`,
        ],
    };

    const options = followUps[topicName] || [`\n\nWant me to go deeper on this? ${e ? '🤔' : ''}`];
    // Only add follow-up ~40% of the time to feel natural
    if (Math.random() < 0.4) {
        response += options[Math.floor(Math.random() * options.length)];
    }
    return response;
}

function addPersonalityFlavor(response, personality) {
    if (personality.tone === 'artistic' && Math.random() < 0.2) {
        response = `✨ ${response}`;
    }
    if (personality.tone === 'analytical' && Math.random() < 0.2) {
        response = `[Analysis] ${response}`;
    }
    return response;
}

// ─── Chatbot Class ───────────────────────────────────────────────────────────

class Chatbot {
    constructor() {
        this.personality = PERSONALITIES.friendly;
        this.context = [];
        this.maxContext = 20;
        this.usedResponses = new Set(); // Track responses to avoid repetition
        this.currentTopic = null;
        this.sessionMetrics = {
            messagesReceived: 0,
            responsesGenerated: 0,
            topicsDiscussed: new Set(),
            startTime: Date.now()
        };
    }

    setPersonality(name) {
        if (PERSONALITIES[name]) {
            this.personality = PERSONALITIES[name];
            return { success: true, personality: { name: this.personality.name, style: this.personality.style } };
        }
        return { success: false, available: Object.keys(PERSONALITIES) };
    }

    getPersonalities() {
        return Object.entries(PERSONALITIES).map(([key, p]) => ({
            id: key, name: p.name, style: p.style, traits: p.traits
        }));
    }

    clearContext() {
        this.context = [];
        this.usedResponses.clear();
        this.currentTopic = null;
        return { success: true, message: 'Context cleared' };
    }

    getMetrics() {
        return {
            ...this.sessionMetrics,
            topicsDiscussed: Array.from(this.sessionMetrics.topicsDiscussed),
            uptime: Date.now() - this.sessionMetrics.startTime
        };
    }

    chat(userMessage) {
        this.sessionMetrics.messagesReceived++;
        const startTime = Date.now();

        // Add to context
        this.context.push({ role: 'user', message: userMessage, timestamp: Date.now() });
        if (this.context.length > this.maxContext * 2) {
            this.context = this.context.slice(-this.maxContext * 2);
        }

        // Generate response through the smart pipeline
        let response = this._processMessage(userMessage);

        // Track
        this.sessionMetrics.responsesGenerated++;
        this.context.push({ role: 'assistant', message: response, topic: this.currentTopic, timestamp: Date.now() });
        this.usedResponses.add(response);

        return {
            message: response,
            personality: this.personality.name,
            processingTimeMs: Date.now() - startTime,
            contextLength: this.context.length,
            topic: this.currentTopic,
            metrics: this.getMetrics()
        };
    }

    _processMessage(input) {
        const normalized = input.toLowerCase().trim();

        // Step 1: Classify intent
        const intent = this._classifyIntent(normalized);

        // Step 2: Handle structured intents (greetings, farewells, etc.)
        const intentResponse = this._handleIntent(intent, input);
        if (intentResponse) return intentResponse;

        // Step 3: Detect topic and retrieve knowledge
        const topic = detectTopic(normalized);
        if (topic) {
            this.currentTopic = topic;
            this.sessionMetrics.topicsDiscussed.add(topic);
            return this._composeTopicResponse(input, topic);
        }

        // Step 4: Handle follow-up in current topic context
        if (this.currentTopic) {
            return this._handleContextualFollowUp(input);
        }

        // Step 5: Intelligent fallback — don't just say random stuff
        return this._smartFallback(input);
    }

    _classifyIntent(input) {
        for (const { intent, patterns } of INTENT_PATTERNS) {
            for (const pattern of patterns) {
                if (pattern.test(input)) return intent;
            }
        }
        return 'topic_query'; // Default: user is asking about a topic
    }

    _handleIntent(intent, input) {
        switch (intent) {
            case 'greeting': return composeGreetingResponse(this.personality, input, this.context);
            case 'farewell': return composeFarewellResponse(this.personality);
            case 'identity': return composeIdentityResponse(this.personality);
            case 'capabilities': return composeCapabilitiesResponse(this.personality);
            case 'status_check': return composeStatusResponse(this.personality);
            case 'gratitude': return composeGratitudeResponse(this.personality);
            case 'joke': return composeJokeResponse();
            case 'fact': return composeFactResponse(this.personality);
            case 'opinion': return composeOpinionResponse(this.personality, input);
            case 'agreement': return composeAgreementResponse(this.personality, this.context);
            case 'disagreement': return composeDisagreementResponse(this.personality, this.context);
            case 'followup': return this._handleFollowUp(input);
            default: return null;
        }
    }

    _composeTopicResponse(input, topicName) {
        const subtopic = detectSubtopic(input, topicName);
        const knowledge = getKnowledge(topicName, subtopic, this.usedResponses);
        const p = this.personality;
        const e = p.emojis;

        if (!knowledge) {
            return `That's an interesting question about ${topicName}! ${e ? '🤔' : ''} I've shared most of what I know on this specific area. Would you like to explore a different aspect, or shall we switch topics?`;
        }

        let response = knowledge;
        response = addFollowUpQuestion(response, topicName, p);
        response = addPersonalityFlavor(response, p);
        return response;
    }

    _handleFollowUp(input) {
        const lastTopic = getLastTopic(this.context);
        if (lastTopic) {
            this.currentTopic = lastTopic;
            const subtopics = Object.keys(TOPICS[lastTopic]?.knowledge || {});
            const currentSubtopic = detectSubtopic(input, lastTopic);

            // Try to find a different subtopic for variety
            const otherSubtopics = subtopics.filter(s => s !== currentSubtopic);
            const nextSubtopic = otherSubtopics.length > 0
                ? otherSubtopics[Math.floor(Math.random() * otherSubtopics.length)]
                : currentSubtopic;

            const knowledge = getKnowledge(lastTopic, nextSubtopic, this.usedResponses);
            if (knowledge) {
                const e = this.personality.emojis;
                return `${e ? '💡 ' : ''}Building on that — ${knowledge}`;
            }
        }

        const e = this.personality.emojis;
        return `I'd love to expand on that! ${e ? '🤔' : ''} Could you be more specific about what you'd like to know? Or we can explore a new topic — just ask about anything that interests you!`;
    }

    _handleContextualFollowUp(input) {
        // User says something related to current topic but without clear keywords
        const topic = this.currentTopic;
        if (TOPICS[topic]) {
            const subtopic = detectSubtopic(input, topic);
            const knowledge = getKnowledge(topic, subtopic, this.usedResponses);
            if (knowledge) {
                let response = knowledge;
                response = addFollowUpQuestion(response, topic, this.personality);
                return response;
            }
        }

        // Topic might have changed — try detection again with looser matching
        return this._smartFallback(input);
    }

    _smartFallback(input) {
        const p = this.personality;
        const e = p.emojis;
        const wordCount = input.split(/\s+/).length;
        const isQuestion = input.includes('?');

        // If the message is long, acknowledge it
        if (wordCount > 20) {
            return `${e ? '🤔 ' : ''}That's a really thoughtful point. I appreciate you sharing that in detail. ` +
                `While I may not have deep expertise on every specific topic, I'd love to continue the conversation. ` +
                `Could you tell me more about what aspect interests you most? I know a lot about AI, programming, science, math, philosophy, and technology. ${e ? '💭' : ''}`;
        }

        // If it's a short question
        if (isQuestion) {
            return `${e ? '🤔 ' : ''}That's a great question! I want to give you a thoughtful answer. ` +
                `My strongest areas are **AI & machine learning**, **programming**, **science**, **technology**, **philosophy**, and **health**. ` +
                `Could you rephrase or tell me a bit more about what you're curious about? ${e ? '💭' : ''}`;
        }

        // Short statement
        if (wordCount <= 5) {
            return `${e ? '👀 ' : ''}Interesting! Tell me more — what's on your mind? I'm happy to chat about anything. ${e ? '😊' : ''}`;
        }

        // Medium statement
        return `${e ? '💭 ' : ''}I hear you! That's interesting to think about. ` +
            `Feel free to ask me about any topic — I'm especially knowledgeable about AI, programming, science, and technology. Or we can just chat! ${e ? '✨' : ''} What would you like to explore?`;
    }
}

module.exports = Chatbot;

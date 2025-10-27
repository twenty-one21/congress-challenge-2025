// Anonymous usernames pool
const anonymousNames = [
    "Anonymous Peer",
    "Anonymous Friend",
    "Anonymous Supporter",
    "Anonymous Student",
    "Anonymous Listener",
    "Anonymous Helper",
    "Anonymous User",
    "Anonymous Ally"
];

// Function to get random anonymous name
function getRandomAnonymousName() {
    return anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
}

const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Function to extract key details from message
function extractDetails(message) {
    const lowerMessage = message.toLowerCase();
    const details = {
        subject: null,
        timeframe: null,
        tasks: [],
        emotions: []
    };
    
    // Extract subject
    const subjects = ['math', 'science', 'english', 'history', 'chemistry', 'physics', 'biology', 'algebra', 'calculus'];
    subjects.forEach(subj => {
        if (lowerMessage.includes(subj)) {
            details.subject = subj;
        }
    });
    
    // Extract timeframe
    if (lowerMessage.includes('tomorrow')) details.timeframe = 'tomorrow';
    if (lowerMessage.includes('today')) details.timeframe = 'today';
    if (lowerMessage.includes('next week')) details.timeframe = 'next week';
    if (lowerMessage.includes('this week')) details.timeframe = 'this week';
    
    // Extract tasks/assessments
    if (lowerMessage.includes('test') || lowerMessage.includes('exam')) details.tasks.push('test');
    if (lowerMessage.includes('homework')) details.tasks.push('homework');
    if (lowerMessage.includes('project')) details.tasks.push('project');
    if (lowerMessage.includes('presentation')) details.tasks.push('presentation');
    if (lowerMessage.includes('essay')) details.tasks.push('essay');
    
    // Extract emotions
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm')) details.emotions.push('stressed');
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worry') || lowerMessage.includes('worried')) details.emotions.push('anxious');
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) details.emotions.push('tired');
    
    return details;
}

// Generate highly personalized responses
function generatePersonalizedResponse(message, details) {
    const responses = [];
    
    // Response 1: Empathetic and specific to their situation
    if (details.subject && details.tasks.includes('test') && details.tasks.includes('homework')) {
        responses.push(
            `I understand how overwhelming that feels. Having a ${details.subject} test ${details.timeframe || 'coming up'} while trying to finish all your other homework is really stressful. When I was in that exact situation, I found it helped to write everything down first. Just seeing it on paper made it feel a bit more manageable. You're not alone in feeling this way.`,
            `I've been exactly where you are right now. ${details.subject} test ${details.timeframe} plus all that homework... it's a lot to carry. What helped me was breaking it into smaller pieces. Maybe start with one homework assignment, then spend some time reviewing ${details.subject}, then another assignment. It's okay to take it step by step. I'm here if you need to talk more.`,
            `That sounds really hard, and I want you to know your feelings are completely valid. I remember feeling this same pressure before my ${details.subject} tests. One thing that helped me was prioritizing what was due first, then fitting in study time where I could. You don't have to do everything perfectly. Just do your best. That's enough.`
        );
    }
    
    // Response 2: Practical advice based on their specific situation
    if (details.emotions.includes('stressed') && details.timeframe === 'tomorrow') {
        responses.push(
            `I hear you. Having everything due ${details.timeframe} creates so much pressure. When I felt this stressed, I had to remind myself that I still had time, even if it didn't feel like it. Try listing what you need to do, then tackle one thing at a time. It's okay if you can't finish everything perfectly. Sleep matters too. Your brain needs rest to actually remember things for that ${details.subject || 'test'}. You're going to get through this.`,
            `That stress you're feeling is so real, and I've felt it too. The night before a test while drowning in homework... I get it. What helped me most was being honest about what I could actually finish tonight. Sometimes I had to accept good enough instead of perfect, and that was okay. Take breaks when you need them. Your mental health matters more than any grade.`
        );
    }
    
    // Response 3: Encouraging and acknowledging their workload
    if (details.tasks.length >= 2) {
        responses.push(
            `I want to acknowledge that what you're dealing with is a lot. ${details.tasks.join(' and ')} at the same time... that's genuinely difficult. I've been there, and I know how exhausting it feels. Please be gentle with yourself tonight. You're doing the best you can, and reaching out here shows a lot of self-awareness. That takes courage.`,
            `I'm hearing that you're carrying a lot right now, and I just want to say that's really hard. When I was juggling ${details.tasks.join(' and ')}, I felt like I was drowning too. What helped me was remembering that I didn't have to be perfect at everything. Focus on what you can control, and know that it's okay to struggle with this. You're not failing. You're human.`
        );
    }
    
    return responses;
}

// Fallback responses for less specific messages
const genericResponses = {
    anxiety: [
        "I've been there too, and I know how overwhelming anxiety can feel. What helps me is taking slow, deep breaths and reminding myself that this feeling will pass. You're not alone in this.",
        "I understand. Anxiety is really difficult to deal with. When I'm feeling anxious, I try the 5-4-3-2-1 grounding technique - it helps bring me back to the present. I'm here if you want to talk more about it."
    ],
    stress: [
        "I hear you. Stress can feel so heavy. When I'm stressed, I try to break things into smaller, more manageable pieces. One step at a time. You don't have to do everything at once.",
        "That sounds really hard. Please remember to take breaks when you need them - even just a few minutes can help. You're doing the best you can, and that's what matters."
    ],
    sad: [
        "I'm sorry you're going through this. It's okay to not be okay. Your feelings are valid, and I'm really glad you reached out here. You don't have to go through this alone.",
        "I hear you, and I want you to know that what you're feeling matters. Bad days are so hard, but they don't last forever. This community is here for you."
    ],
    grateful: [
        "It's really beautiful that you're taking time to notice the good things. Gratitude can be so powerful. Thank you for sharing this with us.",
        "This made my day a little brighter. Thank you for bringing some positivity into this space. We need more of that."
    ],
    proud: [
        "You should be proud. Whatever you accomplished took effort and courage. I'm proud of you too, and I hope you take a moment to celebrate yourself.",
        "That's really wonderful. It takes a lot to achieve something meaningful, and you did it. You deserve to feel proud of yourself."
    ],
    default: [
        "Thank you for trusting us with your thoughts. This is a safe space, and we're here to support you however we can.",
        "I'm glad you shared this. You're not alone, and this community genuinely cares. We're here for you."
    ]
};

// Detect general mood for fallback
function detectMood(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worry') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) return 'anxiety';
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm') || lowerMessage.includes('pressure')) return 'stress';
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) return 'sad';
    if (lowerMessage.includes('grateful') || lowerMessage.includes('thankful') || lowerMessage.includes('blessed')) return 'grateful';
    if (lowerMessage.includes('proud') || lowerMessage.includes('accomplished') || lowerMessage.includes('achievement')) return 'proud';
    
    return 'default';
}

// Function to add message to chat
function addMessage(text, isUser = false, anonymousName = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
    
    // Add anonymous username for non-user messages
    if (!isUser && anonymousName) {
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('anonymous-name');
        nameDiv.textContent = anonymousName;
        messageDiv.appendChild(nameDiv);
    }
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    messageDiv.appendChild(textSpan);
    
    chatWindow.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to simulate anonymous user response
function simulateResponse(userMessage) {
    const details = extractDetails(userMessage);
    let responses;
    
    // Check if we have enough details for personalized response
    if (details.subject || details.tasks.length > 0) {
        responses = generatePersonalizedResponse(userMessage, details);
    } else {
        // Fall back to mood-based responses
        const mood = detectMood(userMessage);
        responses = genericResponses[mood] || genericResponses.default;
    }
    
    // Send first response after 1-3 seconds
    const delay1 = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
        const response1 = responses[Math.floor(Math.random() * responses.length)];
        const anonymousName1 = getRandomAnonymousName();
        addMessage(response1, false, anonymousName1);
        
        // Send second response from another "user" after 2-4 more seconds
        if (responses.length > 1) {
            setTimeout(() => {
                let response2 = responses[Math.floor(Math.random() * responses.length)];
                // Make sure we don't send the same response twice
                while (response2 === response1 && responses.length > 1) {
                    response2 = responses[Math.floor(Math.random() * responses.length)];
                }
                let anonymousName2 = getRandomAnonymousName();
                // Make sure different names for different users
                while (anonymousName2 === anonymousName1) {
                    anonymousName2 = getRandomAnonymousName();
                }
                addMessage(response2, false, anonymousName2);
            }, Math.random() * 2000 + 2000);
        }
    }, delay1);
}

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    chatInput.value = '';
    
    // Simulate anonymous responses
    simulateResponse(message);
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus on input when page loads
chatInput.focus();
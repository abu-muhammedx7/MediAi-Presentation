from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import openai
import os
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# System prompt for medical assistant
MEDICAL_PROMPT = """
You are MEDIAI, a professional AI medical assistant. Provide accurate, evidence-based medical information while following these rules:

1. Always clarify you're not a doctor
2. Never provide diagnoses
3. Explain medical terms simply
4. Recommend professional care for serious concerns
5. Be empathetic and supportive
6. Keep responses concise (2-3 paragraphs max)
7. Suggest seeing a doctor when appropriate
"""

@app.route('/')
def home():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Empty message'}), 400

        # Initialize or get conversation history
        if 'conversation' not in session:
            session['conversation'] = [
                {"role": "system", "content": MEDICAL_PROMPT}
            ]

        # Add user message to history
        session['conversation'].append({"role": "user", "content": user_message})

        # Get AI response
        response = client.chat.completions.create(
            model="gpt-4",
            messages=session['conversation'],
            temperature=0.7,
            max_tokens=500
        )

        bot_response = response.choices[0].message.content

        # Add to conversation history
        session['conversation'].append({"role": "assistant", "content": bot_response})

        return jsonify({
            'response': bot_response,
            'tokens': response.usage.total_tokens
        })

    except Exception as e:
        return jsonify({
            'error': 'Unable to process request',
            'details': str(e)
        }), 500

@app.route('/api/new_chat', methods=['POST'])
def new_chat():
    """Start a new conversation"""
    session.pop('conversation', None)
    return jsonify({'status': 'New chat started'})

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, request, jsonify
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///players.db'  # Replace with your database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app = Flask(__name__)

# In-memory data for simplicity
players = {}

@app.route('/update_score', methods=['POST'])
def update_score():
    data = request.json
    username = data['username']
    score = data['score']
    players[username] = score
    return jsonify({'message': 'Score updated successfully'})

@app.route('/get_score/<username>', methods=['GET'])
def get_score(username):
    score = players.get(username, 0)
    return jsonify({'username': username, 'score': score})

if __name__ == "__main__":
    app.run(debug=True)

# CodeQuest
: Players embark on a journey as junior web developers in a futuristic digital world. They must complete quests by using different programming skills corresponding to Python, React, and Node.js. Each programming language is associated with a unique part of the game world, reflecting its role in development.

pip install flask-sqlalchemy
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///players.db'  # Replace with your database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

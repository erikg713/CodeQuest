from typing import List, Dict, Optional
from models import Player, GameSession
import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self, db_path='game.db'):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Players table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS players (
                    username TEXT PRIMARY KEY,
                    display_name TEXT,
                    created_at TIMESTAMP,
                    total_score INTEGER DEFAULT 0,
                    sessions_played INTEGER DEFAULT 0,
                    achievements TEXT DEFAULT '[]'
                )
            ''')
            
            # Game sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT,
                    level_id TEXT,
                    score INTEGER,
                    completed_at TIMESTAMP,
                    collectibles INTEGER DEFAULT 0,
                    time_taken INTEGER DEFAULT 0,
                    achievements TEXT DEFAULT '[]',
                    FOREIGN KEY (username) REFERENCES players (username)
                )
            ''')
            
            # High scores table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS high_scores (
                    username TEXT,
                    level_id TEXT,
                    score INTEGER,
                    achieved_at TIMESTAMP,
                    PRIMARY KEY (username, level_id),
                    FOREIGN KEY (username) REFERENCES players (username)
                )
            ''')
            
            conn.commit()

    def player_exists(self, username: str) -> bool:
        """Check if a player exists"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT 1 FROM players WHERE username = ?', (username,))
            return cursor.fetchone() is not None

    def add_player(self, player: Player) -> None:
        """Add a new player"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO players (username, display_name, created_at)
                VALUES (?, ?, ?)
            ''', (player.username, player.display_name, player.created_at))
            conn.commit()

    def get_player(self, username: str) -> Optional[Player]:
        """Get player by username"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT username, display_name, created_at, total_score, 
                       sessions_played, achievements
                FROM players 
                WHERE username = ?
            ''', (username,))
            row = cursor.fetchone()
            
            if not row:
                return None
                
            player = Player(
                username=row[0],
                display_name=row[1],
                created_at=datetime.fromisoformat(row[2])
            )
            player.total_score = row[3]
            player.sessions_played = row[4]
            player.achievements = json.loads(row[5])
            return player

    def add_game_session(self, session: GameSession) -> None:
        """Add a new game session"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO game_sessions (
                    username, level_id, score, completed_at,
                    collectibles, time_taken, achievements
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                session.username, session.level_id, session.score,
                session.completed_at, session.collectibles,
                session.time_taken, json.dumps(session.achievements)
            ))
            
            # Update player stats
            cursor.execute('''
                UPDATE players 
                SET total_score = total_score + ?,
                    sessions_played = sessions_played + 1
                WHERE username =

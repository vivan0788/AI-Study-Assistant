from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client.get_database("study_assistant_db")

# Collections
users_col = db["users"]
pdfs_col = db["pdfs"]
chats_col = db["chats"]
quizzes_col = db["quizzes"]
flashcards_col = db["flashcards"]
planners_col = db["planners"]

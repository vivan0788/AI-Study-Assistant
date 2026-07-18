import urllib.parse
from pymongo import MongoClient
from config import Config

# Agar password mein special characters hain to unhe safe string mein convert karne ke liye:
# MongoDB URI ko parse karke password handle karna
uri = Config.MONGO_URI

try:
    # Yeh code check karein ki password encoded hai ya nahi
    if "@" in uri and ":" in uri.split("@")[0]:
        prefix, suffix = uri.split("@", 1)
        scheme, credentials = prefix.split("://", 1)
        username, password = credentials.split(":", 1)
        
        # Sirf password ko safe encode kar rahe hain
        encoded_password = urllib.parse.quote_plus(password)
        uri = f"{scheme}://{username}:{encoded_password}@{suffix}"
except Exception as e:
    print("URI parsing check skipped:", e)

client = MongoClient(uri)
db = client.get_database("study_assistant_db")

# Collections
users_col = db["users"]
pdfs_col = db["pdfs"]
chats_col = db["chats"]
quizzes_col = db["quizzes"]
flashcards_col = db["flashcards"]
planners_col = db["planners"]

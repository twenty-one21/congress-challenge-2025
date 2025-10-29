from flask import Flask, redirect, url_for, session
from flask import render_template
from dotenv import load_dotenv
from requests_oauthlib import OAuth2Session
import os

load_dotenv()  # loads variables from .env

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

app = Flask(__name__)
app.secret_key = os.urandom(24)  # for session encryption

# google oauth2 config
REDIRECT_URI = "http://localhost:5000/callback"

AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/auth"
TOKEN_URL = "https://accounts.google.com/o/oauth2/token"
USER_INFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

SCOPE = ['https://www.googleapis.com/auth/userinfo.email',
         'https://www.googleapis.com/auth/userinfo.profile']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    google = OAuth2Session(CLIENT_ID, scope=SCOPE, redirect_uri=REDIRECT_URI)
    authorization_url, state = google.authorization_url(
        AUTHORIZATION_BASE_URL,
        access_type="offline", prompt="select_account"
    )
    session['oauth_state'] = state
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    google = OAuth2Session(CLIENT_ID, state=session['oauth_state'], redirect_uri=REDIRECT_URI)
    token = google.fetch_token(TOKEN_URL, client_secret=CLIENT_SECRET,
                               authorization_response=request.url)

    session['oauth_token'] = token
    user_info = google.get(USER_INFO_URL).json()
    return f"Hello, {user_info['name']}! Email: {user_info['email']}"

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
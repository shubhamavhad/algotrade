from flask import Flask, request, jsonify, redirect
from kiteconnect import KiteConnect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_for_jwt'
API_KEY = None
API_SECRET = None

REDIRECT_URI = 'http://localhost:8082/auth/callback'

@app.route('/login', methods=['POST'])
def login():
    global API_KEY, API_SECRET
    data = request.get_json()
    if 'api_key' in data and 'api_secret' in data:
        API_KEY = data['api_key']
        API_SECRET = data['api_secret']
        kite = KiteConnect(api_key=API_KEY)
        login_url = kite.login_url()
        return jsonify({"Info":"Authentication is completed"}),200
    else:
        return jsonify({"error": "Missing API key or API secret"}), 400

@app.route('/auth/callback', methods=['POST'])
def auth_callback():
    global API_KEY, API_SECRET
    data = request.get_json()
    if 'api_key' in data and 'api_secret' in data:
        provided_api_key = data['api_key']
        provided_api_secret = data['api_secret']
        if provided_api_key == API_KEY and provided_api_secret == API_SECRET:
            # Initialize KiteConnect object with the provided API_KEY
            kite = KiteConnect(api_key=API_KEY)

            # Extract request token from the URL parameters
            request_token = request.args.get('request_token')

            # Generate access token using the request token
            session_data = kite.generate_session(request_token, api_secret=API_SECRET)
            access_token = session_data["access_token"]

            # Perform further actions with the access token, such as placing orders
            # For demonstration, you can print the access token
            print("Access Token:", access_token)

            return jsonify({"message": "Authentication successful"})
        else:
            return jsonify({"error": "Invalid API key or API secret"}), 401
    else:
        return jsonify({"error": "Missing API key or API secret"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8082)

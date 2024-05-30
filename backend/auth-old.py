from flask import Flask, request, jsonify, redirect
from kiteconnect import KiteConnect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_for_jwt'
API_KEY = None  # Initialize API_KEY with None
API_SECRET = None  # Initialize API_SECRET with None

# Redirect URL after successful authentication
REDIRECT_URI = 'http://localhost:8082/auth/callback'

# Endpoint to initiate the login process
@app.route('/login', methods=['POST'])
def login():
    global API_KEY, API_SECRET  # Declare API_KEY and API_SECRET as global variables
    data = request.get_json()
    if 'api_key' in data and 'api_secret' in data:
        API_KEY = data['api_key']
        API_SECRET = data['api_secret']
        kite = KiteConnect(api_key=API_KEY)
        login_url = kite.login_url()
        return redirect(login_url)
    else:
        return jsonify({"error": "Missing API key or API secret"}), 400

# Callback endpoint to handle the response after authentication
@app.route('/auth/callback',methods=['POST'])
def auth_callback():
    global API_KEY, API_SECRET  # Declare API_KEY and API_SECRET as global variables
    if API_KEY is None or API_SECRET is None:
        return jsonify({"error": "API key or API secret not set"}), 400

    # Initialize KiteConnect object with the provided API_KEY
    kite = KiteConnect(api_key=API_KEY)

    # Extract request token from the URL parameters
    request_token = request.args.get('request_token')

    # Generate access token using the request token
    data = kite.generate_session(request_token, api_secret=API_SECRET)
    access_token = data["access_token"]

    # Perform further actions with the access token, such as placing orders
    # For demonstration, you can print the access token
    print("Access Token:", access_token)

    return jsonify({"message": "Authentication successful"})

if __name__ == '__main__':
    app.run(debug=True, port=8082)

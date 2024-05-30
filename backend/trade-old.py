from flask import Flask, request, jsonify
from kiteconnect import KiteConnect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_for_jwt'
API_KEY = None
API_SECRET = None
kite = None  # Shared instance of KiteConnect
REDIRECT_URI = 'http://localhost:8082/auth/callback'

def get_instrument_ids(api_key, api_secret):
    global kite
    if kite is None:
        kite = KiteConnect(api_key=api_key)
    # Fetch instruments for BSE
    bse_instruments = kite.instruments("BSE")
    bse_instrument_ids = [instrument["instrument_token"] for instrument in bse_instruments]
    
    # Fetch instruments for NSE
    nse_instruments = kite.instruments("NSE")
    nse_instrument_ids = [instrument["instrument_token"] for instrument in nse_instruments]
    
    return bse_instrument_ids, nse_instrument_ids

# Endpoint to set API key and API secret, initiate KiteConnect,
# generate request token, and authenticate user
@app.route('/set_credentials', methods=['POST'])
def set_credentials():
    global API_KEY, API_SECRET, kite
    data = request.get_json()
    if 'api_key' in data and 'api_secret' in data:
        API_KEY = data['api_key']
        API_SECRET = data['api_secret']
        kite = KiteConnect(api_key=API_KEY)
        # Generate the login URL
        login_url = kite.login_url()
        return jsonify({"login_url": login_url}), 200
    else:
        return jsonify({"error": "Missing API key or API secret"}), 400

# Callback endpoint to handle the response after authentication
@app.route('/auth/callback', methods=['POST'])
def auth_callback():
    global kite
    data = request.get_json()
    if 'request_token' in data:
        try:
            if kite is None:
                kite = KiteConnect(api_key=API_KEY)
            request_token = data['request_token']
            # Exchange request token for access token
            session_data = kite.generate_session(request_token, api_secret=API_SECRET)
            access_token = session_data["access_token"]
            kite.set_access_token(access_token)
            return jsonify({"message": "Authentication successful"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    else:
        return jsonify({"error": "Missing request token"}), 400

# Endpoint to retrieve instrument IDs
@app.route('/instrument_ids', methods=['GET'])
def instrument_ids():
    global API_KEY, API_SECRET
    if API_KEY is None or API_SECRET is None:
        return jsonify({"error": "API key or API secret not set"}), 400

    bse_ids, nse_ids = get_instrument_ids(API_KEY, API_SECRET)
    response = {
        "BSE Instrument IDs": bse_ids,
        "NSE Instrument IDs": nse_ids
    }
    return jsonify(response), 200

# Endpoint to place order
@app.route('/place_order', methods=['POST'])
def place_order():
    data = request.get_json()
    quantity = data.get('quantity')
    price = data.get('price')
    instrument_token = data.get('instrument_token')
    exchange_token = data.get('exchange_token')
    # Authenticate user
    if kite is None:
        return jsonify({"error": "KiteConnect is not initialized"}), 400

    try:
        # Place order using Kite Connect API
        order_id = kite.place_order(
            variety='regular',             # Add variety parameter
            product='CNC',                 # Add product parameter
            tradingsymbol=instrument_token,
            transaction_type='BUY',
            exchange=exchange_token,
            quantity=quantity,
            order_type='MARKET',
            price=price,                   # Optional parameter
            # validity='DAY',
            # disclosed_quantity=10,
            # trigger_price=105.0,
            # squareoff=2.0,
            # stoploss=1.0,
            # trailing_stoploss=3.0,
            # tag='my_order_tag'
        )

        return jsonify({"order_id": order_id}), 200
    except Exception as e:
        # Handle exception when order placement fails
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8082)

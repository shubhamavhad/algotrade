from flask import Flask, request, jsonify
from kiteconnect import KiteConnect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'algo_trade@kS3m!n@2024'
API_KEY = None
API_SECRET = None
kite = None  # Shared instance of KiteConnect
REDIRECT_URI = 'http://localhost:8082/auth/callback'

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


@app.route('/stocks/get')
def fetchNSEStocks():
    try:
        instruments = kite.instruments()
        nseStockList = []

        # Filter instruments to include only NSE stocks
        for instrument in instruments:
            if instrument['exchange'] == 'NSE':
                nseStockList.append(instrument)

        return jsonify(nseStockList), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Endpoint to place an order
# Endpoint to place an order (both regular and mutual fund)
@app.route("/place_order", methods=["POST"])
def place_order():
    try:
        # Assuming request.json contains the order details
        order_details = request.json
        if "tradingsymbol" in order_details and order_details["tradingsymbol"].startswith("INF"):
            # If tradingsymbol starts with "INF", it's a mutual fund order
            order_id = kite.place_mf_order(**order_details)
        else:
            # Otherwise, it's a regular order
            order_id = kite.place_order(variety=kite.VARIETY_REGULAR, **order_details)
        return jsonify({"status": "success", "order_id": order_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# Endpoint to place a mutual fund order
@app.route("/place_mf_order", methods=["POST"])
def place_mf_order():
    try:
        # Assuming request.json contains the mutual fund order details
        mf_order_details = request.json
        order_id = kite.place_mf_order(**mf_order_details)
        return jsonify({"status": "success", "order_id": order_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# Endpoint to cancel a mutual fund order
@app.route("/cancel_mf_order", methods=["POST"])
def cancel_mf_order():
    try:
        # Assuming request.json contains the order_id to cancel
        order_id = request.json["order_id"]
        kite.cancel_mf_order(order_id=order_id)
        return jsonify({"status": "success", "message": "Order cancelled successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
# Endpoint to cancel an order
@app.route("/cancel_order", methods=["POST"])
def cancel_order():
    try:
        # Assuming request.json contains the order_id to cancel
        order_id = request.json["order_id"]
        kite.cancel_order(order_id=order_id)
        return jsonify({"status": "success", "message": "Order cancelled successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
# Endpoint to retrieve instrument IDs
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
if __name__ == '__main__':
    app.run(debug=True, port=8082)

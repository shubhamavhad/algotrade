#Imports of important Modules
import traceback
import bcrypt
from flask import *
from flask import logging
from kiteconnect import KiteConnect
from flask_pymongo import PyMongo
from org import *
from user import *
from account import *
from stocks import *
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import timedelta

# from werkzeug.security import generate_password_hash 





#Configuration & Initialization Part of Flask Application

blueprint = Blueprint('algo-trade', __name__, static_folder='static', static_url_path='/algo-trade/static')
app = Flask(__name__)
CORS(app)
app.secret_key = 'otp'
jwt = JWTManager(app)
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)
app.config["MONGO_URI"] = "mongodb://admin:password@nrdbms.web.ksemin.in:30001"
# app.config["MONGO_URI"] = "mongodb://localhost:27017"

mongo = PyMongo(app)
API_KEY = None
API_SECRET = None



#Swagger UI Implementation



#Application Routes and Definations
@app.route("/")
def home():
    return render_template('login.html')


@app.route('/token', methods=['GET'])
def token():
    # Retrieve the access token from the query parameters
    access_token = request.args.get('token')

    # Render the HTML template with the access token
    return render_template('token.html', access_token=access_token)

    


@app.route('/login/api', methods=['POST'])
def login_api():
    if request.method == 'POST':
        auth = request.json
        username = auth.get('username')
        password = auth.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
        else:
            user = get_user_email(username)
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
                # Assuming you don't want to return the password in the response
                access_token = create_access_token(identity=username)
                return jsonify({'access_token': access_token, 'userRole': user['userRole'], 'userId': user['id'], 'name': user['name']}), 200
            else:
                return jsonify({'error': 'User not found or incorrect password'}), 404
    else:
        return jsonify({'error': 'Method not allowed'}), 405

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        auth = request.json
        username = auth.get('username')
        password = auth.get('password')
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400
        else:
            user = get_user_email(username)
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
                # Assuming you don't want to return the password in the response
                access_token = create_access_token(identity=username)
                return jsonify({'access_token': access_token, 'userRole': user['userRole'], 'orgId': user['orgId'], 'id': user['id'],'name':user['name']}), 200
            else:
                return   jsonify({'error': 'User not found or incorrect password'}), 404
    else:
        return jsonify({'error': 'Method not allowed'}), 405


#Error Handlers

@app.errorhandler(404)
def not_found(error = None):
    message = {
        'status':404,
        'message':"Not Found" + request.url
    }
    resp = jsonify(message)
    resp.status_code = 404
    return resp

@app.errorhandler(409)
def conflict(error):
    return jsonify({"error": str(error)}), 409

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": str(error)}), 400

#End of Error Handlers


#user function 

@app.route('/users/register', methods=['POST'])
def userRegister():
    form_data = request.json
    response, status_code = add_user(form_data)
    if status_code == 201:
        return jsonify({'message': response}), 201
    elif status_code == 409:
        return jsonify({'error': response}), status_code  # User name already exists
    else:
        return jsonify({'error': response}), status_code  # Other error
    


@app.route('/users/list')
@jwt_required()
def userList():
    users_data, status_code = get_all_users()
    if status_code == 200:
        return users_data
    else:
        return jsonify({'error': users_data}), status_code
    
@app.route('/users/byid/', methods=['POST'])
@jwt_required()
def userListID():
    data = request.json
    userId = data.get('id')
    if not userId:
        return jsonify({'error': 'userid is required'}), 400

    users_data, status_code = get_user(userId)
    if status_code == 200:
        return jsonify(users_data)
    else:
        return jsonify({'error': users_data}), status_code

    
# get the user by orgId
@app.route('/users/orgs/', methods=['POST'])
@jwt_required()
def userOrgList():
    data = request.json
    orgId = data.get('orgId')
    if not orgId:
        return jsonify({'error': 'orgId is required'}), 400

    users_data, status_code = getuser_orgId(orgId)
    if status_code == 200:
        return jsonify(users_data)
    else:
        return jsonify({'error': users_data}), status_code

@app.route('/users/edit/<string:user_id>', methods=['PUT'])
@jwt_required()
def userUpdateApi(user_id):
    updated_data = request.json
    message, status_code = update_user(user_id, updated_data)
    return jsonify({'message': message}), status_code

@app.route('/users/delete/<string:user_id>', methods=['DELETE'])
@jwt_required()
def userDeleteApi(user_id):
    try:
        response, status_code = delete_user(user_id)
        if status_code == 200:
            return jsonify({'message': response}), 200
        elif status_code == 404:
            app.logger.error(f"User with ID {user_id} not found.")
            return jsonify({'error': response}), 404
        else:
            app.logger.error(f"Failed to delete user with ID {user_id}. Error: {response}")
            return jsonify({'error': 'Internal Server Error'}), 500
    except Exception as e:
        app.logger.exception("An error occurred while processing the delete request")
        return jsonify({'error': 'Internal Server Error'}), 500




#User Roles Part

@app.route('/roles/list')
@jwt_required()
def rolesList():
    roles_data, status_code = get_all_roles()
    if status_code == 200:
        return roles_data
    else:
        return jsonify({'error': roles_data}), status_code



#Organization Part is here   

@app.route('/orgs/register',methods=['POST'])
@jwt_required()
def orgRegister():
    form_data = request.json
    # print(form_data)
    response, status_code = add_org(form_data)
    if status_code == 201:
        return jsonify({'message': response}), 201
    elif status_code == 409:
        return jsonify({'error': response}), status_code  # Organization name already exists
    else:
        return jsonify({'error': response}), status_code  # Other error
    
@app.route('/orgs/edit/<string:org_id>', methods=['PUT'])
@jwt_required()
def orgUpdateApi(org_id):
    updated_data = request.json
    response, status_code = update_org(org_id)
    if status_code == 200:
        return jsonify({'message': response}), 200
    elif status_code == 404:
        return jsonify({'error': response}), status_code  
    else:
        return jsonify({'error': response}), status_code  # Other error
    
@app.route('/orgs/delete/<string:org_id>', methods=['DELETE'])
@jwt_required()
def orgDeleteApi(org_id):
    response, status_code = delete_org(org_id)
    if status_code == 200:
        return jsonify({'message': response}), 200
    elif status_code == 404:
        return jsonify({'error': response}), status_code  
    else:
        return jsonify({'error': response}), status_code  # Other error


@app.route('/orgs/list', methods=["GET"])
@jwt_required()
def getOrgsList():
    organizations_data, status_code = get_all_orgs()
    if status_code == 200:
        return organizations_data
    else:
        return jsonify({'error': organizations_data}), status_code


#fetch org by orgid
@app.route('/org/byid/',methods=["POST"])
@jwt_required()
def getOrgsListByid():
    try:
        data = request.json
        orgId = data.get('orgId')
        print(orgId)
        if not orgId:
            return jsonify({'error': 'orgId is required'}), 400

        organizations_data, status_code = get_org(orgId)
        return organizations_data, status_code
    except Exception as e:
        logging.exception("An error occurred while fetching organization by orgId.")
        return jsonify({'error': str(e)}), 500

#Account part is here
def validate_unique_key_secret(api_key, api_secret):
    existing_data = mongo.db.collection.find_one({
        "$or": [{"api_key": api_key}, {"api_secret": api_secret}]
    })
    if existing_data:
        return False
    return True

def validate_user_id(username):
    try:
        # Assuming get_user_email returns only one value
        user_data = get_user_email(username)
        if user_data:
            return True
        else:
            return False
    except:
        return False



@app.route('/accs/register', methods=['POST'])
@jwt_required()
def create_accounts():
    try:
        data = request.json
        api_key = data.get('Account_api')  # Corrected variable name
        api_secret = data.get('Account_secret')  # Corrected variable name
        username = data.get('Name')  # Corrected variable name

        # Validate user ID
        if not validate_user_id(username):
            return jsonify({"message": "User you are specifying does not exist"}), 404

        # Check if api_key or api_secret already exists in the database
        existing_record = get_account_api(api_key, api_secret)
        if existing_record:
            return jsonify({"message": "API key or API secret already exists"}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'An unexpected error occurred'}), 500

    # Rest of the code

        
    # If not, insert the data into the database
    response, status_code = create_account(data)
    if status_code == 201:
        return jsonify({'message': response}), 201
    elif status_code == 409:
        return jsonify({'error': response}), status_code  # Organization name already exists
    else:
        return jsonify({'error': response}), status_code  # Other error



# Get all accounts
# Endpoint Code:
@app.route('/accs', methods=['GET'])
@jwt_required()
def get_all_accounts_endpoint():
    return get_all_accounts_service()


@app.route('/accs/org', methods=['POST'])  # Specify that the route handles POST requests
@jwt_required()
def get_userorgId():
    data = request.json
    org_Id = data.get('org_Id')
    if org_Id:
        emails = get_user_orgId(org_Id)
        if emails:
            return get_account(emails)
        else:
            return jsonify({'message': 'No users found for the given org_Id'}), 404
    else:
        return jsonify({'message': 'org_Id parameter is missing'}), 400


# Get a specific account by ID
@app.route('/accs/<string:account_id>', methods=['GET'])
@jwt_required()
def get_one_account(account_id):
    return get_account(account_id)

# # Update an account by ID
# @app.route('/accs/update/', methods=['PUT'])
# @jwt_required()
# def update_account():
#     try:
#         data = request.json

#         # Check if account exists
#         print(data)
#         existing_account = get_account(data.id)
#         if not existing_account:
#             return jsonify({"error": "Account not found"}), 404

#         # Update account data
#         response = update_account_service(data.id, data)

#         return jsonify(response)
#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/accs/update/', methods=['PUT'])
@jwt_required()
def update_account():
    try:
        data = request.json

        # Check if account exists
        existing_account = get_account_by_id(data['_id'])
        if not existing_account:
            return jsonify({"error": "Account not found"}), 404

        # Update account data
        response = update_account_service(data['_id'], data)

        return jsonify(response)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
#update single user account
@app.route('/accs/update-details/', methods=['PUT'])
@jwt_required()
def update_account_details():
    try:
        data = request.json
        print("Received data:", data)  # Log received data for debugging
        
        # Check if account exists
        existing_account = get_account_by_id_singleAccount(data.get('id'))
        if not existing_account:
            return jsonify({"error": "Account not found"}), 404

        # Update account details
        response = update_account_details_service(data['id'], data)

        return jsonify(response)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'An unexpected error occurred'}), 500
    

    
# Delete an account by ID
@app.route('/accs/<string:account_id>', methods=['DELETE'])
@jwt_required()
def delete_one_account(account_id):
    return delete_account(account_id)
#Set Creds of Account
@app.route('/set_credentials', methods=['POST'])
@jwt_required()
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
    
@app.route('/auth/callback', methods=['POST'])
@jwt_required()
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

@app.route('/stocks/search',methods=["GET"])
@jwt_required()
def stock_details():
    # Get stock name from request
    stock_name = request.args.get('name')

    # Search instrument by stock name
    instruments = kite.symbols(stock_name)
    
    if instruments:
        # Get details of the first instrument
        instrument = instruments[0]
        instrument_token = instrument['instrument_token']
        stock_details = kite.ltp(instrument_token)
        return jsonify(stock_details)
    else:
        return "Stock not found"
    

@app.route("/place_order", methods=["POST"])
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
def cancel_order():
    try:
        # Assuming request.json contains the order_id to cancel
        order_id = request.json["order_id"]
        kite.cancel_order(order_id=order_id)
        return jsonify({"status": "success", "message": "Order cancelled successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})






#Stocks CRUD

mongo_service = MongoDBService(db_name='algotrade', collection_name='stocks')

@app.route('/search/all', methods=['GET'])
@jwt_required()
def get_all_stocks():
    # Fetch all documents from the MongoDB collection
    documents = mongo_service.get_all_documents()

    if not documents:
        return jsonify({'message': 'No documents found'}), 404

    # Format and return all documents
    formatted_results = []
    for doc in documents:
        formatted_results.append({
            'exchange': doc.get('exchange', ''),
            'instrument_id': doc.get('instrument_id', ''),
            'name': doc.get('name', ''),
            'segment': doc.get('segment', ''),
            'tradingsymbol': doc.get('tradingsymbol', '')
        })

    return jsonify(formatted_results)   


@app.route('/search', methods=['GET'])
@jwt_required()
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'No search query provided'}), 400

    # Use the search_documents method from the MongoDB service
    documents = mongo_service.search_documents(query)

    if not documents:
        return jsonify({'message': 'No matching documents found'}), 404

    # Format and return search results
    formatted_results = []
    for doc in documents:
        formatted_results.append({
            'exchange': doc['exchange'],
            'instrument_id': doc['instrument_id'],
            'name': doc['name'],
            'segment': doc['segment'],
            'tradingsymbol': doc['tradingsymbol']
        })

    return jsonify(formatted_results)


# NOTE: This End POINT is Only for Scraping the Data Do Not Use this End Point
# @app.route('/stocks', methods=['GET'])
# def get_stock_details():
#     # Initialize KiteConnect with your API key and access token
#     api_key = '3yn8b98mohg6vpm1'
#     access_token = 'y34wv2j8e0agsog3757tw6c5y2msxome'   
#     kite = KiteConnect(api_key=api_key)
#     kite.set_access_token(access_token)
    
#     # Fetch all instruments
#     instruments = kite.instruments()

#     # Create a list to store instrument details
#     stock_details = []

#     # Iterate over each instrument and store required details
#     for instrument in instruments:
#         instrument_id = instrument['instrument_token']
#         details = {
#             'instrument_id': instrument_id,
#             'tradingsymbol': instrument['tradingsymbol'],
#             'name': instrument['name'],
#             'exchange': instrument['exchange'],
#             'segment': instrument['segment']
#         }
#         stock_details.append(details)

#     # Store the data in a JSON file
#     with open('stock_details.json', 'w') as json_file:
#         json.dump(stock_details, json_file, indent=4)

#     # Return success response
#     return jsonify({'message': 'Stock details saved successfully.'}), 200



#main Function is here
if __name__ == "__main__":
    app.run(debug= True,port="5000")
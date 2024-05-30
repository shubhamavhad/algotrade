import traceback
from flask import request, jsonify
from pymongo import MongoClient
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://admin:password@nrdbms.web.ksemin.in:30001')
# client = MongoClient('mongodb://localhost:27017')

db = client['algotrade']  # Replace 'your_database_name' with your actual database name
collection = db['accounts']  # Replace 'your_collection_name' with your actual collection name

class AccountCreationError(Exception):
    pass
# Collection
class Account:
    def __init__(self, id, Account_api, Account_secret, Name, orgId, isActive,child,isLinked,isTrade):
        self.id = id
        self.Account_api = Account_api
        self.Account_secret = Account_secret
        self.Name = Name
        self.orgId = orgId
        self.isActive = isActive,
        self.child = child,
        self.isLinked = isLinked
        self.isTrade=isTrade
# CRUD operations

# Create
   
def create_account(data):
    required_fields = ['id', 'Account_api', 'Account_secret', 'Name', 'multiplier','isLinked','isTrade']
    if all(field in data for field in required_fields):
        # Check if account already exists
        if collection.find_one({'$or': [{'Account_api': data['Account_api']}, {'Account_secret': data['Account_secret']}, {'Name': data['Name']}]}):
            return {"error": "API Key, API Secret, or User ID already exists"}, 400

        # If 'child' key exists in data, remove it from the dictionary and process it separately
        child_data = data.pop('child', None)

        # Insert parent account data
        new_account_data = {field: data[field] for field in required_fields}
        new_account_data['_id'] = data['id']

        # If there's child data, add it to the parent account data
        if child_data:
            new_account_data['child'] = child_data

        account_id = collection.insert_one(new_account_data).inserted_id

        return {"message": "Account added successfully", "Account_id": data['id']}, 201
    else:
        missing_fields = [field for field in required_fields if field not in data]
        return {"error": f"Missing required fields: {', '.join(missing_fields)}"}, 400


#parent account datils with child account


# Read all accounts
# Service Code:
def get_all_accounts_service():
    accounts = list(collection.find({}))
    if accounts:
        for account in accounts:
            account['_id'] = str(account['_id'])
        return jsonify(accounts), 200
    else:
        return jsonify({'message': 'No accounts found'}), 404

def get_account_by_id(account_id):
    try:
        account = collection.find_one({'_id': ObjectId(account_id)})
        if account:
            account['_id'] = str(account['_id'])
            return account
        return None
    except Exception as e:
        traceback.print_exc()
        return None
    


def get_account_by_id_singleAccount(account_id):
    try:
        account = collection.find_one({'id': account_id})
        if account:
            account['id'] = str(account['id'])
            return account
        return None
    except Exception as e:
        traceback.print_exc()
        return None

    


# Service Account
def get_account(emails):
    accounts = []
    for email in emails:
        account = collection.find_one({'Name': email})  # Query for accounts based on email
        if account:
            account['_id'] = str(account['_id'])  # Convert ObjectId to string
            accounts.append(account)
    if accounts:
        return jsonify(accounts), 200
    else:
        return jsonify({'message': 'No accounts found for the given emails'}), 404
    
# def get_account_by_id(account_id):
#     # Your implementation to retrieve the account details from the database
#     # Ensure it returns a dictionary representing the account details
#     # Example:
#     account_data = collection.find_one({'_id': account_id})
#     return account_data if account_data else {}


#Read a specific account by api_key and Api_secret

def get_account_api(api_key,api_secret):
    existing_record = collection.find_one({"$or": [{"api_key": api_key}, {"api_secret": api_secret}]})
    return existing_record

# Update
# def update_account_service(account_id, data):
#     try:
#         # Check if account exists
#         print(account_id,data)
#         existing_account = get_account_by_id(account_id)
#         if not existing_account:
#             return {"error": "Account not found"}, 404  
#         else:
#             collection.update_one({'id': ObjectId(account_id)}, {'$set': {'isLinked': True}}) 
#         # Update parent account data
#         update_data = {key: data[key] for key in data if key != 'child'}  # Exclude 'child' data
#         collection.update_one({'id': account_id}, {'$set': update_data})

#         # Handle child data
#         if 'child' in data:
#             child_data = data['child']
#             # Update child array
#             collection.update_one({'id': account_id}, {'$set': {'child': child_data}})
        
#         return {"message": "Account updated successfully"}, 200
#     except Exception as e:
#         traceback.print_exc()
#         return {"error": "An unexpected error occurred"}, 500

def update_account_service(account_id, data):
    try:
        # Check if account exists
        existing_account = get_account_by_id(account_id)
        if not existing_account:
            return {"error": "Account not found"}, 404

        # Update parent account data
        update_data = {key: data[key] for key in data if key != 'child' and key != '_id'}
        collection.update_one({'_id': ObjectId(account_id)}, {'$set': update_data})

        # Handle child data
        if 'child' in data:
            child_data = data['child']
            collection.update_one({'_id': ObjectId(account_id)}, {'$set': {'child': child_data}})
        return {"message": "Account updated successfully"}, 200
    except Exception as e:
        traceback.print_exc()
        return {"error": "An unexpected error occurred"}, 500

def update_account_details_service(account_id, data):
    try:
        existing_account = get_account_by_id_singleAccount(account_id)
        if not existing_account:
            return {"error": "Account not found"}, 404

        update_data = {key: data[key] for key in data if key != 'id'}
        print("Update data:", update_data)  # Log the update data for debugging
        
        result = collection.update_one({'id': account_id}, {'$set': update_data})

        if result.matched_count == 0:
            return {"error": "No account found to update"}, 404

        return {"message": "Account details updated successfully"}, 200
    except Exception as e:
        traceback.print_exc()
        return {"error": "An unexpected error occurred"}, 500


# Delete
def delete_account(account_id):
    result = collection.delete_one({'id': account_id})
    if result.deleted_count == 1:
        return jsonify({'message': 'Account deleted successfully'}), 200
    else:
        return jsonify({'message': 'Account not found'}), 404

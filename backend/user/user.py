import bcrypt
from pymongo import MongoClient
from flask import request, jsonify
from uuid import *
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
from bson import json_util
from bson.json_util import dumps
client = MongoClient('mongodb://admin:password@nrdbms.web.ksemin.in:30001')
# client = MongoClient('mongodb://localhost:27017')

db = client['algotrade']
collection = db['users']
AES_KEY = b'g!5xQ@#fN>Q)V=)=UhXoj`]b[6t+$tu+'
# Ensure uniqueness on email and phone fields
collection.create_index([('email', 1), ('phone', 1)], unique=True)

# User Model

class User:
    def __init__(self, id, name, email, phone, password, orgId, isActive, userRole,account_id,account_passwd,gtoken):
        self.id = id
        self.name = name
        self.email = email
        self.phone = phone
        self.password = password
        self.orgId = orgId
        self.isActive = isActive
        self.userRole = userRole
        self.account_id = account_id
        self.account_passwd = account_passwd
        self.gtoken = gtoken


def encrypt_password(password):
    # Hash password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password

def encrypt_aes(data):
    cipher = AES.new(AES_KEY, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data.encode('utf-8'), AES.block_size))
    iv = base64.b64encode(cipher.iv).decode('utf-8')
    ct = base64.b64encode(ct_bytes).decode('utf-8')
    return iv + ct

def add_user(data):
    required_fields = ['id', 'name', 'email', 'phone', 'password', 'orgId', 'isActive', 'userRole', 'account_id', 'account_passwd', 'gtoken']
    if all(field in data for field in required_fields):
        # Check if email, phone number, or id already exists
        if collection.find_one({'$or': [{'email': data['email']}, {'phone': data['phone']}, {'id': data['id']}, {'account_id': data['account_id']}, {'gtoken': data['gtoken']}]}):
            return {"error": "Email, phone number, ID, or gtoken already exists"}, 400

        # Encrypt sensitive fields
        encrypted_data = data.copy()
        encrypted_data['password'] = encrypt_password(data['password'])
        encrypted_data['account_id'] = encrypt_aes(data['account_id'])
        encrypted_data['account_passwd'] = encrypt_aes(data['account_passwd'])

        # Insert user data
        new_user_data = {field: encrypted_data[field] for field in required_fields}
        new_user_data['_id'] = data['id']
        user_id = collection.insert_one(new_user_data)
        return {"message": "User added successfully", "user_id": data['id']}, 201
    else:
        missing_fields = [field for field in required_fields if field not in data]
        return {"error": f"Missing required fields: {', '.join(missing_fields)}"}, 400


    
#fetch the all user 
def get_all_users():
    users = list(collection.find({}))
    if users:
        for user in users:
            user['_id'] = str(user['_id'])
        serialized_users = json_util.dumps(users)
        return serialized_users, 200
    else:
        return jsonify({'message': 'No users found'}), 404


def get_user(userId):
    users = collection.find({'id': userId})  # Fetch active users of the organization
    user_list = []
    for user in users:
        user_list.append({
            'id': user.get('_id'),
            'name': user.get('name'),
            'email': user.get('email'),
            'phone': user.get('phone'),
            'orgId': user.get('orgId'),
            'isActive': user.get('isActive'),
            'userRole': user.get('userRole'),
            'account_id': user.get('account_id'),
            'account_passwd': user.get('account_passwd'),
            'gtoken': user.get('gtoken')
        })
    if user_list:
        return user_list, 200
    else:
        return 'No active users found for the given orgId', 404

def get_user_email(username):
    user = collection.find_one({'email': username})
    return user

# Service User
def get_user_orgId(org_Id):
    users = collection.find({'orgId': org_Id})
    emails = [user.get('email') for user in users]  # Extract emails from users
    if emails:
        return emails
    else:
        return None

def getuser_orgId(orgId):
    users = collection.find({'orgId': orgId, 'isActive': True})  # Fetch active users of the organization
    user_list = []
    for user in users:
        user_list.append({
            'id': user.get('_id'),
            'name': user.get('name'),
            'email': user.get('email'),
            'phone': user.get('phone'),
            'orgId': user.get('orgId'),
            'isActive': user.get('isActive'),
            'userRole': user.get('userRole'),
            'account_id': user.get('account_id'),
            'account_passwd': user.get('account_passwd'),
            'gtoken': user.get('gtoken')
        })
    if user_list:
        return user_list, 200
    else:
        return 'No active users found for the given orgId', 404
    
def get_user_username(username):
    user = collection.find_one({'email': username})
    if user:
        # Assuming you want to return only the user data without any additional formatting
        return user
    else:
        return {'message': 'User not found'}

def update_user(user_id, data):
    updated_data = data
    if 'password' in updated_data:
        updated_data['password'] = encrypt_password(updated_data['password'])
    if 'account_id' in updated_data:
        updated_data['account_id'] = encrypt_aes(updated_data['account_id'])
    if 'account_passwd' in updated_data:
        updated_data['account_passwd'] = encrypt_aes(updated_data['account_passwd'])

    result = collection.update_one({'id': user_id}, {'$set': updated_data})
    if result.modified_count == 1:
        return 'User updated successfully', 200
    else:
        return 'User not found', 404

def delete_user(user_id):
    try:
        result = collection.delete_one({'id': user_id})
        if result.deleted_count == 1:
            return 'User deleted successfully', 200
        else:
            return 'User not found', 404
    except Exception as e:
        return str(e), 500


def disable_user(user_id):
    user = collection.find_one({'_id': user_id})
    updated_data = user
    updated_data['isActive'] = False
    result = collection.update_one({'_id': user_id}, {'$set': updated_data})
    if result.modified_count == 1:
        return jsonify({'message': 'User updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404
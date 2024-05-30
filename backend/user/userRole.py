from pymongo import MongoClient
from flask import request, jsonify

client = MongoClient('mongodb://admin:password@nrdbms.web.ksemin.in:30001')
# client = MongoClient('mongodb://localhost:27017')
db = client['algotrade']
collection = db['userRoles']

def get_all_roles():
    user_Roles = list(collection.find({}))
    if user_Roles:
        # Convert ObjectId to string for each user
        for user in user_Roles:
            user['_id'] = str(user['_id'])
        return jsonify(user_Roles), 200
    else:
        return jsonify({'message': 'No users found'}), 404


def get_role(role_id):
    user_role = collection.find_one({'_id': role_id})

    if user_role:
        return jsonify(user_role), 200
    else:
        return jsonify({'message': 'User not found'}), 404
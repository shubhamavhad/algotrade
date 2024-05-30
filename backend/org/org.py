from pymongo import MongoClient, errors
from flask import request, jsonify
from bson import ObjectId
client = MongoClient('mongodb://admin:password@nrdbms.web.ksemin.in:30001')
# client = MongoClient('mongodb://localhost:27017')

db = client['algotrade']
collection = db['organizations']

class Org:
    def __init__(self, id, OrgName, OrgadminId):
        self.id = id
        self.OrgName = OrgName
        self.OrgadminId = OrgadminId


try:
    collection.create_index([('OrgName', 1)], unique=True)
except errors.OperationFailure:
    # Index already exists, do nothing
    pass

def add_org(org_data):
    required_fields = ['id', 'OrgName', 'OrgadminId']
    if all(field in org_data for field in required_fields):
        if collection.find_one({'$or': [{'OrgName': org_data['OrgName']}, {'OrgadminId': org_data['OrgadminId']}, {'id': org_data['id']}]}):
            return {"error": "Organization, Org Admin, or ID already exists"}, 400
        try:
            result = collection.insert_one(org_data)
            return 'Organization added successfully', 201
        except errors.DuplicateKeyError:
            return 'Organization name already exists', 409
        except Exception as e:
            return str(e), 500



def get_all_orgs():
    organizations = collection.find({})
    org_list = []
    for org in organizations:
        org['_id'] = str(org['_id'])  # Convert ObjectId to string
        org_list.append(org)
    return org_list, 200



def get_org(orgId):
    try:
        org = collection.find_one({'id': orgId})
        org_list=[]
        for i in org:
            org_list.append({
                 'id': org.get('id'),
                'OrgName': org.get('OrgName'),
                'OrgadminId': org.get('OrgadminId')
            })

            return jsonify(org_list), 200
        else:
            return jsonify({'message': 'Organization not found'}), 404
    except InvalidId as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_org(org_id):
    updated_data = request.json
    result = collection.update_one({'id': org_id}, {'$set': updated_data})
    if result.modified_count == 1:
        return {'message': 'Organization updated successfully'}, 200
    else:
        return {'message': 'Organization not found'}, 404

def delete_org(org_id):
    result = collection.delete_one({'id': org_id})
    if result.deleted_count == 1:
        return {'message': 'Organization deleted successfully'}, 200
    else:
        return {'message': 'Organization not found'}, 404

from pymongo import MongoClient

class MongoDBService:
    def __init__(self, db_name, collection_name):
        self.client = MongoClient('mongodb://admin:password@nrdbms.web.ksemin.in:30001/')
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def search_documents(self, query):
        # Perform a search query with $or operator to search in all fields
        result = self.collection.find({
            '$or': [
                {'exchange': {'$regex': query, '$options': 'i'}},  # Case-insensitive search by exchange
                {'instrument_id': {'$regex': query, '$options': 'i'}},  # Case-insensitive search by instrument_id
                {'name': {'$regex': query, '$options': 'i'}},  # Case-insensitive search by name
                {'segment': {'$regex': query, '$options': 'i'}},  # Case-insensitive search by segment
                {'tradingsymbol': {'$regex': query, '$options': 'i'}}  # Case-insensitive search by tradingsymbol
            ]
        })

        return list(result)

    def get_all_documents(self):
        # Fetch all documents from the collection
        result = self.collection.find()
        return list(result)
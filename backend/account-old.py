from flask import Flask, request, jsonify

app = Flask(__name__)

# Sample data to simulate a database
data = {
    "api_key": "your_api_key",
    "api_secret": "your_api_secret",
    "userId": "your_userId"
}


# Read operation - GET
@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(data)

# Create operation - POST
@app.route('/data', methods=['POST'])
def add_data():
    req_data = request.get_json()
    for key in req_data:
        data[key] = req_data[key]
    return jsonify(data), 201

# Update operation - PUT
@app.route('/data', methods=['PUT'])
def update_data():
    req_data = request.get_json()
    for key in req_data:
        if key in data:
            data[key] = req_data[key]
    return jsonify(data)

# Delete operation - DELETE
@app.route('/data', methods=['DELETE'])
def delete_data():
    req_data = request.get_json()
    for key in req_data:
        if key in data:
            del data[key]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

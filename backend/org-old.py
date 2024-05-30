from flask import Flask, request, jsonify
from functools import wraps
import jwt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

# Dummy data for organizations
organizations = [
    {"id": 1, "name": "Org1", "admin_email": "admin1@example.com"},
    {"id": 2, "name": "Org2", "admin_email": "admin2@example.com"}
]

# Dummy data for user roles
user_roles = {
    "admin1@example.com": "Global Admin",
    "admin2@example.com": "Regular User"
}

# Dummy data for OTP verification
otp_verified_users = {
    "admin1@example.com": True,
    "admin2@example.com": True
}

# JWT Token Verification
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)

    return decorated

# Role-based Access Control
def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            except:
                return jsonify({'message': 'Token is invalid!'}), 401

            user_email = data['email']
            if user_roles.get(user_email) != role:
                return jsonify({'message': 'Unauthorized access!'}), 403

            return f(*args, **kwargs)

        return decorated_function
    return decorator

# Generate JWT token
def generate_token(email):
    expiration_date = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    token = jwt.encode({'email': email, 'exp': expiration_date}, app.config['SECRET_KEY'], algorithm="HS256")
    return token

# CRUD operations
@app.route('/organizations', methods=['GET'])
@token_required
@role_required('Global Admin')
def get_organizations():
    return jsonify({'organizations': organizations})

@app.route('/organizations/<int:id>', methods=['GET'])
@token_required
@role_required('Global Admin')
def get_organization(id):
    organization = next((org for org in organizations if org['id'] == id), None)
    if organization:
        return jsonify(organization)
    return jsonify({'message': 'Organization not found'}), 404

@app.route('/organizations', methods=['POST'])
@token_required
@role_required('Global Admin')
def create_organization():
    data = request.get_json()
    new_org = {
        'id': len(organizations) + 1,
        'name': data['name'],
        'admin_email': data['admin_email']
    }
    organizations.append(new_org)
    return jsonify({'message': 'Organization created successfully', 'organization': new_org}), 201

@app.route('/organizations/<int:id>', methods=['PUT'])
@token_required
@role_required('Global Admin')
def update_organization(id):
    organization = next((org for org in organizations if org['id'] == id), None)
    if organization:
        data = request.get_json()
        organization.update(data)
        return jsonify({'message': 'Organization updated successfully', 'organization': organization})
    return jsonify({'message': 'Organization not found'}), 404

@app.route('/organizations/<int:id>', methods=['DELETE'])
@token_required
@role_required('Global Admin')
def delete_organization(id):
    global organizations
    organizations = [org for org in organizations if org['id'] != id]
    return jsonify({'message': 'Organization deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)

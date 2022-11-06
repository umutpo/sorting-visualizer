import base64
from flask import Flask, request
from waitress import serve

from api.errors import UserException
from api.utils import execute_user_code

app = Flask(__name__)


# Added this for UI to test the connection
# (no param)
@app.route('/hello-world')
def hello_world():
    return "Hello World!\n"


# Pass the user entered code to backend
# The code is passed in the body
@app.route('/user-code', methods=["POST"])
def handle_user_code():
    encoded_user_code = request.json.get("code")
    array = request.json.get("array")
    
    base64_bytes = encoded_user_code.encode('ascii')
    user_code_bytes = base64.b64decode(base64_bytes)
    user_code = user_code_bytes.decode('ascii')
    
    return execute_user_code(user_code, array)


@app.errorhandler(UserException)
def handle_user_exception(err):
    return {"arrayLog": err.logs, "message": str(err)}, err.code


if __name__ == '__main__':
    # For development
    serve(app, host="0.0.0.0", port=8080)

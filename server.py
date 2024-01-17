import flask
from flask import *
import json, os, shutil, base64, zipfile

os.chdir("../")

app=Flask(__name__)
password="x"
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024 * 1024

def unzip_file(zip_file_path, extract_folder):
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_folder)

def parser():
    return request.json

def make_response(data):
    if type(data)!=str:
        data=json.dumps(data)
    resp=flask.Response(data)
    resp.headers["Access-Control-Allow-Origin"]="*"
    resp.headers["Content-Type"]="application/json"
    return resp

@app.route("/", methods=['OPTIONS', "GET", "POST"])
def home():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',  
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, response_headers
    data=parser()
    if data["password"]!=password:
        return make_response("")
    if data["path"]=="":
        data["path"]=os.getcwd()
    directory={"path":data["path"], "directory":[]}
    folders=[{"name":"..", "type":"folder"}]
    files=[]
    for x in sorted(os.listdir(data["path"])):
        if os.path.isfile(data["path"]+"/"+x):
            files.append({"name":x,"type":"file"})
        else:
            folders.append({"name":x,"type":"folder"})
    directory["directory"]=folders+files
    return make_response(json.dumps(directory))

@app.route("/delete", methods=['OPTIONS', "GET", "POST"])
def delete():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',  
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, response_headers
    data=parser()
    if data["password"]!=password:
        return make_response("")
    if os.path.isfile(data["path"]):
        os.remove(data["path"])
    else:
        shutil.rmtree(data["path"])
    return make_response("true")

@app.route("/upload", methods=['OPTIONS', "GET", "POST"])
def upload():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',  
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, response_headers
    data=parser()
    if data["password"]!=password:
        return make_response("")
    try:
        os.remove(data["path"]+"/"+data["name"])
        open(data["path"]+"/"+data["name"], "a")
    except:
        pass
    print(data)
    x=base64.b64decode(data["data"])
    open(data["path"]+"/"+data["name"], "wb").write(x)
    if data["name"].endswith(".zip"):
        unzip_file(data["path"]+"/"+data["name"], data["path"]+"/"+data["name"][::-1].split(".", 1)[-1][::-1])
    return make_response("true")

@app.route("/download", methods=['OPTIONS', "GET", "POST"])
def download():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',  
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return '', 200, response_headers
    if data["password"]!=password:
        return make_response("")
    data=parser()
    return make_response(base64.b64encode(open(data["name"], "rb").read()).decode())

app.run(debug=False, host="0.0.0.0")
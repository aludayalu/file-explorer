import axios from "axios";

export function get(path, data) {
    return axios.post("http://127.0.0.1:5000"+path, data)
}
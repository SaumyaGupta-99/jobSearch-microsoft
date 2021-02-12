import properties from "../properties";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

class ResumeParser {
  constructor() {
    this.BASE_URL = "https://resume-parser.affinda.com/public/api/v1";
    this.urls = {
      UPLOAD: {
        method: "post",
        url: "/documents",
      },
      RESULT: {
        method: "get",
        url: "/documents",
      },
    };
    axios.defaults.baseURL = this.BASE_URL;
  }

  uploadFile = async (filename) => {
    const readStream = fs.createReadStream("uploads/" + filename);
    const formData = new FormData();
    formData.append("file", readStream);
    formData.append("fileName", filename);
    return axios[this.urls.UPLOAD.method](this.urls.UPLOAD.url, formData, {
      headers: {
        Authorization: `Bearer ${properties.affindaToken}`,
        ...formData.getHeaders(),
      },
    });
  };
  getSummary = async (identifier) => {
    return axios[this.urls.RESULT.method](
      this.urls.RESULT.url + "/" + identifier,
      {
        headers: {
          Authorization: `Bearer ${properties.affindaToken}`,
        },
      }
    );
  };
}
export default new ResumeParser();

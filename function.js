var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// https://completejavascript.com/xmlhttprequest-tao-http-request-den-server-trong-javascript
const request = async (url, options) => {
  const method = options?.method || 'GET';
  const headers = options?.headers;
  // console.log(headers);

  try {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( method, url, false ); // false for synchronous request

    if(headers) {
      for (const [key, value] of Object.entries(headers)) {
        // console.log(`${key}: ${value}`);
        xmlHttp.setRequestHeader(key, value);
      }
    }
    
    xmlHttp.send( null );
    const results = JSON.parse(xmlHttp.responseText);
    // const { code, message, data } = results;

    return {
      status: 200,
      message: 'Request successful',
      data: results.data
    }
  } catch (error) {
    return {
      status: 500,
      message: 'Request error - ' + error
    }
  }
}

const utf8ToNormalString = (text) => {
  // Chuyển hết sang chữ thường
  let str = text.toLowerCase();

  // xóa dấu
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
  str = str.replace(/(đ)/g, 'd');

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, '');

  // // Xóa khoảng trắng thay bằng ký tự -
  // str = str.replace(/(\s+)/g, '-');

  // xóa phần dự - ở đầu
  str = str.replace(/^-+/g, '');

  // xóa phần dư - ở cuối
  str = str.replace(/-+$/g, '');

  // return
  return str;
}

module.exports = {
  request,
  utf8ToNormalString
}
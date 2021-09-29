// https://www.google.com.vn/search?q=deep+search+by+text+javascript&sxsrf=ALeKk00ag8asoCYysuQN1y2M-swkL3qPWQ%3A1629529337642&ei=-aQgYai4JoKB-AarrYjoDQ&oq=deep+search+by+text+javascript&gs_lcp=Cgdnd3Mtd2l6EAM6BwgAEEcQsAM6BwgjELACECdKBAhBGABQxe4BWJX3AWD0hAJoAnACeACAAYYBiAHiBpIBAzguMZgBAKABAcgBCMABAQ&sclient=gws-wiz&ved=0ahUKEwjomMjqxcHyAhWCAN4KHasWAt0Q4dUDCA4&uact=5

const token = '68b3a380-0232-11ec-b5ad-92f02d942f87';
const locationApiUrl_GHN = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data';

const fs = require('fs');

const { request, utf8ToNormalString } = require('../function');

const formatData = {
  province: (dataList) => {
    return dataList?.map(e => ({
      // provinceId: e.ProvinceID,
      id: e.ProvinceID,
      // provinceName: e.ProvinceName,
      name: e.ProvinceName,
      code: e.Code,
      nameRaws: [e.ProvinceName, ...e.NameExtension].toString()
    }))?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  },
  district: (dataList) => {
    return dataList?.map(e => ({
      provinceId: e.ProvinceID,
      id: e.DistrictID,
      // provinceName: e.ProvinceName,
      name: e.DistrictName,
      code: e.Code,
      nameRaws: [e.DistrictName, ...e.NameExtension].toString()
    }))?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  },
  ward: (dataList) => {
    return dataList?.map(e => ({
      districtId: e.DistrictID,
      id: e.WardID || e.WardCode,
      // provinceName: e.ProvinceName,
      name: e.WardName,
      code: e.WardCode,
      nameRaws: [e.WardName, ...e.NameExtension].toString()
    }))?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  },
}

const filterObjItems = (needle, heystack) => {
  let query = needle.toLowerCase();
  const normalizeStr = utf8ToNormalString(query);
  return heystack.filter(item => utf8ToNormalString(item.nameRaws.toLowerCase()).indexOf(normalizeStr) >= 0);
}

const GetLocations = async (req, res) => {

  const { area } = req.params;
  const { province_id, district_id, name } = req.query;
  console.log('params', req.params);
  console.log('query', req.query);
  const headers = {
    // 'Content-Type': 'application/json',
    'Token': token,
  }
  let rs = await request(`${locationApiUrl_GHN}/${area}?province_id=${province_id}&district_id=${district_id}`, { headers });
  const fmData = formatData[area];
  let fmDataList = typeof fmData === 'function' ? fmData(rs.data) : rs.data;
  if (name)
    fmDataList = filterObjItems(name, fmData(rs.data));
  // console.log(fmData(rs.data));

  try {

    return res.status(rs.status).json({
      status: rs.status,
      message: rs.message,
      // data: rs.data,
      dataLength: rs?.data?.length,
      data: fmDataList,
    })

  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

const createRawText = (txt) => {
  if (!txt) return [];
  const raws = [txt, utf8ToNormalString(txt), utf8ToNormalString(txt, { trimAll: true })];
  return raws;
}
const AddStaticStreet = async (req, res) => {
  // const { body, data } = req;
  const payload = req.body;
  console.log('POST - REQ', req.body, req.data);
  let wardIds = []
  const newStreet = {
    name: payload.name,
    nameRaws: createRawText(payload.name),
    wardIds: [payload.wardId]
  }
  
  // let logStreamRead = fs.createReadStream('./utils/data/static/allStreets.json');
  // let logStream = fs.createWriteStream('./utils/data/static/allStreets.json', {flags: 'a'});
  // // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
  // const originData = logStreamRead.read();
  // const newData = {
  //   test: payload
  // }
  // logStream.write(JSON.stringify(newData, null, 2));
  // logStream.end();
  // console.log(JSON.stringify(null, null, 2));
  let file1Path = './utils/data/static/allStreets.json';
  let file2Path = './utils/data/static/streetByWard.json';
  let streetsFileData = fs.readFileSync(file1Path, 'utf8');
  let streetByWardFileData = fs.readFileSync(file2Path, 'utf8');
  let file1Parser = JSON.parse(streetsFileData || '{}');
  let file2Parser = JSON.parse(streetByWardFileData || '{}');
  if (file1Parser.streets) {
    file1Parser.streets.push(newStreet);
  }
  fs.writeFileSync(file1Path, JSON.stringify(file1Parser, null, 2))
  if (file2Parser.wardId) {
    console.log('IF')
    if(!file2Parser.wardId[payload.wardId]) {
      console.log('if 1')
      file2Parser.wardId[payload.wardId] = [{...newStreet, wardIds: undefined}];
    } else {
      console.log('if 2')
      file2Parser.wardId[payload.wardId].push({...newStreet, wardIds: undefined});
    }
  }
  fs.writeFileSync(file2Path, JSON.stringify(file2Parser, null, 2))

  try {
    return res.status(200).json({
      status: 200,
      message: 'Get streets by ward',
      data: { payload, file2Parser },
    })
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}
// GetStaticLocations
const GetStaticStreet = async (req, res) => {
  // https://stackoverflow.com/questions/50569646/how-to-create-write-to-tsv-file-in-node/50569647
  const { area } = req.params;
  const { ward_id } = req.query;

  try {
    // let data = fs.readFileSync('./utils/data/static/street.tsv', 'utf8');
    // // \r\n40106-2\t40106\tTrịnh Công Sơn\tTrịnh Công Sơn,Trinh Cong Son\t40106,40107\t[40106,46017]
    // let dataFormat = data.replace(/(\r\n|\n|\r)/gm, "--|--");
    // const templines = dataFormat.split('--|--');
    // const ignoreHeadRaw = true;

    // for (let x = Number(ignoreHeadRaw); x < templines.length; x++) {
    //   const property = templines[x].split('\t');
    //   // templines[x] = property;
    //   const fmSt = {
    //     id: property[0],
    //     name: property[1],
    //     nameRaws: property[2],
    //     wardIds: property[3]
    //   }
    //   //filter by ward
    //   // console.log('before alo', fmSt.wardIds.includes(ward_id))
    //   if (ward_id && fmSt.wardIds.includes(ward_id)) {
    //     streets.push(fmSt);
    //     continue
    //   }
    //   if (!ward_id)
    //     streets.push(fmSt);
    // }
    let streets = [];
    // let logStreamRead = fs.createReadStream('./utils/data/static/streetByWard.json');
    // logStreamRead.on('data', chunk => {
    //   // console.log(chunk.toString());
    //   const parserData = JSON.parse(chunk.toString() || '{}');
    //   console.log(parserData.wardId[ward_id]);
    //   streets = parserData.wardId[ward_id];
    // })
    let streetByWardFileData = fs.readFileSync('./utils/data/static/streetByWard.json', 'utf8');
    const parserData = JSON.parse(streetByWardFileData || '{}');
    streets = parserData.wardId[ward_id];

    return res.status(200).json({
      status: 200,
      message: 'Get streets by ward',
      // data: { area, ward_id, templines, data1: data, dataFormat, results },
      data: { area, ward_id, streets },
    })
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}

const readWriteFile = () => {
  // let data = fs.readFileSync('./utils/data/static/street.tsv', 'utf8');
  // // \r\n40106-2\t40106\tTrịnh Công Sơn\tTrịnh Công Sơn,Trinh Cong Son\t40106,40107\t[40106,46017]
  // let dataFormat = data.replace(/(\r\n|\n|\r)/gm, "--|--");
  // const templines = dataFormat.split('--|--');

  // let originData = data;
  // const newLineData = `\r\n40106-2\t40106\tTrịnh Công Sơn\tTrịnh Công Sơn,Trinh Cong Son\t40106,40107\t[40106,46017]`;
  // fs.writeFileSync('./utils/data/static/street.tsv', newLineData, { 'flag': 'a' });

  // var fs = require('fs');
  // var logStream = fs.createWriteStream('log.txt', { flags: 'a' });
  // // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
  // logStream.write('Initial line...');
  // logStream.end('this is the end line');
}

module.exports = {
  GetLocations,
  GetStaticStreet,
  AddStaticStreet
}
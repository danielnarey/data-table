//---IMPORTING DATA AND CONVERTING TO TABLE FORMAT---//


// Previewing data sources

const previewDataFile = async (filepath, bytes = 500, encoding = 'utf8') => {
  let content;

  try {
    const fd = fs.openSync(filepath);
    const { buffer } = await fs.read(fd, Buffer.alloc(bytes), 0, bytes);

    content = buffer.toString(encoding);
  } catch (error) {
    console.log(error);
  }

  return content;
};


const previewDataUrl = (url, bytes = 500, encoding = 'utf8') => new Promise((resolve, reject) => {
  let content = '';
  let downloaded = 0;

  try {
    const stream = got(url, {
      resolveBodyOnly: true,
      responseType: 'buffer',
      stream: true,
    });

    stream.on('data', (chunk) => {
      content += chunk.toString(encoding, 0, bytes - downloaded);
      downloaded += chunk.length;
      if (downloaded >= bytes) {
        stream.destroy();
        resolve(content);
      }
    }).on('error', (error) => {
      reject(error);
    });
  } catch (error) {
    reject(error);
  }
});


const fromArray = jsArray => new Promise((resolve, reject) => {
  if (whatType(jsArray) !== 'Array') {
    reject(new TypeError(`Expected an Array but got a ${whatType(jsArray)}`));
  }

  const keys = Object.keys(jsArray[0]);

  const reducer = (a, c, i) => {
    const obj = a;

    keys.forEach((k) => {
      obj[k][i] = c[k];
    });

    return obj;
  };

  const initial = {};
  keys.forEach((k) => {
    initial[k] = [];
  });

  resolve(jsArray.reduce(reducer, initial));
});


const fromCsv = async (filepath) => {
  let dt;

  try {
    const csvString = await fs.readFile(filepath);
    const jsArray = await neatCsv(csvString);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromJsonArray = async (filepath) => {
  let dt;

  try {
    const jsArray = await fs.readJson(filepath);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromJsonTable = async (filepath) => {
  let dt;

  try {
    dt = await fs.readJson(filepath);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('File content is not a valid data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteCsv = async (url) => {
  let dt;

  try {
    const { body } = await got(url);
    const jsArray = await neatCsv(body);

    dt = await fromArray(jsArray);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Response body cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteJsonArray = async (url) => {
  let dt;

  try {
    const { body } = await got(url, { json: true });

    dt = await fromArray(body);
    const validated = await isDataTable(dt);

    if (!validated) {
      throw new TypeError('Response body cannot be converted to a data table.');
    }
  } catch (error) {
    console.log(error);
  }

  return dt;
};


const fromRemoteJsonTable = async (url) => {
  let dt;

  try {
    const { body } = await got(url, { json: true });
    const validated = await isDataTable(body);

    if (!validated) {
      throw new TypeError('Response body is not a valid data table.');
    }

    dt = body;
  } catch (error) {
    console.log(error);
  }

  return dt;
};



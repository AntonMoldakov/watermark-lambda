const axios = require('axios');
const Jimp = require('jimp');
let YandexCloud = require('./yandexCloud').YandexCloud;

const addWatermark = async (image) => {
  if (!image) {
    return;
  }
  const watermarkWidth = 148;
  const watermarkHeight = 54;
  const margin = 40;

  const imageToReturn = await Jimp.read(image);

  let watermark = await Jimp.read('./watermark.png');
  watermark = watermark.resize(watermarkWidth, watermarkHeight);
  watermark = await watermark;

  await imageToReturn.composite(
    watermark,
    imageToReturn.bitmap.width - margin - watermarkWidth,
    imageToReturn.bitmap.height - margin - watermarkHeight,
    {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.5,
    }
  );

  return await imageToReturn.getBufferAsync(Jimp.MIME_PNG);
};

module.exports.handler = async (event) => {
  try {
    const YaCloud = new YandexCloud();

    const yandexCloudUrl = 'https://storage.yandexcloud.net';
    const filePath = event.messages[0].details.object_id;
    const bucketName = event.messages[0].details.bucket_id;
    const imageUrl = `${yandexCloudUrl}/${bucketName}/${filePath}`;

    const { data: originalImage } = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const imageWithWatermark = await addWatermark(originalImage);

    await YaCloud.upload({
      file: imageWithWatermark,
      filePath,
    });

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.error('Error', e);
    return {
      statusCode: 500,
    };
  }
};

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

class YandexCloud {
  constructor() {
    this.aws = new S3Client({
      endpoint: 'https://storage.yandexcloud.net',
      region: 'ru-central1',
      credentials: {
        accessKeyId: process.env.YA_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.YA_STORAGE_SECRET_KEY,
      },
      httpOptions: {
        timeout: 10000,
        connectTimeout: 10000,
      },
    });
  }

  async upload({ file, filePath }) {
    try {
      const prefix = 'downloading/';
      const filePathWithoutPrefix = filePath.replace(prefix, '');

      const params = {
        // Your bucket name
        Bucket: 'public-bucket',
        Body: file,
        ContentType: 'image/*',
      };

      const putParams = {
        ...params,
        Key: filePathWithoutPrefix,
      };
      const deleteParams = {
        ...params,
        Key: filePath,
      };

      const response = await new Promise((resolve, reject) => {
        this.aws.send(new PutObjectCommand(putParams)).then(
          async (data) => {
            try {
              await this.aws.send(new DeleteObjectCommand(deleteParams));
              resolve(data);
            } catch (error) {
              reject(error);
            }
          },
          (error) => {
            console.log(error);
            reject(error);
          }
        );
      });

      return response;
    } catch (e) {
      console.error('Error', e);
    }
  }
}

module.exports.YandexCloud = YandexCloud;

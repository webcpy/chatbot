import { Provide, Config, Init } from '@midwayjs/core';
import qiniu from 'qiniu';

@Provide()
export class QiniuService {
  @Config('qiniu.AccessKey')
  accessKey;

  @Config('qiniu.SecretKey')
  secretKey;

  @Config('qiniu.Bucket')
  bucket;

  @Config('qiniu.url')
  url;

  mac: qiniu.auth.digest.Mac;
  config: any;
  bucketManager: qiniu.rs.BucketManager;

  @Init()
  init() {
    this.mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
    this.config = new qiniu.conf.Config();
    this.config.zone = qiniu.zone.Zone_z0; // 设置七牛云的存储区域
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }

  async uploadImage(
    stream: NodeJS.ReadableStream,
    key: string
  ): Promise<string> {
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.putStream(
        this.getUploadToken(),
        key,
        stream,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            resolve({
              ...respInfo.data,
              key: this.url + respInfo.data.key,
            });
          } else {
            reject(new Error(respBody));
          }
        }
      );
    });
  }

  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
        }
        if (respInfo.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(respBody));
        }
      });
    });
  }

  private getUploadToken(): string {
    const putPolicy = new qiniu.rs.PutPolicy({ scope: this.bucket });
    return putPolicy.uploadToken(this.mac);
  }
}

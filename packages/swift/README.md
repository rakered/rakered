# @rakered/swift

A library that helps to manage file uploads to OpenStack Swift based object storage, using Temp URL keys as authentication method.

![social image](https://github.com/rakered/rakered/raw/main/packages/swift/docs/social.jpg)

## Usage

```js
import swift from '@rakered/swift';

await swift.upload({
  container: 'uploads',
  object: 'backup.zip',
  data: fs.createReadStream('~/backup.zip'),
  headers: {
    'content-type': 'application/zip',
  },
});
```

## Methods:

### `upload(options)`

Upload a file to the object store

#### options

- **container** _String_

  The container where the object should be stored

- **object** _String_

  The name of the object

- **data** _Buffer/FileStream_

  The file that should be stored. Can be any data format compatible with axios.

- **headers** _Headers_

  Headers to send along. `content-type` is a required header, but any header compatible with swift can be included.

- **example**

  ```js
  import swift from '@rakered/swift';

  await swift.upload({
    container: 'uploads',
    object: 'backup.zip',
    data: fs.createReadStream('~/backup.zip'),
    headers: {
      'content-type': 'application/zip',
    },
  });
  ```

### `delete(options)`

Delete a file from the object store

#### options

- **container** _String_

  The container where the object should be stored

- **object** _String_

  The name of the object

- **example**

  ```js
  import swift from '@rakered/swift';

  await swift.delete({
    container: 'uploads',
    object: 'backup.zip',
  });
  ```

### `getDownloadUrl(options)`

This library doesn't have a method to download the file. Instead, it provides a way to get an expiring download url.

#### options

- **container** _String_

  The container where the object should be stored

- **object** _String_

  The name of the object

- **expires** _Number_

  Optional - The number of seconds after which the download url stops working. Defaults to 300 sec (5 minutes).

- **example**
  ```js
  import swift from '@rakered/swift';

  await swift.getDownloadUrl({
    container: 'uploads',
    object: 'backup.zip',
    expires: 300,
  });
  ```

## Alternatives

This library only offers a limited set of methods, and there are alternatives available. I just needed something small, and something that uses temp url keys to authenticate, instead of logging in with username + password.

Alternatives:

- [openstack-swift-client](https://www.npmjs.com/package/openstack-swift-client)
- [swift](https://www.npmjs.com/package/swift)

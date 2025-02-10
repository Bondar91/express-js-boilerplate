/* eslint-disable @typescript-eslint/no-explicit-any */
import YAML from 'yamljs';
import { resolveRefs } from 'json-refs';
import path from 'path';

/**
 * Return JSON with resolved references
 * @param {array | object} root - The structure to find JSON References within (Swagger spec)
 * @returns {Promise.<JSON>}
 */
export const multiFileSwagger = (root: object | any[]) => {
  const swaggerPath = path.resolve(__dirname, '../../swagger/api.yaml');

  const options = {
    filter: ['relative', 'remote'],
    location: swaggerPath,
    loaderOptions: {
      processContent(res: any, callback: CallableFunction) {
        callback(null, YAML.parse(res.text));
      },
    },
  };

  return resolveRefs(root, options).then(
    (results: any) => {
      return results.resolved;
    },
    (err: any) => {
      throw err;
    },
  );
};

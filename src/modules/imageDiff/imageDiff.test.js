import path from 'path';
import imageDiff from './imageDiff';

describe('imageDiff', () => {
  it('should diff between two images and return result', () => {
    return imageDiff({
      actualImage: path.join(__dirname, '__fixtures__/YDN.png'),
      expectedImage: path.join(__dirname, '__fixtures__/YDN_Color.png'),
      diffImage: path.join(__dirname, '__fixtures__/YDN_Color_imageDiff_tmp.png'),
    }).then((result) => {
      // Avoid precision issues relative to Linux / macOS
      expect(Math.round(result.total)).toBe(1961);
      expect(result.percentage).toBe(0.0299183);
    });
  });
});

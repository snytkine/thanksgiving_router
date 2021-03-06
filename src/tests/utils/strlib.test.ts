import { expect } from 'chai';
import { Strlib } from '../../utils';
import { ROUTE_PATH_SEPARATOR, ROUTE_STRING_SERARATOR } from '../../interfaces';

const URI1 = 'catalog/category/books/ABCD123';
const URI2 = 'isbn-1234/info';
const URI3 = 'orders_pending/ABC123';
const URI4 = 'isp';

describe('#strlib.ts', () => {
  describe('#extractUriParam', () => {
    it('#Should extract param from uri', () => {
      const res = Strlib.extractUriParam(URI1);

      expect(res.param).to.equal('catalog/');
      expect(res.rest).to.equal('category/books/ABCD123');
    });

    it('#Should extract param with prefix from uri', () => {
      const res = Strlib.extractUriParam(URI2, 'isbn-', '/');

      expect(res.param).to.equal('1234');
      expect(res.rest).to.equal('info');
    });

    it('#Should NOT extract param with prefix if uri is shorter than prefix', () => {
      const res = Strlib.extractUriParam(URI4, 'isbn-', '/');
      expect(res).to.be.null;
    });

    it('#Should NOT extract param with prefix if postfix does not match', () => {
      const res = Strlib.extractUriParam(URI2, 'isbn-', '-book/');
      expect(res).to.be.null;
    });

    it('#Should NOT extract param with prefix if uri is shorter than prefix', () => {
      const res = Strlib.extractUriParam(URI4, 'isbn-', '/');
      expect(res).to.be.null;
    });
  });

  describe('#splitUriByPathSeparator', () => {
    it('#should split URL by path separator', () => {
      const res = Strlib.splitUriByPathSeparator(URI1, [ROUTE_PATH_SEPARATOR]);
      expect(res.head).to.equal('catalog/');
      expect(res.tail).to.equal('category/books/ABCD123');
    });
  });

  describe('#splitUriByPathSeparator', () => {
    it('#should split URL by path separator OR ROUTE_STRING_SEPARATOR', () => {
      const res = Strlib.splitUriByPathSeparator(URI3, [
        ROUTE_PATH_SEPARATOR,
        ROUTE_STRING_SERARATOR,
      ]);
      expect(res.head).to.equal('orders_');
      expect(res.tail).to.equal('pending/ABC123');
    });
  });
});

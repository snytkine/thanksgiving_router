import { expect } from 'chai';
import { BasicController, UniqueController } from '../..';
import { IRouteMatch } from '../../interfaces';
import Router from '../../router';

describe('#Integrated Router test', () => {
  const uri1 = '/catalog/toys/';
  const uri2 = '/catalog/toys/cars/{make}/{model}';
  const uri3 = '/catalog/toys/cars/{make}/mymodel-{model-x}-item/id-{id}.html';
  const uri4 = '/catalog/toys/cars/{id:widget-([0-9]+)(green|red)}/{year:([0-9]{4})}';
  const uri5 = '/catalog/toys/cars/{make}/mymodel-{model-x}';

  const router = new Router();
  router.addRoute(uri1, new BasicController('CTRL-1', 'ctrl1'));
  router.addRoute(uri2, new BasicController('CTRL-2', 'ctrl2'));
  router.addRoute(uri3, new BasicController('CTRL-3', 'ctrl3'));
  router.addRoute(uri4, new BasicController('CTRL-4', 'ctrl4'));
  router.addRoute(uri5, new BasicController('CTRL-5', 'ctrl5'));

  describe('#findRoute tests', () => {
    it('Should find matching route', () => {
      const res1 = <IRouteMatch<BasicController<string>>>router.findRoute('/catalog/toys/');

      expect(res1.controller.id).to.equal('ctrl1');
      expect(res1.node.name).to.equal('ExactMathNode::toys/');
    });

    it('Should find route with extracted path parameters', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/toyota/rav4')
      );
      expect(res.controller.id).to.equal('ctrl2');

      expect(res.node.name).to.equal(`PathParamNode::model::''::''`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'make',
          paramValue: 'toyota',
        },
        {
          paramName: 'model',
          paramValue: 'rav4',
        },
      ]);
    });

    it('should find route with path params in 2 uri segments', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/gm/mymodel-gtx-item/id-35.html')
      );
      expect(res.controller.id).to.equal('ctrl3');

      expect(res.node.name).to.equal(`PathParamNode::id::'id-'::'.html'`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'make',
          paramValue: 'gm',
        },
        {
          paramName: 'model-x',
          paramValue: 'gtx',
        },
        {
          paramName: 'id',
          paramValue: '35',
        },
      ]);
    });

    it('should find route with regex params', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/widget-678green/2015')
      );
      expect(res.controller.id).to.equal('ctrl4');

      expect(res.node.name).to.equal(`PathParamNodeRegex::'year'::'^([0-9]{4})$'::''::''`);

      expect(res.params.pathParams).to.deep.equal([
        {
          paramName: 'id',
          paramValue: 'widget-678green',
        },
        {
          paramName: 'year',
          paramValue: '2015',
        },
      ]);

      expect(res.params.regexParams).to.deep.equal([
        {
          paramName: 'id',
          params: ['widget-678green', '678', 'green'],
        },
        {
          paramName: 'year',
          params: ['2015', '2015'],
        },
      ]);
    });

    it('.addRoute with 2 urls that start with "/" should add just one child node "/"', () => {
      const router = new Router();
      const ctrl = new BasicController('controller1', 'ctrl1');
      const ctrl2 = new BasicController('controller1', 'ctrl2');

      router.addRoute('/path1', ctrl);
      router.addRoute('/path2', ctrl2);

      expect(router.rootNode.children.length).to.equal(1);
    });

    it('should not find matching regex route if regex param did not match but find next matching route', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/toys/cars/widget-678yellow/2015')
      );

      expect(res.controller.id).to.equal('ctrl2');

      expect(res.node.name).to.equal(`PathParamNode::model::''::''`);
    });

    it('should not find matching route if uri does not match any added routes', () => {
      const res = <IRouteMatch<BasicController<string>>>(
        router.findRoute('/catalog/books/cars/widget-678yellow/2015')
      );

      expect(res).to.be.undefined;
    });

    it('.addRoute with empty url should add controller', () => {
      const router = new Router();
      const ctrl = new UniqueController('rootController');
      router.addRoute('', ctrl);

      expect(router.rootNode.controllers[0]).to.equal(ctrl);
    });
  });
  /*
  describe('Makeurl tests', () => {

    it('Should create full url from Route', () => {
      const ctrl = <IRouteMatch<BasicController<string>>>router.getRouteMatchByControllerId('ctrl3');

      const url = makeUrl(ctrl.node,{
        'make':    'honda',
        'model-x': 'crv',
        'id':      '12345'
      })

      expect(url)
      .to
      .equal('/catalog/toys/cars/honda/mymodel-crv-item/id-12345.html')
    })
  }) */
});

import { expect } from 'chai';
import { CatchAllNode, ExactMatchNode } from '../../nodes';
import { getNodePriority, PRIORITY } from '../../nodes/nodepriorities';
import { BasicController } from '../../lib';
import { CATCH_ALL_PARAM_NAME, IRouteMatch } from '../../interfaces';
import TAG from '../../enums/nodetags';
import { RouterError, RouterErrorCode } from '../../errors';

describe('#CatchAllNode.ts', () => {
  describe('#CatchAllNode object test', () => {
    const node1 = new CatchAllNode();
    /**
     * CatchAllNode with custom name
     */
    const node2 = new CatchAllNode('images');

    it('Created instance should be an instance of  CatchAllNode', () => {
      expect(node1).to.be.instanceOf(CatchAllNode);
    });

    it('CatchAllNode should have priority of PRIORITY.CATCHALL', () => {
      expect(node1.priority).to.equal(getNodePriority(PRIORITY.CATCHALL));
    });

    it('CatchAllNode should have name CATCH_ALL_PARAM_NAME', () => {
      expect(node1.name).to.equal(`${TAG.CATCHALL_NODE}::${CATCH_ALL_PARAM_NAME}`);
    });

    it('CatchAllNode should have name type TAG.CATCHALL_NODE', () => {
      expect(node1.type).to.equal(TAG.CATCHALL_NODE);
    });

    it('CatchAll named node should have name passed in constructor', () => {
      expect(node2.name).to.equal(`${TAG.CATCHALL_NODE}::images`);
    });

    it('CatchAll named node should return named uriTemplate', () => {
      expect(node2.uriTemplate).to.equal(`${CATCH_ALL_PARAM_NAME}images`);
    });

    it('CatchAll unnamed node should return uriTemplate **', () => {
      expect(node1.uriTemplate).to.equal(`${CATCH_ALL_PARAM_NAME}`);
    });

    it('.equals should be true if other node is CatchAllNode', () => {
      const isEqual = node1.equals(node2);
      expect(isEqual).to.be.true;
    });

    it('.equals should be false if other node is NOT CatchAllNode', () => {
      const isEqual = node1.equals(new ExactMatchNode('someurl'));
      expect(isEqual).to.be.false;
    });

    it('CatchAllNode should have initial empty children array', () => {
      expect(Array.isArray(node1.children)).to.be.true;

      expect(node1.children.length).to.equal(0);
    });

    it('Calling addController method twice should add 2 controllers', () => {
      const node = new CatchAllNode();
      const ctrl = new BasicController('controller1');
      const ctrl2 = new BasicController('controller2');
      node.addController(ctrl);
      node.addController(ctrl2);

      expect(node.controllers.length).to.equal(2);

      expect(node.controllers[0]).to.equal(ctrl);

      expect(node.controllers[1]).to.equal(ctrl2);
    });

    it('Calling addController method twice with same controller should throw', () => {
      const node = new CatchAllNode();
      const ctrl = new BasicController('controller1');
      node.addController(ctrl);
      let res: RouterError;
      try {
        node.addController(ctrl);
      } catch (e) {
        res = e;
      }
      expect(res.code).to.equal(RouterErrorCode.DUPLICATE_CONTROLLER);
    });

    it('.makeUri should return uri', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1');

      node.addController(ctrl);

      const uri = node.makeUri({ images: '/documents/files/file1.png' });

      expect(uri).to.equal('/documents/files/file1.png');
    });

    it('.makeUri without param name should throw', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1');

      node.addController(ctrl);
      let res: RouterError;
      try {
        node.makeUri({
          param1: 'value1',
          order: '1234',
        });
      } catch (e) {
        res = e;
      }
      expect(res.code).to.equal(RouterErrorCode.MAKE_URI_MISSING_PARAM);
    });

    it('.getRouteMatch should return RouteMatch with controller1 and controller2 and passed uri as value of paramName.', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1');
      const ctrl2 = new BasicController('controller2');
      node.addController(ctrl);
      node.addController(ctrl2);

      const routeMatch = node.getRouteMatch('/images/recent/small/pic.js');

      expect(routeMatch.node.controllers.length).to.equal(2);
      expect(routeMatch.node.controllers[0]).to.equal(ctrl);
      expect(routeMatch.params.pathParams[0].paramName).to.equal('images');
      expect(routeMatch.params.pathParams[0].paramValue).to.equal('/images/recent/small/pic.js');

      /**
       * Second RouteMatch should have different controller
       * but same paramName and paramValue
       */
      expect(routeMatch.node.controllers[1]).to.equal(ctrl2);
    });

    it('Calling .getRouteMatch with different URIs should return same routes but with different paramValue', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1');
      node.addController(ctrl);

      const routeMatch = node.getRouteMatch('/images/recent/small/pic.js');
      const routeMatch2 = node.getRouteMatch('/anything/random/path/file.html');

      expect(routeMatch.node.controllers.length).to.equal(1);
      expect(routeMatch.node.controllers[0]).to.equal(ctrl);
      expect(routeMatch.params.pathParams[0].paramName).to.equal('images');
      expect(routeMatch.params.pathParams[0].paramValue).to.equal('/images/recent/small/pic.js');

      /**
       * routeMatch2  should have same controller
       * and same paramName but paramValue should be
       * equal to uri passed in findRoute (a different uri)
       */
      expect(routeMatch2.node.controllers[0]).to.equal(ctrl);
    });

    it('.addChildNode should throw', () => {
      const node = new CatchAllNode('images');
      let res: RouterError;
      try {
        node.addChildNode(new ExactMatchNode('mynode'));
      } catch (e) {
        res = e;
      }
      expect(res.code).to.equal(RouterErrorCode.ADD_CHILD_CATCHALL);
    });

    it('.getAllRoutes should return iterator with all controllers', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1');
      const ctrl2 = new BasicController('controller2');

      node.addController(ctrl);
      node.addController(ctrl2);

      const res = node.getAllRoutes();
      const { controllers } = res[0].node;

      expect(controllers[0]).to.equal(ctrl);
      expect(controllers[1]).to.equal(ctrl2);
      expect(res[1]).to.equal(undefined);
    });

    it('.getRouteMatchByControllerId should return matching controller', () => {
      const node = new CatchAllNode('images');
      const ctrl = new BasicController('controller1', 'id1');
      const ctrl2 = new BasicController('controller2', 'id2');
      const ctrl3 = new BasicController('controller3', 'id3');

      node.addController(ctrl);
      node.addController(ctrl2);
      node.addController(ctrl3);

      const res = <IRouteMatch<BasicController<string>>>node.getRouteMatchByControllerId('id2');

      expect(res.node).to.equal(node);

      expect(res.node.controllers).to.include(ctrl2);
    });
  });
});

'use strict';

const { SimpleClass, ManagerDiscovery } = require('homey');
const PlugwiseBridge = require('./PlugwiseBridge');
const PlugwiseAnnaBridgeLegacy = require('./PlugwiseAnnaBridgeLegacy');
const PlugwiseSmileP1Bridge = require('./PlugwiseSmileP1Bridge');

const fetch = require('node-fetch');

module.exports = class PlugwiseDiscovery extends SimpleClass {
  
  static get BRIDGES() {
    return {
      'smile_open_therm': PlugwiseBridge,
      'smile_thermo': PlugwiseBridge,
      'smile-thermo': PlugwiseAnnaBridgeLegacy,
      'smile': PlugwiseSmileP1Bridge,
    };
  }
  
  constructor() {
    super();
    
    this._bridges = {};
    
    this._discoveryStrategy = ManagerDiscovery.getDiscoveryStrategy('plugwise');
    this._discoveryStrategy.on('result', discoveryResult => {
      
      const bridgeName = discoveryResult.name;
      const bridgeAddress = discoveryResult.address;
      const bridgeVersion = discoveryResult.txt.version;
      const bridgeProduct = discoveryResult.txt.product;
      const bridgeId = discoveryResult.host
        .replace('.local', '')
        .replace('smile', '')
    
      fetch(`http://${bridgeAddress}`).then(res => {
        const server = res.headers.get('server');
        if(!server || !server.toLowerCase().includes('plugwise')) return;
        
        if( this._bridges[bridgeId] ) {
          if( this._bridges[bridgeId].address !== bridgeAddress ) {
            this.log(`Bridge ${bridgeId} changed address from ${this._bridges[bridgeId].address} to ${bridgeAddress}`);
            this._bridges[id].address = bridgeAddress;
          }
          
          if( this._bridges[bridgeId].version !== bridgeVersion ) {
            this.log(`Bridge ${bridgeId} changed version from ${this._bridges[bridgeId].version} to ${bridgeVersion}`);
            this._bridges[id].version = bridgeVersion;
          }
        } else {
          const PlugwiseBridge = this.constructor.BRIDGES[bridgeProduct];
          if( !PlugwiseBridge )
            throw new Error(`Unspported product: ${bridgeProduct}`);
          
          const bridge = this._bridges[bridgeId] = new PlugwiseBridge({
            id: bridgeId,
            address: bridgeAddress,
            version: bridgeVersion,
            name: bridgeName,
            product: bridgeProduct,
          });
          this.emit(`bridge`, bridge);
          this.emit(`bridge:${bridge.id}`, bridge);
        	this.log('Found', bridge.constructor.name, bridge.product, bridge.id, bridge.version, bridge.address);
        }      
      }).catch(this.error);
    });
    
  }
  
  get bridges() {
    return this._bridges;
  }
  
}
import { callService as callHassService } from 'home-assistant-js-websocket';
import Hass from './lib/HassConnector';
import * as utils from './utils';
import * as constants from './const';

/*
 * This class singleton should provide functions that interact with Home Assistant
 */
let logger;

class HomeAssistantService {
  constructor(_eventCallback, _logger = false, _additionalOpts) {
    const hassOpts = {
      hassUrl: _additionalOpts.hass_url,
      access_token: _additionalOpts.access_token,
    };

    logger = _logger || console;
    this.hass = new Hass(hassOpts);
    this.connected = false;
    this.eventCallback =
      typeof _eventCallback === 'function' ? _eventCallback : false;
    this.init();
  }

  async connect() {
    try {
      logger.info('Connecting to Home Assistant');
      await this.hass.connect();
      this.connected = true;
      logger.info('Connected to Home Assistant');
    } catch (e) {
      logger.error('There was an error connecting to Home Assistant', e);
      this.connected = false;
    }
  }

  init = async () => {
    try {
      await this.connect();
    } catch (e) {
      logger.error(e);
    }
    // eventually do stuff now with hass like hass.subscribeEntities(handler)
    // but for now like this
    this.hass.conn.subscribeEvents(e => {
      if (typeof this.eventCallback === 'function') {
        this.eventCallback(e);
      }
    });
  };

  setEventCallback = cb => {
    this.eventCallback = cb;
  };

  callService = async ({ domain, service, serviceData }) => {
    logger.info('calling service', domain, service, serviceData);
    try {
      callHassService(this.hass.conn, domain, service, serviceData);
    } catch (e) {
      logger.error(e);
    }
  };
}

export { utils, constants };
export default HomeAssistantService;

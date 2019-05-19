'use strict';

const Homey = require('homey');
const PlugwiseThermostatDevice = require('../../lib/PlugwiseThermostatDevice');

module.exports = class PlugwiseAnnaDevice extends PlugwiseThermostatDevice {

    onInit(...props) {
        super.onInit(...props);

        this.registerCapabilityListener('location_preset', this.onCapabilityLocationPreset.bind(this));

        this._setLocationPresetAction = new Homey.FlowCardAction('Set_Location_Preset')
            .register().registerRunListener(this._setLocationPresetRunListener.bind(this));
    }

    async _setLocationPresetRunListener(args) {
        const { applianceId } = this;

        return args.device.bridge.setPreset({
            applianceId: applianceId,
            preset: args.preset
        });
    }

    async onCapabilityLocationPreset(value) {
        const { applianceId } = this;

        return this.bridge.setPreset({
            applianceId,
            preset: value
        });
    }
};
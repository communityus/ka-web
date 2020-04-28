'use strict';

var Reflux = require('reflux');
var StatefulMixinStore = require('/app/js/stores/mixins/stateful');
var _ = require('lodash');

var BuildingWindowActions = require('/app/js/actions/windows/building');
var WindowActions = require('/app/js/actions/window');
var GenericBuildingRPCActions = require('/app/js/actions/rpc/genericBuilding');

var GenericBuildingRPCStore = Reflux.createStore({
    listenables: [BuildingWindowActions, GenericBuildingRPCActions],

    mixins: [StatefulMixinStore],

    getDefaultData: function() {
        return {
            id: '',
            name: '',
            image: '',
            level: 0,
            x: 0,
            y: 0,
            food_hour: 0,
            food_capacity: 0,
            energy_hour: 0,
            energy_capacity: 0,
            ore_hour: 0,
            ore_capacity: 0,
            water_hour: 0,
            water_capacity: 0,
            waste_hour: 0,
            waste_capacity: 0,
            happiness_hour: 0,
            efficiency: 0,
            extraViewData: {},

            repair_costs: {
                food: 0,
                water: 0,
                energy: 0,
                ore: 0,
            },
            downgrade: {
                can: 1,
                reason: '',
                image: '',
            },
            upgrade: {
                can: 1,
                reason: '',

                cost: {
                    food: 0,
                    water: 0,
                    energy: 0,
                    waste: 0,
                    ore: 0,
                    time: 0,
                },
                production: {
                    food_hour: 0,
                    food_capacity: 0,
                    energy_hour: 0,
                    energy_capacity: 0,
                    ore_hour: 0,
                    ore_capacity: 0,
                    water_hour: 0,
                    water_capacity: 0,
                    waste_hour: 0,
                    waste_capacity: 0,
                    happiness_hour: 0,
                },
                image: '',
            },
        };
    },

    handleNewData: function(result) {
        var building = _.assign(this.getDefaultData(), result.building);

        building.efficiency = building.efficiency * 1;

        // Glyph buildings will return a halls cost in the upgrade cost but normal buildings will
        // will only return the standard resources. Make sure they all exist so as to prevent
        // errors on the component level.
        building.upgrade.cost.food = building.upgrade.cost.food || 0;
        building.upgrade.cost.ore = building.upgrade.cost.ore || 0;
        building.upgrade.cost.water = building.upgrade.cost.water || 0;
        building.upgrade.cost.energy = building.upgrade.cost.energy || 0;
        building.upgrade.cost.waste = building.upgrade.cost.waste || 0;
        building.upgrade.cost.time = building.upgrade.cost.time || 0;
        building.upgrade.cost.halls = building.upgrade.cost.halls || 0;

        // Any 'view' call that returns extra data (say, the Planetary Command Center) has that
        // data put into 'building.extraViewData' so that it is accessible from the store.
        var extraViewData = {};

        _.each(result, function(value, key) {
            if (key === 'status' || key === 'building') {
                return;
            }

            extraViewData[key] = _.cloneDeep(value);
        });

        building.extraViewData = extraViewData;

        // Manually update the old planet map with the new data we got.
        YAHOO.lacuna.MapPlanet.ReloadBuilding(_.cloneDeep(building));

        this.emit(building);
    },

    onBuildingWindowClear: function() {
        this.emit(this.getDefaultData());
    },

    onBuildingWindowUpdate: function(o) {
        this.handleNewData(o);
        YAHOO.lacuna.MapPlanet.RefreshWithData({
            result: o,
        });
    },

    onSuccessBuildingWindowView: function(result) {
        this.handleNewData(result);
    },

    onSuccessBuildingWindowRepair: function(result) {
        this.handleNewData(result);
        WindowActions.windowCloseByType('building');
    },

    onSuccessGenericBuildingRPCDowngrade: function(result) {
        WindowActions.windowCloseByType('building');
    },

    onSuccessGenericBuildingRPCUpgrade: function(result) {
        WindowActions.windowCloseByType('building');
    },

    onSuccessGenericBuildingRPCDemolish: function(result) {
        WindowActions.windowCloseByType('building');
    },
});

module.exports = GenericBuildingRPCStore;

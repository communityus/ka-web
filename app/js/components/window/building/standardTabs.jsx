'use strict';

var React = require('react');

var Tabber = require('/app/js/components/tabber');
var Tab = Tabber.Tab;

var ProductionTab = require('/app/js/components/window/building/productionTab');
var RepairTab = require('/app/js/components/window/building/repairTab');

var StandardTabs = {
    tabs: function(options, building) {
        var tabs = [];

        if (building.efficiency !== 100 && building.id) {
            tabs.push(
                <Tab title='Repair' key='Repair'>
                    <RepairTab building={building} />
                </Tab>
            );
        }

        tabs.push(
            <Tab title='Production' key='Production'>
                <ProductionTab building={building} />
            </Tab>
        );

        return tabs;
    },
};

module.exports = StandardTabs;

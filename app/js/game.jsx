'use strict';

YAHOO.namespace('lacuna');

var React = require('react');
var ReactDom = require('react-dom');
var _ = require('lodash');
var ReactTooltip = require('react-tooltip');

var KeyboardActions = require('/app/js/actions/keyboard');
var MenuActions = require('/app/js/actions/menu');
var SessionActions = require('/app/js/actions/session');
var TickerActions = require('/app/js/actions/ticker');
var UserActions = require('/app/js/actions/user');
var WindowActions = require('/app/js/actions/window');

var GameWindow = require('/app/js/components/gameWindow');
var Captcha = require('/app/js/components/window/captcha');

var BodyRPCStore = require('/app/js/stores/rpc/body');

var constants = require('/app/js/constants');

if (typeof YAHOO.lacuna.Game === 'undefined' || !YAHOO.lacuna.Game) {
    (function() {
        var Util = YAHOO.util;
        var Lang = YAHOO.lang;
        var Cookie = Util.Cookie;
        var Dom = Util.Dom;
        var Event = Util.Event;
        var Lacuna = YAHOO.lacuna;
        var Lib = Lacuna.Library;

        var Game = {
            EmpireData: {},
            Resources: {},
            ServerData: {},
            Services: {},
            Timeout: 60000,
            HourMS: 3600000, // (60min * 60sec * 1000ms),
            onTick: new Util.CustomEvent('onTick'),
            OverlayManager: new YAHOO.widget.OverlayManager(),

            Start: function(query) {
                var l = window.location;
                Game.domain = l.hostname || 'kenoantigen.com';

                // This is some glue code to make the server, body and empire stores listen for changes.
                // Normally, React Components should do this automatically, but since we need these
                // stores operating immeadiatly we do it here.
                // TODO: remove this!
                require('/app/js/stores/user').listen(_.noop);
                require('/app/js/stores/ticker').listen(_.noop);

                var body = document.getElementById('body');

                // Give the React stuff somewhere to go.
                var container = document.createElement('div');
                container.id = 'mainGameContainer';
                body.appendChild(container);

                ReactDom.render(<GameWindow />, document.getElementById('mainGameContainer'));

                require('/app/js/actions/menu/loader').loaderMenuShow();

                // add overlay manager functionality
                Game.OverlayManager.hideAllBut = function(id) {
                    var overlays = this.overlays;
                    var n = overlays.length;
                    var i;

                    for (i = n - 1; i >= 0; i--) {
                        if (overlays[i].id !== id) {
                            overlays[i].hide();
                        }
                    }
                };
                Game.escListener = new Util.KeyListener(
                    document,
                    {
                        keys: 27,
                    },
                    {
                        fn: function() {
                            Game.OverlayManager.hideAll();
                            KeyboardActions.escKey();
                        },
                        scope: Game.OverlayManager,
                        correctScope: true,
                    }
                );

                // get resources right away since they don't depend on anything.
                Game.Resources = require('/app/js/resources');
                Game.PreloadUI();

                Game.Services = Game.InitServices(YAHOO.lacuna.SMD.Services);

                // The tooltips can often disappear because their parent elements are removed from the
                // DOM and then replaced later. For example, switching between tabs that each have
                // tooltips in them. Calling this every tick ensures that the tooltips are rebuilt if
                // they disappear.
                TickerActions.tickerTick.listen(function() {
                    ReactTooltip.rebuild();
                });

                if (!query) {
                    query = {};
                }

                var session = Game.GetSession();
                if (query.referral) {
                    // if they came from somewhere else
                    var now = new Date();
                    Cookie.set('lacunaReferral', query.referral, {
                        domain: Game.domain,
                        expires: new Date(now.setFullYear(now.getFullYear() + 1)),
                    });
                }
                if (query.reset_password) {
                    Game.InitLogin();
                    Game.LoginDialog.resetPassword(query.reset_password);
                    return;
                }
                if (query.facebook_uid) {
                    Game.InitLogin();
                    Game.LoginDialog.initEmpireCreator();
                    Game.EmpireCreator.facebookReturn(
                        query.facebook_uid,
                        query.facebook_token,
                        query.facebook_name
                    );
                    return;
                } else if (query.session_id) {
                    Game.SetSession(query.session_id);
                } else if (query.empire_id) {
                    Game.InitLogin();
                    Game.LoginDialog.initEmpireCreator();
                    Game.SpeciesCreator.show(query.empire_id);
                    return;
                } else if (!session) {
                    Game.DoLogin();
                    return;
                }

                // Run rest of UI since we're logged in
                Game.GetStatus({
                    success: Game.Run,
                    failure: function(o) {
                        Game.Reset();
                        Game.DoLogin(o.error);
                        return true;
                    },
                });
            },
            Failure: function(o, retry, fail) {
                // session expired
                if (o.error.code === 1006) {
                    Game.Reset();
                    Game.DoLogin(o.error);
                } else if (o.error.code === 1200) {
                    // Game over
                    window.alert(o.error.message);
                    Game.Reset();
                    window.location = o.error.data;
                } else if (o.error.code === 1016) {
                    // Captcha
                    WindowActions.windowAdd(Captcha, 'captcha', {
                        success: retry,
                    });
                } else if (o.error.code === -32603) {
                    // Internal error
                    Game.QuickDialog(
                        {
                            width: '500px',
                            text: [
                                '<p>An internal error has occurred.  Please report this on <a target="_blank" href="https://github.com/kantigen/ka-server/issues">the support forums</a>, and include the data below.</p>',
                                '<textarea style="width: 100%; height: 300px;" id="internalErrorMessageText" readonly="readonly" onclick="this.select()"></textarea>',
                            ].join(''),
                            buttons: [
                                {
                                    text: 'Close',
                                    handler: function() {
                                        this.hide();
                                    },
                                },
                            ],
                        },
                        function() {
                            Dom.get('internalErrorMessageText').value = o.error.data;
                        }
                    );
                } else {
                    fail();
                }
            },
            InitLogin: function() {
                if (!Lacuna.Game.LoginDialog) {
                    console.log('Creating login dialog');
                    Lacuna.Game.LoginDialog = new Lacuna.Login();
                    Lacuna.Game.LoginDialog.subscribe('onLoginSuccessful', function(oArgs) {
                        var result = oArgs.result;
                        // remember session
                        Game.SetSession(result.session_id);

                        Game.RemoveCookie('locationId');
                        Game.RemoveCookie('locationView');

                        // store empire data
                        Lacuna.Game.ProcessStatus(result.status);
                        // Run rest of UI now that we're logged in

                        Lacuna.Game.Run();
                        if (result.welcome_message_id) {
                            Game.QuickDialog({
                                width: '400px',
                                text: [
                                    'Welcome to the Lacuna Expanse.  It is recommended that you play through the in game tutorial to familiarize yourself with the game, and to get some free resources to build up your empire.',
                                    '<p>If you choose to skip the tutorial now you may find it by clicking <img src=",Lib.AssetUrl,"ui/s/inbox.png" title="Inbox" style="width:19px;height:22px;vertical-align:middle;margin:-5px 0 -4px -2px" /> at the top of the interface and find the message with the subject `Welcome`.</p>',
                                    '<p>Thanks for playing!</p>',
                                ].join(''),
                                buttons: [
                                    {
                                        text: 'View Tutorial',
                                        handler: function() {
                                            this.hide();
                                            Lacuna.Messaging.showMessage(result.welcome_message_id);
                                        },
                                        isDefault: true,
                                    },
                                    {
                                        text: 'Skip Tutorial',
                                        handler: function() {
                                            this.hide();
                                        },
                                    },
                                ],
                            });
                        }
                    });
                }
            },
            DoLogin: function(error) {
                Dom.setStyle(
                    document.body,
                    'background',
                    'url(' + Lib.AssetUrl + 'star_system/field.png) repeat scroll 0 0 black'
                );
                this.InitLogin();
                Lacuna.Game.LoginDialog.show(error);
                MenuActions.menuHide();
                require('/app/js/actions/menu/loader').loaderMenuHide();
            },
            Run: function() {
                // set our interval going for resource calcs since Logout clears it
                Game.recTime = new Date().getTime();
                Game.isRunning = 1;

                /* possible new pattern for game loop*/
                (function GameLoop() {
                    if (Game.isRunning) {
                        Game.Tick();
                        setTimeout(GameLoop, 1000);
                    }
                })();

                // init event subscribtions if we need to
                Game.InitEvents();
                // enable esc handler
                Game.escListener.enable();

                document.title = 'KA - ' + Game.EmpireData.name;

                SessionActions.sessionSet(Game.GetSession(''));
                UserActions.userSignIn();
            },
            InitEvents: function() {
                // make sure we only subscribe once
                if (!Lacuna.Game._hasRun) {
                    Game._hasRun = true;

                    Event.on(window, 'resize', function(e) {
                        // taken from YUI Overlay
                        if (YAHOO.env.ua.ie) {
                            if (!window.resizeEnd) {
                                window.resizeEnd = -1;
                            }

                            clearTimeout(window.resizeEnd);

                            window.resizeEnd = setTimeout(function() {
                                Lacuna.Game.Resize();
                            }, 100);
                        } else {
                            Lacuna.Game.Resize();
                        }
                    });
                }
            },
            InitServices: function(smd) {
                var serviceOut = {};
                var successFunc = function() {
                    for (var methodName in this) {
                        if (this.hasOwnProperty(methodName) && Lang.isFunction(this[methodName])) {
                            var method = this[methodName];
                            this[methodName] = Game.WrappedService(method, sKey + '.' + methodName);
                        }
                    }
                };
                for (var sKey in smd) {
                    if (smd.hasOwnProperty(sKey)) {
                        var oSmd = smd[sKey];
                        if (oSmd.services) {
                            serviceOut[sKey] = new YAHOO.rpc.Service(
                                oSmd,
                                {
                                    success: successFunc,
                                },
                                constants.RPC_BASE
                            );
                        } else {
                            serviceOut[sKey] = Game.InitServices(oSmd);
                        }
                    }
                }
                return serviceOut;
            },
            WrappedService: function(method, name) {
                var logNS = 'Game.RPC.' + name + '.failure';
                var func = function(params, origOpts) {
                    var retry = function() {
                        var opts = { retry: 0 };
                        YAHOO.lang.augmentObject(opts, origOpts, true);
                        opts.retry++;
                        func(params, opts);
                    };
                    var opts = {
                        failure: function(o) {
                            var self = this;
                            var failure = function(silent) {
                                if (Lang.isFunction(origOpts.failure)) {
                                    if (origOpts.failure.call(self, o)) {
                                        return;
                                    }
                                }
                                if (!silent) {
                                    window.alert(o.error.message);
                                }
                            };
                            YAHOO.log(o, 'error', logNS);
                            require('/app/js/actions/menu/loader').loaderMenuHide();
                            Game.Failure(o, retry, failure);
                        },
                    };
                    YAHOO.lang.augmentObject(opts, origOpts);
                    if (!('timeout' in opts)) {
                        opts.timeout = Game.Timeout;
                    }
                    method(params, opts);
                };
                return func;
            },
            PreloadUI: function() {
                var images = Lib.UIImages;
                for (var i = 0; i < images.length; i++) {
                    var url = Lib.AssetUrl + images[i];
                    var img = new window.Image();
                    img.src = url;
                }
            },
            QuickDialog: function(config, afterRender, afterHide) {
                var container = document.createElement('div');
                if (config.id) {
                    container.id = config.id;
                    delete config.id;
                }
                YAHOO.lang.augmentObject(config, {
                    fixedcenter: true,
                    visible: false,
                    draggable: false,
                    constraintoviewport: true,
                    modal: true,
                    close: false,
                    zindex: 20000,
                });
                Dom.addClass(container, 'quick-dialog');
                document.body.insertBefore(container, document.body.firstChild);
                var dialog = new YAHOO.widget.SimpleDialog(container, config);
                dialog.renderEvent.subscribe(function() {
                    if (afterRender) {
                        afterRender.call(this);
                    }
                    this.show();
                });
                dialog.hideEvent.subscribe(function() {
                    if (afterHide) {
                        afterHide.call(this);
                    }
                    // let the current process complete before destroying
                    setTimeout(function() {
                        dialog.destroy();
                    }, 1);
                });
                dialog.render();
                Game.OverlayManager.register(dialog);
            },
            onRpc: function(oResult) {
                Lacuna.Game.ProcessStatus(oResult.status);
            },

            ProcessStatus: function(status) {
                if (status) {
                    if (status.server) {
                        // add everything from status empire to game empire
                        Lang.augmentObject(Game.ServerData, status.server, true);
                        Game.ServerData.time = Lib.parseServerDate(Game.ServerData.time);

                        if (status.server.announcement) {
                            Lacuna.Announce.show();
                        }
                    }
                    if (status.empire) {
                        // convert to numbers
                        status.empire.has_new_messages *= 1;
                        if (status.empire.happiness) {
                            status.empire.happiness *= 1;
                            status.empire.happiness_hour *= 1;
                        }

                        if (!Lacuna.Game.EmpireData.planets) {
                            Lacuna.Game.EmpireData.planets = {};
                        }
                        if (!Lacuna.Game.EmpireData.planetsByName) {
                            Lacuna.Game.EmpireData.planetsByName = {};
                        }
                        if (!Lacuna.Game.EmpireData.coloniesByName) {
                            Lacuna.Game.EmpireData.coloniesByName = {};
                        }
                        if (!Lacuna.Game.EmpireData.stationsByName) {
                            Lacuna.Game.EmpireData.stationsByName = {};
                        }
                        for (var cKey in status.empire.colonies) {
                            Lacuna.Game.EmpireData.coloniesByName[
                                status.empire.colonies[cKey]
                            ] = cKey;
                        }
                        for (var sKey in status.empire.stations) {
                            Lacuna.Game.EmpireData.stationsByName[
                                status.empire.stations[sKey]
                            ] = sKey;
                        }
                        for (var pKey in status.empire.planets) {
                            if (status.empire.planets.hasOwnProperty(pKey)) {
                                var ePlanet = Lacuna.Game.EmpireData.planets[pKey];
                                if (!ePlanet) {
                                    Lacuna.Game.EmpireData.planets[pKey] = {
                                        id: pKey,
                                        name: status.empire.planets[pKey],
                                        star_name: '',
                                        image: undefined,
                                        energy_capacity: 0,
                                        energy_hour: 0,
                                        energy_stored: 0,
                                        food_capacity: 0,
                                        food_hour: 0,
                                        food_stored: 0,
                                        happiness: 0,
                                        happiness_hour: 0,
                                        ore_capacity: 0,
                                        ore_hour: 0,
                                        ore_stored: 0,
                                        waste_capacity: 0,
                                        waste_hour: 0,
                                        waste_stored: 0,
                                        water_capacity: 0,
                                        water_hour: 0,
                                        water_stored: 0,
                                    };
                                } else {
                                    Lacuna.Game.EmpireData.planets[pKey].name =
                                        status.empire.planets[pKey];
                                }
                                Lacuna.Game.EmpireData.planetsByName[status.empire.planets[pKey]] =
                                    Lacuna.Game.EmpireData.planets[pKey];
                            }
                        }
                        delete status.empire.planets; // delete this so it doesn't overwrite the desired structure

                        // add everything from status empire to game empire
                        Lang.augmentObject(Lacuna.Game.EmpireData, status.empire, true);
                    }
                    if (status.body) {
                        var planet = status.body;
                        var p = Game.EmpireData.planets[planet.id];

                        if (p) {
                            Lang.augmentObject(p, planet, true);

                            p.energy_capacity *= 1;
                            p.energy_hour *= 1;
                            p.energy_stored *= 1;
                            p.food_capacity *= 1;
                            p.food_hour *= 1;
                            p.food_stored *= 1;
                            p.happiness *= 1;
                            p.happiness_hour *= 1;
                            p.ore_capacity *= 1;
                            p.ore_hour *= 1;
                            p.ore_stored *= 1;
                            p.waste_capacity *= 1;
                            p.waste_hour *= 1;
                            p.waste_stored *= 1;
                            p.water_capacity *= 1;
                            p.water_hour *= 1;
                            p.water_stored *= 1;
                        }
                    }
                }
            },
            GetStatus: function(callback) {
                var EmpireServ = Game.Services.Empire;
                var session = Game.GetSession();

                EmpireServ.get_status(
                    {
                        session_id: session,
                    },
                    {
                        success: function(o) {
                            YAHOO.log(o, 'info', 'Game.GetStatus.success');
                            Lacuna.Game.ProcessStatus(o.result);
                            if (callback && callback.success) {
                                return callback.success.call(this);
                            }
                        },
                        failure: function(o) {
                            if (callback && callback.failure) {
                                return callback.failure.call(this, o);
                            }
                        },
                        scope: (callback && callback.scope) || this,
                    }
                );
            },
            GetSession: function(replace) {
                if (!this._session) {
                    this._session = Game.GetCookie('session');
                }
                return this._session || replace;
            },
            SetSession: function(session) {
                if (session) {
                    Game.SetCookie('session', session);
                    Game._session = session;
                } else {
                    Game.RemoveCookie('session');
                    delete Game._session;
                }
            },
            GetCurrentPlanet: function() {
                return BodyRPCStore.getData();
            },
            GetSize: function() {
                var content = document.getElementById('content');
                var width = content.offsetWidth;
                var height = document.documentElement.clientHeight;

                return {
                    w: width,
                    h: height,
                };
            },
            Resize: function() {
                if (Lacuna.MapStar.IsVisible()) {
                    Lacuna.MapStar.Resize();
                } else if (Lacuna.MapPlanet.IsVisible()) {
                    Lacuna.MapPlanet.Resize();
                }
            },
            StarJump: function(star) {
                YAHOO.log(star, 'debug', 'StarJump');
                Game.OverlayManager.hideAll();
                require('/app/js/stores/menu/mapMode').setMapMode('starMap');
                // Lacuna.MapPlanet.MapVisible(false);
                // Lacuna.MapStar.MapVisible(true);
                Lacuna.MapStar.Jump(star.x * 1, star.y * 1);
            },
            GetBuildingDesc: function(url) {
                if (Game.Resources && Game.Resources.buildings) {
                    var desc = Game.Resources.buildings[url];
                    if (desc) {
                        return [
                            desc.description,
                            ' <a href="',
                            desc.wiki,
                            '" target="_blank">More Information on Wiki</a>',
                        ].join('');
                    } else {
                        return '';
                    }
                }
            },
            GetShipDesc: function(type) {
                if (Game.Resources && Game.Resources.ships) {
                    var desc = Game.Resources.ships[type];
                    if (desc) {
                        return [
                            desc.description,
                            ' <a href="',
                            desc.wiki,
                            '" target="_blank">More Information on Wiki</a>',
                        ].join('');
                    }
                }
            },
            GetContainerEffect: function(effect) {
                if (Game.GetCookieSettings('disableDialogAnim', '0') === '1') {
                    return;
                } else {
                    return (
                        effect || {
                            effect: YAHOO.widget.ContainerEffect.FADE,
                            duration: 0.5,
                        }
                    );
                }
            },

            Reset: function() {
                delete Game.isRunning;

                // disable esc handler
                Game.escListener.disable();

                document.title = 'Keno Antigen';
                Game.RemoveCookie('locationId');
                Game.RemoveCookie('locationView');

                Game.SetSession();
                Game.EmpireData = {};
                Lacuna.Stats.Reset();
                Lacuna.MapStar.Reset();
                Lacuna.MapPlanet.Reset();
                Lacuna.Notify.Hide();
                Lacuna.Notify.Destroy();
            },

            // Cookie helpers functions
            GetCookie: function(key, defaultValue) {
                var chip = Cookie.getSub('lacuna', key);
                return chip || defaultValue;
            },
            SetCookie: function(key, value, expiresDate) {
                var opts = {
                    domain: Game.domain,
                };

                if (expiresDate) {
                    opts.expires = expiresDate;
                }

                Cookie.setSub('lacuna', key, value, opts);
            },
            RemoveCookie: function(key) {
                Cookie.removeSub('lacuna', key, {
                    domain: Game.domain,
                });
            },
            RemoveAllCookies: function() {
                Cookie.remove('lacuna', {
                    domain: Game.domain,
                });
            },

            // using a more permanent cookie
            GetCookieSettings: function(key, defaultValue) {
                var chip = Cookie.getSub('lacunaSettings', key);
                return chip || defaultValue;
            },
            SetCookieSettings: function(key, value) {
                var now = new Date();
                var opts = {
                    domain: Game.domain,
                    expires: new Date(now.setFullYear(now.getFullYear() + 1)),
                };

                Cookie.setSub('lacunaSettings', key, value, opts);
            },
            RemoveCookieSettings: function(key) {
                Cookie.removeSub('lacunaSettings', key, {
                    domain: Game.domain,
                });
            },

            // Tick related
            Tick: function() {
                var ED = Lacuna.Game.EmpireData;
                var SD = Lacuna.Game.ServerData;
                var dt = new Date().getTime();
                var diff = dt - Lacuna.Game.recTime;

                Lacuna.Game.recTime = dt;
                SD.time = new Date(Lib.getTime(SD.time) + diff);

                var ratio = diff / Lacuna.Game.HourMS;

                for (var pKey in ED.planets) {
                    if (ED.planets.hasOwnProperty(pKey)) {
                        var planet = ED.planets[pKey];
                        var isNotStation = planet.type !== 'space station';

                        if (planet.energy_stored < planet.energy_capacity) {
                            planet.energy_stored += planet.energy_hour * ratio;

                            if (planet.energy_stored > planet.energy_capacity) {
                                planet.energy_stored = planet.energy_capacity;
                            } else if (planet.energy_stored < 0) {
                                if (isNotStation) {
                                    planet.happiness += planet.energy_stored;
                                }
                                planet.energy_stored = 0;
                            }
                        }

                        if (planet.food_stored < planet.food_capacity) {
                            planet.food_stored += planet.food_hour * ratio;

                            if (planet.food_stored > planet.food_capacity) {
                                planet.food_stored = planet.food_capacity;
                            } else if (planet.food_stored < 0) {
                                if (isNotStation) {
                                    planet.happiness += planet.food_stored;
                                }
                                planet.food_stored = 0;
                            }
                        }

                        if (planet.ore_stored < planet.ore_capacity) {
                            planet.ore_stored += planet.ore_hour * ratio;

                            if (planet.ore_stored > planet.ore_capacity) {
                                planet.ore_stored = planet.ore_capacity;
                            } else if (planet.ore_stored < 0) {
                                if (isNotStation) {
                                    planet.happiness += planet.ore_stored;
                                }
                                planet.ore_stored = 0;
                            }
                        }

                        if (planet.water_stored < planet.water_capacity) {
                            planet.water_stored += planet.water_hour * ratio;

                            if (planet.water_stored > planet.water_capacity) {
                                planet.water_stored = planet.water_capacity;
                            } else if (planet.water_stored < 0) {
                                if (isNotStation) {
                                    planet.happiness += planet.water_stored;
                                }
                                planet.water_stored = 0;
                            }
                        }

                        var wasteOverage = 0;
                        if (planet.waste_stored < planet.waste_capacity) {
                            planet.waste_stored += planet.waste_hour * ratio;

                            if (planet.waste_stored > planet.waste_capacity) {
                                wasteOverage = planet.waste_stored - planet.waste_capacity;
                                planet.waste_stored = planet.waste_capacity;
                            } else if (planet.waste_stored < 0) {
                                if (isNotStation) {
                                    planet.happiness += planet.waste_stored;
                                }
                                planet.waste_stored = 0;
                            }
                        } else {
                            wasteOverage = planet.waste_hour * ratio;
                        }

                        if (isNotStation) {
                            planet.happiness += planet.happiness_hour * ratio - wasteOverage;

                            if (planet.happiness < 0 && ED.is_isolationist === '1') {
                                planet.happiness = 0;
                            }
                        }
                    }
                }

                Game.onTick.fire(diff);
            },
            QueueAdd: function(id, type, ms) {
                if (!id || !type || !ms) {
                    return;
                }

                if (!Game.queue) {
                    Game.queue = {};
                }

                if (!Game.queue[type]) {
                    Game.queue[type] = {};
                }

                Game.queue[type][id] = ms;
            },
            QueueProcess: function(e, oArgs) {
                // only do anything if the queue actually has data
                if (Game.queue) {
                    var toFire = {};
                    var tickMS = oArgs[0];

                    for (var type in Game.queue) {
                        if (Game.queue.hasOwnProperty(type)) {
                            var qt = Game.queue[type];

                            for (var id in qt) {
                                if (qt.hasOwnProperty(id)) {
                                    var ms = qt[id] - tickMS;
                                    if (ms <= 0) {
                                        toFire[id] = type;
                                    } else {
                                        qt[id] = ms;
                                        Game.QueueTick(type, id, ms);
                                    }
                                }
                            }
                        }
                    }

                    for (var fId in toFire) {
                        if (toFire.hasOwnProperty(fId)) {
                            delete Game.queue[toFire[fId]][fId];
                            Game.QueueFire(toFire[fId], fId);
                        }
                    }
                }
            },
            QueueTick: function(type, id, ms) {
                switch (type) {
                    case Lib.QueueTypes.PLANET:
                        Lacuna.MapPlanet.QueueTick(id, ms);
                        break;
                    case Lib.QueueTypes.STAR:
                        break;
                    case Lib.QueueTypes.SYSTEM:
                        break;
                    default:
                        break;
                }
            },
            QueueFire: function(type, id) {
                YAHOO.log(arguments, 'debug', 'Game.QueueFire');

                switch (type) {
                    case Lib.QueueTypes.PLANET:
                        Lacuna.MapPlanet.ReLoadTile(id);
                        break;
                    case Lib.QueueTypes.STAR:
                        break;
                    case Lib.QueueTypes.SYSTEM:
                        break;
                    default:
                        YAHOO.log('type unknown', 'debug', 'Game.QueueFire');
                        break;
                }
            },
            QueueResetPlanet: function() {
                if (Game.queue && Game.queue[Lib.QueueTypes.PLANET]) {
                    var queue = Game.queue[Lib.QueueTypes.PLANET];

                    for (var id in queue) {
                        if (queue.hasOwnProperty(id)) {
                            queue[id] = 0;
                        }
                    }
                }
            },

            onScroll: (function() {
                var pixelsPerLine = 10;
                var ua = navigator.userAgent;
                var safari5 = ua.match(/\bSafari\//) && ua.match(/\bVersion\/5/);
                var isEventSupported = (function() {
                    var TAGNAMES = {
                        select: 'input',
                        change: 'input',
                        submit: 'form',
                        reset: 'form',
                        error: 'img',
                        load: 'img',
                        abort: 'img',
                    };
                    var cache = {};
                    function isEventSupported(eventName) {
                        var el = document.createElement(TAGNAMES[eventName] || 'div');
                        eventName = 'on' + eventName;
                        if (eventName in cache) {
                            return cache[eventName];
                        }
                        var isSupported = eventName in el;
                        if (!isSupported) {
                            el.setAttribute(eventName, 'return;');
                            isSupported = typeof el[eventName] === 'function';
                        }
                        cache[eventName] = isSupported;
                        el = null;
                        return isSupported;
                    }
                    return isEventSupported;
                })();

                if (isEventSupported('mousewheel')) {
                    return function(el, fn, obj, context) {
                        Event.on(
                            el,
                            'mousewheel',
                            function(e, o) {
                                var xDelta = 'wheelDeltaX' in e ? e.wheelDeltaX : 0;
                                var yDelta = 'wheelDeltaY' in e ? e.wheelDeltaY : e.wheelDelta;
                                // chrome/safari 4 give pixels
                                // safari 5 gives pixels * 120
                                if (safari5) {
                                    xDelta /= 120;
                                    yDelta /= 120;
                                }
                                fn.call(this, e, xDelta, yDelta, o);
                            },
                            obj,
                            context
                        );
                    };
                } else if (YAHOO.env.ua.gecko >= 1.9 && !ua.match(/\brv:1\.9\.0/)) {
                    // not possible to feature detect this, have to just use the version number
                    return function(el, fn, obj, context) {
                        Event.on(
                            el,
                            'MozMousePixelScroll',
                            function(e, o) {
                                var xAxis = e.axis === e.HORIZONTAL_AXIS;
                                var xDelta = xAxis ? -e.detail : 0;
                                var yDelta = xAxis ? 0 : -e.detail;
                                fn.call(this, e, xDelta, yDelta, o);
                            },
                            obj,
                            context
                        );
                    };
                } else {
                    return function(el, fn, obj, context) {
                        Event.on(
                            el,
                            'DOMMouseScroll',
                            function(e, o) {
                                var xAxis = 'axis' in e && e.axis === e.HORIZONTAL_AXIS;
                                // this event gets 'lines'
                                var xDelta = xAxis ? -e.detail * pixelsPerLine : 0;
                                var yDelta = xAxis ? 0 : -e.detail * pixelsPerLine;
                                fn.call(this, e, xDelta, yDelta, o);
                            },
                            obj,
                            context
                        );
                    };
                }
            })(),
        };

        YAHOO.lacuna.Game = Game;
    })();

    YAHOO.register('game', YAHOO.lacuna.Game, {
        version: '1',
        build: '0',
    });
}

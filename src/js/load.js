/**
 * Data loading utilities.
 *
 * This code loads nodes, routes and triggers.
 *
 * Once all data is loaded a data_ready event is fired.
 *
 * The detail attribute of this event contains a data object
 * that encapsulates all the loaded data.
 */
(function() {
    "use strict";
    const debug = false;
    const accuracy = 4;
    const data = {};

    // within a parent node create an element whose name and attributes are as specified
    function dumpdata() {
        for (const node of data.nodes) {
            console.log(`D lon=${node.lat.toFixed(accuracy)} lat=${node.lon.toFixed(accuracy)} ${node.title}`);
        }
    }

    function normalise() {
        const xt = {
            lat: {
                max: -360,
                min: 360,
                diff: 0,
            },
            lon: {
                max: -360,
                min: 360,
                diff: 0,
            },
        };

        if (debug) {
            dumpdata();
        }

        // first. find the max and min lat and long
        for (const node of data.nodes) {
            xt.lat.max = Math.max(xt.lat.max, node.lat);
            xt.lat.min = Math.min(xt.lat.min, node.lat);
            xt.lon.max = Math.max(xt.lon.max, node.lon);
            xt.lon.min = Math.min(xt.lon.min, node.lon);
        }

        if (debug) {
            console.log("Extents:", JSON.stringify(xt, null, 4));
        }

        xt.lat.diff = xt.lat.max - xt.lat.min;
        xt.lon.diff = xt.lon.max - xt.lon.min;
        xt.divideByMe = Math.max(xt.lat.diff, xt.lon.diff);

        for (const node of data.nodes) {
            // add the absolute min lat & lon to
            // everything so all numbers are above zero
            node.lat = node.lat - xt.lat.min;
            node.lon = node.lon - xt.lon.min;

            // divide each lat and long by the offset max
            // so they are all unit vectors and suntract 0.5 from
            // each so they are origined around 0,0
            node.lat = node.lat / xt.divideByMe;
            node.lon = node.lon / xt.divideByMe;
        }
        if (debug) {
            console.log("Extents:", JSON.stringify(xt, null, 4));
        }
        xt.lat.divided = xt.lat.diff / xt.divideByMe;
        xt.lon.divided = xt.lon.diff / xt.divideByMe;


        // UNSHIFT;
        for (const node of data.nodes) {
            node.lat = node.lat + xt.lat.divided - 1.5;
            node.lon = node.lon + xt.lon.divided - 1.5;
        }
        if (debug) {
            dumpdata();
        }
    }

    function prepRealNodes() {
        const findNode = function(id, nodes) {
            return nodes.find((e) => e.id == id);
        };

        for (let route of data.routes) {
            route.n = [];
            for (const name of route.nodes) {
                const found = findNode(name, data.nodes);
                if (!found) {
                    console.error(`Route ${route.title} references node "${name}" which does not exist.`);
                } else {
                    route.n.push(found);
                }
            }
            if (debug) {
                console.log("Route nodes found:", route.n);
            }
        }
    }

    function prep() {
        // load all data files
        const load = {
            nodes: fetch("data/nodes.json"),
            routes: fetch("data/routes.json"),
            triggers: fetch("data/triggers.json"),
        };

        const ready = {};

        // parse loaded nodes and assign to data.nodes
        ready.nodes = load.nodes
            .then((r) => r.json())
            .then((o) => data.nodes = o)
            .then(normalise);

        // parse loaded routes and assign to data.routes
        ready.routes = load.routes // load data
            .then((r) => r.json())
            .then((o) => data.routes = o);

            // parse loaded routes and assign to data.routes
        ready.triggers = load.triggers // load data
            .then((r) => r.json())
            .then((o) => data.triggers = o);


        // when they're all loaded
        const loaded = Promise.all(Object.values(ready));

        loaded.then(() => {
            prepRealNodes();
            const event = new CustomEvent("data_ready", {
                detail: data,
            });
            if (debug) {
                console.log("Dispatching:", event);
            }
            document.dispatchEvent(event);
        });
    }

    window.addEventListener("load", prep);
}());

/**
 * Basic tube map rednering using the SnapSVG library.
 */
(function() {
    "use strict";
    const debug = {
        debug: false,
        nodes: false,
        routes: false
    };
    const divider = 2;
    const width = 800;
    const height = 800;
    const mult = width / divider;
    const unit = Math.min(width, height) / 100;
    const smallUnit = unit / 5;
    const allowedAngles = [ 0, 45, 90, 135, 180, 225, 270, 315 ];

    const art = {
        nodes: {},
        routes: {}
    };

    let drawingWaypoints = true;
    let paper = null;


    /**
     * @param {object} node is a node
     * @return {string} the node's coordinates prepped for the screen
     */
    function asCoord(node) {
        if (debug.debug) {
            console.log("coord from", node);
        }
        return `${mult + node.lon * mult} ${height - (mult + node.lat * mult)}`;
    }


    /**
     * @param {object} svg the target element.
     * @param {object} data the data to use.
     */
    function drawRoutes(svg, data) {
        for (const route of data.routes) {
            // construct the path
            let pathStub = `M ${asCoord(route.n[0])} R`;

            for (let i = 1; i < route.n.length; i++) {
                const a = route.n[i];
                pathStub = `${pathStub} ${ asCoord(a)}`;
            }

            if (!art.routes[route.id]) {
                if (debug.routes) {
                    console.log(`Creating route ${route.id} to ${pathStub}`);
                }
                art.routes[route.id] = svg.path(pathStub).attr({
                    "id": `route${route.id}`,
                    "class": `route ${route.id}`,
                    "stroke": `${route.color}`,
                    "stroke-width": `${Number(unit)}`
                });
            } else {
                if (debug.routes) {
                    console.log(`Updating route ${route.id} to ${pathStub}`);
                }
                art.routes[route.id].attr("path", pathStub);
            }
        }
    }

    /* // this works...
    var paper = new Raphael(
    document.getElementById('oTestCanvas'),
    400,400);

    var x = paper.path('M 10 10 R 110 10 110 110 10 110 10 10')
    x.attr({"stroke-width":1,stroke:'#cc0000'});
    x.attr("path", 'M 10 20 R 110 10 110 110 10 110 10 10');
    x.attr("path", 'M 10 30 R 110 10 110 110 10 110 10 10');
    */

    /**
     * @param {object} svg the target element.
     * @param {object} data the data to use.
     */
    function drawNodes(svg, data) {
        if (debug.nodes) {
            console.log(">", data.nodes);
        }

        for (const node of data.nodes) {
            if (debug.nodes) {
                console.log(node);
            }

            const x = mult + node.lon * mult;
            const y = height - (mult + node.lat * mult);

            if (debug.nodes) {
                console.log("node at", x, y);
            }

            let station = art.nodes[node.id];

            if (!station) {
                // create & store so it's not remade next time
                station = paper.g();
                art.nodes[node.id] = station;


                let circle = svg.circle(0, 0, `${unit}`);
                station.add(circle);
                circle.attr({
                    "class": `station ${node.waypoint ? "waypoint" : ""}`,
                    "stroke-width": `${smallUnit}`
                });

                let box = circle.getBBox();

                let stationTitle = svg.text(0, 0, node.title);
                station.add(stationTitle);
                stationTitle.attr({
                    "font-size": `${unit * 2}`,
                    "text-anchor": node.hint > 2 ? "end" : "start",
                    "class": `label ${node.waypoint ? "waypoint" : ""}`
                });

                node.hint = node.hint || 1;
                let textPos = {
                    vert: node.hint % 2 ? -box.height : box.height,
                    horiz: node.hint > 2 ? -box.width : box.width
                };

                stationTitle.transform(`t${textPos.horiz},${textPos.vert}`);
            }
            station.transform(`t${x},${y}`);
        }
    }

    /**
     * @param {object} event object in which data
     *                 is transferred as part of
     *                 the details attribute.
     */
    function drawtube(event) {
        const data = event.detail;
        if (debug.debug) {
            console.log("Drawing", event);
        }

        paper = new Snap("#tubesvg");
        paper.attr({ viewBox: `0 0 ${width} ${height}` });

        // // Setting preserveAspectRatio to 'none' lets you stretch the SVG
        // paper.canvas.setAttribute('preserveAspectRatio', 'none');
        //
        drawRoutes(paper, data);
        drawNodes(paper, data);
    }

    /**
     * @param {object} event object in which data
     *                 is transferred as part of
     *                 the details attribute.
     */
    function redrawtube(event) {
        const data = event.detail;
        drawRoutes(paper, data);
        drawNodes(paper, data);
    }

    /**
     * Show or hide waypoints.
     */
    function toggle_waypoint_visibility() {
        let waypoints = document.querySelectorAll(".waypoint");
        for (let wp of waypoints) {
            wp.classList.toggle("exposed");
        }
    }

    document.addEventListener("toggle_waypoint_visibility", toggle_waypoint_visibility);
    document.addEventListener("data_ready", drawtube);
    document.addEventListener("redrawtubemap", redrawtube);
}());

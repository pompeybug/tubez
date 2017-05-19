(function() {
    "use strict";
    const debug = {
        debug: false,
        nodes: false,
        routes: true
    };
    const divider = 2;
    const width = 3200;
    const height = 3200;
    const mult = width / divider;
    const unit = Math.min(width, height) / 100;
    const smallUnit = unit / 5;

    const art = {
        nodes: {},
        routes: {}
    };

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

            if (node.waypoint) {
                continue;
            }

            const x = mult + node.lon * mult;
            const y = height - (mult + node.lat * mult);

            if (debug.nodes) {
                console.log("node at", x, y);
            }

            let st = art.nodes[node.id];

            if (!st) {
                    // create
                st = paper.set();
                let c = svg.circle(0, 0, `${unit}`)
                        .attr({
                            "class": "station",
                            "stroke-width": `${smallUnit}`
                        });
                st.push(c);

                let b = c._getBBox();

                let t = svg.text(0, 0, node.title);
                let textPos = {
                    v: 0,
                    h: 0
                };

                art.nodes[node.id] = st;

                node.hint = node.hint || 1;

                t.attr({
                    "font-size": `${unit}em`,
                    "text-anchor": node.hint > 2 ? "end" : "start",
                    "class": "label"
                });
                t.attr({
                    "font-size": unit
                });

                textPos.v = node.hint % 2 ? -b.height : b.height;
                textPos.h = node.hint > 2 ? -b.width : b.width;

                t.translate(textPos.h, textPos.v);
                st.push(t);
            }
            st.transform(`t${x},${y}`);
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

        paper = Raphael("tube", width, height);

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

    document.addEventListener("tubemapdataready", drawtube);
    document.addEventListener("redrawtubemap", redrawtube);
}());

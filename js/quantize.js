(function() {
    "use strict";
    const minimumDistance = 0.1;
    const maximumDistanceBetweenRouteNodes = minimumDistance * 3;
    const nudge = minimumDistance / 1000;
    let routeStretching = false;
    let nodeExplosion = false;
    let sliceAndShift = false;
    let average = 0;

    let data = [];

    let centrePoint = {
        lat: 0,
        long: 0
    };

    let drawing = true;

    /**
     * A segment is condifered to be part of a route.
     * Its name is generated using the alphabetically sorted names of Its
     * start and end points.  Given two end node names, this function returns
     * the name a segment between those nodes should have.
     * @param {string} a node name
     * @param {string} b node name
     * @returns {string} the segment name
     */
    function segmentName(a, b) {
        console.log("segment name", a, b, a.title, b.title);
        return a.title < b.title ? a.title + b.title : b.title + a.title;
    }


    /**
     * @param {Array} nodes is an array of all nodes
     * @returns {Object} an object that contains a latitude
     * and longitude attribute (lat & long) reporesenting
     * the geographical centr point of all the nodes.
     */
    function findCentrePoint(nodes) {
        let result = {
            lat: 0,
            long: 0
        };
        for (const node of nodes) {
            result.lat = result.lat + node.lat;
            result.lon = result.lon + node.lon;
        }
        result.lat = result.lat / nodes.length;
        result.lon = result.lon / nodes.length;
        return result;
    }


    /**
     * Uses Pythagoras' Theorum to calulate how far apart two nodes are.
     * @param {string} nodeA node name
     * @param {string} nodeB node name
     * @returns {number} the distance between two nodes
     */
    function distanceBetween(nodeA, nodeB) {
        let opposite = nodeA.lon - nodeB.lon;
        let ajdacent = nodeA.lat - nodeB.lat;
        let hypotenuse = Math.sqrt(opposite * opposite + ajdacent * ajdacent);
        return hypotenuse;
    }


    function nudgeGroup(group, nudgeLat, nudgeLon) {
        for (const node of group) {
            node.lat = node.lat + nudgeLat;
            node.lon = node.lon + nudgeLon;
        }
    }

    function nudgeNode(node, nudgeLat, nudgeLon) {
        node.lat = node.lat + nudgeLat;
        node.lon = node.lon + nudgeLon;
    }


    function findAverageRouteLength(routes) {
        let total = 0;
        let count = 0;
        for (const route of routes) {
            for (let i = 0; i < route.n.length - 1; i++) {
                total = total + distanceBetween(route.n[i], route.n[i + 1]);
                count++;
            }
        }

        return total / count;
    }



    /**
     * any route with below average spacing between nodes, adjust
     */
    function explodeCloseNodes() {
        let nudgeLat = 0;
        let nudgeLon = 0;
        let alterMe = null,
            nearer = null;

        centrePoint = findCentrePoint(data.nodes);

        for (let a of data.nodes) {
            for (let b of data.nodes) {
                if (a === b) {
                    continue;
                }
                let hca = distanceBetween(centrePoint, a);
                let hcb = distanceBetween(centrePoint, a);

                if (hca < hcb) {
                    alterMe = b;
                    nearer = a;
                } else {
                    alterMe = a;
                    nearer = b;
                }
                nudgeLat = alterMe.lat > nearer.lat ? nudge : -nudge;
                nudgeLon = alterMe.lon > nearer.lon ? nudge : -nudge;

                let dist = Math.abs(distanceBetween(b, a));

                if (dist < minimumDistance) {
                    nudgeNode(a, nudgeLat, nudgeLon);
                    nudgeNode(b, -nudgeLat, -nudgeLon);
                }

                if (dist > maximumDistanceBetweenRouteNodes) {
                    nudgeNode(a, -nudgeLat, -nudgeLon);
                    nudgeNode(b, nudgeLat, nudgeLon);
                }
            }
        }
    }



    /**
     * any route with below average spacing between nodes, adjust
     */
    function stretchRoutesWhereNodesAreClose() {
        let nudgeLat = 0;
        let nudgeLon = 0;
        for (const route of data.routes) {
            nudgeLat = (route.n[0].lat - route.n[route.n.length - 1].lat) / 1000;
            nudgeLon = (route.n[0].lon - route.n[route.n.length - 1].lon) / 1000;

            for (let i = 0; i < route.n.length - 1; i++) {
                let nodesBefore = [];
                let nodesAfter = [];


                for (let j = 0; j < route.n.length; j++) {
                    if (j < i) {
                        nodesBefore.push(route.n[j]);
                    }
                    if (j > i) {
                        nodesAfter.push(route.n[j]);
                    }
                }

                let a = route.n[i];
                let b = route.n[i + 1];

                nudgeLat = a.lat > b.lat ? nudgeLat : -nudgeLat;
                nudgeLon = a.lon > b.lon ? nudgeLon : -nudgeLon;

                let dist = Math.abs(distanceBetween(b, a));

                if (dist < minimumDistance) {
                    nudgeGroup(nodesBefore, -nudgeLat, -nudgeLon);
                    nudgeGroup(nodesAfter, nudgeLat, -nudgeLon);
                }

                if (dist > maximumDistanceBetweenRouteNodes) {
                    nudgeGroup(nodesBefore, nudgeLat, nudgeLon);
                    nudgeGroup(nodesAfter, -nudgeLat, -nudgeLon);
                }
            }
        }
    }


    /**
     * any route with below average spacing between nodes, adjust
     */
    function sliceAndShiftNodes() {
        let nn = nudge;
        for (let i = 0; i < data.nodes.length; i++) {
            for (let j = 0; j < data.nodes.length; j++) {
                if (i == j) {
                    continue;
                }
                let mainNode = data.nodes[i];
                let comparedNode = data.nodes[j];

                if (Math.abs(distanceBetween(mainNode, comparedNode)) < minimumDistance) {
                    let west = [],
                        east = [],
                        north = [],
                        south = [];
                    for (let checkNode of data.nodes) {
                        (checkNode.lat < mainNode.lat ? west : east).push(checkNode);
                        (checkNode.lon < mainNode.lon ? north : south).push(checkNode);
                    }
                    nudgeGroup(north, 0, -nn);
                    nudgeGroup(south, 0, nn);
                    nudgeGroup(west, -nn, 0);
                    nudgeGroup(south, nn, 0);
                }
            }
        }
    }


    function calcSpacing() {
        if (routeStretching) {
            stretchRoutesWhereNodesAreClose();
        }

        if (nodeExplosion) {
            explodeCloseNodes();
        }

        if (sliceAndShift) {
            sliceAndShiftNodes();
        }

        document.dispatchEvent(
            new CustomEvent("redrawtubemap", {
                detail: data,
            })
        );

        if (drawing) {
            window.requestAnimationFrame(calcSpacing);
        }
    }


    function toggle_quantum_stepping() {
        drawing = !drawing;
        window.requestAnimationFrame(calcSpacing);
    }

    function toggle_route_stretching() {
        routeStretching = !routeStretching;
    }

    function toggle_expanding_single_nodes() {
        nodeExplosion = !nodeExplosion;
    }

    function toggleSlideAndShift() {
        sliceAndShift = !sliceAndShift;
    }

    /**
     * @param {object} event object in which data
     *                 is transferred as part of
     *                 the details attribute.
     */
    function drawtube(event) {
        data = event.detail;
        average = findAverageRouteLength(data.routes);
        centrePoint = findCentrePoint(data.nodes);
        console.log("data is", data);
        drawing = true;
        window.requestAnimationFrame(calcSpacing);
    }

    document.addEventListener("toggle_slice_and_shift", toggleSlideAndShift);
    document.addEventListener("toggle_route_stretching", toggle_route_stretching);
    document.addEventListener("toggle_expanding_single_nodes", toggle_expanding_single_nodes);

    document.addEventListener("toggle_quantum_stepping", toggle_quantum_stepping);

    document.addEventListener("data_ready", drawtube);
}());

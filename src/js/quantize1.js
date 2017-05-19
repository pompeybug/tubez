(function() {
    "use strict";
    const debug = {
        quantising: true
    };
    let data = [];

    document.addEventListener(
        "keydown", (event) => {
            if (debug) {}
            if (event.key === "q") {
                if (debug.quantising) {
                    console.log("Quantising");
                }

                for (const route of data.routes) {
                    for (const node of route.n) {
                        node.lat = node.lat + Math.random(1) / 100;
                        node.lon = node.lon;
                        console.log("NODE", node);
                    }
                }

                document.dispatchEvent(
                    new CustomEvent("redrawtubemap", {
                        detail: data,
                    })
                );
            }
        });


    /**
     * @param {object} event object in which data
     *                 is transferred as part of
     *                 the details attribute.
     */
    function drawtube(event) {
        data = event.detail;
    }

    document.addEventListener("tubemapdataready", drawtube);
}());

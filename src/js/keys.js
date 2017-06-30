/**
 * Keyboard input capabilities.
 *
 * All view/controller interaction is de-coupled through events
 * So any key events are caught and translated into the program specific
 * events that they need to trigger.
 *
 * Adding an association between a key and a capability requires only
 * editing of the triggers array.
 */
(function() {
    "use strict";

    let triggers = [];


    /**
     * When a keydown event is received this checks
     * against the array of trigger keys and fires the
     * associated event.
     * @param {object} event is an keydown event
     */
    function keyHandler(event) {
        for (const trigger of triggers) {
            if (event.key === trigger.key) {
                console.log("Toggling", trigger.event);
                document.dispatchEvent(new CustomEvent(trigger.event));
                return;
            }
        }
        console.log("Unmapped key:", event.key);
    }

    // when data is loaded, modify the triggers array
    document.addEventListener(
        "data_ready",
        (event) => {
            triggers = event.detail.triggers;
        }
    );


    document.addEventListener("keydown", keyHandler);
}());

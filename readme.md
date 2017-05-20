# Tubez

A tube-map diagram generator.  Created as an investigation into the visualisation of Portsmouth's quieter cycle routes project.

A recent snapshot of the work in development can ve seen at https://pompeybug.github.io/tubez/

## Download

To get a local copy:
```shell
git clone https://github.com/pompeybug/tubez.git
```

## Run
If you're using a browser that allows javascript to load `file://` addresses open `src/index.html` in that browser.

To work with browsers that are more strict about security, install and run a small local server thus:
```shell
npm install
npm start
```
... and open [http://127.0.0.1:8080](http://127.0.0.1:8080)


# Architecture

## Software Architecture

### load.js
Data is loaded by `load.js` and when both files are loaded they are assembled into a single object thus`{ nodes: {...}, routes: {...} }` and a `tubemapdataready` event is fired.  The event object's `details` attribute contains all the data.

### draw.raphael.js
Currently rendering is achieved by `draw.raphael.js`

### quantize.js
A workin progress ... pressing `q` moves the nodes to test that modifying data results in a successful update of the diagram.

### your_new_file.js
Additional tools may listen for the `tubedataready` event, mutate the data, and trigger a redraw by dispatching a `redrawtubemap` event with the data to be shown, thus:

```js
document.dispatchEvent(
    new CustomEvent("redrawtubemap", {
        detail: data,
    })
);
```

## Data Architecture
Developers will note that data is organized into two files: `nodes.json` and `routes.json`

### nodes.json

Each object contains an `id` that must be unique, a `title` that can be displayed, `lat`itude and `lon`gitude and a `hint` that directs where to place the `title` when dran.

```
[
  {
    "id": "hard",
    "title": "The Hard",
    "lat": 50.79773,
    "lon": -1.106207,
    "hint": 3
  },
  ...etc
]
```

### routes.json

Each object contains an `id` that must be unique, a `title` that can be displayed, the `color` of the route, and an array of `nodes` through which the route passes.  The nodes are the node `id`s specified in `nodes.json`.

```
{
  "id": "green",
  "title": "Paulsgrove to The Hard",
  "color": "#0fb999",
  "nodes": ["ppark", "marriott", "hilsea", "spindr", "mbtn", "rudmore", "hard"]
},
...etc
]
```

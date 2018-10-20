// custom control
class HomeControl {
    constructor(bounds) {
        this._bounds = bounds;
    }
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        var button = document.createElement('button');
        var icon = document.createElement('i');
        button.className = "mapboxgl-ctrl-icon";
        icon.className = "fas fa-home";
        button.appendChild(icon);
        button.addEventListener('click', () => this._map.fitBounds(this._bounds));
        this._container.appendChild(button);//, () => this._map.fitBounds([[32.958984, -5.353521], [43.50585, 5.615985]]));
        // this._container.appendChild('<i class="fas fa-home"></i>', 'Return Home');//, () => this._map.fitBounds([[32.958984, -5.353521], [43.50585, 5.615985]]));
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

//initialise state variables
var receptionState = {};
receptionState.loaded = false;
receptionState.visible = false;
// initialise map container
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaGciLCJhIjoiTFBBaE1JOCJ9.-BaGpeSYz4yPrpxh1eqT2A';
var bounds = [
    [134.94, -32.40], 
    [135.34, -32.05]
];
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/joshg/cjm0bck9r74ji2rlenm6daoz8',
    center: [135.248, -32.229],
    zoom: 10.0
});
map.fitBounds(bounds);
// var nav = new mapboxgl.NavigationControl();
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
map.addControl(new HomeControl(bounds), 'bottom-left');
// specify sources
map.on('load', function () {
    // add mapillary layer
    map.addLayer({
        "id": "mapillary",
        // type so can use custom symbol
        "type": "circle",
        "source": {
            "type": "vector",
            "tiles": ["https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt"],
            "minzoom": 14,
            "maxzoom": 14
        },
        "source-layer": "mapillary-images",
        "paint": {
            "circle-color": "#34AF6E"
        }
    }, 'hiltaba-accommodation');
    map.setLayoutProperty("mapillary", "visibility", "visible");
    map.setLayoutProperty("reception", "visibility", "visible");
    // add menu functions
    var toggleLayers = {reception, mapillary};
    toggleLayers['hiltaba-accommodation'] = {};
    toggleLayers['hiltaba-walks-drives'] = {};
    toggleLayers.reception.visibility = "visible";
    toggleLayers.mapillary.visibility = "visible";
    toggleLayers['hiltaba-accommodation'].visibility = "visible";
    toggleLayers['hiltaba-walks-drives'].visibility = "visible";

    function updateToggleState() {
        Object.keys(toggleLayers).forEach(function(key) {
            toggleLayers[key].visibility = map.getLayoutProperty(key ,"visibility");
        });
    }

    function applyToggleState() {
        Object.keys(toggleLayers).forEach(function(key) {
            map.setLayoutProperty(key, "visibility", toggleLayers[key].visibility);
        });
    }

    function applyVisibility(visibility){
        layerIds.forEach(function(layerId) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
        });
    }

    function toggleVisibility(layer) {
        if (map.getLayoutProperty(layer, 'visibility') == 'none') {
            map.setLayoutProperty(layer, "visibility", "visible");
        }
        else {
            map.setLayoutProperty(layer, "visibility", "none");
        }
    }

    var layerIds = map.getStyle().layers.map(function(layer) {
        return layer.id;
    });

    // add event listeners to menu
    document.getElementById("satellite").addEventListener("click", function() {
        updateToggleState();
        applyVisibility("none");
        map.setLayoutProperty("mapbox-satellite", 'visibility', 'visible');
        applyToggleState();
    });

    document.getElementById("outdoors").addEventListener("click", function() {
        updateToggleState();
        applyVisibility("visible");
        map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
        applyToggleState();
    });

    document.getElementById("accommodation-toggle").addEventListener("click", function() {
        toggleVisibility("hiltaba-accommodation");
    });

    document.getElementById("walks-drives").addEventListener("click", function() {
        toggleVisibility("hiltaba-walks-drives");
    });

    document.getElementById("reception").addEventListener("click", function() {
        toggleVisibility("reception");
    });

    document.getElementById("mapillary").addEventListener("click", function() {
        toggleVisibility("mapillary");
    });
});

// Change the cursor to a pointer when the mouse is over the accommodation, walks or drives layers.
map.on('mouseenter', 'hiltaba-accommodation', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseenter', 'hiltaba-walks-drives', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseenter', 'mapillary', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'hiltaba-accommodation', function () {
    map.getCanvas().style.cursor = '';
});
map.on('mouseleave', 'hiltaba-walks-drives', function () {
    map.getCanvas().style.cursor = '';
});
map.on('mouseleave', 'mapillary', function () {
    map.getCanvas().style.cursor = '';
});

map.on('click', function(e) {
    // add accommodation popups
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['hiltaba-accommodation', 'hiltaba-walks-drives', 'mapillary']
    });
    if (!features.length){
        return;
    };
    var feature = features[0];
    if (feature.layer.id == "hiltaba-walks-drives"){
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML((feature.properties.image ? '<img src="' + feature.properties.image + '" style="width: 100%;">' : '') + '<div class="p-2">' + '<h6>' + feature.properties.name + '</h6>' + '<p>' + feature.properties.description + '</div>')
            .addTo(map);
    }
    else if (feature.layer.id == "hiltaba-accommodation"){
        var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML((feature.properties.image ? '<img src="' + feature.properties.image + '" style="width: 100%;">' : '') + '<div class="p-2">' + '<h6>' + feature.properties.name + '</h6>' + '<p>' + feature.properties.description + '<br>' + feature.properties.price + '</p></div>')
            .addTo(map);

    }
    else if (feature.layer.id == "mapillary") {
        var coordinates = feature.geometry.coordinates.slice();
        var imagekey = feature.properties.key;
        var popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<div id="' + imagekey + '" style="width: 640px; height: 480px;"></div>')
            // .setHTML('<div id="' + imagekey + '" style="z-index: 1"></div>')
            .addTo(map);
        mapview = new Mapillary.Viewer(
            imagekey,
            'VlY1Y1BMVEttZmpBd0hManFIcnVKdzo1MDdjZGExZDMyMTE2MDdi',
            imagekey,
            {
                component: {
                    cover: false
                }
            }
        );
        mapview.on(Mapillary.Viewer.nodechanged, function (node) {
            var lnglat = [node.latLon.lon, node.latLon.lat];
            popup.setLngLat(lnglat);
        });
    }
});

$('#jackaroo_cottage').on('click', function() {
    map.flyTo({
        center: [135.071,-32.157],
        zoom: 17
    });
});

$('#shearers_quarters').on('click', function() {
    map.flyTo({
        center: [135.0925,-32.1605],
        zoom: 17
    });
});

$('#shearers_quarters_campground').on('click', function() {
    map.flyTo({
        center: [135.0926,-32.1608],
        zoom: 17
    });
});

$('#pretty_point_campground').on('click', function() {
    map.flyTo({
        center: [135.149,-32.173],
        zoom: 17
    });
});

$('#map-menu-toggle').on('click', function() {
    if (document.getElementById("controlsContainer").hidden) {
        document.getElementById("main-map-menu").style.width = "300px";
        document.getElementById("map-menu-toggle-icon").style.transform = "rotateZ(180deg)";
        setTimeout(function() {
            document.getElementById("controlsContainer").hidden = false;
        }, 300)
    }
    else {
        document.getElementById("controlsContainer").hidden = true;
        document.getElementById("main-map-menu").style.width = "30px";
        document.getElementById("map-menu-toggle-icon").style.transform = "rotateZ(0deg)";
    }
});

/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("menuShow").hidden = true;
    document.getElementById("main-map-menu").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("main-map-menu").style.width = "0";
    //document.getElementById("menuShow").hidden = false;
}

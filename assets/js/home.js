
        //initialise state variables
        var receptionState = {};
        receptionState.loaded = false;
        receptionState.visible = false;
        // initialise map container
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zaGciLCJhIjoiTFBBaE1JOCJ9.-BaGpeSYz4yPrpxh1eqT2A';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/joshg/cjm0bck9r74ji2rlenm6daoz8',
            center: [135.248, -32.229],
            zoom: 10.0
        });
        // var nav = new mapboxgl.NavigationControl();
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
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
            });
            map.setLayoutProperty("mapillary", "visibility", "visible");
            map.setLayoutProperty("reception", "visibility", "visible");
            // add menu functions
            var toggleLayers = {reception, mapillary};
            toggleLayers.reception.visibility = "visible";
            toggleLayers.mapillary.visibility = "visible";

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

            document.getElementById("reception").addEventListener("click", function() {
                // applyVisibility("visible");
                toggleVisibility("reception");
            });

            document.getElementById("mapillary").addEventListener("click", function() {
                // applyVisibility("visible");
                toggleVisibility("mapillary");
            });
        });
        // from mapbox examples
        // When a click event occurs on a feature in the mapillary layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', function(e) {
            // add accomodation popups
            var features = map.queryRenderedFeatures(e.point, {
                layers: ['hiltaba-accommodation']
            });
            if (!features.length){
                return;
            };
            var feature = features[0];
            var popup = new mapboxgl.Popup({ offset: [0, -15] })
                .setLngLat(feature.geometry.coordinates)
                .setHTML('<img src="' + feature.properties.image + '" style="width: 100%;">' + '<div class="p-2">' + '<h6>' + feature.properties.name + '</h6>' + '<p>' + feature.properties.description + '<br>' + feature.properties.price + '</p></div>')
                .addTo(map);
        });
        map.on('click', 'mapillary', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            console.log(e.features[0]);
            var imagekey = e.features[0].properties.key;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            // new mapboxgl.Popup()
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
                console.log(lnglat);
            });
        });
        /* Set the width of the side navigation to 250px */
        function openNav() {
            document.getElementById("menuShow").hidden = true;
            document.getElementById("mainMapMenu").style.width = "250px";
        }

        /* Set the width of the side navigation to 0 */
        function closeNav() {
            document.getElementById("mainMapMenu").style.width = "0";
            //document.getElementById("menuShow").hidden = false;
        }

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
